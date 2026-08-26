import { createFileRoute } from "@tanstack/react-router";
import { Bell, Brain, Cloud, Keyboard, Sparkles, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { SectionTitle } from "@/components/cards";
import { ToggleSwitchGlass } from "@/components/ui/toggle-switch-glass";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { disablePush, enablePush, getPushStatus, isIos, isStandalone } from "@/lib/push";

export const Route = createFileRoute("/_authenticated/configuracoes")({
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

const TOGGLE_DEFS: {
  icon: LucideIcon;
  title: string;
  description: string;
  key: string;
  defaultChecked: boolean;
  disabled?: boolean;
}[] = [
  {
    icon: Sparkles,
    key: "confirm",
    title: "Confirmar antes de criar",
    description: "A assistente sempre pede confirmação antes de executar ações.",
    defaultChecked: true,
  },
  {
    icon: Brain,
    key: "memory",
    title: "Memória automática",
    description: "Guardar informações relevantes que aparecem nas conversas.",
    defaultChecked: true,
  },
  {
    icon: Cloud,
    key: "sync",
    title: "Sincronizar calendário externo",
    description: "Google Calendar e Outlook — disponível em breve.",
    defaultChecked: false,
    disabled: true,
  },
];

const SHORTCUTS = [
  { keys: "⌘ K", label: "Pesquisa global e comandos" },
  { keys: "Enter", label: "Enviar mensagem para a assistente" },
  { keys: "Shift + Enter", label: "Nova linha" },
];

const SPRING = { type: "spring", stiffness: 400, damping: 30 } as const;

function SettingsPage() {
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(TOGGLE_DEFS.map((t) => [t.key, t.defaultChecked])),
  );
  const [push, setPush] = useState({ supported: true, enabled: false, busy: false });

  useEffect(() => {
    void getPushStatus().then((s) =>
      setPush({ supported: s.supported, enabled: s.enabled, busy: false }),
    );
  }, []);

  const togglePush = async (next: boolean) => {
    setPush((p) => ({ ...p, busy: true }));
    try {
      if (next) {
        await enablePush();
        toast.success("Notificações ativadas neste dispositivo");
      } else {
        await disablePush();
        toast.success("Notificações desativadas neste dispositivo");
      }
      setPush({ supported: true, enabled: next, busy: false });
    } catch (err) {
      setPush((p) => ({ ...p, busy: false }));
      toast.error(err instanceof Error ? err.message : "Não foi possível alterar");
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-8 md:px-8 md:py-12">
      <PageHeader
        title="Configurações"
        subtitle="Como a Aurora deve se comportar no seu dia a dia."
      />

      <div className="mt-8 space-y-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING}
          className="surface-card"
        >
          <div className="flex items-center gap-4 px-4 py-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/8">
              <Bell className="size-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium">Notificações de lembretes</p>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                {push.supported
                  ? "Receba um aviso no horário de cada lembrete neste dispositivo."
                  : "Este navegador não suporta notificações push."}
                {isIos() && !isStandalone() && push.supported
                  ? " No iPhone, instale o app na tela de início primeiro."
                  : ""}
              </p>
            </div>
            <ToggleSwitchGlass
              checked={push.enabled}
              onChange={(v) => void togglePush(v)}
              disabled={!push.supported || push.busy}
              id="push"
            />
          </div>
        </motion.div>

        {TOGGLE_DEFS.map((t, i) => (
          <motion.div
            key={t.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: i * 0.05 }}
            className={cn(
              "surface-card group",
              "transition-all hover:brightness-[1.08]",
              t.disabled && "opacity-55",
            )}
          >
            <div className="flex items-center gap-4 px-4 py-4">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/8">
                <t.icon className="size-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium">{t.title}</p>
                <p className="mt-0.5 text-[13px] text-muted-foreground">{t.description}</p>
              </div>
              <ToggleSwitchGlass
                checked={toggles[t.key] ?? false}
                onChange={(v) => setToggles((prev) => ({ ...prev, [t.key]: v }))}
                disabled={t.disabled ?? false}
                id={t.key}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-10">
        <SectionTitle title="Atalhos" />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.25 }}
          className="glass-elevated divide-y divide-white/6"
        >
          {SHORTCUTS.map((s) => (
            <div key={s.keys} className="flex items-center gap-3 px-4 py-3.5">
              <Keyboard className="size-4 shrink-0 text-muted-foreground" />
              <p className="flex-1 text-[13px]">{s.label}</p>
              <kbd className="inline-flex items-center rounded-lg border border-white/10 bg-white/8 px-2 py-1 text-[11px] text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                {s.keys}
              </kbd>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
