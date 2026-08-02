import { z } from "zod";
import { db } from "./db";
import { getRecordByDate } from "./records";
import { BOWEL_CONDITIONS, PAIN_LOCATIONS } from "./constants";
import type { DailyRecord, FatigueLevel, PainLevel } from "./types";

const backupRecordSchema = z.object({
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
  healthNote: z.string().optional(),
  scheduleNote: z.string().optional(),
  generatedComment: z.string().optional(),
  warningFlags: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

const backupFileSchema = z.object({
  records: z.array(backupRecordSchema),
});

export interface BackupPayload {
  exportedAt: string;
  version: 1;
  records: DailyRecord[];
}

export function recordsToBackupJson(records: DailyRecord[]): string {
  const payload: BackupPayload = {
    exportedAt: new Date().toISOString(),
    version: 1,
    records,
  };
  return JSON.stringify(payload, null, 2);
}

export type ParseBackupResult =
  | { ok: true; records: DailyRecord[] }
  | { ok: false; error: string };

export function parseBackupJson(text: string): ParseBackupResult {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, error: "JSONファイルの形式が正しくありません。" };
  }

  const result = backupFileSchema.safeParse(json);
  if (!result.success) {
    return {
      ok: false,
      error: "バックアップファイルの内容が正しくありません。",
    };
  }

  const now = new Date().toISOString();
  const records: DailyRecord[] = result.data.records.map((r) => ({
    id: r.id ?? crypto.randomUUID(),
    recordDate: r.recordDate,
    weightKg: r.weightKg,
    bodyFatPercent: r.bodyFatPercent,
    breakfastText: r.breakfastText,
    bowelCondition: r.bowelCondition,
    fatigueLevel: r.fatigueLevel as FatigueLevel | undefined,
    painLevel: r.painLevel as PainLevel | undefined,
    painLocations: r.painLocations,
    painNote: r.painNote,
    healthNote: r.healthNote,
    scheduleNote: r.scheduleNote,
    generatedComment: r.generatedComment,
    warningFlags: r.warningFlags,
    createdAt: r.createdAt ?? now,
    updatedAt: r.updatedAt ?? now,
  }));

  return { ok: true, records };
}

export async function restoreRecords(
  records: DailyRecord[],
): Promise<{ imported: number }> {
  let imported = 0;
  for (const record of records) {
    const existing = await getRecordByDate(record.recordDate);
    const id = existing ? existing.id : record.id;
    await db.dailyRecords.put({ ...record, id });
    imported += 1;
  }
  return { imported };
}

export async function deleteAllData(): Promise<void> {
  await db.dailyRecords.clear();
  await db.draftRecords.clear();
}
