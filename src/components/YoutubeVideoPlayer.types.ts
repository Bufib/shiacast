export type YoutubePlayerState =
  | "unstarted"
  | "ended"
  | "playing"
  | "paused"
  | "buffering"
  | "video cued";

export type YoutubeVideoPlayerParams = {
  start?: number;
  end?: number;
};

export type YoutubeVideoPlayerProps = {
  videoId: string;
  width: number;
  height: number;
  play: boolean;
  initialPlayerParams?: YoutubeVideoPlayerParams;
  onChangeState?: (state: YoutubePlayerState | string) => void;
  onError?: () => void;
};
