import PodcastGridCard from "@/components/PodcastGridCard";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import type { PodcastType } from "@/constants/Types";
import { useGradient } from "@/hooks/useGradient";
import { useLanguage } from "../../contexts/LanguageContext";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  type FlatListProps,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

const GRID_GAP = 12;
const HORIZONTAL_PADDING = 16;

type PodcastGridListProps = {
  podcasts: PodcastType[];
  ListHeaderComponent?: FlatListProps<PodcastType>["ListHeaderComponent"];
  ListEmptyComponent?: FlatListProps<PodcastType>["ListEmptyComponent"];
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

  const podcastCardWidth = useMemo(() => {
    return (width - HORIZONTAL_PADDING * 2 - GRID_GAP) / 2;
  }, [width]);

  return (
    <FlatList
      data={podcasts}
      numColumns={2}
      key="podcast-grid-2"
      keyExtractor={(item) => item.id.toString()}
      refreshing={refreshing}
      onRefresh={onRefresh}
      renderItem={({ item }) => (
        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.podcastItem,
            {
              width: podcastCardWidth,
            },
          ]}
          onPress={() =>
            router.push({
              pathname: "/indexPodcast",
              params: {
                podcast: JSON.stringify(item),
              },
            })
          }
        >
          <PodcastGridCard
            podcast={item}
            width={podcastCardWidth}
            rtl={rtl}
            lang={lang}
            listenText={t("listen")}
            gradientColors={gradientColors}
          />
        </TouchableOpacity>
      )}
      columnWrapperStyle={styles.columnWrapper}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={
        isLoadingMore ? (
          <View style={styles.footerLoader}>
            <LoadingIndicator size="small" />
          </View>
        ) : null
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.4}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 30,
    paddingHorizontal: HORIZONTAL_PADDING,
  },

  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: GRID_GAP,
  },

  podcastItem: {
    marginBottom: 0,
  },

  footerLoader: {
    paddingVertical: 16,
    alignItems: "center",
  },
});