import VideoGridList from "@/components/VideoGridList";
import { useColorScheme } from "@/hooks/useColorScheme";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useLanguage } from "../../contexts/LanguageContext";
import { useVideoFavoriteFoldersStore } from "../../stores/videoFavoriteFoldersStore";
import { useVideosByIdsForFavorites } from "@/hooks/useVideosByIdsForFavorites";
import { useScreenFadeIn } from "@/hooks/useScreenFadeIn";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function RenderFavoriteVideos() {
  const { lang, rtl } = useLanguage();
  const { t } = useTranslation();
  const { fadeAnim, onLayout } = useScreenFadeIn(800);
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isEditingFolders, setIsEditingFolders] = useState(false);

  const folders = useVideoFavoriteFoldersStore((s) => s.folders);
  const favorites = useVideoFavoriteFoldersStore((s) => s.favorites);
  const removeFolder = useVideoFavoriteFoldersStore((s) => s.removeFolder);

  const handleDeleteFolder = (folderId: string, folderName: string) => {
    Alert.alert(
      t("confirm"),
      `"${folderName}"`,
      [
        { text: t("back"), style: "cancel" },
        {
          text: t("remove"),
          style: "destructive",
          onPress: () => {
            removeFolder(folderId);
            if (selectedFolderId === folderId) setSelectedFolderId(null);
            if (folders.length <= 1) setIsEditingFolders(false);
          },
        },
      ],
    );
  };

  const allFavoriteIds = useMemo(
    () =>
      favorites.filter((f) => f.folderIds.length > 0).map((f) => f.videoId),
    [favorites],
  );

  const filteredIds = useMemo(() => {
    if (!selectedFolderId) return allFavoriteIds;
    return favorites
      .filter((f) => f.folderIds.includes(selectedFolderId))
      .map((f) => f.videoId);
  }, [selectedFolderId, allFavoriteIds, favorites]);

  const {
    data: videos = [],
    isLoading,
    isError,
  } = useVideosByIdsForFavorites({ ids: filteredIds, language: lang });

  const folderBar = folders.length > 0 ? (
    <View style={styles.folderBarRow}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.folderBarContent,
          { flexDirection: rtl ? "row-reverse" : "row" },
        ]}
        style={styles.folderBarScroll}
      >
      {/* "All" chip */}
      <TouchableOpacity
        onPress={() => setSelectedFolderId(null)}
        style={[
          styles.chip,
          {
            backgroundColor: !selectedFolderId
              ? Colors.universal.primary
              : colors.contrast,
            borderColor: !selectedFolderId
              ? Colors.universal.primary
              : colors.tabIconDefault + "40",
          },
        ]}
        activeOpacity={0.75}
      >
        <Text
          style={[
            styles.chipText,
            { color: !selectedFolderId ? "#fff" : colors.text },
          ]}
        >
          {t("all")}
        </Text>
      </TouchableOpacity>

      {folders.map((folder) => {
        const isSelected = selectedFolderId === folder.id;
        return (
          <View
            key={folder.id}
            style={[styles.chipWrapper, isEditingFolders && styles.chipWrapperEditing]}
          >
            <TouchableOpacity
              onPress={() =>
                setSelectedFolderId(isSelected ? null : folder.id)
              }
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? folder.color : colors.contrast,
                  borderColor: isSelected
                    ? folder.color
                    : colors.tabIconDefault + "40",
                },
              ]}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.chipDot,
                  { backgroundColor: isSelected ? "#fff" : folder.color },
                ]}
              />
              <Text
                style={[
                  styles.chipText,
                  { color: isSelected ? "#fff" : colors.text },
                ]}
                numberOfLines={1}
              >
                {folder.name}
              </Text>
            </TouchableOpacity>
            {isEditingFolders && (
              <TouchableOpacity
                onPress={() => handleDeleteFolder(folder.id, folder.name)}
                hitSlop={8}
                style={styles.chipDeleteBadge}
              >
                <View style={styles.chipDeleteBadgeInner}>
                  <Ionicons name="close" size={10} color="#fff" />
                </View>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
      </ScrollView>
      <TouchableOpacity
        onPress={() => setIsEditingFolders((v) => !v)}
        style={styles.editFoldersBtn}
        hitSlop={8}
      >
        <Ionicons
          name={isEditingFolders ? "checkmark" : "create-outline"}
          size={18}
          color={Colors.universal.primary}
        />
      </TouchableOpacity>
    </View>
  ) : null;

  const renderHeader = () => (
    <View>
      <View
        style={[
          styles.titleRow,
          { flexDirection: rtl ? "row-reverse" : "row" },
        ]}
      >
        <ThemedText type="title">{t("favorites")}</ThemedText>
      </View>
      {folderBar}
    </View>
  );

  if (isLoading && filteredIds.length > 0) {
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

  if (allFavoriteIds.length === 0) {
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
          backgroundColor: colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <VideoGridList
        videos={videos}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>{t("noData")}</ThemedText>
          </View>
        )}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  animatedContainer: {
    flex: 1,
  },

  titleRow: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },

  folderBar: {
    marginBottom: 12,
  },

  folderBarContent: {
    paddingHorizontal: 16,
    gap: 8,
  },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },

  chipDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  chipText: {
    fontSize: 13,
    fontWeight: "700",
    maxWidth: 120,
  },

  chipWrapper: {
    position: "relative",
  },

  chipWrapperEditing: {
    marginTop: 8,
    marginRight: 6,
  },

  chipDeleteBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    zIndex: 10,
  },

  chipDeleteBadgeInner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#e53e3e",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#fff",
  },

  folderBarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  folderBarScroll: {
    flex: 1,
  },

  editFoldersBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  editFoldersBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },

  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },

  emptyText: {
    textAlign: "center",
  },

  errorText: {
    fontSize: 16,
    textAlign: "center",
  },
});
