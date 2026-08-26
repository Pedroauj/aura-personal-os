import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Inbox as InboxIcon, Trash2 } from "lucide-react";
import { useState } from "react";
import { EmptyState, SectionTitle } from "@/components/cards";
import { PageHeader } from "@/components/page-header";
import { useApp } from "@/lib/store";
import { relativeDay } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/inbox")({
  head: () => ({
    meta: [
      { title: "Inbox — Aurora" },
      {
        name: "description",
        content:
          "Captura rápida: jogue qualquer ideia aqui e transforme em tarefa depois, com um clique.",
      },
      { property: "og:title", content: "Inbox — Aurora" },
      {
        property: "og:description",
        content: "Captura rápida de ideias, transformadas em tarefas quando você quiser.",
      },
    ],
  }),
  component: InboxPage,
});

function InboxPage() {
  const app = useApp();
  const [value, setValue] = useState("");

  const add = () => {
    if (!value.trim()) return;
    app.addInbox(value.trim());
    setValue("");
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-8 md:px-8 md:py-12">
      <PageHeader
        title="Inbox"
        subtitle="Capture agora, organize depois. Nada se perde."
      />

      <div className="surface-card mt-8 flex items-center gap-2 p-2.5">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Anote qualquer coisa e pressione Enter..."
          className="flex-1 bg-transparent px-2 py-1.5 text-[14px] outline-none placeholder:text-muted-foreground"
        />
        <button
          onClick={add}
          className="rounded-lg bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Adicionar
        </button>
      </div>

      <div className="mt-8">
        <SectionTitle title="Capturado" count={app.inbox.length} />
        {app.inbox.length === 0 ? (
          <EmptyState
            icon={InboxIcon}
            title="Inbox vazia"
            description="Tudo organizado. Nada aguardando triagem."
          />
        ) : (
          <div className="space-y-2.5">
            {app.inbox.map((item) => (
              <div
                key={item.id}
                className="lift group surface-card animate-pop flex items-center gap-3 px-4 py-3.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[14px]">{item.content}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    capturado {relativeDay(item.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    app.promoteInbox(item.id);
                    toast.success("Transformado em tarefa");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[12px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  Virar tarefa <ArrowRight className="size-3" />
                </button>
                <button
                  onClick={() => app.removeInbox(item.id)}
                  aria-label="Excluir"
                  className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
