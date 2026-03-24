// import { supabase } from "../../utils/supabase";
// import { getDatabase } from "..";
// import {
//   PrayerCategoryType,
//   PrayerType,
//   PrayerWithTranslationType,
// } from "@/constants/Types";
// import { useDataVersionStore } from "../../stores/dataVersionStore";

// // function normalizeParentId(parent: unknown): string | null {
// //   if (parent == null) return null;
// //   if (typeof parent === "string") return parent; // already JSON
// //   try {
// //     return JSON.stringify(parent); // array/object → JSON string
// //   } catch {
// //     return null;
// //   }
// // }

// function normalizeParentId(parent: unknown): string {
//   return parent == null ? "[]" : JSON.stringify(parent); // int8[] -> JSON array
// }

// /**
//  * Full replace of prayers & translations for ALL languages.
//  * Mirrors your "questions" approach (delete-then-insert),
//  * but for the entire prayers dataset.
//  */
// export default async function syncPrayers(): Promise<void> {
//   try {
//     // 1) Fetch everything needed from Supabase (NO language filters)
//     const [
//       { data: categories, error: catErr },
//       { data: prayers, error: prayerErr },
//       { data: translations, error: transErr },
//     ] = await Promise.all([
//       supabase
//         .from("prayer_categories")
//         .select("id, title, parent_id, language_code"),
//       supabase.from("prayers").select(`
//           id, name, arabic_title, category_id, arabic_introduction,
//           arabic_text, arabic_notes, transliteration_text, source,
//           translated_languages, created_at, updated_at
//         `),
//       supabase.from("prayer_translations").select(`
//           id, prayer_id, language_code, translated_introduction, translated_title,
//           translated_text, translated_notes, source, created_at, updated_at
//         `),
//     ]);

//     if (catErr) throw catErr;
//     if (prayerErr) throw prayerErr;
//     if (transErr) throw transErr;

//     const db = getDatabase();
//     const runTx =
//       (db as any).withExclusiveTransactionAsync?.bind(db) ??
//       db.withTransactionAsync.bind(db);

//     await runTx(async (txn: any) => {
//       // Prepared statements (INSERT OR ... like your questions sync)
//       const insertCat = await txn.prepareAsync(
//         `INSERT OR IGNORE INTO prayer_categories
//            (id, title, parent_id, language_code)
//          VALUES (?, ?, ?, ?);`,
//       );

//       const insertPrayer = await txn.prepareAsync(
//         `INSERT OR REPLACE INTO prayers
//            (id, name, arabic_title, category_id, arabic_introduction,
//             arabic_text, arabic_notes, transliteration_text, source,
//             translated_languages, created_at, updated_at)
//          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
//       );

//       const insertTrans = await txn.prepareAsync(
//         `INSERT OR REPLACE INTO prayer_translations
//            (id, prayer_id, language_code, translated_introduction, translated_title,
//             translated_text, translated_notes, source, created_at, updated_at)
//          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
//       );

//       try {
//         // A) FULL REPLACE — wipe local tables (ALL languages)
//         await txn.runAsync(`DELETE FROM prayer_translations;`);
//         await txn.runAsync(`DELETE FROM prayers;`);
//         await txn.runAsync(`DELETE FROM prayer_categories;`);

//         // B) Upsert categories (insert-if-missing)
//         for (const c of (categories ?? []) as PrayerCategoryType[]) {
//           await insertCat.executeAsync([
//             c.id,
//             c.title,
//             normalizeParentId(c.parent_id),
//             c.language_code,
//           ]);
//         }

//         // C) Re-insert prayers (all languages)
//         for (const p of (prayers ?? []) as PrayerType[]) {
//           await insertPrayer.executeAsync([
//             p.id,
//             p.name,
//             p.arabic_title ?? null,
//             p.category_id,
//             p.arabic_introduction ?? null,
//             p.arabic_text ?? null,
//             p.arabic_notes ?? null,
//             p.transliteration_text ?? null,
//             p.source ?? null,
//             JSON.stringify(p.translated_languages ?? []), // NOT NULL column in schema
//             p.created_at as any,
//             p.updated_at as any,
//           ]);
//         }

//         // D) Re-insert translations (ALL languages)
//         for (const t of (translations ?? []) as PrayerWithTranslationType[]) {
//           await insertTrans.executeAsync([
//             t.id,
//             t.prayer_id,
//             t.language_code,
//             t.translated_introduction ?? null,
//             t.translated_title ?? null,
//             t.translated_text ?? null,
//             t.translated_notes ?? null,
//             t.source ?? null,
//             t.created_at as any,
//             t.updated_at as any,
//           ]);
//         }

//         // E) Orphan sweeps
//         await txn.runAsync(`
//         DELETE FROM favorite_prayers
//         WHERE prayer_id NOT IN (SELECT id FROM prayers);
//       `);
//       } finally {
//         await Promise.allSettled([
//           insertCat.finalizeAsync(),
//           insertPrayer.finalizeAsync(),
//           insertTrans.finalizeAsync(),
//         ]);
//       }
//     });

//     console.log(`Prayers & translations synced (full replace, ALL languages).`);
//     // Increment the prayer version after successful sync
//     const { incrementPrayersVersion } = useDataVersionStore.getState();
//     incrementPrayersVersion();
//   } catch (error) {
//     console.error("Critical error in syncPrayers:", error);
//   }
// }


import { supabase } from "../../utils/supabase";
import { getDatabase } from "..";
import {
  PrayerCategoryType,
  PrayerRecommendationType,
  PrayerType,
  PrayerWithTranslationType,
} from "@/constants/Types";
import { useDataVersionStore } from "../../stores/dataVersionStore";

function normalizeParentId(parent: unknown): string {
  return parent == null ? "[]" : JSON.stringify(parent);
}

/**
 * Full replace of prayers, translations & recommendations for ALL languages.
 * Mirrors your "questions" approach (delete-then-insert),
 * but for the entire prayers dataset.
 */
export default async function syncPrayers(): Promise<void> {
  try {
    // 1) Fetch everything needed from Supabase (NO language filters)
    const [
      { data: categories, error: catErr },
      { data: prayers, error: prayerErr },
      { data: translations, error: transErr },
      { data: recommendations, error: recErr },
    ] = await Promise.all([
      supabase
        .from("prayer_categories")
        .select("id, title, parent_id, language_code"),
      supabase.from("prayers").select(`
          id, name, arabic_title, category_id, arabic_introduction,
          arabic_text, arabic_notes, transliteration_text, source,
          translated_languages, created_at, updated_at
        `),
      supabase.from("prayer_translations").select(`
          id, prayer_id, language_code, translated_introduction, translated_title,
          translated_text, translated_notes, source, created_at, updated_at
        `),
      supabase
        .from("prayer_recommendations")
        .select("id, recommendation_content, language_code"),
    ]);

    if (catErr) throw catErr;
    if (prayerErr) throw prayerErr;
    if (transErr) throw transErr;
    if (recErr) throw recErr;

    const db = getDatabase();
    const runTx =
      (db as any).withExclusiveTransactionAsync?.bind(db) ??
      db.withTransactionAsync.bind(db);

    await runTx(async (txn: any) => {
      // Prepared statements
      const insertCat = await txn.prepareAsync(
        `INSERT OR IGNORE INTO prayer_categories
           (id, title, parent_id, language_code)
         VALUES (?, ?, ?, ?);`,
      );

      const insertPrayer = await txn.prepareAsync(
        `INSERT OR REPLACE INTO prayers
           (id, name, arabic_title, category_id, arabic_introduction,
            arabic_text, arabic_notes, transliteration_text, source,
            translated_languages, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      );

      const insertTrans = await txn.prepareAsync(
        `INSERT OR REPLACE INTO prayer_translations
           (id, prayer_id, language_code, translated_introduction, translated_title,
            translated_text, translated_notes, source, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      );

      const insertRec = await txn.prepareAsync(
        `INSERT OR REPLACE INTO prayer_recommendations
           (id, recommendation_content, language_code)
         VALUES (?, ?, ?);`,
      );

      try {
        // A) FULL REPLACE — wipe local tables (ALL languages)
        await txn.runAsync(`DELETE FROM prayer_translations;`);
        await txn.runAsync(`DELETE FROM prayers;`);
        await txn.runAsync(`DELETE FROM prayer_categories;`);
        await txn.runAsync(`DELETE FROM prayer_recommendations;`);

        // B) Upsert categories (insert-if-missing)
        for (const c of (categories ?? []) as PrayerCategoryType[]) {
          await insertCat.executeAsync([
            c.id,
            c.title,
            normalizeParentId(c.parent_id),
            c.language_code,
          ]);
        }

        // C) Re-insert prayers (all languages)
        for (const p of (prayers ?? []) as PrayerType[]) {
          await insertPrayer.executeAsync([
            p.id,
            p.name,
            p.arabic_title ?? null,
            p.category_id,
            p.arabic_introduction ?? null,
            p.arabic_text ?? null,
            p.arabic_notes ?? null,
            p.transliteration_text ?? null,
            p.source ?? null,
            JSON.stringify(p.translated_languages ?? []),
            p.created_at as any,
            p.updated_at as any,
          ]);
        }

        // D) Re-insert translations (ALL languages)
        for (const t of (translations ?? []) as PrayerWithTranslationType[]) {
          await insertTrans.executeAsync([
            t.id,
            t.prayer_id,
            t.language_code,
            t.translated_introduction ?? null,
            t.translated_title ?? null,
            t.translated_text ?? null,
            t.translated_notes ?? null,
            t.source ?? null,
            t.created_at as any,
            t.updated_at as any,
          ]);
        }

        // E) Re-insert recommendations (ALL languages)
        for (const r of (recommendations ??
          []) as PrayerRecommendationType[]) {
          await insertRec.executeAsync([
            r.id,
            r.recommendation_content,
            r.language_code,
          ]);
        }

        // F) Orphan sweeps
        await txn.runAsync(`
          DELETE FROM favorite_prayers
          WHERE prayer_id NOT IN (SELECT id FROM prayers);
        `);
      } finally {
        await Promise.allSettled([
          insertCat.finalizeAsync(),
          insertPrayer.finalizeAsync(),
          insertTrans.finalizeAsync(),
          insertRec.finalizeAsync(),
        ]);
      }
    });

    console.log(
      `Prayers, translations & recommendations synced (full replace, ALL languages).`,
    );
    // Increment the prayer version after successful sync
    const { incrementPrayersVersion } = useDataVersionStore.getState();
    incrementPrayersVersion();
  } catch (error) {
    console.error("Critical error in syncPrayers:", error);
  }
}