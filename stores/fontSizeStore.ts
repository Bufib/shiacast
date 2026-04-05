
// import { create } from "zustand";
// import { persist, createJSONStorage } from "zustand/middleware";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const LINE_HEIGHT_MULTIPLIERS = {
//   latin: 2,
//   arabic: 2.5,
//   transliteration: 2,
// } as const;

// const FONT_SIZE_MULTIPLIERS = {
//   latin: 1,
//   arabic: 1.3,
//   transliteration: 1,
// } as const;

// export type TextType = keyof typeof LINE_HEIGHT_MULTIPLIERS;

// interface FontSizeState {
//   fontSize: number;
//   getLineHeight: (type: TextType) => number;
//   getFontSize: (type: TextType) => number;
//   setFontSize: (size: number) => void;
// }

// export const useFontSizeStore = create<FontSizeState>()(
//   persist(
//     (set, get) => ({
//       fontSize: 18,
//       getLineHeight: (type: TextType) => {
//         return Math.round(get().fontSize * LINE_HEIGHT_MULTIPLIERS[type]);
//       },
//       getFontSize: (type: TextType) => {
//         return Math.round(get().fontSize * FONT_SIZE_MULTIPLIERS[type]);
//       },
//       setFontSize: (size: number) => set({ fontSize: size }),
//     }),
//     {
//       name: "font-settings",
//       storage: createJSONStorage(() => AsyncStorage),
//       partialize: (state) => ({ fontSize: state.fontSize }),
//     },
//   ),
// );


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