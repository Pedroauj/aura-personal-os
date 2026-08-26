import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { SectionTitle } from "@/components/cards";
import { useApp } from "@/lib/store";
import { USER } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil — Aurora" },
      {
        name: "description",
        content: "Seus dados, sua rotina e um resumo do que a assistente gerencia por você.",
      },
      { property: "og:title", content: "Perfil — Aurora" },
      {
        property: "og:description",
        content: "Seus dados e um resumo do que a assistente gerencia.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const app = useApp();
  const stats = [
    { label: "Tarefas", value: app.tasks.length },
    { label: "Compromissos", value: app.events.length },
    { label: "Lembretes", value: app.reminders.length },
    { label: "Notas", value: app.notes.length },
    { label: "Memórias", value: app.memories.length },
    { label: "Projetos", value: app.projects.length },
  ];

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-8 md:px-8 md:py-12">
      <PageHeader title="Perfil" subtitle="Seus dados e o que a Aurora gerencia por você." />

      <div className="surface-card mt-8 flex items-center gap-4 p-5">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/18 text-[15px] font-semibold text-primary">
          {USER.initials}
        </div>
        <div className="min-w-0">
          <p className="text-[16px] font-medium">{USER.fullName}</p>
          <p className="text-[13px] text-muted-foreground">{USER.email}</p>
        </div>
      </div>

      <div className="mt-10">
        <SectionTitle title="Resumo" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="surface-card p-4">
              <p className="text-2xl font-semibold tabular-nums">{s.value}</p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
