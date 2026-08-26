import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="animate-pop flex flex-wrap items-end gap-4">
      <div className="min-w-0 flex-1">
        {eyebrow && <p className="text-[13px] text-muted-foreground">{eyebrow}</p>}
        <h1 className="text-balance-tight mt-1.5 text-2xl font-semibold md:text-3xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 text-[14px] text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  active,
}: {
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? "rounded-lg bg-secondary px-3 py-1.5 text-[13px] font-medium text-foreground"
          : "rounded-lg px-3 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
      }
    >
      {children}
    </button>
  );
}
