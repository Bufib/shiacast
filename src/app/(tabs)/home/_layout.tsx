import React from "react";
import { Stack } from "expo-router";
const _layout = () => {
  return (
          <Stack screenOptions={{headerBackButtonMenuEnabled: false,}}>

      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="allPodcasts" options={{ headerShown: false }} />
      <Stack.Screen name="allPdfs" options={{ headerShown: false }} />
      <Stack.Screen name="allArticles" options={{ headerShown: false }} />
    </Stack>
  );
};

export default _layout;
