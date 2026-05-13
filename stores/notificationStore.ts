// stores/notificationStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Alert, Linking, Platform } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { t } from "i18next";

type NotificationState = {
  getNotifications: boolean;
  permissionStatus: Notifications.PermissionStatus | "undetermined";
  checkPermissions: () => Promise<void>;
  toggleGetNotifications: () => Promise<void>;
};

const showPermissionAlert = () => {
  Alert.alert(
    t("pushNotificationsDisabledTitle"),
    t("pushNotificationsDisabledMessage"),
    [
      { text: t("cancel"), style: "cancel" },
      { text: t("openSettings"), onPress: () => Linking.openSettings() },
    ]
  );
};

const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      // Default off on iOS (must explicitly opt in), on on Android
      getNotifications: Platform.OS === "ios" ? false : true,
      permissionStatus: "undetermined",

      // Check and sync store with OS permission status
      checkPermissions: async () => {
        try {
          const { status } = await Notifications.getPermissionsAsync();
          const previousStatus = get().permissionStatus;

          set({ permissionStatus: status });

          // Auto-enable in-app notifications if user just granted OS permission
          if (
            status === "granted" &&
            previousStatus !== "granted" &&
            !get().getNotifications
          ) {
            set({ getNotifications: true });
          }
        } catch (error) {
          console.error("Error checking notification permissions:", error);
        }
      },

      // Flip opt-in flag (usePushNotifications will handle token insert/delete)
      toggleGetNotifications: async () => {
        const currentlyOn = get().getNotifications;
        const currentPermission = get().permissionStatus;

        try {
          // If turning ON, ensure we have permission
          if (!currentlyOn) {
            if (currentPermission === "undetermined") {
              const { status } = await Notifications.requestPermissionsAsync();
              set({ permissionStatus: status });

              if (status !== "granted") {
                showPermissionAlert();
                return;
              }
            } else if (currentPermission !== "granted") {
              showPermissionAlert();
              return;
            }
          }

          // Flip the flag
          set({ getNotifications: !currentlyOn });
        } catch (error) {
          console.error("Error toggling notifications:", error);
          Alert.alert(
            t("noInternetConnectionTitle"),
            t("noInternetConnectionMessage"),
            [{ text: t("ok") }]
          );
        }
      },
    }),
    {
      name: "notification-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useNotificationStore;
