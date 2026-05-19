// hooks/useVideoWatchedStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type VideoId = string | number;

type WatchedEntry = {
  watchedAt: number;
};

type WatchedState = {
  entries: Record<string, WatchedEntry>;

  markAsWatched: (id: VideoId, lang?: string) => void;
  unmarkAsWatched: (id: VideoId, lang?: string) => void;
  toggleWatched: (id: VideoId, lang?: string) => void;
  isWatched: (id: VideoId, lang?: string) => boolean;
  getWatchedAt: (id: VideoId, lang?: string) => number | null;
  clearAll: () => void;
};

const makeKey = (id: VideoId, lang?: string) =>
  lang ? `${lang}:${id}` : String(id);

export const useVideoWatchedStore = create<WatchedState>()(
  persist(
    (set, get) => ({
      entries: {},

      markAsWatched: (id, lang) => {
        const key = makeKey(id, lang);
        set((state) => ({
          entries: { ...state.entries, [key]: { watchedAt: Date.now() } },
        }));
      },

      unmarkAsWatched: (id, lang) => {
        const key = makeKey(id, lang);
        set((state) => {
          const { [key]: _removed, ...rest } = state.entries;
          return { entries: rest };
        });
      },

      toggleWatched: (id, lang) => {
        const key = makeKey(id, lang);
        if (get().entries[key]) {
          get().unmarkAsWatched(id, lang);
        } else {
          get().markAsWatched(id, lang);
        }
      },

      isWatched: (id, lang) => !!get().entries[makeKey(id, lang)],

      getWatchedAt: (id, lang) =>
        get().entries[makeKey(id, lang)]?.watchedAt ?? null,

      clearAll: () => set({ entries: {} }),
    }),
    {
      name: "video-watched",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);

export function useIsVideoWatched(id: VideoId | undefined, lang?: string) {
  return useVideoWatchedStore((state) =>
    id != null ? !!state.entries[makeKey(id, lang)] : false,
  );
}

export function useVideoWatchedAt(id: VideoId | undefined, lang?: string) {
  return useVideoWatchedStore((state) =>
    id != null ? (state.entries[makeKey(id, lang)]?.watchedAt ?? null) : null,
  );
}
