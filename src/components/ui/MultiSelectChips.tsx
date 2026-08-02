interface MultiSelectChipsProps<T extends string> {
  options: readonly T[];
  values: T[];
  onChange: (values: T[]) => void;
}

export function MultiSelectChips<T extends string>({
  options,
  values,
  onChange,
}: MultiSelectChipsProps<T>) {
  function toggle(option: T) {
    if (values.includes(option)) {
      onChange(values.filter((v) => v !== option));
    } else {
      onChange([...values, option]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = values.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            aria-pressed={selected}
            className={`min-h-[44px] rounded-full border-2 px-4 py-2 text-base font-medium transition-colors ${
              selected
                ? "border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
                : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
