import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "../../utils/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { WithLangType } from "@/constants/Types";
import { useDataVersionStore } from "../../stores/dataVersionStore";
import { router } from "expo-router";

type SupabaseRealtimeContextType = Record<string, never>;

const SupabaseRealtimeContext = createContext<SupabaseRealtimeContextType>({});

export const SupabaseRealtimeProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const queryClient = useQueryClient();

  const incrementPodcastVersion =
    useDataVersionStore.getState().incrementPodcastVersion;

  const langFromPayload = useCallback((payload: any): string | undefined => {
    const next = (payload?.new as WithLangType) ?? undefined;
    const prev = (payload?.old as WithLangType) ?? undefined;

    return next?.language_code ?? prev?.language_code ?? undefined;
  }, []);

  const invalidateByLang = useCallback(
    async (baseKey: string, lang?: string) => {
      if (lang) {
        await queryClient.invalidateQueries({
          queryKey: [baseKey, lang],
          refetchType: "all",
        });
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: [baseKey],
        refetchType: "all",
      });
    },
    [queryClient]
  );

  useEffect(() => {
    const podcastChannel = supabase
      .channel("all_podcasts_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "podcasts",
        },
        async (payload) => {
          const lang = langFromPayload(payload);

          if (payload.eventType === "INSERT") {
            await invalidateByLang("podcasts", lang);
            incrementPodcastVersion();
            return;
          }

          if (payload.eventType === "UPDATE") {
            await invalidateByLang("podcasts", lang);
            incrementPodcastVersion();
            router.push("/home");
            return;
          }

          if (payload.eventType === "DELETE") {
            await invalidateByLang("podcasts", lang);
            incrementPodcastVersion();
            router.push("/home");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(podcastChannel).catch(console.error);
    };
  }, [incrementPodcastVersion, invalidateByLang, langFromPayload]);

  return (
    <SupabaseRealtimeContext.Provider value={{}}>
      {children}
    </SupabaseRealtimeContext.Provider>
  );
};

export const useSupabaseRealtime = () => useContext(SupabaseRealtimeContext);