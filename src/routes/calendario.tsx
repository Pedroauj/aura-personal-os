import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import { useState } from "react";
import { EmptyState, EventCard, SectionTitle } from "@/components/cards";
import { GhostButton, PageHeader } from "@/components/page-header";
import { useApp } from "@/lib/store";
import {
  isoToday,
  longDate,
  monthLabel,
  parseISODate,
  weekdayShort,
  addMinutes,
} from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendario")({
  head: () => ({
    meta: [
      { title: "Calendário — Aurora" },
      {
        name: "description",
        content:
          "Visualize sua agenda por dia, semana e mês com eventos, duração, local e lembretes.",
      },
      { property: "og:title", content: "Calendário — Aurora" },
      {
        property: "og:description",
        content: "Agenda por dia, semana e mês, pronta para integrar com Google e Outlook.",
      },
    ],
  }),
  component: CalendarPage,
});

const MODES = ["Dia", "Semana", "Mês"] as const;

function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function CalendarPage() {
  const { events } = useApp();
  const [mode, setMode] = useState<(typeof MODES)[number]>("Dia");
  const [cursor, setCursor] = useState(isoToday());
  const base = parseISODate(cursor);

  const dayEvents = (iso: string) =>
    events.filter((e) => e.date === iso).sort((a, b) => a.time.localeCompare(b.time));

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(d.getDate() - d.getDay() + i);
    return toISO(d);
  });

  const monthGrid = (() => {
    const first = new Date(base.getFullYear(), base.getMonth(), 1);
    const start = new Date(first);
    start.setDate(1 - first.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  })();

  const shift = (days: number) => {
    const d = parseISODate(cursor);
    d.setDate(d.getDate() + days);
    setCursor(toISO(d));
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:px-8 md:py-12">
      <PageHeader
        title="Calendário"
        subtitle="Sua agenda completa. Integrações com Google e Outlook em breve."
        action={
          <div className="flex gap-1">
            {MODES.map((m) => (
              <GhostButton key={m} active={mode === m} onClick={() => setMode(m)}>
                {m}
              </GhostButton>
            ))}
          </div>
        }
      />

      <div className="mt-8 flex items-center gap-2">
        <GhostButton onClick={() => shift(mode === "Mês" ? -30 : mode === "Semana" ? -7 : -1)}>
          ←
        </GhostButton>
        <p className="text-[14px] font-medium">
          {mode === "Mês"
            ? monthLabel(base.getFullYear(), base.getMonth())
            : mode === "Semana"
              ? `Semana de ${longDate(weekDays[0])}`
              : longDate(cursor)}
        </p>
        <GhostButton onClick={() => shift(mode === "Mês" ? 30 : mode === "Semana" ? 7 : 1)}>
          →
        </GhostButton>
        <GhostButton onClick={() => setCursor(isoToday())}>Hoje</GhostButton>
      </div>

      <div className="mt-6">
        {mode === "Dia" && (
          <div>
            <SectionTitle title="Compromissos" count={dayEvents(cursor).length} />
            {dayEvents(cursor).length === 0 ? (
              <EmptyState icon={CalendarDays} title="Nenhum compromisso neste dia" />
            ) : (
              <div className="space-y-2.5">
                {dayEvents(cursor).map((e) => (
                  <div key={e.id}>
                    <EventCard event={e} />
                    <p className="mt-1 pl-4 text-[11px] text-muted-foreground">
                      até {addMinutes(e.time, e.durationMin)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {mode === "Semana" && (
          <div className="grid gap-3 md:grid-cols-7">
            {weekDays.map((iso) => (
              <div
                key={iso}
                className={cn(
                  "surface-card min-h-32 p-3",
                  iso === isoToday() && "border-primary/40",
                )}
              >
                <p className="text-[11px] text-muted-foreground">
                  {weekdayShort[parseISODate(iso).getDay()]}
                </p>
                <p className="text-[16px] font-semibold tabular-nums">
                  {parseISODate(iso).getDate()}
                </p>
                <div className="mt-2 space-y-1.5">
                  {dayEvents(iso).map((e) => (
                    <div
                      key={e.id}
                      className="rounded-md bg-primary/12 px-2 py-1 text-[11px] text-foreground/85"
                    >
                      <span className="tabular-nums text-primary">{e.time}</span>{" "}
                      <span className="line-clamp-2">{e.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {mode === "Mês" && (
          <div className="surface-card overflow-hidden p-2">
            <div className="grid grid-cols-7 border-b border-border pb-2">
              {weekdayShort.map((w) => (
                <p key={w} className="text-center text-[11px] text-muted-foreground">
                  {w}
                </p>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {monthGrid.map((d) => {
                const iso = toISO(d);
                const outside = d.getMonth() !== base.getMonth();
                const evs = dayEvents(iso);
                return (
                  <button
                    key={iso}
                    onClick={() => {
                      setCursor(iso);
                      setMode("Dia");
                    }}
                    className={cn(
                      "min-h-20 border-b border-r border-border/50 p-1.5 text-left transition-colors hover:bg-surface-2",
                      outside && "opacity-35",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex size-6 items-center justify-center rounded-md text-[12px] tabular-nums",
                        iso === isoToday() && "bg-primary text-primary-foreground",
                      )}
                    >
                      {d.getDate()}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {evs.slice(0, 2).map((e) => (
                        <p
                          key={e.id}
                          className="truncate text-[10px] text-muted-foreground"
                        >
                          <span className="text-primary">•</span> {e.title}
                        </p>
                      ))}
                      {evs.length > 2 && (
                        <p className="text-[10px] text-muted-foreground">
                          +{evs.length - 2}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
