import { createFileRoute } from "@tanstack/react-router";
import { buildPushPayload } from "@block65/webcrypto-web-push";

interface ReminderRow {
  id: string;
  user_id: string;
  title: string;
  remind_at: string;
  repeat: string;
}

interface SubscriptionRow {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

function nextOccurrence(from: string, repeat: string): string | null {
  const d = new Date(from);
  const now = Date.now();
  if (repeat === "once") return null;
  do {
    if (repeat === "daily") d.setDate(d.getDate() + 1);
    else if (repeat === "weekly") d.setDate(d.getDate() + 7);
    else if (repeat === "monthly") d.setMonth(d.getMonth() + 1);
    else return null;
  } while (d.getTime() <= now);
  return d.toISOString();
}

async function handle(request: Request) {
  const secret = process.env["REMINDERS_CRON_SECRET"];
  if (!secret) return new Response("Server configuration error", { status: 500 });
  const token = /^Bearer ([^\s,]+)$/.exec(request.headers.get("authorization") ?? "")?.[1];
  if (token !== secret) return new Response("Unauthorized", { status: 401 });

  const vapid = {
    subject: process.env["VAPID_SUBJECT"] ?? "mailto:notificacoes@lovable.app",
    publicKey: process.env["VAPID_PUBLIC_KEY"],
    privateKey: process.env["VAPID_PRIVATE_KEY"],
  };
  if (!vapid.publicKey || !vapid.privateKey) {
    return new Response("Missing VAPID keys", { status: 500 });
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: due, error } = await supabaseAdmin
    .from("reminders")
    .select("id, user_id, title, remind_at, repeat")
    .eq("done", false)
    .is("notified_at", null)
    .lte("remind_at", new Date().toISOString())
    .limit(100);

  if (error) return new Response(error.message, { status: 500 });
  const reminders = (due ?? []) as ReminderRow[];
  if (reminders.length === 0) return Response.json({ sent: 0, reminders: 0 });

  const userIds = [...new Set(reminders.map((r) => r.user_id))];
  const { data: subsData } = await supabaseAdmin
    .from("push_subscriptions")
    .select("id, user_id, endpoint, p256dh, auth")
    .in("user_id", userIds);
  const subs = (subsData ?? []) as SubscriptionRow[];

  let sent = 0;
  for (const reminder of reminders) {
    const targets = subs.filter((s) => s.user_id === reminder.user_id);
    for (const target of targets) {
      try {
        const payload = await buildPushPayload(
          {
            data: {
              title: "Lembrete",
              body: reminder.title,
              url: "/lembretes",
              tag: reminder.id,
            },
            options: { ttl: 3600, urgency: "high" },
          },
          {
            endpoint: target.endpoint,
            expirationTime: null,
            keys: { p256dh: target.p256dh, auth: target.auth },
          },
          vapid,
        );

        const res = await fetch(target.endpoint, {
          method: payload.method,
          headers: Object.fromEntries(
            Object.entries(payload.headers).filter(([, v]) => v !== undefined),
          ) as Record<string, string>,
          body: payload.body as unknown as BodyInit,
        });
        if (res.status === 404 || res.status === 410) {
          await supabaseAdmin.from("push_subscriptions").delete().eq("id", target.id);
        } else if (res.ok) {
          sent += 1;
        } else {
          console.error("push failed", res.status, await res.text());
        }
      } catch (err) {
        console.error("push error", err);
      }
    }

    const next = nextOccurrence(reminder.remind_at, reminder.repeat);
    await supabaseAdmin
      .from("reminders")
      .update(
        next
          ? { remind_at: next, notified_at: null }
          : { notified_at: new Date().toISOString() },
      )
      .eq("id", reminder.id);
  }

  return Response.json({ sent, reminders: reminders.length });
}

export const Route = createFileRoute("/api/public/cron/reminders")({
  server: {
    handlers: {
      POST: ({ request }) => handle(request),
      GET: ({ request }) => handle(request),
    },
  },
});
