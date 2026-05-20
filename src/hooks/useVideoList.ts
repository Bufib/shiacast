import { useMemo } from "react";
import {
  InfiniteData,
  QueryKey,
  useInfiniteQuery,
} from "@tanstack/react-query";

import { VideoType } from "@/constants/Types";
import { supabase } from "../../utils/supabase";
import { matchesTopic } from "../../utils/videoTopics";

export type VideoPage = {
  items: VideoType[];
  nextOffset?: number;
};

type UseVideoListArgs = {
  language: string | null;
  selectedTopic?: string | null;
  selectedAuthor?: string | null;
  searchQuery?: string;
  pageSize?: number;
};

export function useVideoList({
  language,
  selectedTopic = null,
  selectedAuthor = null,
  searchQuery = "",
  pageSize = 20,
}: UseVideoListArgs) {
  const trimmedSearchQuery = searchQuery.trim();

  const query = useInfiniteQuery<
    VideoPage,
    Error,
    InfiniteData<VideoPage>,
    QueryKey,
    number
  >({
    queryKey: [
      "videos",
      "grid",
      language,
      selectedTopic,
      selectedAuthor,
      trimmedSearchQuery,
      pageSize,
    ],

    queryFn: async ({ pageParam = 0 }) => {
      let request = supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(pageParam, pageParam + pageSize - 1);

      if (language !== null) {
        request = request.eq("language_code", language);
      }

      if (selectedAuthor) {
        request = request.eq("author_name", selectedAuthor);
      }

      if (trimmedSearchQuery.length > 0) {
        const safe = trimmedSearchQuery.replace(/[%,]/g, "");
        request = request.ilike("title", `%${safe}%`);
      }

      const { data, error } = await request;

      if (error) throw error;

      const rawRows = (data ?? []) as unknown as VideoType[];

      const filteredRows = selectedTopic
        ? rawRows.filter((video) =>
            matchesTopic(video.video_topic, selectedTopic),
          )
        : rawRows;

      return {
        items: filteredRows,
        nextOffset:
          rawRows.length === pageSize ? pageParam + pageSize : undefined,
      };
    },

    getNextPageParam: (lastPage) => lastPage.nextOffset,

    initialPageParam: 0,
    placeholderData: (prev) => prev,
    retry: 3,
    staleTime: 12 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const videos = useMemo(() => {
    const all = query.data?.pages.flatMap((page) => page.items) ?? [];
    const seen = new Set<VideoType["id"]>();
    return all.filter((v) => {
      if (seen.has(v.id)) return false;
      seen.add(v.id);
      return true;
    });
  }, [query.data]);

  return {
    ...query,
    videos,
  };
}
