export const BOWEL_CONDITIONS = [
  "あり",
  "少しあり",
  "なし",
  "便秘気味",
  "未入力",
] as const;

export const FATIGUE_LEVELS = [
  { value: 1, label: "元気" },
  { value: 2, label: "少し疲れている" },
  { value: 3, label: "普通" },
  { value: 4, label: "かなり疲れている" },
  { value: 5, label: "とてもつらい" },
] as const;

export const PAIN_LEVELS = [
  { value: 0, label: "痛みなし" },
  { value: 1, label: "軽い痛み" },
  { value: 2, label: "中程度の痛み" },
  { value: 3, label: "強い痛み" },
] as const;

export const HEADACHE_SEVERITIES = [
  { value: 0, label: "なし" },
  { value: 1, label: "軽い" },
  { value: 2, label: "普通" },
  { value: 3, label: "強い" },
  { value: 4, label: "非常に強い" },
] as const;

export const PAIN_LOCATIONS = [
  "頭",
  "首",
  "肩",
  "腰",
  "腕",
  "脚",
  "足",
  "全身",
  "その他",
] as const;

export const GRAPH_PERIODS = [
  { value: "7", label: "7日" },
  { value: "30", label: "30日" },
  { value: "90", label: "90日" },
  { value: "365", label: "1年" },
  { value: "all", label: "全期間" },
] as const;

export const TEXT_LIMITS = {
  breakfastText: 500,
  healthNote: 1000,
  painNote: 500,
  headacheNote: 500,
  scheduleNote: 500,
} as const;

export const WEIGHT_PLAUSIBLE_MIN = 20;
export const WEIGHT_PLAUSIBLE_MAX = 300;
export const BODY_FAT_PLAUSIBLE_MIN = 3;
export const BODY_FAT_PLAUSIBLE_MAX = 60;
export const WEIGHT_LARGE_CHANGE_KG = 3;
export const BODY_FAT_LARGE_CHANGE_PERCENT = 5;

export const INPUT_STEP_COUNT = 9;
