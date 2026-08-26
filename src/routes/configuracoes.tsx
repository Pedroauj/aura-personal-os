import { createFileRoute } from "@tanstack/react-router";
import { Bell, Brain, Cloud, Keyboard, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SectionTitle } from "@/components/cards";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Aurora" },
      {
        name: "description",
        content:
          "Ajuste o comportamento da assistente, notificações, memória automática e integrações.",
      },
      { property: "og:title", content: "Configurações — Aurora" },
      {
        property: "og:description",
        content: "Comportamento da assistente, notificações e integrações.",
      },
    ],
  }),
  component: SettingsPage,
});

const TOGGLES = [
  {
    icon: Sparkles,
    title: "Confirmar antes de criar",
    description: "A assistente sempre pede confirmação antes de executar ações.",
    checked: true,
  },
  {
    icon: Brain,
    title: "Memória automática",
    description: "Guardar informações relevantes que aparecem nas conversas.",
    checked: true,
  },
  {
    icon: Bell,
    title: "Notificações de lembretes",
    description: "Avisar no horário de cada lembrete.",
    checked: true,
  },
  {
    icon: Cloud,
    title: "Sincronizar calendário externo",
    description: "Google Calendar e Outlook — disponível em breve.",
    checked: false,
  },
];

const SHORTCUTS = [
  { keys: "⌘ K", label: "Pesquisa global e comandos" },
  { keys: "Enter", label: "Enviar mensagem para a assistente" },
  { keys: "Shift + Enter", label: "Nova linha" },
];

function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-8 md:px-8 md:py-12">
      <PageHeader
        title="Configurações"
        subtitle="Como a Aurora deve se comportar no seu dia a dia."
      />

      <div className="mt-8 space-y-3">
        {TOGGLES.map((t) => (
          <div key={t.title} className="surface-card flex items-start gap-3 px-4 py-4">
            <t.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium">{t.title}</p>
              <p className="mt-0.5 text-[13px] text-muted-foreground">{t.description}</p>
            </div>
            <Switch defaultChecked={t.checked} />
          </div>
        ))}
      </div>

      <div className="mt-10">
        <SectionTitle title="Atalhos" />
        <div className="surface-card divide-y divide-border">
          {SHORTCUTS.map((s) => (
            <div key={s.keys} className="flex items-center gap-3 px-4 py-3">
              <Keyboard className="size-4 text-muted-foreground" />
              <p className="flex-1 text-[13px]">{s.label}</p>
              <kbd className="rounded border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground">
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
