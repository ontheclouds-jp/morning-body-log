"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { deleteRecord, getAdjacentDate } from "@/lib/records";
import { diffFromPrevious, sevenDayAverage } from "@/lib/calculations";
import { todayDateString } from "@/lib/validation";
import {
  formatJapaneseDate,
  formatSignedNumber,
  headacheBadgeClasses,
  headacheSeverityLabel,
} from "@/lib/format";
import { FATIGUE_LEVELS, PAIN_LEVELS } from "@/lib/constants";
import { WARNING_MESSAGE } from "@/lib/comments";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function RecordDetailPage() {
  const params = useParams<{ date: string }>();
  const date = params.date;
  const router = useRouter();
  const records = useLiveQuery(() => db.dailyRecords.toArray(), []);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [adjacent, setAdjacent] = useState<{
    prev: string | null;
    next: string | null;
  }>({ prev: null, next: null });

  useEffect(() => {
    let cancelled = false;
    async function loadAdjacent() {
      const [prev, next] = await Promise.all([
        getAdjacentDate(date, "prev"),
        getAdjacentDate(date, "next"),
      ]);
      if (!cancelled) setAdjacent({ prev, next });
    }
    loadAdjacent();
    return () => {
      cancelled = true;
    };
  }, [date, records]);

  if (records === undefined) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 items-center justify-center p-5">
        <p className="text-zinc-500">読み込み中...</p>
      </main>
    );
  }

  const record = records.find((r) => r.recordDate === date);

  if (!record) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 p-5">
        <p className="text-zinc-600 dark:text-zinc-300">
          この日の記録はありません。
        </p>
        <Link href="/history" className="text-emerald-700 underline dark:text-emerald-400">
          一覧へ戻る
        </Link>
      </main>
    );
  }

  const weightDiff = diffFromPrevious(records, date, "weightKg");
  const bodyFatDiff = diffFromPrevious(records, date, "bodyFatPercent");
  const weightAvg = sevenDayAverage(records, date, "weightKg");
  const isToday = date === todayDateString();
  const fatigueLabel = FATIGUE_LEVELS.find(
    (f) => f.value === record.fatigueLevel,
  )?.label;
  const painLabel = PAIN_LEVELS.find(
    (p) => p.value === record.painLevel,
  )?.label;

  async function handleDelete() {
    await deleteRecord(date);
    router.push("/history");
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 p-5 pb-10">
      <header className="flex items-center justify-between">
        <Link
          href="/history"
          className="text-sm text-zinc-500 underline dark:text-zinc-400"
        >
          一覧へ戻る
        </Link>
        {isToday && (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">
            今日の記録
          </span>
        )}
      </header>

      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        {formatJapaneseDate(date)}
      </h1>

      <Card>
        <div className="flex flex-wrap items-end gap-2">
          <span className="text-[28px] font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
            {record.weightKg.toFixed(1)}
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
        {weightAvg.average !== null && (
          <p className="mt-1 text-sm text-zinc-500">
            7日間平均 {weightAvg.average}kg
            {weightAvg.isPartial ? "（記録数が少ないため参考値）" : ""}
          </p>
        )}
        {record.bodyFatPercent !== undefined && (
          <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
            <span className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              {record.bodyFatPercent}%
            </span>
            <span className="text-sm text-zinc-500">体脂肪率</span>
            {bodyFatDiff !== null && (
              <span
                className={`ml-2 text-sm ${
                  bodyFatDiff > 0
                    ? "text-orange-600"
                    : bodyFatDiff < 0
                      ? "text-emerald-600"
                      : "text-zinc-500"
                }`}
              >
                前回比 {formatSignedNumber(bodyFatDiff)}%
              </span>
            )}
          </div>
        )}
      </Card>

      {record.generatedComment && (
        <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950">
          <p className="text-base leading-relaxed text-emerald-900 dark:text-emerald-100">
            {record.generatedComment}
          </p>
        </Card>
      )}

      {record.warningFlags && record.warningFlags.length > 0 && (
        <Card className="border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <p className="text-base leading-relaxed text-orange-900 dark:text-orange-100">
            {WARNING_MESSAGE}
          </p>
        </Card>
      )}

      <Card className="flex flex-col gap-4">
        <DetailRow label="朝食" value={record.breakfastText} />
        <DetailRow label="便通" value={record.bowelCondition} />
        <DetailRow label="疲労感" value={fatigueLabel} />
        <DetailRow
          label="痛み"
          value={painLabel}
          extra={record.painLocations?.join("、")}
          note={record.painNote}
        />
        <div>
          <p className="text-sm text-zinc-500">頭痛</p>
          {record.headacheFlag ? (
            <>
              <span
                className={`mt-1 inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-sm font-medium ${headacheBadgeClasses(record.headacheSeverity)}`}
              >
                <span aria-hidden>🤕</span>
                {headacheSeverityLabel(record.headacheSeverity) || "あり"}
              </span>
              {record.headacheNote && (
                <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">
                  {record.headacheNote}
                </p>
              )}
            </>
          ) : (
            <p className="mt-1 text-base text-zinc-800 dark:text-zinc-100">
              なし
            </p>
          )}
        </div>
        <DetailRow label="体調メモ" value={record.healthNote} />
        <DetailRow label="今日の予定" value={record.scheduleNote} />
      </Card>

      <nav className="flex justify-between text-sm font-medium text-emerald-700 dark:text-emerald-400">
        {adjacent.prev ? (
          <Link href={`/history/${adjacent.prev}`}>← 前の日</Link>
        ) : (
          <span />
        )}
        {adjacent.next ? (
          <Link href={`/history/${adjacent.next}`}>次の日 →</Link>
        ) : (
          <span />
        )}
      </nav>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/graph">
          <Button variant="secondary" className="w-full">
            グラフを見る
          </Button>
        </Link>
        <Link href={`/record?date=${date}`}>
          <Button variant="secondary" className="w-full">
            記録を修正する
          </Button>
        </Link>
      </div>
      <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
        削除する
      </Button>

      {showDeleteConfirm && (
        <ConfirmDialog
          title="削除の確認"
          message="この記録を削除します。元に戻せない場合があります。"
          confirmLabel="削除する"
          danger
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </main>
  );
}

function DetailRow({
  label,
  value,
  extra,
  note,
}: {
  label: string;
  value?: string;
  extra?: string;
  note?: string;
}) {
  return (
    <div>
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-base text-zinc-800 dark:text-zinc-100">
        {value || "未入力"}
      </p>
      {extra && <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{extra}</p>}
      {note && <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{note}</p>}
    </div>
  );
}
