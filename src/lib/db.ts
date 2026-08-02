import Dexie, { type Table } from "dexie";
import type { AppSettings, DailyRecord, DraftRecord } from "./types";

export class MorningBodyLogDB extends Dexie {
  dailyRecords!: Table<DailyRecord, string>;
  appSettings!: Table<AppSettings, number>;
  draftRecords!: Table<DraftRecord, string>;

  constructor() {
    super("morning-body-log");
    this.version(1).stores({
      dailyRecords: "id, recordDate",
      appSettings: "id",
      draftRecords: "recordDate",
    });
  }
}

export const db = new MorningBodyLogDB();
