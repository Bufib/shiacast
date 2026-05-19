import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type PodcastId = string | number;

type FinishedEntry = {
  finishedAt: number;
};

type FinishedState = {
  entries: Record<string, FinishedEntry>;
  markAsFinished: (id: PodcastId, lang?: string) => void;
  unmarkAsFinished: (id: PodcastId, lang?: string) => void;
  toggleFinished: (id: PodcastId, lang?: string) => void;
  isFinished: (id: PodcastId, lang?: string) => boolean;
  getFinishedAt: (id: PodcastId, lang?: string) => number | null;
  clearAll: () => void;
};

const makeKey = (id: PodcastId, lang?: string) =>
  lang ? `${lang}:${id}` : String(id);

export const usePodcastFinishedStore = create<FinishedState>()(
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
      name: "podcast-finished",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);

export function useIsPodcastFinished(
  id: PodcastId | undefined,
  lang?: string,
) {
  return usePodcastFinishedStore((state) =>
    id != null ? !!state.entries[makeKey(id, lang)] : false,
  );
}

export function usePodcastFinishedAt(
  id: PodcastId | undefined,
  lang?: string,
) {
  return usePodcastFinishedStore((state) =>
    id != null ? (state.entries[makeKey(id, lang)]?.finishedAt ?? null) : null,
  );
}
