import { useQuery } from "@tanstack/react-query";
import { supabase } from "../utils/supabase";
import { PodcastType } from "@/constants/Types";
import { useLanguage } from "../contexts/LanguageContext";

export function useSearchPodcasts(searchTerm: string) {
  const { lang } = useLanguage();
  const term = searchTerm.trim();

  return useQuery<PodcastType[], Error>({
    queryKey: ["search", "podcasts", lang, term],
    enabled: !!term && Boolean(lang),

    queryFn: async () => {
      if (!term) return [];
      const { data, error } = await supabase
        .from("podcasts")
        .select("*")
        .eq("language_code", lang)
        .or(`title.ilike.%${term}%,description.ilike.%${term}%`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },

    // Search-friendly cache settings
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: true, // rely on staleTime; set to "always" if you want a hard refresh
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 3,
    placeholderData: (prev) => prev, // keeps UI stable between terms
  });
}
