import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import {
  AssistantMessage,
  Composer,
  QuickAction,
  ThinkingBubble,
  useAssistant,
} from "@/components/assistant";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/_authenticated/assistente")({
  head: () => ({
    meta: [
      { title: "Assistente — Aurora" },
      {
        name: "description",
        content:
          "Converse naturalmente com a Aurora: crie tarefas, lembretes, eventos e notas apenas pedindo.",
      },
      { property: "og:title", content: "Assistente — Aurora" },
      {
        property: "og:description",
        content: "Converse com a IA e deixe que ela organize suas tarefas e sua agenda.",
      },
    ],
  }),
  component: AssistantPage,
});

const EXAMPLES = [
  "Me lembra de pagar a internet sexta-feira às 10h",
  "Marca uma tarefa para eu terminar o projeto amanhã",
  "O que eu tenho para hoje?",
  "Organiza minha semana",
  "Quais tarefas estão atrasadas?",
  "Anota que o cliente prefere contato pelo WhatsApp",
];

function AssistantPage() {
  const { messages, setProposalState } = useApp();
  const { send, accept, thinking } = useAssistant();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, thinking]);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col md:h-screen">
      <div className="hidden items-center gap-2.5 border-b border-border px-6 py-4 md:flex">
        <Sparkles className="size-4 text-primary" />
        <h1 className="text-[15px] font-medium">Assistente</h1>
        <span className="ml-auto text-[12px] text-muted-foreground">
          Com acesso às suas tarefas, agenda, notas e memória
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl space-y-6 px-5 py-6">
          {messages.map((m) => (
            <AssistantMessage
              key={m.id}
              message={m}
              onAccept={() => m.proposal && accept(m.id, m.proposal)}
              onCancel={() => setProposalState(m.id, "cancelled")}
            />
          ))}
          {thinking && <ThinkingBubble />}
          <div ref={endRef} />
        </div>
      </div>

      <div className="border-t border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-3xl px-5 py-4">
          {messages.length < 3 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {EXAMPLES.slice(0, 4).map((e) => (
                <QuickAction key={e} label={e} onClick={() => send(e)} />
              ))}
            </div>
          )}
          <Composer onSubmit={send} autoFocus />
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            A Aurora confirma antes de criar qualquer coisa.
          </p>
        </div>
      </div>
    </div>
  );
}
