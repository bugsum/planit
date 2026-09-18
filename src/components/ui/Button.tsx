import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/helpers/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-accent text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.18)] hover:bg-accent-hover",
  secondary:
    "border border-line-strong bg-raised text-zinc-100 hover:border-zinc-600 hover:bg-zinc-800/80",
  ghost: "text-zinc-400 hover:bg-white/5 hover:text-zinc-100",
  danger: "text-red-400 hover:bg-red-500/10 hover:text-red-300",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 gap-1.5 px-3 text-[13px]",
  md: "h-9 gap-2 px-4 text-sm",
  lg: "h-12 gap-2 px-6 text-[15px]",
};

export function buttonClasses({
  variant = "secondary",
  size = "md",
  className,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
} = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center rounded-lg font-semibold whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-40",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({ variant, size, className, type = "button", ...props }: Props) {
  return (
    <button type={type} className={buttonClasses({ variant, size, className })} {...props} />
  );
}

export const iconButtonClasses =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-100 disabled:pointer-events-none disabled:opacity-30";

export function IconButton({
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={cn(iconButtonClasses, className)} {...props} />;
}
