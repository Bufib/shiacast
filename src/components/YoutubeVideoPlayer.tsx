import { YoutubeVideoPlayerProps } from "@/constants/Types";
import YoutubePlayer from "react-native-youtube-iframe";

export default function YoutubeVideoPlayer({
  videoId,
  width,
  height,
  play,
  initialPlayerParams,
  onChangeState,
  onError,
}: YoutubeVideoPlayerProps) {
  return (
    <YoutubePlayer
      height={height}
      width={width}
      play={play}
      videoId={videoId}
      initialPlayerParams={initialPlayerParams}
      onChangeState={onChangeState}
      i18nIsDynamicList
      onError={onError}
      webViewStyle={{ backgroundColor: "#000" }}
    />
  );
}
