import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
import { useCurrentUser } from "@/lib/current-user";

export const Route = createFileRoute("/_authenticated/")({
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
  const user = useCurrentUser();
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
        <div className="animate-pop">
          <p className="text-[13px] text-muted-foreground">{longDate(today)}</p>
          <h1 className="text-balance-tight mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            {greeting()}
            {user.name ? `, ${user.name}` : ""}.
          </h1>
          <p className="mt-2 text-lg text-muted-foreground md:text-xl">
            O que vamos resolver hoje?
          </p>
        </div>

        <div className="animate-pop mt-8" style={{ animationDelay: "90ms" }}>
          <Composer onSubmit={ask} large />
          <div className="mt-4 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s, i) => (
              <QuickAction
                key={s.label}
                label={s.label}
                icon={s.icon}
                onClick={() => ask(s.text)}
                delay={i * 40}
              />
            ))}
          </div>
        </div>

        <div
          className="animate-pop surface-card mt-10 p-5"
          style={{ animationDelay: "180ms" }}
        >
          <div className="flex items-center gap-2">
            <h2 className="text-[13px] font-medium tracking-wide text-muted-foreground uppercase">
              Hoje
            </h2>
            {next && (
              <Link
                to="/calendario"
                className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
              >
                <Clock className="size-3" />
                Próximo às {next.time}
              </Link>
            )}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <Stat
              value={pending.length}
              label={pending.length === 1 ? "tarefa pendente" : "tarefas pendentes"}
              icon={CheckSquare}
              delay={240}
            />
            <Stat
              value={todayEvents.length}
              label={todayEvents.length === 1 ? "compromisso" : "compromissos"}
              icon={CalendarDays}
              delay={300}
            />
            <Stat
              value={todayReminders.length}
              label={todayReminders.length === 1 ? "lembrete" : "lembretes"}
              icon={Bell}
              delay={360}
            />
          </div>

          <button
            onClick={() => navigate({ to: "/assistente" })}
            className="surface-card mt-5 flex w-full cursor-pointer gap-3 p-4 text-left transition-all hover:brightness-110 hover:shadow-[inset_0_1.5px_0_oklch(1_0_0/25%),0_8px_32px_oklch(0_0_0/28%)]"
          >
            <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Sparkles className="size-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] leading-relaxed text-foreground/85">{insight}</p>
              <p className="mt-1.5 text-[11px] text-primary/70">Clique para conversar com a Aurora →</p>
            </div>
          </button>

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
  delay = 0,
}: {
  value: number;
  label: string;
  icon: typeof CheckSquare;
  delay?: number;
}) {
  return (
    <div
      className="lift animate-pop rounded-xl bg-surface-2/60 p-4"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Icon className="size-4 text-primary/70" />
      <p className="mt-3 text-2xl font-semibold tabular-nums">{value}</p>
      <p className="mt-0.5 text-[12px] text-muted-foreground">{label}</p>
    </div>
  );
}
