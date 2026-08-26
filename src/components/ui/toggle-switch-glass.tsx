import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const SPRING = { type: "spring", stiffness: 500, damping: 30 } as const;

export interface ToggleSwitchGlassProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
}

export function ToggleSwitchGlass({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  id,
}: ToggleSwitchGlassProps) {
  const toggleId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn("flex items-center gap-3", disabled && "opacity-50")}>
      <button
        id={toggleId}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          "relative inline-flex h-[31px] w-[51px] shrink-0 cursor-pointer rounded-full border-2 border-transparent",
          "transition-colors duration-200 ease-in-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          checked
            ? "bg-primary shadow-[0_0_12px_var(--color-primary)/40]"
            : "bg-white/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_0_0_1px_rgba(255,255,255,0.06)]",
          "before:absolute before:inset-0 before:rounded-full",
          disabled && "cursor-not-allowed",
        )}
        style={{
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {/* Glass track shimmer (unchecked only) */}
        {!checked && (
          <span
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 50%, transparent 100%)",
            }}
          />
        )}

        {/* Thumb */}
        <motion.span
          layout
          layoutId={`thumb-${toggleId}`}
          animate={{ x: checked ? 20 : 0 }}
          transition={SPRING}
          className={cn(
            "pointer-events-none absolute left-[2px] top-[2px] inline-flex size-[23px] items-center justify-center rounded-full",
            "shadow-[0_2px_6px_rgba(0,0,0,0.35),0_0_0_0.5px_rgba(0,0,0,0.08)]",
          )}
          style={{
            background: "linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%)",
          }}
        >
          {/* Thumb inner highlight */}
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 50%, rgba(0,0,0,0.04) 100%)",
            }}
          />
        </motion.span>
      </button>

      {(label || description) && (
        <label htmlFor={toggleId} className="cursor-pointer select-none">
          {label && <p className="text-[14px] font-medium leading-none">{label}</p>}
          {description && (
            <p className={cn("text-[12px] text-muted-foreground", label && "mt-1")}>
              {description}
            </p>
          )}
        </label>
      )}
    </div>
  );
}
