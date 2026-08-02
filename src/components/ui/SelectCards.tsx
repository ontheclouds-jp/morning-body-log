interface Option<T extends string | number> {
  value: T;
  label: string;
}

interface SelectCardsProps<T extends string | number> {
  options: readonly Option<T>[];
  value: T | undefined;
  onChange: (value: T) => void;
  columns?: 1 | 2;
}

export function SelectCards<T extends string | number>({
  options,
  value,
  onChange,
  columns = 1,
}: SelectCardsProps<T>) {
  return (
    <div
      className={`grid gap-3 ${columns === 2 ? "grid-cols-2" : "grid-cols-1"}`}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={selected}
            className={`min-h-[56px] rounded-xl border-2 px-4 py-3 text-left text-lg font-medium transition-colors ${
              selected
                ? "border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
                : "border-zinc-300 bg-white text-zinc-800 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
