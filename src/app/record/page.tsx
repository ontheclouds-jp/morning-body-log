"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import {
  getDraft,
  getRecordByDate,
  saveDraft,
  saveRecord,
} from "@/lib/records";
import { getPreviousRecord } from "@/lib/calculations";
import {
  isBodyFatChangeLarge,
  isBodyFatPlausible,
  isWeightChangeLarge,
  isWeightPlausible,
  roundToOneDecimal,
  todayDateString,
} from "@/lib/validation";
import {
  BOWEL_CONDITIONS,
  FATIGUE_LEVELS,
  PAIN_LEVELS,
  PAIN_LOCATIONS,
  TEXT_LIMITS,
} from "@/lib/constants";
import type {
  BowelCondition,
  DailyRecordInput,
  FatigueLevel,
  PainLevel,
  PainLocation,
} from "@/lib/types";
import { formatJapaneseDate } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { NumberField } from "@/components/ui/NumberField";
import { SelectCards } from "@/components/ui/SelectCards";
import { MultiSelectChips } from "@/components/ui/MultiSelectChips";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { BottomActionBar } from "@/components/ui/BottomActionBar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Card } from "@/components/ui/Card";

const STEP_COUNT = 8;

interface FormState {
  weightKg: string;
  bodyFatPercent: string;
  breakfastText: string;
  bowelCondition?: BowelCondition;
  fatigueLevel?: FatigueLevel;
  painLevel?: PainLevel;
  painLocations: PainLocation[];
  painNote: string;
  healthNote: string;
  scheduleNote: string;
}

const emptyForm: FormState = {
  weightKg: "",
  bodyFatPercent: "",
  breakfastText: "",
  bowelCondition: undefined,
  fatigueLevel: undefined,
  painLevel: undefined,
  painLocations: [],
  painNote: "",
  healthNote: "",
  scheduleNote: "",
};

function buildInput(
  date: string,
  form: FormState,
): DailyRecordInput | null {
  const weightKg = Number.parseFloat(form.weightKg);
  if (!Number.isFinite(weightKg) || weightKg <= 0) return null;

  const bodyFatPercent = form.bodyFatPercent.trim()
    ? roundToOneDecimal(Number.parseFloat(form.bodyFatPercent))
    : undefined;

  return {
    recordDate: date,
    weightKg: roundToOneDecimal(weightKg),
    bodyFatPercent,
    breakfastText: form.breakfastText.trim() || undefined,
    bowelCondition: form.bowelCondition,
    fatigueLevel: form.fatigueLevel,
    painLevel: form.painLevel,
    painLocations: form.painLocations.length ? form.painLocations : undefined,
    painNote: form.painNote.trim() || undefined,
    healthNote: form.healthNote.trim() || undefined,
    scheduleNote: form.scheduleNote.trim() || undefined,
  };
}

export default function RecordWizardPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex w-full max-w-md flex-1 items-center justify-center p-5">
          <p className="text-zinc-500">読み込み中...</p>
        </main>
      }
    >
      <RecordWizard />
    </Suspense>
  );
}

function RecordWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");
  const isEditMode = dateParam !== null;
  const date = dateParam ?? todayDateString();

  const records = useLiveQuery(() => db.dailyRecords.toArray(), []);

  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const existing = await getRecordByDate(date);
      if (existing) {
        if (cancelled) return;
        setForm({
          weightKg: String(existing.weightKg),
          bodyFatPercent:
            existing.bodyFatPercent !== undefined
              ? String(existing.bodyFatPercent)
              : "",
          breakfastText: existing.breakfastText ?? "",
          bowelCondition: existing.bowelCondition,
          fatigueLevel: existing.fatigueLevel,
          painLevel: existing.painLevel,
          painLocations: existing.painLocations ?? [],
          painNote: existing.painNote ?? "",
          healthNote: existing.healthNote ?? "",
          scheduleNote: existing.scheduleNote ?? "",
        });
        setStep(1);
        setReady(true);
        return;
      }

      const draft = await getDraft(date);
      if (draft && !cancelled) {
        setForm({ ...emptyForm, ...draft.draftData } as FormState);
        setStep(draft.currentStep);
      }
      if (!cancelled) setReady(true);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [date]);

  if (!ready || records === undefined) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 items-center justify-center p-5">
        <p className="text-zinc-500">読み込み中...</p>
      </main>
    );
  }

  const previousRecord = getPreviousRecord(records, date);

  function updateForm(patch: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  async function persistDraft(nextStep: number, nextForm: FormState) {
    await saveDraft(date, nextStep, { ...nextForm });
  }

  async function goNext() {
    const nextStep = Math.min(step + 1, STEP_COUNT + 1);
    setStep(nextStep);
    await persistDraft(nextStep, form);
  }

  function goBack() {
    setStep((s) => Math.max(1, s - 1));
  }

  async function saveForLater() {
    await persistDraft(step, form);
    router.push("/");
  }

  function discardAndBack() {
    router.push("/");
  }

  async function handleSave(force = false) {
    if (!force && !isEditMode) {
      const existing = await getRecordByDate(date);
      if (existing) {
        setShowOverwriteConfirm(true);
        return;
      }
    }

    const input = buildInput(date, form);
    if (!input) {
      setStep(1);
      return;
    }

    await saveRecord(input);
    router.push(`/history/${date}`);
  }

  const canProceedFromStep1 = Number.parseFloat(form.weightKg) > 0;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col p-5">
      <header className="mb-4">
        <p className="text-sm text-zinc-500">{formatJapaneseDate(date)}</p>
        {step <= STEP_COUNT && (
          <p className="mt-1 text-sm font-medium text-emerald-700 dark:text-emerald-400">
            質問 {step} / {STEP_COUNT}
          </p>
        )}
      </header>

      <div className="flex-1">
        {step === 1 && (
          <StepShell question="今朝の体重を入力してください">
            <NumberField
              value={form.weightKg}
              onChange={(v) => updateForm({ weightKg: v })}
              unit="kg"
              placeholder={
                previousRecord ? String(previousRecord.weightKg) : undefined
              }
              autoFocus
            />
            {previousRecord && (
              <p className="mt-2 text-sm text-zinc-500">
                前回：{previousRecord.weightKg}kg
              </p>
            )}
            {(() => {
              const value = Number.parseFloat(form.weightKg);
              if (!Number.isFinite(value) || value <= 0) return null;
              const warnings: string[] = [];
              if (!isWeightPlausible(value)) {
                warnings.push(
                  "入力された体重が一般的な範囲外です。入力内容をご確認ください。",
                );
              }
              if (
                isWeightChangeLarge(
                  value,
                  previousRecord ? previousRecord.weightKg : null,
                )
              ) {
                warnings.push(
                  "前回より大きく変化しています。入力内容に間違いがないか確認してください。",
                );
              }
              return warnings.map((w) => (
                <p key={w} className="mt-2 text-sm text-orange-600">
                  {w}
                </p>
              ));
            })()}
          </StepShell>
        )}

        {step === 2 && (
          <StepShell question="体脂肪率を入力してください（未測定ならスキップできます）">
            <NumberField
              value={form.bodyFatPercent}
              onChange={(v) => updateForm({ bodyFatPercent: v })}
              unit="%"
              placeholder={
                previousRecord?.bodyFatPercent !== undefined
                  ? String(previousRecord.bodyFatPercent)
                  : undefined
              }
              autoFocus
            />
            {(() => {
              const value = Number.parseFloat(form.bodyFatPercent);
              if (!Number.isFinite(value)) return null;
              const warnings: string[] = [];
              if (!isBodyFatPlausible(value)) {
                warnings.push(
                  "入力された体脂肪率が一般的な範囲外です。入力内容をご確認ください。",
                );
              }
              if (
                isBodyFatChangeLarge(
                  value,
                  previousRecord?.bodyFatPercent ?? null,
                )
              ) {
                warnings.push(
                  "前回より大きく変化しています。入力内容に間違いがないか確認してください。",
                );
              }
              return warnings.map((w) => (
                <p key={w} className="mt-2 text-sm text-orange-600">
                  {w}
                </p>
              ));
            })()}
          </StepShell>
        )}

        {step === 3 && (
          <StepShell question="朝食に食べたものを入力してください">
            <TextAreaField
              value={form.breakfastText}
              onChange={(v) => updateForm({ breakfastText: v })}
              maxLength={TEXT_LIMITS.breakfastText}
              placeholder="例：ご飯、味噌汁、目玉焼き、梅干し、ヨーグルト"
              rows={5}
              autoFocus
            />
            {previousRecord?.breakfastText && (
              <button
                type="button"
                onClick={() =>
                  updateForm({ breakfastText: previousRecord.breakfastText ?? "" })
                }
                className="mt-3 text-sm font-medium text-emerald-700 underline dark:text-emerald-400"
              >
                前回の朝食をコピーする
              </button>
            )}
          </StepShell>
        )}

        {step === 4 && (
          <StepShell question="今朝の便通はいかがですか">
            <SelectCards
              options={BOWEL_CONDITIONS.map((v) => ({ value: v, label: v }))}
              value={form.bowelCondition}
              onChange={(v) => updateForm({ bowelCondition: v })}
            />
          </StepShell>
        )}

        {step === 5 && (
          <StepShell question="今の疲労感を教えてください">
            <SelectCards
              options={FATIGUE_LEVELS.map((f) => ({
                value: f.value,
                label: f.label,
              }))}
              value={form.fatigueLevel}
              onChange={(v) => updateForm({ fatigueLevel: v })}
            />
          </StepShell>
        )}

        {step === 6 && (
          <StepShell question="痛みはありますか">
            <SelectCards
              options={PAIN_LEVELS.map((p) => ({
                value: p.value,
                label: p.label,
              }))}
              value={form.painLevel}
              onChange={(v) => updateForm({ painLevel: v })}
            />
            {form.painLevel !== undefined && form.painLevel > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-base font-medium text-zinc-700 dark:text-zinc-300">
                  痛みのある場所（複数選択可）
                </p>
                <MultiSelectChips
                  options={PAIN_LOCATIONS}
                  values={form.painLocations}
                  onChange={(v) => updateForm({ painLocations: v })}
                />
                <div className="mt-4">
                  <TextAreaField
                    value={form.painNote}
                    onChange={(v) => updateForm({ painNote: v })}
                    maxLength={TEXT_LIMITS.painNote}
                    placeholder="痛みについて補足があれば入力してください"
                    rows={3}
                  />
                </div>
              </div>
            )}
          </StepShell>
        )}

        {step === 7 && (
          <StepShell question="今日の体調について、気になることはありますか">
            <TextAreaField
              value={form.healthNote}
              onChange={(v) => updateForm({ healthNote: v })}
              maxLength={TEXT_LIMITS.healthNote}
              placeholder="例：少し便秘気味、昨日の疲れが残っている"
              rows={5}
              autoFocus
            />
          </StepShell>
        )}

        {step === 8 && (
          <StepShell question="今日の予定を教えてください（任意）">
            <TextAreaField
              value={form.scheduleNote}
              onChange={(v) => updateForm({ scheduleNote: v })}
              maxLength={TEXT_LIMITS.scheduleNote}
              placeholder="例：仕事、外出、通院、休み"
              rows={4}
              autoFocus
            />
          </StepShell>
        )}

        {step === STEP_COUNT + 1 && <ConfirmStep date={date} form={form} />}
      </div>

      <BottomActionBar>
        {step === STEP_COUNT + 1 ? (
          <>
            <Button variant="secondary" onClick={discardAndBack}>
              保存せず戻る
            </Button>
            <Button variant="secondary" onClick={() => setStep(1)}>
              修正する
            </Button>
            <Button onClick={() => handleSave()}>保存する</Button>
          </>
        ) : (
          <>
            {step > 1 && (
              <Button variant="secondary" onClick={goBack}>
                戻る
              </Button>
            )}
            <Button variant="ghost" onClick={saveForLater}>
              あとで入力
            </Button>
            <Button
              onClick={goNext}
              disabled={step === 1 && !canProceedFromStep1}
            >
              次へ
            </Button>
          </>
        )}
      </BottomActionBar>

      {showOverwriteConfirm && (
        <ConfirmDialog
          title="上書きの確認"
          message="今日の記録はすでにあります。上書きしますか？"
          confirmLabel="上書きする"
          cancelLabel="キャンセル"
          onConfirm={() => {
            setShowOverwriteConfirm(false);
            handleSave(true);
          }}
          onCancel={() => setShowOverwriteConfirm(false)}
        />
      )}
    </main>
  );
}

function StepShell({
  question,
  children,
}: {
  question: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="mb-5 text-[22px] font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
        {question}
      </h2>
      {children}
    </div>
  );
}

function ConfirmStep({ date, form }: { date: string; form: FormState }) {
  const rows: [string, string][] = [
    ["体重", form.weightKg ? `${form.weightKg}kg` : "未入力"],
    ["体脂肪率", form.bodyFatPercent ? `${form.bodyFatPercent}%` : "未入力"],
    ["朝食", form.breakfastText || "未入力"],
    ["便通", form.bowelCondition ?? "未入力"],
    [
      "疲労感",
      FATIGUE_LEVELS.find((f) => f.value === form.fatigueLevel)?.label ??
        "未入力",
    ],
    [
      "痛み",
      PAIN_LEVELS.find((p) => p.value === form.painLevel)?.label ?? "未入力",
    ],
    ["痛みの場所", form.painLocations.join("、") || "-"],
    ["体調メモ", form.healthNote || "未入力"],
    ["今日の予定", form.scheduleNote || "未入力"],
  ];

  return (
    <div>
      <h2 className="mb-4 text-[22px] font-semibold text-zinc-900 dark:text-zinc-50">
        入力内容の確認
      </h2>
      <p className="mb-4 text-sm text-zinc-500">{formatJapaneseDate(date)}</p>
      <Card>
        <dl className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 py-2">
              <dt className="text-sm text-zinc-500">{label}</dt>
              <dd className="text-right text-base text-zinc-800 dark:text-zinc-100">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
