import { CalendarType } from "@/constants/Types";

function addDaysToIsoDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function applyIslamicDateOffset(
  rows: CalendarType[],
  offset: number
): CalendarType[] {
  if (!offset) return rows;

  return rows
    .map((row) => ({
      ...row,
      gregorian_date: addDaysToIsoDate(row.gregorian_date, offset),
    }))
    .sort((a, b) => a.gregorian_date.localeCompare(b.gregorian_date));
}