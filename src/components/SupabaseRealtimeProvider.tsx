// import React, {
//   createContext,
//   useCallback,
//   useContext,
//   useEffect,
//   ReactNode,
// } from "react";
// import { useQueryClient } from "@tanstack/react-query";
// import { router } from "expo-router";

// import { supabase } from "../../utils/supabase";
// import { useDataVersionStore } from "../../stores/dataVersionStore";

// type SupabaseRealtimeContextType = Record<string, never>;

// const SupabaseRealtimeContext = createContext<SupabaseRealtimeContextType>({});

// type PodcastRealtimeRow = {
//   id?: number;
//   language_code?: string | null;
//   image_filename?: string | null;
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

//   return (
//     <SupabaseRealtimeContext.Provider value={{}}>
//       {children}
//     </SupabaseRealtimeContext.Provider>
//   );
// };

// export const useSupabaseRealtime = () => useContext(SupabaseRealtimeContext);


import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { supabase } from "../../utils/supabase";
import { useDataVersionStore } from "../../stores/dataVersionStore";

type SupabaseRealtimeContextType = Record<string, never>;

const SupabaseRealtimeContext = createContext<SupabaseRealtimeContextType>({});

type PodcastRealtimeRow = {
  id?: number;
  language_code?: string | null;
  image_filename?: string | null;
};

type PaypalRealtimeRow = {
  id?: number;
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

  const invalidatePodcastQueries = useCallback(
    async (payload?: {
      new?: PodcastRealtimeRow;
      old?: PodcastRealtimeRow;
    }) => {
      const changedImageFilenames = [
        payload?.new?.image_filename,
        payload?.old?.image_filename,
      ].filter((filename): filename is string => Boolean(filename));

      const uniqueImageFilenames = [...new Set(changedImageFilenames)];

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["podcasts"],
          refetchType: "all",
        }),
        queryClient.invalidateQueries({
          queryKey: ["podcast_filter_pairs"],
          refetchType: "all",
        }),
        queryClient.invalidateQueries({
          queryKey: ["podcast_languages"],
          refetchType: "all",
        }),
        queryClient.invalidateQueries({
          queryKey: ["search", "podcasts"],
          refetchType: "all",
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

  useEffect(() => {
    const podcastChannel = supabase
      .channel("podcasts_realtime_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "podcasts",
        },
        async (payload) => {
          const normalizedPayload = {
            new: payload.new as PodcastRealtimeRow | undefined,
            old: payload.old as PodcastRealtimeRow | undefined,
          };
         
          await invalidatePodcastQueries(normalizedPayload);
          incrementPodcastVersion();
          if (payload.eventType === "DELETE") {
            router.replace("/home");
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(podcastChannel).catch(console.error);
    };
  }, [incrementPodcastVersion, invalidatePodcastQueries]);

  useEffect(() => {
    const paypalChannel = supabase
      .channel("paypal_realtime_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "paypal",
        },
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
              // Row exists but link was cleared — treat like a delete
              await AsyncStorage.removeItem("paypal");
            }
          } catch (err) {
            console.warn("Failed to sync PayPal link from realtime:", err);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(paypalChannel).catch(console.error);
    };
  }, []);

  return (
    <SupabaseRealtimeContext.Provider value={{}}>
      {children}
    </SupabaseRealtimeContext.Provider>
  );
};

export const useSupabaseRealtime = () => useContext(SupabaseRealtimeContext);