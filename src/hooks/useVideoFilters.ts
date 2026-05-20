import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "../../utils/supabase";
import { parseTopics } from "../../utils/videoTopics";

type UseVideoFiltersArgs = {
  language: string | null;
  selectedTopic: string | null;
  selectedAuthor: string | null;
};

type FilterPair = { topic: string | null; author: string | null };

// ---------------------------------------------------------------------------
// RPC-Pfad: schnell, weil Postgres-side distinct.
// ---------------------------------------------------------------------------

async function fetchTopicsRpc(lang: string | null): Promise<string[] | null> {
  const { data, error } = await supabase.rpc("video_distinct_topics", {
    p_lang: lang,
  });

  if (error) {
    if (error.code === "PGRST202" || error.code === "42883") return null;
    throw error;
  }
  return ((data ?? []) as { topic: string }[]).map((r) => r.topic);
}

async function fetchAuthorsRpc(lang: string | null): Promise<string[] | null> {
  const { data, error } = await supabase.rpc("video_distinct_authors", {
    p_lang: lang,
  });

  if (error) {
    if (error.code === "PGRST202" || error.code === "42883") return null;
    throw error;
  }
  return ((data ?? []) as { author: string }[]).map((r) => r.author);
}

// ---------------------------------------------------------------------------
// Fallback: SELECT auf alle Rows, distinct im Client. Nötig, wenn die RPCs
// noch nicht deployed sind oder Topic/Author voneinander abhängen.
// ---------------------------------------------------------------------------

async function fetchFilterPairsFallback(
  lang: string | null,
): Promise<FilterPair[]> {
  let request = supabase
    .from("videos")
    .select("video_topic, author_name");

  if (lang !== null) request = request.eq("language_code", lang);

  const { data, error } = await request;
  if (error) throw error;

  type Row = {
    video_topic: unknown;
    author_name: string | null;
  };

  return ((data ?? []) as unknown as Row[]).flatMap((row): FilterPair[] => {
    const topics = parseTopics(row.video_topic);
    const author = row.author_name ?? null;

    if (topics.length === 0) return [{ topic: null, author }];
    return topics.map((topic) => ({ topic, author }));
  });
}

type FilterData = {
  topics: string[];
  authors: string[];
  // Nur befüllt im Fallback-Pfad (für abhängige Filter).
  pairs: FilterPair[] | null;
};

async function fetchFilterData(lang: string | null): Promise<FilterData> {
  const [topics, authors] = await Promise.all([
    fetchTopicsRpc(lang),
    fetchAuthorsRpc(lang),
  ]);

  if (topics !== null && authors !== null) {
    return { topics, authors, pairs: null };
  }

  // RPCs (noch) nicht da → Fallback.
  const pairs = await fetchFilterPairsFallback(lang);

  const topicSet = new Set<string>();
  const authorSet = new Set<string>();
  for (const pair of pairs) {
    if (pair.topic) topicSet.add(pair.topic);
    if (pair.author) authorSet.add(pair.author);
  }

  return {
    topics: [...topicSet].sort(),
    authors: [...authorSet].sort(),
    pairs,
  };
}

export function useVideoFilters({
  language,
  selectedTopic,
  selectedAuthor,
}: UseVideoFiltersArgs) {
  const query = useQuery<FilterData>({
    queryKey: ["video_filter_pairs", language],
    queryFn: () => fetchFilterData(language),
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const allTopics = useMemo(
    () => query.data?.topics ?? [],
    [query.data?.topics],
  );
  const allAuthors = useMemo(
    () => query.data?.authors ?? [],
    [query.data?.authors],
  );
  const pairs = query.data?.pairs;

  // Abhängige Filter (Topic↔Author) funktionieren nur exakt, wenn wir die
  // Paar-Daten im Fallback-Pfad geladen haben. Im RPC-Pfad zeigen wir alle.
  const availableTopics = useMemo(() => {
    if (!selectedAuthor || !pairs) return allTopics;
    return [
      ...new Set(
        pairs
          .filter((p) => p.author === selectedAuthor)
          .map((p) => p.topic)
          .filter((t): t is string => Boolean(t)),
      ),
    ].sort();
  }, [allTopics, pairs, selectedAuthor]);

  const availableAuthors = useMemo(() => {
    if (!selectedTopic || !pairs) return allAuthors;
    return [
      ...new Set(
        pairs
          .filter((p) => p.topic === selectedTopic)
          .map((p) => p.author)
          .filter((a): a is string => Boolean(a)),
      ),
    ].sort();
  }, [allAuthors, pairs, selectedTopic]);

  return {
    ...query,
    allTopics,
    allAuthors,
    availableTopics,
    availableAuthors,
  };
}
