import { z } from "zod";
import { BOWEL_CONDITIONS, PAIN_LOCATIONS } from "./constants";

// クライアント（JSON復元）とサーバー（自動バックアップAPI）の両方で使うため、
// IndexedDBに依存しないファイルに分けている。
export const backupRecordSchema = z.object({
  id: z.string().optional(),
  recordDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  weightKg: z.number().positive(),
  bodyFatPercent: z.number().optional(),
  breakfastText: z.string().optional(),
  bowelCondition: z.enum(BOWEL_CONDITIONS).optional(),
  fatigueLevel: z.number().min(1).max(5).optional(),
  painLevel: z.number().min(0).max(3).optional(),
  painLocations: z.array(z.enum(PAIN_LOCATIONS)).optional(),
  painNote: z.string().optional(),
  headacheFlag: z.boolean().optional(),
  headacheSeverity: z.number().min(0).max(4).optional(),
  headacheNote: z.string().optional(),
  healthNote: z.string().optional(),
  scheduleNote: z.string().optional(),
  generatedComment: z.string().optional(),
  warningFlags: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const backupFileSchema = z.object({
  records: z.array(backupRecordSchema),
});
