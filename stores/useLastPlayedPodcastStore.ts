import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { PodcastType } from "@/constants/Types";

type LastPlayedEntry = {
  podcast: PodcastType;
  lastPlayedAt: number;
  dismissed: boolean;
};

type LastPlayedState = {
  entry: LastPlayedEntry | null;
  setLastPlayed: (podcast: PodcastType) => void;
  dismiss: () => void;
  clear: () => void;
};

export const useLastPlayedPodcastStore = create<LastPlayedState>()(
  persist(
    (set, get) => ({
      entry: null,

      setLastPlayed: (podcast) => {
        const current = get().entry;

        // Bei gleichem Podcast: dismissed-Status erhalten.
        // Bei neuem Podcast: dismissed zurücksetzen, damit Card wieder erscheint.
        const dismissed =
          current?.podcast?.id === podcast.id ? current.dismissed : false;

        set({
          entry: {
            podcast,
            lastPlayedAt: Date.now(),
            dismissed,
          },
        });
      },

      dismiss: () => {
        set((state) =>
          state.entry
            ? { entry: { ...state.entry, dismissed: true } }
            : state,
        );
      },

      clear: () => set({ entry: null }),
    }),
    {
      name: "last-played-podcast",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);

export const useLastPlayedPodcast = () =>
  useLastPlayedPodcastStore((state) => state.entry);