// // player/GlobalAutoAdvance.tsx
// import React from "react";
// import { useGlobalPlayer } from "@/player/useGlobalPlayer";

// /**
//  * Root-mounted watcher that advances to the next verse when the current one ends.
//  * It calls store fields `_quranNext/_quranPrev` that useQuranAudio registers.
//  */
// export default function GlobalAutoAdvance() {
//   const isPlaying = useGlobalPlayer((s) => s.isPlaying);
//   const position = useGlobalPlayer((s) => s.position);
//   const duration = useGlobalPlayer((s) => s.duration);
//   const nextFn = useGlobalPlayer(
//     (s) => (s as any)._quranNext as (() => void) | undefined,
//   );

//   //! New
//   const isQuran = useGlobalPlayer(
//     (s) =>
//       typeof (s as any).currentKey === "string" &&
//       (s as any).currentKey.startsWith("quran:"),
//   );

//   const lockRef = React.useRef(false);
//   React.useEffect(() => {
//     if (!isQuran) return; //! New

//     const d = duration ?? 0;
//     const p = position ?? 0;
//     const nearEnd = d > 0 && p >= d - 0.25;

//     if (isPlaying && nearEnd && !lockRef.current) {
//       lockRef.current = true;
//       nextFn?.();
//     }
//     if (!nearEnd) lockRef.current = false;
//   }, [isPlaying, position, duration, nextFn, isQuran]);

//   return null;
// }


// /player/GlobalAutoAdvance.tsx
import React from "react";
import { globalPlayer, useGlobalPlayer } from "../../player/useGlobalPlayer";

/**
 * Root-mounted watcher that advances to the next verse when the current one ends.
 * Uses handler refs (no stale closure leaks).
 */
export default function GlobalAutoAdvance() {
  const isPlaying = useGlobalPlayer((s) => s.isPlaying);
  const position = useGlobalPlayer((s) => s.position);
  const duration = useGlobalPlayer((s) => s.duration);

  const nextRef = useGlobalPlayer((s) => s._quranNextRef);

  const isQuran = useGlobalPlayer(
    (s) => typeof s.currentKey === "string" && s.currentKey.startsWith("quran:"),
  );

  const lockRef = React.useRef(false);

  React.useEffect(() => {
    if (!isQuran) return;

    const d =
      typeof duration === "number" && duration > 0
        ? duration
        : typeof globalPlayer.duration === "number"
          ? globalPlayer.duration
          : 0;

    const p =
      typeof position === "number"
        ? position
        : typeof globalPlayer.currentTime === "number"
          ? globalPlayer.currentTime
          : 0;

    const END_EPS = 1.25;
    const nearEnd = d > 0 && p >= d - END_EPS;

    if (isPlaying && nearEnd && !lockRef.current) {
      lockRef.current = true;
      nextRef.current?.();
    }
    if (!nearEnd) lockRef.current = false;
  }, [isPlaying, position, duration, isQuran, nextRef]);

  return null;
}