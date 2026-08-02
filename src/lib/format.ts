import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";

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
