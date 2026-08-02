const STAPLE_KEYWORDS = [
  "ご飯",
  "ごはん",
  "白米",
  "玄米",
  "パン",
  "トースト",
  "シリアル",
  "パスタ",
  "うどん",
  "そば",
  "もち",
  "おにぎり",
  "麺",
];

const PROTEIN_KEYWORDS = [
  "卵",
  "たまご",
  "肉",
  "魚",
  "鮭",
  "納豆",
  "豆腐",
  "ヨーグルト",
  "牛乳",
  "チーズ",
  "ハム",
  "ソーセージ",
  "ベーコン",
  "プロテイン",
];

const VEGETABLE_KEYWORDS = [
  "野菜",
  "サラダ",
  "トマト",
  "ほうれん草",
  "きゅうり",
  "レタス",
  "キャベツ",
  "きのこ",
];

const FRUIT_KEYWORDS = [
  "バナナ",
  "りんご",
  "みかん",
  "フルーツ",
  "果物",
  "いちご",
  "ぶどう",
  "キウイ",
  "オレンジ",
];

export interface BreakfastClassification {
  hasStaple: boolean;
  hasProtein: boolean;
  hasVegetable: boolean;
  hasFruit: boolean;
}

function includesAny(text: string, keywords: string[]): boolean {
  return keywords.some((k) => text.includes(k));
}

export function classifyBreakfast(
  text: string | undefined,
): BreakfastClassification {
  const t = text ?? "";
  return {
    hasStaple: includesAny(t, STAPLE_KEYWORDS),
    hasProtein: includesAny(t, PROTEIN_KEYWORDS),
    hasVegetable: includesAny(t, VEGETABLE_KEYWORDS),
    hasFruit: includesAny(t, FRUIT_KEYWORDS),
  };
}
