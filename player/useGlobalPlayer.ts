// // // /player/useGlobalPlayer.ts
// // import { create } from "zustand";
// // import {
// //   createVideoPlayer,
// //   type VideoPlayer,
// //   type VideoSource,
// // } from "expo-video";

// // const PLAYER_KEY = Symbol.for("app/globalVideoPlayer");

// // function getOrCreatePlayer(): VideoPlayer {
// //   const g = globalThis as any;
// //   if (!g[PLAYER_KEY]) {
// //     const p = createVideoPlayer(null);
// //     p.staysActiveInBackground = true;
// //     p.showNowPlayingNotification = true;
// //     p.audioMixingMode = "auto"; // "mixWithOthers" | "duckOthers" | "auto" | "doNotMix"
// //     p.timeUpdateEventInterval = 0.5; // seconds
// //     g[PLAYER_KEY] = p;
// //   }
// //   return g[PLAYER_KEY] as VideoPlayer;
// // }

// // export const globalPlayer = getOrCreatePlayer();

// // type PlayerStatus = "idle" | "loading" | "ready" | "error" | "stopped";

// // type PlayerState = {
// //   // playback mirrors
// //   isPlaying: boolean;
// //   position: number;
// //   duration: number;
// //   rate: number;

// //   // loaded media
// //   currentKey?: string;
// //   currentUri?: string;
// //   title?: string;
// //   artwork?: string;
// //   podcastId?: string | number;
// //   filename?: string;

// //   // ui/flow
// //   status: PlayerStatus;
// //   error?: string | null;
// //   stoppedByUser: boolean;

// //   // actions
// //   load: (
// //     src: VideoSource | null,
// //     opts?: {
// //       autoplay?: boolean;
// //       title?: string;
// //       artwork?: string;
// //       podcastId?: string | number;
// //       filename?: string;
// //       rate?: number;
// //     }
// //   ) => Promise<void>;
// //   play: () => void;
// //   pause: () => void;
// //   toggle: () => void;
// //   seekBy: (deltaSeconds: number) => void;
// //   setPosition: (seconds: number) => void;
// //   setRate: (rate: number) => void;
// //   stopAndKeepSource: () => Promise<void>;
// //   stopAndUnload: () => Promise<void>;

// //   // event-bridge setters
// //   _setPlaying: (b: boolean) => void;
// //   _setTime: (pos: number, dur?: number) => void;
// //   _setStatus: (s: PlayerStatus, error?: string | null) => void;
// // };

// // function getSourceKey(src: VideoSource | null | undefined) {
// //   if (src == null) return "unknown";
// //   if (typeof src === "string") return src;
// //   if (typeof src === "number") return `asset:${src}`;
// //   if (
// //     typeof src === "object" &&
// //     "uri" in src &&
// //     typeof (src as any).uri === "string"
// //   ) {
// //     return (src as any).uri as string;
// //   }
// //   if (
// //     typeof src === "object" &&
// //     "assetId" in src &&
// //     typeof (src as any).assetId === "number"
// //   ) {
// //     return `asset:${(src as any).assetId}`;
// //   }
// //   return "unknown";
// // }

// // export const useGlobalPlayer = create<PlayerState>((set, get) => ({
// //   isPlaying: false,
// //   position: 0,
// //   duration: 0,
// //   rate: 1.0,

// //   status: "idle",
// //   error: null,
// //   stoppedByUser: false,

// //   load: async (src, opts) => {
// //     const p = globalPlayer;
// //     const {
// //       autoplay = false,
// //       title,
// //       artwork,
// //       podcastId,
// //       filename,
// //       rate,
// //     } = opts ?? {};

// //     set({ status: "loading", error: null });

// //     try {
// //       const nextKey = getSourceKey(src);

// //       // Avoid reloading identical source
// //       if (get().currentKey === nextKey && get().status === "ready") {
// //         if (typeof rate === "number") {
// //           try {
// //             p.playbackRate = rate;
// //           } catch {}
// //           set({ rate });
// //         }
// //         if (autoplay) {
// //           set({ stoppedByUser: false });
// //           try {
// //             p.play();
// //           } catch {}
// //         } else {
// //           try {
// //             p.pause();
// //           } catch {}
// //         }
// //         set({ status: "ready" });
// //         return;
// //       }

// //       // Replace async (recommended on iOS)
// //       if (typeof (p as any).replaceAsync === "function") {
// //         await (p as any).replaceAsync(src);
// //       } else {
// //         // Fallback if replaceAsync not present (older runtimes)
// //         (p as any).replace?.(src);
// //       }

// //       // Update store metadata
// //       set({
// //         currentKey: nextKey,
// //         currentUri:
// //           typeof src === "object" && src && "uri" in src
// //             ? (src as any).uri
// //             : undefined,
// //         title: title ?? get().title,
// //         artwork: artwork ?? get().artwork,
// //         podcastId,
// //         filename,
// //         rate: typeof rate === "number" ? rate : get().rate,
// //         stoppedByUser: false,
// //         status: "ready",
// //         error: null,
// //       });

// //       if (typeof rate === "number") {
// //         try {
// //           p.playbackRate = rate;
// //         } catch {}
// //       }

// //       if (autoplay) {
// //         set({ stoppedByUser: false });
// //         try {
// //           p.play();
// //         } catch {}
// //       } else {
// //         try {
// //           p.pause();
// //         } catch {}
// //       }
// //     } catch (e: any) {
// //       set({ status: "error", error: e?.message ?? "Player error" });
// //     }
// //   },

// //   play: () => {
// //     const p = globalPlayer;
// //     set({ stoppedByUser: false });
// //     try {
// //       p.play();
// //     } catch {}
// //   },

// //   pause: () => {
// //     const p = globalPlayer;
// //     try {
// //       p.pause();
// //     } catch {}
// //   },

// //   toggle: () => {
// //     const { isPlaying } = get();
// //     const p = globalPlayer;
// //     if (isPlaying) {
// //       try {
// //         p.pause();
// //       } catch {}
// //     } else {
// //       set({ stoppedByUser: false });
// //       try {
// //         p.play();
// //       } catch {}
// //     }
// //   },

// //   seekBy: (delta) => {
// //     const p = globalPlayer;
// //     try {
// //       p.currentTime = Math.max(0, (p.currentTime || 0) + delta);
// //     } catch {}
// //   },

// //   setPosition: (seconds) => {
// //     const p = globalPlayer;
// //     const safe = Math.max(0, seconds || 0);
// //     try {
// //       p.currentTime = safe;
// //     } catch {}
// //     set({ position: safe });
// //   },

// //   setRate: (r) => {
// //     const p = globalPlayer;
// //     try {
// //       p.playbackRate = r;
// //     } catch {}
// //     set({ rate: r });
// //   },

// //   stopAndKeepSource: async () => {
// //     const p = globalPlayer;
// //     try {
// //       p.pause();
// //     } catch {}
// //     try {
// //       p.currentTime = 0;
// //     } catch {}
// //     set({
// //       isPlaying: false,
// //       position: 0,
// //       stoppedByUser: true,
// //       status: "stopped",
// //     });
// //   },

// //   stopAndUnload: async () => {
// //     const p = globalPlayer;
// //     try {
// //       p.pause();
// //     } catch {}
// //     try {
// //       if (typeof (p as any).replaceAsync === "function")
// //         await (p as any).replaceAsync(null);
// //       else (p as any).replace?.(null);
// //     } catch {}
// //     try {
// //       p.currentTime = 0;
// //     } catch {}
// //     set({
// //       isPlaying: false,
// //       position: 0,
// //       duration: 0,
// //       currentKey: undefined,
// //       currentUri: undefined,
// //       title: undefined,
// //       artwork: undefined,
// //       podcastId: undefined,
// //       filename: undefined,
// //       stoppedByUser: true,
// //       status: "stopped",
// //     });
// //   },

// //   _setPlaying: (b) => set({ isPlaying: b }),
// //   _setTime: (pos, dur) => {
// //     const next: Partial<PlayerState> = {
// //       position: typeof pos === "number" ? pos : 0,
// //     };
// //     if (typeof dur === "number" && dur > 0) next.duration = dur;
// //     set(next as any);
// //   },
// //   _setStatus: (s, error) => set({ status: s, error: error ?? null }),
// // }));


// //! Last worked
// // /player/useGlobalPlayer.ts
// import { create } from "zustand";
// import {
//   createVideoPlayer,
//   type VideoPlayer,
//   type VideoSource,
// } from "expo-video";

// const PLAYER_KEY = Symbol.for("app/globalVideoPlayer");

// function getOrCreatePlayer(): VideoPlayer {
//   const g = globalThis as any;
//   if (!g[PLAYER_KEY]) {
//     const p = createVideoPlayer(null);
//     p.staysActiveInBackground = true;
//     p.showNowPlayingNotification = true;
//     p.audioMixingMode = "auto"; // "mixWithOthers" | "duckOthers" | "auto" | "doNotMix"
//     p.timeUpdateEventInterval = 0.5; // seconds
//     g[PLAYER_KEY] = p;
//   }
//   return g[PLAYER_KEY] as VideoPlayer;
// }

// export const globalPlayer = getOrCreatePlayer();

// // Keep "stopped" in the union for backwards compat, but we won't set it on keepSource
// type PlayerStatus =
//   | "idle"
//   | "playing"
//   | "loading"
//   | "ready"
//   | "error"
//   | "stopped";

// type PlayerState = {
//   // playback mirrors
//   isPlaying: boolean;
//   position: number;
//   duration: number;
//   rate: number;

//   // loaded media
//   currentKey?: string;
//   currentUri?: string;
//   title?: string;
//   artwork?: string;
//   podcastId?: string | number;
//   filename?: string;

//   // ui/flow
//   status: PlayerStatus;
//   error?: string | null;
//   stoppedByUser: boolean;

//   // actions
//   load: (
//     src: VideoSource | null,
//     opts?: {
//       autoplay?: boolean;
//       title?: string;
//       artwork?: string;
//       podcastId?: string | number;
//       filename?: string;
//       rate?: number;
//     }
//   ) => Promise<void>;
//   play: () => void;
//   pause: () => void;
//   toggle: () => void;
//   seekBy: (deltaSeconds: number) => void;
//   setPosition: (seconds: number) => void;
//   setRate: (rate: number) => void;
//   stopAndKeepSource: () => Promise<void>;
//   stopAndUnload: () => Promise<void>;

//   // event-bridge setters
//   _setPlaying: (b: boolean) => void;
//   _setTime: (pos: number, dur?: number) => void;
//   _setStatus: (s: PlayerStatus, error?: string | null) => void;
// };

// function getSourceKey(src: VideoSource | null | undefined) {
//   if (src == null) return "unknown";
//   if (typeof src === "string") return src;
//   if (typeof src === "number") return `asset:${src}`;
//   if (
//     typeof src === "object" &&
//     "uri" in src &&
//     typeof (src as any).uri === "string"
//   ) {
//     return (src as any).uri as string;
//   }
//   if (
//     typeof src === "object" &&
//     "assetId" in src &&
//     typeof (src as any).assetId === "number"
//   ) {
//     return `asset:${(src as any).assetId}`;
//   }
//   return "unknown";
// }

// export const useGlobalPlayer = create<PlayerState>((set, get) => ({
//   isPlaying: false,
//   position: 0,
//   duration: 0,
//   rate: 1.0,

//   status: "idle",
//   error: null,
//   stoppedByUser: false,

//   load: async (src, opts) => {
//     const p = globalPlayer;
//     const {
//       autoplay = false,
//       title,
//       artwork,
//       podcastId,
//       filename,
//       rate,
//     } = opts ?? {};

//     set({ status: "loading", error: null });

//     try {
//       const nextKey = getSourceKey(src);

//       // Avoid reloading if same source already ready
//       if (get().currentKey === nextKey && get().status === "ready") {
//         if (typeof rate === "number") {
//           try {
//             p.playbackRate = rate;
//           } catch {}
//           set({ rate });
//         }
//         if (autoplay) {
//           set({ stoppedByUser: false, isPlaying: true, status: "playing" });
//           try {
//             p.play();
//           } catch {}
//         } else {
//           try {
//             p.pause();
//           } catch {}
//           set({ isPlaying: false, status: "ready" });
//         }
//         return;
//       }

//       // Replace source
//       if (typeof (p as any).replaceAsync === "function") {
//         await (p as any).replaceAsync(src);
//       } else {
//         (p as any).replace?.(src);
//       }

//       // Update metadata (keep source loaded, NOT stopped)
//       set({
//         currentKey: nextKey,
//         currentUri:
//           typeof src === "object" && src && "uri" in src
//             ? (src as any).uri
//             : undefined,
//         title: title ?? get().title,
//         artwork: artwork ?? get().artwork,
//         podcastId,
//         filename,
//         rate: typeof rate === "number" ? rate : get().rate,
//         stoppedByUser: false,
//         status: "ready",
//         error: null,
//       });

//       if (typeof rate === "number") {
//         try {
//           p.playbackRate = rate;
//         } catch {}
//       }

//       if (autoplay) {
//         try {
//           p.play();
//         } catch {}
//         set({ isPlaying: true, status: "playing", stoppedByUser: false });
//       } else {
//         try {
//           p.pause();
//         } catch {}
//         set({ isPlaying: false, status: "ready" });
//       }
//     } catch (e: any) {
//       set({ status: "error", error: e?.message ?? "Player error" });
//     }
//   },

//   play: () => {
//     const p = globalPlayer;
//     try {
//       p.play();
//     } catch {}
//     set({ isPlaying: true, status: "playing", stoppedByUser: false });
//   },

//   pause: () => {
//     const p = globalPlayer;
//     try {
//       p.pause();
//     } catch {}
//     set({ isPlaying: false, status: "ready" });
//   },

//   toggle: () => {
//     const { isPlaying } = get();
//     if (isPlaying) {
//       get().pause();
//     } else {
//       get().play();
//     }
//   },

//   seekBy: (delta) => {
//     const p = globalPlayer;
//     try {
//       if (typeof (p as any).seekBy === "function") {
//         (p as any).seekBy(delta);
//       } else {
//         p.currentTime = Math.max(0, (p.currentTime || 0) + delta);
//       }
//     } catch {}
//   },

//   setPosition: (seconds) => {
//     const p = globalPlayer;
//     const safe = Math.max(0, seconds || 0);
//     try {
//       p.currentTime = safe;
//     } catch {}
//     set({ position: safe });
//   },

//   setRate: (r) => {
//     const p = globalPlayer;
//     try {
//       p.playbackRate = r;
//     } catch {}
//     set({ rate: r });
//   },

//   // ✅ Keep source & controls; reset to 0; hide Mini via stoppedByUser
//   stopAndKeepSource: async () => {
//     const p = globalPlayer;
//     try {
//       p.pause();
//     } catch {}
//     try {
//       p.currentTime = 0;
//     } catch {}
//     set({
//       isPlaying: false,
//       position: 0,
//       status: "ready", // keep loaded/controllable
//       stoppedByUser: true, // Mini hides
//     });
//     // keep currentKey/currentUri/title/artwork/etc.
//   },

//   // ✅ Fully unload and hide Mini
//   stopAndUnload: async () => {
//     const p = globalPlayer;
//     try {
//       p.pause();
//     } catch {}
//     try {
//       if (typeof (p as any).replaceAsync === "function") {
//         await (p as any).replaceAsync(null);
//       } else {
//         (p as any).replace?.(null);
//       }
//     } catch {}
//     try {
//       p.currentTime = 0;
//     } catch {}
//     set({
//       isPlaying: false,
//       position: 0,
//       duration: 0,
//       currentKey: undefined,
//       currentUri: undefined,
//       title: undefined,
//       artwork: undefined,
//       podcastId: undefined,
//       filename: undefined,
//       stoppedByUser: true, // Mini hides
//       status: "idle", // not "stopped": back to idle/unloaded
//     });
//   },

//   // Event bridge (wire these from GlobalVideoHost using useEvent)
//   _setPlaying: (b) => set({ isPlaying: b, status: b ? "playing" : "ready" }),
//   _setTime: (pos, dur) => {
//     const next: Partial<PlayerState> = {
//       position: typeof pos === "number" ? pos : 0,
//     };
//     if (typeof dur === "number" && dur > 0) next.duration = dur;
//     set(next as any);
//   },
//   _setStatus: (s, error) => set({ status: s, error: error ?? null }),
// }));


// /player/useGlobalPlayer.ts
import { create } from "zustand";
import {
  createVideoPlayer,
  type VideoPlayer,
  type VideoSource,
} from "expo-video";

const PLAYER_KEY = Symbol.for("app/globalVideoPlayer");

function getOrCreatePlayer(): VideoPlayer {
  const g = globalThis as any;
  if (!g[PLAYER_KEY]) {
    const p = createVideoPlayer(null);
    p.staysActiveInBackground = true;
    p.showNowPlayingNotification = true;
    p.audioMixingMode = "auto"; // "mixWithOthers" | "duckOthers" | "auto" | "doNotMix"
    p.timeUpdateEventInterval = 0.5; // seconds
    g[PLAYER_KEY] = p;
  }
  return g[PLAYER_KEY] as VideoPlayer;
}

export const globalPlayer = getOrCreatePlayer();

// Keep "stopped" in the union for backwards compat, but we won't set it on keepSource
type PlayerStatus =
  | "idle"
  | "playing"
  | "loading"
  | "ready"
  | "error"
  | "stopped";

type PlayerState = {
  // playback mirrors
  isPlaying: boolean;
  position: number;
  duration: number;
  rate: number;

  // loaded media
  currentKey?: string;
  currentUri?: string;
  title?: string;
  artwork?: string;
  podcastId?: string | number;
  filename?: string;

  // ui/flow
  status: PlayerStatus;
  error?: string | null;
  stoppedByUser: boolean;

  // Quran handlers (refs to avoid stale closure leaks)
  _quranNextRef: { current?: () => void | Promise<void> };
  _quranPrevRef: { current?: () => void | Promise<void> };
  _setQuranHandlers: (
    next?: () => void | Promise<void>,
    prev?: () => void | Promise<void>,
  ) => void;
  _clearQuranHandlers: () => void;

  // actions
  load: (
    src: VideoSource | null,
    opts?: {
      autoplay?: boolean;
      title?: string;
      artwork?: string;
      podcastId?: string | number;
      filename?: string;
      rate?: number;
    },
  ) => Promise<void>;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seekBy: (deltaSeconds: number) => void;
  setPosition: (seconds: number) => void;
  setRate: (rate: number) => void;
  stopAndKeepSource: () => Promise<void>;
  stopAndUnload: () => Promise<void>;

  // event-bridge setters
  _setPlaying: (b: boolean) => void;
  _setTime: (pos: number, dur?: number) => void;
  _setStatus: (s: PlayerStatus, error?: string | null) => void;
};

function getSourceKey(src: VideoSource | null | undefined) {
  if (src == null) return "unknown";
  if (typeof src === "string") return src;
  if (typeof src === "number") return `asset:${src}`;
  if (
    typeof src === "object" &&
    "uri" in src &&
    typeof (src as any).uri === "string"
  ) {
    return (src as any).uri as string;
  }
  if (
    typeof src === "object" &&
    "assetId" in src &&
    typeof (src as any).assetId === "number"
  ) {
    return `asset:${(src as any).assetId}`;
  }
  return "unknown";
}

export const useGlobalPlayer = create<PlayerState>((set, get) => ({
  isPlaying: false,
  position: 0,
  duration: 0,
  rate: 1.0,

  status: "idle",
  error: null,
  stoppedByUser: false,

  _quranNextRef: { current: undefined },
  _quranPrevRef: { current: undefined },
  _setQuranHandlers: (next, prev) => {
    const s = get();
    s._quranNextRef.current = next;
    s._quranPrevRef.current = prev;
  },
  _clearQuranHandlers: () => {
    const s = get();
    s._quranNextRef.current = undefined;
    s._quranPrevRef.current = undefined;
  },

  load: async (src, opts) => {
    const p = globalPlayer;
    const {
      autoplay = false,
      title,
      artwork,
      podcastId,
      filename,
      rate,
    } = opts ?? {};

    set({ status: "loading", error: null });

    try {
      const nextKey = getSourceKey(src);

      // Avoid reloading if same source already ready
      if (get().currentKey === nextKey && get().status === "ready") {
        // still update metadata (lock screen / UI)
        set({
          title: title ?? get().title,
          artwork: artwork ?? get().artwork,
          podcastId,
          filename,
        });

        if (typeof rate === "number") {
          try {
            p.playbackRate = rate;
          } catch {}
          set({ rate });
        }

        if (autoplay) {
          set({ stoppedByUser: false, isPlaying: true, status: "playing" });
          try {
            p.play();
          } catch {}
        } else {
          try {
            p.pause();
          } catch {}
          set({ isPlaying: false, status: "ready" });
        }
        return;
      }

      // Replace source
      if (typeof (p as any).replaceAsync === "function") {
        await (p as any).replaceAsync(src);
      } else {
        (p as any).replace?.(src);
      }

      // Update metadata (keep source loaded, NOT stopped)
      set({
        currentKey: nextKey,
        currentUri:
          typeof src === "string"
            ? src
            : typeof src === "object" && src && "uri" in src
              ? (src as any).uri
              : undefined,
        title: title ?? get().title,
        artwork: artwork ?? get().artwork,
        podcastId,
        filename,
        rate: typeof rate === "number" ? rate : get().rate,
        stoppedByUser: false,
        status: "ready",
        error: null,
      });

      if (typeof rate === "number") {
        try {
          p.playbackRate = rate;
        } catch {}
      }

      if (autoplay) {
        try {
          p.play();
        } catch {}
        set({ isPlaying: true, status: "playing", stoppedByUser: false });
      } else {
        try {
          p.pause();
        } catch {}
        set({ isPlaying: false, status: "ready" });
      }
    } catch (e: any) {
      set({ status: "error", error: e?.message ?? "Player error" });
    }
  },

  play: () => {
    const p = globalPlayer;
    try {
      p.play();
    } catch {}
    set({ isPlaying: true, status: "playing", stoppedByUser: false });
  },

  pause: () => {
    const p = globalPlayer;
    try {
      p.pause();
    } catch {}
    set({ isPlaying: false, status: "ready" });
  },

  toggle: () => {
    const { isPlaying } = get();
    if (isPlaying) get().pause();
    else get().play();
  },

  seekBy: (delta) => {
    const p = globalPlayer;
    try {
      if (typeof (p as any).seekBy === "function") {
        (p as any).seekBy(delta);
      } else {
        p.currentTime = Math.max(0, (p.currentTime || 0) + delta);
      }
    } catch {}
  },

  setPosition: (seconds) => {
    const p = globalPlayer;
    const safe = Math.max(0, seconds || 0);
    try {
      p.currentTime = safe;
    } catch {}
    set({ position: safe });
  },

  setRate: (r) => {
    const p = globalPlayer;
    try {
      p.playbackRate = r;
    } catch {}
    set({ rate: r });
  },

  // Keep source & controls; reset to 0; hide Mini via stoppedByUser
  stopAndKeepSource: async () => {
    const p = globalPlayer;
    try {
      p.pause();
    } catch {}
    try {
      p.currentTime = 0;
    } catch {}
    set({
      isPlaying: false,
      position: 0,
      status: "ready",
      stoppedByUser: true,
    });
  },

  // Fully unload and hide Mini
  stopAndUnload: async () => {
    const p = globalPlayer;
    try {
      p.pause();
    } catch {}
    try {
      if (typeof (p as any).replaceAsync === "function") {
        await (p as any).replaceAsync(null);
      } else {
        (p as any).replace?.(null);
      }
    } catch {}
    try {
      p.currentTime = 0;
    } catch {}
    set({
      isPlaying: false,
      position: 0,
      duration: 0,
      currentKey: undefined,
      currentUri: undefined,
      title: undefined,
      artwork: undefined,
      podcastId: undefined,
      filename: undefined,
      stoppedByUser: true,
      status: "idle",
    });
  },

  _setPlaying: (b) => set({ isPlaying: b, status: b ? "playing" : "ready" }),
  _setTime: (pos, dur) => {
    const next: Partial<PlayerState> = {
      position: typeof pos === "number" ? pos : 0,
    };
    if (typeof dur === "number" && dur > 0) next.duration = dur;
    set(next as any);
  },
  _setStatus: (s, error) => set({ status: s, error: error ?? null }),
}));