import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "../../utils/supabase";
import { parseTopics } from "../../utils/podcastTopics";

export type PodcastFilterPair = {
  topic: string | null;
  author: string | null;
};

type UsePodcastFiltersArgs = {
  language: string | null;
  selectedTopic: string | null;
  selectedAuthor: string | null;
};

export function usePodcastFilters({
  language,
  selectedTopic,
  selectedAuthor,
}: UsePodcastFiltersArgs) {
  const query = useQuery<PodcastFilterPair[]>({
    queryKey: ["podcast_filter_pairs", language],
    queryFn: async () => {
      let request = supabase
        .from("podcasts")
        .select("podcast_topic, podcast_author");

      if (language !== null) {
        request = request.eq("language_code", language);
      }

      const { data, error } = await request;

      if (error) throw error;

      return (data ?? []).flatMap((row: any): PodcastFilterPair[] => {
        const topics = parseTopics(row.podcast_topic);
        const author = row.podcast_author ?? null;

        if (topics.length === 0) {
          return [{ topic: null, author }];
        }

        return topics.map((topic) => ({
          topic,
          author,
        }));
      });
    },
    enabled: true,
    staleTime: 60 * 60 * 1000,
  });

  const filterPairs = useMemo(() => {
    return query.data ?? [];
  }, [query.data]);

  const allTopics = useMemo(() => {
    return [
      ...new Set(
        filterPairs
          .map((pair) => pair.topic)
          .filter((topic): topic is string => Boolean(topic)),
      ),
    ].sort();
  }, [filterPairs]);

  const allAuthors = useMemo(() => {
    return [
      ...new Set(
        filterPairs
          .map((pair) => pair.author)
          .filter((author): author is string => Boolean(author)),
      ),
    ].sort();
  }, [filterPairs]);

  const availableTopics = useMemo(() => {
    if (!selectedAuthor) return allTopics;

    return [
      ...new Set(
        filterPairs
          .filter((pair) => pair.author === selectedAuthor)
          .map((pair) => pair.topic)
          .filter((topic): topic is string => Boolean(topic)),
      ),
    ].sort();
  }, [filterPairs, selectedAuthor, allTopics]);

  const availableAuthors = useMemo(() => {
    if (!selectedTopic) return allAuthors;

    return [
      ...new Set(
        filterPairs
          .filter((pair) => pair.topic === selectedTopic)
          .map((pair) => pair.author)
          .filter((author): author is string => Boolean(author)),
      ),
    ].sort();
  }, [filterPairs, selectedTopic, allAuthors]);

  return {
    ...query,
    filterPairs,
    allTopics,
    allAuthors,
    availableTopics,
    availableAuthors,
  };
}
