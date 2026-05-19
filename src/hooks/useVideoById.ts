import { useQuery } from "@tanstack/react-query";
import type { VideoType } from "@/constants/Types";
import { supabase } from "../../utils/supabase";
import { attachVideoImageUrls } from "../../utils/videoStorage";

export function useVideoById(id: number | null | undefined) {
  return useQuery<VideoType, Error>({
    queryKey: ["videos", "by-id", id],
    enabled: id != null,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("podcasts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      const [withImages] = attachVideoImageUrls([data as VideoType]);
      return withImages;
    },
    retry: 3,
    staleTime: 12 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}
