import * as FileSystem from "expo-file-system/legacy";
import { cleanAudioPath, getPublicAudioUrl } from "./podcastStorage";

const CACHE_MAX_AGE_DAYS = 7;
const CACHE_MAX_FILES = 20;
const LANG_DEFAULT = "default";

let currentDownloadTask: FileSystem.DownloadResumable | null = null;
let currentDownloadPath: string | null = null;
let downloadWasCancelled = false;

const cleaningLanguages = new Set<string>();

const AUDIO_EXTENSIONS = [".mp3", ".m4a", ".aac"];

function sanitize(filename: string): string {
  return filename.replace(/[\\/]/g, "_");
}

function normalizeLanguage(language?: string): string {
  return (language || LANG_DEFAULT).toLowerCase();
}

function getRootCacheDir(): string {
  const base = FileSystem.cacheDirectory ?? FileSystem.documentDirectory ?? "";
  return base.endsWith("/") ? base : `${base}/`;
}

export function getPodcastCacheDirectory(language?: string): string {
  const lang = normalizeLanguage(language);
  return `${getRootCacheDir()}audioCache/${lang}/`;
}

export function getPodcastLocalUri(
  filename: string,
  language?: string,
): string {
  return (
    getPodcastCacheDirectory(language) + sanitize(cleanAudioPath(filename))
  );
}

export async function ensurePodcastCacheDir(language?: string): Promise<void> {
  await FileSystem.makeDirectoryAsync(getPodcastCacheDirectory(language), {
    intermediates: true,
  }).catch(() => {});
}

export async function cleanupPodcastCache(language?: string): Promise<void> {
  const lang = normalizeLanguage(language);

  if (cleaningLanguages.has(lang)) return;

  cleaningLanguages.add(lang);

  try {
    const dirUri = getPodcastCacheDirectory(lang);
    const dirInfo = await FileSystem.getInfoAsync(dirUri);

    if (!dirInfo.exists || !dirInfo.isDirectory) return;

    const allNames = await FileSystem.readDirectoryAsync(dirUri);

    const audioFileNames = allNames.filter((name) =>
      AUDIO_EXTENSIONS.some((ext) => name.toLowerCase().endsWith(ext)),
    );

    const infos: { uri: string; mtime: number }[] = [];

    await Promise.all(
      audioFileNames.map(async (name) => {
        const fileUri = dirUri + name;

        try {
          const info = await FileSystem.getInfoAsync(fileUri);

          if (info.exists && !info.isDirectory && info.modificationTime) {
            infos.push({
              uri: fileUri,
              mtime: info.modificationTime * 1000,
            });
          }
        } catch {
          // ignore broken file info
        }
      }),
    );

    const cutoff = Date.now() - CACHE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

    const oldFiles = infos.filter((file) => file.mtime < cutoff);

    await Promise.all(
      oldFiles.map((file) =>
        FileSystem.deleteAsync(file.uri, { idempotent: true }),
      ),
    );

    const stillValid = infos.filter((file) => file.mtime >= cutoff);

    if (stillValid.length > CACHE_MAX_FILES) {
      const sortedByNewest = stillValid.sort((a, b) => b.mtime - a.mtime);
      const toDelete = sortedByNewest.slice(CACHE_MAX_FILES);

      await Promise.all(
        toDelete.map((file) =>
          FileSystem.deleteAsync(file.uri, { idempotent: true }),
        ),
      );
    }
  } catch (error) {
    console.warn("[cleanupPodcastCache error]", error);
  } finally {
    cleaningLanguages.delete(lang);
  }
}

export async function deletePodcastFromCache(
  filename: string,
  language?: string,
): Promise<boolean> {
  if (!filename) return false;

  const localUri = getPodcastLocalUri(filename, language);

  try {
    const info = await FileSystem.getInfoAsync(localUri);

    if (!info.exists) return false;

    await FileSystem.deleteAsync(localUri, { idempotent: true });

    return true;
  } catch (error) {
    console.warn("[deletePodcastFromCache error]", error);
    return false;
  }
}

export async function cancelCurrentPodcastDownload(): Promise<void> {
  downloadWasCancelled = true;

  if (currentDownloadTask) {
    await currentDownloadTask.cancelAsync().catch(() => {});
    currentDownloadTask = null;
  }

  if (currentDownloadPath) {
    await FileSystem.deleteAsync(currentDownloadPath, {
      idempotent: true,
    }).catch(() => {});

    currentDownloadPath = null;
  }
}

function createCancelledError(): Error {
  const error = new Error("Download cancelled");
  error.name = "CancelledError";
  return error;
}

export async function downloadPodcastToCache(
  filename: string,
  language?: string,
  onProgress?: (fraction: number) => void,
): Promise<string> {
  if (!filename) {
    throw new Error("downloadPodcastToCache requires a non-empty filename.");
  }

  downloadWasCancelled = false;

  await ensurePodcastCacheDir(language);

  const localUri = getPodcastLocalUri(filename, language);

  const existingInfo = await FileSystem.getInfoAsync(localUri).catch(() => null);

  if (existingInfo?.exists) {
    return localUri;
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    if (downloadWasCancelled) {
      downloadWasCancelled = false;
      throw createCancelledError();
    }

    try {
      const downloadUrl =  getPublicAudioUrl(filename);

      const task = FileSystem.createDownloadResumable(
        downloadUrl,
        localUri,
        {},
        ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
          if (onProgress && totalBytesExpectedToWrite > 0) {
            onProgress(totalBytesWritten / totalBytesExpectedToWrite);
          }
        },
      );

      currentDownloadTask = task;
      currentDownloadPath = localUri;

      const result = await task.downloadAsync();

      currentDownloadTask = null;
      currentDownloadPath = null;

      if (downloadWasCancelled) {
        downloadWasCancelled = false;

        await FileSystem.deleteAsync(localUri, {
          idempotent: true,
        }).catch(() => {});

        throw createCancelledError();
      }

      const status = (result as { status?: number })?.status ?? 200;

      if (!result?.uri || status < 200 || status >= 300) {
        await FileSystem.deleteAsync(localUri, {
          idempotent: true,
        }).catch(() => {});

        throw new Error(`Download failed with HTTP status ${status}.`);
      }

      cleanupPodcastCache(language).catch(console.warn);

      return result.uri;
    } catch (error) {
      currentDownloadTask = null;
      currentDownloadPath = null;

      if (
        error instanceof Error &&
        (error.name === "CancelledError" || downloadWasCancelled)
      ) {
        downloadWasCancelled = false;

        await FileSystem.deleteAsync(localUri, {
          idempotent: true,
        }).catch(() => {});

        throw createCancelledError();
      }

      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === 0) continue;
    }
  }

  throw new Error(
    `Failed to download "${filename}": ${lastError?.message || lastError}`,
  );
}