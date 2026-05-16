// AppReviewPrompt.tsx
import React, { useCallback, useEffect } from "react";
import { Platform, Linking } from "react-native";
import * as StoreReview from "expo-store-review";
import { useAppReviewStore } from "../../stores/useAppReviewStore";
const AppReviewPrompt: React.FC = () => {
  const { installDate, setInstallDate, setHasRated, isEligibleForReview } =
    useAppReviewStore();

  // On first app load, set the install date if not set yet.
  useEffect(() => {
    if (!installDate) {
      setInstallDate(Date.now());
    }
  }, [installDate, setInstallDate]);

  // Function to trigger the review prompt
  const triggerReviewPrompt = useCallback(async () => {
    if (isEligibleForReview()) {
      if (await StoreReview.isAvailableAsync()) {
        try {
          await StoreReview.requestReview();
          setHasRated(true);
        } catch (error) {
          console.error("Error requesting in-app review:", error);
        }
      } else {
        const storeURL =
          Platform.OS === "ios"
            ? "https://apps.apple.com/de/app/islam-fragen/id6737857116"
            : "https://play.google.com/store/apps/details?id=com.bufib.islamFragen&pcampaignid=web_share";

        try {
          await Linking.openURL(storeURL);
          setHasRated(true);
        } catch (error) {
          console.error("Error opening store URL:", error);
        }
      }
    }
  }, [isEligibleForReview, setHasRated]);

  // Instead of triggering immediately, wait (for example, 30 seconds) before checking.
  useEffect(() => {
    const delayInMs = 10000; // Delay of 10 seconds
    const timer = setTimeout(() => {
      triggerReviewPrompt();
    }, delayInMs);

    return () => clearTimeout(timer);
  }, [isEligibleForReview, setHasRated, triggerReviewPrompt]);

  return null; // No UI is rendered by this component
};

export default AppReviewPrompt;
