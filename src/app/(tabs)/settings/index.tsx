import DeleteUserModal from "@/components/DeleteUserModal";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useLanguage } from "../../../../contexts/LanguageContext";
import { useConnectionStatus } from "../../../../hooks/useConnectionStatus";
import { useAuthStore } from "../../../../stores/authStore";
import useNotificationStore from "../../../../stores/notificationStore";
import handleOpenExternalUrl from "../../../../utils/handleOpenExternalUrl";
import { useLogout } from "../../../../utils/useLogout";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Appearance,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  useColorScheme,
  View,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDataVersionStore } from "../../../../stores/dataVersionStore";
import ClearAppCacheButton from "@/components/ClearCacheButton";
import FeedbackButton from "@/components/FeedbackButton";
import { useScreenFadeIn } from "@/hooks/useScreenFadeIn";

const Settings = () => {
  const colorScheme = useColorScheme() || "light";
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === "dark");
  const clearSession = useAuthStore.getState().clearSession;
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const [payPalLink, setPayPalLink] = useState<string | null>("");
  const [version, setVersion] = useState<string | null>("");
  const [questionCount, setQuestionCount] = useState<number>(0);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);



  const { getNotifications, toggleGetNotifications, permissionStatus } =
    useNotificationStore();
  const { rtl } = useLanguage();
  const hasInternet = useConnectionStatus();
  const logout = useLogout();
  const effectiveEnabled = getNotifications && permissionStatus === "granted";

  const { t } = useTranslation();

  const paypallinkVersion = useDataVersionStore((s) => s.paypalVersion);
  const { fadeAnim, onLayout } = useScreenFadeIn(800);
  const countRef = useRef(0);

  const handleDeleteSuccess = () => {
    clearSession();
    router.replace("./(tabs)/home/");
    Toast.show({
      type: "success",
      text1: t("successDeletion"),
      text1Style: { fontWeight: "500" },
      topOffset: 60,
    });
  };

  useEffect(() => {
    (async () => {
      try {
        const paypal = await AsyncStorage.getItem("paypal");
        setPayPalLink(paypal);
      } catch (error: any) {
        Alert.alert("Fehler", error.message);
      }
    })();
  }, [paypallinkVersion]);

  const toggleDarkMode = async () => {
    const newDarkMode = !isDarkMode;
    await AsyncStorage.setItem("isDarkMode", `${newDarkMode}`);
    setIsDarkMode(newDarkMode);
    Appearance.setColorScheme(newDarkMode ? "dark" : "light");
  };

  const onSettingsHeaderPress = () => {
    countRef.current += 1;

    if (countRef.current >= 10 && !isLoggedIn) {
      countRef.current = 0;
      router.push("/(auth)/login");
    }
  };

  return (
    <Animated.View
      onLayout={onLayout}
      style={[
        styles.container,
        { opacity: fadeAnim, backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: Colors[colorScheme].background },
        ]}
        edges={["top", "bottom"]}
      >
        <View style={[styles.header, rtl && styles.rtl]}>
          <Pressable style={{ flex: 1 }} onPress={onSettingsHeaderPress}>
            <ThemedText
              style={[
                styles.headerTitle,
                rtl && { textAlign: "right", paddingRight: 15 },
              ]}
              type="title"
            >
              {t("settings")}
            </ThemedText>
          </Pressable>

          {isLoggedIn && (
            <Pressable
              onPress={isLoggedIn ? logout : () => router.push("/(auth)/login")}
              style={({ pressed }) => [
                styles.buttonContainer,
                {
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
            >
              <ThemedText style={styles.loginButtonText}>
                {isLoggedIn ? t("logout") : t("login")}
              </ThemedText>
            </Pressable>
          )}
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <View style={[styles.settingRow, rtl && styles.rtl]}>
              <View>
                <ThemedText
                  style={[styles.settingTitle, rtl && { textAlign: "right" }]}
                >
                  {t("darkMode")}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.settingSubtitle,
                    rtl && { textAlign: "right" },
                  ]}
                >
                  {t("enableDarkMode")}
                </ThemedText>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{
                  false: Colors.light.trackColor,
                  true: Colors.dark.trackColor,
                }}
                thumbColor={Colors[colorScheme].thumbColor}
              />
            </View>

            <View style={[styles.settingRow, rtl && styles.rtl]}>
              <View>
                <ThemedText
                  style={[styles.settingTitle, rtl && { textAlign: "right" }]}
                >
                  {t("notifications")}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.settingSubtitle,
                    rtl && { textAlign: "right" },
                  ]}
                >
                  {t("receivePushNotifications")}
                </ThemedText>
              </View>
              <Switch
                value={effectiveEnabled}
                onValueChange={() => {
                  if (!hasInternet) return;
                  toggleGetNotifications();
                }}
                trackColor={{
                  false: Colors.light.trackColor,
                  true: Colors.dark.trackColor,
                }}
                thumbColor={
                  isDarkMode ? Colors.light.thumbColor : Colors.dark.thumbColor
                }
              />
            </View>

       

            <LanguageSwitcher disabled={false} />

            <View style={{ gap: 10 }}>
              <ClearAppCacheButton />
              <FeedbackButton />
            </View>
          </View>

          {isLoggedIn && (
            <View style={styles.section}>
              <ThemedText
                style={[styles.sectionTitle, rtl && { textAlign: "right" }]}
              >
                {t("account")}
              </ThemedText>

              <Pressable
                style={styles.settingButton}
                onPress={() => router.push("/(auth)/forgotPassword")}
              >
                <Text style={styles.settingButtonText}>
                  {t("changePassword")}
                </Text>
              </Pressable>

              <Pressable
                style={[styles.settingButton, styles.deleteButton]}
                onPress={() => setOpenDeleteModal(true)}
              >
                <ThemedText
                  style={[styles.settingButtonText, styles.deleteButtonText]}
                >
                  {t("deleteAccount")}
                </ThemedText>
              </Pressable>
            </View>
          )}

          <Pressable
            style={styles.paypalButton}
            onPress={() => payPalLink && handleOpenExternalUrl(payPalLink)}
          >
            <Image
              source={require("@/assets/images/paypal.png")}
              style={styles.paypalImage}
            />
          </Pressable>

          <View style={styles.infoSection}>
            {isAdmin && isLoggedIn && (
              <ThemedText
                style={[styles.versionText, rtl && { textAlign: "right" }]}
              >
                {t("appVersion", { version: Constants.expoConfig?.version })}
              </ThemedText>
            )}
          </View>

          <View
            style={[
              styles.footer,
              rtl && { flexDirection: "row-reverse" },
              { borderTopColor: Colors[colorScheme].border },
            ]}
          >
            <Pressable
              onPress={() =>
                handleOpenExternalUrl(
                  "https://bufib.github.io/Islam-Fragen-App-rechtliches/datenschutz",
                )
              }
            >
              <ThemedText
                style={[styles.footerLink, rtl && { textAlign: "right" }]}
              >
                {t("dataPrivacy")}
              </ThemedText>
            </Pressable>

            <Pressable onPress={() => router.push("/settings/about")}>
              <ThemedText
                style={[styles.footerLink, rtl && { textAlign: "right" }]}
              >
                {t("aboutTheApp")}
              </ThemedText>
            </Pressable>

            <Pressable onPress={() => router.push("/settings/impressum")}>
              <ThemedText
                style={[styles.footerLink, rtl && { textAlign: "right" }]}
              >
                {t("imprint")}
              </ThemedText>
            </Pressable>
          </View>
        </ScrollView>

        <DeleteUserModal
          isVisible={openDeleteModal}
          onClose={() => setOpenDeleteModal(false)}
          onDeleteSuccess={handleDeleteSuccess}
          serverUrl="https://ygtlsiifupyoepxfamcn.supabase.co/functions/v1/delete-account"
        />
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  headerTitle: {},
  loginButton: {
    paddingVertical: 8,
    paddingLeft: 15,
  },
  buttonContainer: {
    paddingRight: 15,
    backgroundColor: "transparent",
  },
  loginButtonText: {
    color: Colors.universal.link,
    fontSize: 19,
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 15,
    opacity: 0.8,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 8,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  settingButton: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: "#ccc",
  },
  settingButtonText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  deleteButton: {
    backgroundColor: "rgba(255,0,0,0.1)",
  },
  deleteButtonText: {
    color: "#ff4444",
  },
  paypalButton: {
    alignItems: "center",
    padding: 20,
  },
  paypalImage: {
    height: 80,
    aspectRatio: 2,
  },
  infoSection: {
    alignItems: "center",
    padding: 20,
  },
  questionCount: {
    fontSize: 16,
    opacity: 0.5,
    marginBottom: 8,
  },
  versionText: {
    fontSize: 14,
    opacity: 0.5,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    borderTopWidth: 0.5,
    marginBottom: 40,
    paddingTop: 15,
  },
  footerLink: {
    color: Colors.universal.link,
    fontSize: 14,
  },
  rtl: {
    flexDirection: "row-reverse",
  },
  arabicDateSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 8,
  },
  dateAdjustControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateAdjustButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  dateAdjustButtonText: {
    fontSize: 22,
    fontWeight: "600",
  },
  dateOffsetDisplay: {
    minWidth: 48,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  dateOffsetText: {
    fontSize: 17,
    fontWeight: "600",
  },
});

export default Settings;
