import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "../utils/supabase";

type PodcastLanguageRow = {
  language_code: string | null;
};

export function usePodcastLanguages() {
  const query = useQuery<PodcastLanguageRow[]>({
    queryKey: ["podcast_languages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("podcasts")
        .select("language_code");

      if (error) throw error;

      return data ?? [];
    },
    staleTime: 12 * 60 * 60 * 1000,
  });

  const languages = useMemo(() => {
    return [
      ...new Set(
        (query.data ?? [])
          .map((row) => row.language_code?.trim())
          .filter((language): language is string => Boolean(language)),
      ),
    ].sort();
  }, [query.data]);

  return {
    ...query,
    languages,
  };
}
