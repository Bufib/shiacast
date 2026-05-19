import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface AppReviewState {
  installDate: number | null;
  hasRated: boolean;
  remindLaterDate: number | null;
  setInstallDate: (date: number) => void;
  setHasRated: (rated: boolean) => void;
  setRemindLaterDate: (date: number) => void;
  isEligibleForReview: () => boolean;
}

export const useAppReviewStore = create<AppReviewState>()(
  persist(
    (set, get) => ({
      installDate: null,
      hasRated: false,
      remindLaterDate: null,
      setInstallDate: (date: number) => set({ installDate: date }),
      setHasRated: (rated: boolean) => set({ hasRated: rated }),
      setRemindLaterDate: (date: number) => set({ remindLaterDate: date }),
      isEligibleForReview: () => {
        const { installDate, hasRated, remindLaterDate } = get();
        if (hasRated) return false;

        const now = Date.now();
        const daysSinceInstall = installDate
          ? (now - installDate) / (1000 * 60 * 60 * 24)
          : 0;
        const thresholdDays = 3;
        if (remindLaterDate && now < remindLaterDate) return false;

        return daysSinceInstall >= thresholdDays;
      },
    }),
    {
      name: "app-review-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export default useAppReviewStore;
