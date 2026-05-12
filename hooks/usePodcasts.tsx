

import { PodcastType } from "@/constants/Types";
import { supabase } from "../utils/supabase";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import * as FileSystem from "../node_modules/expo-file-system/build/legacy";
import { useCallback, useEffect } from "react";

// --- CONFIGURATION ---
const PAGE_SIZE = 3;
const CACHE_MAX_AGE_DAYS = 7;
const CACHE_MAX_FILES = 20;

// --- STORAGE CONFIG ---
const STORAGE_BUCKET = "podcasts";
const USE_SIGNED_URLS = false;

// --- URL HELPERS ---
function publicUrlFor(filename: string): string {
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

type DownloadVariables = {
  filename: string;
  onProgress?: (frac: number) => void;
};

// Track current download for cancellation
let currentDownloadTask: FileSystem.DownloadResumable | null = null;
let currentDownloadPath: string | null = null;
let downloadWasCancelled = false;

export const cancelCurrentDownload = async () => {
  downloadWasCancelled = true;
  if (currentDownloadTask) {
    await currentDownloadTask.cancelAsync();
    currentDownloadTask = null;
  }
  if (currentDownloadPath) {
    await FileSystem.deleteAsync(currentDownloadPath, {
      idempotent: true,
    }).catch(() => {});
    currentDownloadPath = null;
  }
};

// Delete a specific file from cache
export const deleteFromCache = async (
  filename: string,
  language?: string
): Promise<boolean> => {
  if (!filename) return false;

  const lang = (language || LANG_DEFAULT).toLowerCase();
  const cacheDir = getCacheDirectory(lang);
  const localUri = cacheDir + sanitize(filename);

  try {
    const info = await FileSystem.getInfoAsync(localUri);
    if (info.exists) {
      await FileSystem.deleteAsync(localUri, { idempotent: true });
      return true;
    }
    return false;
  } catch (err) {
    console.warn(`[deleteFromCache error]`, err);
    return false;
  }
};
async function signedUrlFor(filename: string, expiresInSeconds = 60 * 60 * 4) {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(filename, expiresInSeconds);
  if (error || !data?.signedUrl)
    throw error ?? new Error("Could not create signed URL");
  return data.signedUrl;
}

async function urlFor(filename: string): Promise<string> {
  return USE_SIGNED_URLS ? signedUrlFor(filename) : publicUrlFor(filename);
}

// For streaming (PUBLIC bucket)
export const remoteUrlFor = (filename: string) => publicUrlFor(filename);

// --- CACHE (PER-LANGUAGE) ---

const sanitize = (s: string) => s.replace(/[\\/]/g, "_");
const LANG_DEFAULT = "default";

const cleaningLanguages = new Set<string>();

function getRootCacheDir(): string {
  const base = FileSystem.cacheDirectory ?? FileSystem.documentDirectory ?? "";
  return base.endsWith("/") ? base : base + "/";
}

function getCacheDirectory(language?: string): string {
  const lang = (language || LANG_DEFAULT).toLowerCase();
  return `${getRootCacheDir()}audioCache/${lang}/`;
}

async function ensureLangDir(language?: string) {
  await FileSystem.makeDirectoryAsync(getCacheDirectory(language), {
    intermediates: true,
  }).catch(() => {});
}

export async function cleanupCache(language?: string): Promise<void> {
  const lang = (language || LANG_DEFAULT).toLowerCase();
  if (cleaningLanguages.has(lang)) {
    return;
  }
  cleaningLanguages.add(lang);

  try {
    const dirUri = getCacheDirectory(lang);
    const dirInfo = await FileSystem.getInfoAsync(dirUri);
    if (!dirInfo.exists || !dirInfo.isDirectory) {
      return;
    }

    const allNames = await FileSystem.readDirectoryAsync(dirUri);
    const audioExtensions = [".mp3", ".m4a", ".aac"];
    const audioFileNames = allNames.filter((name) =>
      audioExtensions.some((ext) => name.toLowerCase().endsWith(ext))
    );

    const infos: { uri: string; mtime: number }[] = [];
    await Promise.all(
      audioFileNames.map(async (name) => {
        const fileUri = dirUri + name;
        try {
          const info = await FileSystem.getInfoAsync(fileUri);
          if (info.exists && !info.isDirectory && info.modificationTime) {
            infos.push({ uri: fileUri, mtime: info.modificationTime * 1000 });
          }
        } catch {
          // ignore
        }
      })
    );

    const cutoff = Date.now() - CACHE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

    const oldFiles = infos.filter((f) => f.mtime < cutoff);
    if (oldFiles.length > 0) {
      await Promise.all(
        oldFiles.map((f) => FileSystem.deleteAsync(f.uri, { idempotent: true }))
      );
    }

    const stillValid = infos.filter((f) => f.mtime >= cutoff);
    const excessCount = stillValid.length - CACHE_MAX_FILES;
    if (excessCount > 0) {
      const sortedByNewest = stillValid.sort((a, b) => b.mtime - a.mtime);
      const toDelete = sortedByNewest.slice(CACHE_MAX_FILES);
      await Promise.all(
        toDelete.map((f) => FileSystem.deleteAsync(f.uri, { idempotent: true }))
      );
    }
  } catch (err) {
    console.warn(`[cache cleanup error]`, err);
  } finally {
    cleaningLanguages.delete(lang);
  }
}

async function downloadToCache(
  filename: string,
  language?: string,
  onProgress?: (fraction: number) => void
): Promise<string> {
  if (!filename)
    throw new Error("downloadToCache requires a non-empty filename.");

  downloadWasCancelled = false;

  await ensureLangDir(language);
  const cacheDir = getCacheDirectory(language);
  const localUri = cacheDir + sanitize(filename);

  const info = await FileSystem.getInfoAsync(localUri).catch(() => null);
  if (info?.exists) return localUri;

  const downloadUrl = await urlFor(filename);

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    if (downloadWasCancelled) {
      downloadWasCancelled = false;
      const err = new Error("Download cancelled");
      err.name = "CancelledError";
      throw err;
    }

    try {
      const task = FileSystem.createDownloadResumable(
        downloadUrl,
        localUri,
        {},
        ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
          if (onProgress && totalBytesExpectedToWrite > 0) {
            onProgress(totalBytesWritten / totalBytesExpectedToWrite);
          }
        }
      );

      currentDownloadTask = task;
      currentDownloadPath = localUri;

      const result = await task.downloadAsync();

      currentDownloadTask = null;
      currentDownloadPath = null;

      if (downloadWasCancelled) {
        downloadWasCancelled = false;
        await FileSystem.deleteAsync(localUri, { idempotent: true }).catch(
          () => {}
        );
        const err = new Error("Download cancelled");
        err.name = "CancelledError";
        throw err;
      }

      const status = (result as { status?: number })?.status ?? 200;
      if (!result?.uri || status < 200 || status >= 300) {
        await FileSystem.deleteAsync(localUri, { idempotent: true }).catch(
          () => {}
        );
        throw new Error(`Download failed (HTTP ${status})`);
      }
      cleanupCache(language).catch(console.warn);
      return result.uri;
    } catch (err) {
      if (
        err instanceof Error &&
        (err.name === "CancelledError" || downloadWasCancelled)
      ) {
        downloadWasCancelled = false;
        currentDownloadTask = null;
        currentDownloadPath = null;
        await FileSystem.deleteAsync(localUri, { idempotent: true }).catch(
          () => {}
        );
        const cancelErr = new Error("Download cancelled");
        cancelErr.name = "CancelledError";
        throw cancelErr;
      }
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt === 0) continue;
      break;
    }
  }
  throw new Error(
    `Failed to download "${filename}": ${lastError?.message || lastError}`
  );
}

// --- HOOK ---

export function usePodcasts(language: string) {
  const qc = useQueryClient();

  useEffect(() => {
    ensureLangDir(language).catch(() => {});
  }, [language]);

  const infiniteQuery = useInfiniteQuery({
    queryKey: ["podcasts", language] as const,
    queryFn: async ({ pageParam }) => {
      const { data, error } = await supabase
        .from("podcasts")
        .select("*")
        .eq("language_code", language)
        .order("created_at", { ascending: false })
        .range(pageParam, pageParam + PAGE_SIZE - 1);

      if (error) {
        console.error("Error fetching podcasts:", error);
        throw error;
      }
      return (data ?? []) as PodcastType[];
    },
    getNextPageParam: (lastPage: PodcastType[], allPages: PodcastType[][]) => {
      const fetchedSoFar = allPages.reduce((acc, page) => acc + page.length, 0);
      return lastPage.length === PAGE_SIZE ? fetchedSoFar : undefined;
    },
    initialPageParam: 0,
    enabled: Boolean(language),
    retry: 3,
    staleTime: 12 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const download = useMutation<string, Error, DownloadVariables>({
    mutationFn: ({
      filename,
      onProgress,
    }: {
      filename: string;
      onProgress?: (frac: number) => void;
    }) => {
      if (!filename) throw new Error("download requires a filename");
      return downloadToCache(filename, language, onProgress);
    },
    onMutate: ({ filename }: { filename: string }) => {
      qc.setQueryData(["download", language, filename], {
        status: "loading",
        progress: 0,
      });
    },
    onError: (error: Error, variables: { filename: string }) => {
      if (error.name !== "CancelledError") {
        console.error(`Error downloading ${variables.filename}:`, error);
      }
      qc.setQueryData(["download", language, variables.filename], {
        status: error.name === "CancelledError" ? "cancelled" : "error",
        error: error.message,
      });
    },
    onSuccess: (localUri: string, variables: { filename: string }) => {
      qc.setQueryData(["download", language, variables.filename], {
        status: "done",
        uri: localUri,
      });
    },
  });

  const getCachedUri = useCallback(
    async (filename: string): Promise<string | null> => {
      if (!filename) return null;
      const localUri = getCacheDirectory(language) + sanitize(filename);
      const info = await FileSystem.getInfoAsync(localUri);
      return info.exists ? localUri : null;
    },
    [language]
  );

  return {
    ...infiniteQuery,
    download,
    getCachedUri,
  };
}
