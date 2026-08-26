import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  CalendarDays,
  CheckSquare,
  Clock,
  Sparkles,
  StickyNote,
  Sun,
} from "lucide-react";
import { Composer, QuickAction, useAssistant } from "@/components/assistant";
import { useApp } from "@/lib/store";
import { dailyInsight } from "@/lib/assistant";
import { greeting, isoToday, longDate } from "@/lib/format";
import { USER } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aurora — Sua assistente pessoal com IA" },
      {
        name: "description",
        content:
          "Fale com a Aurora e organize seu dia: tarefas, compromissos, lembretes, notas e memória pessoal em uma única central.",
      },
      { property: "og:title", content: "Aurora — Sua assistente pessoal com IA" },
      {
        property: "og:description",
        content:
          "Fale com a Aurora e organize seu dia: tarefas, compromissos, lembretes, notas e memória pessoal.",
      },
    ],
  }),
  component: Home,
});

const SUGGESTIONS = [
  { label: "Organizar meu dia", icon: Sun, text: "Organiza meu dia" },
  { label: "Criar uma tarefa", icon: CheckSquare, text: "Criar uma tarefa para hoje" },
  {
    label: "Ver meus compromissos",
    icon: CalendarDays,
    text: "O que eu tenho para hoje?",
  },
  { label: "Fazer uma anotação", icon: StickyNote, text: "Anota que " },
  { label: "Planejar minha semana", icon: Sparkles, text: "Organiza minha semana" },
];

function Home() {
  const navigate = useNavigate();
  const app = useApp();
  const { send } = useAssistant();
  const today = isoToday();

  const pending = app.tasks.filter(
    (t) => t.date === today && t.status !== "concluido" && t.status !== "cancelado",
  );
  const todayEvents = app.events
    .filter((e) => e.date === today)
    .sort((a, b) => a.time.localeCompare(b.time));
  const todayReminders = app.reminders.filter((r) => r.date === today && !r.done);
  const now = new Date();
  const nowStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const next = todayEvents.find((e) => e.time >= nowStr) ?? todayEvents[0];

  const ask = (text: string) => {
    if (text.trim().endsWith("que")) {
      navigate({ to: "/assistente" });
      return;
    }
    send(text);
    navigate({ to: "/assistente" });
  };

  const insight = dailyInsight({
    tasks: app.tasks,
    events: app.events,
    reminders: app.reminders,
    notes: app.notes,
    memories: app.memories,
  });

  return (
    <div className="halo relative min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-5 py-16 md:py-24">
        <div className="animate-rise">
          <p className="text-[13px] text-muted-foreground">{longDate(today)}</p>
          <h1 className="text-balance-tight mt-3 text-4xl font-semibold md:text-5xl">
            {greeting()}, {USER.name}.
          </h1>
          <p className="mt-2 text-lg text-muted-foreground md:text-xl">
            O que vamos resolver hoje?
          </p>
        </div>

        <div className="animate-rise mt-8" style={{ animationDelay: "80ms" }}>
          <Composer onSubmit={ask} large />
          <div className="mt-4 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <QuickAction
                key={s.label}
                label={s.label}
                icon={s.icon}
                onClick={() => ask(s.text)}
              />
            ))}
          </div>
        </div>

        <div
          className="animate-rise surface-card mt-10 p-5"
          style={{ animationDelay: "160ms" }}
        >
          <div className="flex items-center gap-2">
            <h2 className="text-[13px] font-medium tracking-wide text-muted-foreground uppercase">
              Hoje
            </h2>
            {next && (
              <span className="ml-auto inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
                <Clock className="size-3.5" />
                Próximo compromisso às {next.time}
              </span>
            )}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <Stat
              value={pending.length}
              label={pending.length === 1 ? "tarefa pendente" : "tarefas pendentes"}
              icon={CheckSquare}
            />
            <Stat
              value={todayEvents.length}
              label={todayEvents.length === 1 ? "compromisso" : "compromissos"}
              icon={CalendarDays}
            />
            <Stat
              value={todayReminders.length}
              label={todayReminders.length === 1 ? "lembrete" : "lembretes"}
              icon={Bell}
            />
          </div>

          <div className="mt-5 flex gap-3 rounded-xl bg-primary-soft/25 p-4">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-[13px] leading-relaxed text-foreground/85">{insight}</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <QuickAction label="Abrir visão Hoje" onClick={() => navigate({ to: "/hoje" })} />
            <QuickAction
              label="Falar com a assistente"
              icon={Sparkles}
              onClick={() => navigate({ to: "/assistente" })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  value,
  label,
  icon: Icon,
}: {
  value: number;
  label: string;
  icon: typeof CheckSquare;
}) {
  return (
    <div className="rounded-xl bg-surface-2/60 p-4 transition-colors hover:bg-surface-2">
      <Icon className="size-4 text-muted-foreground" />
      <p className="mt-3 text-2xl font-semibold tabular-nums">{value}</p>
      <p className="mt-0.5 text-[12px] text-muted-foreground">{label}</p>
    </div>
  );
}
