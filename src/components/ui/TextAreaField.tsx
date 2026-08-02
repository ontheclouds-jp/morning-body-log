interface TextAreaFieldProps {
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  placeholder?: string;
  rows?: number;
  autoFocus?: boolean;
}

export function TextAreaField({
  value,
  onChange,
  maxLength,
  placeholder,
  rows = 4,
  autoFocus,
}: TextAreaFieldProps) {
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        rows={rows}
        autoFocus={autoFocus}
        className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-lg focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
      />
      <div className="mt-1 text-right text-sm text-zinc-500">
        {value.length} / {maxLength}
      </div>
    </div>
  );
}
