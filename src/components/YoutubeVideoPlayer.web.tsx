import { YoutubePlayerState, YoutubeVideoPlayerProps } from "@/constants/Types";
import React, { useEffect, useMemo, useRef } from "react";
import { View, type ViewStyle } from "react-native";


type YoutubeApiPlayer = {
  playVideo?: () => void;
  pauseVideo?: () => void;
  destroy?: () => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLIFrameElement,
        options: {
          events?: {
            onStateChange?: (event: { data: number }) => void;
            onError?: () => void;
          };
        },
      ) => YoutubeApiPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<void> | null = null;

function loadYoutubeApi() {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.YT?.Player) {
    return Promise.resolve();
  }

  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise((resolve) => {
      const previousCallback = window.onYouTubeIframeAPIReady;

      window.onYouTubeIframeAPIReady = () => {
        previousCallback?.();
        resolve();
      };

      if (!document.getElementById("youtube-iframe-api")) {
        const script = document.createElement("script");
        script.id = "youtube-iframe-api";
        script.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(script);
      }
    });
  }

  return youtubeApiPromise;
}

function mapPlayerState(state: number): YoutubePlayerState | string {
  switch (state) {
    case -1:
      return "unstarted";
    case 0:
      return "ended";
    case 1:
      return "playing";
    case 2:
      return "paused";
    case 3:
      return "buffering";
    case 5:
      return "video cued";
    default:
      return String(state);
  }
}

export default function YoutubeVideoPlayer({
  videoId,
  width,
  height,
  play,
  initialPlayerParams,
  onChangeState,
  onError,
}: YoutubeVideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerRef = useRef<YoutubeApiPlayer | null>(null);

  const src = useMemo(() => {
    const params = new URLSearchParams({
      enablejsapi: "1",
      playsinline: "1",
      rel: "0",
      controls: "1",
    });

    if (typeof window !== "undefined") {
      params.set("origin", window.location.origin);
    }

    if (initialPlayerParams?.start !== undefined) {
      params.set("start", String(initialPlayerParams.start));
    }

    if (initialPlayerParams?.end !== undefined) {
      params.set("end", String(initialPlayerParams.end));
    }

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }, [initialPlayerParams?.end, initialPlayerParams?.start, videoId]);

  useEffect(() => {
    let cancelled = false;

    loadYoutubeApi().then(() => {
      if (cancelled || !iframeRef.current || !window.YT?.Player) return;

      playerRef.current = new window.YT.Player(iframeRef.current, {
        events: {
          onStateChange: (event) => {
            onChangeState?.(mapPlayerState(event.data));
          },
          onError,
        },
      });
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
  }, [onChangeState, onError, src]);

  useEffect(() => {
    if (play) {
      playerRef.current?.playVideo?.();
    } else {
      playerRef.current?.pauseVideo?.();
    }
  }, [play]);

  return (
    <View style={[containerStyle, { width, height }]}>
      <iframe
        ref={iframeRef}
        title={`YouTube video ${videoId}`}
        src={src}
        style={iframeStyle}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </View>
  );
}

const containerStyle: ViewStyle = {
  backgroundColor: "#000",
  overflow: "hidden",
};

const iframeStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  border: 0,
  display: "block",
};
