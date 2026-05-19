import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface FontSizeState {
  fontSize: number;
  setFontSize: (size: number) => void;
}

export const useFontSizeStore = create<FontSizeState>()(
  persist(
    (set) => ({
      fontSize: 18,
      setFontSize: (size: number) => set({ fontSize: size }),
    }),
    {
      name: "font-settings",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ fontSize: state.fontSize }),
    },
  ),
);
