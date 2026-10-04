"use client";

import { useSyncExternalStore } from "react";
import { getLastAutoBackupAt } from "@/lib/autoBackup";
import { formatDateTime } from "@/lib/format";

// localStorageの値は表示時に読むだけでよいため、変更の購読は行わない
function subscribe(): () => void {
  return () => {};
}

/** クラウド自動バックアップの最終日時と、サイトデータ消失時の復元方法を表示する（spec 12.4） */
export function AutoBackupInfo() {
  const lastAutoBackupAt = useSyncExternalStore(
    subscribe,
    getLastAutoBackupAt,
    () => null,
  );

  return (
    <div className="flex flex-col gap-3 text-sm leading-relaxed">
      <p className="text-zinc-600 dark:text-zinc-400">
        記録を保存・修正・削除するたびに、すべての記録が自動でクラウドへバックアップされます。記録が0件のときはバックアップしません。
      </p>
      <div className="flex items-center justify-between">
        <span className="text-zinc-500">最終自動バックアップ</span>
        <span className="text-zinc-800 dark:text-zinc-100">
          {lastAutoBackupAt ? formatDateTime(lastAutoBackupAt) : "未実施"}
        </span>
      </div>
      <div className="rounded-xl bg-sky-50 px-4 py-3 text-sky-900 dark:bg-sky-950 dark:text-sky-100">
        <p className="font-medium">サイトデータが消えてしまった場合</p>
        <ol className="ml-4 mt-1 flex list-decimal flex-col gap-0.5">
          <li>
            Vercelダッシュボードの「Storage」→ Blob を開きます。
          </li>
          <li>
            <code className="break-all">auto-backups/history</code>{" "}
            フォルダから、前日以前の日付のファイル（例：2026-10-03.json）をダウンロードします。
          </li>
          <li>
            このアプリの「データ管理」→「JSONから復元」で、そのファイルを読み込みます。
          </li>
        </ol>
        <p className="mt-2 text-xs">
          ※ 消えた後に記録を保存すると、最新ファイルと当日のファイルは少ない件数で上書きされます。前日以前のファイルを使ってください。
        </p>
      </div>
    </div>
  );
}
