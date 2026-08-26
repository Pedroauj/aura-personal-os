import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Variant = "primary" | "glass" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

const PRESS_SPRING = { type: "spring", stiffness: 500, damping: 30 } as const;

const variantStyles: Record<Variant, string> = {
  primary: [
    "bg-primary text-primary-foreground font-semibold",
    "shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset,0_2px_4px_rgba(0,0,0,0.25)]",
    "hover:brightness-110 active:brightness-90",
  ].join(" "),
  glass: [
    "bg-white/10 text-foreground font-medium border border-white/12",
    "backdrop-blur-xl",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_1px_3px_rgba(0,0,0,0.2)]",
    "hover:bg-white/15 active:bg-white/8",
  ].join(" "),
  ghost: [
    "bg-transparent text-muted-foreground font-medium",
    "hover:bg-white/8 hover:text-foreground active:bg-white/5",
  ].join(" "),
  destructive: [
    "bg-destructive text-destructive-foreground font-semibold",
    "shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset,0_2px_4px_rgba(0,0,0,0.25)]",
    "hover:brightness-110 active:brightness-90",
  ].join(" "),
};

const sizeStyles: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] rounded-lg gap-1.5",
  md: "h-10 px-4 text-[14px] rounded-xl gap-2",
  lg: "h-12 px-6 text-[15px] rounded-2xl gap-2.5",
};

export interface NativeButtonProps
  extends Omit<HTMLMotionProps<"button">, "children"> {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  glow?: boolean;
}

export function NativeButton({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  glow = false,
  disabled,
  className,
  ...props
}: NativeButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      {...(isDisabled ? {} : { whileTap: { scale: 0.96 } })}
      transition={PRESS_SPRING}
      disabled={isDisabled}
      className={cn(
        "relative inline-flex cursor-pointer select-none items-center justify-center overflow-hidden",
        "transition-colors duration-150 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-40",
        variantStyles[variant],
        sizeStyles[size],
        glow && variant === "primary" && "shadow-[0_0_20px_var(--color-primary)/35]",
        className,
      )}
      style={{ WebkitTapHighlightColor: "transparent" }}
      {...props}
    >
      {/* Specular highlight */}
      <span
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 50%, transparent 100%)",
        }}
      />

      {/* Content */}
      {loading ? (
        <span className="flex items-center gap-2">
          <svg
            className="size-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
              strokeLinecap="round"
            />
          </svg>
          {children}
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
}
