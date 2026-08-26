export type Priority = "baixa" | "media" | "alta" | "urgente";
export type TaskStatus = "pendente" | "andamento" | "concluido" | "cancelado";

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string | undefined;
  /** ISO date: yyyy-mm-dd */
  date?: string | undefined;
  time?: string | undefined;
  priority: Priority;
  status: TaskStatus;
  projectId?: string | undefined;
  category?: string | undefined;
  subtasks: Subtask[];
  notes?: string | undefined;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  durationMin: number;
  description?: string | undefined;
  category: string;
  location?: string | undefined;
  reminderMin?: number | undefined;
}

export type ReminderRepeat = "once" | "daily" | "weekly" | "monthly";

export interface Reminder {
  id: string;
  title: string;
  date: string;
  time: string;
  repeat: ReminderRepeat;
  done: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  pinned: boolean;
  updatedAt: string;
}

export type MemoryKind = "preferencia" | "pessoa" | "trabalho" | "rotina" | "outro";

export interface MemoryItem {
  id: string;
  kind: MemoryKind;
  content: string;
  source: "manual" | "assistente";
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  deadline?: string | undefined;
  status: "ativo" | "pausado" | "concluido";
}

export interface InboxItem {
  id: string;
  content: string;
  createdAt: string;
  processed: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  proposal?: Proposal | undefined;
  proposalState?: "pending" | "accepted" | "cancelled" | undefined;
}

export type ProposalKind = "task" | "reminder" | "event" | "note" | "memory" | "plan";

export interface Proposal {
  kind: ProposalKind;
  title: string;
  subtitle?: string | undefined;
  payload: Record<string, unknown>;
  planItems?: { time: string; title: string }[];
}
