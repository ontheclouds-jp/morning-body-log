import { db } from "./db";
import type { AppSettings } from "./types";

const SETTINGS_ID = 1;

export async function getSettings(): Promise<AppSettings | undefined> {
  return db.appSettings.get(SETTINGS_ID);
}

export async function updateSettings(
  patch: Partial<Omit<AppSettings, "id">>,
): Promise<void> {
  const existing = await getSettings();
  await db.appSettings.put({
    ...existing,
    ...patch,
    id: SETTINGS_ID,
    updatedAt: new Date().toISOString(),
  });
}
