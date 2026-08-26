import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
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
import { isoToday } from "./format";

let counter = 0;
export const uid = (prefix = "id") => `${prefix}_${Date.now().toString(36)}_${counter++}`;

const STORAGE_PREFIX = "aurora:";

/** Estado persistido no dispositivo do usuário (sem dados de exemplo). */
function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      /* armazenamento indisponível */
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch {
      /* armazenamento indisponível */
    }
  }, [key, value, hydrated]);

  return [value, setValue] as const;
}


interface AppState {
  tasks: Task[];
  events: CalendarEvent[];
  reminders: Reminder[];
  notes: Note[];
  memories: MemoryItem[];
  projects: Project[];
  inbox: InboxItem[];
  messages: ChatMessage[];
}

interface AppContextValue extends AppState {
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

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(seed.tasks);
  const [events, setEvents] = useState<CalendarEvent[]>(seed.events);
  const [reminders, setReminders] = useState<Reminder[]>(seed.reminders);
  const [notes, setNotes] = useState<Note[]>(seed.notes);
  const [memories, setMemories] = useState<MemoryItem[]>(seed.memories);
  const [projects, setProjects] = useState<Project[]>(seed.projects);
  const [inbox, setInbox] = useState<InboxItem[]>(seed.inbox);
  const [messages, setMessages] = useState<ChatMessage[]>(seed.initialMessages);

  const addTask = useCallback((t: Partial<Task> & { title: string }) => {
    const task: Task = {
      id: uid("t"),
      priority: "media",
      status: "pendente",
      subtasks: [],
      createdAt: isoToday(),
      ...t,
    };
    setTasks((prev) => [task, ...prev]);
    return task;
  }, []);

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "concluido" ? "pendente" : "concluido" }
          : t,
      ),
    );
  }, []);

  const removeTask = useCallback(
    (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id)),
    [],
  );

  const addEvent = useCallback((e: Partial<CalendarEvent> & { title: string }) => {
    const ev: CalendarEvent = {
      id: uid("e"),
      date: isoToday(),
      time: "09:00",
      durationMin: 60,
      category: "Geral",
      ...e,
    };
    setEvents((prev) => [...prev, ev]);
    return ev;
  }, []);

  const addReminder = useCallback((r: Partial<Reminder> & { title: string }) => {
    const rem: Reminder = {
      id: uid("r"),
      date: isoToday(),
      time: "09:00",
      repeat: "once",
      done: false,
      ...r,
    };
    setReminders((prev) => [rem, ...prev]);
    return rem;
  }, []);

  const toggleReminder = useCallback((id: string) => {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, done: !r.done } : r)));
  }, []);

  const removeReminder = useCallback(
    (id: string) => setReminders((prev) => prev.filter((r) => r.id !== id)),
    [],
  );

  const addNote = useCallback((n: Partial<Note> & { title: string }) => {
    const note: Note = {
      id: uid("n"),
      content: "",
      category: "Geral",
      pinned: false,
      updatedAt: isoToday(),
      ...n,
    };
    setNotes((prev) => [note, ...prev]);
    return note;
  }, []);

  const updateNote = useCallback((id: string, patch: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: isoToday() } : n)),
    );
  }, []);

  const removeNote = useCallback(
    (id: string) => setNotes((prev) => prev.filter((n) => n.id !== id)),
    [],
  );

  const addMemory = useCallback((m: Partial<MemoryItem> & { content: string }) => {
    const mem: MemoryItem = {
      id: uid("m"),
      kind: "outro",
      source: "manual",
      createdAt: isoToday(),
      ...m,
    };
    setMemories((prev) => [mem, ...prev]);
    return mem;
  }, []);

  const updateMemory = useCallback((id: string, patch: Partial<MemoryItem>) => {
    setMemories((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  const removeMemory = useCallback(
    (id: string) => setMemories((prev) => prev.filter((m) => m.id !== id)),
    [],
  );

  const addProject = useCallback((p: Partial<Project> & { name: string }) => {
    const proj: Project = {
      id: uid("p"),
      description: "",
      color: "var(--primary)",
      status: "ativo",
      ...p,
    };
    setProjects((prev) => [...prev, proj]);
    return proj;
  }, []);

  const addInbox = useCallback((content: string) => {
    const item: InboxItem = {
      id: uid("i"),
      content,
      createdAt: isoToday(),
      processed: false,
    };
    setInbox((prev) => [item, ...prev]);
    return item;
  }, []);

  const removeInbox = useCallback(
    (id: string) => setInbox((prev) => prev.filter((i) => i.id !== id)),
    [],
  );

  const promoteInbox = useCallback(
    (id: string) => {
      setInbox((prev) => {
        const item = prev.find((i) => i.id === id);
        if (item) addTask({ title: item.content, category: "Inbox" });
        return prev.filter((i) => i.id !== id);
      });
    },
    [addTask],
  );

  const pushMessage = useCallback(
    (m: ChatMessage) => setMessages((prev) => [...prev, m]),
    [],
  );

  const setProposalState = useCallback(
    (id: string, state: "accepted" | "cancelled") =>
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, proposalState: state } : m)),
      ),
    [],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      tasks,
      events,
      reminders,
      notes,
      memories,
      projects,
      inbox,
      messages,
      addTask,
      updateTask,
      toggleTask,
      removeTask,
      addEvent,
      addReminder,
      toggleReminder,
      removeReminder,
      addNote,
      updateNote,
      removeNote,
      addMemory,
      updateMemory,
      removeMemory,
      addProject,
      addInbox,
      removeInbox,
      promoteInbox,
      pushMessage,
      setProposalState,
    }),
    [
      tasks,
      events,
      reminders,
      notes,
      memories,
      projects,
      inbox,
      messages,
      addTask,
      updateTask,
      toggleTask,
      removeTask,
      addEvent,
      addReminder,
      toggleReminder,
      removeReminder,
      addNote,
      updateNote,
      removeNote,
      addMemory,
      updateMemory,
      removeMemory,
      addProject,
      addInbox,
      removeInbox,
      promoteInbox,
      pushMessage,
      setProposalState,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp deve ser usado dentro de AppProvider");
  return ctx;
}
