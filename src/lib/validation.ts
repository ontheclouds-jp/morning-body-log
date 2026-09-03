import { z } from "zod";
import {
  BODY_FAT_LARGE_CHANGE_PERCENT,
  BODY_FAT_PLAUSIBLE_MAX,
  BODY_FAT_PLAUSIBLE_MIN,
  BOWEL_CONDITIONS,
  PAIN_LOCATIONS,
  TEXT_LIMITS,
  WEIGHT_LARGE_CHANGE_KG,
  WEIGHT_PLAUSIBLE_MAX,
  WEIGHT_PLAUSIBLE_MIN,
} from "./constants";

const headacheSeveritySchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

export function todayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "日付の形式が正しくありません")
  .refine((value) => value <= todayDateString(), "未来の日付は登録できません");

export const weightSchema = z
  .number()
  .positive("体重は0より大きい値を入力してください")
  .max(999, "有効な体重を入力してください");

export const bodyFatSchema = z
  .number()
  .min(0, "体脂肪率は0以上で入力してください")
  .max(100, "体脂肪率は100以下で入力してください");

export const dailyRecordInputSchema = z.object({
  recordDate: dateStringSchema,
  weightKg: weightSchema,
  bodyFatPercent: bodyFatSchema.optional(),
  breakfastText: z.string().max(TEXT_LIMITS.breakfastText).optional(),
  bowelCondition: z.enum(BOWEL_CONDITIONS).optional(),
  fatigueLevel: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]).optional(),
  painLevel: z.union([
    z.literal(0),
    z.literal(1),
    z.literal(2),
    z.literal(3),
  ]).optional(),
  painLocations: z.array(z.enum(PAIN_LOCATIONS)).optional(),
  painNote: z.string().max(TEXT_LIMITS.painNote).optional(),
  headacheFlag: z.boolean().optional(),
  headacheSeverity: headacheSeveritySchema.optional(),
  headacheNote: z.string().max(TEXT_LIMITS.headacheNote).optional(),
  healthNote: z.string().max(TEXT_LIMITS.healthNote).optional(),
  scheduleNote: z.string().max(TEXT_LIMITS.scheduleNote).optional(),
});

export function isWeightPlausible(value: number): boolean {
  return value >= WEIGHT_PLAUSIBLE_MIN && value <= WEIGHT_PLAUSIBLE_MAX;
}

export function isBodyFatPlausible(value: number): boolean {
  return value >= BODY_FAT_PLAUSIBLE_MIN && value <= BODY_FAT_PLAUSIBLE_MAX;
}

export function isWeightChangeLarge(
  current: number,
  previous: number | null,
): boolean {
  if (previous === null) return false;
  return Math.abs(current - previous) >= WEIGHT_LARGE_CHANGE_KG;
}

export function isBodyFatChangeLarge(
  current: number,
  previous: number | null,
): boolean {
  if (previous === null) return false;
  return Math.abs(current - previous) >= BODY_FAT_LARGE_CHANGE_PERCENT;
}
