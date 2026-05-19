

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
