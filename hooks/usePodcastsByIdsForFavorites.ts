import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import type { PodcastType } from "@/constants/Types";
import { supabase } from "../utils/supabase";
import { attachPodcastImageUrls } from "../utils/podcastStorage";

type UsePodcastsByIdsArgs = {
  ids: number[];
  language?: string | null;
};

export function usePodcastsByIdsForFavorites({
  ids,
  language = null,
}: UsePodcastsByIdsArgs) {
  const idsKey = useMemo(() => ids.join(","), [ids]);

  return useQuery<PodcastType[], Error>({
    queryKey: ["podcasts", "by-ids", language, idsKey],
    enabled: ids.length > 0,

    queryFn: async () => {
      let request = supabase
        .from("podcasts")
        .select("*")
        .in("id", ids)
        .order("created_at", { ascending: false });

      if (language !== null) {
        request = request.eq("language_code", language);
      }

      const { data, error } = await request;

      if (error) {
        throw error;
      }

      const rawRows = (data ?? []) as PodcastType[];

      return attachPodcastImageUrls(rawRows);
    },

    retry: 3,
    staleTime: 12 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}
