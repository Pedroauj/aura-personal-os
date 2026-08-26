import type { Reminder, ReminderRepeat } from "./types";

export interface ReminderRow {
  id: string;
  title: string;
  remind_at: string;
  repeat: string;
  done: boolean;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Converte data/hora local (yyyy-mm-dd + HH:mm) em timestamp ISO. */
export function toRemindAt(date: string, time: string) {
  const d = new Date(`${date}T${time || "09:00"}:00`);
  return (Number.isNaN(d.getTime()) ? new Date() : d).toISOString();
}

export function rowToReminder(row: ReminderRow): Reminder {
  const d = new Date(row.remind_at);
  return {
    id: row.id,
    title: row.title,
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    repeat: row.repeat as ReminderRepeat,
    done: row.done,
  };
}
