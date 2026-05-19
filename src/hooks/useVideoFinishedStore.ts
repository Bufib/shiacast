import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type VideoId = string | number;

type FinishedEntry = {
  finishedAt: number;
};

type FinishedState = {
  entries: Record<string, FinishedEntry>;
  markAsFinished: (id: VideoId, lang?: string) => void;
  unmarkAsFinished: (id: VideoId, lang?: string) => void;
  toggleFinished: (id: VideoId, lang?: string) => void;
  isFinished: (id: VideoId, lang?: string) => boolean;
  getFinishedAt: (id: VideoId, lang?: string) => number | null;
  clearAll: () => void;
};

const makeKey = (id: VideoId, lang?: string) =>
  lang ? `${lang}:${id}` : String(id);

export const useVideoFinishedStore = create<FinishedState>()(
  persist(
    (set, get) => ({
      entries: {},

      markAsFinished: (id, lang) => {
        const key = makeKey(id, lang);
        set((state) => ({
          entries: { ...state.entries, [key]: { finishedAt: Date.now() } },
        }));
      },

      unmarkAsFinished: (id, lang) => {
        const key = makeKey(id, lang);
        set((state) => {
          const { [key]: _removed, ...rest } = state.entries;
          return { entries: rest };
        });
      },

      toggleFinished: (id, lang) => {
        const key = makeKey(id, lang);
        if (get().entries[key]) {
          get().unmarkAsFinished(id, lang);
        } else {
          get().markAsFinished(id, lang);
        }
      },

      isFinished: (id, lang) => !!get().entries[makeKey(id, lang)],

      getFinishedAt: (id, lang) =>
        get().entries[makeKey(id, lang)]?.finishedAt ?? null,

      clearAll: () => set({ entries: {} }),
    }),
    {
      name: "video-finished",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);

export function useIsVideoFinished(id: VideoId | undefined, lang?: string) {
  return useVideoFinishedStore((state) =>
    id != null ? !!state.entries[makeKey(id, lang)] : false,
  );
}

export function useVideoFinishedAt(id: VideoId | undefined, lang?: string) {
  return useVideoFinishedStore((state) =>
    id != null ? (state.entries[makeKey(id, lang)]?.finishedAt ?? null) : null,
  );
}
