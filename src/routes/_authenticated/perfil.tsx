import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Brain,
  CalendarDays,
  CheckSquare,
  FolderKanban,
  LogOut,
  Settings,
  StickyNote,
} from "lucide-react";
import { motion } from "framer-motion";
import { useApp } from "@/lib/store";
import { useCurrentUser } from "@/lib/current-user";
import { useSessionUser } from "@/hooks/use-session-user";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { UserProfileSidebar } from "@/components/ui/menu";
import { SectionTitle } from "@/components/cards";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil — Aurora" },
      {
        name: "description",
        content: "Seus dados, sua rotina e um resumo do que a assistente gerencia por você.",
      },
      { property: "og:title", content: "Perfil — Aurora" },
      {
        property: "og:description",
        content: "Seus dados e um resumo do que a assistente gerencia.",
      },
    ],
  }),
  component: ProfilePage,
});

const SPRING = { type: "spring", stiffness: 350, damping: 30 } as const;

const NAV_ITEMS = [
  { to: "/tarefas", label: "Minhas tarefas", icon: <CheckSquare className="size-full" /> },
  { to: "/calendario", label: "Calendário", icon: <CalendarDays className="size-full" /> },
  { to: "/lembretes", label: "Lembretes", icon: <Bell className="size-full" /> },
  { to: "/notas", label: "Notas", icon: <StickyNote className="size-full" /> },
  { to: "/projetos", label: "Projetos", icon: <FolderKanban className="size-full" /> },
  { to: "/memoria", label: "Memória pessoal", icon: <Brain className="size-full" /> },
  {
    to: "/configuracoes",
    label: "Configurações",
    icon: <Settings className="size-full" />,
    isSeparator: true,
  },
];

function ProfilePage() {
  const app = useApp();
  const user = useCurrentUser();
  const { user: sessionUser } = useSessionUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const avatarUrl =
    (sessionUser?.user_metadata?.["avatar_url"] as string | undefined) ??
    (sessionUser?.user_metadata?.["picture"] as string | undefined);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const stats = [
    { label: "Tarefas", value: app.tasks.length },
    { label: "Compromissos", value: app.events.length },
    { label: "Lembretes", value: app.reminders.length },
    { label: "Notas", value: app.notes.length },
    { label: "Memórias", value: app.memories.length },
    { label: "Projetos", value: app.projects.length },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:px-8 md:py-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        {/* Sidebar de perfil */}
        <div className="w-full md:w-72 md:shrink-0">
          <UserProfileSidebar
            name={user.fullName}
            email={user.email}
            initials={user.initials}
            avatarUrl={avatarUrl}
            navItems={NAV_ITEMS}
            logoutItem={{
              label: "Sair",
              icon: <LogOut className="size-full" />,
              onClick: handleSignOut,
            }}
          />
        </div>

        {/* Conteúdo principal */}
        <div className="flex-1 min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING}
          >
            <SectionTitle title="Resumo" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...SPRING, delay: i * 0.05 }}
                  className="surface-card p-4"
                >
                  <p className="text-2xl font-semibold tabular-nums">{s.value}</p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.2 }}
            className="surface-card mt-6 p-5"
          >
            <p className="mb-1 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
              Conta
            </p>
            <p className="text-[14px] font-medium">{user.fullName}</p>
            <p className="text-[13px] text-muted-foreground">{user.email}</p>
            <p className="mt-3 text-[12px] text-muted-foreground">
              ID: <span className="tabular-nums">{sessionUser?.id?.slice(0, 16) ?? "—"}…</span>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
