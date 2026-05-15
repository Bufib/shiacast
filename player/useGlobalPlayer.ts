//! Funktioniert perfket
import {
  createAudioPlayer,
  type AudioMetadata,
  type AudioPlayer,
  type AudioSource,
} from "expo-audio";
import { create } from "zustand";

const PLAYER_KEY = Symbol.for("app/globalPodcastAudioPlayer");

const LOCK_SCREEN_OPTIONS: Parameters<
  AudioPlayer["setActiveForLockScreen"]
>[2] = {
  showSeekBackward: true,
  showSeekForward: true,
};

type GlobalAudioObject = typeof globalThis &
  Record<symbol, AudioPlayer | undefined>;

type LegacySourceObject = {
  uri?: string;
  assetId?: number;
  headers?: Record<string, string>;
  name?: string;
  metadata?: {
    title?: string;
    artist?: string;
    artwork?: string;
  };
};

export type GlobalPlayerSource = AudioSource | LegacySourceObject;

export type PlayerStatus =
  | "idle"
  | "loading"
  | "ready"
  | "playing"
  | "error"
  | "stopped";

type LoadOptions = {
  autoplay?: boolean;
  title?: string;
  artist?: string;
  albumTitle?: string;
  artwork?: string;
  podcastId?: string | number;
  filename?: string;
  rate?: number;
};

type PlayerState = {
  isPlaying: boolean;
  position: number;
  duration: number;
  rate: number;

  currentKey?: string;
  currentUri?: string;
  title?: string;
  artwork?: string;
  podcastId?: string | number;
  filename?: string;

  status: PlayerStatus;
  error?: string | null;
  stoppedByUser: boolean;

  load: (src: GlobalPlayerSource | null, opts?: LoadOptions) => Promise<void>;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seekBy: (deltaSeconds: number) => void;
  setPosition: (seconds: number) => void;
  setRate: (rate: number) => void;
  stopAndKeepSource: () => Promise<void>;
  stopAndUnload: () => Promise<void>;

  _setPlaying: (isPlaying: boolean) => void;
  _setTime: (position: number, duration?: number) => void;
  _setStatus: (status: PlayerStatus, error?: string | null) => void;
};

function getOrCreatePlayer(): AudioPlayer {
  const globalObject = globalThis as GlobalAudioObject;
  const existingPlayer = globalObject[PLAYER_KEY];

  if (existingPlayer) {
    return existingPlayer;
  }

  const player = createAudioPlayer(null);
  globalObject[PLAYER_KEY] = player;

  return player;
}

export const globalPlayer = getOrCreatePlayer();

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Podcast player error";
}

function reportPlayerError(error: unknown) {
  if (__DEV__) {
    console.warn("[globalPodcastAudioPlayer]", getErrorMessage(error));
  }
}

function isObjectSource(
  src: GlobalPlayerSource | null | undefined,
): src is LegacySourceObject {
  return typeof src === "object" && src !== null;
}

function toAudioSource(src: GlobalPlayerSource | null): AudioSource | null {
  if (src === null || src === undefined) {
    return null;
  }

  if (typeof src === "string") {
    const uri = src.trim();
    return uri.length > 0 ? uri : null;
  }

  if (typeof src === "number") {
    return Number.isFinite(src) ? src : null;
  }

  if (!isObjectSource(src)) {
    return null;
  }

  const uri =
    typeof src.uri === "string" && src.uri.trim().length > 0
      ? src.uri.trim()
      : undefined;

  const assetId = typeof src.assetId === "number" ? src.assetId : undefined;

  if (!uri && assetId === undefined) {
    return null;
  }

  const source: {
    uri?: string;
    assetId?: number;
    headers?: Record<string, string>;
    name?: string;
  } = {};

  if (uri) {
    source.uri = uri;
  }

  if (assetId !== undefined) {
    source.assetId = assetId;
  }

  if (src.headers) {
    source.headers = src.headers;
  }

  if (src.name) {
    source.name = src.name;
  }

  return source as AudioSource;
}

function getSourceKey(src: GlobalPlayerSource | null | undefined): string {
  if (src == null) {
    return "unknown";
  }

  if (typeof src === "string") {
    const uri = src.trim();
    return uri.length > 0 ? uri : "unknown";
  }

  if (typeof src === "number") {
    return `asset:${src}`;
  }

  if (typeof src.uri === "string" && src.uri.trim().length > 0) {
    return src.uri.trim();
  }

  if (typeof src.assetId === "number") {
    return `asset:${src.assetId}`;
  }

  return "unknown";
}

function getSourceUri(src: GlobalPlayerSource | null | undefined) {
  if (typeof src === "string") {
    const uri = src.trim();
    return uri.length > 0 ? uri : undefined;
  }

  if (isObjectSource(src) && typeof src.uri === "string") {
    const uri = src.uri.trim();
    return uri.length > 0 ? uri : undefined;
  }

  return undefined;
}

function getMetadata(
  state: Pick<PlayerState, "title" | "artwork">,
  opts?: LoadOptions,
): AudioMetadata {
  return {
    title: opts?.title ?? state.title ?? "Podcast",
    artist: opts?.artist ?? "Podcast",
    albumTitle: opts?.albumTitle ?? "Podcast",
    artworkUrl: opts?.artwork ?? state.artwork,
  };
}

function activateLockScreen(
  player: AudioPlayer,
  state: Pick<PlayerState, "title" | "artwork" | "currentKey" | "currentUri">,
  opts?: LoadOptions,
) {
  if (!state.currentKey && !state.currentUri && !opts?.title) {
    return;
  }

  try {
    player.setActiveForLockScreen(
      true,
      getMetadata(state, opts),
      LOCK_SCREEN_OPTIONS,
    );
  } catch (error) {
    reportPlayerError(error);
  }
}

function updateLockScreenMetadata(
  player: AudioPlayer,
  state: Pick<PlayerState, "title" | "artwork">,
  opts?: LoadOptions,
) {
  try {
    player.updateLockScreenMetadata(getMetadata(state, opts));
  } catch (error) {
    reportPlayerError(error);
  }
}

function clearLockScreenControls(player: AudioPlayer) {
  try {
    player.clearLockScreenControls();
  } catch (error) {
    reportPlayerError(error);
  }
}

function runPlayerCommand(
  command: () => void,
  onError: (message: string) => void,
) {
  try {
    command();
    return true;
  } catch (error) {
    const message = getErrorMessage(error);

    reportPlayerError(error);
    onError(message);

    return false;
  }
}

async function runPlayerAsyncCommand(
  command: () => Promise<void>,
  onError: (message: string) => void,
) {
  try {
    await command();
    return true;
  } catch (error) {
    const message = getErrorMessage(error);

    reportPlayerError(error);
    onError(message);

    return false;
  }
}

export const useGlobalPlayer = create<PlayerState>((set, get) => ({
  isPlaying: false,
  position: 0,
  duration: 0,
  rate: 1,

  currentKey: undefined,
  currentUri: undefined,
  title: undefined,
  artwork: undefined,
  podcastId: undefined,
  filename: undefined,

  status: "idle",
  error: null,
  stoppedByUser: false,

  load: async (src, opts) => {
    if (src === null) {
      await get().stopAndUnload();
      return;
    }

    const player = globalPlayer;
    const source = toAudioSource(src);

    if (source === null) {
      const message = "Invalid podcast audio source";

      reportPlayerError(message);

      set({
        status: "error",
        error: message,
        isPlaying: false,
      });

      return;
    }

    const nextKey = getSourceKey(src);
    const nextUri = getSourceUri(src);
    const currentState = get();

    const sourceTitle = isObjectSource(src) ? src.metadata?.title : undefined;
    const sourceArtist = isObjectSource(src) ? src.metadata?.artist : undefined;
    const sourceArtwork = isObjectSource(src)
      ? src.metadata?.artwork
      : undefined;

    const requestedRate = opts?.rate;
    const nextRate =
      typeof requestedRate === "number" ? requestedRate : currentState.rate;

    const isSameSource =
      currentState.currentKey === nextKey &&
      currentState.status !== "idle" &&
      currentState.status !== "error";

    set({
      status: "loading",
      error: null,
    });

    if (!isSameSource) {
      const replaced = runPlayerCommand(
        () => player.replace(source),
        (message) =>
          set({
            status: "error",
            error: message,
            isPlaying: false,
          }),
      );

      if (!replaced) {
        return;
      }
    }

    const nextState = {
      currentKey: nextKey,
      currentUri: nextUri,
      title:
        opts?.title ??
        sourceTitle ??
        (isSameSource ? currentState.title : undefined),
      artwork:
        opts?.artwork ??
        sourceArtwork ??
        (isSameSource ? currentState.artwork : undefined),
      podcastId:
        opts?.podcastId ?? (isSameSource ? currentState.podcastId : undefined),
      filename:
        opts?.filename ?? (isSameSource ? currentState.filename : undefined),
      rate: nextRate,
      position: isSameSource ? currentState.position : 0,
      duration: isSameSource ? currentState.duration : 0,
      stoppedByUser: false,
      status: "ready" as PlayerStatus,
      error: null,
    };

    set(nextState);

    if (typeof requestedRate === "number") {
      runPlayerCommand(
        () => player.setPlaybackRate(requestedRate),
        (message) =>
          set({
            status: "error",
            error: message,
          }),
      );
    }

    if (opts?.autoplay) {
      activateLockScreen(player, nextState, {
        ...opts,
        artist: opts.artist ?? sourceArtist,
      });

      const played = runPlayerCommand(
        () => player.play(),
        (message) =>
          set({
            status: "error",
            error: message,
            isPlaying: false,
          }),
      );

      if (played) {
        set({
          isPlaying: true,
          status: "playing",
          stoppedByUser: false,
        });
      }

      return;
    }

    runPlayerCommand(
      () => player.pause(),
      (message) =>
        set({
          status: "error",
          error: message,
        }),
    );

    updateLockScreenMetadata(player, nextState, {
      ...opts,
      artist: opts?.artist ?? sourceArtist,
    });

    set({
      isPlaying: false,
      status: "ready",
    });
  },

  play: () => {
    const player = globalPlayer;
    const state = get();

    if (!state.currentKey) {
      set({
        isPlaying: false,
        status: "idle",
        error: null,
      });

      return;
    }

    activateLockScreen(player, state);

    const played = runPlayerCommand(
      () => player.play(),
      (message) =>
        set({
          status: "error",
          error: message,
          isPlaying: false,
        }),
    );

    if (played) {
      set({
        isPlaying: true,
        status: "playing",
        stoppedByUser: false,
        error: null,
      });
    }
  },

  pause: () => {
    const paused = runPlayerCommand(
      () => globalPlayer.pause(),
      (message) =>
        set({
          status: "error",
          error: message,
        }),
    );

    if (paused) {
      set({
        isPlaying: false,
        status: get().currentKey ? "ready" : "idle",
      });
    }
  },

  toggle: () => {
    if (get().isPlaying) {
      get().pause();
      return;
    }

    get().play();
  },

  seekBy: (deltaSeconds) => {
    const state = get();

    if (!state.currentKey) {
      return;
    }

    const maxDuration =
      state.duration > 0 ? state.duration : Number.MAX_SAFE_INTEGER;
    const nextPosition = Math.min(
      maxDuration,
      Math.max(0, state.position + deltaSeconds),
    );

    void runPlayerAsyncCommand(
      () => globalPlayer.seekTo(nextPosition),
      (message) =>
        set({
          status: "error",
          error: message,
        }),
    );

    set({
      position: nextPosition,
    });
  },

  setPosition: (seconds) => {
    const state = get();

    if (!state.currentKey) {
      return;
    }

    const safeSeconds = Number.isFinite(seconds) ? seconds : 0;
    const maxDuration =
      state.duration > 0 ? state.duration : Number.MAX_SAFE_INTEGER;
    const nextPosition = Math.min(maxDuration, Math.max(0, safeSeconds));

    void runPlayerAsyncCommand(
      () => globalPlayer.seekTo(nextPosition),
      (message) =>
        set({
          status: "error",
          error: message,
        }),
    );

    set({
      position: nextPosition,
    });
  },

  setRate: (rate) => {
    if (!Number.isFinite(rate) || rate <= 0) {
      return;
    }

    const changed = runPlayerCommand(
      () => globalPlayer.setPlaybackRate(rate),
      (message) =>
        set({
          status: "error",
          error: message,
        }),
    );

    if (changed) {
      set({
        rate,
      });
    }
  },

  stopAndKeepSource: async () => {
    const player = globalPlayer;

    const paused = runPlayerCommand(
      () => player.pause(),
      (message) =>
        set({
          status: "error",
          error: message,
        }),
    );

    if (!paused) {
      return;
    }

    await runPlayerAsyncCommand(
      () => player.seekTo(0),
      (message) =>
        set({
          status: "error",
          error: message,
        }),
    );

    clearLockScreenControls(player);

    set({
      isPlaying: false,
      position: 0,
      status: get().currentKey ? "ready" : "idle",
      stoppedByUser: true,
    });
  },

  stopAndUnload: async () => {
    const player = globalPlayer;

    runPlayerCommand(
      () => player.pause(),
      (message) =>
        set({
          status: "error",
          error: message,
        }),
    );

    await runPlayerAsyncCommand(
      () => player.seekTo(0),
      (message) =>
        set({
          status: "error",
          error: message,
        }),
    );

    clearLockScreenControls(player);

    /*
      Important:
      Do not call player.replace(null).
      On some expo-audio/native versions this can crash with:
      "Cannot convert Optional(nil) to AudioSource".
      Instead, reset the store and block play() when no currentKey exists.
    */
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
      status: "idle",
      error: null,
      stoppedByUser: true,
    });
  },

  _setPlaying: (isPlaying) => {
    set((state) => ({
      isPlaying,
      status: isPlaying ? "playing" : state.currentKey ? "ready" : "idle",
    }));
  },

  _setTime: (position, duration) => {
    const safePosition =
      Number.isFinite(position) && position > 0 ? position : 0;

    const nextState: Partial<PlayerState> = {
      position: safePosition,
    };

    if (typeof duration === "number" && Number.isFinite(duration)) {
      nextState.duration = Math.max(0, duration);
    }

    set(nextState);
  },

  _setStatus: (status, error) => {
    set({
      status,
      error: error ?? null,
    });
  },
}));

// import {
//   createAudioPlayer,
//   type AudioMetadata,
//   type AudioPlayer,
//   type AudioSource,
// } from "expo-audio";
// import { create } from "zustand";

// const PLAYER_KEY = Symbol.for("app/globalPodcastAudioPlayer");

// const LOCK_SCREEN_OPTIONS: Parameters<
//   AudioPlayer["setActiveForLockScreen"]
// >[2] = {
//   showSeekBackward: true,
//   showSeekForward: true,
// };
// type GlobalAudioObject = typeof globalThis &
//   Record<symbol, AudioPlayer | undefined>;

// type LegacySourceObject = {
//   uri?: string;
//   assetId?: number;
//   headers?: Record<string, string>;
//   name?: string;
//   metadata?: {
//     title?: string;
//     artist?: string;
//     artwork?: string;
//   };
// };

// export type GlobalPlayerSource = AudioSource | LegacySourceObject;

// export type PlayerStatus =
//   | "idle"
//   | "loading"
//   | "ready"
//   | "playing"
//   | "error"
//   | "stopped";

// type LoadOptions = {
//   autoplay?: boolean;
//   title?: string;
//   artist?: string;
//   albumTitle?: string;
//   artwork?: string;
//   podcastId?: string | number;
//   filename?: string;
//   rate?: number;
// };

// type PlayerState = {
//   isPlaying: boolean;
//   position: number;
//   duration: number;
//   rate: number;

//   currentKey?: string;
//   currentUri?: string;
//   title?: string;
//   artwork?: string;
//   podcastId?: string | number;
//   filename?: string;

//   status: PlayerStatus;
//   error?: string | null;
//   stoppedByUser: boolean;
//   isScrubbing: boolean;

//   load: (src: GlobalPlayerSource | null, opts?: LoadOptions) => Promise<void>;
//   play: () => void;
//   pause: () => void;
//   toggle: () => void;
//   seekBy: (deltaSeconds: number) => void;
//   setPosition: (seconds: number) => void;
//   setRate: (rate: number) => void;
//   setScrubbing: (isScrubbing: boolean) => void;
//   stopAndKeepSource: () => Promise<void>;
//   stopAndUnload: () => Promise<void>;

//   _setPlaying: (isPlaying: boolean) => void;
//   _setTime: (position: number, duration?: number) => void;
//   _setStatus: (status: PlayerStatus, error?: string | null) => void;
// };

// function getOrCreatePlayer(): AudioPlayer {
//   const globalObject = globalThis as GlobalAudioObject;
//   const existingPlayer = globalObject[PLAYER_KEY];

//   if (existingPlayer) {
//     return existingPlayer;
//   }

//   const player = createAudioPlayer(null);
//   globalObject[PLAYER_KEY] = player;

//   return player;
// }

// export const globalPlayer = getOrCreatePlayer();

// function getErrorMessage(error: unknown): string {
//   if (error instanceof Error) {
//     return error.message;
//   }

//   if (typeof error === "string") {
//     return error;
//   }

//   return "Podcast player error";
// }

// function reportPlayerError(error: unknown) {
//   if (__DEV__) {
//     console.warn("[globalPodcastAudioPlayer]", getErrorMessage(error));
//   }
// }

// function isObjectSource(
//   src: GlobalPlayerSource | null | undefined,
// ): src is LegacySourceObject {
//   return typeof src === "object" && src !== null;
// }

// function toAudioSource(src: GlobalPlayerSource | null): AudioSource | null {
//   if (src === null || src === undefined) {
//     return null;
//   }

//   if (typeof src === "string") {
//     const uri = src.trim();
//     return uri.length > 0 ? uri : null;
//   }

//   if (typeof src === "number") {
//     return Number.isFinite(src) ? src : null;
//   }

//   if (!isObjectSource(src)) {
//     return null;
//   }

//   const uri =
//     typeof src.uri === "string" && src.uri.trim().length > 0
//       ? src.uri.trim()
//       : undefined;

//   const assetId = typeof src.assetId === "number" ? src.assetId : undefined;

//   if (!uri && assetId === undefined) {
//     return null;
//   }

//   const source: {
//     uri?: string;
//     assetId?: number;
//     headers?: Record<string, string>;
//     name?: string;
//   } = {};

//   if (uri) {
//     source.uri = uri;
//   }

//   if (assetId !== undefined) {
//     source.assetId = assetId;
//   }

//   if (src.headers) {
//     source.headers = src.headers;
//   }

//   if (src.name) {
//     source.name = src.name;
//   }

//   return source as AudioSource;
// }

// function getSourceKey(src: GlobalPlayerSource | null | undefined): string {
//   if (src == null) {
//     return "unknown";
//   }

//   if (typeof src === "string") {
//     const uri = src.trim();
//     return uri.length > 0 ? uri : "unknown";
//   }

//   if (typeof src === "number") {
//     return `asset:${src}`;
//   }

//   if (typeof src.uri === "string" && src.uri.trim().length > 0) {
//     return src.uri.trim();
//   }

//   if (typeof src.assetId === "number") {
//     return `asset:${src.assetId}`;
//   }

//   return "unknown";
// }

// function getSourceUri(src: GlobalPlayerSource | null | undefined) {
//   if (typeof src === "string") {
//     const uri = src.trim();
//     return uri.length > 0 ? uri : undefined;
//   }

//   if (isObjectSource(src) && typeof src.uri === "string") {
//     const uri = src.uri.trim();
//     return uri.length > 0 ? uri : undefined;
//   }

//   return undefined;
// }

// function getMetadata(
//   state: Pick<PlayerState, "title" | "artwork">,
//   opts?: LoadOptions,
// ): AudioMetadata {
//   return {
//     title: opts?.title ?? state.title ?? "Podcast",
//     artist: opts?.artist ?? "Podcast",
//     albumTitle: opts?.albumTitle ?? "Podcast",
//     artworkUrl: opts?.artwork ?? state.artwork,
//   };
// }

// function activateLockScreen(
//   player: AudioPlayer,
//   state: Pick<PlayerState, "title" | "artwork" | "currentKey" | "currentUri">,
//   opts?: LoadOptions,
// ) {
//   if (!state.currentKey && !state.currentUri && !opts?.title) {
//     return;
//   }

//   try {
//     player.setActiveForLockScreen(
//       true,
//       getMetadata(state, opts),
//       LOCK_SCREEN_OPTIONS,
//     );
//   } catch (error) {
//     reportPlayerError(error);
//   }
// }

// function updateLockScreenMetadata(
//   player: AudioPlayer,
//   state: Pick<PlayerState, "title" | "artwork">,
//   opts?: LoadOptions,
// ) {
//   try {
//     player.updateLockScreenMetadata(getMetadata(state, opts));
//   } catch (error) {
//     reportPlayerError(error);
//   }
// }

// function clearLockScreenControls(player: AudioPlayer) {
//   try {
//     player.clearLockScreenControls();
//   } catch (error) {
//     reportPlayerError(error);
//   }
// }

// function runPlayerCommand(
//   command: () => void,
//   onError: (message: string) => void,
// ) {
//   try {
//     command();
//     return true;
//   } catch (error) {
//     const message = getErrorMessage(error);

//     reportPlayerError(error);
//     onError(message);

//     return false;
//   }
// }

// async function runPlayerAsyncCommand(
//   command: () => Promise<void>,
//   onError: (message: string) => void,
// ) {
//   try {
//     await command();
//     return true;
//   } catch (error) {
//     const message = getErrorMessage(error);

//     reportPlayerError(error);
//     onError(message);

//     return false;
//   }
// }

// export const useGlobalPlayer = create<PlayerState>((set, get) => ({
//   isPlaying: false,
//   position: 0,
//   duration: 0,
//   rate: 1,

//   currentKey: undefined,
//   currentUri: undefined,
//   title: undefined,
//   artwork: undefined,
//   podcastId: undefined,
//   filename: undefined,

//   status: "idle",
//   error: null,
//   stoppedByUser: false,
//   isScrubbing: false,

//   load: async (src, opts) => {
//     if (src === null) {
//       await get().stopAndUnload();
//       return;
//     }

//     const player = globalPlayer;
//     const source = toAudioSource(src);

//     if (source === null) {
//       const message = "Invalid podcast audio source";

//       reportPlayerError(message);

//       set({
//         status: "error",
//         error: message,
//         isPlaying: false,
//       });

//       return;
//     }

//     const nextKey = getSourceKey(src);
//     const nextUri = getSourceUri(src);
//     const currentState = get();

//     const sourceTitle = isObjectSource(src) ? src.metadata?.title : undefined;
//     const sourceArtist = isObjectSource(src) ? src.metadata?.artist : undefined;
//     const sourceArtwork = isObjectSource(src)
//       ? src.metadata?.artwork
//       : undefined;

//     const requestedRate = opts?.rate;
//     const nextRate =
//       typeof requestedRate === "number" ? requestedRate : currentState.rate;

//     const isSameSource =
//       currentState.currentKey === nextKey &&
//       currentState.status !== "idle" &&
//       currentState.status !== "error";

//     // Clear stale error. Status will be synced by GlobalAudioHost
//     // from the native player's actual lifecycle.
//     set({ error: null });

//     if (!isSameSource) {
//       const replaced = runPlayerCommand(
//         () => player.replace(source),
//         (message) =>
//           set({
//             status: "error",
//             error: message,
//             isPlaying: false,
//           }),
//       );

//       if (!replaced) {
//         return;
//       }
//     }

//     // Facts only — no status, no isPlaying. The host owns runtime status.
//     const nextFacts = {
//       currentKey: nextKey,
//       currentUri: nextUri,
//       title:
//         opts?.title ??
//         sourceTitle ??
//         (isSameSource ? currentState.title : undefined),
//       artwork:
//         opts?.artwork ??
//         sourceArtwork ??
//         (isSameSource ? currentState.artwork : undefined),
//       podcastId:
//         opts?.podcastId ?? (isSameSource ? currentState.podcastId : undefined),
//       filename:
//         opts?.filename ?? (isSameSource ? currentState.filename : undefined),
//       rate: nextRate,
//       position: isSameSource ? currentState.position : 0,
//       duration: isSameSource ? currentState.duration : 0,
//       stoppedByUser: false,
//       error: null,
//     };

//     set(nextFacts);

//     if (typeof requestedRate === "number") {
//       runPlayerCommand(
//         () => player.setPlaybackRate(requestedRate),
//         (message) =>
//           set({
//             status: "error",
//             error: message,
//           }),
//       );
//     }

//     if (opts?.autoplay) {
//       activateLockScreen(player, nextFacts, {
//         ...opts,
//         artist: opts.artist ?? sourceArtist,
//       });

//       runPlayerCommand(
//         () => player.play(),
//         (message) =>
//           set({
//             status: "error",
//             error: message,
//             isPlaying: false,
//           }),
//       );

//       return;
//     }

//     runPlayerCommand(
//       () => player.pause(),
//       (message) =>
//         set({
//           status: "error",
//           error: message,
//         }),
//     );

//     updateLockScreenMetadata(player, nextFacts, {
//       ...opts,
//       artist: opts?.artist ?? sourceArtist,
//     });
//   },

//   play: () => {
//     const player = globalPlayer;
//     const state = get();

//     if (!state.currentKey) {
//       return;
//     }

//     activateLockScreen(player, state);

//     const played = runPlayerCommand(
//       () => player.play(),
//       (message) =>
//         set({
//           status: "error",
//           error: message,
//           isPlaying: false,
//         }),
//     );

//     if (played) {
//       // Optimistic isPlaying for snappy UI; host confirms via subscription.
//       // Status is intentionally not written here — host owns it.
//       set({
//         isPlaying: true,
//         stoppedByUser: false,
//         error: null,
//       });
//     }
//   },

//   pause: () => {
//     const paused = runPlayerCommand(
//       () => globalPlayer.pause(),
//       (message) =>
//         set({
//           status: "error",
//           error: message,
//         }),
//     );

//     if (paused) {
//       // Optimistic isPlaying; host syncs status.
//       set({ isPlaying: false });
//     }
//   },

//   toggle: () => {
//     if (get().isPlaying) {
//       get().pause();
//       return;
//     }

//     get().play();
//   },

//   seekBy: (deltaSeconds) => {
//     const state = get();

//     if (!state.currentKey) {
//       return;
//     }

//     const maxDuration =
//       state.duration > 0 ? state.duration : Number.MAX_SAFE_INTEGER;
//     const nextPosition = Math.min(
//       maxDuration,
//       Math.max(0, state.position + deltaSeconds),
//     );

//     void runPlayerAsyncCommand(
//       () => globalPlayer.seekTo(nextPosition),
//       (message) =>
//         set({
//           status: "error",
//           error: message,
//         }),
//     );

//     set({
//       position: nextPosition,
//     });
//   },

//   setPosition: (seconds) => {
//     const state = get();

//     if (!state.currentKey) {
//       return;
//     }

//     const safeSeconds = Number.isFinite(seconds) ? seconds : 0;
//     const maxDuration =
//       state.duration > 0 ? state.duration : Number.MAX_SAFE_INTEGER;
//     const nextPosition = Math.min(maxDuration, Math.max(0, safeSeconds));

//     void runPlayerAsyncCommand(
//       () => globalPlayer.seekTo(nextPosition),
//       (message) =>
//         set({
//           status: "error",
//           error: message,
//         }),
//     );

//     set({
//       position: nextPosition,
//     });
//   },

//   setRate: (rate) => {
//     if (!Number.isFinite(rate) || rate <= 0) {
//       return;
//     }

//     const changed = runPlayerCommand(
//       () => globalPlayer.setPlaybackRate(rate),
//       (message) =>
//         set({
//           status: "error",
//           error: message,
//         }),
//     );

//     if (changed) {
//       set({
//         rate,
//       });
//     }
//   },

//   setScrubbing: (isScrubbing) => {
//     set({ isScrubbing });
//   },

//   stopAndKeepSource: async () => {
//     const player = globalPlayer;

//     const paused = runPlayerCommand(
//       () => player.pause(),
//       (message) =>
//         set({
//           status: "error",
//           error: message,
//         }),
//     );

//     if (!paused) {
//       return;
//     }

//     await runPlayerAsyncCommand(
//       () => player.seekTo(0),
//       (message) =>
//         set({
//           status: "error",
//           error: message,
//         }),
//     );

//     clearLockScreenControls(player);

//     // Encode user intent. Host's stoppedByUser-aware mapping will
//     // settle status to "ready" since the source is still loaded.
//     set({
//       isPlaying: false,
//       position: 0,
//       stoppedByUser: true,
//     });
//   },

//   stopAndUnload: async () => {
//     const player = globalPlayer;

//     runPlayerCommand(
//       () => player.pause(),
//       (message) =>
//         set({
//           status: "error",
//           error: message,
//         }),
//     );

//     await runPlayerAsyncCommand(
//       () => player.seekTo(0),
//       (message) =>
//         set({
//           status: "error",
//           error: message,
//         }),
//     );

//     clearLockScreenControls(player);

//     /*
//       Important:
//       Do not call player.replace(null).
//       On some expo-audio/native versions this can crash with:
//       "Cannot convert Optional(nil) to AudioSource".
//       Instead, reset the store and block play() when no currentKey exists.

//       Status is set to "idle" manually here because the native player
//       still reports isLoaded: true (no replace(null)), so the host
//       needs the explicit signal. The host also force-maps to "idle"
//       whenever currentKey is undefined, so this is belt-and-braces.
//     */
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
//       status: "idle",
//       error: null,
//       stoppedByUser: true,
//       isScrubbing: false,
//     });
//   },

//   _setPlaying: (isPlaying) => {
//     // No status side-effect. Host calls _setStatus separately on the
//     // same tick, which is the single source of truth for status.
//     set({ isPlaying });
//   },

//   _setTime: (position, duration) => {
//     const state = get();
//     const safePosition =
//       Number.isFinite(position) && position > 0 ? position : 0;

//     const nextState: Partial<PlayerState> = {};

//     // Don't fight the user's drag — the slider owns position while scrubbing.
//     if (!state.isScrubbing) {
//       nextState.position = safePosition;
//     }

//     if (typeof duration === "number" && Number.isFinite(duration)) {
//       nextState.duration = Math.max(0, duration);
//     }

//     set(nextState);
//   },

//   _setStatus: (status, error) => {
//     set({
//       status,
//       error: error ?? null,
//     });
//   },
// }));
