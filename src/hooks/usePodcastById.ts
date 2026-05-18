// hooks/usePodcastById.ts
import { useQuery } from "@tanstack/react-query";
import type { PodcastType } from "@/constants/Types";
import { supabase } from "../../utils/supabase";
import { attachPodcastImageUrls } from "../../utils/podcastStorage";

export function usePodcastById(id: number | null | undefined) {
  return useQuery<PodcastType, Error>({
    queryKey: ["podcasts", "by-id", id],
    enabled: id != null,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("podcasts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      const [withImages] = attachPodcastImageUrls([data as PodcastType]);
      return withImages;
    },
    retry: 3,
    staleTime: 12 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}