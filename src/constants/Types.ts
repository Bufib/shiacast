// Sprache
export type LanguageCode = "de" | "ar" | "en";

export type LanguageContextType = {
  lang: LanguageCode;
  setAppLanguage: (lng: LanguageCode) => Promise<void>;
  ready: boolean;
  rtl: boolean;
  hasStoredLanguage: boolean;
};

// Layout-Sizes (für LanguageSwitcher)
export type SizesType = {
  fontSize: number;
  badgeSize: number;
  iconSize: number;
  imageSize: number;
  gap: number;
  emptyIconSize: number;
  emptyTextSize: number;
  emptyGap: number;
  previewSizes: number;
  previewSizesPaddingHorizontal: number;
  isTablet: boolean;
  isLarge: boolean;
  isMedium: boolean;
  isSmall: boolean;
  fontsizeHomeHeaders: number;
  fontsizeHomeShowAll: number;
};

// Gradients
export type UseGradientOptionsType = {
  customGradients?: string[][];
  defaultIndex?: number;
};

// Videos (gespeichert in Supabase-Tabelle `podcasts` – Legacy-Name)
export type VideoType = {
  id: number;
  title: string;
  description: string;
  url?: string | null;
  youtube_url?: string | null;
  youtube_video_url?: string | null;
  video_url?: string | null;
  start?: string | number | null;
  end?: string | number | null;
  start_time?: string | number | null;
  end_time?: string | number | null;
  video_start?: string | number | null;
  video_end?: string | number | null;
  youtube_start?: string | number | null;
  youtube_end?: string | number | null;
  youtube_start_seconds?: string | number | null;
  youtube_end_seconds?: string | number | null;
  language_code?: string;
  created_at: string;
  podcast_topic?: string;
  podcast_author?: string;
  image_filename?: string | null;
  image_url: string | null;
  image_cache_key?: string | null;
};

export type VideoGridCardType = {
  video: VideoType;
  width: number;
  rtl: boolean;
  lang: string;
  /**
   * Optional. Wenn weggelassen, wählt VideoGridCard einen deterministischen
   * Gradient anhand der Video-ID.
   */
  gradientColors?: readonly [string, string, ...string[]] | string[];
  isPlaying?: boolean;
  onRequestPlay?: () => void;
  onStopPlaying?: () => void;
};

// YouTube-Player
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
