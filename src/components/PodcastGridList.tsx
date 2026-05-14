// import PodcastGridCard from "@/components/PodcastGridCard";
// import { LoadingIndicator } from "@/components/LoadingIndicator";
// import type { PodcastType } from "@/constants/Types";
// import { useGradient } from "@/hooks/useGradient";
// import { useLanguage } from "../../contexts/LanguageContext";
// import { router } from "expo-router";
// import React, { useMemo } from "react";
// import { useTranslation } from "react-i18next";
// import {
//   FlatList,
//   type FlatListProps,
//   StyleSheet,
//   TouchableOpacity,
//   useWindowDimensions,
//   View,
// } from "react-native";

// const GRID_GAP = 12;
// const HORIZONTAL_PADDING = 16;

// type PodcastGridListProps = {
//   podcasts: PodcastType[];
//   ListHeaderComponent?: FlatListProps<PodcastType>["ListHeaderComponent"];
//   ListEmptyComponent?: FlatListProps<PodcastType>["ListEmptyComponent"];
//   refreshing?: boolean;
//   onRefresh?: () => void;
//   isLoadingMore?: boolean;
//   onEndReached?: () => void;
// };

// export default function PodcastGridList({
//   podcasts,
//   ListHeaderComponent,
//   ListEmptyComponent,
//   refreshing = false,
//   onRefresh,
//   isLoadingMore = false,
//   onEndReached,
// }: PodcastGridListProps) {
//   const { width } = useWindowDimensions();
//   const { t } = useTranslation();
//   const { lang, rtl } = useLanguage();
//   const { gradientColors } = useGradient();

//   const podcastCardWidth = useMemo(() => {
//     return (width - HORIZONTAL_PADDING * 2 - GRID_GAP) / 2;
//   }, [width]);

//   return (
//     <FlatList
//       data={podcasts}
//       numColumns={2}
//       key="podcast-grid-2"
//       keyExtractor={(item) => item.id.toString()}
//       refreshing={refreshing}
//       onRefresh={onRefresh}
//       renderItem={({ item }) => (
//         <TouchableOpacity
//           activeOpacity={0.85}
//           style={[
//             styles.podcastItem,
//             {
//               width: podcastCardWidth,
//             },
//           ]}
//           onPress={() =>
//             router.push({
//               pathname: "/indexPodcast",
//               params: {
//                 podcast: JSON.stringify(item),
//               },
//             })
//           }
//         >
//           <PodcastGridCard
//             podcast={item}
//             width={podcastCardWidth}
//             rtl={rtl}
//             lang={lang}
//             listenText={t("listen")}
//             gradientColors={gradientColors}
//           />
//         </TouchableOpacity>
//       )}
//       columnWrapperStyle={styles.columnWrapper}
//       ListHeaderComponent={ListHeaderComponent}
//       ListEmptyComponent={ListEmptyComponent}
//       ListFooterComponent={
//         isLoadingMore ? (
//           <View style={styles.footerLoader}>
//             <LoadingIndicator size="small" />
//           </View>
//         ) : null
//       }
//       onEndReached={onEndReached}
//       onEndReachedThreshold={0.4}
//       keyboardShouldPersistTaps="handled"
//       showsVerticalScrollIndicator={false}
//       contentContainerStyle={styles.listContent}
//     />
//   );
// }

// const styles = StyleSheet.create({
//   listContent: {
//     paddingBottom: 30,
//     paddingHorizontal: HORIZONTAL_PADDING,
//   },

//   columnWrapper: {
//     justifyContent: "space-between",
//     marginBottom: GRID_GAP,
//   },

//   podcastItem: {
//     marginBottom: 0,
//   },

//   footerLoader: {
//     paddingVertical: 16,
//     alignItems: "center",
//   },
// });



import PodcastGridCard from "@/components/PodcastGridCard";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import type { PodcastType } from "@/constants/Types";
import { useGradient } from "@/hooks/useGradient";
import { useLanguage } from "../../contexts/LanguageContext";
import { FlashList, type FlashListProps } from "@shopify/flash-list";
import { router } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

const GRID_GAP = 12;
const HORIZONTAL_PADDING = 16;
const NUM_COLUMNS = 2;

// Pool of height ratios relative to card width.
// Keep the min around 1.1 — card has ~170px of fixed chrome (vinyl + title + footer).
const HEIGHT_RATIOS = [1.1, 1.35, 1.2, 1.55, 1.25, 1.45, 1.15, 1.4];

// Deterministic hash so the same id always gets the same height.
const hashId = (id: string | number) => {
  const s = String(id);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

type PodcastGridListProps = {
  podcasts: PodcastType[];
  ListHeaderComponent?: FlashListProps<PodcastType>["ListHeaderComponent"];
  ListEmptyComponent?: FlashListProps<PodcastType>["ListEmptyComponent"];
  refreshing?: boolean;
  onRefresh?: () => void;
  isLoadingMore?: boolean;
  onEndReached?: () => void;
};

export default function PodcastGridList({
  podcasts,
  ListHeaderComponent,
  ListEmptyComponent,
  refreshing = false,
  onRefresh,
  isLoadingMore = false,
  onEndReached,
}: PodcastGridListProps) {
  const { width } = useWindowDimensions();
  const { t } = useTranslation();
  const { lang, rtl } = useLanguage();
  const { gradientColors } = useGradient();

  // Math: 2 cols, GRID_GAP between them, HORIZONTAL_PADDING on each side.
  const cardWidth = useMemo(() => {
    const available =
      width - HORIZONTAL_PADDING * 2 - GRID_GAP * (NUM_COLUMNS - 1);
    return available / NUM_COLUMNS;
  }, [width]);

  const getCardHeight = useCallback(
    (id: string | number) => {
      const ratio = HEIGHT_RATIOS[hashId(id) % HEIGHT_RATIOS.length];
      return Math.round(cardWidth * ratio);
    },
    [cardWidth],
  );

  const renderItem = useCallback(
    ({ item, columnIndex }: { item: PodcastType; columnIndex: number }) => {
      const height = getCardHeight(item.id);
      const isLeftColumn = columnIndex === 0;

      return (
        <View
          style={{
            paddingLeft: isLeftColumn ? 0 : GRID_GAP / 2,
            paddingRight: isLeftColumn ? GRID_GAP / 2 : 0,
            paddingBottom: GRID_GAP,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              router.push({
                pathname: "/indexPodcast",
                params: { podcast: JSON.stringify(item) },
              })
            }
          >
            <PodcastGridCard
              podcast={item}
              width={cardWidth}
              height={height}
              rtl={rtl}
              lang={lang}
              listenText={t("listen")}
              gradientColors={gradientColors}
            />
          </TouchableOpacity>
        </View>
      );
    },
    [cardWidth, getCardHeight, rtl, lang, t, gradientColors],
  );

  return (
    <FlashList
      data={podcasts}
      masonry
      numColumns={NUM_COLUMNS}
      optimizeItemArrangement
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.4}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={
        isLoadingMore ? (
          <View style={styles.footerLoader}>
            <LoadingIndicator size="small" />
          </View>
        ) : null
      }
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 30,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: "center",
  },
});
