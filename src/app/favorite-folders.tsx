import VideoFavoriteFolderModal from "@/components/VideoFavoriteFolderModal";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { View } from "react-native";

export default function FavoriteFoldersSheetRoute() {
  const params = useLocalSearchParams();
  const rawVideoId = Array.isArray(params.videoId)
    ? params.videoId[0]
    : params.videoId;
  const videoId = Number(rawVideoId);
  const isValidVideoId = Number.isFinite(videoId);

  useEffect(() => {
    if (isValidVideoId) return;

    router.dismiss();
  }, [isValidVideoId]);

  if (!isValidVideoId) {
    return <View style={{ flex: 1 }} />;
  }

  return <VideoFavoriteFolderModal videoId={videoId} />;
}
