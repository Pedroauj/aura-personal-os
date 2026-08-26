import { Link, useRouterState } from "@tanstack/react-router";
import {
  CalendarDays,
  Bell,
  Brain,
  CheckSquare,
  FolderKanban,
  Home,
  Inbox,
  PanelLeftClose,
  PanelLeft,
  Search,
  Settings,
  Sparkles,
  StickyNote,
  Sun,
  User,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { USER } from "@/lib/mock-data";
import { CommandPalette } from "@/components/command-palette";

export const NAV_ITEMS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/hoje", label: "Hoje", icon: Sun },
  { to: "/assistente", label: "Assistente", icon: Sparkles },
  { to: "/tarefas", label: "Tarefas", icon: CheckSquare },
  { to: "/calendario", label: "Calendário", icon: CalendarDays },
  { to: "/lembretes", label: "Lembretes", icon: Bell },
  { to: "/projetos", label: "Projetos", icon: FolderKanban },
  { to: "/notas", label: "Notas", icon: StickyNote },
  { to: "/memoria", label: "Memória", icon: Brain },
  { to: "/inbox", label: "Inbox", icon: Inbox },
] as const;

const MOBILE_ITEMS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/hoje", label: "Hoje", icon: Sun },
  { to: "/assistente", label: "IA", icon: Sparkles },
  { to: "/tarefas", label: "Tarefas", icon: CheckSquare },
  { to: "/inbox", label: "Inbox", icon: Inbox },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border bg-sidebar transition-[width] duration-300 ease-out md:flex",
          collapsed ? "w-[68px]" : "w-[236px]",
        )}
      >
        <div className="flex h-16 items-center gap-2.5 px-4">
          <div className="relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/25 shadow-[0_0_12px_var(--color-primary)]/20">
            <Sparkles className="size-4" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold tracking-tight">Aurora</p>
              <p className="truncate text-[11px] text-muted-foreground">
                assistente pessoal
              </p>
            </div>
          )}
          <button
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {collapsed ? (
              <PanelLeft className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </button>
        </div>

        <div className="px-3 pb-2">
          <button
            onClick={() => setPaletteOpen(true)}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg bg-secondary/60 px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary",
              collapsed && "justify-center px-0",
            )}
          >
            <Search className="size-4 shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left text-[13px]">Pesquisar</span>
                <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] tracking-wide">
                  ⌘K
                </kbd>
              </>
            )}
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
          {NAV_ITEMS.map((item) => {
            const active =
              item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                title={item.label}
                className={cn(
                  "nudge group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-medium",
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  collapsed && "justify-center px-0",
                )}
              >
                {active && !collapsed && (
                  <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-primary" />
                )}
                <item.icon
                  className={cn(
                    "size-[17px] shrink-0 transition-colors",
                    active && "text-primary",
                  )}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-0.5 border-t border-border px-3 py-3">
          <Link
            to="/configuracoes"
            className={cn(
              "flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground",
              collapsed && "justify-center px-0",
            )}
          >
            <Settings className="size-[17px] shrink-0" />
            {!collapsed && <span>Configurações</span>}
          </Link>
          <Link
            to="/perfil"
            className={cn(
              "flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground",
              collapsed && "justify-center px-0",
            )}
          >
            <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-primary/20 text-[10px] font-semibold text-primary">
              {USER.initials}
            </span>
            {!collapsed && <span className="truncate">{USER.fullName}</span>}
          </Link>
        </div>
      </aside>

      <div
        className={cn(
          "flex min-h-screen w-full flex-1 flex-col transition-[padding] duration-300 ease-out",
          collapsed ? "md:pl-[68px]" : "md:pl-[236px]",
        )}
      >
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl md:hidden">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Sparkles className="size-3.5" />
          </div>
          <p className="flex-1 text-sm font-semibold tracking-tight">Aurora</p>
          <button
            onClick={() => setPaletteOpen(true)}
            aria-label="Pesquisar"
            className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Search className="size-4" />
          </button>
          <Link
            to="/perfil"
            className="flex size-7 items-center justify-center rounded-full bg-primary/20 text-[10px] font-semibold text-primary"
          >
            {USER.initials}
          </Link>
        </header>

        <main className="flex-1 pb-20 md:pb-0">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-border bg-background/90 px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden">
          {MOBILE_ITEMS.map((item) => {
            const active =
              item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className="size-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
