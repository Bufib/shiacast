// import { create } from "zustand";

// export type Dataset = "paypal" | "podcast";

// interface DataVersionStore {
//   // per-dataset data ticks
//   paypalVersion: number;
//   podcastVersion: number;

//   // per-dataset favorites ticks
//   paypalFavoritesVersion: number;
//   podcastFavoritesVersion: number;

//   // per-dataset data updaters
//   incrementPaypalVersion: () => void;
//   incrementPodcastVersion: () => void;

//   // per-dataset favorites updaters
//   incrementPaypalFavoritesVersion: () => void;
//   incrementPodcastFavoritesVersion: () => void;

//   // per-dataset data resets
//   resetPaypalVersion: () => void;
//   resetPodcastVersion: () => void;

//   // per-dataset favorites resets
//   resetPaypalFavoritesVersion: () => void;
//   resetPodcastFavoritesVersion: () => void;

//   // all reset
//   resetAllVersions: () => void;
// }

// export const useDataVersionStore = create<DataVersionStore>((set) => ({
//   // Data versions
//   paypalVersion: 0,
//   podcastVersion: 0,

//   // Favorites versions
//   paypalFavoritesVersion: 0,
//   podcastFavoritesVersion: 0,

//   // Data incrementers
//   incrementPaypalVersion: () =>
//     set((state) => ({
//       paypalVersion: state.paypalVersion + 1,
//     })),

//   incrementPodcastVersion: () =>
//     set((state) => ({
//       podcastVersion: state.podcastVersion + 1,
//     })),

//   // Favorites incrementers
//   incrementPaypalFavoritesVersion: () =>
//     set((state) => ({
//       paypalFavoritesVersion: state.paypalFavoritesVersion + 1,
//     })),

//   incrementPodcastFavoritesVersion: () =>
//     set((state) => ({
//       podcastFavoritesVersion: state.podcastFavoritesVersion + 1,
//     })),

//   // Data resets
//   resetPaypalVersion: () =>
//     set({
//       paypalVersion: 0,
//     }),

//   resetPodcastVersion: () =>
//     set({
//       podcastVersion: 0,
//     }),

//   // Favorites resets
//   resetPaypalFavoritesVersion: () =>
//     set({
//       paypalFavoritesVersion: 0,
//     }),

//   resetPodcastFavoritesVersion: () =>
//     set({
//       podcastFavoritesVersion: 0,
//     }),

//   // Reset all
//   resetAllVersions: () =>
//     set({
//       paypalVersion: 0,
//       podcastVersion: 0,
//       paypalFavoritesVersion: 0,
//       podcastFavoritesVersion: 0,
//     }),
// }));

import { create } from "zustand";

export type Dataset = "podcast";

interface DataVersionStore {
  // per-dataset data ticks
  podcastVersion: number;

  // per-dataset favorites ticks
  podcastFavoritesVersion: number;

  // per-dataset data updaters
  incrementPodcastVersion: () => void;

  // per-dataset favorites updaters
  incrementPodcastFavoritesVersion: () => void;

  // per-dataset data resets
  resetPodcastVersion: () => void;

  // per-dataset favorites resets
  resetPodcastFavoritesVersion: () => void;

  // all reset
  resetAllVersions: () => void;
}

export const useDataVersionStore = create<DataVersionStore>((set) => ({
  // Data versions
  podcastVersion: 0,

  // Favorites versions
  podcastFavoritesVersion: 0,

  // Data incrementers
  incrementPodcastVersion: () =>
    set((state) => ({
      podcastVersion: state.podcastVersion + 1,
    })),

  // Favorites incrementers
  incrementPodcastFavoritesVersion: () =>
    set((state) => ({
      podcastFavoritesVersion: state.podcastFavoritesVersion + 1,
    })),

  // Data resets
  resetPodcastVersion: () =>
    set({
      podcastVersion: 0,
    }),

  // Favorites resets
  resetPodcastFavoritesVersion: () =>
    set({
      podcastFavoritesVersion: 0,
    }),

  // Reset all
  resetAllVersions: () =>
    set({
      podcastVersion: 0,
      podcastFavoritesVersion: 0,
    }),
}));
