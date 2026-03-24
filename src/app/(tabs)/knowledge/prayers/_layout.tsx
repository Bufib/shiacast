import { Pressable, useColorScheme } from "react-native";
import React from "react";
import { router, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
const Layout = () => {
  const colorScheme = useColorScheme() || "light";
  return (
    <Stack
      screenOptions={{
        headerBackButtonMenuEnabled: false,
      }}
    >
      <Stack.Screen name="indexPrayer" options={{ headerShown: false }} />
      <Stack.Screen
        name="names"
        options={{
          headerShown: true,
          headerLeft: () => {
            return (
              <Pressable
                onPress={() =>
                  router.canGoBack()
                    ? router.back()
                    : router.replace("/(tabs)/knowledge")
                }
                hitSlop={10}
                style={({ pressed }) => ({})}
              >
                <Ionicons
                  name="chevron-back-outline"
                  size={30}
                  color={colorScheme === "dark" ? "#fff" : "#000"}
                  style={{}}
                />
              </Pressable>
            );
          },
        }}
      />

      <Stack.Screen name="special" options={{ headerShown: true }} />
      <Stack.Screen
        name="prayerCategory"
        options={{
          headerShown: true,
          headerLeft: () => {
            return (
              <Pressable
                onPress={() =>
                  router.canGoBack()
                    ? router.back()
                    : router.replace("/(tabs)/knowledge")
                }
                hitSlop={10}
                style={({ pressed }) => ({})}
              >
                <Ionicons
                  name="chevron-back-outline"
                  size={30}
                  color={colorScheme === "dark" ? "#fff" : "#000"}
                  style={{}}
                />
              </Pressable>
            );
          },
        }}
      />
      <Stack.Screen name="tasbih" options={{ headerShown: false }} />
      <Stack.Screen
        name="weeklyCalendar"
        options={{
          headerShown: true,
          headerLeft: () => {
            return (
              <Pressable
                onPress={() =>
                  router.canGoBack()
                    ? router.back()
                    : router.replace("/(tabs)/knowledge")
                }
                hitSlop={10}
              >
                <Ionicons
                  name="chevron-back-outline"
                  size={30}
                  color={colorScheme === "dark" ? "#fff" : "#000"}
                />
              </Pressable>
            );
          },
        }}
      />

    </Stack>
  );
};

export default Layout;
