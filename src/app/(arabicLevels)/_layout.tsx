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
      <Stack.Screen name="level1_1" options={{ headerShown: false }} />
    </Stack>
  );
};

export default _layout;
