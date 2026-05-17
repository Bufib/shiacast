import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useLanguage } from "../../../../contexts/LanguageContext";
import { useConnectionStatus } from "../../../hooks/useConnectionStatus";
import useNotificationStore from "../../../../stores/notificationStore";
import handleOpenExternalUrl from "../../../../utils/handleOpenExternalUrl";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Appearance,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  useColorScheme,
  View,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDataVersionStore } from "../../../../stores/dataVersionStore";
import ClearAppCacheButton from "@/components/ClearCacheButton";
import FeedbackButton from "@/components/FeedbackButton";
import { useScreenFadeIn } from "@/hooks/useScreenFadeIn";

const Settings = () => {
  const colorScheme = useColorScheme() || "light";
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === "dark");
  const [payPalLink, setPayPalLink] = useState<string | null>("");

  const { getNotifications, toggleGetNotifications, permissionStatus } =
    useNotificationStore();
  const { rtl } = useLanguage();
  const hasInternet = useConnectionStatus();
  const effectiveEnabled = getNotifications && permissionStatus === "granted";

  const { t } = useTranslation();

  const { fadeAnim, onLayout } = useScreenFadeIn(800);
  const version = Constants.expoConfig?.version;
  useEffect(() => {
    (async () => {
      try {
        const paypal = await AsyncStorage.getItem("paypal");
        setPayPalLink(paypal);
      } catch (error: any) {
        Alert.alert("Fehler", error.message);
      }
    })();
  }, []);

  const toggleDarkMode = async () => {
    const newDarkMode = !isDarkMode;
    await AsyncStorage.setItem("isDarkMode", `${newDarkMode}`);
    setIsDarkMode(newDarkMode);
    Appearance.setColorScheme(newDarkMode ? "dark" : "light");
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
        edges={["top"]}
      >
        <View style={[styles.header, rtl && styles.rtl]}>
          <ThemedText
            style={[
              styles.headerTitle,
              rtl && { textAlign: "right", paddingRight: 15 },
            ]}
            type="title"
          >
            {t("settings")}
          </ThemedText>
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

            <LanguageSwitcher disabled={true} />
            {/* //! Auf false */}

            <View style={{ gap: 10 }}>
              <ClearAppCacheButton />
              <FeedbackButton />
            </View>
          </View>

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
            <ThemedText
              style={[styles.versionText, rtl && { textAlign: "right" }]}
            >
              {t("appVersion")} : {}
              {version}
            </ThemedText>
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
    paddingLeft: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  headerTitle: {},

  buttonContainer: {
    paddingRight: 15,
    backgroundColor: "transparent",
  },

  scrollView: {
    flex: 1,
  },
  section: {
    padding: 15,
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
});

export default Settings;
