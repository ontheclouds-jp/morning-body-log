import { db } from "./db";
import { triggerAutoBackup } from "./autoBackup";
import { getRecordByDate } from "./records";
import { backupFileSchema } from "./backupSchema";
import type { DailyRecord, FatigueLevel, HeadacheSeverity, PainLevel } from "./types";

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
    headacheFlag: r.headacheFlag,
    headacheSeverity: r.headacheSeverity as HeadacheSeverity | undefined,
    headacheNote: r.headacheNote,
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
  triggerAutoBackup();
  return { imported };
}

export async function deleteAllData(): Promise<void> {
  await db.dailyRecords.clear();
  await db.draftRecords.clear();
}
