import React from "react";
import { Stack } from "expo-router";

const _layout = () => {
  return (
    <Stack
      screenOptions={{
        headerBackButtonMenuEnabled: false,
      }}
    >
      <Stack.Screen name="level1" options={{ headerShown: false }} />
      <Stack.Screen name="level2" options={{ headerShown: false }} />
      <Stack.Screen name="level3" options={{ headerShown: false }} />
      <Stack.Screen name="level4" options={{ headerShown: false }} />
      <Stack.Screen name="level5" options={{ headerShown: false }} />
      <Stack.Screen name="level6" options={{ headerShown: false }} />
      <Stack.Screen name="level7" options={{ headerShown: false }} />
      <Stack.Screen name="level8" options={{ headerShown: false }} />
      <Stack.Screen name="level9" options={{ headerShown: false }} />
      <Stack.Screen name="level10" options={{ headerShown: false }} />
      <Stack.Screen name="level11" options={{ headerShown: false }} />



      <Stack.Screen name="level12" options={{ headerShown: false }} />
      <Stack.Screen name="level13" options={{ headerShown: false }} />

    </Stack>
  );
};

export default _layout;
