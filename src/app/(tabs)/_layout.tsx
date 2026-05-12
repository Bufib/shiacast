// import { Tabs } from "expo-router";
// import React from "react";
// import { HapticTab } from "../../components/HapticTab";
// import { IconSymbol } from "../../components/ui/IconSymbol";
// import TabBarBackground from "../../components/ui/TabBarBackground";
// import { Colors } from "@/constants/Colors";
// import { useColorScheme } from "react-native";
// import { useTranslation } from "react-i18next";

// export default function TabLayout() {
//   const colorScheme = useColorScheme();
//   const { t } = useTranslation();

//   return (
//     <>
//       <Tabs
//         screenOptions={{
//           tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
//           headerShown: false,
//           tabBarButton: HapticTab,
//           tabBarBackground: TabBarBackground,
//         }}
//       >
//         <Tabs.Screen
//           name="home"
//           options={{
//             title: t("home"),
//             tabBarIcon: ({ color }) => (
//               <IconSymbol size={28} name="house.fill" color={color} />
//             ),
//           }}
//         />

//         <Tabs.Screen
//           name="knowledge"
//           options={{
//             title: t("knowledge"),
//             tabBarIcon: ({ color }) => (
//               <IconSymbol size={28} name="book" color={color} />
//             ),
//           }}
//         />
//         <Tabs.Screen
//           name="search"
//           options={{
//             title: t("search"),
//             tabBarIcon: ({ color }) => (
//               <IconSymbol size={28} name="magnifyingglass" color={color} />
//             ),
//           }}
//         />
//         <Tabs.Screen
//           name="favorites"
//           options={{
//             title: t("favorites"),
//             tabBarIcon: ({ color }) => (
//               <IconSymbol size={28} name="star" color={color} />
//             ),
//           }}
//         />
//         <Tabs.Screen
//           name="settings"
//           options={{
//             title: t("settings"),
//             tabBarIcon: ({ color }) => (
//               <IconSymbol size={28} name="gear.circle" color={color} />
//             ),
//           }}
//         />
//       </Tabs>
//     </>
//   );
// }

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import React from "react";
import { useColorScheme } from "react-native";

import AppTabs from "@/components/app-tabs";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AppTabs />
    </ThemeProvider>
  );
}
