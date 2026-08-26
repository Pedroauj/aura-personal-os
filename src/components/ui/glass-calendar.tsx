import { motion, AnimatePresence } from "framer-motion";
import {
  format,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  date: string;
  [key: string]: unknown;
}

interface GlassCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  events?: CalendarEvent[];
  className?: string;
}

const SPRING = { type: "spring", stiffness: 400, damping: 30 } as const;
const STRIP_SPRING = { type: "spring", stiffness: 350, damping: 30 } as const;

function toISO(d: Date) {
  return format(d, "yyyy-MM-dd");
}

export function GlassCalendar({
  selectedDate,
  onSelectDate,
  events = [],
  className,
}: GlassCalendarProps) {
  const [month, setMonth] = useState(new Date(selectedDate));
  const stripRef = useRef<HTMLDivElement>(null);
  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });

  const eventDates = new Set(events.map((e) => e.date));

  // Scroll selected day into view
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const selectedEl = strip.querySelector<HTMLElement>("[data-selected=true]");
    if (selectedEl) {
      selectedEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [selectedDate, month]);

  const prevMonth = () => setMonth((m) => subMonths(m, 1));
  const nextMonth = () => setMonth((m) => addMonths(m, 1));

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl",
        "border border-white/8 bg-white/5 backdrop-blur-2xl",
        "shadow-[0_8px_32px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.08)]",
        className,
      )}
    >
      {/* Month header */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-3">
        <motion.button
          whileTap={{ scale: 0.88 }}
          transition={SPRING}
          onClick={prevMonth}
          className="flex size-8 items-center justify-center rounded-full bg-white/8 text-muted-foreground transition-colors hover:bg-white/12 hover:text-foreground"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="size-4" />
        </motion.button>

        <AnimatePresence mode="wait" initial={false}>
          <motion.h2
            key={toISO(month)}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            className="flex-1 text-center text-[15px] font-semibold tracking-tight"
          >
            {format(month, "MMMM yyyy", { locale: ptBR })}
          </motion.h2>
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.88 }}
          transition={SPRING}
          onClick={nextMonth}
          className="flex size-8 items-center justify-center rounded-full bg-white/8 text-muted-foreground transition-colors hover:bg-white/12 hover:text-foreground"
          aria-label="Próximo mês"
        >
          <ChevronRight className="size-4" />
        </motion.button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 px-4 pb-2">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
          <p key={i} className="text-center text-[11px] font-medium text-muted-foreground">
            {d}
          </p>
        ))}
      </div>

      {/* Horizontal scrollable day strip */}
      <div
        ref={stripRef}
        className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3"
        style={{ scrollbarWidth: "none" }}
      >
        {/* Leading empty cells for day alignment */}
        {Array.from({ length: days[0]?.getDay() ?? 0 }, (_, i) => (
          <div key={`empty-${i}`} className="size-10 shrink-0" />
        ))}

        {days.map((day) => {
          const iso = toISO(day);
          const selected = isSameDay(day, selectedDate);
          const today = isToday(day);
          const hasEvent = eventDates.has(iso);

          return (
            <div key={iso} className="relative shrink-0" data-selected={selected}>
              <motion.button
                whileTap={{ scale: 0.88 }}
                transition={STRIP_SPRING}
                onClick={() => onSelectDate(day)}
                className={cn(
                  "relative flex size-10 flex-col items-center justify-center rounded-xl text-[14px] font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                  selected
                    ? "text-primary-foreground"
                    : today
                      ? "text-primary"
                      : "text-foreground hover:bg-white/8",
                )}
              >
                {/* Selected background */}
                {selected && (
                  <motion.span
                    layoutId="cal-selected"
                    transition={SPRING}
                    className="absolute inset-0 rounded-xl bg-primary"
                    style={{
                      boxShadow: "0 2px 8px var(--color-primary)/40",
                    }}
                  />
                )}

                {/* Today ring (when not selected) */}
                {today && !selected && (
                  <span className="absolute inset-0 rounded-xl ring-1 ring-primary/50" />
                )}

                <span className="relative z-10 tabular-nums">{day.getDate()}</span>

                {/* Event dot */}
                {hasEvent && (
                  <span
                    className={cn(
                      "relative z-10 mt-0.5 size-1 rounded-full",
                      selected ? "bg-primary-foreground/70" : "bg-primary/70",
                    )}
                  />
                )}
              </motion.button>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-white/6" />

      {/* Selected date label */}
      <div className="px-4 py-3">
        <AnimatePresence mode="wait">
          <motion.p
            key={toISO(selectedDate)}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="text-[13px] font-medium text-muted-foreground"
          >
            {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
