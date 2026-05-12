import { useCallback, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as FileSystem from "expo-file-system/legacy";

import {
  cancelCurrentPodcastDownload,
  deletePodcastFromCache,
  downloadPodcastToCache,
  ensurePodcastCacheDir,
  getPodcastLocalUri,
} from "../utils/podcastCache";
import { getPodcastAudioUrl, getSignedImageUrl } from "../utils/podcastStorage";

type DownloadVariables = {
  filename: string;
  onProgress?: (fraction: number) => void;
};

export type DownloadState =
  | {
      status: "idle";
    }
  | {
      status: "loading";
      progress: number;
    }
  | {
      status: "done";
      uri: string;
    }
  | {
      status: "error";
      error: string;
    }
  | {
      status: "cancelled";
      error?: string;
    };

export function usePodcastDownloads(language: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!language) return;

    ensurePodcastCacheDir(language).catch(() => {});
  }, [language]);

  const download = useMutation<string, Error, DownloadVariables>({
    mutationFn: ({ filename, onProgress }) => {
      if (!filename) {
        throw new Error("download requires a filename.");
      }

      return downloadPodcastToCache(filename, language, onProgress);
    },

    onMutate: ({ filename }) => {
      queryClient.setQueryData<DownloadState>(
        ["download", language, filename],
        {
          status: "loading",
          progress: 0,
        },
      );
    },

    onError: (error, variables) => {
      if (error.name !== "CancelledError") {
        console.error(`Error downloading ${variables.filename}:`, error);
      }

      queryClient.setQueryData<DownloadState>(
        ["download", language, variables.filename],
        {
          status: error.name === "CancelledError" ? "cancelled" : "error",
          error: error.message,
        },
      );
    },

    onSuccess: (localUri, variables) => {
      queryClient.setQueryData<DownloadState>(
        ["download", language, variables.filename],
        {
          status: "done",
          uri: localUri,
        },
      );
    },
  });

  const getCachedUri = useCallback(
    async (filename: string): Promise<string | null> => {
      if (!filename) return null;

      const localUri = getPodcastLocalUri(filename, language);
      const info = await FileSystem.getInfoAsync(localUri);

      return info.exists ? localUri : null;
    },
    [language],
  );

  const getRemoteUrl = useCallback(
    async (filename: string): Promise<string> => {
      return getPodcastAudioUrl(filename);
    },
    [],
  );

  const getRemoteImageUrl = useCallback(
    async (filename: string): Promise<string | null> => {
      return getSignedImageUrl(filename);
    },
    [],
  );

  const deleteFromCache = useCallback(
    async (filename: string): Promise<boolean> => {
      return deletePodcastFromCache(filename, language);
    },
    [language],
  );

  const cancelDownload = useCallback(async (): Promise<void> => {
    await cancelCurrentPodcastDownload();
  }, []);

  return {
    download,
    getCachedUri,
    getRemoteUrl,
    getRemoteImageUrl,
    deleteFromCache,
    cancelDownload,
  };
}
