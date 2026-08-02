"use client";

import { useState } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { diffFromPrevious, sortByDateAsc } from "@/lib/calculations";
import { formatShortDate, formatSignedNumber } from "@/lib/format";
import { FATIGUE_LEVELS } from "@/lib/constants";
import type { DailyRecord } from "@/lib/types";
import { Card } from "@/components/ui/Card";

type FilterMode =
  | { type: "all" }
  | { type: "constipation" }
  | { type: "highFatigue" }
  | { type: "pain" }
  | { type: "date"; value: string }
  | { type: "month"; value: string };

const QUICK_FILTERS: { type: FilterMode["type"]; label: string }[] = [
  { type: "all", label: "すべて" },
  { type: "constipation", label: "便秘気味の日" },
  { type: "highFatigue", label: "疲労が強かった日" },
  { type: "pain", label: "痛みがあった日" },
];

function matchesFilter(record: DailyRecord, filter: FilterMode): boolean {
  switch (filter.type) {
    case "all":
      return true;
    case "constipation":
      return record.bowelCondition === "便秘気味";
    case "highFatigue":
      return (
        record.fatigueLevel !== undefined && record.fatigueLevel >= 4
      );
    case "pain":
      return record.painLevel !== undefined && record.painLevel > 0;
    case "date":
      return record.recordDate === filter.value;
    case "month":
      return record.recordDate.startsWith(filter.value);
  }
}

export default function HistoryListPage() {
  const records = useLiveQuery(() => db.dailyRecords.toArray(), []);
  const [filter, setFilter] = useState<FilterMode>({ type: "all" });

  if (records === undefined) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 items-center justify-center p-5">
        <p className="text-zinc-500">読み込み中...</p>
      </main>
    );
  }

  const sortedAsc = sortByDateAsc(records);
  const sortedDesc = [...sortedAsc].reverse();
  const filtered = sortedDesc.filter((r) => matchesFilter(r, filter));

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 p-5 pb-10">
      <header>
        <Link href="/" className="text-sm text-zinc-500 underline dark:text-zinc-400">
          ホームへ戻る
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          記録一覧
        </h1>
      </header>

      <div className="flex flex-wrap gap-2">
        {QUICK_FILTERS.map((qf) => {
          const selected = filter.type === qf.type;
          return (
            <button
              key={qf.type}
              type="button"
              onClick={() => setFilter({ type: qf.type } as FilterMode)}
              aria-pressed={selected}
              className={`min-h-[40px] rounded-full border-2 px-3 py-1 text-sm font-medium transition-colors ${
                selected
                  ? "border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
                  : "border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              }`}
            >
              {qf.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
          日付指定
          <input
            type="date"
            value={filter.type === "date" ? filter.value : ""}
            onChange={(e) =>
              setFilter(
                e.target.value
                  ? { type: "date", value: e.target.value }
                  : { type: "all" },
              )
            }
            className="rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
          月単位
          <input
            type="month"
            value={filter.type === "month" ? filter.value : ""}
            onChange={(e) =>
              setFilter(
                e.target.value
                  ? { type: "month", value: e.target.value }
                  : { type: "all" },
              )
            }
            className="rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="text-zinc-500">該当する記録がありません。</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((record) => {
            const diff = diffFromPrevious(records, record.recordDate, "weightKg");
            const fatigueLabel = FATIGUE_LEVELS.find(
              (f) => f.value === record.fatigueLevel,
            )?.label;
            return (
              <li key={record.id}>
                <Link href={`/history/${record.recordDate}`}>
                  <Card className="hover:border-emerald-400">
                    <div className="flex items-baseline justify-between">
                      <span className="text-base font-medium text-zinc-900 dark:text-zinc-50">
                        {formatShortDate(record.recordDate)}
                      </span>
                      <span className="text-xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                        {record.weightKg.toFixed(1)}kg
                        {diff !== null && (
                          <span
                            className={`ml-2 text-sm font-normal ${
                              diff > 0
                                ? "text-orange-600"
                                : diff < 0
                                  ? "text-emerald-600"
                                  : "text-zinc-500"
                            }`}
                          >
                            {formatSignedNumber(diff)}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-zinc-500">
                      {record.bodyFatPercent !== undefined && (
                        <span>体脂肪 {record.bodyFatPercent}%</span>
                      )}
                      {record.bowelCondition && (
                        <span>便通 {record.bowelCondition}</span>
                      )}
                      {fatigueLabel && <span>疲労 {fatigueLabel}</span>}
                      {record.healthNote && <span>メモあり</span>}
                    </div>
                    {record.breakfastText && (
                      <p className="mt-1 truncate text-sm text-zinc-600 dark:text-zinc-400">
                        {record.breakfastText}
                      </p>
                    )}
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
