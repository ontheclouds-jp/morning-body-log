"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import {
  deleteAllData,
  parseBackupJson,
  recordsToBackupJson,
  restoreRecords,
} from "@/lib/backup";
import { recordsToCsv } from "@/lib/csv";
import { downloadTextFile } from "@/lib/download";
import { updateSettings } from "@/lib/settings";
import type { DailyRecord } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { todayDateString } from "@/lib/validation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

const DELETE_CONFIRM_PHRASE = "削除します";

export default function DataManagementPage() {
  const router = useRouter();
  const records = useLiveQuery(() => db.dailyRecords.toArray(), []);
  const settings = useLiveQuery(() => db.appSettings.get(1), []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingRestore, setPendingRestore] = useState<DailyRecord[] | null>(
    null,
  );
  const [deleteText, setDeleteText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function handleCsvExport() {
    if (!records || records.length === 0) {
      setError("書き出す記録がありません。");
      return;
    }
    const csv = recordsToCsv(records);
    downloadTextFile(
      `morning-body-log_${todayDateString()}.csv`,
      csv,
      "text/csv;charset=utf-8",
    );
    setMessage("CSVファイルを書き出しました。");
    setError(null);
  }

  async function handleJsonBackup() {
    if (!records || records.length === 0) {
      setError("バックアップする記録がありません。");
      return;
    }
    const json = recordsToBackupJson(records);
    downloadTextFile(
      `morning-body-log_backup_${todayDateString()}.json`,
      json,
      "application/json;charset=utf-8",
    );
    await updateSettings({ lastBackupAt: new Date().toISOString() });
    setMessage("JSONバックアップを作成しました。");
    setError(null);
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const text = await file.text();
    const result = parseBackupJson(text);
    if (!result.ok) {
      setError(result.error);
      setMessage(null);
      return;
    }
    if (result.records.length === 0) {
      setError("バックアップファイルに記録が含まれていません。");
      return;
    }
    setError(null);
    setPendingRestore(result.records);
  }

  async function confirmRestore() {
    if (!pendingRestore) return;
    const { imported } = await restoreRecords(pendingRestore);
    setPendingRestore(null);
    setMessage(`${imported}件の記録を復元しました。`);
  }

  async function handleDeleteAll() {
    await deleteAllData();
    setShowDeleteConfirm(false);
    setDeleteText("");
    router.push("/");
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 p-5 pb-10">
      <header>
        <Link href="/" className="text-sm text-zinc-500 underline dark:text-zinc-400">
          ホームへ戻る
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          データ管理
        </h1>
      </header>

      {message && (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-100">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-100">
          {error}
        </p>
      )}

      <Card>
        <p className="text-sm text-zinc-500">最終バックアップ日時</p>
        <p className="mt-1 text-base text-zinc-800 dark:text-zinc-100">
          {settings?.lastBackupAt
            ? formatDateTime(settings.lastBackupAt)
            : "まだバックアップしていません"}
        </p>
      </Card>

      <Card className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-medium text-zinc-800 dark:text-zinc-100">
            CSV書き出し
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            表計算ソフトで開ける形式ですべての記録を書き出します。
          </p>
        </div>
        <Button variant="secondary" onClick={handleCsvExport}>
          CSVを書き出す
        </Button>
      </Card>

      <Card className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-medium text-zinc-800 dark:text-zinc-100">
            JSONバックアップ
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            復元に使えるバックアップファイルを作成します。
          </p>
        </div>
        <Button variant="secondary" onClick={handleJsonBackup}>
          バックアップを作成する
        </Button>
      </Card>

      <Card className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-medium text-zinc-800 dark:text-zinc-100">
            JSONから復元
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            バックアップファイルを読み込みます。同じ日付の記録は上書きされます。
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={handleFileSelected}
        />
        <Button
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
        >
          ファイルを選択して復元する
        </Button>
      </Card>

      <Card className="flex flex-col gap-3 border-red-200 dark:border-red-900">
        <div>
          <h2 className="text-base font-medium text-red-700 dark:text-red-300">
            全データ削除
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            すべての記録を削除します。元に戻せません。削除するには「{DELETE_CONFIRM_PHRASE}」と入力してください。
          </p>
        </div>
        <input
          type="text"
          value={deleteText}
          onChange={(e) => setDeleteText(e.target.value)}
          placeholder={DELETE_CONFIRM_PHRASE}
          className="rounded-xl border border-zinc-300 px-4 py-3 text-base focus:border-red-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
        />
        <Button
          variant="danger"
          disabled={deleteText !== DELETE_CONFIRM_PHRASE}
          onClick={() => setShowDeleteConfirm(true)}
        >
          すべての記録を削除する
        </Button>
      </Card>

      {pendingRestore && (
        <ConfirmDialog
          title="復元の確認"
          message={`${pendingRestore.length}件の記録を読み込みます。同じ日付の記録は上書きされます。よろしいですか？`}
          confirmLabel="復元する"
          onConfirm={confirmRestore}
          onCancel={() => setPendingRestore(null)}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmDialog
          title="削除の確認"
          message="すべての記録を削除します。元に戻せません。本当によろしいですか？"
          confirmLabel="削除する"
          danger
          onConfirm={handleDeleteAll}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </main>
  );
}
