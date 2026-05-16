import React from "react";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "react-native";
import { useTranslation } from "react-i18next";
export default function TabLayout() {
  const colorScheme = useColorScheme() || "light";
  const { t } = useTranslation();

  return (
    <NativeTabs
      backgroundColor={Colors[colorScheme].contrast}
      indicatorColor={Colors[colorScheme].background}
      labelStyle={{
        selected: { color: Colors[colorScheme].tint },
        default: { color: Colors[colorScheme].text },
      }}
    >
      <NativeTabs.Trigger name="home" disableTransparentOnScrollEdge>
        <NativeTabs.Trigger.Label>{t("home")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          // iOS (SF Symbols)
          sf="house.fill"
          // Android (Material Symbols)
          md="home"
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="favorites" disableTransparentOnScrollEdge>
        <NativeTabs.Trigger.Label>{t("favorites")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="heart"
          md="favorite"
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings" disableTransparentOnScrollEdge>
        <NativeTabs.Trigger.Label>{t("settings")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="gear.circle"
          md="settings"
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
