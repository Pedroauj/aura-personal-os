import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const contextSchema = z.object({
  message: z.string().min(1).max(4000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .max(20)
    .default([]),
  now: z.object({ iso: z.string(), weekday: z.string(), time: z.string() }),
  snapshot: z.object({
    tasks: z.array(z.record(z.string(), z.unknown())).max(80),
    events: z.array(z.record(z.string(), z.unknown())).max(80),
    reminders: z.array(z.record(z.string(), z.unknown())).max(60),
    notes: z.array(z.record(z.string(), z.unknown())).max(40),
    memories: z.array(z.record(z.string(), z.unknown())).max(40),
    projects: z.array(z.record(z.string(), z.unknown())).max(20),
  }),
});

export type AssistantAction = {
  kind: "task" | "reminder" | "event" | "note" | "memory" | "plan";
  title: string;
  subtitle: string | null;
  date: string | null;
  time: string | null;
  durationMin: number | null;
  priority: "baixa" | "media" | "alta" | "urgente" | null;
  repeat: "once" | "daily" | "weekly" | "monthly" | null;
  category: string | null;
  content: string | null;
  memoryKind: "preferencia" | "pessoa" | "trabalho" | "rotina" | "outro" | null;
  planItems: { time: string; title: string }[] | null;
};

export type AssistantResult = { reply: string; actions: AssistantAction[] };

const nullableString = { type: ["string", "null"] };

const outputSchema = {
  type: "object",
  additionalProperties: false,
  required: ["reply", "actions"],
  properties: {
    reply: { type: "string" },
    actions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "kind",
          "title",
          "subtitle",
          "date",
          "time",
          "durationMin",
          "priority",
          "repeat",
          "category",
          "content",
          "memoryKind",
          "planItems",
        ],
        properties: {
          kind: { enum: ["task", "reminder", "event", "note", "memory", "plan"] },
          title: { type: "string" },
          subtitle: nullableString,
          date: nullableString,
          time: nullableString,
          durationMin: { type: ["integer", "null"] },
          priority: { type: ["string", "null"], enum: ["baixa", "media", "alta", "urgente", null] },
          repeat: { type: ["string", "null"], enum: ["once", "daily", "weekly", "monthly", null] },
          category: nullableString,
          content: nullableString,
          memoryKind: {
            type: ["string", "null"],
            enum: ["preferencia", "pessoa", "trabalho", "rotina", "outro", null],
          },
          planItems: {
            type: ["array", "null"],
            items: {
              type: "object",
              additionalProperties: false,
              required: ["time", "title"],
              properties: { time: { type: "string" }, title: { type: "string" } },
            },
          },
        },
      },
    },
  },
} as const;

function systemPrompt(now: { iso: string; weekday: string; time: string }) {
  return `Você é a Aurora, assistente pessoal de produtividade em português do Brasil.

Data/hora atual do usuário: ${now.weekday}, ${now.iso}, ${now.time}.

Seu papel vai além de anotar: você ANALISA o contexto (tarefas, agenda, lembretes, notas, memória e projetos do usuário) e responde com inteligência real.
- Quando o usuário perguntar algo ("o que tenho hoje?", "o que está atrasado?", "como está a semana?"), responda com análise concreta: conflitos de agenda, sobrecarga, prazos vencidos, prioridades sugeridas, o que cortar. Cite números e horários reais do contexto.
- Quando ele pedir para criar/agendar/lembrar/anotar, gere ações limpas: o título deve conter só o assunto ("Pesquisar sobre a API com a Prolog"), nunca o comando ou expressões de tempo.
- Um único pedido pode gerar VÁRIAS ações (ex.: "hoje à noite e amanhã de manhã" → duas ações).
- Datas sempre em yyyy-mm-dd e horários em HH:mm (24h), já resolvidos a partir de expressões relativas.
- Sem horário explícito: tarefa pode ficar sem hora; lembrete usa um horário razoável; compromisso dura 60 min por padrão.
- Deduza prioridade pelo tom e pelo prazo. Salve na memória (kind memory) fatos duradouros sobre o usuário quando ele revelar preferências.
- Para pedidos de organização do dia, use kind "plan" com planItems (blocos por horário) coerentes com a agenda existente.
- Se for só conversa ou análise, retorne actions vazio.

Estilo da resposta: direta, calorosa e curta (1 a 4 frases ou bullets curtos). Nada de repetir a pergunta nem de floreios.`;
}

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => contextSchema.parse(data))
  .handler(async ({ data }): Promise<AssistantResult> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI indisponível: chave não configurada.");

    const input = [
      { role: "developer", content: [{ type: "input_text", text: systemPrompt(data.now) }] },
      {
        role: "developer",
        content: [
          {
            type: "input_text",
            text: `Contexto atual do usuário (json):\n${JSON.stringify(data.snapshot)}`,
          },
        ],
      },
      ...data.history.map((m) => ({
        role: m.role,
        content: [
          { type: m.role === "assistant" ? "output_text" : "input_text", text: m.content },
        ],
      })),
      { role: "user", content: [{ type: "input_text", text: data.message }] },
    ];

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-5.6-sol",
        input,
        stream: true,
        store: false,
        reasoning: { effort: "low", summary: "auto" },
        text: {
          format: {
            type: "json_schema",
            name: "aurora_response",
            strict: true,
            schema: outputSchema,
          },
        },
      }),
    });

    if (!res.ok || !res.body) {
      const detail = await res.text().catch(() => "");
      if (res.status === 429) throw new Error("Muitas solicitações agora. Tente em instantes.");
      if (res.status === 402)
        throw new Error("Créditos de IA esgotados no workspace. Adicione créditos para continuar.");
      throw new Error(`Falha na IA (${res.status}). ${detail.slice(0, 200)}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let text = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const raw = line.slice(5).trim();
        if (!raw || raw === "[DONE]") continue;
        try {
          const evt = JSON.parse(raw) as { type?: string; delta?: string };
          if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") {
            text += evt.delta;
          }
        } catch {
          /* ignore partial frames */
        }
      }
    }

    if (!text.trim()) return { reply: "Não consegui elaborar uma resposta agora.", actions: [] };

    try {
      const parsed = JSON.parse(text) as AssistantResult;
      return { reply: parsed.reply ?? "", actions: Array.isArray(parsed.actions) ? parsed.actions : [] };
    } catch {
      return { reply: text, actions: [] };
    }
  });
