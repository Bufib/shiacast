// src/db/queries/calendar.ts
import { getDatabase } from "..";
import { CalendarType, calendarLegendType } from "@/constants/Types";

function parseRecommendedActs(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.filter((s): s is string => typeof s === "string" && s.length > 0);
  }
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.filter((s): s is string => typeof s === "string" && s.length > 0)
        : [];
    } catch {
      return [];
    }
  }
  return [];
}

/** All calendar rows for a language (ordered by date). */
export async function getAllCalendarDates(
  language: string,
): Promise<CalendarType[]> {
  try {
    const db = getDatabase();
    const rows = await db.getAllAsync<CalendarType & { recommended_acts: any }>(
      `
      SELECT id,
             title,
             islamic_date,
             gregorian_date,
             description,
             legend_type,
             created_at,
             language_code,
             recommended_acts
      FROM calendar
      WHERE language_code = ?
      ORDER BY gregorian_date;
      `,
      [language],
    );
    return rows.map((row) => ({
      ...row,
      recommended_acts: parseRecommendedActs(row.recommended_acts),
    }));
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return [];
  }
}

/** All legend rows for a language (alphabetical). */
export async function getAllCalendarLegend(
  language: string,
): Promise<calendarLegendType[]> {
  try {
    const db = getDatabase();
    return db.getAllAsync<calendarLegendType>(
      `
      SELECT id,
             legend_type,
             created_at,
             language_code,
             color
      FROM calendarLegend
      WHERE language_code = ?
      ORDER BY legend_type;
      `,
      [language],
    );
  } catch (error) {
    console.error("Error fetching calendar legend_type:", error);
    return [];
  }
}

/**
 * Map of legend_type -> color for a language.
 * Perfect for quickly styling events/labels.
 */
export async function getCalendarLegendColors(
  language: string,
): Promise<Record<string, string>> {
  try {
    const db = getDatabase();
    const rows = await db.getAllAsync<{ legend_type: string; color: string }>(
      `
      SELECT legend_type,
             color
      FROM calendarLegend
      WHERE language_code = ?
      ORDER BY legend_type;
      `,
      [language],
    );

    const map: Record<string, string> = {};
    for (const row of rows) {
      map[row.legend_type] = row.color;
    }
    return map;
  } catch (error) {
    console.error("Error fetching calendar legend colors:", error);
    return {};
  }
}

/** Just the legend_type names (for pickers), filtered by language. */
export async function getCalendarLegendTypeNames(
  language: string,
): Promise<string[]> {
  try {
    const db = getDatabase();
    const rows = await db.getAllAsync<{ legend_type: string }>(
      `
      SELECT legend_type
      FROM calendarLegend
      WHERE language_code = ?
      ORDER BY legend_type;
      `,
      [language],
    );
    return rows.map((r) => r.legend_type);
  } catch (error) {
    console.error("Error fetching calendar legend_type:", error);
    return [];
  }
}

/** Count how many events each legend_type has (for a language). Includes color for convenience. */
export async function getCalendarEventsCount(
  language: string,
): Promise<{ legend_type: string; count: number; color: string }[]> {
  try {
    const db = getDatabase();
    return db.getAllAsync<{
      legend_type: string;
      count: number;
      color: string;
    }>(
      `
      SELECT cl.legend_type AS legend_type,
             cl.color        AS color,
             COUNT(c.id)     AS count
      FROM calendarLegend cl
      LEFT JOIN calendar c
        ON c.legend_type = cl.legend_type
       AND c.language_code = cl.language_code
      WHERE cl.language_code = ?
      GROUP BY cl.legend_type, cl.color
      ORDER BY cl.legend_type;
      `,
      [language],
    );
  } catch (error) {
    console.error("Error fetching calendar legend_type counts:", error);
    return [];
  }
}

/** All events of a specific legend_type for a language (oldest → newest). */
export async function getCalendarEventsByLegendType(
  language: string,
  legend_type: string,
): Promise<CalendarType[]> {
  try {
    const db = getDatabase();
    const rows = await db.getAllAsync<CalendarType & { recommended_acts: any }>(
      `
      SELECT id,
             title,
             islamic_date,
             gregorian_date,
             description,
             legend_type,
             created_at,
             language_code,
             recommended_acts
      FROM calendar
      WHERE language_code = ?
        AND legend_type = ?
      ORDER BY gregorian_date;
      `,
      [language, legend_type],
    );
    return rows.map((row) => ({
      ...row,
      recommended_acts: parseRecommendedActs(row.recommended_acts),
    }));
  } catch (error) {
    console.error("Error fetching events by legend_type:", error);
    return [];
  }
}

// Map of legend ID -> color for quick styling
export async function getCalendarLegendColorById(
  language: string,
): Promise<Record<number, string>> {
  try {
    const db = getDatabase();
    const rows = await db.getAllAsync<{ id: number; color: string }>(
      `
      SELECT id, color
      FROM calendarLegend
      WHERE language_code = ?;
      `,
      [language],
    );

    const map: Record<number, string> = {};
    for (const row of rows) {
      map[row.id] = row.color;
    }
    return map;
  } catch (error) {
    console.error("Error fetching calendar legend colors by ID:", error);
    return {};
  }
}
