const en = {
  // LanguageSelectionScreen
  chooseLanguage: "Choose your language",

  // Podcasts
  podcastsTitle: "Podcasts",
  podcastScreenTitle: "Podcasts",
  listen: "LISTEN",
  download: "Download",
  downloading: "Downloading",
  preparing: "Preparing",
  stream: "Stream",
  loading_stream: "Loading stream",
  delete_from_cache: "Delete from cache",
  marked_as_listened: "Marked as listened",
  unmarked_as_listened: "Mark removed",
  continue_listening: "Continue listening",
  resume: "Resume",
  allTopics: "All topics",
  allAuthors: "All authors",
  // General
  today: "Today",
  yes: "Yes",
  reset: "Reset",
  retry: "Retry",
  errorLoadingData: "There was an error loading the data",
  openingLink: "Opening link",
  urlNotSupported: "URL is not supported",
  errorOpeningUrl: "Error opening URL",
  back: "Back",
  small: "Small",
  medium: "Medium",
  large: "Large",
  error: "Error",
  favorites: "Favorites",
  search: "Search",
  remove: "Remove",
  create: "Create",
  nameFolder: "Name",
  pickColor: "Choose a color",
  removedFromFavorites: "Removed from favorites",
  addedToFavorites: "Added to favorites",
  noFavorites: "You don't have any favorites yet!",
  noFoldersYet: "You don't have any folders yet",
  removeConfirmPrayer: "Do you want to remove the prayer from the folder?",
  readMore: "More",
  about: "About",
  impressum: "Legal notice",
  dataIsBeingLoadedTitle: "Data is being loaded!",
  dataIsBeingLoadedMessage:
    "Depending on your internet connection, this may take a moment.",
  font: "Font size",
  source: "Sources: ",
  copied: "Copied!",
  loading: "Loading data",
  noData: "No data available",
  confirmBookmarkChange: "Change bookmark?",
  bookmarkReplaceQuestion: "Do you want to change the bookmark?",
  bookmarkRemove: "Do you want to remove the bookmark?",
  bookmark: "Bookmark",
  replace: "Replace",
  startsAt: "Starts from:",
  done: "Done",
  errorDeletingFolder: "There was an error deleting the folder",
  lines: "Lines",
  selectFolder: "Choose a folder",
  enterFolderName: "Enter a name for the folder",
  confirm: "Confirm",
  syncFailedTryAgain: "Synchronization failed. Please try again.",
  initAppWentWrong:
    "An error occurred while preparing the app. Please try closing and reopening the app.",
  pdfsTitle: "To Read",
  timerSet: "Reminder has been activated",
  reminderSet: "Reminder set",
  reminderDeleted: "Reminder deleted",
  repeatsWeekly: "Repeats weekly",
  feedback: "Feedback",
  allDays: "Daily",

  darkMode: "Dark mode",
  enableDarkmode: "Enable dark mode",
  notifications: "Notifications",
  receivePushNotifications: "Receive notifications",
  clearAppCache: "Clear app cache",
  clearAppCacheText:
    "Deletes all cached files of the app. Content may need to be loaded again afterwards.",
  clearAppCacheConfirmTitle: "Clear cache",
  clearAppCacheConfirmMessage:
    "Do you really want to delete all cached files of the app?",
  clearAppCacheSuccessMessage: "The app cache has been cleared successfully.",
  clearAppCacheErrorMessage: "An error occurred while clearing the app cache.",
  dataPrivacy: "Data privacy",
  aboutTheApp: "About the app",
  imprint: "Legal notice",
  podcastEmpty: "There are currently no podcasts yet",
  appVersion: "App version",
  podcastsEmpty: "There are no podcasts yet",
  // Navigation
  settings: "Settings",
  home: "Home",

  // Database
  updateAvailable: "Update Available",
  newAppVersionAvailable: "A new version is available in the App Store!",
  databaseUpdatePaypal: "The PayPal link has been updated!",
  update: "Update",

  // Push-notification
  pushNotificationsDisabledTitle: "Push Notifications Disabled",
  pushNotificationsDisabledMessage:
    "To receive notifications, please enable them in your settings.",
  openSettings: "Open settings",
  errorCheckingNotificationPermissions:
    "Error checking notification permissions:",
  errorTogglingNotifications: "Error changing notification settings:",
  noInternetConnectionTitle: "No Internet Connection",
  noInternetConnectionMessage: "Please check your connection.",
  ok: "OK",

  // Search
  noSearchResults: "No search results found!",
  searchPlaceholder: "Search for questions, prayers, news articles or podcasts",
  podcast: "Podcasts",
  searchContent: "Search content",
  searching: "Searching...",
  searchMinimumChars: "Please enter at least 2 characters",
  noResultsFound: "No results found",
  tab_podcasts: "Podcasts",

  // Placeholders (per tab)
  placeholder_podcasts: "Search podcasts",

  // Meta / errors
  results_count: "{{count}} results",
  search_failed: "Search failed. Please try again.",

  // No internet
  noInternetTitle: "No Internet Connection",
  internetBackTitle: "Connection Restored",
  noInternetMessage: "You will not receive any updates during this time!",

  // Language selector
  language: "Language",
  selectAppLanguage: "Choose app language",
  deutsch: "Deutsch",
  english: "English",
  arabic: "العربية",
  languages: {
    en: "English",
    de: "Deutsch",
    ar: "العربية",
  },

  // Gregorian month names
  months: {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December",
  },
} as const;

export default en;
