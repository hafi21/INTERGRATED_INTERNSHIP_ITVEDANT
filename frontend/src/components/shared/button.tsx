import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "../../lib/cn";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "ghost" | "soft";
  }
>;

export const Button = ({
  children,
  className,
  variant = "primary",
  ...props
}: ButtonProps) => (
  <button
    className={cn(
      "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition duration-300",
      "focus:outline-none focus:ring-2 focus:ring-brand-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      variant === "primary" &&
        "bg-brand-600 text-white shadow-glow hover:-translate-y-0.5 hover:bg-brand-700",
      variant === "ghost" &&
        "border border-brand-200 bg-white/70 text-ink hover:border-brand-400 hover:bg-brand-50",
      variant === "soft" &&
        "bg-brand-50 text-brand-700 hover:bg-brand-100",
      className,
    )}
    {...props}
  >
    {children}
  </button>
);

