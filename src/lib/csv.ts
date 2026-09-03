import { sortByDateAsc } from "./calculations";
import { FATIGUE_LEVELS, HEADACHE_SEVERITIES, PAIN_LEVELS } from "./constants";
import type { DailyRecord } from "./types";

const HEADER = [
  "日付",
  "体重(kg)",
  "体脂肪率(%)",
  "朝食",
  "便通",
  "疲労感",
  "痛みの程度",
  "痛みの場所",
  "痛みメモ",
  "頭痛の有無",
  "頭痛の強さ",
  "頭痛メモ",
  "体調メモ",
  "今日の予定",
  "コメント",
  "記録日時",
  "更新日時",
];

const UTF8_BOM = String.fromCharCode(0xfeff);

function csvField(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function recordsToCsv(records: DailyRecord[]): string {
  const rows = sortByDateAsc(records).map((r) => [
    r.recordDate,
    String(r.weightKg),
    r.bodyFatPercent !== undefined ? String(r.bodyFatPercent) : "",
    r.breakfastText ?? "",
    r.bowelCondition ?? "",
    FATIGUE_LEVELS.find((f) => f.value === r.fatigueLevel)?.label ?? "",
    PAIN_LEVELS.find((p) => p.value === r.painLevel)?.label ?? "",
    r.painLocations?.join("、") ?? "",
    r.painNote ?? "",
    r.headacheFlag ? "あり" : "なし",
    r.headacheFlag
      ? (HEADACHE_SEVERITIES.find((h) => h.value === r.headacheSeverity)?.label ?? "")
      : "",
    r.headacheNote ?? "",
    r.healthNote ?? "",
    r.scheduleNote ?? "",
    r.generatedComment ?? "",
    r.createdAt,
    r.updatedAt,
  ]);

  const lines = [HEADER, ...rows].map((row) =>
    row.map(csvField).join(","),
  );

  // UTF-8 BOM so spreadsheet software (Excel) detects the encoding correctly.
  return UTF8_BOM + lines.join("\r\n");
}
