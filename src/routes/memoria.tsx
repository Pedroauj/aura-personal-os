import { createFileRoute } from "@tanstack/react-router";
import { Brain, Plus, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { EmptyState, MEMORY_LABEL, SectionTitle } from "@/components/cards";
import { PageHeader, PrimaryButton, GhostButton } from "@/components/page-header";
import { useApp } from "@/lib/store";
import { relativeDay } from "@/lib/format";
import type { MemoryItem, MemoryKind } from "@/lib/types";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/memoria")({
  head: () => ({
    meta: [
      { title: "Memória — Aurora" },
      {
        name: "description",
        content:
          "Veja, edite e remova tudo o que a assistente aprendeu sobre você: preferências, pessoas, trabalho e rotina.",
      },
      { property: "og:title", content: "Memória — Aurora" },
      {
        property: "og:description",
        content: "Controle total sobre o que a assistente lembra de você.",
      },
    ],
  }),
  component: MemoryPage,
});

const KINDS: MemoryKind[] = ["preferencia", "pessoa", "trabalho", "rotina", "outro"];

function MemoryPage() {
  const app = useApp();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ content: "", kind: "preferencia" as MemoryKind });
  const [editing, setEditing] = useState<MemoryItem | null>(null);
  const [draft, setDraft] = useState("");

  const save = () => {
    if (!form.content.trim()) return;
    app.addMemory({ content: form.content.trim(), kind: form.kind, source: "manual" });
    toast.success("Memória adicionada");
    setForm({ content: "", kind: "preferencia" });
    setOpen(false);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8 md:px-8 md:py-12">
      <PageHeader
        title="Memória"
        subtitle="O que a assistente aprendeu sobre você. Sempre sob seu controle."
        action={
          <PrimaryButton onClick={() => setOpen(true)}>
            <Plus className="size-4" /> Adicionar
          </PrimaryButton>
        }
      />

      <div className="mt-8 space-y-8">
        {app.memories.length === 0 && (
          <EmptyState icon={Brain} title="Nenhuma memória guardada" />
        )}
        {KINDS.map((kind) => {
          const items = app.memories.filter((m) => m.kind === kind);
          if (!items.length) return null;
          return (
            <div key={kind}>
              <SectionTitle title={MEMORY_LABEL[kind]} count={items.length} />
              <div className="space-y-2.5">
                {items.map((m) => (
                  <div
                    key={m.id}
                    className="lift group surface-card animate-pop flex items-start gap-3 px-4 py-3.5"
                  >
                    <Brain className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      {editing?.id === m.id ? (
                        <div className="flex gap-2">
                          <input
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            className="flex-1 border-b border-border bg-transparent pb-1 text-[14px] outline-none"
                          />
                          <GhostButton
                            onClick={() => {
                              app.updateMemory(m.id, { content: draft });
                              setEditing(null);
                            }}
                          >
                            Salvar
                          </GhostButton>
                        </div>
                      ) : (
                        <p className="text-[14px] leading-snug">{m.content}</p>
                      )}
                      <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                        {m.source === "assistente" ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-primary/12 px-1.5 py-0.5 text-primary">
                            <Sparkles className="size-2.5" /> salvo pela assistente
                          </span>
                        ) : (
                          <span className="rounded-md bg-secondary px-1.5 py-0.5">
                            adicionado por você
                          </span>
                        )}
                        <span>{relativeDay(m.createdAt)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setEditing(m);
                        setDraft(m.content);
                      }}
                      className="rounded-md px-2 py-1 text-[11px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => app.removeMemory(m.id)}
                      aria-label="Excluir memória"
                      className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova memória</DialogTitle>
            <DialogDescription>
              Informações que a assistente deve considerar sempre.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Ex.: prefiro reuniões pela manhã"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
            <div className="flex flex-wrap gap-1.5">
              {KINDS.map((k) => (
                <GhostButton
                  key={k}
                  active={form.kind === k}
                  onClick={() => setForm({ ...form, kind: k })}
                >
                  {MEMORY_LABEL[k]}
                </GhostButton>
              ))}
            </div>
          </div>
          <DialogFooter>
            <PrimaryButton onClick={save}>Guardar</PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
