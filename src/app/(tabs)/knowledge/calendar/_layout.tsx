import React from "react";
import { Stack } from "expo-router";

const _layout = () => {
  return (
    <Stack
      screenOptions={{
        headerBackButtonMenuEnabled: false,
      }}
    >
      <Stack.Screen name="indexCalendar" options={{ headerShown: true }} />
      <Stack.Screen name="calendarDayDetail" options={{ headerShown: true }} />
    </Stack>
  );
};

export default _layout;
