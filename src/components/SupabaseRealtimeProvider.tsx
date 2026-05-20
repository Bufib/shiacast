import { useCallback, useEffect, useId, useRef, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { supabase } from "../../utils/supabase";
import { useDataVersionStore } from "../../stores/dataVersionStore";

const VIDEO_INVALIDATION_DEBOUNCE_MS = 300;

type PaypalRealtimeRow = {
  paypal_link?: string | null;
};

export const SupabaseRealtimeProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const queryClient = useQueryClient();
  const incrementVideoVersion = useDataVersionStore(
    (state) => state.incrementVideoVersion,
  );
  // Eindeutiger Suffix pro Provider-Instanz – schützt vor Channel-Namen-Kollisionen.
  const instanceId = useId().replace(/[^a-zA-Z0-9]/g, "");

  const invalidateVideoQueries = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["videos"],
        refetchType: "active",
      }),
      queryClient.invalidateQueries({
        queryKey: ["video_filter_pairs"],
        refetchType: "active",
      }),
      queryClient.invalidateQueries({
        queryKey: ["video_languages"],
        refetchType: "active",
      }),
    ]);
  }, [queryClient]);

  const pendingDeleteRedirectRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushVideoChanges = useCallback(() => {
    const shouldRedirect = pendingDeleteRedirectRef.current;
    pendingDeleteRedirectRef.current = false;
    debounceTimerRef.current = null;

    invalidateVideoQueries()
      .then(() => {
        incrementVideoVersion();
        if (shouldRedirect) {
          router.replace("/home");
        }
      })
      .catch((err) => console.warn("Failed to flush video changes:", err));
  }, [invalidateVideoQueries, incrementVideoVersion]);

  const scheduleVideoFlush = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(
      flushVideoChanges,
      VIDEO_INVALIDATION_DEBOUNCE_MS,
    );
  }, [flushVideoChanges]);

  useEffect(() => {
    let hasSubscribedBefore = false;

    const videoChannel = supabase
      .channel(`videos_authors_realtime_changes_${instanceId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "videos" },
        (payload) => {
          try {
            if (payload.eventType === "DELETE") {
              pendingDeleteRedirectRef.current = true;
            }

            scheduleVideoFlush();
          } catch (err) {
            console.warn("Failed to handle video realtime change:", err);
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "authors" },
        () => {
          try {
            scheduleVideoFlush();
          } catch (err) {
            console.warn("Failed to handle author realtime change:", err);
          }
        },
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          if (hasSubscribedBefore) {
            if (debounceTimerRef.current) {
              clearTimeout(debounceTimerRef.current);
              debounceTimerRef.current = null;
            }
            pendingDeleteRedirectRef.current = false;

            invalidateVideoQueries()
              .then(() => incrementVideoVersion())
              .catch((e) =>
                console.warn("Failed to refetch videos after reconnect:", e),
              );
          }
          hasSubscribedBefore = true;
        } else if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT" ||
          status === "CLOSED"
        ) {
          console.warn(`Video realtime channel status: ${status}`, err);
        }
      });

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      supabase.removeChannel(videoChannel).catch(console.error);
    };
  }, [
    instanceId,
    incrementVideoVersion,
    invalidateVideoQueries,
    queryClient,
    scheduleVideoFlush,
  ]);

  useEffect(() => {
    const fetchPaypalLink = async () => {
      try {
        const { data, error } = await supabase
          .from("paypal")
          .select("paypal_link")
          .maybeSingle();

        if (error) {
          console.warn("Failed to fetch PayPal link:", error.message);
          return;
        }

        if (data?.paypal_link) {
          await AsyncStorage.setItem("paypal", data.paypal_link);
        } else {
          await AsyncStorage.removeItem("paypal");
        }
      } catch (err) {
        console.warn("Failed to fetch/store PayPal link:", err);
      }
    };

    const paypalChannel = supabase
      .channel(`paypal_realtime_changes_${instanceId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "paypal" },
        async (payload) => {
          try {
            if (payload.eventType === "DELETE") {
              await AsyncStorage.removeItem("paypal");
              return;
            }

            const newRow = payload.new as PaypalRealtimeRow | undefined;

            if (newRow?.paypal_link) {
              await AsyncStorage.setItem("paypal", newRow.paypal_link);
            } else {
              await AsyncStorage.removeItem("paypal");
            }
          } catch (err) {
            console.warn("Failed to sync PayPal link from realtime:", err);
          }
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          fetchPaypalLink();
        }
      });

    return () => {
      supabase.removeChannel(paypalChannel).catch(console.error);
    };
  }, [instanceId]);

  return <>{children}</>;
};
