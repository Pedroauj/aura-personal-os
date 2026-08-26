import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, CheckSquare, Sparkles } from "lucide-react";
import { EmptyState, EventCard, SectionTitle, TaskCard } from "@/components/cards";
import { useApp } from "@/lib/store";
import { dailyInsight } from "@/lib/assistant";
import { greeting, isoToday, longDate } from "@/lib/format";
import { useCurrentUser } from "@/lib/current-user";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/_authenticated/hoje")({
  head: () => ({
    meta: [
      { title: "Hoje — Aurora" },
      {
        name: "description",
        content:
          "Seu painel do dia: agenda em timeline, tarefas prioritárias, atrasadas e concluídas.",
      },
      { property: "og:title", content: "Hoje — Aurora" },
      {
        property: "og:description",
        content: "Agenda do dia em timeline e tarefas organizadas por prioridade.",
      },
    ],
  }),
  component: TodayPage,
});

function TodayPage() {
  const app = useApp();
  const today = isoToday();

  const events = app.events
    .filter((e) => e.date === today)
    .sort((a, b) => a.time.localeCompare(b.time));
  const open = app.tasks.filter(
    (t) => t.status !== "concluido" && t.status !== "cancelado",
  );
  const priority = open.filter(
    (t) => (t.priority === "alta" || t.priority === "urgente") && t.date === today,
  );
  const todayTasks = open.filter(
    (t) => t.date === today && !priority.some((p) => p.id === t.id),
  );
  const late = open.filter((t) => t.date && t.date < today);
  const done = app.tasks.filter((t) => t.status === "concluido" && t.date === today);

  const projectName = (id?: string) => app.projects.find((p) => p.id === id)?.name;

  const insight = dailyInsight({
    tasks: app.tasks,
    events: app.events,
    reminders: app.reminders,
    notes: app.notes,
    memories: app.memories,
  });

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:px-8 md:py-12">
      <PageHeader
        eyebrow={longDate(today)}
        title={`${greeting()}${user.name ? `, ${user.name}` : ""}.`}
        subtitle="Este é o seu painel do dia."
      />

      <div className="surface-card mt-6 flex gap-3 p-4">
        <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="text-[13px] leading-relaxed text-foreground/85">{insight}</p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.05fr_1fr]">
        <section>
          <SectionTitle title="Agenda" count={events.length} />
          {events.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="Nenhum compromisso hoje"
              description="Seu dia está livre. Bom momento para adiantar tarefas."
            />
          ) : (
            <ol className="relative space-y-3 border-l border-border pl-5">
              {events.map((e) => (
                <li key={e.id} className="relative">
                  <span className="absolute top-5 -left-[25px] size-2 rounded-full bg-primary ring-4 ring-background" />
                  <EventCard event={e} />
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="space-y-8">
          <div>
            <SectionTitle title="Prioridade" count={priority.length} />
            {priority.length === 0 ? (
              <EmptyState icon={CheckSquare} title="Sem tarefas prioritárias" />
            ) : (
              <div className="space-y-2.5">
                {priority.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    projectName={projectName(t.projectId)}
                    onToggle={() => app.toggleTask(t.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {todayTasks.length > 0 && (
            <div>
              <SectionTitle title="Hoje" count={todayTasks.length} />
              <div className="space-y-2.5">
                {todayTasks.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    projectName={projectName(t.projectId)}
                    onToggle={() => app.toggleTask(t.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {late.length > 0 && (
            <div>
              <SectionTitle title="Atrasadas" count={late.length} />
              <div className="space-y-2.5">
                {late.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    projectName={projectName(t.projectId)}
                    onToggle={() => app.toggleTask(t.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {done.length > 0 && (
            <div>
              <SectionTitle title="Concluídas" count={done.length} />
              <div className="space-y-2.5">
                {done.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    projectName={projectName(t.projectId)}
                    onToggle={() => app.toggleTask(t.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
