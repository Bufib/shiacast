import { useMemo } from "react";
import {
  InfiniteData,
  QueryKey,
  useInfiniteQuery,
} from "@tanstack/react-query";

import { PodcastType } from "@/constants/Types";
import { supabase } from "../../utils/supabase";
import { attachPodcastImageUrls } from "../../utils/podcastStorage";
import { matchesTopic } from "../../utils/podcastTopics";

export type PodcastPage = {
  items: PodcastType[];
  nextOffset?: number;
};

type UsePodcastListArgs = {
  language: string | null;
  selectedTopic?: string | null;
  selectedAuthor?: string | null;
  searchQuery?: string;
  pageSize?: number;
};

export function usePodcastList({
  language,
  selectedTopic = null,
  selectedAuthor = null,
  searchQuery = "",
  pageSize = 20,
}: UsePodcastListArgs) {
  const trimmedSearchQuery = searchQuery.trim();

  const query = useInfiniteQuery<
    PodcastPage,
    Error,
    InfiniteData<PodcastPage>,
    QueryKey,
    number
  >({
    queryKey: [
      "podcasts",
      "grid",
      language,
      selectedTopic,
      selectedAuthor,
      trimmedSearchQuery,
      pageSize,
    ],

    queryFn: async ({ pageParam = 0 }) => {
      let request = supabase
        .from("podcasts")
        .select("*")
        .order("created_at", { ascending: false })
        .range(pageParam, pageParam + pageSize - 1);

      if (language !== null) {
        request = request.eq("language_code", language);
      }

      if (selectedAuthor) {
        request = request.eq("podcast_author", selectedAuthor);
      }

      if (trimmedSearchQuery.length > 0) {
        const safe = trimmedSearchQuery.replace(/[%,]/g, "");
        request = request.ilike("title", `%${safe}%`);
      }

      const { data, error } = await request;

      if (error) throw error;

      const rawRows = (data ?? []) as PodcastType[];

      const filteredRows = selectedTopic
        ? rawRows.filter((podcast) =>
            matchesTopic(podcast.podcast_topic, selectedTopic),
          )
        : rawRows;

      const itemsWithImages = await attachPodcastImageUrls(filteredRows);

      return {
        items: itemsWithImages as PodcastType[],
        nextOffset:
          rawRows.length === pageSize ? pageParam + pageSize : undefined,
      };
    },

    getNextPageParam: (lastPage) => lastPage.nextOffset,

    initialPageParam: 0,
    enabled: true,
    retry: 3,
    staleTime: 12 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const podcasts = useMemo(() => {
    return query.data?.pages.flatMap((page) => page.items) ?? [];
  }, [query.data]);

  return {
    ...query,
    podcasts,
  };
}
