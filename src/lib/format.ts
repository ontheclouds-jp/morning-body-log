import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { HEADACHE_SEVERITIES } from "./constants";
import type { HeadacheSeverity } from "./types";

export function formatJapaneseDate(dateString: string): string {
  return format(parseISO(dateString), "yyyy年M月d日(E)", { locale: ja });
}

export function formatShortDate(dateString: string): string {
  return format(parseISO(dateString), "M/d(E)", { locale: ja });
}

export function formatDateTime(isoString: string): string {
  return format(parseISO(isoString), "yyyy年M月d日(E) HH:mm", { locale: ja });
}

export function formatSignedNumber(value: number): string {
  if (value > 0) return `+${value}`;
  return `${value}`;
}

export function headacheSeverityLabel(severity?: HeadacheSeverity): string {
  return HEADACHE_SEVERITIES.find((h) => h.value === severity)?.label ?? "";
}

/** Color classes for a headache badge, scaled by severity (light -> strong). */
export function headacheBadgeClasses(severity?: HeadacheSeverity): string {
  if (severity !== undefined && severity >= 3) {
    return "border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-100";
  }
  return "border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-100";
}
