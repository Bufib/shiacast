import PodcastGridCard from "@/components/PodcastGridCard";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import type { PodcastType } from "@/constants/Types";
import { useGradient } from "@/hooks/useGradient";
import { useLanguage } from "../../contexts/LanguageContext";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  type FlatListProps,
  type ListRenderItemInfo,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useDataVersionStore } from "../../stores/dataVersionStore";
import RenderFavoritePodcasts from "./RenderFavoritePodcasts";

const GRID_GAP = 16;
const HORIZONTAL_PADDING = 16;
const NUM_COLUMNS = 1;

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
  const { lang, rtl } = useLanguage();
  const { gradientColors } = useGradient();
  const [activePodcastId, setActivePodcastId] = useState<number | null>(null);

  const podcastFavoritesVersion = useDataVersionStore(
    (state) => state.podcastFavoritesVersion,
  );

  const cardWidth = useMemo(() => {
    const available =
      width - HORIZONTAL_PADDING * 2 - GRID_GAP * (NUM_COLUMNS - 1);
    return available / NUM_COLUMNS;
  }, [width]);

  const stopPlaying = useCallback(
    (id: number) => {
      setActivePodcastId((currentId) => (currentId === id ? null : currentId));
    },
    [setActivePodcastId],
  );

  const listExtraData = useMemo(
  () => ({
    activePodcastId,
    podcastFavoritesVersion,
  }),
  [activePodcastId, podcastFavoritesVersion],
);

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<PodcastType>) => {
      const isLeftColumn = index % NUM_COLUMNS === 0;

      return (
        <View
          style={{
            paddingLeft: isLeftColumn ? 0 : GRID_GAP / 2,
            paddingRight: isLeftColumn ? GRID_GAP / 2 : 0,
            paddingBottom: GRID_GAP,
          }}
        >
          <PodcastGridCard
            podcast={item}
            width={cardWidth}
            rtl={rtl}
            lang={lang}
            gradientColors={gradientColors}
            isPlaying={activePodcastId === item.id}
            onRequestPlay={() => setActivePodcastId(item.id)}
            onStopPlaying={() => stopPlaying(item.id)}
            podcastFavoritesVersion={podcastFavoritesVersion}
          />
        </View>
      );
    },
    [
      activePodcastId,
      cardWidth,
      gradientColors,
      lang,
      rtl,
      stopPlaying,
      podcastFavoritesVersion,
    ],
  );

  return (
    <FlatList
      data={podcasts}
      numColumns={NUM_COLUMNS}
      extraData={listExtraData}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onEndReached={onEndReached}
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
      initialNumToRender={8}
      maxToRenderPerBatch={8}
      windowSize={7}
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
