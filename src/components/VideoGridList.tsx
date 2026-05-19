import VideoGridCard from "@/components/VideoGridCard";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import type { VideoType } from "@/constants/Types";
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

const HORIZONTAL_PADDING = 16;

type VideoGridListProps = {
  videos: VideoType[];
  ListHeaderComponent?: FlatListProps<VideoType>["ListHeaderComponent"];
  ListEmptyComponent?: FlatListProps<VideoType>["ListEmptyComponent"];
  refreshing?: boolean;
  onRefresh?: () => void;
  isLoadingMore?: boolean;
  onEndReached?: () => void;
};

export default function VideoGridList({
  videos,
  ListHeaderComponent,
  ListEmptyComponent,
  refreshing = false,
  onRefresh,
  isLoadingMore = false,
  onEndReached,
}: VideoGridListProps) {
  const { width } = useWindowDimensions();
  const { lang, rtl } = useLanguage();
  const [activeVideoId, setActiveVideoId] = useState<number | null>(null);

  const cardWidth = useMemo(() => {
    return width - HORIZONTAL_PADDING * 2;
  }, [width]);

  const stopPlaying = useCallback((id: number) => {
    setActiveVideoId((currentId) => (currentId === id ? null : currentId));
  }, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<VideoType>) => {
      return (
        <View style={styles.itemWrapper}>
          <VideoGridCard
            video={item}
            width={cardWidth}
            rtl={rtl}
            lang={lang}
            isPlaying={activeVideoId === item.id}
            onRequestPlay={() => setActiveVideoId(item.id)}
            onStopPlaying={() => stopPlaying(item.id)}
          />
        </View>
      );
    },
    [activeVideoId, cardWidth, lang, rtl, stopPlaying],
  );

  return (
    <FlatList
      data={videos}
      extraData={activeVideoId}
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
      initialNumToRender={6}
      maxToRenderPerBatch={6}
      windowSize={7}
      removeClippedSubviews
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 30,
  },
  itemWrapper: {
    paddingBottom: 16,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: "center",
  },
});
