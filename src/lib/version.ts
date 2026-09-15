// アプリのバージョン情報。機能追加や仕様変更を行うたびに、
// このバージョン番号・最終更新日・更新履歴を新しい値に更新する。
export const APP_VERSION = "v1.3";
export const APP_LAST_UPDATED = "2026年9月15日";

export interface ChangelogEntry {
  version: string;
  date: string;
  notes: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "v1.3",
    date: "2026年9月15日",
    notes: ["記録一覧の日付指定で記録がない場合に入力ボタンを追加"],
  },
  {
    version: "v1.2",
    date: "2026年9月15日",
    notes: ["過去の記録がない日の詳細画面に「この日の記録を入力する」ボタンを追加"],
  },
  {
    version: "v1.1",
    date: "2026年9月3日",
    notes: [
      "頭痛の記録機能を追加（有無・強さ・メモ）",
      "ヘルプ・バージョン情報画面を新規追加",
    ],
  },
  {
    version: "v1.0",
    date: "2026年8月2日",
    notes: ["初期版（MVP）を公開"],
  },
];
