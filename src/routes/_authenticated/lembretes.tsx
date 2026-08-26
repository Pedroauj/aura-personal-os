import { createFileRoute } from "@tanstack/react-router";
import { Bell, Plus } from "lucide-react";
import { useState } from "react";
import { EmptyState, ReminderCard, SectionTitle } from "@/components/cards";
import { GhostButton, PageHeader, PrimaryButton } from "@/components/page-header";
import { useApp } from "@/lib/store";
import { isoToday } from "@/lib/format";
import type { ReminderRepeat } from "@/lib/types";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/lembretes")({
  head: () => ({
    meta: [
      { title: "Lembretes — Aurora" },
      {
        name: "description",
        content:
          "Lembretes únicos ou recorrentes, criados por voz natural: hoje, amanhã, toda semana ou todo mês.",
      },
      { property: "og:title", content: "Lembretes — Aurora" },
      {
        property: "og:description",
        content: "Crie lembretes únicos e recorrentes conversando com a assistente.",
      },
    ],
  }),
  component: RemindersPage,
});

const REPEATS: { value: ReminderRepeat; label: string }[] = [
  { value: "once", label: "Uma vez" },
  { value: "daily", label: "Todo dia" },
  { value: "weekly", label: "Toda semana" },
  { value: "monthly", label: "Todo mês" },
];

function RemindersPage() {
  const app = useApp();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    date: isoToday(),
    time: "09:00",
    repeat: "once" as ReminderRepeat,
  });

  const today = isoToday();
  const pendentes = app.reminders.filter((r) => !r.done);
  const hoje = pendentes.filter((r) => r.date === today);
  const proximos = pendentes.filter((r) => r.date > today);
  const atrasados = pendentes.filter((r) => r.date < today);
  const feitos = app.reminders.filter((r) => r.done);

  const create = () => {
    if (!form.title.trim()) return;
    app.addReminder({ ...form, title: form.title.trim() });
    toast.success("Lembrete criado");
    setForm({ title: "", date: isoToday(), time: "09:00", repeat: "once" });
    setOpen(false);
  };

  const groups = [
    { title: "Atrasados", items: atrasados },
    { title: "Hoje", items: hoje },
    { title: "Próximos", items: proximos },
    { title: "Concluídos", items: feitos },
  ].filter((g) => g.items.length);

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8 md:px-8 md:py-12">
      <PageHeader
        title="Lembretes"
        subtitle='Peça: "me lembra daqui 30 minutos de ligar para o cliente".'
        action={
          <PrimaryButton onClick={() => setOpen(true)}>
            <Plus className="size-4" /> Novo lembrete
          </PrimaryButton>
        }
      />

      <div className="mt-8 space-y-8">
        {groups.length === 0 && (
          <EmptyState
            icon={Bell}
            title="Nenhum lembrete"
            description="Crie um lembrete ou peça para a assistente."
          />
        )}
        {groups.map((g) => (
          <div key={g.title}>
            <SectionTitle title={g.title} count={g.items.length} />
            <div className="space-y-2.5">
              {g.items.map((r) => (
                <ReminderCard
                  key={r.id}
                  reminder={r}
                  onToggle={() => app.toggleReminder(r.id)}
                  onDelete={() => app.removeReminder(r.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo lembrete</DialogTitle>
            <DialogDescription>Escolha quando você quer ser avisado.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Do que você quer ser lembrado?"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
              <Input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {REPEATS.map((r) => (
                <GhostButton
                  key={r.value}
                  active={form.repeat === r.value}
                  onClick={() => setForm({ ...form, repeat: r.value })}
                >
                  {r.label}
                </GhostButton>
              ))}
            </div>
          </div>
          <DialogFooter>
            <PrimaryButton onClick={create}>Criar lembrete</PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
