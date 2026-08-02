import type {
  BOWEL_CONDITIONS,
  FATIGUE_LEVELS,
  PAIN_LEVELS,
  PAIN_LOCATIONS,
  GRAPH_PERIODS,
} from "./constants";

export type BowelCondition = (typeof BOWEL_CONDITIONS)[number];
export type FatigueLevel = (typeof FATIGUE_LEVELS)[number]["value"];
export type PainLevel = (typeof PAIN_LEVELS)[number]["value"];
export type PainLocation = (typeof PAIN_LOCATIONS)[number];
export type GraphPeriod = (typeof GRAPH_PERIODS)[number]["value"];

export interface DailyRecord {
  id: string;
  recordDate: string; // YYYY-MM-DD
  weightKg: number;
  bodyFatPercent?: number;
  breakfastText?: string;
  bowelCondition?: BowelCondition;
  fatigueLevel?: FatigueLevel;
  painLevel?: PainLevel;
  painLocations?: PainLocation[];
  painNote?: string;
  healthNote?: string;
  scheduleNote?: string;
  generatedComment?: string;
  warningFlags?: string[];
  createdAt: string;
  updatedAt: string;
}

export type DailyRecordInput = Omit<
  DailyRecord,
  "id" | "createdAt" | "updatedAt" | "generatedComment" | "warningFlags"
>;

export interface AppSettings {
  id: number;
  displayName?: string;
  targetWeightKg?: number;
  fontSize?: "standard" | "large" | "extra-large";
  graphDefaultPeriod?: GraphPeriod;
  reminderTime?: string;
  commentEnabled?: boolean;
  visibleFields?: string[];
  theme?: string;
  storageMode?: string;
  lastBackupAt?: string;
  updatedAt?: string;
}

export interface DraftRecord {
  recordDate: string;
  currentStep: number;
  draftData: Record<string, unknown>;
  updatedAt: string;
}
