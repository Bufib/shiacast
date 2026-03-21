import React, { useState } from "react";
import {
  StyleSheet,
  useColorScheme,
  Pressable,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { useRouter } from "expo-router";
import AddPushMessages from "./addPushMessages";
import AddNews from "./addNews";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";

export default function Index() {
  const router = useRouter();
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const colorScheme = useColorScheme() || "light";

  const routes = [
    { key: "addNews", title: "Neue Nachricht" },
    { key: "addPush", title: "Push-Benachrichtigung" },
  ];
  const renderScene = SceneMap({
    addNews: AddNews,
    addPush: AddPushMessages,
  });

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: Colors[colorScheme].contrast },
      ]}
      edges={["top", "left", "right"]}
    >
      {/* Back button INSIDE the SafeAreaView */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.replace("/home")}
          style={styles.backButton}
        >
          <Ionicons
            name="chevron-back-outline"
            size={30}
            style={{ marginLeft: -16 }}
            onPress={() => router.back()}
            color={colorScheme === "dark" ? "#d0d0c0" : "#000"}
          />
        </Pressable>
      </View>

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        style={styles.tabView}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            style={[styles.tabBar, Colors[colorScheme].contrast]}
            indicatorStyle={{
              backgroundColor: Colors[colorScheme].indicatorColor,
            }}
            activeColor={Colors[colorScheme].activeLabelColor}
            inactiveColor={Colors[colorScheme].inactiveLabelColor}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 50,
  },
  backButton: {
    padding: 8,
  },
  tabView: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: "transparent",
  },
});
