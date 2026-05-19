import React, { useCallback, useState, useRef, useEffect } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { LoadingIndicator } from "./LoadingIndicator";
import Toast from "react-native-toast-message";

async function clearAppCache(): Promise<void> {
  if (Platform.OS === "web") return;

  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) return;
  const items = await FileSystem.readDirectoryAsync(cacheDir);
  await Promise.all(
    items.map((name) =>
      FileSystem.deleteAsync(cacheDir + name, { idempotent: true }),
    ),
  );
}

const ClearAppCacheButton: React.FC = () => {
  const { t } = useTranslation();
  const [isClearing, setIsClearing] = useState(false);
  const isMountedRef = useRef(false);
  const queryClient = useQueryClient();

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

              await clearAppCache();

              queryClient.clear();

              if (isMountedRef.current) {
                Toast.show({
                  text1: t("successTitle"),
                  text2: t("clearAppCacheSuccessMessage"),
                });
              }
            } catch (error: any) {
              if (isMountedRef.current) {
                Alert.alert(t("errorTitle"), error.message);
              }
            } finally {
              if (isMountedRef.current) {
                setIsClearing(false);
              }
            }
          },
        },
      ],
    );
  }, [t, queryClient]);

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
