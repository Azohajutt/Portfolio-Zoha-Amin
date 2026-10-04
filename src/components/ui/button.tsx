import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:opacity-50",
        variant === "primary" && "bg-[var(--accent)] text-[var(--accent-fg)] hover:brightness-110",
        variant === "secondary" &&
          "border border-[var(--border)] bg-[var(--panel)] text-[var(--fg)] backdrop-blur hover:border-[var(--accent)]",
        variant === "ghost" && "text-[var(--muted)] hover:text-[var(--fg)]",
        className,
      )}
      {...props}
    />
  );
}
