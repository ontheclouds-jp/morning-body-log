import { addDays, parseISO } from "date-fns";
import type { DailyRecord } from "./types";
import { diffFromPrevious, getPreviousRecord, sevenDayAverage } from "./calculations";
import { classifyBreakfast } from "./breakfastClassifier";

export type WarningFlag =
  | "strong_pain"
  | "high_fatigue_streak"
  | "bowel_issue_streak"
  | "rapid_weight_change"
  | "health_note_alarming";

export interface CommentResult {
  comment: string;
  warningFlags: WarningFlag[];
  warningMessage: string | null;
}

export const WARNING_MESSAGE =
  "強い痛みや体調不良が続く場合は、このアプリだけで判断せず、医療機関や専門家へ相談してください。";

const ALARMING_KEYWORDS = [
  "息苦し",
  "激痛",
  "耐えられない",
  "救急",
  "動けない",
  "意識が",
  "吐血",
  "高熱",
  "失神",
  "倒れ",
  "止まらない出血",
  "呼吸が苦し",
];

const FATIGUE_STREAK_THRESHOLD = 3;
const BOWEL_STREAK_THRESHOLD = 3;
const RAPID_CHANGE_WITHIN_DAYS = 3;
const RAPID_CHANGE_KG = 2;
const COMMENT_MAX_LENGTH = 250;

function toDate(dateString: string): Date {
  return parseISO(dateString);
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function consecutiveMatchingDays(
  records: DailyRecord[],
  date: string,
  predicate: (record: DailyRecord) => boolean,
): number {
  const byDate = new Map(records.map((r) => [r.recordDate, r]));
  let count = 0;
  let cursor = toDate(date);

  while (true) {
    const record = byDate.get(formatDate(cursor));
    if (!record || !predicate(record)) break;
    count += 1;
    cursor = addDays(cursor, -1);
  }

  return count;
}

function buildWeightSegment(records: DailyRecord[], date: string, today: DailyRecord): string {
  const previous = getPreviousRecord(records, date);
  if (!previous) {
    return "体重の記録を始めました。これから7日間の平均を見ながら、ゆっくり変化を確認していきましょう。";
  }

  const diff = diffFromPrevious(records, date, "weightKg");
  const avg = sevenDayAverage(records, date, "weightKg");
  const avgValue = avg.average ?? today.weightKg;

  if (diff === null || diff === 0) {
    return `今朝の体重は前回とほぼ同じです。7日間の平均${avgValue}kgを参考に、経過を見ていきましょう。`;
  }

  const abs = Math.abs(diff).toFixed(1);
  if (diff < 0) {
    return `今朝の体重は前回より${abs}kg減っています。ただし、毎日の体重は水分量や便通でも変化します。7日間の平均${avgValue}kgでゆっくり確認していきましょう。`;
  }

  return `今朝の体重は前回より${abs}kg増えています。日々の変動はよくあることなので、気にしすぎず7日間の平均${avgValue}kgで様子を見ていきましょう。`;
}

function buildConditionSegment(today: DailyRecord): string | null {
  if (today.painLevel !== undefined && today.painLevel >= 2) {
    return "痛みがあるようです。無理をせず、負担の少ない過ごし方を心がけてください。";
  }
  if (today.fatigueLevel !== undefined && today.fatigueLevel >= 4) {
    return "今朝は疲労感が強めです。今日は無理に運動量を増やさず、休息を優先してください。";
  }
  if (today.fatigueLevel === 1) {
    return "元気に過ごせているようで良かったです。";
  }
  return null;
}

function buildBreakfastSegment(today: DailyRecord): string | null {
  if (!today.breakfastText) return null;
  const c = classifyBreakfast(today.breakfastText);

  if (c.hasStaple && c.hasProtein && (c.hasVegetable || c.hasFruit)) {
    return "朝食は主食・たんぱく質に加えて野菜や果物もとれていて、バランスが良さそうです。";
  }
  if (c.hasStaple && c.hasProtein) {
    return "朝食には主食とたんぱく質が含まれています。野菜や果物を追加できると、よりバランスが良くなりそうです。";
  }
  if (c.hasStaple || c.hasProtein) {
    return "朝食の内容が確認できました。無理のない範囲で品数を増やせると良さそうです。";
  }
  return null;
}

function joinWithinLimit(segments: string[], maxLength: number): string {
  let result = "";
  for (const segment of segments) {
    const candidate = result ? `${result} ${segment}` : segment;
    if (candidate.length > maxLength && result) break;
    result = candidate;
  }
  return result || "今日も記録できました。お疲れさまでした。";
}

function computeWarningFlags(records: DailyRecord[], date: string, today: DailyRecord): WarningFlag[] {
  const flags: WarningFlag[] = [];

  if (today.painLevel === 3) {
    flags.push("strong_pain");
  }

  if (
    consecutiveMatchingDays(
      records,
      date,
      (r) => r.fatigueLevel !== undefined && r.fatigueLevel >= 4,
    ) >= FATIGUE_STREAK_THRESHOLD
  ) {
    flags.push("high_fatigue_streak");
  }

  if (
    consecutiveMatchingDays(
      records,
      date,
      (r) => r.bowelCondition === "なし" || r.bowelCondition === "便秘気味",
    ) >= BOWEL_STREAK_THRESHOLD
  ) {
    flags.push("bowel_issue_streak");
  }

  const windowStart = formatDate(addDays(toDate(date), -RAPID_CHANGE_WITHIN_DAYS));
  const recent = records
    .filter((r) => r.recordDate >= windowStart && r.recordDate <= date)
    .sort((a, b) => a.recordDate.localeCompare(b.recordDate));
  if (recent.length >= 2) {
    const change = recent[recent.length - 1].weightKg - recent[0].weightKg;
    if (Math.abs(change) >= RAPID_CHANGE_KG) {
      flags.push("rapid_weight_change");
    }
  }

  const noteText = `${today.healthNote ?? ""} ${today.painNote ?? ""}`;
  if (ALARMING_KEYWORDS.some((keyword) => noteText.includes(keyword))) {
    flags.push("health_note_alarming");
  }

  return flags;
}

export function generateDailyComment(
  records: DailyRecord[],
  date: string,
): CommentResult | null {
  const today = records.find((r) => r.recordDate === date);
  if (!today) return null;

  const segments = [
    buildWeightSegment(records, date, today),
    buildConditionSegment(today),
    buildBreakfastSegment(today),
  ].filter((s): s is string => s !== null);

  const comment = joinWithinLimit(segments, COMMENT_MAX_LENGTH);
  const warningFlags = computeWarningFlags(records, date, today);

  return {
    comment,
    warningFlags,
    warningMessage: warningFlags.length > 0 ? WARNING_MESSAGE : null,
  };
}
