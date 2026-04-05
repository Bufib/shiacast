

// import { CalendarType } from "@/constants/Types";

// function clampOffset(value: number): number {
//   return Math.max(-3, Math.min(3, Math.trunc(value)));
// }

// export function applyIslamicDateOffset(
//   rows: CalendarType[],
//   offset: number
// ): CalendarType[] {
//   const safeOffset = clampOffset(offset);

//   if (!rows.length || safeOffset === 0) {
//     return rows.map((row) => ({
//       ...row,
//       recommended_acts: [...(row.recommended_acts ?? [])],
//     }));
//   }

//   return rows.map((targetRow, index) => {
//     const sourceIndex = index - safeOffset;
//     const sourceRow = rows[sourceIndex];

//     // Kein Wrapping, keine neuen Tage, kein Löschen von gregorian_date
//     // Wenn es am Rand keine Quelle gibt, bleibt der Tag einfach wie er ist
//     if (!sourceRow) {
//       return {
//         ...targetRow,
//         recommended_acts: [...(targetRow.recommended_acts ?? [])],
//       };
//     }

//     return {
//       ...targetRow, // gregorian_date bleibt unverändert
//       islamic_date: sourceRow.islamic_date,
//       title: sourceRow.title,
//       description: sourceRow.description,
//       recommended_acts: [...(sourceRow.recommended_acts ?? [])],
//       legend_type: sourceRow.legend_type,
//     };
//   });
// }

import { CalendarType } from "@/constants/Types";

function clampOffset(value: number): number {
  return Math.max(-3, Math.min(3, Math.trunc(value)));
}

export function applyIslamicDateOffset(
  rows: CalendarType[],
  offset: number
): CalendarType[] {
  const safeOffset = clampOffset(offset);

  if (!rows.length || safeOffset === 0) {
    return rows.map((row) => ({
      ...row,
      recommended_acts: [...(row.recommended_acts ?? [])],
    }));
  }

  return rows.map((targetRow, index) => {
    const sourceIndex = index - safeOffset;
    const sourceRow = rows[sourceIndex];

    if (!sourceRow) {
      return {
        ...targetRow,
        recommended_acts: [...(targetRow.recommended_acts ?? [])],
      };
    }

    return {
      ...targetRow,
      islamic_date: sourceRow.islamic_date,
      title: sourceRow.title,
      description: sourceRow.description,
      recommended_acts: [...(sourceRow.recommended_acts ?? [])],
      legend_type: sourceRow.legend_type,
    };
  });
}