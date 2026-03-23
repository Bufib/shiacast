import { supabase } from "../../utils/supabase";
import { getDatabase } from "..";
import { useDataVersionStore } from "../../stores/dataVersionStore";

export default async function syncCalendar(): Promise<void> {
  try {
    const [legendRes, calRes] = await Promise.all([
      supabase
        .from("calendarLegend")
        .select("id, legend_type, created_at, language_code, color")
        .order("id", { ascending: true }),
      supabase
        .from("calendar")
        .select(
          `
          id, title, islamic_date, gregorian_date,
          description, recommended_acts, legend_type,
          created_at, language_code
          `
        )
        .order("id", { ascending: true }),
    ]);

    if (legendRes.error) {
      console.error("Error fetching calendarLegend:", legendRes.error.message);
      return;
    }
    if (calRes.error) {
      console.error("Error fetching calendar:", calRes.error.message);
      return;
    }

    const legends = legendRes.data ?? [];
    const rows = calRes.data ?? [];

    const db = getDatabase();
    const runTx =
      (db as any).withExclusiveTransactionAsync?.bind(db) ??
      db.withTransactionAsync.bind(db);

    await runTx(async (txn: any) => {
      await txn.runAsync(`DELETE FROM calendar;`);
      await txn.runAsync(`DELETE FROM calendarLegend;`);

      // legends
      const typeStmt = await txn.prepareAsync(
        `INSERT OR REPLACE INTO calendarLegend
           (id, created_at, legend_type, language_code, color)
         VALUES (?, ?, ?, ?, ?);`
      );
      for (const t of legends) {
        await typeStmt.executeAsync([
          t.id,
          t.created_at,
          t.legend_type,
          t.language_code,
          t.color,
        ]);
      }
      await typeStmt.finalizeAsync();

      // calendar rows
      const calStmt = await txn.prepareAsync(
        `INSERT OR REPLACE INTO calendar
           (id, title, islamic_date, gregorian_date, description,
            recommended_acts, legend_type, created_at, language_code)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`
      );
      for (const r of rows) {
        await calStmt.executeAsync([
          r.id,
          r.title,
          r.islamic_date,
          r.gregorian_date,
          r.description ?? null,
          r.recommended_acts ? JSON.stringify(r.recommended_acts) : null,
          r.legend_type,
          r.created_at,
          r.language_code,
        ]);
      }
      await calStmt.finalizeAsync();
    });

    console.log(
      `Calendar & calendarLegend synced (FULL replace, ALL languages).`
    );

    const { incrementCalendarVersion } = useDataVersionStore.getState();
    incrementCalendarVersion();
  } catch (err) {
    console.error("Critical error in syncCalendar:", err);
  }
}