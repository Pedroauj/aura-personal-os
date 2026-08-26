import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Aurora" },
      {
        name: "description",
        content:
          "Acesse sua conta Aurora para organizar tarefas, agenda, lembretes e notas com a ajuda da assistente.",
      },
      { property: "og:title", content: "Entrar — Aurora" },
      {
        property: "og:description",
        content: "Acesse sua central pessoal de produtividade com IA.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email("Informe um e-mail válido").max(255);
const passwordSchema = z
  .string()
  .min(8, "A senha precisa de pelo menos 8 caracteres")
  .max(72);
const nameSchema = z.string().trim().min(2, "Informe seu nome").max(80);

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") return;
      if (session) navigate({ to: "/", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    const parsedEmail = emailSchema.safeParse(email);
    if (!parsedEmail.success) {
      toast.error(parsedEmail.error.issues[0]!.message);
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(parsedEmail.data, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Enviamos um link de recuperação para seu e-mail.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Não foi possível enviar o e-mail",
      );
    } finally {
      setLoading(false);
    }
  }


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedEmail = emailSchema.safeParse(email);
    const parsedPassword = passwordSchema.safeParse(password);
    if (!parsedEmail.success) {
      toast.error(parsedEmail.error.issues[0]!.message);
      return;
    }
    if (!parsedPassword.success) {
      toast.error(parsedPassword.error.issues[0]!.message);
      return;
    }


    setLoading(true);
    try {
      if (mode === "signup") {
        const parsedName = nameSchema.safeParse(name);
        if (!parsedName.success) {
          toast.error(parsedName.error.issues[0]!.message);
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email: parsedEmail.data,
          password: parsedPassword.data,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: parsedName.data },
          },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success("Conta criada! Confirme seu e-mail para entrar.");
          return;
        }
        toast.success("Bem-vindo à Aurora!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsedEmail.data,
          password: parsedPassword.data,
        });
        if (error) throw error;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível continuar";
      toast.error(
        message.includes("Invalid login credentials")
          ? "E-mail ou senha incorretos"
          : message,
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setGoogleLoading(false);
      toast.error("Não foi possível entrar com o Google");
      return;
    }
    if (result.redirected) return;
  }

  return (
    <div className="dot-grid flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/25">
            <Sparkles className="size-5" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">
            {mode === "signin" ? "Entrar na Aurora" : "Criar sua conta"}
          </h1>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            Sua central pessoal de produtividade com IA.
          </p>
        </div>

        <div className="surface-card p-5">
          <Button
            type="button"
            variant="secondary"
            className="h-10 w-full text-[13px] font-medium"
            onClick={handleGoogle}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Continuar com Google
          </Button>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[11px] tracking-widest text-muted-foreground uppercase">
              ou
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-[13px]">
                  Nome
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Como quer ser chamado?"
                  autoComplete="name"
                  maxLength={80}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[13px]">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                autoComplete="email"
                maxLength={255}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[13px]">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo de 8 caracteres"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                maxLength={72}
              />
            </div>

            <Button type="submit" className="h-10 w-full text-[13px]" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Mail className="mr-2 size-4" />
              )}
              {mode === "signin" ? "Entrar" : "Criar conta"}
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-[13px] text-muted-foreground">
          {mode === "signin" ? "Ainda não tem conta?" : "Já tem uma conta?"}{" "}
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Criar conta" : "Entrar"}
          </button>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mr-2 size-4" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5a4.7 4.7 0 0 1-2 3.1l3.2 2.5c1.9-1.7 3-4.3 3-7.4 0-.7-.1-1.4-.2-2.1H12z"
      />
      <path
        fill="#34A853"
        d="M6.6 14.3 5.9 15l-2.5 2A9 9 0 0 0 12 21c2.4 0 4.5-.8 6-2.2l-3.2-2.5c-.8.6-1.9.9-2.8.9-2.3 0-4.3-1.5-5-3.6z"
      />
      <path
        fill="#FBBC05"
        d="M3.4 7A9 9 0 0 0 3 12c0 1.5.4 2.9 1 4.1l3.2-2.5A5.4 5.4 0 0 1 6.6 12c0-.6.1-1.1.3-1.6z"
      />
      <path
        fill="#4285F4"
        d="M12 6.6c1.3 0 2.5.5 3.4 1.3l2.6-2.6A9 9 0 0 0 3.4 7l3.3 2.5C7.4 8.1 9.5 6.6 12 6.6z"
      />
    </svg>
  );
}
