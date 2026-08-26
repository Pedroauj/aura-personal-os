import { createFileRoute } from "@tanstack/react-router";
import { FolderKanban, Plus } from "lucide-react";
import { useState } from "react";
import { EmptyState, ProjectCard, SectionTitle, TaskCard } from "@/components/cards";
import { GhostButton, PageHeader, PrimaryButton } from "@/components/page-header";
import { useApp } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/projetos")({
  head: () => ({
    meta: [
      { title: "Projetos — Aurora" },
      {
        name: "description",
        content:
          "Organize projetos com tarefas, notas, prazos e progresso visual em um só lugar.",
      },
      { property: "og:title", content: "Projetos — Aurora" },
      {
        property: "og:description",
        content: "Tarefas, notas, prazos e progresso de cada projeto.",
      },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const app = useApp();
  const [selected, setSelected] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", deadline: "" });

  const project = app.projects.find((p) => p.id === selected) ?? null;
  const projectTasks = (id: string) => app.tasks.filter((t) => t.projectId === id);

  const create = () => {
    if (!form.name.trim()) return;
    app.addProject({
      name: form.name.trim(),
      description: form.description,
      deadline: form.deadline || undefined,
    });
    toast.success("Projeto criado");
    setForm({ name: "", description: "", deadline: "" });
    setOpen(false);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:px-8 md:py-12">
      <PageHeader
        title="Projetos"
        subtitle="Cada projeto reúne tarefas, notas, prazos e progresso."
        action={
          <PrimaryButton onClick={() => setOpen(true)}>
            <Plus className="size-4" /> Novo projeto
          </PrimaryButton>
        }
      />

      <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {app.projects.map((p) => {
          const tasks = projectTasks(p.id);
          return (
            <button key={p.id} onClick={() => setSelected(p.id)} className="text-left">
              <ProjectCard
                project={p}
                total={tasks.length}
                done={tasks.filter((t) => t.status === "concluido").length}
              />
            </button>
          );
        })}
      </div>

      {project && (
        <div className="mt-12">
          <div className="flex items-center gap-3">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: project.color }}
            />
            <h2 className="text-xl font-semibold">{project.name}</h2>
            <GhostButton onClick={() => setSelected(null)}>Fechar</GhostButton>
          </div>
          <p className="mt-1.5 text-[13px] text-muted-foreground">{project.description}</p>

          <div className="mt-6 grid gap-8 lg:grid-cols-2">
            <div>
              <SectionTitle title="Tarefas" count={projectTasks(project.id).length} />
              {projectTasks(project.id).length === 0 ? (
                <EmptyState icon={FolderKanban} title="Sem tarefas neste projeto" />
              ) : (
                <div className="space-y-2.5">
                  {projectTasks(project.id).map((t) => (
                    <TaskCard key={t.id} task={t} onToggle={() => app.toggleTask(t.id)} />
                  ))}
                </div>
              )}
            </div>
            <div>
              <SectionTitle title="Notas relacionadas" />
              <div className="space-y-2.5">
                {app.notes
                  .filter((n) =>
                    `${n.title} ${n.content} ${n.category}`
                      .toLowerCase()
                      .includes((project.name.split(" ")[0] ?? "").toLowerCase()),
                  )
                  .map((n) => (
                    <div key={n.id} className="surface-card px-4 py-3.5">
                      <p className="text-[14px] font-medium">{n.title}</p>
                      <p className="mt-1 line-clamp-2 text-[13px] text-muted-foreground">
                        {n.content}
                      </p>
                    </div>
                  ))}
                <div className="surface-card px-4 py-3.5">
                  <p className="text-[13px] text-muted-foreground">
                    Arquivos e conversas relacionadas ao projeto aparecerão aqui.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo projeto</DialogTitle>
            <DialogDescription>Dê um nome e, se quiser, um prazo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Nome do projeto"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Textarea
              placeholder="Descrição"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <Input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </div>
          <DialogFooter>
            <PrimaryButton onClick={create}>Criar projeto</PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
