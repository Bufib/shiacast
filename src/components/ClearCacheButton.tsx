// import React, { useCallback, useState, useRef, useEffect } from "react";
// import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native";
// import * as FileSystem from "expo-file-system/legacy";
// import { useTranslation } from "react-i18next";
// import { LoadingIndicator } from "./LoadingIndicator";
// import Toast from "react-native-toast-message";

// async function clearAppCache(): Promise<void> {
//   const cacheDir = FileSystem.cacheDirectory;
//   if (!cacheDir) return;

//   const items = await FileSystem.readDirectoryAsync(cacheDir);
//   await Promise.all(
//     items.map((name) =>
//       FileSystem.deleteAsync(cacheDir + name, { idempotent: true })
//     )
//   );
// }

// const ClearAppCacheButton: React.FC = () => {
//   const { t } = useTranslation();
//   const [isClearing, setIsClearing] = useState(false);
//   const isMountedRef = useRef(false);

//   useEffect(() => {
//     isMountedRef.current = true;
//     return () => {
//       isMountedRef.current = false;
//     };
//   }, []);

//   const handlePress = useCallback(() => {
//     Alert.alert(
//       t("clearAppCacheConfirmTitle"),
//       t("clearAppCacheConfirmMessage"),
//       [
//         { text: t("cancel"), style: "cancel" },
//         {
//           text: t("delete"),
//           style: "destructive",
//           onPress: async () => {
//             try {
//               setIsClearing(true);
//               await clearAppCache();

//               if (isMountedRef.current) {
//                 Toast.show({
//                   text1: t("successTitle"),
//                   text2: t("clearAppCacheSuccessMessage"),
//                 });
//               }
//             } catch {
//               if (isMountedRef.current) {
//                 Alert.alert(t("errorTitle"), t("clearAppCacheErrorMessage"));
//               }
//             } finally {
//               if (isMountedRef.current) {
//                 setIsClearing(false);
//               }
//             }
//           },
//         },
//       ]
//     );
//   }, [t]);

//   return (
//     <TouchableOpacity
//       style={[styles.button, isClearing && styles.buttonDisabled]}
//       onPress={handlePress}
//       disabled={isClearing}
//       activeOpacity={0.7}
//     >
//       {isClearing ? (
//         <LoadingIndicator size="large" />
//       ) : (
//         <Text style={styles.label}>{t("clearAppCache")}</Text>
//       )}
//     </TouchableOpacity>
//   );
// };

// const styles = StyleSheet.create({
//   button: {
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     backgroundColor: "#EF4444",
//     alignItems: "center",
//     justifyContent: "center",
//     alignSelf: "flex-start",
//     width: 180,
//   },
//   buttonDisabled: {
//     opacity: 0.6,
//   },
//   label: {
//     color: "#FFFFFF",
//     fontSize: 16,
//     textAlign: "center",
//   },
// });

// export default ClearAppCacheButton;

import React, { useCallback, useState, useRef, useEffect } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LoadingIndicator } from "./LoadingIndicator";
import Toast from "react-native-toast-message";
import { useGlobalPlayer } from "../../player/useGlobalPlayer";
import { usePodcastDownloadStore } from "../../stores/usePodcastDownloadStore";

async function clearAppCache(): Promise<void> {
  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) return;
  const items = await FileSystem.readDirectoryAsync(cacheDir);
  await Promise.all(
    items.map((name) =>
      FileSystem.deleteAsync(cacheDir + name, { idempotent: true })
    )
  );
}

async function clearPodcastAsyncStorage(): Promise<void> {
  const allKeys = await AsyncStorage.getAllKeys();
  const podcastKeys = allKeys.filter((key) => key.startsWith("podcast:"));
  if (podcastKeys.length > 0) {
    await AsyncStorage.multiRemove(podcastKeys);
  }
}

const ClearAppCacheButton: React.FC = () => {
  const { t } = useTranslation();
  const [isClearing, setIsClearing] = useState(false);
  const isMountedRef = useRef(false);
  const queryClient = useQueryClient();
  const { stopAndUnload } = useGlobalPlayer();
  const resetAllDownloads = usePodcastDownloadStore((s) => s.resetAll);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handlePress = useCallback(() => {
    Alert.alert(
      t("clearAppCacheConfirmTitle"),
      t("clearAppCacheConfirmMessage"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("delete"),
          style: "destructive",
          onPress: async () => {
            try {
              setIsClearing(true);

              // 1. Stop and unload the global player
              await stopAndUnload();

              // 2. Clear file system cache
              await clearAppCache();

              // 3. Clear AsyncStorage podcast data
              await clearPodcastAsyncStorage();

              // 4. Reset Zustand download store
              resetAllDownloads?.();

              // 5. Clear React Query cache
              queryClient.removeQueries({ queryKey: ["podcasts"] });
              queryClient.removeQueries({ queryKey: ["download"] });

              if (isMountedRef.current) {
                Toast.show({
                  text1: t("successTitle"),
                  text2: t("clearAppCacheSuccessMessage"),
                });
              }
            } catch {
              if (isMountedRef.current) {
                Alert.alert(t("errorTitle"), t("clearAppCacheErrorMessage"));
              }
            } finally {
              if (isMountedRef.current) {
                setIsClearing(false);
              }
            }
          },
        },
      ]
    );
  }, [t, queryClient, stopAndUnload, resetAllDownloads]);

  return (
    <TouchableOpacity
      style={[styles.button, isClearing && styles.buttonDisabled]}
      onPress={handlePress}
      disabled={isClearing}
      activeOpacity={0.7}
    >
      {isClearing ? (
        <LoadingIndicator size="large" />
      ) : (
        <Text style={styles.label}>{t("clearAppCache")}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    width: 180,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
  },
});

export default ClearAppCacheButton;