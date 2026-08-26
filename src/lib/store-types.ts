import type {
  CalendarEvent,
  ChatMessage,
  InboxItem,
  MemoryItem,
  Note,
  Project,
  Reminder,
  Task,
} from "./types";

export interface AppState {
  tasks: Task[];
  events: CalendarEvent[];
  reminders: Reminder[];
  notes: Note[];
  memories: MemoryItem[];
  projects: Project[];
  inbox: InboxItem[];
  messages: ChatMessage[];
}

export interface AppContextValue extends AppState {
  addTask: (t: Partial<Task> & { title: string }) => Task;
  updateTask: (id: string, patch: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  addEvent: (e: Partial<CalendarEvent> & { title: string }) => CalendarEvent;
  addReminder: (r: Partial<Reminder> & { title: string }) => Reminder;
  toggleReminder: (id: string) => void;
  removeReminder: (id: string) => void;
  addNote: (n: Partial<Note> & { title: string }) => Note;
  updateNote: (id: string, patch: Partial<Note>) => void;
  removeNote: (id: string) => void;
  addMemory: (m: Partial<MemoryItem> & { content: string }) => MemoryItem;
  updateMemory: (id: string, patch: Partial<MemoryItem>) => void;
  removeMemory: (id: string) => void;
  addProject: (p: Partial<Project> & { name: string }) => Project;
  addInbox: (content: string) => InboxItem;
  removeInbox: (id: string) => void;
  promoteInbox: (id: string) => void;
  pushMessage: (m: ChatMessage) => void;
  setProposalState: (id: string, state: "accepted" | "cancelled") => void;
}

