"use client";

import { useState } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import {
  periodStats,
  sevenDayAverage,
  sortByDateAsc,
  startDateForPeriod,
} from "@/lib/calculations";
import { todayDateString } from "@/lib/validation";
import { formatSignedNumber } from "@/lib/format";
import { GRAPH_PERIODS } from "@/lib/constants";
import type { GraphPeriod } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { WeightTrendChart } from "@/components/WeightTrendChart";
import { BodyFatTrendChart } from "@/components/BodyFatTrendChart";

export default function GraphPage() {
  const records = useLiveQuery(() => db.dailyRecords.toArray(), []);
  const [period, setPeriod] = useState<GraphPeriod>("30");

  if (records === undefined) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 items-center justify-center p-5">
        <p className="text-zinc-500">読み込み中...</p>
      </main>
    );
  }

  if (records.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 p-5">
        <p className="text-zinc-600 dark:text-zinc-300">
          まだ記録がありません。記録を保存するとグラフが表示されます。
        </p>
        <Link href="/" className="text-emerald-700 underline dark:text-emerald-400">
          ホームへ戻る
        </Link>
      </main>
    );
  }

  const today = todayDateString();
  const startDate = startDateForPeriod(today, period);
  const sortedAsc = sortByDateAsc(records);
  const inRange = sortedAsc.filter((r) => {
    if (startDate !== null && r.recordDate < startDate) return false;
    return r.recordDate <= today;
  });

  const weightData = inRange.map((r) => ({
    date: r.recordDate,
    weight: r.weightKg,
    average: sevenDayAverage(records, r.recordDate, "weightKg").average,
  }));

  const bodyFatData = inRange
    .filter((r) => r.bodyFatPercent !== undefined)
    .map((r) => ({ date: r.recordDate, bodyFat: r.bodyFatPercent as number }));

  const weightStats = periodStats(records, "weightKg", startDate, today);
  const bodyFatStats = periodStats(records, "bodyFatPercent", startDate, today);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 p-5 pb-10">
      <header>
        <Link href="/" className="text-sm text-zinc-500 underline dark:text-zinc-400">
          ホームへ戻る
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          グラフ
        </h1>
      </header>

      <div className="flex flex-wrap gap-2">
        {GRAPH_PERIODS.map((p) => {
          const selected = p.value === period;
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => setPeriod(p.value)}
              aria-pressed={selected}
              className={`min-h-[40px] rounded-full border-2 px-3 py-1 text-sm font-medium transition-colors ${
                selected
                  ? "border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
                  : "border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <Card>
        <h2 className="mb-2 text-base font-medium text-zinc-700 dark:text-zinc-300">
          体重推移・7日移動平均
        </h2>
        {weightData.length > 0 ? (
          <WeightTrendChart data={weightData} />
        ) : (
          <p className="py-8 text-center text-sm text-zinc-500">
            この期間の記録がありません。
          </p>
        )}
        <StatsRow stats={weightStats} unit="kg" />
      </Card>

      <Card>
        <h2 className="mb-2 text-base font-medium text-zinc-700 dark:text-zinc-300">
          体脂肪率推移
        </h2>
        {bodyFatData.length > 0 ? (
          <BodyFatTrendChart data={bodyFatData} />
        ) : (
          <p className="py-8 text-center text-sm text-zinc-500">
            この期間の体脂肪率記録がありません。
          </p>
        )}
        {bodyFatData.length > 0 && <StatsRow stats={bodyFatStats} unit="%" />}
      </Card>
    </main>
  );
}

function StatsRow({
  stats,
  unit,
}: {
  stats: {
    max: number | null;
    min: number | null;
    average: number | null;
    change: number | null;
    recordCount: number;
  };
  unit: string;
}) {
  return (
    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
      <StatItem label="最高値" value={stats.max !== null ? `${stats.max}${unit}` : "-"} />
      <StatItem label="最低値" value={stats.min !== null ? `${stats.min}${unit}` : "-"} />
      <StatItem label="平均値" value={stats.average !== null ? `${stats.average}${unit}` : "-"} />
      <StatItem
        label="期間中の増減"
        value={stats.change !== null ? `${formatSignedNumber(stats.change)}${unit}` : "-"}
      />
      <StatItem label="記録日数" value={`${stats.recordCount}日`} />
    </dl>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-zinc-500">{label}</dt>
      <dd className="mt-0.5 text-base font-semibold text-zinc-900 dark:text-zinc-50">
        {value}
      </dd>
    </div>
  );
}
