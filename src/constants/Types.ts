
export type LanguageCode = "de" | "ar" | "en";

/** Alias — prefer LanguageCode in new code. */
export type Language = LanguageCode;

export type LanguageContextType = {
  lang: LanguageCode;
  setAppLanguage: (lng: LanguageCode) => Promise<void>;
  ready: boolean;
  rtl: boolean;
  hasStoredLanguage: boolean;
};

export type LanguageType = {
  id: number;
  language_code: string;
};

export type InternalLinkType = "questionLink" | "prayerLink" | "quranLink";

export type SizesType = {
  imageSizePodcastPlayer: number;
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

export type UseGradientOptionsType = {
  customGradients?: string[][];
  defaultIndex?: number;
};

export type ActiveSheet = "articles" | "podcasts" | "pdfs" | null;

export type triggerRefreshFavoritesType = {
  favoritesRefreshed: number;
  triggerRefreshFavorites: () => void;
};

export type DatasetVersionsType = {
  question_data_version: string | null;
  quran_data_version: string | null;
  calendar_data_version: string | null;
  prayer_data_version: string | null;
  app_version: string | null;
};

export type VersionType = {
  id: number;
  database_version: string;
  appVersion: string;
};

export type WithLangType = {
  language_code?: string | null;
  id?: number | string;
};

export type SupabaseRealtimeContextType = {
  userId: string | null;
  hasNewNewsData: boolean;
  clearNewNewsFlag: () => void;
};

// ─── Quran ──────────────────────────────────────────────────────────────────

/**
 * Raw row from the `sura` table.
 * Note: there is NO `label_ar` column — `label` already holds the Arabic name.
 */
export type SuraRowType = {
  id: number;
  orderId: number;
  label: string; // Arabic name
  label_en: string | null;
  label_de: string | null;
  nbAyat: number;
  nbWord: number;
  nbLetter: number;
  startPage: number;
  endPage: number;
  makki: number; // 1 = Makki, 0 = Madani
  ruku: number | null;
};

/**
 * UI-friendly sura type. Maps `label` → `label_ar` for convenience.
 * Use when you need all three localized labels in the same object.
 */
export type SuraType = SuraRowType & {
  label_ar: string;
};

/**
 * A single verse as returned by getSurahVerses / getAyah / getJuzVerses.
 * `text` is language-dependent (aliased from the per-lang column).
 *
 * Fixed: removed phantom `podcastId` / `filename` fields that no Quran query returns.
 */
export type QuranVerseType = {
  sura: number;
  aya: number;
  text: string;
  transliteration?: string | null;
};

export interface AyahType {
  id: number;
  sura: number;
  aya: number;
  text: string;
  transliteration?: string;
}

export type MarkerRowType = {
  id: number;
  sura: number;
  aya: number;
};

export type QuranMarkerType = {
  id: number;
  sura: number;
  aya: number;
  type?: number;
  page?: number;
};

export type JuzRow = MarkerRowType & {
  page: number;
};

export type JuzStartType = {
  juz: number;
  sura: number;
  aya: number;
  page: number | null;
};

export type JuzBoundsType = {
  startSura: number;
  startAya: number;
  endSura: number | null;
  endAya: number | null;
};

export type FavoriteSuraType = {
  id: number;
  sura: number;
  created_at: string;
};

export type FavoriteJuzType = {
  id: number;
  juz: number;
  created_at: string;
};

export type FavoritePageType = {
  id: number;
  page: number;
  created_at: string;
};

export type FavoriteQuranItemType = {
  type: "verse" | "sura" | "juz" | "page";
  id: string;
  title: string;
  subtitle?: string;
  sura?: number;
  aya?: number;
  juz?: number;
  page?: number;
  created_at: string;
};

export type QuranInternalResultType = {
  sura: number;
  aya: number;
  text: string | null;
  sura_label_ar?: string | null;
  sura_label_en?: string | null;
  sura_label_de?: string | null;
};

export interface QuranDisplayData {
  sura: SuraType;
  ayahs: AyahType[];
  markers: {
    hizb?: QuranMarkerType[];
    juz?: QuranMarkerType[];
    ruku?: QuranMarkerType[];
    sajda?: QuranMarkerType[];
  };
}

export type UseSuraDataParams = {
  lang: LanguageCode;
  suraNumber: number;
  isJuzMode: boolean;
  juzNumber: number | null;
  isPageMode: boolean;
  pageNumber: number | null;
  setTotalVerses: (sura: number, total: number) => void;
  setTotalVersesForJuz: (juz: number, total: number) => void;
  setTotalVersesForPage: (page: number, total: number) => void;
  quranDataVersion: number;
};

export type StickyHeaderQuranPropsType = {
  suraNumber: number;
  suraInfo: SuraRowType | null;
  displayName: string | null;
  juzHeader?: { title: string; subtitle?: string } | null;
  juzNumber?: number | null;
  pageNumber?: number | null;
};

export type VerseCardProps = {
  item: QuranVerseType;
  arabicVerse?: QuranVerseType;
  isBookmarked: boolean;
  isJuzMode: boolean;
  translitContentWidth: number;
  hasTafsir: boolean;
  onBookmark: (verse: QuranVerseType) => void;
  onOpenInfo: (verse: QuranVerseType, arabicVerse?: QuranVerseType) => void;
  translitBaseStyle: any;
  language: string;
};

// ─── Prayer ─────────────────────────────────────────────────────────────────

export type PrayerType = {
  id: number;
  name: string;
  arabic_title?: string;
  category_id: number;
  created_at: string;
  updated_at: Date;
  translated_languages?: string[];
  arabic_text?: string;
  arabic_notes?: string;
  transliteration_text?: string;
  source?: string;
  arabic_introduction?: string;
};

export type PrayerRecommendationType = {
  id: number;
  recommendation_content: string;
  language_code: string;
};

/**
 * Raw DB row before JSON parsing.
 * `translated_languages` is a JSON-encoded TEXT column in SQLite.
 */
export type PrayerRow = {
  id: number;
  name: string;
  arabic_title?: string;
  category_id: number;
  arabic_introduction?: string;
  arabic_text?: string;
  arabic_notes?: string;
  transliteration_text?: string;
  source?: string;
  translated_languages: string; // JSON string — parse before use
  created_at: string;
  updated_at: string; // ISO string from SQLite
};

export type PrayerWithTranslationType = {
  id: number;
  prayer_id: number;
  language_code: string;
  translated_title: string | null;
  translated_introduction?: string;
  translated_text?: string;
  source?: string;
  created_at: string;
  updated_at: Date;
  translated_notes?: string;
};

/**
 * Full prayer with all its translations.
 *
 * Fixed: no longer intersects PrayerWithTranslationType which caused
 * conflicting `id`, `created_at`, `source`, `updated_at` fields.
 */
export type FullPrayer = PrayerType & {
  translations: PrayerWithTranslationType[];
};

/**
 * `parent_id` is stored as a JSON TEXT column (e.g. `[1,5]`).
 * Queries use `json_each(pc.parent_id)` to traverse.
 *
 * Fixed: changed from `number[]` to `string | null` to match SQLite reality.
 */
export type PrayerCategoryType = {
  id: number;
  title: string;
  parent_id?: string | null; // JSON string — parse when needed
  language_code: string;
};

export type PrayerWithCategory = {
  id: number;
  name: string;
  arabic_title?: string;
  translated_title?: string | null;
  prayer_text: string;
  category_id: number;
};

export type PrayerSearchResult = {
  id: number;
  name: string;
  arabic_title: string | null;
  category_id: number;
  translated_text: string | null;
  matchType: "name" | "translation";
};

export type FavoritePrayerFolderType = {
  name: string;
  color: string;
  prayerCount?: number;
};

export type PrayerQuestionLinksType = {
  id: number;
  name: string;
  image: any;
  value: string;
};

export type IntroTranslation = {
  language_code: string;
  translated_introduction?: string | null;
};

export type PrayerMinimal = {
  translations: IntroTranslation[];
};

export type PrayerInformationModalPropsType = {
  prayer: PrayerMinimal | null;
  language: LanguageCode;
  rtl: boolean;
  colorScheme: "light" | "dark";
  getFontSize: (type: "latin" | "arabic" | "transliteration") => number;
  getLineHeight: (type: "latin" | "arabic" | "transliteration") => number;
  snapPoints?: (string | number)[];
  onChange?: (index: number) => void;
  onRequestClose?: () => void;
};

// ─── Calendar ───────────────────────────────────────────────────────────────

/**
 * Row from the `calendar` table.
 *
 * Fixed:
 *   - Removed ghost `type: string` field (not in DB).
 *   - `islamic_date` / `gregorian_date` typed as `string` (TEXT columns), not `any`.
 *   - `description` is nullable per schema.
 *   - `legend_type` is the actual column name and type.
 */
export type CalendarType = {
  id: number;
  title: string;
  islamic_date: string;
  gregorian_date: string;
  description: string | null;
  legend_type: number;
  created_at: string;
  language_code: string;
  recommended_acts?: string[] | null;
};

/**
 * Renamed from `calendarLegendType` → `CalendarLegendType` (PascalCase).
 * Added missing `language_code` field that queries return.
 */
export type CalendarLegendType = {
  id: number;
  legend_type: string;
  created_at: string;
  language_code: string;
  color: string;
};

/** @deprecated Use `CalendarLegendType` — kept for backward compat. */
export type calendarLegendType = CalendarLegendType;

export type CalendarSectionType = {
  title: string;
  data: CalendarType[];
};

// ─── Questions ──────────────────────────────────────────────────────────────

/**
 * Fixed: `related_question` changed from `string[]` to `string | null`.
 * The DB stores it as a JSON TEXT column; your queries parse it with `json_each`.
 */
export type QuestionType = {
  id: number;
  title: string;
  question: string;
  answer?: string;
  answer_sistani?: string;
  answer_khamenei?: string;
  question_category_name: string;
  question_subcategory_name: string;
  language_code: string;
  created_at: string;
  related_question?: string | null;
};

export type QuestionCategoryType = {
  id: number;
  question_category_name: string;
  created_at: string;
};

export type QuestionSubcategoryType = {
  id: number;
  question_subcategory_name: string;
  created_at: string;
};

export type QuestionCategoriesType = {
  id: number;
  name: string;
  image: any;
  value: string;
};

export type AnswerType = {
  id: number;
  question_id: number;
  scholar_answered_question: string;
  scholar_nme: string;
  internal_url?: string[];
  answer_text?: string;
  answer_status: string;
  updated_at?: string;
  created_at: string;
};

export type AnswerStatusType = {
  id: number;
  answer_status: string;
  created_at: string;
};

export type UserQuestionType = {
  id: number;
  title: string;
  question: string;
  status: string;
  username?: string;
  gender: string;
  age: number;
  marja: string;
  user_id: string;
  internal_url?: string[];
  external_url?: string[];
  answer?: string;
  update_answered_at?: string;
  created_at: string;
};

export type QuestionsFromUserType = {
  id: string;
  user_id: string;
  question: string;
  answer?: string;
  status: "Beantwortet" | "Beantwortung steht noch aus" | "Abgelehnt";
  marja: string;
  title: string;
  gender: string;
  age: string;
  internal_url: string[];
  external_url: string[];
  created_at: string;
  approval_status: string;
  has_read_answer: boolean;
  has_read_at: string;
};

export type askQuestionSuggestionsType = {
  id: number;
  category_name: string;
  subcategory_name: string;
  question: string;
  title: string;
};

export type SearchResultQAType = {
  id: number;
  title: string;
  question: string;
};

// ─── Podcasts ───────────────────────────────────────────────────────────────

export type PodcastType = {
  id: number;
  title: string;
  description: string;
  filename: string;
  language_code?: string;
  created_at: string;
  podcast_topic?: string;
  podcast_author?: string;
  image_filename: string;
  image_url: any
};

export type SavedProgress = {
  position: number;
  duration: number;
  savedAt: number;
};

export type PodcastProps = {
  podcast: PodcastType;
};

export type PodcastPlayerPropsType = {
  podcast: PodcastType;
};

// ─── Videos ─────────────────────────────────────────────────────────────────

export type VideoType = {
  id: string;
  title: string;
  video_category: string;
  public_id: string;
  created_at: string;
  language_code: string;
};

export type VideoCategoryType = {
  id: string;
  video_category: string;
  language_code: string;
};

export type UseVideosResultType = {
  categories: string[];
  videosByCategory: Record<string, VideoType[]>;
};

// ─── PDFs ───────────────────────────────────────────────────────────────────

export type PdfType = {
  id: number;
  created_at: string;
  pdf_title: string;
  pdf_filename: string;
  language_code: string;
  isBook: boolean;
  pdf_topic?: string;
  pdf_author?: string;
};

export type PdfViewerScreenPropsType = {
  filename: string;
};

// ─── News & Articles ────────────────────────────────────────────────────────

export type NewsType = {
  id: number;
  created_at: string;
  title: string;
  content: string;
  images_url?: string[];
  external_urls?: string[];
  internal_urls?: string[];
  language_code: string;
  image_url?: string[];
  is_pinned: boolean;
};

export type NewsCardType = {
  title: string;
  content: string;
  created_at: string;
};

export type NewsArticlesPreviewType = {
  title: string;
  is_external_link: boolean;
  created_at: string;
};

export type NewsArticlesType = {
  id: number;
  created_at: string;
  language_code: string;
  title: string;
  content: string;
  is_external_link: boolean;
  external_link_url?: string;
  read_time?: string;
  author: string;
  source: string;
  scholar_type: number;
  article_topic?: string;
};

// ─── Todo ───────────────────────────────────────────────────────────────────

export type TodoItemType = {
  id: number;
  text: string;
  completed: boolean;
  internal_urls?: string[];
  reminder_time?: string | null;
};

export type WeeklyTodosType = {
  [day: number]: TodoItemType[];
};

export type UseWeeklyTodosResult = {
  todosByDay: WeeklyTodosType;
  loading: boolean;
  toggleTodo: (day: number, id: number) => void;
  addTodo: (day: number, text: string, internalUrls?: string[]) => void;
  deleteTodo: (day: number, id: number) => void;
  undoAllForDay: (day: number) => void;
};

export type TodoListType = {
  todos: TodoItemType[];
  dayIndex: number;
  onToggleTodo: (day: number, id: number) => void;
  onShowDeleteModal: (day: number, id: number) => void;
  onShowAddModal: () => void;
  onSetReminder: (
    dayIndex: number,
    todoId: string | number,
    time: Date | null,
    repeatWeekly: boolean,
  ) => void;
  scrollEnabled?: boolean;
};

export type WeeklyCalendarSectionType = {
  todosByDay: WeeklyTodosType;
  loading: boolean;
  onToggleTodo: (day: number, id: number) => void;
  onUndoAll: (day: number) => void;
  onShowAddModal: () => void;
  onShowDeleteModal: (day: number, id: number) => void;
  selectedDay: number | null;
  currentDayIndex: number;
  onSelectDay: (day: number) => void;
};

export type AddTodoModalType = {
  visible: boolean;
  onClose: () => void;
  onAdd: (text: string, internalUrls: string[]) => void;
  selectedDayName: string;
};

export type TodoToDeleteType = {
  dayIndex: number | null;
  todoId: number | null;
};

// ─── User / Auth ────────────────────────────────────────────────────────────

export type SignUpFormValues = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type DeleteUserModalPropsType = {
  isVisible: boolean;
  onClose: () => void;
  onDeleteSuccess?: () => void;
  serverUrl: string;
};

export type UserType = {
  id: number;
  user_id: string;
  username: string;
  role: string;
  email: string;
  created_at: string;
};

export type RoleType = {
  id: number;
  role: string;
  created_at: string;
};

export type UserTokenType = {
  id: number;
  expo_push_token: string;
  user_id: string;
  created_at: string;
};

export type PendingNotificationType = {
  id: number;
  title?: string;
  body?: string;
  expo_push_token: string;
  user_id: string;
  created_at: string;
};

export type PushNotificationType = {
  id: number;
  title: string;
  body: string;
  created_at: string;
};

export type ScholarNameType = {
  id: number;
  name: string;
  role: string;
  created_at: string;
};

export type ScholarAnsweredStatusType = {
  id: number;
  status: string;
  created_at: string;
};

export type StatusForQuestionType = {
  id: number;
  statusCode: string;
  created_at: string;
};

export type PayPalType = {
  id: number;
  link: string;
  created_at: string;
};

// ─── Search / Combined Results ──────────────────────────────────────────────

export type SearchResultType = {
  id: string;
  type: "quran" | "prayer";
  title: string;
  subtitle?: string;
  preview: string;
  content: string;
};

export type SearchResult = {
  id: string;
  label: string;
  type: InternalLinkType;
  identifier: string;
  meta?: string;
};

export type CombinedResult =
  | {
      type: "question";
      renderId: string;
      questionId: number;
      title?: string;
      question?: string;
      question_category_name?: string;
      question_subcategory_name?: string;
    }
  | {
      type: "prayer";
      renderId: string;
      prayerId: number;
      name?: string;
      arabic_text?: string;
    }
  | {
      type: "podcast";
      renderId: string;
      podcastId: number;
      podcastEpisodeTitle?: string;
      podcastEpisodeDescription?: string;
      podcast: PodcastType;
    }
  | {
      type: "newsArticle";
      renderId: string;
      newsArticleId: number;
      newsTitle?: string;
      newsSnippet?: string;
    }
  | {
      type: "quran";
      renderId: string;
      quranSura: number;
      quranAya: number;
      quranText: string;
    };

// ─── History ────────────────────────────────────────────────────────────────

export type LevelType = string;

export type ChapterSectionType = {
  title: string;
  data: LevelType[];
};

export type HistoryDataType = {
  id: string;
  nameKey: string;
  route: string;
  image?: any;
};

export type SectionType = {
  id: string;
  titleKey: string;
  backgroundImage: any;
  levels: HistoryDataType[];
};

// ─── Arabic Curriculum ──────────────────────────────────────────────────────

export type ArabicCurriculumLevel = {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
};

export type SectionItem =
  | { type: "intro" }
  | { type: "shortTitle" }
  | { type: "longTitle" }
  | { type: "compareTitle" }
  | { type: "exercise" }
  | {
      type: "shortCard" | "longCard";
      arabic: string;
      latin: string;
      label: string;
    }
  | {
      type: "compareCard";
      short: string;
      shortLatin: string;
      long: string;
      longLatin: string;
    };

    export type PodcastGridCardType = {
      podcast: PodcastType;
      width: number;
      rtl: boolean;
      lang: string;
      listenText: string;
      gradientColors: readonly [string, string, ...string[]] | string[];
    };
    