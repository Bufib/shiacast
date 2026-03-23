// Language
export type LanguageCode = "de" | "ar" | "en";

export type InternalLinkType = "questionLink" | "prayerLink" | "quranLink";

export type LanguageContextType = {
  lang: LanguageCode; // <— always defined
  setAppLanguage: (lng: LanguageCode) => Promise<void>;
  ready: boolean;
  rtl: boolean;
  hasStoredLanguage: boolean;
};

// Gradient
export type UseGradientOptionsType = {
  customGradients?: string[][];
  defaultIndex?: number;
};

// NewsArticle
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

// News
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

// General
export type Language = "ar" | "en" | "de";
export type ActiveSheet = "articles" | "podcasts" | "pdfs" | null;

// export type Sizes = {
//   elementSize: number;
//   fontSize: number;
//   badgeSize: number;
//   iconSize: number;
//   imageSize: number;
//   gap: number;
//   emptyTextSize: number;
//   emptyIconSize: number;
//   emptyGap: number;
//   previewSizes: number;
//   isLarge: boolean;
//   isMedium: boolean;
//   previewSizesPaddingHorizontal: number;
//   fontsizeHomeShowAll:number,
//   fontsizeHomeHeaders:number
// };

export type SizesType = {
  elementSize: number;
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

// Prayer and Question ButtonLinks
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
  fontSize: number;
  lineHeight: number;
  snapPoints?: (string | number)[];
  onChange?: (index: number) => void;
  onRequestClose?: () => void;
};

export type FavoritePrayerFolderType = {
  name: string;
  color: string;
  prayerCount?: number;
};

// Answers table
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

// Answer Status lookup
export type AnswerStatusType = {
  id: number;
  answer_status: string;
  created_at: string;
};

// Categories
export type QuestionCategoryType = {
  id: number;
  question_category_name: string;
  created_at: string;
};

// Languages lookup
export type LanguageType = {
  id: number;
  language_code: string;
};

// PayPal link info
export type PayPalType = {
  id: number;
  link: string;
  created_at: string;
};

// Pending Notifications
export type PendingNotificationType = {
  id: number;
  title?: string;
  body?: string;
  expo_push_token: string;
  user_id: string;
  created_at: string;
};

// Sent Push Notifications log
export type PushNotificationType = {
  id: number;
  title: string;
  body: string;
  created_at: string;
};

// Questions (existing Q&A)
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
  related_question?: string[];
};

// PrayerLinks
export type QuestionCategoriesType = {
  id: number;
  name: string;
  image: any;
  value: string;
};

export type SearchResultQAType = {
  id: number;
  title: string;
  question: string;
};

export type SearchResultType = {
  id: string;
  type: "quran" | "prayer";
  title: string;
  subtitle?: string;
  preview: string;
  content: string; // The full content to insert
};

export type SearchResult = {
  id: string;
  label: string;
  type: InternalLinkType;
  identifier: string; // used to build internal URL identifier
  meta?: string;
};

// Account
export type SignUpFormValues = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type askQuestionSuggestionsType = {
  id: number;
  category_name: string;
  subcategory_name: string;
  question: string;
  title: string;
};
// constants/Types.ts (or wherever CombinedResult lives)
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
      renderId: string; // e.g. "quran-2:255"
      quranSura: number;
      quranAya: number;
      quranText: string; // localized to current lang
    };

// Roles lookup
export type RoleType = {
  id: number;
  role: string;
  created_at: string;
};

// Scholar Answered Status lookup
export type ScholarAnsweredStatusType = {
  id: number;
  status: string;
  created_at: string;
};

// Scholar Names & Roles
export type ScholarNameType = {
  id: number;
  name: string;
  role: string;
  created_at: string;
};

// Statuses for Questions lookup
export type StatusForQuestionType = {
  id: number;
  statusCode: string;
  created_at: string;
};

// Subcategories
export type QuestionSubcategoryType = {
  id: number;
  question_subcategory_name: string;
  created_at: string;
};

// User-submitted Questions
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

export type SupabaseRealtimeContextType = {
  userId: string | null;
  hasNewNewsData: boolean;
  clearNewNewsFlag: () => void;
};

export type WithLangType = {
  language_code?: string | null;
  id?: number | string;
};

// Delete Account
export type DeleteUserModalPropsType = {
  isVisible: boolean;
  onClose: () => void;
  onDeleteSuccess?: () => void;
  serverUrl: string;
};

// Expo Push Tokens per User
export type UserTokenType = {
  id: number;
  expo_push_token: string;
  user_id: string;
  created_at: string;
};

// Application Users
export type UserType = {
  id: number;
  user_id: string;
  username: string;
  role: string;
  email: string;
  created_at: string;
};

// Versioning info
export type VersionType = {
  id: number;
  database_version: string;
  appVersion: string;
};

// Prayer
export type PrayerType = {
  name: string,
  id: number;
  arabic_title?: string;
  category_id?: number;
  created_at: string;
  updated_at: Date;
  translated_languages?: string[];
  arabic_text?: string;
  arabic_notes?: string;
  transliteration_text?: string;
  source?: string;
  arabic_introduction?: string;
};

export type PrayerWithTranslationType = {
  id: number;
  prayer_id: number;
  language_code: string;
  translated_title: string;
  translated_introduction?: string;
  translated_text?: string;
  source?: string;
  created_at: string;
  updated_at: Date;
  translated_notes?: string;
};

export type FullPrayer = PrayerType & PrayerWithTranslationType &{
  translations: PrayerWithTranslationType[];
};

export type PrayerSearchResult = {
  id: number;
  name: string;
  arabic_title: string | null;
  category_id: number;
  translated_text: string | null;
  matchType: "name" | "translation";
};
export type PrayerRow = {
  id: number;
  name: string;
  arabic_title?: string;
  category_id?: number;
  arabic_introduction?: string;
  arabic_text?: string;
  arabic_notes?: string;
  transliteration_text?: string;
  source?: string;
  translated_languages: string; // <-- JSON in a TEXT column
  created_at: string;
  updated_at: string;
};

export type PrayerCategoryType = {
  id: number;
  title: string;
  parent_id?: number[];
  language_code: string;
};

export type PrayerWithCategory = {
  id: number;
  name: string;
  prayer_text: string;
  category_id: number;
};

// ToDoList
export type TodoItemType = {
  id: number;
  text: string;
  completed: boolean;
  internal_urls?: string[];
  reminder_time?: string | null;
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

export type WeeklyTodosType = {
  [day: number]: TodoItemType[];
};

export type UseWeeklyTodosResult = {
  todosByDay: WeeklyTodosType;
  loading: boolean;
  toggleTodo: (day: number, id: number) => void;
  addTodo: (day: number, text: string, internalUrls?: string[]) => void; // ⬅️
  deleteTodo: (day: number, id: number) => void;
  undoAllForDay: (day: number) => void;
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
  onAdd: (text: string, internalUrls: string[]) => void; // ⬅️ important
  selectedDayName: string;
};

export type TodoToDeleteType = {
  dayIndex: number | null;
  todoId: number | null;
};

// Pdfs
// Type definition for PDF records from Supabase
export type PdfType = {
  id: number;
  created_at: string;
  pdf_title: string;
  pdf_filename: string; // The filename in your bucket (e.g., "quran-tafsir.pdf")
  language_code: string; // e.g., "en", "de", "ar"
  isBook: boolean;
  pdf_topic?: string;
  pdf_author?: string;
};

export type PdfViewerScreenPropsType = {
  filename: string;
};

// Podcasts
export type PodcastType = {
  id: number;
  title: string;
  description: string;
  filename: string;
  language_code?: string;
  created_at: string;
  podcast_topic?: string;
  podcast_author?: string;
};

export type SavedProgress = {
  position: number;
  duration: number;
  savedAt: number;
};

export type PodcastProps = { podcast: PodcastType };
export type PodcastPlayerPropsType = {
  podcast: PodcastType;
};

// Videos
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
// User question
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

// Calendar
export type CalendarType = {
  id: number;
  title: string;
  islamic_date: any;
  gregorian_date: any;
  description: string;
  type: string;
  created_at: string;
  language_code: string;
  legend_type: number;
};
export type calendarLegendType = {
  id: number;
  legend_type: string;
  created_at: string;
  color: string;
};

export type CalendarSectionType = { title: string; data: CalendarType[] };

// Quran
export type SuraType = {
  id: number;
  label: string;
  label_en?: string;
  label_de: string;
  label_ar: string;
  nbAyat: number;
  nbWord: number;
  nbLetter: number;
  orderId: number;
  makki: number;
  startPage: number;
  endPage: number;
  ruku?: number;
};

export type FavoriteSuraType = {
  id: number;
  sura: number;
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

export type QuranInternalResultType = {
  sura: number;
  aya: number;
  text: string | null;
  sura_label_ar?: string | null;
  sura_label_en?: string | null;
  sura_label_de?: string | null;
};
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
  juzNumber?: number | null; // Add this
  pageNumber?: number | null; // Add this
};
export interface AyahType {
  id: number;
  sura: number;
  aya: number;
  text: string;
  transliteration?: string;
}

export type QuranMarkerType = {
  id: number;
  sura: number;
  aya: number;
  type?: number;
  page?: number;
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

export type QuranVerseType = {
  sura: number; // 1..114
  aya: number; // 1..n
  text: string; // verse text in the chosen language
  transliteration?: string | null; // en only
  podcastId: any;
  filename: any;
};

export type SuraRowType = {
  id: number; // source id
  orderId: number; // canonical surah number (1..114)
  label: string; // Arabic name
  label_en: string | null;
  label_de: string | null;
  nbAyat: number;
  nbWord: number;
  nbLetter: number;
  startPage: number;
  endPage: number;
  makki: number; // 1/0
  ruku: number | null;
};

export type MarkerRowType = {
  id: number;
  sura: number;
  aya: number;
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
  endSura: number | null; // null = goes to end of Quran
  endAya: number | null;
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
// History
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


// Arabic

export type ArabicCurriculumLevel = {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  modules: string[];
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
