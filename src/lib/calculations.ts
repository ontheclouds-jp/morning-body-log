import { addDays, differenceInCalendarDays, parseISO } from "date-fns";
import type { DailyRecord } from "./types";

function toDate(dateString: string): Date {
  return parseISO(dateString);
}

/** records must be sorted ascending by recordDate for callers that rely on order; this helper does not assume order. */
export function sortByDateAsc(records: DailyRecord[]): DailyRecord[] {
  return [...records].sort((a, b) => a.recordDate.localeCompare(b.recordDate));
}

export function getPreviousRecord(
  records: DailyRecord[],
  date: string,
): DailyRecord | null {
  const earlier = records
    .filter((r) => r.recordDate < date)
    .sort((a, b) => b.recordDate.localeCompare(a.recordDate));
  return earlier[0] ?? null;
}

export function diffFromPrevious(
  records: DailyRecord[],
  date: string,
  field: "weightKg" | "bodyFatPercent",
): number | null {
  const current = records.find((r) => r.recordDate === date);
  const currentValue = current?.[field];
  if (currentValue == null) return null;

  const previous = getPreviousRecord(records, date);
  const previousValue = previous?.[field];
  if (previousValue == null) return null;

  return Math.round((currentValue - previousValue) * 10) / 10;
}

export interface SevenDayAverageResult {
  average: number | null;
  count: number;
  isPartial: boolean;
}

export function sevenDayAverage(
  records: DailyRecord[],
  date: string,
  field: "weightKg" | "bodyFatPercent",
): SevenDayAverageResult {
  const end = toDate(date);
  const start = addDays(end, -6);
  const values = records
    .filter((r) => {
      const d = toDate(r.recordDate);
      return d >= start && d <= end && r[field] != null;
    })
    .map((r) => r[field] as number);

  if (values.length === 0) {
    return { average: null, count: 0, isPartial: true };
  }

  const sum = values.reduce((acc, v) => acc + v, 0);
  return {
    average: Math.round((sum / values.length) * 10) / 10,
    count: values.length,
    isPartial: values.length < 7,
  };
}

export function streakDays(records: DailyRecord[], asOfDate: string): number {
  const recordedDates = new Set(records.map((r) => r.recordDate));
  let streak = 0;
  let cursor = toDate(asOfDate);

  while (recordedDates.has(formatDate(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export interface PeriodStats {
  max: number | null;
  min: number | null;
  average: number | null;
  change: number | null;
  recordCount: number;
}

export function periodStats(
  records: DailyRecord[],
  field: "weightKg" | "bodyFatPercent",
  startDate: string | null,
  endDate: string,
): PeriodStats {
  const inRange = sortByDateAsc(
    records.filter((r) => {
      if (startDate !== null && r.recordDate < startDate) return false;
      return r.recordDate <= endDate;
    }),
  ).filter((r) => r[field] != null);

  if (inRange.length === 0) {
    return { max: null, min: null, average: null, change: null, recordCount: 0 };
  }

  const values = inRange.map((r) => r[field] as number);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const average = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
  const change = Math.round((values[values.length - 1] - values[0]) * 10) / 10;

  return { max, min, average, change, recordCount: inRange.length };
}

export function startDateForPeriod(
  endDate: string,
  period: "7" | "30" | "90" | "365" | "all",
): string | null {
  if (period === "all") return null;
  const days = { "7": 6, "30": 29, "90": 89, "365": 364 }[period];
  return formatDate(addDays(toDate(endDate), -days));
}

export function daysBetween(startDate: string, endDate: string): number {
  return differenceInCalendarDays(toDate(endDate), toDate(startDate));
}
