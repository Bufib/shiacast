

import * as React from "react";
import { useWindowDimensions, useColorScheme, Animated } from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import indexPrayer from "@/app/(tabs)/knowledge/prayers/indexPrayer";
import indexQuestion from "@/app/(tabs)/knowledge/questions/indexQuestion";
import indexQuran from "@/app/(tabs)/knowledge/quran/indexQuran";
import indexCalendar from "@/app/(tabs)/knowledge/calendar/indexCalendar";
import indexHistory from "@/app/(tabs)/knowledge/history/indexHistory";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { Image } from "expo-image";
import { useScreenFadeIn } from "../../hooks/useScreenFadeIn";
import indexVideos from "@/app/(tabs)/knowledge/videos/indexVideos";
import { useKnowledgeTabStore } from "../../stores/useKnowledgeTabStore";
import indexArabic from "@/app/(tabs)/knowledge/arabic/indexArabic";

const renderScene = SceneMap({
  questionsScreen: indexQuestion,
  prayerScreen: indexPrayer,
  calendarScreen: indexCalendar,
  videoScreen: indexVideos,
  quranScreen: indexQuran,
  historyScreen: indexHistory,
  arabicScreen: indexArabic
});

export default function TopNavigationKnowledge() {
  const layout = useWindowDimensions();
  const activeTab = useKnowledgeTabStore((s) => s.activeTab);
  const setActiveTab = useKnowledgeTabStore((s) => s.setActiveTab);
  const [index, setIndex] = React.useState(activeTab);
  const colorScheme = useColorScheme() || "light";
  const { fadeAnim, onLayout } = useScreenFadeIn(800);
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    setIndex(activeTab);
  }, [activeTab]);

  const handleIndexChange = (newIndex: number) => {
    setIndex(newIndex);
    setActiveTab(newIndex);
  };
  const routes = React.useMemo(
    () => [
      {
        key: "questionsScreen",
        title: "",
        icon: require("@/assets/images/qAndAHeaderLogo.png"),
      },
      {
        key: "prayerScreen",
        title: "",
        icon: require("@/assets/images/prayersHeaderLogo.png"),
      },
      {
        key: "calendarScreen",
        title: "",
        icon: require("@/assets/images/calendarHeaderLogo.png"),
      },
      {
        key: "videoScreen",
        title: "",
        icon: require("@/assets/images/videos.png"),
      },
      {
        key: "quranScreen",
        title: "",
        icon: require("@/assets/images/quranHeaderLogo.png"),
      },
      {
        key: "historyScreen",
        title: "",
        icon: require("@/assets/images/historyHeaderLogo.png"),
      },
      {
        key: "arabicScreen",
        title: "",
        icon: require("@/assets/images/arabic.png"),
      },
    ],
    [],
  );

  return (
    <Animated.View
      onLayout={onLayout}
      style={{
        flex: 1,
        opacity: fadeAnim,
        backgroundColor: Colors[colorScheme].background,
        paddingBottom: insets.bottom,
      }}
    >
      <SafeAreaView
        style={{ backgroundColor: Colors[colorScheme].contrast }}
        edges={["top"]}
      />

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={handleIndexChange}
        initialLayout={{ width: layout.width }}
        lazy
        options={{
          questionsScreen: {
            icon: ({ route, focused }) => (
              <Image
                source={route.icon}
                contentFit="contain"
                style={{
                  width: 35,
                  height: 35,
                  opacity: focused ? 1 : 0.6,
                }}
              />
            ),
          },
          prayerScreen: {
            icon: ({ route, focused }) => (
              <Image
                source={route.icon}
                contentFit="contain"
                style={{
                  width: 35,
                  height: 35,
                  opacity: focused ? 1 : 0.6,
                }}
              />
            ),
          },
          calendarScreen: {
            icon: ({ route, focused }) => (
              <Image
                source={route.icon}
                contentFit="contain"
                style={{
                  width: 35,
                  height: 35,
                  opacity: focused ? 1 : 0.6,
                }}
              />
            ),
          },
          videoScreen: {
            icon: ({ route, focused }) => (
              <Image
                source={route.icon}
                contentFit="contain"
                style={{
                  width: 35,
                  height: 35,
                  opacity: focused ? 1 : 0.6,
                }}
              />
            ),
          },
          quranScreen: {
            icon: ({ route, focused }) => (
              <Image
                source={route.icon}
                contentFit="contain"
                style={{
                  width: 35,
                  height: 35,
                  opacity: focused ? 1 : 0.6,
                }}
              />
            ),
          },
          historyScreen: {
            icon: ({ route, focused }) => (
              <Image
                source={route.icon}
                contentFit="contain"
                style={{
                  width: 35,
                  height: 35,
                  opacity: focused ? 1 : 0.6,
                }}
              />
            ),
          },
          arabicScreen: {
            icon: ({ route, focused }) => (
              <Image
                source={route.icon}
                contentFit="contain"
                style={{
                  width: 35,
                  height: 35,
                  opacity: focused ? 1 : 0.6,
                }}
              />
            ),
          },
        }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            style={{ backgroundColor: Colors[colorScheme].contrast }}
            indicatorStyle={{
              backgroundColor: Colors[colorScheme].indicatorColor,
            }}
            activeColor={Colors[colorScheme].activeLabelColor}
            inactiveColor={Colors[colorScheme].inactiveLabelColor}
          />
        )}
      />
    </Animated.View>
  );
}
