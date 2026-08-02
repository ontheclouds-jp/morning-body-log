import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-zinc-300",
  secondary:
    "bg-white text-zinc-800 border border-zinc-300 hover:bg-zinc-50 disabled:text-zinc-400",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-zinc-300",
  ghost: "bg-transparent text-zinc-600 hover:bg-zinc-100 disabled:text-zinc-300",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`min-h-[48px] w-full rounded-xl px-5 text-lg font-medium transition-colors disabled:cursor-not-allowed sm:w-auto ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
