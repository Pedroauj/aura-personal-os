import { isoToday, parseISODate, relativeDay } from "./format";
import type { MemoryItem, Note, Proposal, Reminder, Task, CalendarEvent } from "./types";

function iso(dateOffset: number) {
  const d = new Date();
  d.setDate(d.getDate() + dateOffset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

const WEEKDAY_WORDS: Record<string, number> = {
  domingo: 0,
  segunda: 1,
  terça: 2,
  terca: 2,
  quarta: 3,
  quinta: 4,
  sexta: 5,
  sábado: 6,
  sabado: 6,
};

export function detectDate(text: string): string {
  const t = text.toLowerCase();
  if (/depois de amanh[ãa]/.test(t)) return iso(2);
  if (/amanh[ãa]/.test(t)) return iso(1);
  if (/hoje|agora|daqui/.test(t)) return iso(0);
  if (/pr[óo]xima semana|semana que vem/.test(t)) return iso(7);
  for (const [word, dow] of Object.entries(WEEKDAY_WORDS)) {
    if (t.includes(word)) {
      const now = new Date();
      let delta = (dow - now.getDay() + 7) % 7;
      if (delta === 0) delta = 7;
      return iso(delta);
    }
  }
  const dm = t.match(/\b(\d{1,2})\/(\d{1,2})\b/);
  if (dm) {
    const y = new Date().getFullYear();
    return `${y}-${String(Number(dm[2])).padStart(2, "0")}-${String(Number(dm[1])).padStart(2, "0")}`;
  }
  return iso(0);
}

export function detectTime(text: string): string {
  const t = text.toLowerCase();
  const inMin = t.match(/daqui\s*(?:a)?\s*(\d{1,3})\s*(minutos?|min)/);
  if (inMin) {
    const d = new Date(Date.now() + Number(inMin[1]) * 60000);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  const inHour = t.match(/daqui\s*(?:a)?\s*(\d{1,2})\s*(horas?|h)\b/);
  if (inHour) {
    const d = new Date(Date.now() + Number(inHour[1]) * 3600000);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  const hm = t.match(/\b(\d{1,2})[:h](\d{2})\b/);
  if (hm) return `${(hm[1] ?? "0").padStart(2, "0")}:${hm[2] ?? "00"}`;
  const h = t.match(/\b(?:[àa]s|as)\s*(\d{1,2})\s*(?:h|horas)?\b/);
  if (h) return `${(h[1] ?? "0").padStart(2, "0")}:00`;
  if (/manh[ãa]/.test(t)) return "09:00";
  if (/tarde/.test(t)) return "14:00";
  if (/noite/.test(t)) return "20:00";
  return "09:00";
}

export function detectPriority(text: string): Task["priority"] {
  const t = text.toLowerCase();
  if (/urgent|imediat|agora mesmo/.test(t)) return "urgente";
  if (/priorid|important|alta/.test(t)) return "alta";
  if (/quando der|sem pressa|baixa/.test(t)) return "baixa";
  return "media";
}

function cleanTitle(text: string) {
  // Operate on the original-cased text, padded with spaces so each "token"
  // is whitespace-bounded. \b word boundaries break on accented chars (ã/à),
  // so we use lookarounds on \S instead — this also preserves proper case
  // (API, PIX, Rust, Marcos) and strips filler/temporal noise cleanly.
  let t = " " + text.trim() + " ";

  // 1. Strip the leading command phrase: command verbs + filler words, one
  //    token at a time, until the real action is reached.
  //    e.g. "marcar uma tarefa pra eu pesquisar..." -> "pesquisar..."
  //    Event nouns (reunião, compromisso, consulta) are kept as subjects.
  const verbs = [
    "lembrar", "lembrete", "lembre", "lembra", "adicionar", "adiciona",
    "anotar", "anota", "agendar", "agenda", "salvar", "salva", "criar",
    "crie", "cria", "marcar", "marca", "quero", "preciso",
  ];
  const filler = [
    "me", "uma", "um", "a", "o", "tarefa", "tarefas", "nota", "notas",
    "lembrete", "lembretes", "pra", "para", "que", "de", "eu", "mim", "sobre",
  ];
  // A token may be followed by whitespace or punctuation ("tarefa:").
  const endTok = "(?![^\\s,;:.-])";
  let changed = true;
  let guard = 0;
  while (changed && guard++ < 40) {
    changed = false;
    for (const list of [verbs, filler]) {
      for (const w of list) {
        const re = new RegExp("^\\s" + w + endTok, "i");
        if (re.test(t)) {
          t = t.replace(re, "");
          changed = true;
          break;
        }
      }
      if (changed) break;
    }
  }
  // Remove a leftover leading punctuation mark (e.g. "tarefa:" -> ":").
  t = t.replace(/^\s*[:;,-.]+\s*/, " ");

  // 2. Strip temporal expressions (whitespace-bounded, accent-safe).
  const strip = [
    /(?<=\s)depois\s+de\s+amanh[ãa](?=\s)/gi,
    /(?<=\s)amanh[ãa]\s+(?:de\s+|a\s+)?(?:manh[ãa]|tarde|noite)(?=\s)/gi,
    /(?<=\s)hoje\s+(?:de\s+|a\s+)?(?:manh[ãa]|tarde|noite)(?=\s)/gi,
    /(?<=\s)de\s+(?:manh[ãa]|tarde|noite)(?=\s)/gi,
    /(?<=\s)a\s+(?:manh[ãa]|tarde|noite)(?=\s)/gi,
    /(?<=\s)(?:hoje|amanh[ãa])(?=\s)/gi,
    /(?<=\s)(?:na\s+pr[óo]xima\s+semana|semana\s+que\s+vem)(?=\s)/gi,
    /(?<=\s)(?:toda\s+semana|todo\s+m[êe]s|todo\s+dia\s+\d{1,2}|todas?\s+os?\s+dias?)(?=\s)/gi,
    /(?<=\s)(?:segunda|ter[çc]a|quarta|quinta|sexta|s[áa]bado|domingo)(?:-feira)?(?=\s)/gi,
    /(?<=\s)(?:às|as)\s+\d{1,2}(?:[:h]\d{2})?\s*(?:h|horas)?(?=\s)/gi,
    /(?<=\s)daqui\s+(?:a\s+)?\d{1,3}\s*(?:minutos?|min|horas?|h)(?=\s)/gi,
    /(?<=\s)\d{1,2}[:h]\d{2}\s*(?:h|horas)?(?=\s)/gi,
    /(?<=\s)\d{1,2}\s*(?:h|horas)(?=\s)/gi,
  ];
  for (const re of strip) t = t.replace(re, " ");

  // 3. Trim leftover connectors / punctuation.
  t = t.replace(/^[,\s;:.]+|[,;:.]+$/g, "");
  t = t.replace(/\s+\b(?:e|ou)\b\s*$/gi, "");
  t = t.replace(/\s{2,}/g, " ").trim();

  if (!t) return text.trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function detectRepeat(text: string): Reminder["repeat"] {
  const t = text.toLowerCase();
  if (/todo dia|todos os dias|diariamente/.test(t)) return "daily";
  if (/toda semana|semanalmente|toda (segunda|ter[çc]a|quarta|quinta|sexta)/.test(t))
    return "weekly";
  if (/todo m[êe]s|mensalmente|todo dia \d{1,2}/.test(t)) return "monthly";
  return "once";
}

export interface AssistantContext {
  tasks: Task[];
  events: CalendarEvent[];
  reminders: Reminder[];
  notes: Note[];
  memories: MemoryItem[];
}

export interface AssistantReply {
  content: string;
  proposal?: Proposal;
}

function listTasksForToday(ctx: AssistantContext) {
  const t = isoToday();
  return ctx.tasks.filter((x) => x.date === t && x.status !== "concluido");
}

function overdue(ctx: AssistantContext) {
  const t = isoToday();
  return ctx.tasks.filter(
    (x) => x.date && x.date < t && x.status !== "concluido" && x.status !== "cancelado",
  );
}

export function respond(input: string, ctx: AssistantContext): AssistantReply {
  const text = input.trim();
  const t = text.toLowerCase();

  // Pergunta sobre memória / notas
  if (/^(qual|quais|quem|onde|como|quando|o que)\b/.test(t) && !/tenho|tarefa/.test(t)) {
    const terms = t
      .replace(/[?.,!]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3);
    const hits = [
      ...ctx.memories.map((m) => ({ text: m.content, origin: "memória" })),
      ...ctx.notes.map((n) => ({ text: `${n.title}: ${n.content}`, origin: "nota" })),
    ].filter((item) => terms.some((w) => item.text.toLowerCase().includes(w)));
    if (hits.length) {
      return {
        content: `Encontrei isso no que já guardei sobre você:\n\n${hits
          .slice(0, 3)
          .map((h) => `• ${h.text} _(${h.origin})_`)
          .join("\n")}`,
      };
    }
  }

  // Tarefas atrasadas
  if (/atrasad|vencid/.test(t)) {
    const late = overdue(ctx);
    if (!late.length) return { content: "Nada atrasado. Você está em dia." };
    return {
      content: `Você tem ${late.length} ${late.length === 1 ? "tarefa atrasada" : "tarefas atrasadas"}:\n\n${late
        .map((x) => `• ${x.title} — venceu ${relativeDay(x.date)}`)
        .join("\n")}`,
    };
  }

  // O que tenho hoje
  if (/(o que|oque).*(hoje|agenda)|meu dia|minha agenda|compromissos/.test(t)) {
    const evs = ctx.events
      .filter((e) => e.date === isoToday())
      .sort((a, b) => a.time.localeCompare(b.time));
    const tks = listTasksForToday(ctx);
    return {
      content: `Hoje você tem ${evs.length} compromissos e ${tks.length} tarefas em aberto.\n\n${evs
        .map((e) => `• ${e.time} — ${e.title}`)
        .join("\n")}${tks.length ? `\n\nTarefas:\n${tks.map((x) => `• ${x.title}`).join("\n")}` : ""}`,
    };
  }

  // Planejamento / organização
  if (/organiz|planej|monta.*(dia|semana)|programa[çc][ãa]o/.test(t)) {
    const day = /amanh[ãa]/.test(t) ? iso(1) : isoToday();
    const evs = ctx.events
      .filter((e) => e.date === day)
      .sort((a, b) => a.time.localeCompare(b.time));
    const tks = ctx.tasks
      .filter((x) => x.status !== "concluido" && x.status !== "cancelado")
      .sort((a, b) => (a.priority === "urgente" ? -1 : 1))
      .slice(0, 3);
    const slots = ["08:00", "09:30", "11:00", "16:00"];
    const planItems: { time: string; title: string }[] = [];
    evs.forEach((e) => planItems.push({ time: e.time, title: e.title }));
    tks.forEach((task, i) =>
      planItems.push({ time: slots[i % slots.length] ?? "09:00", title: task.title }),
    );
    planItems.sort((a, b) => a.time.localeCompare(b.time));
    return {
      content: `Analisei sua agenda, suas tarefas em aberto e suas prioridades. Esta é a programação que faz mais sentido para ${day === isoToday() ? "hoje" : "amanhã"}:`,
      proposal: {
        kind: "plan",
        title: `Sugestão para ${day === isoToday() ? "hoje" : "amanhã"}`,
        subtitle: `${planItems.length} blocos organizados por prioridade`,
        payload: { date: day },
        planItems,
      },
    };
  }

  // Lembrete
  if (/lembr/.test(t)) {
    const date = detectDate(text);
    const time = detectTime(text);
    const repeat = detectRepeat(text);
    return {
      content: "Certo. Confirme o lembrete e eu guardo para você.",
      proposal: {
        kind: "reminder",
        title: cleanTitle(text) || "Novo lembrete",
        subtitle: `${relativeDay(date)} • ${time}${repeat !== "once" ? " • recorrente" : ""}`,
        payload: { date, time, repeat },
      },
    };
  }

  // Evento
  if (/reuni[ãa]o|agendar|marca[r]? .*(consulta|encontro|call)|compromisso/.test(t)) {
    const date = detectDate(text);
    const time = detectTime(text);
    return {
      content: "Posso colocar isso na sua agenda.",
      proposal: {
        kind: "event",
        title: cleanTitle(text) || "Novo compromisso",
        subtitle: `${relativeDay(date)} • ${time}`,
        payload: { date, time, durationMin: 60, category: "Geral" },
      },
    };
  }

  // Nota / memória
  if (/anota|anotar|salva que|guarda que|lembre-se que|registra/.test(t)) {
    const isMemory = /prefere|gosta|costuma|sempre|nunca|meu|minha/.test(t);
    const content = cleanTitle(text);
    return {
      content: isMemory
        ? "Isso parece uma informação sobre você ou sobre alguém próximo. Quer que eu guarde na Memória?"
        : "Vou salvar isso nas suas notas.",
      proposal: isMemory
        ? {
            kind: "memory",
            title: content,
            subtitle: "Será guardado na Memória da assistente",
            payload: { kind: /cliente|marcos|pessoa/.test(t) ? "pessoa" : "preferencia" },
          }
        : {
            kind: "note",
            title: content.slice(0, 48),
            subtitle: "Nova nota",
            payload: { content, category: "Geral" },
          },
    };
  }

  // Lista
  if (/lista/.test(t)) {
    return {
      content:
        "Posso criar isso como uma tarefa com subtarefas. Confirme para eu organizar.",
      proposal: {
        kind: "task",
        title: cleanTitle(text) || "Nova lista",
        subtitle: "Tarefa com checklist",
        payload: { date: detectDate(text), priority: "media" },
      },
    };
  }

  // Tarefa (padrão para pedidos de ação)
  if (/tarefa|fazer|terminar|finalizar|enviar|comprar|pagar|responder|estudar/.test(t)) {
    const date = detectDate(text);
    return {
      content: "Entendi como uma tarefa. Confirme para eu adicionar.",
      proposal: {
        kind: "task",
        title: cleanTitle(text) || "Nova tarefa",
        subtitle: `${relativeDay(date)} • prioridade ${detectPriority(text)}`,
        payload: { date, priority: detectPriority(text) },
      },
    };
  }

  const late = overdue(ctx).length;
  return {
    content: `Posso ajudar com isso. Enquanto isso, um panorama rápido: ${
      listTasksForToday(ctx).length
    } tarefas para hoje${late ? `, ${late} atrasadas` : ""} e ${
      ctx.events.filter((e) => e.date === isoToday()).length
    } compromissos. Quer que eu organize seu dia?`,
  };
}

export function dailyInsight(ctx: AssistantContext) {
  const today = isoToday();
  const evs = ctx.events
    .filter((e) => e.date === today)
    .sort((a, b) => a.time.localeCompare(b.time));
  const now = new Date();
  const nowStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const next = evs.find((e) => e.time >= nowStr) ?? evs[0];
  const pending = ctx.tasks.filter(
    (x) => x.date === today && x.status !== "concluido" && x.status !== "cancelado",
  );
  const high = pending.filter((x) => x.priority === "alta" || x.priority === "urgente");
  const late = overdue(ctx);

  const parts: string[] = [];
  if (evs.length <= 2) parts.push("Seu dia está relativamente tranquilo.");
  else parts.push("Seu dia está cheio.");
  if (next) parts.push(`Você tem ${next.title.toLowerCase()} às ${next.time}`);
  if (high.length)
    parts.push(
      `e ${high.length} ${high.length === 1 ? "tarefa prioritária ainda aberta" : "tarefas prioritárias ainda abertas"}`,
    );
  if (late.length) parts.push(`Há também ${late.length} em atraso`);
  return parts.join(" ").replace(/\s+/g, " ").trim() + ".";
}

export { parseISODate };
