import React, { useCallback, useEffect } from "react";
import { Platform, Linking } from "react-native";
import * as StoreReview from "expo-store-review";
import { useAppReviewStore } from "../../stores/useAppReviewStore";

const AppReviewPrompt: React.FC = () => {
  const installDate = useAppReviewStore((s) => s.installDate);
  const setInstallDate = useAppReviewStore((s) => s.setInstallDate);
  const setHasRated = useAppReviewStore((s) => s.setHasRated);
  const isEligibleForReview = useAppReviewStore((s) => s.isEligibleForReview);

  useEffect(() => {
    if (!installDate) {
      setInstallDate(Date.now());
    }
  }, [installDate, setInstallDate]);

  const triggerReviewPrompt = useCallback(async () => {
    if (!isEligibleForReview()) return;

    try {
      if (await StoreReview.isAvailableAsync()) {
        await StoreReview.requestReview();
        setHasRated(true);
        return;
      }

      const storeURL =
        Platform.OS === "ios"
          ? "https://apps.apple.com/de/app/islam-fragen/id6737857116"
          : "https://play.google.com/store/apps/details?id=com.bufib.islamFragen&pcampaignid=web_share";

      await Linking.openURL(storeURL);
      setHasRated(true);
    } catch (error) {
      console.error("AppReviewPrompt error:", error);
    }
  }, [isEligibleForReview, setHasRated]);

  useEffect(() => {
    const timer = setTimeout(() => {
      triggerReviewPrompt();
    }, 10_000);

    return () => clearTimeout(timer);
  }, [triggerReviewPrompt]);

  return null;
};

export default AppReviewPrompt;
