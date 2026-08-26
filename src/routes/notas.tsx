import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, StickyNote } from "lucide-react";
import { useState } from "react";
import { EmptyState, NoteCard, SectionTitle } from "@/components/cards";
import { PageHeader, PrimaryButton } from "@/components/page-header";
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
import type { Note } from "@/lib/types";

export const Route = createFileRoute("/notas")({
  head: () => ({
    meta: [
      { title: "Notas — Aurora" },
      {
        name: "description",
        content:
          "Notas simples e elegantes que a assistente usa como contexto para responder suas perguntas.",
      },
      { property: "og:title", content: "Notas — Aurora" },
      {
        property: "og:description",
        content: "Crie, fixe e pesquise notas que a IA usa como contexto.",
      },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const app = useApp();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [form, setForm] = useState({ title: "", content: "", category: "Geral" });

  const filtered = app.notes.filter((n) =>
    `${n.title} ${n.content} ${n.category}`.toLowerCase().includes(query.toLowerCase()),
  );
  const pinned = filtered.filter((n) => n.pinned);
  const rest = filtered.filter((n) => !n.pinned);

  const openNew = () => {
    setEditing(null);
    setForm({ title: "", content: "", category: "Geral" });
    setOpen(true);
  };

  const openEdit = (note: Note) => {
    setEditing(note);
    setForm({ title: note.title, content: note.content, category: note.category });
    setOpen(true);
  };

  const save = () => {
    if (!form.title.trim()) return;
    if (editing) {
      app.updateNote(editing.id, form);
      toast.success("Nota atualizada");
    } else {
      app.addNote({ ...form, title: form.title.trim() });
      toast.success("Nota criada");
    }
    setOpen(false);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:px-8 md:py-12">
      <PageHeader
        title="Notas"
        subtitle="A assistente usa suas notas como contexto nas respostas."
        action={
          <PrimaryButton onClick={openNew}>
            <Plus className="size-4" /> Nova nota
          </PrimaryButton>
        }
      />

      <div className="surface-card mt-8 flex items-center gap-2 px-3 py-2">
        <Search className="size-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar notas..."
          className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="mt-8 space-y-8">
        {pinned.length > 0 && (
          <div>
            <SectionTitle title="Fixadas" count={pinned.length} />
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {pinned.map((n) => (
                <NoteCard
                  key={n.id}
                  note={n}
                  onClick={() => openEdit(n)}
                  onPin={() => app.updateNote(n.id, { pinned: false })}
                  onDelete={() => app.removeNote(n.id)}
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <SectionTitle title="Todas as notas" count={rest.length} />
          {rest.length === 0 ? (
            <EmptyState icon={StickyNote} title="Nenhuma nota encontrada" />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((n) => (
                <NoteCard
                  key={n.id}
                  note={n}
                  onClick={() => openEdit(n)}
                  onPin={() => app.updateNote(n.id, { pinned: true })}
                  onDelete={() => app.removeNote(n.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar nota" : "Nova nota"}</DialogTitle>
            <DialogDescription>
              Notas ficam disponíveis para a assistente responder depois.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Título"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <Textarea
              rows={7}
              placeholder="Escreva aqui..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
            <Input
              placeholder="Categoria"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </div>
          <DialogFooter>
            <PrimaryButton onClick={save}>
              {editing ? "Salvar alterações" : "Criar nota"}
            </PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
