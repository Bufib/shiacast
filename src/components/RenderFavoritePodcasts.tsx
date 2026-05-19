import PodcastGridList from "@/components/PodcastGridList";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useLanguage } from "../../contexts/LanguageContext";
import { useDataVersionStore } from "../../stores/dataVersionStore";
import { getFavoritePodcasts } from "../../utils/favorites";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Animated, StyleSheet, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePodcastsByIdsForFavorites } from "../hooks/usePodcastsByIdsForFavorites";
import { useScreenFadeIn } from "@/hooks/useScreenFadeIn";

export default function RenderFavoritePodcasts() {
  const { lang, rtl } = useLanguage();
  const { t } = useTranslation();

  const podcastFavoritesVersion = useDataVersionStore(
    (state) => state.podcastFavoritesVersion,
  );

  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const { fadeAnim, onLayout } = useScreenFadeIn(800);
  const insets = useSafeAreaInsets();

  const colorScheme = useColorScheme() || "light";
  useEffect(() => {
    let cancelled = false;

    async function loadFavoriteIds() {
      try {
        const ids = await getFavoritePodcasts(lang);

        if (!cancelled) {
          setFavoriteIds(ids);
        }
      } catch (error) {
        if (!cancelled) {
          console.warn("Failed to load favorite podcasts:", error);
          setFavoriteIds([]);
        }
      }
    }

    loadFavoriteIds();

    return () => {
      cancelled = true;
    };
  }, [lang, podcastFavoritesVersion]);

  const {
    data: favoriteEpisodes = [],
    isLoading,
    isError,
  } = usePodcastsByIdsForFavorites({
    ids: favoriteIds,
    language: lang,
  });

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <ThemedText style={styles.emptyText} type="subtitle">
        {t("noData")}
      </ThemedText>
    </View>
  );

  const renderHeader = () => (
    <View
      style={[
        styles.sectionHeaderRow,
        {
          flexDirection: rtl ? "row-reverse" : "row",
        },
      ]}
    >
      <ThemedText type="title">{t("favorites")}</ThemedText>
    </View>
  );
  if (isLoading && favoriteIds.length > 0) {
    return (
      <ThemedView style={styles.centeredContainer}>
        <LoadingIndicator size="large" />
      </ThemedView>
    );
  }

  if (isError) {
    return (
      <ThemedView style={styles.centeredContainer}>
        <ThemedText style={styles.errorText}>{t("error")}</ThemedText>
      </ThemedView>
    );
  }

  if (favoriteIds.length === 0 || favoriteEpisodes.length === 0) {
    return (
      <ThemedView style={styles.centeredContainer}>
        <ThemedText style={styles.emptyText}>{t("noFavorites")}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <Animated.View
      onLayout={onLayout}
      style={[
        styles.animatedContainer,
        {
          opacity: fadeAnim,
          backgroundColor: Colors[colorScheme].background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <PodcastGridList
        podcasts={favoriteEpisodes}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  animatedContainer: {
    flex: 1,
  },

  headerWrapper: {
    marginBottom: 16,
  },

  sectionHeaderRow: {
    padding: 10,
    marginBottom: 12,
  },

  titleGroup: {
    flex: 1,
    alignItems: "center",
    gap: 10,
    paddingRight: 12,
    height: 50,
  },

  sectionLabel: {
    paddingHorizontal: 6,
  },

  headerActions: {
    alignItems: "center",
    gap: 8,
  },

  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },

  searchContainer: {
    minHeight: 44,
    borderRadius: 22,
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    paddingVertical: 10,
  },

  clearSearchButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },

  filterBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    backgroundColor: Colors.universal.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  filterBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },

  activeFiltersRow: {
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },

  filterChip: {
    maxWidth: 170,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
  },

  clearFiltersText: {
    fontSize: 12,
    fontWeight: "700",
  },

  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  podcastItem: {
    marginBottom: 0,
  },

  cardShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
    overflow: "visible",
  },

  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    zIndex: 1,
  },

  vinylRecord: {
    position: "absolute",
    top: 12,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(0, 0, 0, 0.22)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3,
  },

  vinylRecordLtr: {
    right: 12,
  },

  vinylRecordRtl: {
    left: 12,
  },

  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
    zIndex: 2,
  },

  titleContainer: {
    flex: 1,
    justifyContent: "center",
    paddingTop: 44,
    marginBottom: 12,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 22,
    letterSpacing: -0.3,
    textShadowColor: "rgba(0, 0, 0, 0.45)",
    textShadowOffset: {
      width: 0,
      height: 0,
    },
    textShadowRadius: 4,
  },

  cardFooter: {
    gap: 8,
  },

  playSection: {
    alignItems: "center",
  },

  playButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255, 255, 255, 0.28)",
    justifyContent: "center",
    alignItems: "center",
  },

  playText: {
    flex: 1,
    fontSize: 11,
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.9)",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  playTextLtr: {
    marginLeft: 8,
  },

  playTextRtl: {
    marginRight: 8,
  },

  createdAt: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.78)",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },

  sectionLoader: {
    marginVertical: 24,
  },

  footerLoader: {
    paddingVertical: 16,
    alignItems: "center",
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    backgroundColor: "transparent",
  },

  emptyText: {
    textAlign: "center",
  },

  errorContainer: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },

  errorText: {
    fontSize: 16,
    textAlign: "center",
  },
});
