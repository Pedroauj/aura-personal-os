import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Brain,
  CalendarDays,
  CheckSquare,
  FolderKanban,
  Sparkles,
  StickyNote,
  Plus,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useApp } from "@/lib/store";
import { relativeDay } from "@/lib/format";

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const { tasks, notes, projects, events, memories } = useApp();

  const go = (to: string) => {
    onOpenChange(false);
    navigate({ to });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Pesquisar ou executar um comando..." />
      <CommandList className="max-h-[420px]">
        <CommandEmpty>Nada encontrado.</CommandEmpty>

        <CommandGroup heading="Comandos rápidos">
          <CommandItem onSelect={() => go("/tarefas")}>
            <Plus className="size-4" /> Criar tarefa
          </CommandItem>
          <CommandItem onSelect={() => go("/lembretes")}>
            <Bell className="size-4" /> Novo lembrete
          </CommandItem>
          <CommandItem onSelect={() => go("/projetos")}>
            <FolderKanban className="size-4" /> Novo projeto
          </CommandItem>
          <CommandItem onSelect={() => go("/calendario")}>
            <CalendarDays className="size-4" /> Abrir calendário
          </CommandItem>
          <CommandItem onSelect={() => go("/assistente")}>
            <Sparkles className="size-4" /> Perguntar para assistente
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Tarefas">
          {tasks.slice(0, 6).map((t) => (
            <CommandItem key={t.id} value={`tarefa ${t.title}`} onSelect={() => go("/tarefas")}>
              <CheckSquare className="size-4" />
              <span className="truncate">{t.title}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {relativeDay(t.date)}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Notas">
          {notes.slice(0, 4).map((n) => (
            <CommandItem key={n.id} value={`nota ${n.title}`} onSelect={() => go("/notas")}>
              <StickyNote className="size-4" />
              <span className="truncate">{n.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Projetos">
          {projects.map((p) => (
            <CommandItem
              key={p.id}
              value={`projeto ${p.name}`}
              onSelect={() => go("/projetos")}
            >
              <FolderKanban className="size-4" />
              <span className="truncate">{p.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Eventos">
          {events.slice(0, 4).map((e) => (
            <CommandItem
              key={e.id}
              value={`evento ${e.title}`}
              onSelect={() => go("/calendario")}
            >
              <CalendarDays className="size-4" />
              <span className="truncate">{e.title}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {relativeDay(e.date)} • {e.time}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Memórias">
          {memories.slice(0, 4).map((m) => (
            <CommandItem
              key={m.id}
              value={`memoria ${m.content}`}
              onSelect={() => go("/memoria")}
            >
              <Brain className="size-4" />
              <span className="truncate">{m.content}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
