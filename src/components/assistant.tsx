import { useNavigate } from "@tanstack/react-router";
import { ArrowUp, Check, Sparkles, X, type LucideIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useApp, uid } from "@/lib/store";
import { respond } from "@/lib/assistant";
import { isoToday } from "@/lib/format";
import type { ChatMessage, MemoryItem, Proposal, Reminder, Task } from "@/lib/types";
import { USER } from "@/lib/mock-data";

export function useAssistant() {
  const app = useApp();
  const { pushMessage, setProposalState } = app;
  const [thinking, setThinking] = useState(false);

  const send = useCallback(
    (text: string) => {
      const clean = text.trim();
      if (!clean) return;
      pushMessage({
        id: uid("msg"),
        role: "user",
        content: clean,
        createdAt: new Date().toISOString(),
      });
      setThinking(true);
      const ctx = {
        tasks: app.tasks,
        events: app.events,
        reminders: app.reminders,
        notes: app.notes,
        memories: app.memories,
      };
      window.setTimeout(() => {
        const reply = respond(clean, ctx);
        pushMessage({
          id: uid("msg"),
          role: "assistant",
          content: reply.content,
          createdAt: new Date().toISOString(),
          proposal: reply.proposal,
          proposalState: reply.proposal ? "pending" : undefined,
        });
        setThinking(false);
      }, 620);
    },
    [app.tasks, app.events, app.reminders, app.notes, app.memories, pushMessage],
  );

  const accept = useCallback(
    (messageId: string, proposal: Proposal) => {
      const p = proposal.payload as {
        date?: string;
        time?: string;
        priority?: Task["priority"];
        repeat?: Reminder["repeat"];
        category?: string;
        content?: string;
        kind?: MemoryItem["kind"];
      };
      switch (proposal.kind) {
        case "task":
          app.addTask({
            title: proposal.title,
            date: p.date,
            priority: p.priority ?? "media",
          });
          break;
        case "reminder":
          app.addReminder({
            title: proposal.title,
            date: p.date ?? isoToday(),
            time: p.time ?? "09:00",
            repeat: p.repeat ?? "once",
          });
          break;
        case "event":
          app.addEvent({
            title: proposal.title,
            date: p.date ?? isoToday(),
            time: p.time ?? "09:00",
            durationMin: 60,
            category: p.category ?? "Geral",
          });
          break;
        case "note":
          app.addNote({
            title: proposal.title,
            content: p.content ?? proposal.title,
            category: p.category ?? "Geral",
          });
          break;
        case "memory":
          app.addMemory({
            content: proposal.title,
            kind: p.kind ?? "outro",
            source: "assistente",
          });
          break;
        case "plan":
          proposal.planItems?.forEach((item) =>
            app.addEvent({
              title: item.title,
              date: p.date ?? isoToday(),
              time: item.time,
              durationMin: 60,
              category: "Planejamento",
            }),
          );
          break;
      }
      setProposalState(messageId, "accepted");
    },
    [app, setProposalState],
  );

  return { send, accept, thinking, cancel: setProposalState };
}

const KIND_LABEL: Record<Proposal["kind"], string> = {
  task: "Criar tarefa",
  reminder: "Criar lembrete",
  event: "Agendar compromisso",
  note: "Salvar nota",
  memory: "Guardar na memória",
  plan: "Programação sugerida",
};

export function ProposalCard({
  proposal,
  state,
  onAccept,
  onCancel,
}: {
  proposal: Proposal;
  state?: ChatMessage["proposalState"];
  onAccept: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="animate-pop mt-3 max-w-md rounded-xl border border-border-strong bg-surface-2 p-4">
      <p className="text-[11px] font-medium tracking-wide text-primary uppercase">
        {KIND_LABEL[proposal.kind]}
      </p>
      <p className="mt-1.5 text-[14px] font-medium">{proposal.title}</p>
      {proposal.subtitle && (
        <p className="mt-0.5 text-[12px] text-muted-foreground">{proposal.subtitle}</p>
      )}

      {proposal.planItems && (
        <ul className="mt-3 space-y-1.5">
          {proposal.planItems.map((item, i) => (
            <li key={i} className="flex gap-3 text-[13px]">
              <span className="w-11 shrink-0 tabular-nums text-muted-foreground">
                {item.time}
              </span>
              <span className="min-w-0 flex-1 truncate">{item.title}</span>
            </li>
          ))}
        </ul>
      )}

      {state === "accepted" ? (
        <p className="mt-4 inline-flex items-center gap-1.5 text-[12px] text-success">
          <Check className="size-3.5" /> Adicionado
        </p>
      ) : state === "cancelled" ? (
        <p className="mt-4 text-[12px] text-muted-foreground">Cancelado</p>
      ) : (
        <div className="mt-4 flex gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-border px-3 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            Cancelar
          </button>
          <button
            onClick={onAccept}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Check className="size-3.5" />
            Confirmar
          </button>
        </div>
      )}
    </div>
  );
}

export function AssistantMessage({
  message,
  onAccept,
  onCancel,
}: {
  message: ChatMessage;
  onAccept: () => void;
  onCancel: () => void;
}) {
  const isUser = message.role === "user";
  return (
    <div className={cn("animate-pop flex gap-3", isUser && "justify-end")}>
      {!isUser && (
        <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Sparkles className="size-3.5" />
        </div>
      )}
      <div className={cn("max-w-[min(680px,88%)]", isUser && "flex flex-col items-end")}>
        <div
          className={cn(
            "text-[14px] leading-relaxed whitespace-pre-line",
            isUser
              ? "rounded-2xl rounded-br-md bg-secondary px-4 py-2.5"
              : "text-foreground/90",
          )}
        >
          {message.content}
        </div>
        {message.proposal && (
          <ProposalCard
            proposal={message.proposal}
            state={message.proposalState}
            onAccept={onAccept}
            onCancel={onCancel}
          />
        )}
      </div>
      {isUser && (
        <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-[10px] font-semibold">
          {USER.initials}
        </div>
      )}
    </div>
  );
}

export function ThinkingBubble() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
        <Sparkles className="size-3.5" />
      </div>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="animate-soft-pulse size-1.5 rounded-full bg-muted-foreground"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export function Composer({
  onSubmit,
  placeholder = "Pergunte, peça ou organize qualquer coisa...",
  large = false,
  autoFocus = false,
}: {
  onSubmit: (text: string) => void;
  placeholder?: string;
  large?: boolean;
  autoFocus?: boolean;
}) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [value]);

  const submit = () => {
    if (!value.trim()) return;
    onSubmit(value);
    setValue("");
  };

  return (
    <div
      className={cn(
        "surface-card flex items-end gap-2 p-2.5 transition-colors focus-within:border-border-strong",
        large && "p-3",
      )}
    >
      <textarea
        ref={ref}
        rows={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder={placeholder}
        className={cn(
          "max-h-44 flex-1 resize-none bg-transparent px-2 py-1.5 text-[14px] outline-none placeholder:text-muted-foreground",
          large && "text-[15px]",
        )}
      />
      <button
        onClick={submit}
        disabled={!value.trim()}
        aria-label="Enviar"
        className="press flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:bg-secondary disabled:text-muted-foreground disabled:transform-none"
      >
        <ArrowUp className="size-4" />
      </button>
    </div>
  );
}

export function QuickAction({
  label,
  icon: Icon,
  onClick,
  delay,
}: {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  delay?: number;
}) {
  return (
    <button
      onClick={onClick}
      style={delay !== undefined ? { animationDelay: `${delay}ms` } : undefined}
      className="press animate-pop inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-1.5 text-[13px] text-muted-foreground hover:border-border-strong hover:text-foreground"
    >
      {Icon && <Icon className="size-3.5" />}
      {label}
    </button>
  );
}

export function DismissIcon() {
  return <X className="size-3.5" />;
}

export function useNavigateTo() {
  const navigate = useNavigate();
  return (to: string) => navigate({ to });
}
