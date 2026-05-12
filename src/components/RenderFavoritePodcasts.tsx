import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../utils/supabase";
import { PodcastType } from "@/constants/Types";
import { getFavoritePodcasts } from "../../utils/favorites";
import { useLanguage } from "../../contexts/LanguageContext";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { Colors } from "@/constants/Colors";
import { Entypo } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { formatDate } from "../../utils/formatDate";
import { useDataVersionStore } from "../../stores/dataVersionStore";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RenderFavoritePodcasts() {
  const { lang, rtl } = useLanguage();
  const { t } = useTranslation();
  const colorScheme = useColorScheme() || "light";
  const podcastFavoritesVersion = useDataVersionStore(
    (s) => s.podcastFavoritesVersion,
  );

  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const favKey = useMemo(() => favoriteIds.join(","), [favoriteIds]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const ids = await getFavoritePodcasts(lang);
        if (!cancelled) {
          setFavoriteIds(ids);
        }
      } catch (e) {
        if (!cancelled) {
          console.warn("Failed to load favorite podcasts:", e);
          setFavoriteIds([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [lang, podcastFavoritesVersion]);

  // Fetch favorite episodes by ID directly (no pagination dance)
  const {
    data: favoriteEpisodes = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["favorite-episodes", lang, favKey],
    enabled: favoriteIds.length > 0,
    queryFn: async (): Promise<PodcastType[]> => {
      const ids = favoriteIds.map(Number);
      const { data, error } = await supabase
        .from("podcasts")
        .select("*")
        .in("id", ids)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    retry: 3,
    staleTime: 12 * 60 * 60 * 1000, // 12 hours
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  // Pull-to-refresh (optional but handy)
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    // Reload IDs in case user changed favorites while this screen was open
    const ids = await getFavoritePodcasts(lang);
    setFavoriteIds(ids);
    await refetch();
    setRefreshing(false);
  };

  // const listExtraData = React.useMemo(
  //   () => `${podcastFavoritesVersion}`,
  //   [podcastFavoritesVersion]
  // );

  // Loading first data
  if (isLoading && favoriteIds.length > 0) {
    return (
      <ThemedView style={styles.centeredContainer}>
        <LoadingIndicator size="large" />
      </ThemedView>
    );
  }

  // Error state
  if (isError) {
    return (
      <ThemedView style={styles.centeredContainer}>
        <ThemedText style={styles.errorText}>{t("error")}</ThemedText>
      </ThemedView>
    );
  }

  // No favorites stored (or none returned)
  if (favoriteIds.length === 0 || favoriteEpisodes.length === 0) {
    return (
      <ThemedView style={styles.centeredContainer}>
        <ThemedText style={styles.emptyText}>{t("noFavorites")}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={favoriteEpisodes}
        // extraData={listExtraData}
        keyExtractor={(item) => String(item.id)}
        refreshing={refreshing || isFetching}
        onRefresh={onRefresh}
        contentContainerStyle={styles.flatListContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.itemContainer,
              {
                backgroundColor: Colors[colorScheme].contrast,
                flexDirection: rtl ? "row-reverse" : "row",
              },
            ]}
            onPress={() =>
              router.push({
                pathname: "/(podcast)/indexPodcast",
                params: { podcast: JSON.stringify(item) },
              })
            }
          >
            <View style={{ flex: 1, gap: 40 }}>
              <ThemedText style={styles.itemTitle}>{item.title}</ThemedText>
              <ThemedText style={styles.itemDate}>
                {formatDate(item.created_at)}
              </ThemedText>
            </View>
            <Entypo
              name="chevron-thin-right"
              size={24}
              color={colorScheme === "dark" ? "#fff" : "#000"}
              style={{ marginTop: -15 }}
            />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    textAlign: "center",
  },
  flatListContent: {
    paddingTop: 15,
    gap: 20,
    paddingBottom: 24,
    paddingHorizontal: 15,
  },
  itemContainer: {
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: { elevation: 5 },
    }),
  },
  itemTitle: { fontSize: 16, fontWeight: "500" },
  itemDate: {
    fontSize: 14,
    alignSelf: "flex-end",
    color: Colors.universal.grayedOut,
  },
  emptyText: {
    textAlign: "center",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 22,
  },
  errorText: { fontSize: 16, color: "red", textAlign: "center" },
});
