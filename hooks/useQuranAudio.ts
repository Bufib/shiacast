// //! More aggressive cache. Last that worked

// import { useCallback, useEffect, useRef, useState } from "react";
// import { globalPlayer, useGlobalPlayer } from "@/player/useGlobalPlayer";
// import { QuranVerseType } from "@/constants/Types";

// /** Supported reciters (safe defaults; add more later) */
// export type ReciterId = "alafasy" | "minshawi" | "husary";

// type ReciterMeta = {
//   everyayahBase?: string;
//   islamicSlug?: string;
//   label: string;
// };

// export const RECITERS: Record<ReciterId, ReciterMeta> = {
//   alafasy: {
//     everyayahBase: "Alafasy_128kbps",
//     islamicSlug: "ar.alafasy",
//     label: "Mishary Alafasy",
//   },
//   minshawi: {
//     everyayahBase: "Minshawy_Murattal_128kbps",
//     islamicSlug: "ar.minshawi",
//     label: "Mohamed Minshawi",
//   },
//   husary: {
//     everyayahBase: "Husary_128kbps",
//     islamicSlug: "ar.husary",
//     label: "Mahmoud Al-Husary",
//   },
// };

// export type AudioMetaOptions = {
//   getTitleFor?: (v: QuranVerseType) => string;
//   artworkUri?: string;
//   reciter?: ReciterId;
// };

// const z3 = (n: number) => String(n).padStart(3, "0");

// function buildUrls(v: QuranVerseType, reciter: ReciterId): string[] {
//   const s = z3(v.sura);
//   const a = z3(v.aya);
//   const meta = RECITERS[reciter] ?? RECITERS.alafasy;

//   const urls: string[] = [];

//   if (meta.everyayahBase) {
//     urls.push(`https://everyayah.com/data/${meta.everyayahBase}/${s}${a}.mp3`);
//   }
//   if (meta.islamicSlug) {
//     urls.push(
//       `https://cdn.islamic.network/quran/audio/128/${meta.islamicSlug}/${v.sura}/${v.aya}.mp3`,
//     );
//   }

//   return urls;
// }

// function uriMatchesVerse(
//   uri: string | null | undefined,
//   v: QuranVerseType,
// ): boolean {
//   if (!uri) return false;
//   const s = z3(v.sura);
//   const a = z3(v.aya);
//   return (
//     uri.endsWith(`/${s}${a}.mp3`) ||
//     uri.includes(`/${s}${a}.mp3?`) ||
//     uri.endsWith(`/${v.sura}/${v.aya}.mp3`) ||
//     uri.includes(`/${v.sura}/${v.aya}.mp3?`)
//   );
// }

// // async function tryReplaceAny(urls: string[]): Promise<string> {
// //   let lastErr: unknown;
// //   for (const uri of urls) {
// //     try {
// //       await globalPlayer.replaceAsync({ uri });
// //       return uri;
// //     } catch (e) {
// //       lastErr = e;
// //     }
// //   }
// //   throw lastErr;
// // }

// // Change tryReplaceAny to accept metadata
// async function tryReplaceAny(
//   urls: string[],
//   metadata?: { title?: string; artist?: string; artwork?: string },
// ): Promise<string> {
//   let lastErr: unknown;
//   for (const uri of urls) {
//     try {
//       await globalPlayer.replaceAsync({
//         uri,
//         metadata: metadata ?? undefined,
//       });
//       return uri;
//     } catch (e) {
//       lastErr = e;
//     }
//   }
//   throw lastErr;
// }

// export function useQuranAudio(
//   verses: QuranVerseType[],
//   opts: AudioMetaOptions = {},
// ) {
//   const reciter: ReciterId = opts.reciter ?? "alafasy";

//   const currentUri = useGlobalPlayer((s) => s.currentUri);
//   const isPlaying = useGlobalPlayer((s) => s.isPlaying);
//   const toggle = useGlobalPlayer((s) => s.toggle);
//   const stopRaw = useGlobalPlayer((s) => s.stopAndKeepSource);

//   const [currentVerseIndex, setCurrentVerseIndex] = useState(-1);
//   const idxRef = useRef(-1);
//   const requestIdRef = useRef(0);
//   const lastReciterRef = useRef<ReciterId>(reciter);
//   const preloadedRef = useRef(new Set<number>());
//   const preloadControllersRef = useRef<Map<number, AbortController>>(new Map());

//   const makeTitle = useCallback(
//     (v: QuranVerseType) => opts.getTitleFor?.(v) ?? `Ayah ${v.sura}:${v.aya}`,
//     [opts],
//   );

//   const setMetaFor = useCallback(
//     (v: QuranVerseType) => {
//       useGlobalPlayer.setState({
//         title: makeTitle(v),
//         artwork: opts.artworkUri,
//         currentKey: `quran:${v.sura}:${v.aya}:${reciter}`,
//         stoppedByUser: false,
//         podcastId: undefined,
//         filename: undefined,
//       });
//     },
//     [makeTitle, opts.artworkUri, reciter],
//   );

//   const isVersePlaying = useCallback(
//     (v: QuranVerseType) => uriMatchesVerse(currentUri, v) && isPlaying,
//     [currentUri, isPlaying],
//   );

//   // // Preload with cleanup
//   // const preloadVerse = useCallback((urls: string[], verseIndex: number) => {
//   //   // Cancel existing preload for this verse
//   //   const existing = preloadControllersRef.current.get(verseIndex);
//   //   if (existing) existing.abort();

//   //   // Create new controller
//   //   const controller = new AbortController();
//   //   preloadControllersRef.current.set(verseIndex, controller);

//   //   urls.forEach((url) => {
//   //     if (__DEV__) console.log("📥 Preloading:", url);
//   //     fetch(url, { signal: controller.signal })
//   //       .then(() => {
//   //         if (__DEV__) console.log("✅ Cached:", url);
//   //         preloadControllersRef.current.delete(verseIndex);
//   //       })
//   //       .catch((err) => {
//   //         if (err.name !== "AbortError") {
//   //           if (__DEV__) console.log("⚠️ Preload failed:", url);
//   //         }
//   //         preloadControllersRef.current.delete(verseIndex);
//   //       });
//   //   });
//   // }, []);

//   const preloadVerse = useCallback((urls: string[], verseIndex: number) => {
//     const existing = preloadControllersRef.current.get(verseIndex);
//     if (existing) existing.abort();

//     const controller = new AbortController();
//     preloadControllersRef.current.set(verseIndex, controller);

//     Promise.allSettled(
//       urls.map((url) =>
//         fetch(url, { signal: controller.signal }).catch((err) => {
//           if (__DEV__ && err.name !== "AbortError")
//             console.log("⚠️ Preload failed:", url);
//           // swallow to let allSettled continue
//         }),
//       ),
//     ).finally(() => {
//       preloadControllersRef.current.delete(verseIndex);
//     });
//   }, []);

//   // const playByIndex = useCallback(
//   //   async (index: number) => {
//   //     if (index < 0 || index >= verses.length) return;
//   //     const verse = verses[index];
//   //     const myId = ++requestIdRef.current;

//   //     try {
//   //       const startTime = Date.now();
//   //       const used = await tryReplaceAny(buildUrls(verse, reciter));
//   //       const loadTime = Date.now() - startTime;

//   //       if (myId !== requestIdRef.current) return;

//   //       await globalPlayer.play();
//   //       if (myId !== requestIdRef.current) return;

//   //       setCurrentVerseIndex(index);
//   //       idxRef.current = index;
//   //       setMetaFor(verse);
//   //       lastReciterRef.current = reciter;

//   //       // Preload next 2 verses
//   //       for (let i = 1; i <= 2; i++) {
//   //         const nextIndex = index + i;
//   //         if (
//   //           nextIndex < verses.length &&
//   //           !preloadedRef.current.has(nextIndex)
//   //         ) {
//   //           preloadedRef.current.add(nextIndex);
//   //           const nextUrls = buildUrls(verses[nextIndex], reciter);
//   //           preloadVerse(nextUrls, nextIndex);
//   //         }
//   //       }

//   //       if (__DEV__)
//   //         console.log(
//   //           `🎵 Playing ${verse.sura}:${verse.aya} (${loadTime}ms) → ${used} ▪ ${reciter}`
//   //         );
//   //     } catch (err) {
//   //       if (myId !== requestIdRef.current) return;
//   //       console.error("❌ Audio load failed", err);
//   //     }
//   //   },
//   //   [verses, reciter, setMetaFor, preloadVerse]
//   // );

//   const playByIndex = useCallback(
//     async (index: number) => {
//       if (index < 0 || index >= verses.length) return;
//       const verse = verses[index];
//       const myId = ++requestIdRef.current;

//       try {
//         const startTime = Date.now();
//         const title = makeTitle(verse);

//         // ✅ Pass metadata to tryReplaceAny for lock screen
//         const used = await tryReplaceAny(buildUrls(verse, reciter), {
//           title,
//           artist: RECITERS[reciter].label,
//           artwork: opts.artworkUri,
//         });

//         const loadTime = Date.now() - startTime;

//         if (myId !== requestIdRef.current) return;

//         await globalPlayer.play();
//         if (myId !== requestIdRef.current) return;

//         setCurrentVerseIndex(index);
//         idxRef.current = index;
//         setMetaFor(verse);
//         lastReciterRef.current = reciter;

//         // Preload next 2 verses
//         for (let i = 1; i <= 2; i++) {
//           const nextIndex = index + i;
//           if (
//             nextIndex < verses.length &&
//             !preloadedRef.current.has(nextIndex)
//           ) {
//             preloadedRef.current.add(nextIndex);
//             const nextUrls = buildUrls(verses[nextIndex], reciter);
//             preloadVerse(nextUrls, nextIndex);
//           }
//         }

//         if (__DEV__)
//           console.log(
//             `🎵 Playing ${verse.sura}:${verse.aya} (${loadTime}ms) → ${used} ▪ ${reciter}`,
//           );
//       } catch (err) {
//         if (myId !== requestIdRef.current) return;
//         console.error("❌ Audio load failed", err);
//       }
//     },
//     [verses, reciter, setMetaFor, preloadVerse, makeTitle, opts.artworkUri],
//   );
//   const playVerse = useCallback(
//     async (_v: QuranVerseType, i: number) => playByIndex(i),
//     [playByIndex],
//   );

//   const toggleVerse = useCallback(
//     async (v: QuranVerseType, i: number) => {
//       const sameVerse = uriMatchesVerse(currentUri, v);
//       const reciterChanged = lastReciterRef.current !== reciter;
//       if (sameVerse && !reciterChanged) {
//         toggle();
//       } else {
//         await playByIndex(i);
//       }
//     },
//     [currentUri, reciter, toggle, playByIndex],
//   );

//   const playNext = useCallback(async () => {
//     const next = idxRef.current + 1;
//     if (next < verses.length) await playByIndex(next);
//   }, [playByIndex, verses.length]);

//   const playPrevious = useCallback(async () => {
//     const prev = idxRef.current - 1;
//     if (prev >= 0) await playByIndex(prev);
//   }, [playByIndex]);

//   // Update global player handlers whenever they change
//   // Note: We intentionally don't clean these up on unmount to allow
//   // background playback to continue. This creates a minor "memory leak"
//   // where the old component's closures remain referenced, but it's
//   // acceptable for this use case and gets overwritten when a new
//   // SuraScreen mounts.

//   useEffect(() => {
//     useGlobalPlayer.setState({
//       _quranNext: playNext,
//       _quranPrev: playPrevious,
//     } as any);
//   }, [playNext, playPrevious]);

//   useEffect(() => {
//     if (idxRef.current >= verses.length) {
//       idxRef.current = -1;
//       setCurrentVerseIndex(-1);
//     }
//   }, [verses.length]);

//   // // Cleanup on reciter change or unmount
//   // useEffect(() => {
//   //   preloadedRef.current.clear();

//   //   return () => {
//   //     // Cancel all ongoing preloads
//   //     preloadControllersRef.current.forEach((controller) => controller.abort());
//   //     preloadControllersRef.current.clear();
//   //   };
//   // }, [reciter]);

//   useEffect(() => {
//     // reset per-reciter preloaded set
//     preloadedRef.current.clear();

//     // capture the Map reference used during this effect’s lifetime
//     const controllers = preloadControllersRef.current;

//     return () => {
//       // cancel any in-flight preloads and clear the same Map instance
//       controllers.forEach((c) => c.abort());
//       controllers.clear();
//     };
//   }, [reciter]);

//   const stop = useCallback(() => {
//     stopRaw();
//     useGlobalPlayer.setState({
//       _quranNext: undefined,
//       _quranPrev: undefined,
//     } as any);
//     useGlobalPlayer.setState({ stoppedByUser: true });
//   }, [stopRaw]);

//   return {
//     playVerse,
//     toggleVerse,
//     isVersePlaying,
//     playNext,
//     playPrevious,
//     currentVerseIndex,
//     stop,
//   };
// }

// /hooks/useQuranAudio.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { globalPlayer, useGlobalPlayer } from "../player/useGlobalPlayer";
import { QuranVerseType } from "@/constants/Types";

/** Supported reciters (safe defaults; add more later) */
export type ReciterId = "alafasy" | "minshawi" | "husary";

type ReciterMeta = {
  everyayahBase?: string;
  islamicSlug?: string;
  label: string;
};

export const RECITERS: Record<ReciterId, ReciterMeta> = {
  alafasy: {
    everyayahBase: "Alafasy_128kbps",
    islamicSlug: "ar.alafasy",
    label: "Mishary Alafasy",
  },
  minshawi: {
    everyayahBase: "Minshawy_Murattal_128kbps",
    islamicSlug: "ar.minshawi",
    label: "Mohamed Minshawi",
  },
  husary: {
    everyayahBase: "Husary_128kbps",
    islamicSlug: "ar.husary",
    label: "Mahmoud Al-Husary",
  },
};

export type AudioMetaOptions = {
  getTitleFor?: (v: QuranVerseType) => string;
  artworkUri?: string;
  reciter?: ReciterId;
};

const z3 = (n: number) => String(n).padStart(3, "0");

function buildUrls(v: QuranVerseType, reciter: ReciterId): string[] {
  const s = z3(v.sura);
  const a = z3(v.aya);
  const meta = RECITERS[reciter] ?? RECITERS.alafasy;

  const urls: string[] = [];

  if (meta.everyayahBase) {
    urls.push(`https://everyayah.com/data/${meta.everyayahBase}/${s}${a}.mp3`);
  }
  if (meta.islamicSlug) {
    urls.push(
      `https://cdn.islamic.network/quran/audio/128/${meta.islamicSlug}/${v.sura}/${v.aya}.mp3`,
    );
  }

  return urls;
}

function uriMatchesVerse(
  uri: string | null | undefined,
  v: QuranVerseType,
): boolean {
  if (!uri) return false;
  const s = z3(v.sura);
  const a = z3(v.aya);
  return (
    uri.endsWith(`/${s}${a}.mp3`) ||
    uri.includes(`/${s}${a}.mp3?`) ||
    uri.endsWith(`/${v.sura}/${v.aya}.mp3`) ||
    uri.includes(`/${v.sura}/${v.aya}.mp3?`)
  );
}

async function tryReplaceAny(
  urls: string[],
  metadata?: { title?: string; artist?: string; artwork?: string },
): Promise<string> {
  let lastErr: unknown;
  for (const uri of urls) {
    try {
      await globalPlayer.replaceAsync({
        uri,
        metadata: metadata ?? undefined,
      });
      return uri;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

export function useQuranAudio(
  verses: QuranVerseType[],
  opts: AudioMetaOptions = {},
) {
  const reciter: ReciterId = opts.reciter ?? "alafasy";

  const currentUri = useGlobalPlayer((s) => s.currentUri);
  const isPlaying = useGlobalPlayer((s) => s.isPlaying);
  const toggle = useGlobalPlayer((s) => s.toggle);
  const stopRaw = useGlobalPlayer((s) => s.stopAndKeepSource);

  const [currentVerseIndex, setCurrentVerseIndex] = useState(-1);
  const idxRef = useRef(-1);
  const requestIdRef = useRef(0);
  const lastReciterRef = useRef<ReciterId>(reciter);
  const preloadedRef = useRef(new Set<number>());
  const preloadControllersRef = useRef<Map<number, AbortController>>(new Map());

  const makeTitle = useCallback(
    (v: QuranVerseType) => opts.getTitleFor?.(v) ?? `Ayah ${v.sura}:${v.aya}`,
    [opts],
  );

  const setMetaFor = useCallback(
    (v: QuranVerseType) => {
      useGlobalPlayer.setState({
        title: makeTitle(v),
        artwork: opts.artworkUri,
        stoppedByUser: false,
        podcastId: undefined,
        filename: undefined,
      });
    },
    [makeTitle, opts.artworkUri],
  );

  const isVersePlaying = useCallback(
    (v: QuranVerseType) => uriMatchesVerse(currentUri, v) && isPlaying,
    [currentUri, isPlaying],
  );

  const preloadVerse = useCallback((urls: string[], verseIndex: number) => {
    const existing = preloadControllersRef.current.get(verseIndex);
    if (existing) existing.abort();

    const controller = new AbortController();
    preloadControllersRef.current.set(verseIndex, controller);

    Promise.allSettled(
      urls.map((url) =>
        fetch(url, { signal: controller.signal }).catch((err) => {
          if (__DEV__ && err.name !== "AbortError")
            console.log("⚠️ Preload failed:", url);
        }),
      ),
    ).finally(() => {
      preloadControllersRef.current.delete(verseIndex);
    });
  }, []);

  const playByIndex = useCallback(
    async (index: number) => {
      if (index < 0 || index >= verses.length) return;
      const verse = verses[index];
      const myId = ++requestIdRef.current;

      try {
        const startTime = Date.now();
        const title = makeTitle(verse);

        // set key early so auto-advance arms immediately
        useGlobalPlayer.setState({
          currentKey: `quran:${verse.sura}:${verse.aya}:${reciter}`,
          title,
          artwork: opts.artworkUri,
          stoppedByUser: false,
        });

        const used = await tryReplaceAny(buildUrls(verse, reciter), {
          title,
          artist: RECITERS[reciter].label,
          artwork: opts.artworkUri,
        });

        const loadTime = Date.now() - startTime;

        if (myId !== requestIdRef.current) return;

        await globalPlayer.play();
        if (myId !== requestIdRef.current) return;

        setCurrentVerseIndex(index);
        idxRef.current = index;
        setMetaFor(verse);
        lastReciterRef.current = reciter;

        // Preload next 2 verses
        for (let i = 1; i <= 2; i++) {
          const nextIndex = index + i;
          if (
            nextIndex < verses.length &&
            !preloadedRef.current.has(nextIndex)
          ) {
            preloadedRef.current.add(nextIndex);
            const nextUrls = buildUrls(verses[nextIndex], reciter);
            preloadVerse(nextUrls, nextIndex);
          }
        }

        if (__DEV__)
          console.log(
            `🎵 Playing ${verse.sura}:${verse.aya} (${loadTime}ms) → ${used} ▪ ${reciter}`,
          );
      } catch (err) {
        if (myId !== requestIdRef.current) return;
        console.error("❌ Audio load failed", err);
      }
    },
    [verses, reciter, setMetaFor, preloadVerse, makeTitle, opts.artworkUri],
  );

  const playVerse = useCallback(
    async (_v: QuranVerseType, i: number) => playByIndex(i),
    [playByIndex],
  );

  const toggleVerse = useCallback(
    async (v: QuranVerseType, i: number) => {
      const sameVerse = uriMatchesVerse(currentUri, v);
      const reciterChanged = lastReciterRef.current !== reciter;
      if (sameVerse && !reciterChanged) {
        toggle();
      } else {
        await playByIndex(i);
      }
    },
    [currentUri, reciter, toggle, playByIndex],
  );

  const playNext = useCallback(async () => {
    const next = idxRef.current + 1;
    if (next < verses.length) await playByIndex(next);
  }, [playByIndex, verses.length]);

  const playPrevious = useCallback(async () => {
    const prev = idxRef.current - 1;
    if (prev >= 0) await playByIndex(prev);
  }, [playByIndex]);

  // ✅ DO NOT clear on unmount: keep Quran playing across navigation
  useEffect(() => {
    useGlobalPlayer.getState()._setQuranHandlers(playNext, playPrevious);
  }, [playNext, playPrevious]);

  useEffect(() => {
    if (idxRef.current >= verses.length) {
      idxRef.current = -1;
      setCurrentVerseIndex(-1);
    }
  }, [verses.length]);

  useEffect(() => {
    preloadedRef.current.clear();

    const controllers = preloadControllersRef.current;
    return () => {
      controllers.forEach((c) => c.abort());
      controllers.clear();
    };
  }, [reciter]);

  const stop = useCallback(() => {
    stopRaw();
    // clear handlers on explicit stop
    useGlobalPlayer.getState()._clearQuranHandlers();
    useGlobalPlayer.setState({ stoppedByUser: true });
  }, [stopRaw]);

  return {
    playVerse,
    toggleVerse,
    isVersePlaying,
    playNext,
    playPrevious,
    currentVerseIndex,
    stop,
  };
}