"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import {
  getPreviousRecord,
  sevenDayAverage,
  sortByDateAsc,
  streakDays,
} from "@/lib/calculations";
import { todayDateString } from "@/lib/validation";
import { formatJapaneseDate, formatSignedNumber } from "@/lib/format";
import { WARNING_MESSAGE } from "@/lib/comments";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MiniWeightChart } from "@/components/MiniWeightChart";

export default function HomePage() {
  const records = useLiveQuery(() => db.dailyRecords.toArray(), []);
  const today = todayDateString();

  if (records === undefined) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 items-center justify-center p-5">
        <p className="text-zinc-500">読み込み中...</p>
      </main>
    );
  }

  const todayRecord = records.find((r) => r.recordDate === today);
  const sorted = sortByDateAsc(records);
  const latest = sorted[sorted.length - 1] ?? null;
  const previous = latest ? getPreviousRecord(records, latest.recordDate) : null;
  const weightDiff =
    latest && previous
      ? Math.round((latest.weightKg - previous.weightKg) * 10) / 10
      : null;
  const avg = latest
    ? sevenDayAverage(records, latest.recordDate, "weightKg")
    : null;
  const streak = streakDays(records, today);
  const recent7 = sorted.slice(-7);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-5 pb-10">
      <header>
        <p className="text-sm text-zinc-500">{formatJapaneseDate(today)}</p>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          朝のからだ記録
        </h1>
      </header>

      <Card>
        <p className="text-lg leading-relaxed text-zinc-800 dark:text-zinc-100">
          {todayRecord
            ? "今日の記録は完了しています。よく続けています。"
            : "おはようございます。今朝の記録を始めましょう"}
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {todayRecord ? (
            <>
              <Link href={`/history/${today}`}>
                <Button className="w-full">今日の記録を見る</Button>
              </Link>
              <Link href={`/record?date=${today}`}>
                <Button variant="secondary" className="w-full">
                  修正する
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/record">
              <Button className="w-full">今朝の記録を始める</Button>
            </Link>
          )}
        </div>
      </Card>

      {todayRecord?.generatedComment && (
        <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950">
          <p className="text-base leading-relaxed text-emerald-900 dark:text-emerald-100">
            {todayRecord.generatedComment}
          </p>
        </Card>
      )}

      {todayRecord?.warningFlags && todayRecord.warningFlags.length > 0 && (
        <Card className="border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <p className="text-base leading-relaxed text-orange-900 dark:text-orange-100">
            {WARNING_MESSAGE}
          </p>
        </Card>
      )}

      {latest && (
        <Card>
          <h2 className="text-base font-medium text-zinc-500">
            最新の記録（{formatJapaneseDate(latest.recordDate)}）
          </h2>
          <div className="mt-2 flex flex-wrap items-end gap-2">
            <span className="text-[28px] font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
              {latest.weightKg.toFixed(1)}
            </span>
            <span className="text-lg text-zinc-500">kg</span>
            {weightDiff !== null && (
              <span
                className={`ml-2 text-base ${
                  weightDiff > 0
                    ? "text-orange-600"
                    : weightDiff < 0
                      ? "text-emerald-600"
                      : "text-zinc-500"
                }`}
              >
                前回比 {formatSignedNumber(weightDiff)}kg
              </span>
            )}
          </div>
          {avg && avg.average !== null && (
            <p className="mt-1 text-sm text-zinc-500">
              7日間平均 {avg.average}kg
              {avg.isPartial ? "（記録数が少ないため参考値）" : ""}
            </p>
          )}
          {recent7.length >= 2 && (
            <div className="mt-4 h-20">
              <MiniWeightChart records={recent7} />
            </div>
          )}
        </Card>
      )}

      <Card>
        <p className="text-base text-zinc-700 dark:text-zinc-300">
          連続記録日数
        </p>
        <p className="mt-1 text-[28px] font-bold text-emerald-700 dark:text-emerald-400">
          {streak}日
        </p>
      </Card>

      {latest?.healthNote && (
        <Card>
          <p className="text-sm text-zinc-500">最近の体調メモ</p>
          <p className="mt-1 text-base text-zinc-800 dark:text-zinc-100">
            {latest.healthNote}
          </p>
        </Card>
      )}

      <nav className="mt-2 grid grid-cols-2 gap-3">
        <Link href="/history">
          <Button variant="secondary" className="w-full">
            記録一覧
          </Button>
        </Link>
        <Link href="/graph">
          <Button variant="secondary" className="w-full">
            グラフ
          </Button>
        </Link>
        <Link href="/data">
          <Button variant="secondary" className="w-full">
            データ管理
          </Button>
        </Link>
        <Link href="/help">
          <Button variant="secondary" className="w-full">
            ヘルプ
          </Button>
        </Link>
      </nav>
    </main>
  );
}
