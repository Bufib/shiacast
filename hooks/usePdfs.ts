

// hooks/usePdfs.ts
import { PdfType } from "@/constants/Types";
import { supabase } from "../utils/supabase";
import {
  InfiniteData,
  QueryKey,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import * as FileSystem from "expo-file-system/legacy";
import { useCallback, useEffect } from "react";

// --- CONFIGURATION ---
const PAGE_SIZE = 10;
const CACHE_MAX_AGE_DAYS = 30; // PDFs can stay longer than audio
const CACHE_MAX_FILES = 15; // Global limit across all languages

// --- STORAGE CONFIG ---
const STORAGE_BUCKET = "pdfs";
const STORAGE_PATH = "pdfs"; // Internal folder in bucket
const USE_SIGNED_URLS = false;

// --- URL HELPERS ---

/**
 * Build the object path inside the bucket.
 * This keeps you safe if one day you accidentally store "pdfs/myfile.pdf"
 * instead of just "myfile.pdf" in the DB.
 */
function buildStoragePath(filename: string): string {
  return filename.includes("/") ? filename : `${STORAGE_PATH}/${filename}`;
}

function publicUrlFor(filename: string): string {
  const path = buildStoragePath(filename);
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function signedUrlFor(
  filename: string,
  expiresInSeconds = 60 * 60 * 4
): Promise<string> {
  const path = buildStoragePath(filename);
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data?.signedUrl) {
    throw error ?? new Error("Could not create signed URL");
  }
  return data.signedUrl;
}

async function urlFor(filename: string): Promise<string> {
  return USE_SIGNED_URLS ? signedUrlFor(filename) : publicUrlFor(filename);
}

// Export for external use if needed (e.g. direct streaming in a viewer)
export const remotePdfUrlFor = (filename: string) => publicUrlFor(filename);

// --- CACHE (PER-LANGUAGE) ---

const sanitize = (s: string) => s.replace(/[\\/]/g, "_");
const LANG_DEFAULT = "default";

function getRootCacheDir(): string {
  const base = FileSystem.cacheDirectory ?? FileSystem.documentDirectory ?? "";
  return base.endsWith("/") ? base : base + "/";
}

function getCacheDirectory(language?: string): string {
  const lang = (language || LANG_DEFAULT).toLowerCase();
  return `${getRootCacheDir()}pdfCache/${lang}/`;
}

async function ensureLangDir(language?: string) {
  await FileSystem.makeDirectoryAsync(getCacheDirectory(language), {
    intermediates: true,
  }).catch(() => {});
}

// --- CACHE MANAGEMENT (LANGUAGE-AGNOSTIC) ---

/**
 * Get all cached PDF files across all language directories
 */
async function getAllCachedPdfs(): Promise<
  { uri: string; mtime: number; language: string }[]
> {
  const pdfCacheRoot = `${getRootCacheDir()}pdfCache/`;
  const rootInfo = await FileSystem.getInfoAsync(pdfCacheRoot);

  if (!rootInfo.exists || !rootInfo.isDirectory) {
    return [];
  }

  const allPdfs: { uri: string; mtime: number; language: string }[] = [];

  try {
    const langDirs = await FileSystem.readDirectoryAsync(pdfCacheRoot);

    await Promise.all(
      langDirs.map(async (langDir) => {
        const langPath = pdfCacheRoot + langDir + "/";
        const langInfo = await FileSystem.getInfoAsync(langPath);

        if (!langInfo.exists || !langInfo.isDirectory) return;

        try {
          const files = await FileSystem.readDirectoryAsync(langPath);
          const pdfFiles = files.filter((name) =>
            name.toLowerCase().endsWith(".pdf")
          );

          await Promise.all(
            pdfFiles.map(async (name) => {
              const fileUri = langPath + name;
              try {
                const info = await FileSystem.getInfoAsync(fileUri);
                if (info.exists && !info.isDirectory && info.modificationTime) {
                  allPdfs.push({
                    uri: fileUri,
                    mtime: info.modificationTime * 1000,
                    language: langDir,
                  });
                }
              } catch {
                // ignore file errors
              }
            })
          );
        } catch {
          // ignore directory read errors
        }
      })
    );
  } catch (err) {
    console.warn(`[PDF cache scan error]`, err);
  }

  return allPdfs;
}

/**
 * Language-agnostic cache cleanup.
 * Deletes old PDFs and enforces the global file limit across all languages.
 */
let isCleaningGlobalCache = false;

export async function cleanupPdfCache(): Promise<void> {
  if (isCleaningGlobalCache) {
    return;
  }
  isCleaningGlobalCache = true;

  try {
    const allPdfs = await getAllCachedPdfs();

    if (allPdfs.length === 0) {
      return;
    }

    const cutoff = Date.now() - CACHE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

    // Delete old files
    const oldFiles = allPdfs.filter((f) => f.mtime < cutoff);
    if (oldFiles.length > 0) {
      console.log(`[PDF] Cleaning ${oldFiles.length} old PDFs`);
      await Promise.all(
        oldFiles.map((f) => FileSystem.deleteAsync(f.uri, { idempotent: true }))
      );
    }

    // Enforce maximum file count globally
    const stillValid = allPdfs.filter((f) => f.mtime >= cutoff);
    const excessCount = stillValid.length - CACHE_MAX_FILES;

    if (excessCount > 0) {
      console.log(`[PDF] Removing ${excessCount} excess PDFs (over limit)`);
      const sortedByOldest = stillValid.sort((a, b) => a.mtime - b.mtime);
      const toDelete = sortedByOldest.slice(0, excessCount);
      await Promise.all(
        toDelete.map((f) => FileSystem.deleteAsync(f.uri, { idempotent: true }))
      );
    }
  } catch (err) {
    console.warn(`[PDF cache cleanup error]`, err);
  } finally {
    isCleaningGlobalCache = false;
  }
}

/**
 * Check if there's enough space in the cache for a new download.
 * Returns true if space is available, false otherwise.
 */
async function hasSpaceForDownload(): Promise<boolean> {
  try {
    const allPdfs = await getAllCachedPdfs();
    const cutoff = Date.now() - CACHE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
    const validPdfs = allPdfs.filter((f) => f.mtime >= cutoff);

    // If we're at or over the limit, trigger cleanup and check again
    if (validPdfs.length >= CACHE_MAX_FILES) {
      console.log(
        `[PDF] Cache full (${validPdfs.length}/${CACHE_MAX_FILES}), cleaning up...`
      );
      await cleanupPdfCache();

      // Re-check after cleanup
      const pdfsAfterCleanup = await getAllCachedPdfs();
      const validAfterCleanup = pdfsAfterCleanup.filter(
        (f) => f.mtime >= cutoff
      );
      return validAfterCleanup.length < CACHE_MAX_FILES;
    }

    return true;
  } catch (err) {
    console.warn(`[PDF] Error checking cache space:`, err);
    // On error, assume we have space and let the download attempt proceed
    return true;
  }
}

/**
 * Deletes ALL cached PDFs across ALL language directories.
 * Used when PDFs are updated or deleted in the database.
 */
export async function clearAllPdfCaches(): Promise<void> {
  try {
    const pdfCacheRoot = `${getRootCacheDir()}pdfCache/`;
    const dirInfo = await FileSystem.getInfoAsync(pdfCacheRoot);

    if (!dirInfo.exists) {
      return;
    }

    // Delete the entire pdfCache directory
    await FileSystem.deleteAsync(pdfCacheRoot, { idempotent: true });
    console.log("[PDF] Cleared all language caches");
  } catch (err) {
    console.warn(`[PDF cache clear error]`, err);
  }
}

/**
 * Downloads a PDF from Supabase Storage into the language-scoped cache folder.
 */
async function downloadToCache(
  filename: string,
  language?: string,
  onProgress?: (fraction: number) => void
): Promise<string> {
  if (!filename) {
    throw new Error("downloadToCache requires a non-empty filename.");
  }

  await ensureLangDir(language);
  const cacheDir = getCacheDirectory(language);
  const localUri = cacheDir + sanitize(filename);

  // Return if already cached
  const info = await FileSystem.getInfoAsync(localUri).catch(() => null);
  if (info?.exists) return localUri;

  // Check if there's space before downloading
  const hasSpace = await hasSpaceForDownload();
  if (!hasSpace) {
    throw new Error(
      "Cache is full and unable to free space. Please delete some downloaded PDFs."
    );
  }

  const downloadUrl = await urlFor(filename);

  // Retry logic for downloads
  let lastError: any = null;
  for (let attempt = 0; attempt < 2; attempt++) {
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
      const result = await task.downloadAsync();
      const status = (result as any)?.status ?? 200;

      if (!result?.uri || status < 200 || status >= 300) {
        await FileSystem.deleteAsync(localUri, { idempotent: true }).catch(
          () => {}
        );
        throw new Error(`Download failed (HTTP ${status})`);
      }

      // Trigger cleanup after successful download (non-blocking)
      cleanupPdfCache().catch(console.warn);
      return result.uri;
    } catch (err) {
      lastError = err;
      if (attempt === 0) continue;
      break;
    }
  }

  throw new Error(
    `Failed to download "${filename}": ${lastError?.message || lastError}`
  );
}

// --- HOOK ---

export function usePdfs(language: string) {
  const queryClient = useQueryClient();

  // Ensure language cache directory exists
  useEffect(() => {
    if (!language) return;
    ensureLangDir(language).catch(() => {});
  }, [language]);

  const queryKey: QueryKey = ["pdfs", language];

  const infiniteQuery = useInfiniteQuery<
    PdfType[],
    Error,
    InfiniteData<PdfType[]>,
    QueryKey,
    number
  >({
    queryKey,
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase
        .from("pdfs")
        .select("*")
        .eq("language_code", language)
        .order("created_at", { ascending: false })
        .range(pageParam, pageParam + PAGE_SIZE - 1);

      if (error) {
        console.error("Error fetching PDFs:", error);
        throw error;
      }
      return data ?? [];
    },
    getNextPageParam: (lastPage, allPages) => {
      const fetchedSoFar = allPages.reduce((acc, page) => acc + page.length, 0);
      return lastPage.length === PAGE_SIZE ? fetchedSoFar : undefined;
    },
    initialPageParam: 0,
    enabled: Boolean(language),
    retry: 3,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 7 * 24 * 60 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const downloadMutation = useMutation<
    string,
    Error,
    { filename: string; onProgress?: (frac: number) => void }
  >({
    mutationFn: ({ filename, onProgress }) => {
      if (!filename) throw new Error("download requires a filename");
      return downloadToCache(filename, language, onProgress);
    },
    onMutate: ({ filename }) => {
      queryClient.setQueryData(["pdfDownload", language, filename], {
        status: "loading",
        progress: 0,
      });
    },
    onError: (error, variables) => {
      console.error(`Error downloading ${variables.filename}:`, error);
      queryClient.setQueryData(["pdfDownload", language, variables.filename], {
        status: "error",
        error: error.message,
      });
    },
    onSuccess: (localUri, variables) => {
      queryClient.setQueryData(["pdfDownload", language, variables.filename], {
        status: "done",
        uri: localUri,
      });
    },
  });

  // Stable function for effects/components
  const { mutateAsync: downloadPdf, ...downloadState } = downloadMutation;

  const getCachedUri = useCallback(
    async (filename: string): Promise<string | null> => {
      if (!filename) return null;
      const localUri = getCacheDirectory(language) + sanitize(filename);
      const info = await FileSystem.getInfoAsync(localUri);
      return info.exists ? localUri : null;
    },
    [language]
  );

  const deleteCached = useCallback(
    async (filename: string): Promise<void> => {
      if (!filename) return;
      const localUri = getCacheDirectory(language) + sanitize(filename);
      await FileSystem.deleteAsync(localUri, { idempotent: true }).catch(
        () => {}
      );
      queryClient.setQueryData(["pdfDownload", language, filename], null);
    },
    [language, queryClient]
  );

  return {
    ...infiniteQuery,
    // stable download function for your useEffect
    downloadPdf,
    // optional: state of the mutation if you need it
    downloadState,
    getCachedUri,
    deleteCached,
  };
}
