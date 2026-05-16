// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { create } from "zustand";
// import { persist, createJSONStorage } from "zustand/middleware";
// import type { PodcastType } from "@/constants/Types";

// type LastPlayedEntry = {
//   podcast: PodcastType;
//   lastPlayedAt: number;
//   dismissed: boolean;
// };

// type LastPlayedState = {
//   entry: LastPlayedEntry | null;
//   setLastPlayed: (podcast: PodcastType) => void;
//   dismiss: () => void;
//   clear: () => void;
//   undismiss: () => void
// };

// export const useLastPlayedPodcastStore = create<LastPlayedState>()(
//   persist(
//     (set, get) => ({
//       entry: null,

//       setLastPlayed: (podcast) => {
//         set({
//           entry: {
//             podcast,
//             lastPlayedAt: Date.now(),
//             dismissed: false,
//           },
//         });
//       },

//       dismiss: () => {
//         set((state) =>
//           state.entry ? { entry: { ...state.entry, dismissed: true } } : state,
//         );
//       },
//       undismiss: () => {
//         set((state) =>
//           state.entry ? { entry: { ...state.entry, dismissed: false } } : state,
//         );
//       },
//       clear: () => set({ entry: null }),
//     }),
//     {
//       name: "last-played-podcast",
//       storage: createJSONStorage(() => AsyncStorage),
//       version: 1,
//     },
//   ),
// );

// export const useLastPlayedPodcast = () =>
//   useLastPlayedPodcastStore((state) => state.entry);

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
  undismiss: () => void;
  clearStorage: () => Promise<void>;
};

export const useLastPlayedPodcastStore = create<LastPlayedState>()(
  persist(
    (set, get) => ({
      entry: null,
      setLastPlayed: (podcast) => {
        set({
          entry: {
            podcast,
            lastPlayedAt: Date.now(),
            dismissed: false,
          },
        });
      },
      dismiss: () => {
        set((state) =>
          state.entry ? { entry: { ...state.entry, dismissed: true } } : state,
        );
      },
      undismiss: () => {
        set((state) =>
          state.entry ? { entry: { ...state.entry, dismissed: false } } : state,
        );
      },
      clear: () => set({ entry: null }),

      // Resets state AND removes the key from AsyncStorage
      clearStorage: async () => {
        set({ entry: null });
        await useLastPlayedPodcastStore.persist.clearStorage();
      },
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
