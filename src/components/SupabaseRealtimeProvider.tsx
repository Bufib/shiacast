// import React, {
//   createContext,
//   useCallback,
//   useContext,
//   useEffect,
//   ReactNode,
// } from "react";
// import { useQueryClient } from "@tanstack/react-query";
// import { router } from "expo-router";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// import { supabase } from "../../utils/supabase";
// import { useDataVersionStore } from "../../stores/dataVersionStore";

// type SupabaseRealtimeContextType = Record<string, never>;

// const SupabaseRealtimeContext = createContext<SupabaseRealtimeContextType>({});

// type PodcastRealtimeRow = {
//   id?: number;
//   language_code?: string | null;
//   image_filename?: string | null;
// };

// type PaypalRealtimeRow = {
//   id?: number;
//   paypal_link?: string | null;
// };

// export const SupabaseRealtimeProvider = ({
//   children,
// }: {
//   children: ReactNode;
// }) => {
//   const queryClient = useQueryClient();
//   const incrementPodcastVersion = useDataVersionStore(
//     (state) => state.incrementPodcastVersion,
//   );

//   const invalidatePodcastQueries = useCallback(
//     async (payload?: {
//       new?: PodcastRealtimeRow;
//       old?: PodcastRealtimeRow;
//     }) => {
//       const changedImageFilenames = [
//         payload?.new?.image_filename,
//         payload?.old?.image_filename,
//       ].filter((filename): filename is string => Boolean(filename));

//       const uniqueImageFilenames = [...new Set(changedImageFilenames)];

//       await Promise.all([
//         queryClient.invalidateQueries({
//           queryKey: ["podcasts"],
//           refetchType: "all",
//         }),
//         queryClient.invalidateQueries({
//           queryKey: ["podcast_filter_pairs"],
//           refetchType: "all",
//         }),
//         queryClient.invalidateQueries({
//           queryKey: ["podcast_languages"],
//           refetchType: "all",
//         }),
//         queryClient.invalidateQueries({
//           queryKey: ["search", "podcasts"],
//           refetchType: "all",
//         }),
//         ...uniqueImageFilenames.map((filename) =>
//           queryClient.invalidateQueries({
//             queryKey: ["podcast_cover", filename],
//             refetchType: "all",
//           }),
//         ),
//       ]);
//     },
//     [queryClient],
//   );

//   useEffect(() => {
//     const podcastChannel = supabase
//       .channel("podcasts_realtime_changes")
//       .on(
//         "postgres_changes",
//         {
//           event: "*",
//           schema: "public",
//           table: "podcasts",
//         },
//         async (payload) => {
//           const normalizedPayload = {
//             new: payload.new as PodcastRealtimeRow | undefined,
//             old: payload.old as PodcastRealtimeRow | undefined,
//           };

//           await invalidatePodcastQueries(normalizedPayload);
//           incrementPodcastVersion();
//           if (payload.eventType === "DELETE") {
//             router.replace("/home");
//           }
//         },
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(podcastChannel).catch(console.error);
//     };
//   }, [incrementPodcastVersion, invalidatePodcastQueries]);

//   useEffect(() => {
//     const paypalChannel = supabase
//       .channel("paypal_realtime_changes")
//       .on(
//         "postgres_changes",
//         {
//           event: "*",
//           schema: "public",
//           table: "paypal",
//         },
//         async (payload) => {
//           try {
//             if (payload.eventType === "DELETE") {
//               await AsyncStorage.removeItem("paypal");
//               return;
//             }

//             const newRow = payload.new as PaypalRealtimeRow | undefined;

//             if (newRow?.paypal_link) {
//               await AsyncStorage.setItem("paypal", newRow.paypal_link);
//             } else {
//               // Row exists but link was cleared — treat like a delete
//               await AsyncStorage.removeItem("paypal");
//             }
//           } catch (err) {
//             console.warn("Failed to sync PayPal link from realtime:", err);
//           }
//         },
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(paypalChannel).catch(console.error);
//     };
//   }, []);

//   return (
//     <SupabaseRealtimeContext.Provider value={{}}>
//       {children}
//     </SupabaseRealtimeContext.Provider>
//   );
// };

// export const useSupabaseRealtime = () => useContext(SupabaseRealtimeContext);

import { useCallback, useEffect, useId, useRef, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { supabase } from "../../utils/supabase";
import { useDataVersionStore } from "../../stores/dataVersionStore";

const PODCAST_INVALIDATION_DEBOUNCE_MS = 300;

type PodcastRealtimeRow = {
  id?: number;
  language_code?: string | null;
  image_filename?: string | null;
};

type PaypalRealtimeRow = {
  paypal_link?: string | null;
};

export const SupabaseRealtimeProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const queryClient = useQueryClient();
  const incrementPodcastVersion = useDataVersionStore(
    (state) => state.incrementPodcastVersion,
  );
  // Eindeutiger Suffix pro Provider-Instanz – schützt vor Channel-Namen-Kollisionen.
  // useId enthält ':' – für Channel-Namen rausstrippen.
  const instanceId = useId().replace(/[^a-zA-Z0-9]/g, "");

  const invalidatePodcastQueries = useCallback(
    async (changedImageFilenames: string[] = []) => {
      const uniqueImageFilenames = [
        ...new Set(changedImageFilenames.filter(Boolean)),
      ];

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["podcasts"],
          refetchType: "active",
        }),
        queryClient.invalidateQueries({
          queryKey: ["podcast_filter_pairs"],
          refetchType: "active",
        }),
        queryClient.invalidateQueries({
          queryKey: ["podcast_languages"],
          refetchType: "active",
        }),
        queryClient.invalidateQueries({
          queryKey: ["search", "podcasts"],
          refetchType: "active",
        }),
        ...uniqueImageFilenames.map((filename) =>
          queryClient.invalidateQueries({
            queryKey: ["podcast_cover", filename],
            refetchType: "all",
          }),
        ),
      ]);
    },
    [queryClient],
  );

  // Debounce-State für Podcast-Realtime-Events.
  const pendingFilenamesRef = useRef<Set<string>>(new Set());
  const pendingDeleteRedirectRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushPodcastChanges = useCallback(() => {
    const filenames = Array.from(pendingFilenamesRef.current);
    const shouldRedirect = pendingDeleteRedirectRef.current;
    pendingFilenamesRef.current.clear();
    pendingDeleteRedirectRef.current = false;
    debounceTimerRef.current = null;

    invalidatePodcastQueries(filenames)
      .then(() => {
        incrementPodcastVersion();
        if (shouldRedirect) {
          router.replace("/home");
        }
      })
      .catch((err) => console.warn("Failed to flush podcast changes:", err));
  }, [invalidatePodcastQueries, incrementPodcastVersion]);

  const schedulePodcastFlush = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(
      flushPodcastChanges,
      PODCAST_INVALIDATION_DEBOUNCE_MS,
    );
  }, [flushPodcastChanges]);

  useEffect(() => {
    let hasSubscribedBefore = false;

    const podcastChannel = supabase
      .channel(`podcasts_realtime_changes_${instanceId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "podcasts" },
        (payload) => {
          try {
            const newRow = payload.new as PodcastRealtimeRow | undefined;
            const oldRow = payload.old as PodcastRealtimeRow | undefined;

            if (newRow?.image_filename) {
              pendingFilenamesRef.current.add(newRow.image_filename);
            }
            if (oldRow?.image_filename) {
              pendingFilenamesRef.current.add(oldRow.image_filename);
            }
            if (payload.eventType === "DELETE") {
              pendingDeleteRedirectRef.current = true;
            }

            schedulePodcastFlush();
          } catch (err) {
            console.warn("Failed to handle podcast realtime change:", err);
          }
        },
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          if (hasSubscribedBefore) {
            // Pending Debounce wegwerfen – Reconnect macht eh Full Refresh.
            if (debounceTimerRef.current) {
              clearTimeout(debounceTimerRef.current);
              debounceTimerRef.current = null;
            }
            pendingFilenamesRef.current.clear();
            pendingDeleteRedirectRef.current = false;

            Promise.all([
              invalidatePodcastQueries(),
              queryClient.invalidateQueries({
                queryKey: ["podcast_cover"],
                refetchType: "all",
              }),
            ])
              .then(() => incrementPodcastVersion())
              .catch((e) =>
                console.warn("Failed to refetch podcasts after reconnect:", e),
              );
          }
          hasSubscribedBefore = true;
        } else if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT" ||
          status === "CLOSED"
        ) {
          console.warn(`Podcast realtime channel status: ${status}`, err);
        }
      });

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      supabase.removeChannel(podcastChannel).catch(console.error);
    };
  }, [
    instanceId,
    incrementPodcastVersion,
    invalidatePodcastQueries,
    queryClient,
    schedulePodcastFlush,
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
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          fetchPaypalLink();
        } else if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT" ||
          status === "CLOSED"
        ) {
        }
      });

    return () => {
      supabase.removeChannel(paypalChannel).catch(console.error);
    };
  }, [instanceId]);

  return <>{children}</>;
};
