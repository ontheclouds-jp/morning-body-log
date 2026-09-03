import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { APP_LAST_UPDATED, APP_VERSION, CHANGELOG } from "@/lib/version";

interface GuideStep {
  title: string;
  body: string;
}

const GUIDE_STEPS: GuideStep[] = [
  {
    title: "1. 体重を記録する",
    body: "毎朝の入力画面で体重(kg)を入力してください。体重のみ必須項目で、他の項目は未入力のまま保存できます。",
  },
  {
    title: "2. 体脂肪率を記録する",
    body: "体脂肪率(%)は任意項目です。測定していない日はそのまま「次へ」を押してスキップできます。",
  },
  {
    title: "3. 頭痛を記録する",
    body: "頭痛があった場合はチェックボックスをONにしてください。強さ（なし・軽い・普通・強い・非常に強い）を選び、場所や服薬の有無などをメモに自由に書き添えられます。",
  },
  {
    title: "4. 自動一時保存について",
    body: "「あとで入力」を選んだり、途中で画面を閉じてしまっても、体重・体脂肪率・頭痛などの入力内容は自動的に一時保存されます。次回同じ日の記録を開くと、続きから入力できます。",
  },
  {
    title: "5. 記録の確認・修正",
    body: "「記録一覧」から過去の記録を確認できます。日付を選ぶと詳細画面が開き、内容の修正や削除ができます。",
  },
];

export default function HelpPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 p-5 pb-10">
      <header>
        <Link
          href="/"
          className="text-sm text-zinc-500 underline dark:text-zinc-400"
        >
          ホームへ戻る
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          ヘルプ・バージョン情報
        </h1>
      </header>

      <Card>
        <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          使い方
        </h2>
        <div className="flex flex-col gap-4">
          {GUIDE_STEPS.map((step) => (
            <div key={step.title}>
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">
                {step.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          バージョン情報
        </h2>
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-zinc-500">アプリ名</dt>
            <dd className="text-zinc-800 dark:text-zinc-100">朝のからだ記録</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-zinc-500">バージョン</dt>
            <dd className="text-zinc-800 dark:text-zinc-100">{APP_VERSION}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-zinc-500">最終更新日</dt>
            <dd className="text-zinc-800 dark:text-zinc-100">
              {APP_LAST_UPDATED}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-zinc-500">開発</dt>
            <dd className="text-zinc-800 dark:text-zinc-100">
              Claude Codeで作成
            </dd>
          </div>
        </dl>

        <h3 className="mt-5 mb-2 text-base font-semibold text-zinc-800 dark:text-zinc-100">
          更新履歴
        </h3>
        <ul className="flex flex-col gap-3">
          {CHANGELOG.map((entry) => (
            <li key={entry.version}>
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                {entry.version}（{entry.date}）
              </p>
              <ul className="ml-4 mt-1 flex flex-col gap-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                {entry.notes.map((note) => (
                  <li key={note} className="list-disc">
                    {note}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Card>
    </main>
  );
}
