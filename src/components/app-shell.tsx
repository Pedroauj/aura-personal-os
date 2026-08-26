import { Link, useRouterState } from "@tanstack/react-router";
import {
  CalendarDays,
  Bell,
  Brain,
  CheckSquare,
  FolderKanban,
  Home,
  Inbox,
  Menu,
  Search,
  Settings,
  Sparkles,
  StickyNote,
  Sun,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { USER } from "@/lib/mock-data";
import { CommandPalette } from "@/components/command-palette";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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

/* ── Shared vertical nav (used inside sidebar + Sheet) ── */
function VerticalNav({
  collapsed = false,
  pathname,
  unreadInbox,
  onNavigate,
}: {
  collapsed?: boolean;
  pathname: string;
  unreadInbox: number;
  onNavigate?: () => void;
}) {
  return (
    <ScrollArea className="flex-1">
      <div className={cn("py-3", collapsed ? "px-2" : "px-3")}>
        {!collapsed && (
          <p className="mb-2 px-2 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
            Menu
          </p>
        )}
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active =
              item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Button
                key={item.to}
                variant="ghost"
                title={item.label}
                className={cn(
                  "relative h-9 w-full text-[13px] font-medium",
                  collapsed ? "justify-center px-0" : "justify-start px-3",
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                )}
                asChild
              >
                <Link to={item.to} onClick={onNavigate}>
                  {/* Active indicator pill */}
                  {active && !collapsed && (
                    <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-primary" />
                  )}
                  {active && collapsed && (
                    <span className="absolute right-1 top-1 size-1.5 rounded-full bg-primary" />
                  )}
                  <item.icon
                    className={cn(
                      "size-[17px] shrink-0",
                      !collapsed && "mr-2",
                      active ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  {!collapsed && (
                    <span className="flex-1 truncate">{item.label}</span>
                  )}
                  {/* Inbox badge */}
                  {item.to === "/inbox" && unreadInbox > 0 && !collapsed && (
                    <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                      {unreadInbox > 9 ? "9+" : unreadInbox}
                    </span>
                  )}
                </Link>
              </Button>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
}

/* ── Footer links (Settings + Profile) ── */
function NavFooter({
  collapsed,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <div
      className={cn(
        "space-y-0.5 border-t border-white/[0.06] pt-2 pb-3",
        collapsed ? "px-2" : "px-3",
      )}
    >
      <Button
        variant="ghost"
        className={cn(
          "h-9 w-full text-[13px] font-medium text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
          collapsed ? "justify-center px-0" : "justify-start px-3",
        )}
        asChild
      >
        <Link to="/configuracoes" onClick={onNavigate}>
          <Settings
            className={cn("size-[17px] shrink-0", !collapsed && "mr-2")}
          />
          {!collapsed && "Configurações"}
        </Link>
      </Button>
      <Button
        variant="ghost"
        className={cn(
          "h-9 w-full text-[13px] font-medium text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
          collapsed ? "justify-center px-0" : "justify-start px-3",
        )}
        asChild
      >
        <Link to="/perfil" onClick={onNavigate}>
          <span
            className={cn(
              "flex size-[22px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/15 text-[10px] font-semibold text-primary ring-1 ring-primary/20",
              !collapsed && "mr-2",
            )}
          >
            {USER.initials}
          </span>
          {!collapsed && (
            <span className="flex-1 truncate">{USER.fullName}</span>
          )}
        </Link>
      </Button>
    </div>
  );
}

/* ── Main shell ── */
export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { inbox } = useApp();
  const unreadInbox = inbox.filter((i) => !i.processed).length;

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
    <div className="dot-grid flex min-h-screen w-full bg-background">
      {/* ── Desktop sidebar ── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-white/[0.07] bg-sidebar/80 backdrop-blur-2xl transition-[width] duration-300 ease-in-out md:flex",
          "shadow-[1px_0_0_rgba(255,255,255,0.04)]",
          collapsed ? "w-[68px]" : "w-[240px]",
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-white/[0.06]",
            collapsed ? "justify-center px-0" : "justify-between px-4",
          )}
        >
          {!collapsed && (
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/25 shadow-[0_0_12px_var(--color-primary)/20]">
                <Sparkles className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-tight">Aurora</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  assistente pessoal
                </p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            className="size-8 shrink-0 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Menu className="size-4" />
          </Button>
        </div>

        {/* Search */}
        <div className={cn("py-2", collapsed ? "px-2" : "px-3")}>
          <Button
            variant="ghost"
            onClick={() => setPaletteOpen(true)}
            className={cn(
              "w-full text-[13px] text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
              collapsed ? "justify-center px-0" : "justify-start px-3",
            )}
          >
            <Search className={cn("size-4 shrink-0", !collapsed && "mr-2")} />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">Pesquisar</span>
                <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] tracking-wide">
                  ⌘K
                </kbd>
              </>
            )}
          </Button>
        </div>

        {/* Nav */}
        <VerticalNav
          collapsed={collapsed}
          pathname={pathname}
          unreadInbox={unreadInbox}
        />

        {/* Footer */}
        <NavFooter collapsed={collapsed} />
      </aside>

      {/* ── Page content ── */}
      <div
        className={cn(
          "flex min-h-screen w-full flex-1 flex-col transition-[padding] duration-300 ease-in-out",
          collapsed ? "md:pl-[68px]" : "md:pl-[240px]",
        )}
      >
        {/* Mobile header */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-white/[0.07] bg-background/75 px-4 backdrop-blur-2xl md:hidden">
          {/* Sheet trigger — opens full nav on mobile */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Abrir menu"
                className="size-8 text-muted-foreground"
              >
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="flex w-[240px] flex-col p-0 border-r border-white/[0.07] bg-sidebar/95 backdrop-blur-2xl"
            >
              {/* Sheet header */}
              <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-white/[0.06] px-4">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/25">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-tight">Aurora</p>
                  <p className="text-[11px] text-muted-foreground">assistente pessoal</p>
                </div>
              </div>
              <VerticalNav
                pathname={pathname}
                unreadInbox={unreadInbox}
                onNavigate={() => setSheetOpen(false)}
              />
              <NavFooter onNavigate={() => setSheetOpen(false)} />
            </SheetContent>
          </Sheet>

          <p className="flex-1 text-sm font-semibold tracking-tight">Aurora</p>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPaletteOpen(true)}
            aria-label="Pesquisar"
            className="size-8 text-muted-foreground"
          >
            <Search className="size-4" />
          </Button>

          <Link
            to="/perfil"
            className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/15 text-[10px] font-semibold text-primary ring-1 ring-primary/20"
          >
            {USER.initials}
          </Link>
        </header>

        <main className="flex-1 pb-20 md:pb-0">{children}</main>

        {/* Mobile bottom tab bar */}
        <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-white/[0.07] bg-background/80 px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-2xl md:hidden">
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
                <span className="relative">
                  <item.icon className="size-[18px]" />
                  {item.to === "/inbox" && unreadInbox > 0 && (
                    <span className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground">
                      {unreadInbox > 9 ? "9+" : unreadInbox}
                    </span>
                  )}
                </span>
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
