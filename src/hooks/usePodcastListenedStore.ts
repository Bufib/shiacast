// stores/usePodcastListenedStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type PodcastId = string | number;

type ListenedEntry = {
  listenedAt: number; // epoch ms
};

type ListenedState = {
  // Key: `${lang}:${id}` falls du sprachgetrennt brauchst, sonst nur `${id}`
  entries: Record<string, ListenedEntry>;

  markAsListened: (id: PodcastId, lang?: string) => void;
  unmarkAsListened: (id: PodcastId, lang?: string) => void;
  toggleListened: (id: PodcastId, lang?: string) => void;
  isListened: (id: PodcastId, lang?: string) => boolean;
  getListenedAt: (id: PodcastId, lang?: string) => number | null;
  clearAll: () => void;
};

const makeKey = (id: PodcastId, lang?: string) =>
  lang ? `${lang}:${id}` : String(id);

export const usePodcastListenedStore = create<ListenedState>()(
  persist(
    (set, get) => ({
      entries: {},

      markAsListened: (id, lang) => {
        const key = makeKey(id, lang);
        set((state) => ({
          entries: { ...state.entries, [key]: { listenedAt: Date.now() } },
        }));
      },

      unmarkAsListened: (id, lang) => {
        const key = makeKey(id, lang);
        set((state) => {
          const { [key]: _removed, ...rest } = state.entries;
          return { entries: rest };
        });
      },

      toggleListened: (id, lang) => {
        const key = makeKey(id, lang);
        if (get().entries[key]) {
          get().unmarkAsListened(id, lang);
        } else {
          get().markAsListened(id, lang);
        }
      },

      isListened: (id, lang) => !!get().entries[makeKey(id, lang)],

      getListenedAt: (id, lang) =>
        get().entries[makeKey(id, lang)]?.listenedAt ?? null,

      clearAll: () => set({ entries: {} }),
    }),
    {
      name: "podcast-listened",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);

// Reaktive Selector-Hooks (das ist wichtig, damit dein UI re-rendert!)
export function useIsPodcastListened(
  id: PodcastId | undefined,
  lang?: string,
) {
  return usePodcastListenedStore((state) =>
    id != null ? !!state.entries[makeKey(id, lang)] : false,
  );
}

export function usePodcastListenedAt(
  id: PodcastId | undefined,
  lang?: string,
) {
  return usePodcastListenedStore((state) =>
    id != null ? (state.entries[makeKey(id, lang)]?.listenedAt ?? null) : null,
  );
}