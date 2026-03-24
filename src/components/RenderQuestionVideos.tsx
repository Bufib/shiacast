// //! Expo videos - Works but not DRY
// import React, { useEffect } from "react";
// import { StyleSheet, useColorScheme, FlatList, View } from "react-native";
// import { Stack, useLocalSearchParams } from "expo-router";
// import { VideoView, useVideoPlayer } from "expo-video";
// import { ThemedView } from "@/components/ThemedView";
// import { ThemedText } from "@/components/ThemedText";
// import { LoadingIndicator } from "@/components/LoadingIndicator";
// import { Collapsible } from "@/components/Collapsible";
// import HeaderLeftBackButton from "./HeaderLeftBackButton";
// import { CLOUD_NAME } from "@/utils/cloudinary";
// import { Colors } from "@/constants/Colors";
// import { useLanguage } from "@/contexts/LanguageContext";
// import { useTranslation } from "react-i18next";
// import { useVideos } from "@/hooks/useVideos";
// import { hlsUrl } from "@/utils/cloudinary";
// import { LanguageCode } from "@/constants/Types";
// import { useDataVersionStore } from "@/stores/dataVersionStore";
// export default function RenderQuestionVideos() {
//   const { categoryName } = useLocalSearchParams<{ categoryName: string }>();
//   const colorScheme = useColorScheme() || "light";
//   const theme = Colors[colorScheme];
//   const { lang } = useLanguage();
//   const { t } = useTranslation();
//   const videoVersion = useDataVersionStore((s) => s.videoVersion);

//   const { data, isLoading, error } = useVideos(lang);
//   // your hook also exposes derived maps; but we can filter here if needed:
//   const videosForCategory =
//     (data ?? []).filter((v: any) => v.video_category === categoryName) ?? [];

//   const listExtraData = React.useMemo(
//     () => `${lang}|${videoVersion}|${colorScheme}`,
//     [lang, videoVersion, colorScheme]
//   );

//   if (isLoading) {
//     return (
//       <ThemedView style={styles.centeredContainer}>
//         <LoadingIndicator size="large" />
//       </ThemedView>
//     );
//   }

//   if (error) {
//     return (
//       <ThemedView style={styles.centeredContainer}>
//         <ThemedText
//           style={{ color: theme.error, textAlign: "center" }}
//           type="subtitle"
//         >
//           {t("error")} {error.message}
//         </ThemedText>
//       </ThemedView>
//     );
//   }

//   if (!videosForCategory.length) {
//     return (
//       <ThemedView style={styles.centeredContainer}>
//         <ThemedText
//           type="subtitle"
//           style={{
//             textAlign: "center",
//           }}
//         >
//           {t("noVideoFound")}
//         </ThemedText>
//       </ThemedView>
//     );
//   }

//   return (
//     <ThemedView
//       style={[styles.container, { backgroundColor: theme.background }]}
//     >
//       <Stack.Screen
//         options={{
//           headerTitle: categoryName,
//           headerLeft: () => <HeaderLeftBackButton />,
//         }}
//       />

//       <FlatList
//         data={videosForCategory}
//         keyExtractor={(item: any) => String(item.id)}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.listContainer}
//         renderItem={({ item }) => (
//           <Collapsible title={item.title} marja={undefined}>
//             <VideoPlayer publicId={item.public_id} title={item.title} />
//           </Collapsible>
//         )}
//       />
//     </ThemedView>
//   );
// }

// function VideoPlayer({
//   publicId,
//   title,
// }: {
//   publicId: string;
//   title?: string;
// }) {
//   // uses your helper → adaptive HLS (sp_auto)
//   const url = hlsUrl(publicId);

//   const player = useVideoPlayer(url, (p) => {
//     p.loop = false;
//     p.play(); // enable if you want autoplay when opened
//   });

//   //! Fix that works but looks strange but not needed
//   // // Pause when the screen loses focus (before unmount), avoids calling into a freed native object
//   // const { useFocusEffect } = require("@react-navigation/native");
//   // useFocusEffect(
//   //   React.useCallback(() => {
//   //     return () => {
//   //       try {
//   //         player?.pause();
//   //       } catch {}
//   //     };
//   //   }, [player])
//   // );

//   return (
//     <View style={styles.videoContainer}>
//       <VideoView
//         style={styles.video}
//         player={player}
//         nativeControls
//         contentFit="contain"
//         allowsFullscreen
//         allowsPictureInPicture
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 16 },
//   centeredContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   listContainer: { paddingBottom: 20 },
//   videoContainer: {
//     width: "100%",
//     height: 250,
//     backgroundColor: "#000",
//     borderRadius: 8,
//     overflow: "hidden",
//   },
//   video: { flex: 1 },
// });

// Expo videos
import React from "react";
import { StyleSheet, useColorScheme, FlatList, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Collapsible } from "@/components/Collapsible";
import HeaderLeftBackButton from "./HeaderLeftBackButton";
import { Colors } from "@/constants/Colors";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTranslation } from "react-i18next";
import { useVideos } from "../../hooks/useVideos";
import { hlsUrl } from "../../utils/cloudinary";
import { VideosSkeleton } from "./VideosSkeleton";

export default function RenderQuestionVideos() {
  const { categoryName } = useLocalSearchParams<{ categoryName: string }>();
  const colorScheme = useColorScheme() || "light";
  const theme = Colors[colorScheme];
  const { lang } = useLanguage();
  const { t } = useTranslation();

  const { data, isLoading, error } = useVideos(lang);
  const videosForCategory =
    (data ?? []).filter((v: any) => v.video_category === categoryName) ?? [];

  // make headerLeft stable so options don't thrash
  const headerLeft = React.useCallback(() => <HeaderLeftBackButton />, []);

  return (
    <ThemedView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Render header ONCE */}
      <Stack.Screen
        options={{
          headerTitle: String(categoryName || t("videos")),
          headerLeft,
        }}
      />

      {isLoading ? (
        <VideosSkeleton colorScheme={colorScheme as "light" | "dark"} />
      ) : error ? (
        <ThemedView style={styles.centeredContainer}>
          <ThemedText
            style={{ color: theme.error, textAlign: "center" }}
            type="subtitle"
          >
            {t("error")} {error.message}
          </ThemedText>
        </ThemedView>
      ) : !videosForCategory.length ? (
        <ThemedView style={styles.centeredContainer}>
          <ThemedText type="subtitle" style={{ textAlign: "center" }}>
            {t("noVideoFound")}
          </ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={videosForCategory}
          keyExtractor={(item: any) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <Collapsible
              title={item.title}
              marja={undefined}
              style={{ marginBottom: 10 }}
              alignItems={"flex-start"}
              useFontSize={false}
            >
              <VideoPlayer publicId={item.public_id} title={item.title} />
            </Collapsible>
          )}
        />
      )}
    </ThemedView>
  );
}

function VideoPlayer({
  publicId,
  title,
}: {
  publicId: string;
  title?: string;
}) {
  const url = hlsUrl(publicId);
  const player = useVideoPlayer(url, (p) => {
    p.loop = false;
    p.play();
  });
  return (
    <View style={styles.videoContainer}>
      <VideoView
        style={styles.video}
        player={player}
        nativeControls
        contentFit="contain"
        allowsPictureInPicture
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  listContainer: { paddingBottom: 20 },
  videoContainer: {
    width: "100%",
    height: 250,
    backgroundColor: "#000",
    borderRadius: 8,
    overflow: "hidden",
  },
  video: { flex: 1 },
});
