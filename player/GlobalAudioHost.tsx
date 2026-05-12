// import {
//   setAudioModeAsync,
//   useAudioPlayerStatus,
//   type AudioStatus,
// } from "expo-audio";
// import React, { PropsWithChildren, useEffect } from "react";

// import {
//   globalPlayer,
//   useGlobalPlayer,
//   type PlayerStatus,
// } from "./useGlobalPlayer";

// export { globalPlayer } from "./useGlobalPlayer";

// function getStoreStatus(status: AudioStatus): PlayerStatus {
//   if (status.playbackState === "error") {
//     return "error";
//   }

//   if (status.playing) {
//     return "playing";
//   }

//   if (
//     status.isBuffering ||
//     (!status.isLoaded && status.playbackState !== "idle")
//   ) {
//     return "loading";
//   }

//   if (status.isLoaded) {
//     return "ready";
//   }

//   return "idle";
// }

// export default function GlobalVideoHost({ children }: PropsWithChildren) {
//   const audioStatus = useAudioPlayerStatus(globalPlayer);
//   const setPlaying = useGlobalPlayer((state) => state._setPlaying);
//   const setTime = useGlobalPlayer((state) => state._setTime);
//   const setStatus = useGlobalPlayer((state) => state._setStatus);

//   useEffect(() => {
//     setAudioModeAsync({
//       playsInSilentMode: true,
//       shouldPlayInBackground: true,
//       interruptionMode: "doNotMix",
//     }).catch((error: unknown) => {
//       if (__DEV__) {
//         const message =
//           error instanceof Error ? error.message : "Failed to set audio mode";
//         console.warn("[globalPodcastAudioPlayer]", message);
//       }
//     });
//   }, []);

//   useEffect(() => {
//     setTime(audioStatus.currentTime, audioStatus.duration);
//     setPlaying(audioStatus.playing);

//     if (audioStatus.didJustFinish) {
//       setStatus("ready");
//       return;
//     }

//     setStatus(getStoreStatus(audioStatus));
//   }, [audioStatus, setPlaying, setStatus, setTime]);

//   return <>{children}</>;
// }


import {
  setAudioModeAsync,
  useAudioPlayerStatus,
  type AudioStatus,
} from "expo-audio";
import React, { PropsWithChildren, useEffect } from "react";

import {
  globalPlayer,
  useGlobalPlayer,
  type PlayerStatus,
} from "./useGlobalPlayer";

export { globalPlayer } from "./useGlobalPlayer";

function getStoreStatus(status: AudioStatus): PlayerStatus {
  if (status.playbackState === "error") {
    return "error";
  }

  if (status.playing) {
    return "playing";
  }

  if (
    status.isBuffering ||
    (!status.isLoaded && status.playbackState !== "idle")
  ) {
    return "loading";
  }

  if (status.isLoaded) {
    return "ready";
  }

  return "idle";
}

export default function GlobalAudioHost({ children }: PropsWithChildren) {
  const audioStatus = useAudioPlayerStatus(globalPlayer);

  const setPlaying = useGlobalPlayer((state) => state._setPlaying);
  const setTime = useGlobalPlayer((state) => state._setTime);
  const setStatus = useGlobalPlayer((state) => state._setStatus);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "doNotMix",
    }).catch((error: unknown) => {
      if (__DEV__) {
        const message =
          error instanceof Error ? error.message : "Failed to set audio mode";

        console.warn("[globalPodcastAudioPlayer]", message);
      }
    });
  }, []);

  useEffect(() => {
    setTime(audioStatus.currentTime, audioStatus.duration);
    setPlaying(audioStatus.playing);

    if (audioStatus.didJustFinish) {
      setStatus("ready");
      return;
    }

    setStatus(getStoreStatus(audioStatus));
  }, [audioStatus, setPlaying, setStatus, setTime]);

  return <>{children}</>;
}