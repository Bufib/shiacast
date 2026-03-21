import React from "react";
import { Stack } from "expo-router";

export const unstable_settings = {
  initialRouteName: "knowledge",
};
const _layout = () => {
  return (
    <Stack screenOptions={{ headerBackButtonMenuEnabled: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="prayers" options={{ headerShown: false }} />
      <Stack.Screen name="questions" options={{ headerShown: false }} />
      <Stack.Screen name="quran" options={{ headerShown: false }} />
      <Stack.Screen name="calendar" options={{ headerShown: false }} />
      <Stack.Screen name="history" options={{ headerShown: false }} />
    </Stack>
  );
};

export default _layout;
