import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type VideoFavoriteFolder = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
};

export type VideoFavoriteEntry = {
  videoId: number;
  folderIds: string[];
  createdAt: string;
};

type State = {
  folders: VideoFavoriteFolder[];
  favorites: VideoFavoriteEntry[];

  addFolder: (name: string, color: string) => VideoFavoriteFolder;
  removeFolder: (folderId: string) => void;

  setVideoFolders: (videoId: number, folderIds: string[]) => void;

  isVideoFavorited: (videoId: number) => boolean;
  getVideoFolderIds: (videoId: number) => string[];
  getVideoIdsInFolder: (folderId: string) => number[];
  getAllFavoritedVideoIds: () => number[];
};

export const useVideoFavoriteFoldersStore = create<State>()(
  persist(
    (set, get) => ({
      folders: [],
      favorites: [],

      addFolder: (name, color) => {
        const folder: VideoFavoriteFolder = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name,
          color,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ folders: [...state.folders, folder] }));
        return folder;
      },

      removeFolder: (folderId) => {
        set((state) => ({
          folders: state.folders.filter((f) => f.id !== folderId),
          favorites: state.favorites
            .map((fav) => ({
              ...fav,
              folderIds: fav.folderIds.filter((id) => id !== folderId),
            }))
            .filter((fav) => fav.folderIds.length > 0),
        }));
      },

      setVideoFolders: (videoId, folderIds) => {
        set((state) => {
          if (folderIds.length === 0) {
            return {
              favorites: state.favorites.filter((f) => f.videoId !== videoId),
            };
          }
          const existing = state.favorites.find((f) => f.videoId === videoId);
          if (existing) {
            return {
              favorites: state.favorites.map((f) =>
                f.videoId === videoId ? { ...f, folderIds } : f,
              ),
            };
          }
          return {
            favorites: [
              ...state.favorites,
              { videoId, folderIds, createdAt: new Date().toISOString() },
            ],
          };
        });
      },

      isVideoFavorited: (videoId) =>
        get().favorites.some(
          (f) => f.videoId === videoId && f.folderIds.length > 0,
        ),

      getVideoFolderIds: (videoId) =>
        get().favorites.find((f) => f.videoId === videoId)?.folderIds ?? [],

      getVideoIdsInFolder: (folderId) =>
        get()
          .favorites.filter((f) => f.folderIds.includes(folderId))
          .map((f) => f.videoId),

      getAllFavoritedVideoIds: () =>
        get()
          .favorites.filter((f) => f.folderIds.length > 0)
          .map((f) => f.videoId),
    }),
    {
      name: "video-favorite-folders",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
