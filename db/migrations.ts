//! Last that worked
export const migrationSQL = `
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;         -- harmless even if you have no FKs
  PRAGMA busy_timeout = 5000;

  -- LANGUAGES (keep if you use it in UI; no FKs)
  CREATE TABLE IF NOT EXISTS languages (
    id INTEGER PRIMARY KEY,
    language_code TEXT NOT NULL UNIQUE
  );

  -- CALENDAR
  
  CREATE TABLE IF NOT EXISTS calendarLegend (
  id            INTEGER PRIMARY KEY,
  created_at    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  legend_type   TEXT NOT NULL,
  language_code TEXT NOT NULL,
  color TEXT NOT NULL
);
  CREATE TABLE IF NOT EXISTS calendar (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    islamic_date TEXT NOT NULL,
    gregorian_date TEXT NOT NULL,
    description TEXT,
    legend_type INTEGER,
    recommended_acts TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    language_code TEXT NOT NULL
  );
  -- Helpful indexes for common filters/sorts
  CREATE INDEX IF NOT EXISTS idx_calendar_lang_legend ON calendar(language_code, legend_type);
  CREATE UNIQUE INDEX IF NOT EXISTS uq_calendarLegend_type_lang ON calendarLegend(legend_type, language_code);
  CREATE INDEX IF NOT EXISTS idx_calendar_lang_gregorian ON calendar(language_code, gregorian_date);

  -- QURAN: AYA TEXT TABLES
  CREATE TABLE IF NOT EXISTS aya_ar (
    id INTEGER PRIMARY KEY,
    sura INTEGER NOT NULL,
    aya INTEGER NOT NULL,
    quran_arabic_text TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS aya_de (
    id INTEGER PRIMARY KEY,
    sura INTEGER NOT NULL,
    aya INTEGER NOT NULL,
    quran_german_text TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS aya_en (
    id INTEGER PRIMARY KEY,
    sura INTEGER NOT NULL,
    aya INTEGER NOT NULL,
    quran_english_text TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS aya_en_transliteration (
    id INTEGER PRIMARY KEY,
    sura INTEGER NOT NULL,
    aya INTEGER NOT NULL,
    quran_transliteration_text TEXT NOT NULL
  );

  -- QURAN STRUCTURE TABLES
  CREATE TABLE IF NOT EXISTS hizb (
    id INTEGER PRIMARY KEY,
    sura INTEGER NOT NULL,
    aya INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_hizb_sura_aya ON hizb(sura, aya);

  CREATE TABLE IF NOT EXISTS juz (
    id INTEGER PRIMARY KEY,
    sura INTEGER NOT NULL,
    aya INTEGER NOT NULL,
    page INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_juz_page ON juz(page);
  CREATE INDEX IF NOT EXISTS idx_juz_sura_aya ON juz(sura, aya);

  CREATE TABLE IF NOT EXISTS page (
    id INTEGER PRIMARY KEY,
    sura INTEGER NOT NULL,
    aya INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ruku (
    id INTEGER PRIMARY KEY,
    sura INTEGER NOT NULL,
    aya INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sajda (
    id INTEGER PRIMARY KEY,
    sura INTEGER NOT NULL,
    aya INTEGER NOT NULL,
    type INTEGER
  );

  CREATE TABLE IF NOT EXISTS sura (
    id INTEGER PRIMARY KEY,
    label TEXT NOT NULL UNIQUE,
    label_en TEXT,
    label_de TEXT NOT NULL UNIQUE,
    nbAyat INTEGER NOT NULL,
    nbWord INTEGER NOT NULL,
    nbLetter INTEGER NOT NULL,
    orderId INTEGER NOT NULL,
    makki INTEGER NOT NULL,
    startPage INTEGER NOT NULL,
    endPage INTEGER NOT NULL,
    ruku INTEGER
  );

  CREATE TABLE IF NOT EXISTS favorite_quran (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    sura       INTEGER NOT NULL,
    aya        INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    UNIQUE(sura, aya)
  );

  CREATE TABLE IF NOT EXISTS favorite_sura (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sura INTEGER NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  CREATE TABLE IF NOT EXISTS favorite_juz (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    juz INTEGER NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  CREATE TABLE IF NOT EXISTS favorite_page (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page INTEGER NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  -- order-based navigation
  CREATE INDEX IF NOT EXISTS idx_sura_order ON sura(orderId);
  -- (moved here) page → sura lookups if you use them
  CREATE INDEX IF NOT EXISTS idx_sura_start_end ON sura(startPage, endPage);

  CREATE UNIQUE INDEX IF NOT EXISTS uq_aya_ar_sura_aya   ON aya_ar(sura, aya);
  CREATE UNIQUE INDEX IF NOT EXISTS uq_aya_de_sura_aya   ON aya_de(sura, aya);
  CREATE UNIQUE INDEX IF NOT EXISTS uq_aya_en_sura_aya   ON aya_en(sura, aya);
  CREATE UNIQUE INDEX IF NOT EXISTS uq_aya_tr_sura_aya   ON aya_en_transliteration(sura, aya);
  CREATE UNIQUE INDEX IF NOT EXISTS uq_page_sura_aya     ON page(sura, aya);
  CREATE UNIQUE INDEX IF NOT EXISTS uq_ruku_sura_aya     ON ruku(sura, aya);
  CREATE UNIQUE INDEX IF NOT EXISTS uq_sajda_sura_aya    ON sajda(sura, aya);
  CREATE UNIQUE INDEX IF NOT EXISTS uq_juz_page_sura_aya ON juz(page, sura, aya);
  CREATE INDEX IF NOT EXISTS idx_favorite_sura_created ON favorite_sura(created_at);
  CREATE INDEX IF NOT EXISTS idx_favorite_juz_created ON favorite_juz(created_at);
  CREATE INDEX IF NOT EXISTS idx_favorite_page_created ON favorite_page(created_at);
  CREATE INDEX IF NOT EXISTS idx_favorite_quran_created ON favorite_quran(created_at DESC);

  -- QUESTIONS
  CREATE TABLE IF NOT EXISTS question_categories (
    id INTEGER PRIMARY KEY,
    category_name TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    language_code TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_question_categories_lang ON question_categories(language_code);

  CREATE TABLE IF NOT EXISTS question_subcategories (
    id INTEGER PRIMARY KEY,
    subcategory_name TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL,
    language_code TEXT NOT NULL DEFAULT 'de'
  );
  CREATE INDEX IF NOT EXISTS idx_question_subcategories_lang ON question_subcategories(language_code);

  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY,
    question TEXT NOT NULL,
    title TEXT NOT NULL,
    question_category_name TEXT NOT NULL,
    question_subcategory_name TEXT NOT NULL,
    answer TEXT,
    answer_khamenei TEXT,
    answer_sistani TEXT,
    created_at TEXT NOT NULL,
    related_question TEXT CHECK(related_question IS NULL OR json_valid(related_question)),
    language_code TEXT NOT NULL DEFAULT 'de'
  );
    CREATE INDEX IF NOT EXISTS idx_questions_cat_sub_lang_created ON questions(question_category_name, question_subcategory_name, language_code, created_at DESC);
    
    CREATE INDEX IF NOT EXISTS idx_questions_title_lang_nocase ON questions(title COLLATE NOCASE, language_code);


  CREATE TABLE IF NOT EXISTS favorite_questions (
  question_id INTEGER NOT NULL,
  created_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

  -- indexes your code will hit
  CREATE UNIQUE INDEX IF NOT EXISTS uq_fav_questions_qid ON favorite_questions(question_id);
  CREATE INDEX IF NOT EXISTS idx_fav_questions_created_join
  ON favorite_questions(created_at DESC, question_id);
  CREATE INDEX IF NOT EXISTS idx_questions_lang_created
  ON questions(language_code, created_at DESC);


  -- PRAYERS
  CREATE TABLE IF NOT EXISTS prayer_categories (
    id            INTEGER PRIMARY KEY,
    title         TEXT    NOT NULL,
    parent_id TEXT CHECK(parent_id IS NULL OR json_valid(parent_id)),
    language_code TEXT    NOT NULL
);

  -- You'll often hit WHERE title = ? and ORDER BY title
  CREATE INDEX IF NOT EXISTS idx_prayer_categories_title_nocase ON prayer_categories(title COLLATE NOCASE);

  CREATE TABLE IF NOT EXISTS prayers (
    id INTEGER PRIMARY KEY,
    name TEXT,
    arabic_title TEXT,
    category_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    translated_languages TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(translated_languages)),
    arabic_text TEXT,
    arabic_notes TEXT,
    transliteration_text TEXT,
    source TEXT,
    arabic_introduction TEXT
  );
  -- Helpful for ORDER BY name lists
  -- Case-insensitive sorts that can use an index
  CREATE INDEX IF NOT EXISTS idx_prayers_name_nocase ON prayers(name COLLATE NOCASE);
  CREATE INDEX IF NOT EXISTS idx_prayers_arabic_title_nocase ON prayers(arabic_title COLLATE NOCASE);
  CREATE INDEX IF NOT EXISTS idx_prayers_category_name
  ON prayers(category_id, name COLLATE NOCASE);
  CREATE INDEX IF NOT EXISTS idx_prayer_categories_lang_title
  ON prayer_categories(language_code, title COLLATE NOCASE);


  CREATE TABLE IF NOT EXISTS prayer_translations (
    id INTEGER PRIMARY KEY,
    prayer_id INTEGER NOT NULL,
    language_code TEXT NOT NULL,
    translated_introduction TEXT,
    translated_text TEXT,
    translated_title TEXT,
    source TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    translated_notes TEXT
  );
  
  CREATE UNIQUE INDEX IF NOT EXISTS uq_prayer_translations_pid_lang
  ON prayer_translations(prayer_id, language_code);
  CREATE INDEX IF NOT EXISTS idx_prayer_translations_translated_title_nocase ON prayer_translations(translated_title COLLATE NOCASE);

  
  -- FAVORITES / FOLDERS (used by your helpers)
  CREATE TABLE IF NOT EXISTS prayer_folders (
    name  TEXT PRIMARY KEY,
    color TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS favorite_prayers (
    prayer_id    INTEGER NOT NULL,
    folder_name  TEXT    NOT NULL,
    folder_color TEXT    NOT NULL,
    created_at   TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  -- Indexes your queries will hit
  CREATE INDEX IF NOT EXISTS idx_fav_prayers_folder      ON favorite_prayers(folder_name, created_at);
  CREATE INDEX IF NOT EXISTS idx_fav_prayers_created     ON favorite_prayers(created_at);
  CREATE UNIQUE INDEX IF NOT EXISTS uq_favorite_prayers_unique ON favorite_prayers(prayer_id, folder_name);

  
  -- PODCASTS
  CREATE TABLE IF NOT EXISTS podcasts (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    filename TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    language_code TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_podcasts_lang_created ON podcasts(language_code, created_at);

  -- VIDEOS
  CREATE TABLE IF NOT EXISTS video_categories (
  id             INTEGER PRIMARY KEY,
  created_at     TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  video_category TEXT NOT NULL,
  language_code  TEXT NOT NULL DEFAULT 'de'
);

-- Composite uniqueness per language:
CREATE UNIQUE INDEX IF NOT EXISTS uq_video_categories_cat_lang
ON video_categories(video_category, language_code);
`;

//! Not needed?
// CREATE TABLE IF NOT EXISTS videos (
//     id INTEGER PRIMARY KEY,
//     created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
//     title TEXT NOT NULL,
//     language_code TEXT NOT NULL,
//     public_id TEXT NOT NULL,
//     video_category TEXT NOT NULL DEFAULT ''
//   );
//   CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(video_category);
//   CREATE INDEX IF NOT EXISTS idx_videos_lang ON videos(language_code);
//   CREATE INDEX IF NOT EXISTS idx_videos_category_created ON videos(video_category, created_at);

//! Old
// -- CALENDAR Legend (lookup table; no FK)
// CREATE TABLE IF NOT EXISTS calendarLegend (
//   id INTEGER PRIMARY KEY,
//   created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
//   legend_type TEXT NOT NULL UNIQUE,
//   language_code TEXT NOT NULL
// );

//  CREATE TABLE IF NOT EXISTS video_categories (
//     id INTEGER PRIMARY KEY,
//     created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
//     video_category TEXT NOT NULL UNIQUE,
//     language_code TEXT NOT NULL DEFAULT 'de'
//   );
//   CREATE INDEX IF NOT EXISTS idx_video_categories_lang ON video_categories(language_code);
