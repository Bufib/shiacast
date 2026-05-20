import {
  YoutubeVideoPlayerProps,
  type YoutubeVideoPlayerRef,
} from "@/constants/Types";
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import YoutubePlayer, {
  type YoutubeIframeRef,
} from "react-native-youtube-iframe";

const YoutubeVideoPlayer = forwardRef<
  YoutubeVideoPlayerRef,
  YoutubeVideoPlayerProps
>(function YoutubeVideoPlayer(
  {
    videoId,
    width,
    height,
    play,
    initialPlayerParams,
    onChangeState,
    onError,
    onReady,
  },
  ref,
) {
  const playerRef = useRef<YoutubeIframeRef | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      getCurrentTime: async () => {
        return playerRef.current?.getCurrentTime() ?? 0;
      },
      seekTo: (seconds, allowSeekAhead) => {
        playerRef.current?.seekTo(seconds, allowSeekAhead);
      },
    }),
    [],
  );

  return (
    <YoutubePlayer
      ref={playerRef}
      height={height}
      width={width}
      play={play}
      videoId={videoId}
      initialPlayerParams={initialPlayerParams}
      onChangeState={onChangeState}
      i18nIsDynamicList
      onError={onError}
      onReady={onReady}
      webViewStyle={{ backgroundColor: "#000" }}
    />
  );
});

export default YoutubeVideoPlayer;
