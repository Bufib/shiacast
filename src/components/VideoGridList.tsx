import VideoGridCard from "@/components/VideoGridCard";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { Colors } from "@/constants/Colors";
import type { VideoType } from "@/constants/Types";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useLanguage } from "../../contexts/LanguageContext";
import { parseTopics } from "../../utils/videoTopics";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  type FlatListProps,
  type ListRenderItemInfo,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

const HORIZONTAL_PADDING = 16;
const ROW_CARD_GAP = 14;
const GRID_CARD_GAP = 12;
const GRID_SECTION_KEY = "__grid__";
const UNCATEGORIZED_TOPIC_KEY = "__uncategorized__";

type TopicVideoSection = {
  key: string;
  title: string;
  videos: VideoType[];
  isUncategorized: boolean;
};

type VideoGridListProps = {
  videos: VideoType[];
  layout?: "topicRows" | "grid";
  ListHeaderComponent?: FlatListProps<VideoType>["ListHeaderComponent"];
  ListEmptyComponent?: FlatListProps<VideoType>["ListEmptyComponent"];
  refreshing?: boolean;
  onRefresh?: () => void;
  isLoadingMore?: boolean;
  onEndReached?: () => void;
};

export default function VideoGridList({
  videos,
  layout = "topicRows",
  ListHeaderComponent,
  ListEmptyComponent,
  refreshing = false,
  onRefresh,
  isLoadingMore = false,
  onEndReached,
}: VideoGridListProps) {
  const { width } = useWindowDimensions();
  const { lang, rtl } = useLanguage();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const [activeVideoKey, setActiveVideoKey] = useState<string | null>(null);

  const topicCardWidth = useMemo(() => {
    const availableWidth = Math.max(0, width - HORIZONTAL_PADDING * 2);
    const targetWidth =
      width >= 640 ? 360 : Math.round(availableWidth * 0.82);

    return Math.min(availableWidth, Math.max(260, targetWidth));
  }, [width]);

  const gridCardWidth = useMemo(() => {
    const availableWidth = Math.max(0, width - HORIZONTAL_PADDING * 2);
    return Math.max(120, Math.floor((availableWidth - GRID_CARD_GAP) / 2));
  }, [width]);

  const uncategorizedTitle = t("uncategorizedTopic");

  const topicSections = useMemo<TopicVideoSection[]>(() => {
    const sectionsByKey = new Map<string, TopicVideoSection>();

    for (const video of videos) {
      const topicNames = parseTopics(video.podcast_topic);
      const topics =
        topicNames.length > 0
          ? Array.from(new Set(topicNames))
          : [uncategorizedTitle];

      for (const topic of topics) {
        const isUncategorized = topicNames.length === 0;
        const key = isUncategorized
          ? UNCATEGORIZED_TOPIC_KEY
          : `topic:${topic.toLocaleLowerCase()}`;

        const existing = sectionsByKey.get(key);

        if (existing) {
          existing.videos.push(video);
        } else {
          sectionsByKey.set(key, {
            key,
            title: topic,
            videos: [video],
            isUncategorized,
          });
        }
      }
    }

    return Array.from(sectionsByKey.values()).sort((a, b) => {
      if (a.isUncategorized !== b.isUncategorized) {
        return a.isUncategorized ? 1 : -1;
      }

      return a.title.localeCompare(b.title, lang, { sensitivity: "base" });
    });
  }, [lang, uncategorizedTitle, videos]);

  const getPlaybackKey = useCallback((sectionKey: string, videoId: number) => {
    return `${sectionKey}:${videoId}`;
  }, []);

  const stopPlaying = useCallback((playbackKey: string) => {
    setActiveVideoKey((currentKey) =>
      currentKey === playbackKey ? null : currentKey,
    );
  }, []);

  const renderGridItem = useCallback(
    ({ item }: ListRenderItemInfo<VideoType>) => {
      const playbackKey = getPlaybackKey(GRID_SECTION_KEY, item.id);

      return (
        <View style={[styles.gridItemWrapper, { width: gridCardWidth }]}>
          <VideoGridCard
            video={item}
            width={gridCardWidth}
            rtl={rtl}
            lang={lang}
            isPlaying={activeVideoKey === playbackKey}
            onRequestPlay={() => setActiveVideoKey(playbackKey)}
            onStopPlaying={() => stopPlaying(playbackKey)}
          />
        </View>
      );
    },
    [
      activeVideoKey,
      getPlaybackKey,
      gridCardWidth,
      lang,
      rtl,
      stopPlaying,
    ],
  );

  const renderSection = useCallback(
    ({ item: section }: ListRenderItemInfo<TopicVideoSection>) => {
      const renderVideo = ({ item }: ListRenderItemInfo<VideoType>) => {
        const playbackKey = getPlaybackKey(section.key, item.id);

        return (
          <View style={styles.itemWrapper}>
            <VideoGridCard
              video={item}
              width={topicCardWidth}
              rtl={rtl}
              lang={lang}
              isPlaying={activeVideoKey === playbackKey}
              onRequestPlay={() => setActiveVideoKey(playbackKey)}
              onStopPlaying={() => stopPlaying(playbackKey)}
            />
          </View>
        );
      };

      return (
        <View style={styles.topicSection}>
          <View
            style={[styles.topicHeader, rtl && styles.topicHeaderReverse]}
          >
            <Text
              style={[
                styles.topicTitle,
                {
                  color: colors.text,
                  textAlign: rtl ? "right" : "left",
                  writingDirection: rtl ? "rtl" : "ltr",
                },
              ]}
              numberOfLines={1}
            >
              {section.title}
            </Text>

            <Text
              style={[
                styles.topicCount,
                {
                  color: colors.tabIconDefault,
                  textAlign: rtl ? "left" : "right",
                },
              ]}
              numberOfLines={1}
            >
              {section.videos.length}
            </Text>
          </View>

          <FlatList
            data={section.videos}
            extraData={activeVideoKey}
            horizontal
            keyExtractor={(item) => `${section.key}:${item.id}`}
            renderItem={renderVideo}
            ItemSeparatorComponent={TopicCardSeparator}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rowContent}
            style={styles.rowList}
            initialNumToRender={3}
            maxToRenderPerBatch={4}
            windowSize={5}
            removeClippedSubviews
          />
        </View>
      );
    },
    [
      activeVideoKey,
      colors.tabIconDefault,
      colors.text,
      getPlaybackKey,
      lang,
      rtl,
      stopPlaying,
      topicCardWidth,
    ],
  );

  if (layout === "grid") {
    return (
      <FlatList
        key="video-grid"
        data={videos}
        extraData={activeVideoKey}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderGridItem}
        numColumns={2}
        columnWrapperStyle={[
          styles.gridColumnWrapper,
          rtl && styles.gridColumnWrapperReverse,
        ]}
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
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews
      />
    );
  }

  return (
    <FlatList
      key="topic-rows"
      data={topicSections}
      extraData={activeVideoKey}
      keyExtractor={(item) => item.key}
      renderItem={renderSection}
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
      initialNumToRender={4}
      maxToRenderPerBatch={4}
      windowSize={7}
      removeClippedSubviews
    />
  );
}

function TopicCardSeparator() {
  return <View style={styles.cardSeparator} />;
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 30,
  },
  topicSection: {
    marginBottom: 24,
  },
  topicHeader: {
    minHeight: 32,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  topicHeaderReverse: {
    flexDirection: "row-reverse",
  },
  topicTitle: {
    flex: 1,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "900",
  },
  topicCount: {
    minWidth: 28,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
  },
  rowList: {
    overflow: "visible",
  },
  rowContent: {
    paddingTop: 2,
    paddingBottom: 6,
  },
  gridColumnWrapper: {
    justifyContent: "space-between",
  },
  gridColumnWrapperReverse: {
    flexDirection: "row-reverse",
  },
  gridItemWrapper: {
    paddingBottom: 16,
  },
  itemWrapper: {
    paddingBottom: 8,
  },
  cardSeparator: {
    width: ROW_CARD_GAP,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: "center",
  },
});
