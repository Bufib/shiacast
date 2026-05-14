// // src/components/podcast-player/usePodcastPlayer.ts

// import { useEffect, useMemo, useRef, useState } from "react";
// import { Animated, Easing } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Asset } from "expo-asset";
// import type { AudioSource } from "expo-audio";
// import { useQuery } from "@tanstack/react-query";

// import type { PodcastPlayerPropsType, SavedProgress } from "@/constants/Types";
// import { useLanguage } from "../../contexts/LanguageContext";
// import { useGlobalPlayer } from "../../player/useGlobalPlayer";
// import { getSignedImageUrl } from "../../utils/podcastStorage";
// import { usePodcastDownloads } from "./usePodcastsDownloads";
// import { usePodcastDownloadStore } from "../../stores/usePodcastDownloadStore";
// import { useDataVersionStore } from "../../stores/dataVersionStore";
// import {
//   isPodcastFavorited,
//   togglePodcastFavorite,
// } from "../../utils/favorites";
// import {
//   useIsPodcastListened,
//   usePodcastListenedStore,
// } from "./usePodcastListenedStore";

// const LOCAL_PODCAST_ARTWORK = require("@/assets/images/icon.png");

// function getLastTimeKey(id: string | number) {
//   return `podcast:lastTime:${id}`;
// }

// function createAudioSource(uri: string): AudioSource {
//   return { uri };
// }

// function formatPodcastTime(seconds?: number | null): string {
//   if (!seconds || seconds < 0 || Number.isNaN(seconds)) return "0:00";

//   const totalSeconds = Math.floor(seconds);
//   const hours = Math.floor(totalSeconds / 3600);
//   const minutes = Math.floor((totalSeconds % 3600) / 60);
//   const remainingSeconds = totalSeconds % 60;

//   if (hours > 0) {
//     return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
//       .toString()
//       .padStart(2, "0")}`;
//   }

//   return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
// }

// export function usePodcastPlayer(podcast: PodcastPlayerPropsType["podcast"]) {
//   const { lang } = useLanguage();

//   const logoAsset = useMemo(() => Asset.fromModule(LOCAL_PODCAST_ARTWORK), []);

//   const { data: coverUrl } = useQuery({
//     queryKey: ["podcast_cover", podcast?.image_filename],
//     queryFn: () => getSignedImageUrl(podcast.image_filename as string),
//     enabled: Boolean(podcast?.image_filename),
//     staleTime: 12 * 60 * 60 * 1000,
//     gcTime: 24 * 60 * 60 * 1000,
//   });

//   const artworkUri: string | undefined =
//     coverUrl ?? logoAsset?.uri ?? undefined;

//   const coverSource = coverUrl ? { uri: coverUrl } : LOCAL_PODCAST_ARTWORK;

//   const {
//     isPlaying,
//     position,
//     duration,
//     status,
//     rate,
//     podcastId,
//     currentUri,
//     currentKey,
//     load,
//     play,
//     pause,
//     toggle,
//     seekBy,
//     setPosition,
//     setRate,
//     stopAndKeepSource,
//     stopAndUnload,
//   } = useGlobalPlayer();

//   const {
//     download,
//     getCachedUri,
//     getRemoteUrl,
//     deleteFromCache,
//     cancelDownload: cancelActiveDownload,
//   } = usePodcastDownloads(podcast.language_code ?? lang);

//   const downloadKey = String(podcast?.id ?? podcast?.filename ?? "");

//   const isDownloading = usePodcastDownloadStore((state) =>
//     state.isDownloading(downloadKey),
//   );

//   const downloadProgress = usePodcastDownloadStore((state) =>
//     state.getProgress(downloadKey),
//   );

//   const setDownloading = usePodcastDownloadStore(
//     (state) => state.setDownloading,
//   );
//   const setProgress = usePodcastDownloadStore((state) => state.setProgress);
//   const resetDownloadState = usePodcastDownloadStore((state) => state.reset);

//   const incrementPodcastFavoritesVersion = useDataVersionStore(
//     (state) => state.incrementPodcastFavoritesVersion,
//   );

//   const [isFavorite, setIsFavorite] = useState(false);
//   const [playerError, setPlayerError] = useState<string | null>(null);
//   const [, setIsSeeking] = useState(false);
//   const [showSpeedMenu, setShowSpeedMenu] = useState(false);
//   const [isStreamLoading, setIsStreamLoading] = useState(false);
//   const [, setIsStream] = useState(false);
//   const [, setHasDownloaded] = useState(false);
//   const [lastTime, setLastTime] = useState<SavedProgress | null>(null);
//   const [cachedUri, setCachedUri] = useState<string | null>(null);

//   const isListened = useIsPodcastListened(podcast?.id, lang);
//   const toggleListenedAction = usePodcastListenedStore((s) => s.toggleListened);

//   const onPressToggleListened = () => {
//     if (!podcast?.id) return;
//     toggleListenedAction(podcast.id, lang);
//   };

//   const fadeAnim = useMemo(() => new Animated.Value(0), []);
//   const slideAnim = useMemo(() => new Animated.Value(50), []);

//   const justLoadedRef = useRef(false);
//   const loadedPodcastIdRef = useRef<string | number | null>(null);
//   const manuallyLoadedRef = useRef(false);
//   const wasPlayingRef = useRef(false);
//   const startPosRef = useRef(0);

//   const isThisEpisodeLoaded =
//     podcastId === podcast?.id &&
//     Boolean(currentUri || currentKey) &&
//     status !== "stopped" &&
//     status !== "idle";

//   const showPlaybackControls = isThisEpisodeLoaded && !playerError;

//   const isLoading = download.isPending || isStreamLoading || isDownloading;

//   const controlsDisabled = isLoading || Boolean(playerError);

//   const shouldShowInitial = !isThisEpisodeLoaded && !isLoading && !playerError;

//   const showDownloadProgress = isDownloading;

//   const showInitialButtons = shouldShowInitial && !cachedUri;

//   const loadingTranslationKey = download.isPending
//     ? "preparing"
//     : isStreamLoading
//       ? "loading_stream"
//       : "downloading";

//   useEffect(() => {
//     let isAlive = true;

//     async function loadCachedFile() {
//       if (!podcast?.filename) {
//         if (isAlive) setCachedUri(null);
//         return;
//       }

//       try {
//         const uri = await getCachedUri(podcast.filename);
//         if (isAlive) setCachedUri(uri ?? null);
//       } catch {
//         if (isAlive) setCachedUri(null);
//       }
//     }

//     loadCachedFile();

//     return () => {
//       isAlive = false;
//     };
//   }, [podcast?.id, podcast?.filename, getCachedUri]);

//   useEffect(() => {
//     let isMounted = true;

//     async function loadFavoriteState() {
//       if (!podcast?.id) return;

//       try {
//         const result = await isPodcastFavorited(podcast.id, lang);
//         if (isMounted) setIsFavorite(result);
//       } catch {
//         // Keep UI stable if favorite lookup fails.
//       }
//     }

//     loadFavoriteState();

//     return () => {
//       isMounted = false;
//     };
//   }, [podcast?.id, lang]);

//   useEffect(() => {
//     if (shouldShowInitial && !justLoadedRef.current) {
//       stopAndUnload();
//     }

//     if (isThisEpisodeLoaded) {
//       justLoadedRef.current = false;
//     }
//   }, [shouldShowInitial, isThisEpisodeLoaded, podcast?.id, stopAndUnload]);

//   useEffect(() => {
//     if (manuallyLoadedRef.current) {
//       manuallyLoadedRef.current = false;
//       return;
//     }

//     if (
//       shouldShowInitial &&
//       cachedUri &&
//       loadedPodcastIdRef.current !== podcast.id
//     ) {
//       loadedPodcastIdRef.current = podcast.id;

//       load(createAudioSource(cachedUri), {
//         autoplay: false,
//         title: podcast.title,
//         artwork: artworkUri,
//         podcastId: podcast.id,
//         filename: podcast.filename,
//         rate,
//       }).catch((error) => {
//         setPlayerError(error?.message ?? "Player error");
//       });
//     }

//     if (!shouldShowInitial) {
//       loadedPodcastIdRef.current = null;
//     }
//   }, [
//     shouldShowInitial,
//     cachedUri,
//     podcast.id,
//     podcast.filename,
//     podcast.title,
//     rate,
//     artworkUri,
//     load,
//   ]);

//   useEffect(() => {
//     const entranceAnimation = Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 800,
//         useNativeDriver: true,
//       }),
//       Animated.timing(slideAnim, {
//         toValue: 0,
//         duration: 600,
//         easing: Easing.out(Easing.cubic),
//         useNativeDriver: true,
//       }),
//     ]);

//     entranceAnimation.start();

//     return () => {
//       entranceAnimation.stop();
//     };
//   }, [fadeAnim, slideAnim]);

//   useEffect(() => {
//     let isMounted = true;

//     async function loadLastTime() {
//       if (!podcast?.id) {
//         if (isMounted) setLastTime(null);
//         return;
//       }

//       try {
//         const json = await AsyncStorage.getItem(getLastTimeKey(podcast.id));

//         if (!json) {
//           if (isMounted) setLastTime(null);
//           return;
//         }

//         const {
//           position: savedPosition = 0,
//           duration: savedDuration = 0,
//           savedAt = Date.now(),
//         } = JSON.parse(json) || {};

//         if (isMounted) {
//           setLastTime({
//             position: savedPosition,
//             duration: savedDuration,
//             savedAt,
//           });
//         }
//       } catch {
//         // Ignore read errors to keep the player stable.
//       }
//     }

//     loadLastTime();

//     return () => {
//       isMounted = false;
//     };
//   }, [podcast?.id]);

//   const onPressToggleFavorite = async () => {
//     if (!podcast?.id) return;

//     try {
//       const nextFavoriteState = await togglePodcastFavorite(podcast.id, lang);
//       setIsFavorite(nextFavoriteState);
//       incrementPodcastFavoritesVersion();
//     } catch {
//       // Keep UI stable if favorite toggle fails.
//     }
//   };

//   const handleStream = async () => {
//     setPlayerError(null);

//     if (!podcast?.filename) {
//       setPlayerError("Audio path missing.");
//       return;
//     }

//     try {
//       setIsStreamLoading(true);
//       setIsStream(true);

//       const remoteUrl = await getRemoteUrl(podcast.filename);
//       if (!remoteUrl) {
//         setPlayerError("Cannot create stream URL.");
//         setIsStream(false);
//         return;
//       }
//       await load(createAudioSource(remoteUrl), {
//         autoplay: true,
//         title: podcast.title,
//         artwork: artworkUri,
//         podcastId: podcast.id,
//         filename: podcast.filename,
//         rate,
//       });
//     } catch (error: any) {
//       console.log("[stream error]", error);
//       setPlayerError(error?.message ?? "Player error");
//       setIsStream(false);
//     } finally {
//       setIsStreamLoading(false);
//     }
//   };

//   const handleDownload = async () => {
//     pause();
//     setPlayerError(null);

//     if (!podcast?.filename || !downloadKey) {
//       setPlayerError("Audio path missing.");
//       return;
//     }

//     try {
//       setIsStream(false);
//       setDownloading(downloadKey, true);
//       setProgress(downloadKey, 0);

//       const localUri = await download.mutateAsync({
//         filename: podcast.filename,
//         onProgress: (progress) => setProgress(downloadKey, progress),
//       });

//       setCachedUri(localUri);

//       manuallyLoadedRef.current = true;
//       justLoadedRef.current = true;

//       load(createAudioSource(localUri), {
//         autoplay: false,
//         title: podcast.title,
//         artwork: artworkUri,
//         podcastId: podcast.id,
//         filename: podcast.filename,
//         rate,
//       }).catch((error) => {
//         justLoadedRef.current = false;
//         setPlayerError(error?.message ?? "Player error");
//       });

//       setHasDownloaded(true);
//     } catch (error: any) {
//       if (
//         error?.name !== "CancelledError" &&
//         error?.message !== "Download cancelled"
//       ) {
//         setPlayerError(error?.message ?? "Download failed");
//       }

//       setHasDownloaded(false);
//       setProgress(downloadKey, 0);
//       justLoadedRef.current = false;
//     } finally {
//       setDownloading(downloadKey, false);
//       resetDownloadState(downloadKey);
//     }
//   };

//   const togglePlayPause = () => {
//     if (playerError || !isThisEpisodeLoaded) return;

//     toggle();
//   };

//   const goBack = () => {
//     if (!isThisEpisodeLoaded) return;

//     seekBy(-10);
//   };

//   const goForward = () => {
//     if (!isThisEpisodeLoaded) return;

//     seekBy(10);
//   };

//   const stopPlayback = async () => {
//     if (!isThisEpisodeLoaded) return;

//     await stopAndKeepSource();
//   };

//   const handleLastTime = async () => {
//     if (!podcast?.id) return;

//     try {
//       const payload = {
//         podcastId: podcast.id,
//         title: podcast.title ?? null,
//         filename: podcast.filename ?? null,
//         uri: currentUri ?? null,
//         key: currentKey ?? null,
//         position: typeof position === "number" ? position : 0,
//         duration: typeof duration === "number" ? duration : 0,
//         rate: typeof rate === "number" ? rate : 1,
//         savedAt: Date.now(),
//       };

//       await AsyncStorage.setItem(
//         getLastTimeKey(podcast.id),
//         JSON.stringify(payload),
//       );

//       setLastTime({
//         position: payload.position,
//         duration: payload.duration,
//         savedAt: payload.savedAt,
//       });
//     } catch {
//       setPlayerError("Could not save last time.");
//     }
//   };

//   const restoreLastTime = () => {
//     if (!lastTime) return;

//     setPosition(lastTime.position);
//   };

//   const resetDownloadUI = () => {
//     resetDownloadState(downloadKey);
//     download.reset();

//     setIsStreamLoading(false);
//     setIsStream(false);
//     setHasDownloaded(false);
//     setPlayerError(null);

//     manuallyLoadedRef.current = false;
//     loadedPodcastIdRef.current = null;
//     justLoadedRef.current = false;
//   };

//   const cancelDownload = async () => {
//     await cancelActiveDownload();
//     resetDownloadUI();
//   };

//   const handleDeleteFromCache = async () => {
//     if (!podcast?.filename) return;

//     const deleted = await deleteFromCache(podcast.filename);

//     if (deleted) {
//       setCachedUri(null);
//       stopAndUnload();
//     }
//   };

//   const onSliderStart = () => {
//     wasPlayingRef.current = isPlaying;
//     pause();
//     setIsSeeking(true);
//     startPosRef.current = position || 0;
//   };

//   const onSliderComplete = (value: number) => {
//     setIsSeeking(false);

//     const delta = value - startPosRef.current;

//     if (Math.abs(delta) < 1) {
//       seekBy(delta);
//     } else {
//       setPosition(value);
//     }

//     if (wasPlayingRef.current) {
//       play();
//     }
//   };

//   return {
//     coverSource,
//     isFavorite,
//     playerError,
//     isPlaying,
//     position,
//     duration,
//     rate,
//     cachedUri,
//     lastTime,
//     isLoading,
//     isDownloading,
//     downloadProgress,
//     showPlaybackControls,
//     showInitialButtons,
//     showDownloadProgress,
//     controlsDisabled,
//     showSpeedMenu,
//     loadingTranslationKey,
//     fadeAnim,
//     slideAnim,
//     setShowSpeedMenu,
//     setRate,
//     handleStream,
//     handleDownload,
//     cancelDownload,
//     handleDeleteFromCache,
//     onPressToggleFavorite,
//     handleLastTime,
//     restoreLastTime,
//     togglePlayPause,
//     goBack,
//     goForward,
//     stopPlayback,
//     onSliderStart,
//     onSliderComplete,
//     formatTime: formatPodcastTime,
//     isListened,
//     onPressToggleListened,
//   };
// }

// src/components/podcast-player/usePodcastPlayer.ts

import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Asset } from "expo-asset";
import type { AudioSource } from "expo-audio";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";

import type { PodcastPlayerPropsType, SavedProgress } from "@/constants/Types";
import { useLanguage } from "../../contexts/LanguageContext";
import { useGlobalPlayer } from "../../player/useGlobalPlayer";
import { getImageUrl } from "../../utils/podcastStorage";
import { usePodcastDownloads } from "./usePodcastsDownloads";
import { usePodcastDownloadStore } from "../../stores/usePodcastDownloadStore";
import { useDataVersionStore } from "../../stores/dataVersionStore";
import {
  isPodcastFavorited,
  togglePodcastFavorite,
} from "../../utils/favorites";
import {
  useIsPodcastListened,
  usePodcastListenedStore,
} from "./usePodcastListenedStore";
import { useLastPlayedPodcastStore } from "../../stores/useLastPlayedPodcastStore";

const LOCAL_PODCAST_ARTWORK = require("@/assets/images/icon.png");

function getLastTimeKey(id: string | number) {
  return `podcast:lastTime:${id}`;
}

function createAudioSource(uri: string): AudioSource {
  return { uri };
}

function formatPodcastTime(seconds?: number | null): string {
  if (!seconds || seconds < 0 || Number.isNaN(seconds)) return "0:00";

  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function usePodcastPlayer(podcast: PodcastPlayerPropsType["podcast"]) {
  const { lang } = useLanguage();
  const { t } = useTranslation();

  const logoAsset = useMemo(() => Asset.fromModule(LOCAL_PODCAST_ARTWORK), []);

  const { data: coverUrl } = useQuery({
    queryKey: ["podcast_cover", podcast?.image_filename],
    queryFn: () => getImageUrl(podcast.image_filename as string),
    enabled: Boolean(podcast?.image_filename),
    staleTime: 12 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });

  const artworkUri: string | undefined =
    coverUrl ?? logoAsset?.uri ?? undefined;

  const coverSource = coverUrl ? { uri: coverUrl } : LOCAL_PODCAST_ARTWORK;

  const {
    isPlaying,
    position,
    duration,
    status,
    rate,
    podcastId,
    currentUri,
    currentKey,
    load,
    play,
    pause,
    toggle,
    seekBy,
    setPosition,
    setRate,
    stopAndKeepSource,
    stopAndUnload,
  } = useGlobalPlayer();

  const {
    download,
    getCachedUri,
    getRemoteUrl,
    deleteFromCache,
    cancelDownload: cancelActiveDownload,
  } = usePodcastDownloads(podcast.language_code ?? lang);

  const downloadKey = String(podcast?.id ?? podcast?.filename ?? "");

  const isDownloading = usePodcastDownloadStore((state) =>
    state.isDownloading(downloadKey),
  );

  const downloadProgress = usePodcastDownloadStore((state) =>
    state.getProgress(downloadKey),
  );

  const setDownloading = usePodcastDownloadStore(
    (state) => state.setDownloading,
  );
  const setProgress = usePodcastDownloadStore((state) => state.setProgress);
  const resetDownloadState = usePodcastDownloadStore((state) => state.reset);

  const incrementPodcastFavoritesVersion = useDataVersionStore(
    (state) => state.incrementPodcastFavoritesVersion,
  );

  const [isFavorite, setIsFavorite] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [, setIsSeeking] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isStreamLoading, setIsStreamLoading] = useState(false);
  const [, setIsStream] = useState(false);
  const [, setHasDownloaded] = useState(false);
  const [lastTime, setLastTime] = useState<SavedProgress | null>(null);
  const [cachedUri, setCachedUri] = useState<string | null>(null);

  const isListened = useIsPodcastListened(podcast?.id, lang);
  const toggleListenedAction = usePodcastListenedStore((s) => s.toggleListened);

  const onPressToggleListened = () => {
    if (!podcast?.id) return;

    const willBeListened = !isListened;

    toggleListenedAction(podcast.id, lang);

    Toast.show({
      type: willBeListened ? "success" : "info",
      text1: willBeListened
        ? t("marked_as_listened")
        : t("unmarked_as_listened"),
      visibilityTime: 2000,
      position: "top",
    });
  };

  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const slideAnim = useMemo(() => new Animated.Value(50), []);

  const justLoadedRef = useRef(false);
  const loadedPodcastIdRef = useRef<string | number | null>(null);
  const manuallyLoadedRef = useRef(false);
  const wasPlayingRef = useRef(false);
  const startPosRef = useRef(0);
const setLastPlayed = useLastPlayedPodcastStore((s) => s.setLastPlayed);
  const isThisEpisodeLoaded =
    podcastId === podcast?.id &&
    Boolean(currentUri || currentKey) &&
    status !== "stopped" &&
    status !== "idle";

  const showPlaybackControls = isThisEpisodeLoaded && !playerError;

  const isLoading = download.isPending || isStreamLoading || isDownloading;

  const controlsDisabled = isLoading || Boolean(playerError);

  const shouldShowInitial = !isThisEpisodeLoaded && !isLoading && !playerError;

  const showDownloadProgress = isDownloading;

  const showInitialButtons = shouldShowInitial && !cachedUri;
  const loadingTranslationKey = download.isPending
    ? "preparing"
    : isStreamLoading
      ? "loading_stream"
      : "downloading";

  useEffect(() => {
    let isAlive = true;

    async function loadCachedFile() {
      if (!podcast?.filename) {
        if (isAlive) setCachedUri(null);
        return;
      }

      try {
        const uri = await getCachedUri(podcast.filename);
        if (isAlive) setCachedUri(uri ?? null);
      } catch {
        if (isAlive) setCachedUri(null);
      }
    }

    loadCachedFile();

    return () => {
      isAlive = false;
    };
  }, [podcast?.id, podcast?.filename, getCachedUri]);

  useEffect(() => {
    let isMounted = true;

    async function loadFavoriteState() {
      if (!podcast?.id) return;

      try {
        const result = await isPodcastFavorited(podcast.id, lang);
        if (isMounted) setIsFavorite(result);
      } catch {
        // Keep UI stable if favorite lookup fails.
      }
    }

    loadFavoriteState();

    return () => {
      isMounted = false;
    };
  }, [podcast?.id, lang]);

  useEffect(() => {
    if (shouldShowInitial && !justLoadedRef.current) {
      stopAndUnload();
    }

    if (isThisEpisodeLoaded) {
      justLoadedRef.current = false;
    }
  }, [shouldShowInitial, isThisEpisodeLoaded, podcast?.id, stopAndUnload]);

  useEffect(() => {
    if (manuallyLoadedRef.current) {
      manuallyLoadedRef.current = false;
      return;
    }

    if (
      shouldShowInitial &&
      cachedUri &&
      loadedPodcastIdRef.current !== podcast.id
    ) {
      loadedPodcastIdRef.current = podcast.id;

      load(createAudioSource(cachedUri), {
        autoplay: false,
        title: podcast.title,
        artwork: artworkUri,
        podcastId: podcast.id,
        filename: podcast.filename,
        rate,
      }).catch((error) => {
        setPlayerError(error?.message ?? "Player error");
      });
    }

    if (!shouldShowInitial) {
      loadedPodcastIdRef.current = null;
    }
  }, [
    shouldShowInitial,
    cachedUri,
    podcast.id,
    podcast.filename,
    podcast.title,
    rate,
    artworkUri,
    load,
  ]);

  useEffect(() => {
    const entranceAnimation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    entranceAnimation.start();

    return () => {
      entranceAnimation.stop();
    };
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    let isMounted = true;

    async function loadLastTime() {
      if (!podcast?.id) {
        if (isMounted) setLastTime(null);
        return;
      }

      try {
        const json = await AsyncStorage.getItem(getLastTimeKey(podcast.id));

        if (!json) {
          if (isMounted) setLastTime(null);
          return;
        }

        const {
          position: savedPosition = 0,
          duration: savedDuration = 0,
          savedAt = Date.now(),
        } = JSON.parse(json) || {};

        if (isMounted) {
          setLastTime({
            position: savedPosition,
            duration: savedDuration,
            savedAt,
          });
        }
      } catch {
        // Ignore read errors to keep the player stable.
      }
    }

    loadLastTime();

    return () => {
      isMounted = false;
    };
  }, [podcast?.id]);

  useEffect(() => {
  if (isPlaying && isThisEpisodeLoaded && podcast?.id) {
    setLastPlayed(podcast);
  }
}, [isPlaying, isThisEpisodeLoaded, podcast?.id, podcast, setLastPlayed]);

  const onPressToggleFavorite = async () => {
    if (!podcast?.id) return;

    try {
      const nextFavoriteState = await togglePodcastFavorite(podcast.id, lang);
      setIsFavorite(nextFavoriteState);
      incrementPodcastFavoritesVersion();
    } catch {
      // Keep UI stable if favorite toggle fails.
    }
  };

  const handleStream = async () => {
    setPlayerError(null);

    if (!podcast?.filename) {
      setPlayerError("Audio path missing.");
      return;
    }

    try {
      setIsStreamLoading(true);
      setIsStream(true);

      const remoteUrl = await getRemoteUrl(podcast.filename);
      if (!remoteUrl) {
        setPlayerError("Cannot create stream URL.");
        setIsStream(false);
        return;
      }
      await load(createAudioSource(remoteUrl), {
        autoplay: true,
        title: podcast.title,
        artwork: artworkUri,
        podcastId: podcast.id,
        filename: podcast.filename,
        rate,
      });
    } catch (error: any) {
      console.log("[stream error]", error);
      setPlayerError(error?.message ?? "Player error");
      setIsStream(false);
    } finally {
      setIsStreamLoading(false);
    }
  };

  const handleDownload = async () => {
    pause();
    setPlayerError(null);

    if (!podcast?.filename || !downloadKey) {
      setPlayerError("Audio path missing.");
      return;
    }

    try {
      setIsStream(false);
      setDownloading(downloadKey, true);
      setProgress(downloadKey, 0);

      const localUri = await download.mutateAsync({
        filename: podcast.filename,
        onProgress: (progress) => setProgress(downloadKey, progress),
      });

      setCachedUri(localUri);

      manuallyLoadedRef.current = true;
      justLoadedRef.current = true;

      load(createAudioSource(localUri), {
        autoplay: false,
        title: podcast.title,
        artwork: artworkUri,
        podcastId: podcast.id,
        filename: podcast.filename,
        rate,
      }).catch((error) => {
        justLoadedRef.current = false;
        setPlayerError(error?.message ?? "Player error");
      });

      setHasDownloaded(true);
    } catch (error: any) {
      if (
        error?.name !== "CancelledError" &&
        error?.message !== "Download cancelled"
      ) {
        setPlayerError(error?.message ?? "Download failed");
      }

      setHasDownloaded(false);
      setProgress(downloadKey, 0);
      justLoadedRef.current = false;
    } finally {
      setDownloading(downloadKey, false);
      resetDownloadState(downloadKey);
    }
  };

  const togglePlayPause = () => {
    if (playerError || !isThisEpisodeLoaded) return;

    toggle();
  };

  const goBack = () => {
    if (!isThisEpisodeLoaded) return;

    seekBy(-10);
  };

  const goForward = () => {
    if (!isThisEpisodeLoaded) return;

    seekBy(10);
  };

  const stopPlayback = async () => {
    if (!isThisEpisodeLoaded) return;

    await stopAndKeepSource();
  };

  const handleLastTime = async () => {
    if (!podcast?.id) return;

    try {
      const payload = {
        podcastId: podcast.id,
        title: podcast.title ?? null,
        filename: podcast.filename ?? null,
        uri: currentUri ?? null,
        key: currentKey ?? null,
        position: typeof position === "number" ? position : 0,
        duration: typeof duration === "number" ? duration : 0,
        rate: typeof rate === "number" ? rate : 1,
        savedAt: Date.now(),
      };

      await AsyncStorage.setItem(
        getLastTimeKey(podcast.id),
        JSON.stringify(payload),
      );

      setLastTime({
        position: payload.position,
        duration: payload.duration,
        savedAt: payload.savedAt,
      });
    } catch {
      setPlayerError("Could not save last time.");
    }
  };

  const restoreLastTime = () => {
    if (!lastTime) return;

    setPosition(lastTime.position);
  };

  const resetDownloadUI = () => {
    resetDownloadState(downloadKey);
    download.reset();

    setIsStreamLoading(false);
    setIsStream(false);
    setHasDownloaded(false);
    setPlayerError(null);

    manuallyLoadedRef.current = false;
    loadedPodcastIdRef.current = null;
    justLoadedRef.current = false;
  };

  const cancelDownload = async () => {
    await cancelActiveDownload();
    resetDownloadUI();
  };

  const handleDeleteFromCache = async () => {
    if (!podcast?.filename) return;

    const deleted = await deleteFromCache(podcast.filename);

    if (deleted) {
      setCachedUri(null);
      stopAndUnload();
    }
  };

  const onSliderStart = () => {
    wasPlayingRef.current = isPlaying;
    pause();
    setIsSeeking(true);
    startPosRef.current = position || 0;
  };

  const onSliderComplete = (value: number) => {
    setIsSeeking(false);

    const delta = value - startPosRef.current;

    if (Math.abs(delta) < 1) {
      seekBy(delta);
    } else {
      setPosition(value);
    }

    if (wasPlayingRef.current) {
      play();
    }
  };

  return {
    coverSource,
    isFavorite,
    playerError,
    isPlaying,
    position,
    duration,
    rate,
    cachedUri,
    lastTime,
    isLoading,
    isDownloading,
    downloadProgress,
    showPlaybackControls,
    showInitialButtons,
    showDownloadProgress,
    controlsDisabled,
    showSpeedMenu,
    loadingTranslationKey,
    fadeAnim,
    slideAnim,
    setShowSpeedMenu,
    setRate,
    handleStream,
    handleDownload,
    cancelDownload,
    handleDeleteFromCache,
    onPressToggleFavorite,
    handleLastTime,
    restoreLastTime,
    togglePlayPause,
    goBack,
    goForward,
    stopPlayback,
    onSliderStart,
    onSliderComplete,
    formatTime: formatPodcastTime,
    isListened,
    onPressToggleListened,
  };
}
