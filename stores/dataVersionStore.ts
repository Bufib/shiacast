import { create } from "zustand";

export type Dataset = "video";

interface DataVersionStore {
  videoVersion: number;
  videoFavoritesVersion: number;

  incrementVideoVersion: () => void;
  incrementVideoFavoritesVersion: () => void;

  resetVideoVersion: () => void;
  resetVideoFavoritesVersion: () => void;

  resetAllVersions: () => void;
}

export const useDataVersionStore = create<DataVersionStore>((set) => ({
  videoVersion: 0,
  videoFavoritesVersion: 0,

  incrementVideoVersion: () =>
    set((state) => ({ videoVersion: state.videoVersion + 1 })),

  incrementVideoFavoritesVersion: () =>
    set((state) => ({ videoFavoritesVersion: state.videoFavoritesVersion + 1 })),

  resetVideoVersion: () => set({ videoVersion: 0 }),
  resetVideoFavoritesVersion: () => set({ videoFavoritesVersion: 0 }),

  resetAllVersions: () => set({ videoVersion: 0, videoFavoritesVersion: 0 }),
}));
