import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const clampOffset = (value: number) => Math.max(-3, Math.min(3, value));

type CalendarSettingsState = {
  arabicDateOffset: number;
  setArabicDateOffset: (value: number) => void;
  incrementArabicDateOffset: () => void;
  decrementArabicDateOffset: () => void;
  resetArabicDateOffset: () => void;
};

export const useCalendarSettingsStore = create<CalendarSettingsState>()(
  persist(
    (set) => ({
      arabicDateOffset: 0,

      setArabicDateOffset: (value) =>
        set({ arabicDateOffset: clampOffset(value) }),

      incrementArabicDateOffset: () =>
        set((state) => ({
          arabicDateOffset: clampOffset(state.arabicDateOffset + 1),
        })),

      decrementArabicDateOffset: () =>
        set((state) => ({
          arabicDateOffset: clampOffset(state.arabicDateOffset - 1),
        })),

      resetArabicDateOffset: () => set({ arabicDateOffset: 0 }),
    }),
    {
      name: "calendar-settings",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);