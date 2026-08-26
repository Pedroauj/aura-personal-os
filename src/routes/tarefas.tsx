import { createFileRoute } from "@tanstack/react-router";
import { CheckSquare, Plus } from "lucide-react";
import { useState } from "react";
import { EmptyState, SectionTitle, TaskCard } from "@/components/cards";
import { GhostButton, PageHeader, PrimaryButton } from "@/components/page-header";
import { useApp } from "@/lib/store";
import { isoToday } from "@/lib/format";
import type { Priority } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/tarefas")({
  head: () => ({
    meta: [
      { title: "Tarefas — Aurora" },
      {
        name: "description",
        content:
          "Gerencie tarefas com prioridade, projeto, categoria, subtarefas e status em visões de hoje, próximas e atrasadas.",
      },
      { property: "og:title", content: "Tarefas — Aurora" },
      {
        property: "og:description",
        content: "Prioridades, projetos, subtarefas e status em um sistema simples.",
      },
    ],
  }),
  component: TasksPage,
});

const VIEWS = ["Hoje", "Próximas", "Atrasadas", "Todas"] as const;
const PRIORITIES: Priority[] = ["baixa", "media", "alta", "urgente"];

function TasksPage() {
  const app = useApp();
  const [view, setView] = useState<(typeof VIEWS)[number]>("Hoje");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: isoToday(),
    time: "",
    priority: "media" as Priority,
    projectId: "",
    category: "",
  });

  const today = isoToday();
  const active = app.tasks.filter(
    (t) => t.status !== "concluido" && t.status !== "cancelado",
  );

  const list =
    view === "Hoje"
      ? active.filter((t) => t.date === today)
      : view === "Próximas"
        ? active.filter((t) => t.date && t.date > today)
        : view === "Atrasadas"
          ? active.filter((t) => t.date && t.date < today)
          : app.tasks;

  const projectName = (id?: string) => app.projects.find((p) => p.id === id)?.name;

  const create = () => {
    if (!form.title.trim()) return;
    app.addTask({
      title: form.title.trim(),
      description: form.description || undefined,
      date: form.date || undefined,
      time: form.time || undefined,
      priority: form.priority,
      projectId: form.projectId || undefined,
      category: form.category || undefined,
    });
    toast.success("Tarefa criada");
    setForm({
      title: "",
      description: "",
      date: isoToday(),
      time: "",
      priority: "media",
      projectId: "",
      category: "",
    });
    setOpen(false);
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-8 md:px-8 md:py-12">
      <PageHeader
        title="Tarefas"
        subtitle="Tudo que precisa da sua atenção, organizado por prioridade."
        action={
          <PrimaryButton onClick={() => setOpen(true)}>
            <Plus className="size-4" /> Nova tarefa
          </PrimaryButton>
        }
      />

      <div className="mt-8 flex flex-wrap gap-1 border-b border-border pb-3">
        {VIEWS.map((v) => (
          <GhostButton key={v} active={view === v} onClick={() => setView(v)}>
            {v}
          </GhostButton>
        ))}
      </div>

      <div className="mt-6">
        <SectionTitle title={view} count={list.length} />
        {list.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="Nada por aqui"
            description="Peça para a assistente criar uma tarefa ou adicione manualmente."
          />
        ) : (
          <div className="space-y-2.5">
            {list.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                projectName={projectName(t.projectId)}
                onToggle={() => app.toggleTask(t.id)}
                onDelete={() => app.removeTask(t.id)}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova tarefa</DialogTitle>
            <DialogDescription>
              Preencha o essencial. A assistente completa o resto quando precisar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              placeholder="Título da tarefa"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <Textarea
              placeholder="Descrição (opcional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
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
            <div className="flex flex-wrap gap-1.5">
              {PRIORITIES.map((p) => (
                <GhostButton
                  key={p}
                  active={form.priority === p}
                  onClick={() => setForm({ ...form, priority: p })}
                >
                  {p}
                </GhostButton>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={form.projectId}
                onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none"
              >
                <option value="">Sem projeto</option>
                {app.projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <Input
                placeholder="Categoria"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <PrimaryButton onClick={create}>Criar tarefa</PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
