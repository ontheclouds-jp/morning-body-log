import { db } from "./db";
import { generateDailyComment } from "./comments";
import type { DailyRecord, DailyRecordInput, DraftRecord } from "./types";

export async function getAllRecords(): Promise<DailyRecord[]> {
  return db.dailyRecords.toArray();
}

export async function getRecordByDate(
  date: string,
): Promise<DailyRecord | undefined> {
  return db.dailyRecords.where("recordDate").equals(date).first();
}

export async function saveRecord(
  input: DailyRecordInput,
): Promise<DailyRecord> {
  const existing = await getRecordByDate(input.recordDate);
  const now = new Date().toISOString();

  const base: DailyRecord = existing
    ? { ...existing, ...input, updatedAt: now }
    : {
        ...input,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };

  const otherRecords = await getAllRecords();
  const recordsForComment = [
    ...otherRecords.filter((r) => r.id !== base.id),
    base,
  ];
  const result = generateDailyComment(recordsForComment, base.recordDate);

  const record: DailyRecord = {
    ...base,
    generatedComment: result?.comment,
    warningFlags: result?.warningFlags.length ? result.warningFlags : undefined,
  };

  await db.dailyRecords.put(record);
  await db.draftRecords.delete(input.recordDate);
  return record;
}

export async function deleteRecord(date: string): Promise<void> {
  const record = await getRecordByDate(date);
  if (record) {
    await db.dailyRecords.delete(record.id);
  }
}

export async function getDraft(
  date: string,
): Promise<DraftRecord | undefined> {
  return db.draftRecords.get(date);
}

export async function saveDraft(
  date: string,
  currentStep: number,
  draftData: Record<string, unknown>,
): Promise<void> {
  await db.draftRecords.put({
    recordDate: date,
    currentStep,
    draftData,
    updatedAt: new Date().toISOString(),
  });
}

export async function clearDraft(date: string): Promise<void> {
  await db.draftRecords.delete(date);
}

export async function getAdjacentDate(
  date: string,
  direction: "prev" | "next",
): Promise<string | null> {
  const all = await getAllRecords();
  const sorted = all
    .map((r) => r.recordDate)
    .sort((a, b) => a.localeCompare(b));

  if (direction === "prev") {
    const earlier = sorted.filter((d) => d < date);
    return earlier[earlier.length - 1] ?? null;
  }

  const later = sorted.filter((d) => d > date);
  return later[0] ?? null;
}
