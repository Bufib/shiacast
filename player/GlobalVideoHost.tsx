// // /player/GlobalVideoHost.tsx
// import React, { PropsWithChildren } from "react";
// import { View } from "react-native";
// import { VideoView } from "expo-video";
// import { useEvent } from "expo";
// import { globalPlayer, useGlobalPlayer } from "./useGlobalPlayer";
// import GlobalAutoAdvance from "@/components/GlobalAutoAdvance";
// export { globalPlayer } from "./useGlobalPlayer";

// export default function GlobalVideoHost({ children }: PropsWithChildren) {
//   const setPlaying = useGlobalPlayer((s) => s._setPlaying);
//   const setTime = useGlobalPlayer((s) => s._setTime);
//   const setStatus = useGlobalPlayer((s) => s._setStatus);

//   // playingChange
//   const playingEvt = useEvent(globalPlayer, "playingChange");
//   React.useEffect(() => {
//     if (playingEvt) setPlaying(!!playingEvt.isPlaying);
//   }, [playingEvt, setPlaying]);

//   // timeUpdate
//   const timeEvt = useEvent(globalPlayer, "timeUpdate");
//   const lastTick = React.useRef(0);
//   React.useEffect(() => {
//     const now = Date.now();
//     // align with timeUpdateEventInterval=0.5s; reduces churn
//     if (now - lastTick.current >= 450) {
//       const cur =
//         typeof (timeEvt as any)?.currentTime === "number"
//           ? (timeEvt as any).currentTime
//           : (globalPlayer.currentTime ?? 0);

//       const dur =
//         typeof (timeEvt as any)?.duration === "number"
//           ? (timeEvt as any).duration
//           : typeof globalPlayer.duration === "number"
//             ? globalPlayer.duration
//             : undefined;

//       setTime(cur, dur);
//       lastTick.current = now;
//     }
//   }, [timeEvt, setTime]);

//   // sourceLoad → ready
//   const sourceLoadEvt = useEvent(globalPlayer, "sourceLoad");
//   React.useEffect(() => {
//     if (sourceLoadEvt) setStatus("ready");
//   }, [sourceLoadEvt, setStatus]);

//   return (
//     <>
//       {children}
//       <GlobalAutoAdvance />
//       <View
//         pointerEvents="none"
//         style={{ position: "absolute", width: 1, height: 1, opacity: 0 }}
//       >
//         <VideoView
//           player={globalPlayer}
//           allowsPictureInPicture
//           nativeControls={false}
//         />
//       </View>
//     </>
//   );
// }


import React, { PropsWithChildren } from "react";
import { View } from "react-native";
import { VideoView } from "expo-video";
import { useEvent } from "expo";
import { globalPlayer, useGlobalPlayer } from "./useGlobalPlayer";

export { globalPlayer } from "./useGlobalPlayer";

export default function GlobalVideoHost({ children }: PropsWithChildren) {
  const setPlaying = useGlobalPlayer((s) => s._setPlaying);
  const setTime = useGlobalPlayer((s) => s._setTime);
  const setStatus = useGlobalPlayer((s) => s._setStatus);

  const playingEvt = useEvent(globalPlayer, "playingChange");

  React.useEffect(() => {
    if (playingEvt) {
      setPlaying(!!playingEvt.isPlaying);
    }
  }, [playingEvt, setPlaying]);

  const timeEvt = useEvent(globalPlayer, "timeUpdate");
  const lastTick = React.useRef(0);

  React.useEffect(() => {
    const now = Date.now();

    if (now - lastTick.current < 450) {
      return;
    }

    const currentTime =
      typeof (timeEvt as any)?.currentTime === "number"
        ? (timeEvt as any).currentTime
        : (globalPlayer.currentTime ?? 0);

    const duration =
      typeof (timeEvt as any)?.duration === "number"
        ? (timeEvt as any).duration
        : typeof globalPlayer.duration === "number"
          ? globalPlayer.duration
          : undefined;

    setTime(currentTime, duration);
    lastTick.current = now;
  }, [timeEvt, setTime]);

  const sourceLoadEvt = useEvent(globalPlayer, "sourceLoad");

  React.useEffect(() => {
    if (sourceLoadEvt) {
      setStatus("ready");
    }
  }, [sourceLoadEvt, setStatus]);

  return (
    <>
      {children}

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          opacity: 0,
        }}
      >
        <VideoView
          player={globalPlayer}
          allowsPictureInPicture
          nativeControls={false}
        />
      </View>
    </>
  );
}