import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Plus } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EmptyState, EventCard, SectionTitle } from "@/components/cards";
import { GhostButton, PageHeader } from "@/components/page-header";
import { GlassCalendar } from "@/components/ui/glass-calendar";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PrimaryButton } from "@/components/page-header";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { CalendarEvent } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/calendario")({
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
const SPRING = { type: "spring", stiffness: 400, damping: 30 } as const;

function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

type EventForm = {
  title: string;
  date: string;
  time: string;
  durationMin: string;
  category: string;
  location: string;
  description: string;
};

function toForm(e: CalendarEvent): EventForm {
  return {
    title: e.title,
    date: e.date,
    time: e.time,
    durationMin: String(e.durationMin),
    category: e.category,
    location: e.location ?? "",
    description: e.description ?? "",
  };
}

function CalendarPage() {
  const { events, addEvent, updateEvent, removeEvent } = useApp();
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<EventForm | null>(null);

  const openEdit = (e: CalendarEvent) => {
    setCreating(false);
    setEditing(e);
    setForm(toForm(e));
  };

  const openCreate = (iso: string) => {
    setEditing(null);
    setCreating(true);
    setForm({
      title: "",
      date: iso,
      time: "09:00",
      durationMin: "60",
      category: "Geral",
      location: "",
      description: "",
    });
  };

  const closeDialog = () => {
    setEditing(null);
    setCreating(false);
    setForm(null);
  };

  const save = () => {
    if (!form) return;
    if (!form.title.trim()) {
      toast.error("Dê um título ao compromisso");
      return;
    }
    const patch = {
      title: form.title.trim(),
      date: form.date,
      time: form.time,
      durationMin: Number(form.durationMin) || 60,
      category: form.category.trim() || "Geral",
      location: form.location.trim() || undefined,
      description: form.description.trim() || undefined,
    };
    if (editing) {
      updateEvent(editing.id, patch);
      toast.success("Compromisso atualizado");
    } else {
      addEvent(patch);
      toast.success("Compromisso criado");
    }
    closeDialog();
  };

  const remove = () => {
    if (!editing) return;
    removeEvent(editing.id);
    toast.success("Compromisso removido");
    closeDialog();
  };
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

  const todayEvents = dayEvents(cursor);

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:px-8 md:py-12">
      <PageHeader
        title="Calendário"
        subtitle="Sua agenda completa. Integrações com Google e Outlook em breve."
        action={
          <div className="flex flex-wrap items-center gap-1">
            {MODES.map((m) => (
              <GhostButton key={m} active={mode === m} onClick={() => setMode(m)}>
                {m}
              </GhostButton>
            ))}
            <PrimaryButton onClick={() => openCreate(cursor)}>
              <Plus className="size-4" /> Novo
            </PrimaryButton>
          </div>
        }
      />

      {/* GlassCalendar in Dia mode */}
      <AnimatePresence mode="wait">
        {mode === "Dia" && (
          <motion.div
            key="glass-cal"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={SPRING}
            className="mt-8"
          >
            <GlassCalendar
              selectedDate={base}
              onSelectDate={(d) => setCursor(toISO(d))}
              events={events as { date: string }[]}
            />

            {/* Events list */}
            <div className="mt-6">
              <SectionTitle title="Compromissos" count={todayEvents.length} />
              <AnimatePresence mode="wait">
                {todayEvents.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <EmptyState
                      icon={CalendarDays}
                      title="Nenhum compromisso neste dia"
                      description="Adicione um evento para este dia."
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="events"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2.5"
                  >
                    {todayEvents.map((e, i) => (
                      <motion.div
                        key={e.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...SPRING, delay: i * 0.05 }}
                      >
                        <EventCard event={e} onClick={() => openEdit(e)} />
                        <p className="mt-1 pl-4 text-[11px] text-muted-foreground">
                          até {addMinutes(e.time, e.durationMin)}
                        </p>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {mode === "Semana" && (
          <motion.div
            key="semana"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={SPRING}
          >
            <div className="mt-8 flex items-center gap-2">
              <GhostButton onClick={() => shift(-7)}>←</GhostButton>
              <p className="text-[14px] font-medium">
                Semana de {longDate(weekDays[0] ?? cursor)}
              </p>
              <GhostButton onClick={() => shift(7)}>→</GhostButton>
              <GhostButton onClick={() => setCursor(isoToday())}>Hoje</GhostButton>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-7">
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
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => openEdit(e)}
                        className="block w-full rounded-md bg-primary/12 px-2 py-1 text-left text-[11px] text-foreground/85 transition-colors hover:bg-primary/20"
                      >
                        <span className="tabular-nums text-primary">{e.time}</span>{" "}
                        <span className="line-clamp-2">{e.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {mode === "Mês" && (
          <motion.div
            key="mes"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={SPRING}
          >
            <div className="mt-8 flex items-center gap-2">
              <GhostButton onClick={() => shift(-30)}>←</GhostButton>
              <p className="text-[14px] font-medium">
                {monthLabel(base.getFullYear(), base.getMonth())}
              </p>
              <GhostButton onClick={() => shift(30)}>→</GhostButton>
              <GhostButton onClick={() => setCursor(isoToday())}>Hoje</GhostButton>
            </div>

            <div className="mt-6 surface-card overflow-hidden p-2">
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
                    <motion.button
                      key={iso}
                      whileTap={{ scale: 0.95 }}
                      transition={SPRING}
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
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog
        open={(editing !== null || creating) && form !== null}
        onOpenChange={(o) => !o && closeDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar compromisso" : "Novo compromisso"}</DialogTitle>
            <DialogDescription>
              Ajuste horário, duração, local e detalhes do compromisso.
            </DialogDescription>
          </DialogHeader>
          {form && (
            <div className="space-y-3">
              <Input
                placeholder="Título do compromisso"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
                <Input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  min={5}
                  step={5}
                  placeholder="Duração (min)"
                  value={form.durationMin}
                  onChange={(e) => setForm({ ...form, durationMin: e.target.value })}
                />
                <Input
                  placeholder="Categoria"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
              </div>
              <Input
                placeholder="Local (opcional)"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
              <Textarea
                placeholder="Detalhes (opcional)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          )}
          <DialogFooter className="gap-2 sm:justify-between">
            {editing && <GhostButton onClick={remove}>Excluir</GhostButton>}
            <PrimaryButton onClick={save}>
              {editing ? "Salvar alterações" : "Criar compromisso"}
            </PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
