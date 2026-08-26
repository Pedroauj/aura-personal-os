import {
  Bell,
  Check,
  Clock,
  MapPin,
  Pin,
  Repeat,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { relativeDay } from "@/lib/format";
import type {
  CalendarEvent,
  MemoryItem,
  Note,
  Priority,
  Project,
  Reminder,
  Task,
} from "@/lib/types";

export const PRIORITY_LABEL: Record<Priority, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  urgente: "Urgente",
};

export const PRIORITY_STYLE: Record<Priority, string> = {
  baixa: "text-muted-foreground bg-secondary",
  media: "text-info bg-info/10",
  alta: "text-warning bg-warning/10",
  urgente: "text-destructive bg-destructive/10",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={cn(
        "rounded-md px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase",
        PRIORITY_STYLE[priority],
      )}
    >
      {PRIORITY_LABEL[priority]}
    </span>
  );
}

export function SectionTitle({
  title,
  count,
  action,
}: {
  title: string;
  count?: number | undefined;
  action?: React.ReactNode | undefined;
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <h2 className="text-[13px] font-medium tracking-wide text-muted-foreground uppercase">
        {title}
      </h2>
      {count !== undefined && (
        <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] text-muted-foreground">
          {count}
        </span>
      )}
      <div className="ml-auto">{action}</div>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string | undefined;
  action?: { label: string; onClick: () => void } | undefined;
}) {
  return (
    <div className="surface-card flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <div className="flex size-10 items-center justify-center rounded-xl bg-secondary">
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        {description && (
          <p className="mt-1 max-w-sm text-[13px] text-muted-foreground">{description}</p>
        )}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="press mt-1 rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export function TaskCard({
  task,
  projectName,
  onToggle,
  onDelete,
}: {
  task: Task;
  projectName?: string | undefined;
  onToggle?: (() => void) | undefined;
  onDelete?: (() => void) | undefined;
}) {
  const done = task.status === "concluido";
  const doneSubs = task.subtasks.filter((s) => s.done).length;
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div
      className={cn(
        "lift group surface-card animate-pop flex items-start gap-3 px-4 py-3.5",
        done && "opacity-55",
      )}
    >
      {/* Touch target mínimo 44×44px via padding negativo */}
      <button
        onClick={onToggle}
        aria-label={done ? "Reabrir tarefa" : "Concluir tarefa"}
        className={cn(
          "relative mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-md border transition-all duration-200",
          "before:absolute before:-inset-3 before:content-['']",
          done
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border-strong hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        )}
      >
        {done && <Check className="animate-check size-3" />}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-[14px] leading-snug font-medium",
            done && "text-muted-foreground line-through",
          )}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="mt-1 line-clamp-2 text-[13px] text-muted-foreground">
            {task.description}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <PriorityBadge priority={task.priority} />
          {task.date && (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" />
              {relativeDay(task.date)}
              {task.time ? ` • ${task.time}` : ""}
            </span>
          )}
          {projectName && (
            <span className="rounded-md bg-secondary px-1.5 py-0.5">{projectName}</span>
          )}
          {task.subtasks.length > 0 && (
            <span>
              {doneSubs}/{task.subtasks.length} subtarefas
            </span>
          )}
        </div>
      </div>

      {onDelete && (
        confirmDelete ? (
          <div className="animate-pop flex items-center gap-1.5">
            <button
              onClick={() => setConfirmDelete(false)}
              className="rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:bg-secondary"
            >
              Não
            </button>
            <button
              onClick={() => { onDelete(); setConfirmDelete(false); }}
              className="rounded-md bg-destructive/15 px-2 py-1 text-[11px] font-medium text-destructive hover:bg-destructive/25"
            >
              Sim, excluir
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            aria-label="Excluir tarefa"
            className="relative rounded-md p-2 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive focus-visible:opacity-100"
          >
            <Trash2 className="size-3.5" />
          </button>
        )
      )}
    </div>
  );
}

export function EventCard({ event }: { event: CalendarEvent }) {
  return (
    <div className="lift surface-card animate-pop px-4 py-3.5">
      <div className="flex items-start gap-3">
        <div className="w-14 shrink-0">
          <p className="text-[13px] font-semibold tabular-nums">{event.time}</p>
          <p className="text-[11px] text-muted-foreground">{event.durationMin}min</p>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] leading-snug font-medium">{event.title}</p>
          {event.description && (
            <p className="mt-1 text-[13px] text-muted-foreground">{event.description}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span className="rounded-md bg-secondary px-1.5 py-0.5">{event.category}</span>
            {event.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" />
                {event.location}
              </span>
            )}
            {event.reminderMin && (
              <span className="inline-flex items-center gap-1">
                <Bell className="size-3" />
                {event.reminderMin}min antes
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const REPEAT_LABEL: Record<Reminder["repeat"], string> = {
  once: "Uma vez",
  daily: "Todos os dias",
  weekly: "Toda semana",
  monthly: "Todo mês",
};

export function ReminderCard({
  reminder,
  onToggle,
  onDelete,
}: {
  reminder: Reminder;
  onToggle?: (() => void) | undefined;
  onDelete?: (() => void) | undefined;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  return (
    <div
      className={cn(
        "lift group surface-card animate-pop flex items-center gap-3 px-4 py-3.5",
        reminder.done && "opacity-55",
      )}
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
        <Bell className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-[14px] font-medium",
            reminder.done && "text-muted-foreground line-through",
          )}
        >
          {reminder.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <span>
            {relativeDay(reminder.date)} • {reminder.time}
          </span>
          {reminder.repeat !== "once" && (
            <span className="inline-flex items-center gap-1">
              <Repeat className="size-3" />
              {REPEAT_LABEL[reminder.repeat]}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={onToggle}
        className="rounded-md px-2 py-1.5 text-[12px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        {reminder.done ? "Reabrir" : "Concluir"}
      </button>
      {onDelete && (
        confirmDelete ? (
          <div className="animate-pop flex items-center gap-1.5">
            <button onClick={() => setConfirmDelete(false)} className="rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:bg-secondary">Não</button>
            <button onClick={() => { onDelete(); setConfirmDelete(false); }} className="rounded-md bg-destructive/15 px-2 py-1 text-[11px] font-medium text-destructive hover:bg-destructive/25">Excluir</button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            aria-label="Excluir lembrete"
            className="rounded-md p-2 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive focus-visible:opacity-100"
          >
            <Trash2 className="size-3.5" />
          </button>
        )
      )}
    </div>
  );
}

export function ProjectCard({
  project,
  total,
  done,
}: {
  project: Project;
  total: number;
  done: number;
}) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div
      className="lift surface-card animate-pop overflow-hidden p-5"
      style={{ borderLeft: `3px solid ${project.color}` }}
    >
      <div className="flex items-center gap-2.5">
        <p className="flex-1 truncate text-[15px] font-medium">{project.name}</p>
        <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground uppercase">
          {project.status}
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-[13px] text-muted-foreground">
        {project.description}
      </p>
      <div className="mt-5">
        <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            {done} de {total} tarefas
          </span>
          <span className="tabular-nums">{pct}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className="animate-bar h-full rounded-full"
            style={{ width: `${pct}%`, backgroundColor: project.color }}
          />
        </div>
      </div>
      {project.deadline && (
        <p className="mt-3 text-[11px] text-muted-foreground">
          Prazo: {relativeDay(project.deadline)}
        </p>
      )}
    </div>
  );
}

function NoteDeleteButton({ onDelete }: { onDelete: () => void }) {
  const [confirm, setConfirm] = useState(false);
  return confirm ? (
    <div className="animate-pop flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <button onClick={() => setConfirm(false)} className="rounded-md px-1.5 py-0.5 text-[11px] text-muted-foreground hover:bg-secondary">Não</button>
      <button onClick={onDelete} className="rounded-md bg-destructive/15 px-1.5 py-0.5 text-[11px] font-medium text-destructive hover:bg-destructive/25">Sim</button>
    </div>
  ) : (
    <button
      onClick={(e) => { e.stopPropagation(); setConfirm(true); }}
      aria-label="Excluir nota"
      className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive focus-visible:opacity-100"
    >
      <Trash2 className="size-3.5" />
    </button>
  );
}

export function NoteCard({
  note,
  onPin,
  onDelete,
  onClick,
}: {
  note: Note;
  onPin?: (() => void) | undefined;
  onDelete?: (() => void) | undefined;
  onClick?: (() => void) | undefined;
}) {
  return (
    <div
      onClick={onClick}
      className="lift group surface-card animate-pop cursor-pointer p-5"
    >
      <div className="flex items-start gap-2">
        <p className="flex-1 text-[14px] font-medium">{note.title}</p>
        <button
          onClick={(e) => { e.stopPropagation(); onPin?.(); }}
          aria-label="Fixar nota"
          className={cn(
            "rounded-md p-1.5 transition-colors",
            note.pinned
              ? "text-primary"
              : "text-muted-foreground opacity-0 group-hover:opacity-100",
          )}
        >
          <Pin className="size-3.5" />
        </button>
        {onDelete && (
          <NoteDeleteButton onDelete={onDelete} />
        )}
      </div>
      <p className="mt-2 line-clamp-4 text-[13px] leading-relaxed text-muted-foreground">
        {note.content}
      </p>
      <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="rounded-md bg-secondary px-1.5 py-0.5">{note.category}</span>
        <span>{relativeDay(note.updatedAt)}</span>
      </div>
    </div>
  );
}

export const MEMORY_LABEL: Record<MemoryItem["kind"], string> = {
  preferencia: "Preferências",
  pessoa: "Pessoas",
  trabalho: "Trabalho",
  rotina: "Rotina",
  outro: "Outros",
};
