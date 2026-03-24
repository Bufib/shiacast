//! Works but not DRY
// import React from "react";
// import {
//   View,
//   FlatList,
//   StyleSheet,
//   Pressable,
//   useColorScheme,
//   TouchableOpacity,
// } from "react-native";
// import { Entypo } from "@expo/vector-icons";
// import { Stack, useRouter } from "expo-router";

// import { useFetchVideoCategories } from "@/hooks/useFetchVideoCategories";
// import { ThemedText } from "@/components/ThemedText";
// import { ThemedView } from "@/components/ThemedView";
// import { Colors } from "@/constants/Colors";
// import { LoadingIndicator } from "@/components/LoadingIndicator";
// import { useLanguage } from "@/contexts/LanguageContext";
// import HeaderLeftBackButton from "@/components/HeaderLeftBackButton";
// import { useTranslation } from "react-i18next";
// import { LanguageCode } from "@/constants/Types";
// import { useDataVersionStore } from "@/stores/dataVersionStore";

// export default function RenderQuestionVideosCategories() {
//   const colorScheme = useColorScheme() || "light";
//   const router = useRouter();
//   const { lang } = useLanguage();
//   const videoVersion = useDataVersionStore((s) => s.videoVersion);

//   const { categories, isLoading, error } = useFetchVideoCategories(lang);
//   const { t } = useTranslation();

//   const listExtraData = React.useMemo(
//     () => `${lang}|${videoVersion}|${colorScheme}`,
//     [lang, videoVersion, colorScheme]
//   );

//   if (isLoading) {
//     return (
//       <ThemedView style={styles.centeredContainer}>
//         <Stack.Screen
//           options={{
//             headerLeft: () => <HeaderLeftBackButton />,
//             headerTitle: t("videos"),
//           }}
//         />
//         <LoadingIndicator size={"large"} />
//       </ThemedView>
//     );
//   }

//   if (error) {
//     return (
//       <ThemedView style={styles.centeredContainer}>
//         <Stack.Screen
//           options={{
//             headerLeft: () => <HeaderLeftBackButton />,
//             headerTitle: t("videos"),
//           }}
//         />
//         <ThemedText
//           style={{ color: Colors[colorScheme].error }}
//           type="subtitle"
//         >
//           {error.message}
//         </ThemedText>
//       </ThemedView>
//     );
//   }

//   return (
//     <ThemedView style={styles.container}>
//       <Stack.Screen
//         options={{
//           headerLeft: () => <HeaderLeftBackButton />,
//           headerTitle: t("videos"),
//         }}
//       />
//       <FlatList
//         data={categories}
//         extraData={listExtraData}
//         keyExtractor={(item) => item.id.toString()}
//         showsVerticalScrollIndicator={false}
//         style={{ backgroundColor: Colors[colorScheme].background }}
//         contentContainerStyle={styles.flatListStyle}
//         renderItem={({ item }) => (
//           <TouchableOpacity
//             onPress={() =>
//               router.push({
//                 pathname: "/(tabs)/knowledge/questions/questionVideos",
//                 params: { categoryName: item.video_category },
//               })
//             }
//           >
//             <ThemedView
//               style={[
//                 styles.item,
//                 { backgroundColor: Colors[colorScheme].contrast },
//               ]} // Apply contrast style from theme
//             >
//               <View style={styles.questionContainer}>
//                 <ThemedText style={styles.titleText}>
//                   {item.video_category}
//                 </ThemedText>
//               </View>
//               <Entypo
//                 name="chevron-thin-right"
//                 size={24}
//                 color={colorScheme === "dark" ? "#fff" : "#000"} // Dynamic icon color based on theme
//               />
//             </ThemedView>
//           </TouchableOpacity>
//         )}
//       />
//     </ThemedView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   centeredContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   flatListStyle: {
//     paddingTop: 10,
//     gap: 15,
//   },
//   item: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     padding: 20,
//     marginHorizontal: 10,
//     borderWidth: 0.3,
//     borderRadius: 10,
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 1,
//     },
//     shadowOpacity: 0.2,
//     shadowRadius: 1.41,
//     elevation: 2,
//   },
//   questionContainer: {
//     flex: 1,
//     marginRight: 10,
//     gap: 2,
//   },
//   titleText: {
//     fontSize: 18,
//     textAlign: "left",
//     fontWeight: "500",
//   },
// });

import React, { useRef, useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Entypo } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";

import { useFetchVideoCategories } from "../../hooks/useFetchVideoCategories";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { useLanguage } from "../../contexts/LanguageContext";
import HeaderLeftBackButton from "@/components/HeaderLeftBackButton";
import { useTranslation } from "react-i18next";
import { VideosSkeleton } from "./VideosSkeleton";

// const VideosSkeleton: React.FC<{ colorScheme: "light" | "dark" }> = ({ colorScheme }) => {
//   const anim = useRef(new Animated.Value(0)).current;
//   useEffect(() => {
//     const loop = Animated.loop(
//       Animated.sequence([
//         Animated.timing(anim, { toValue: 1, duration: 850, useNativeDriver: true }),
//         Animated.timing(anim, { toValue: 0, duration: 850, useNativeDriver: true }),
//       ]),
//     );
//     loop.start();
//     return () => loop.stop();
//   }, [anim]);
//   const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.7] });
//   const bg = colorScheme === "dark" ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.07)";
//   return (
//     <View style={{ flex: 1, paddingTop: 10, paddingHorizontal: 10 }}>
//       {Array.from({ length: 8 }).map((_, i) => (
//         <Animated.View
//           key={i}
//           style={{ height: 64, borderRadius: 10, backgroundColor: bg, opacity, marginBottom: 15 }}
//         />
//       ))}
//     </View>
//   );
// };

export default function RenderQuestionVideosCategories() {
  const colorScheme = useColorScheme() || "light";
  const router = useRouter();
  const { lang } = useLanguage();
  const { t } = useTranslation();

  const { categories, isLoading, error } = useFetchVideoCategories(lang);

  // const listExtraData = React.useMemo(
  //   () => `${videoVersion}`,
  //   [videoVersion]
  // );

  // stable headerLeft renderer so options don't thrash
  const headerLeft = React.useCallback(() => <HeaderLeftBackButton />, []);

  return (
    <ThemedView style={styles.container}>
      {/* Render this ONCE */}
      <Stack.Screen
        options={{
          headerLeft,
          headerTitle: t("videos"),
        }}
      />

      {isLoading ? (
        <VideosSkeleton colorScheme={colorScheme as "light" | "dark"} />
      ) : error ? (
        <ThemedView style={styles.centeredContainer}>
          <ThemedText
            style={{ color: Colors[colorScheme].error }}
            type="subtitle"
          >
            {error.message}
          </ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={categories}
          // extraData={listExtraData}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: Colors[colorScheme].background }}
          contentContainerStyle={styles.flatListStyle}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/knowledge/questions/questionVideos",
                  params: { categoryName: item.video_category },
                })
              }
            >
              <ThemedView
                style={[
                  styles.item,
                  { backgroundColor: Colors[colorScheme].contrast },
                ]}
              >
                <View style={styles.questionContainer}>
                  <ThemedText style={styles.titleText}>
                    {item.video_category}
                  </ThemedText>
                </View>
                <Entypo
                  name="chevron-thin-right"
                  size={24}
                  color={colorScheme === "dark" ? "#fff" : "#000"}
                />
              </ThemedView>
            </TouchableOpacity>
          )}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center"

  },
  flatListStyle: {
    paddingTop: 10,
    gap: 15,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    marginHorizontal: 10,
    borderWidth: 0.3,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  questionContainer: {
    flex: 1,
    marginRight: 10,
    gap: 2,
  },
  titleText: {
    fontSize: 18,
    textAlign: "left",
    fontWeight: "500",
  },
});
