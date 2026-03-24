import { getDatabase } from "../index";
import {
  FavoritePrayerFolderType,
  FullPrayer,
  LanguageCode,
  PrayerCategoryType,
  PrayerRow,
  PrayerType,
  PrayerWithCategory,
  PrayerWithTranslationType,
} from "@/constants/Types";

export async function getPrayerWithTranslations(
  prayerId: number,
): Promise<FullPrayer | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync<PrayerRow>(
    `SELECT * FROM prayers WHERE id = ? LIMIT 1;`,
    [prayerId],
  );
  if (!row) return null;

  const langs: string[] = JSON.parse(row.translated_languages || "[]");

  const translations = await db.getAllAsync<PrayerWithTranslationType>(
    `SELECT * FROM prayer_translations WHERE prayer_id = ?;`,
    [prayerId],
  );

  const prayer: PrayerType = {
    id: row.id,
    name: row.name,
    arabic_title: row.arabic_title,
    category_id: row.category_id,
    arabic_introduction: row.arabic_introduction,
    arabic_text: row.arabic_text,
    arabic_notes: row.arabic_notes,
    transliteration_text: row.transliteration_text,
    source: row.source,
    translated_languages: langs,
    created_at: row.created_at,
    updated_at: new Date(row.updated_at),
  };

  return {
    ...prayer,
    translations,
  };
}

export async function getPrayersForCategory(
  categoryId: number,
  languageCode: string,
): Promise<PrayerWithCategory[]> {
  const db = getDatabase();
  return await db.getAllAsync<PrayerWithCategory>(
    `SELECT
       p.id,
       p.name,
       COALESCE(t.translated_text, p.arabic_text, '') AS prayer_text,
       p.category_id
     FROM prayers p
     LEFT JOIN prayer_translations t
       ON p.id = t.prayer_id
       AND t.language_code = ?
     WHERE p.category_id = ?
     ORDER BY p.name COLLATE NOCASE;`,
    [languageCode, categoryId],
  );
}

export const getFavoritePrayersForFolder = async (
  folderName: string,
): Promise<PrayerType[]> => {
  const db = getDatabase();
  return await db.getAllAsync<PrayerType>(
    `
    SELECT DISTINCT p.*
    FROM favorite_prayers f
    JOIN prayers p ON p.id = f.prayer_id
    WHERE f.folder_name = ?
    ORDER BY datetime(f.created_at) DESC;
    `,
    [folderName],
  );
};

export async function getAllPrayersForArabic(
  categoryId: number,
): Promise<PrayerWithCategory[]> {
  const db = getDatabase();
  return await db.getAllAsync<PrayerWithCategory>(
    `SELECT
       id,
       name,
       arabic_text AS prayer_text,
       category_id
     FROM prayers
     WHERE category_id = ?
     ORDER BY name COLLATE NOCASE;`,
    [categoryId],
  );
}

export const getFoldersForPrayer = async (
  prayerId: number,
): Promise<string[]> => {
  const db = getDatabase();
  const rows = await db.getAllAsync<{ folder_name: string }>(
    `SELECT DISTINCT folder_name FROM favorite_prayers WHERE prayer_id = ?;`,
    [prayerId],
  );
  return rows.map((r) => r.folder_name);
};

export const getFavoritePrayerFolders = async (): Promise<
  FavoritePrayerFolderType[]
> => {
  const db = getDatabase();
  const rows = await db.getAllAsync<{
    name: string;
    color: string;
    cnt: number;
  }>(`
    SELECT
      f.name,
      f.color,
      COALESCE(fp.cnt, 0) AS cnt
    FROM prayer_folders AS f
    LEFT JOIN (
      SELECT
        fp.folder_name,
        COUNT(DISTINCT fp.prayer_id) AS cnt
      FROM favorite_prayers fp
      JOIN prayers p ON p.id = fp.prayer_id   -- ignore orphans
      GROUP BY fp.folder_name
    ) fp ON fp.folder_name = f.name
    ORDER BY LOWER(f.name);
  `);

  return rows.map((r) => ({
    name: r.name,
    color: r.color,
    prayerCount: r.cnt,
  }));
};

export const getFavoritePrayers = async (): Promise<PrayerType[]> => {
  try {
    const db = getDatabase();
    return await db.getAllAsync<PrayerType>(`
      SELECT DISTINCT p.*
      FROM prayers p
      JOIN favorite_prayers f ON p.id = f.prayer_id
      ORDER BY datetime(f.created_at) DESC;

    `);
  } catch (error) {
    console.error("Error retrieving favorite prayers:", error);
    throw error;
  }
};

export const createFolder = async (name: string, color: string) => {
  const db = getDatabase();
  await db.runAsync(
    `INSERT OR IGNORE INTO prayer_folders (name, color) VALUES (?, ?);`,
    [name, color],
  );
  return { name, color };
};

export const addPrayerToFolder = async (
  prayerId: number,
  folder: { name: string; color: string },
): Promise<void> => {
  const db = getDatabase();
  await db.runAsync(
    `
    INSERT OR IGNORE INTO favorite_prayers (prayer_id, folder_name, folder_color)
    VALUES (?, ?, ?);
    `,
    [prayerId, folder.name, folder.color],
  );
};

export async function removePrayerFromFolder(
  prayerId: number,
  folderName: string,
): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    `
    DELETE FROM favorite_prayers
    WHERE prayer_id = ? AND folder_name = ?;
    `,
    [prayerId, folderName],
  );
}

export const togglePrayerFavorite = async (
  prayerId: number,
  folder: { name: string; color: string },
): Promise<boolean> => {
  const db = getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) AS count
       FROM favorite_prayers
      WHERE prayer_id = ? AND folder_name = ?;`,
    [prayerId, folder.name],
  );
  const exists = (row?.count ?? 0) > 0;

  if (exists) {
    await db.runAsync(
      `DELETE FROM favorite_prayers WHERE prayer_id = ? AND folder_name = ?;`,
      [prayerId, folder.name],
    );
    return false;
  } else {
    await db.runAsync(
      `INSERT OR IGNORE INTO favorite_prayers (prayer_id, folder_name, folder_color)
       VALUES (?, ?, ?);`,
      [prayerId, folder.name, folder.color],
    );
    return true;
  }
};

export async function getCategoryByTitle(
  title: string,
): Promise<PrayerCategoryType | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync<PrayerCategoryType>(
    `SELECT id, title
     FROM prayer_categories
     WHERE title = ?
     LIMIT 1;`,
    [title],
  );
  return row ?? null;
}

export async function getChildCategories(
  parentId: number,
): Promise<PrayerCategoryType[]> {
  const db = getDatabase();
  return await db.getAllAsync<PrayerCategoryType>(
    `SELECT pc.id, pc.title
     FROM prayer_categories pc,
          json_each(pc.parent_id) AS j
     WHERE j.value = ?
     ORDER BY pc.title;`,
    [parentId],
  );
}

// Removes a folder and all favorites in it, atomically.
export async function removeFolder(
  name: string,
): Promise<{ deletedFolder: boolean; removedFavorites: number }> {
  const db = getDatabase();

  let removedFavorites = 0;
  let deletedFolder = false;

  try {
    await db.withExclusiveTransactionAsync(async (txn) => {
      // Delete favorites and get how many were removed
      const favRes = await txn.runAsync(
        `DELETE FROM favorite_prayers WHERE folder_name = ?;`,
        [name],
      );
      removedFavorites = favRes?.changes ?? 0;

      // Delete the folder and infer whether it existed
      const folderRes = await txn.runAsync(
        `DELETE FROM prayer_folders WHERE name = ?;`,
        [name],
      );
      deletedFolder = (folderRes?.changes ?? 0) > 0;
    });

    return { deletedFolder, removedFavorites };
  } catch (err) {
    console.error("removeFolder failed:", err);
    throw new Error(
      `Failed to remove folder "${name}": ${
        (err as Error)?.message ?? String(err)
      }`,
    );
  }
}

// All descendant category ids of root (including root)
export async function getCategoryTreeIds(rootId: number): Promise<number[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<{ id: number }>(
    `
    WITH RECURSIVE cat_tree(id) AS (
      SELECT ?
      UNION                      -- dedupe + cycle-safe
      SELECT pc.id
      FROM prayer_categories pc
      JOIN json_each(pc.parent_id) j
      JOIN cat_tree ct ON CAST(j.value AS INTEGER) = ct.id
    )
    SELECT id FROM cat_tree;
    `,
    [rootId],
  );
  return rows.map((r) => r.id);
}

// Localized prayers in root + all descendants
export async function getPrayersForCategoryTree(
  rootCategoryId: number,
  languageCode: string,
): Promise<PrayerWithCategory[]> {
  const db = getDatabase();
  return db.getAllAsync<PrayerWithCategory>(
    `
    WITH RECURSIVE cat_tree(id) AS (
      SELECT ?
      UNION
      SELECT pc.id
      FROM prayer_categories pc
      JOIN json_each(pc.parent_id) j
      JOIN cat_tree ct ON CAST(j.value AS INTEGER) = ct.id
    )
    SELECT
      p.id,
      p.name,
      p.arabic_title,
      t.translated_title,
      COALESCE(t.translated_text, p.arabic_text, '') AS prayer_text,
      p.category_id
    FROM prayers p
    LEFT JOIN prayer_translations t
      ON t.prayer_id = p.id AND t.language_code = ?
    WHERE p.category_id IN (SELECT id FROM cat_tree)
    ORDER BY p.name COLLATE NOCASE;
    `,
    [rootCategoryId, languageCode],
  );
}

// Arabic-only prayers in root + all descendants
export async function getAllPrayersForArabicTree(
  rootCategoryId: number,
): Promise<PrayerWithCategory[]> {
  const db = getDatabase();
  return db.getAllAsync<PrayerWithCategory>(
    `
    WITH RECURSIVE cat_tree(id) AS (
      SELECT ?
      UNION
      SELECT pc.id
      FROM prayer_categories pc
      JOIN json_each(pc.parent_id) j
      JOIN cat_tree ct ON CAST(j.value AS INTEGER) = ct.id
    )
    SELECT
      p.id,
      p.name,
      p.arabic_title,
      p.arabic_text AS prayer_text,
      p.category_id
    FROM prayers p
    WHERE p.category_id IN (SELECT id FROM cat_tree)
    ORDER BY p.name COLLATE NOCASE;
    `,
    [rootCategoryId],
  );
}
/**
 * Resolve a prayer for internal links.
 *
 * Canonical:
 * - internal URL: `prayerLink:<id>`
 * - <id> is the numeric primary key from `prayers.id`
 *
 * `identifier` can be string or number; we normalize to number.
 * `lang` is accepted for symmetry / future localization, not used yet.
 */
export const getPrayerInternalURL = async (
  identifier: string | number,
  lang: LanguageCode,
): Promise<PrayerType | null> => {
  try {
    const id =
      typeof identifier === "number"
        ? identifier
        : Number(String(identifier).trim());

    if (!Number.isFinite(id)) {
      console.warn(
        "getPrayerInternalURL: Invalid prayer id identifier",
        identifier,
      );
      return null;
    }

    const db = getDatabase();

    const row = await db.getFirstAsync<PrayerType>(
      `
      SELECT *
      FROM prayers
      WHERE id = ?
      LIMIT 1;
      `,
      [id],
    );

    return row ?? null;
  } catch (error) {
    console.error("getPrayerInternalURL: Error fetching prayer:", {
      identifier,
      lang,
      error,
    });
    return null;
  }
};
