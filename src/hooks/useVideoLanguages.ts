import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "../../utils/supabase";

// RPC-basiert mit Fallback auf SELECT, falls die DB-Function noch nicht
// deployed ist.
async function fetchLanguagesViaRpc(): Promise<string[]> {
  const { data, error } = await supabase.rpc("video_distinct_languages");

  if (error) {
    // PGRST202 = function not found → Fallback
    if (error.code === "PGRST202" || error.code === "42883") {
      return fetchLanguagesFallback();
    }
    throw error;
  }

  return ((data ?? []) as { language_code: string }[])
    .map((row) => row.language_code)
    .filter(Boolean);
}

async function fetchLanguagesFallback(): Promise<string[]> {
  const { data, error } = await supabase
    .from("videos")
    .select("language_code");

  if (error) throw error;

  const set = new Set<string>();
  for (const row of (data ?? []) as { language_code: string | null }[]) {
    const code = row.language_code?.trim();
    if (code) set.add(code);
  }
  return [...set];
}

export function useVideoLanguages() {
  const query = useQuery<string[]>({
    queryKey: ["video_languages"],
    queryFn: fetchLanguagesViaRpc,
    staleTime: 12 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const languages = useMemo(
    () => (query.data ?? []).slice().sort(),
    [query.data],
  );

  return { ...query, languages };
}
