import type { ReactNode } from "react";

export function BottomActionBar({ children }: { children: ReactNode }) {
  return (
    <div
      className="sticky bottom-0 left-0 right-0 mt-8 flex flex-col gap-3 border-t border-zinc-200 bg-white/95 p-4 backdrop-blur sm:flex-row sm:justify-end dark:border-zinc-800 dark:bg-black/95"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      {children}
    </div>
  );
}
