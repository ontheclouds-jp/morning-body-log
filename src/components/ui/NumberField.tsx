interface NumberFieldProps {
  value: string;
  onChange: (value: string) => void;
  unit: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export function NumberField({
  value,
  onChange,
  unit,
  placeholder,
  autoFocus,
}: NumberFieldProps) {
  return (
    <div className="flex items-baseline gap-3">
      <input
        type="number"
        inputMode="decimal"
        step={0.1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-40 rounded-xl border border-zinc-300 px-4 py-3 text-[28px] font-semibold tabular-nums focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
      />
      <span className="text-xl text-zinc-600 dark:text-zinc-400">{unit}</span>
    </div>
  );
}
