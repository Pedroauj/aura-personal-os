import { supabase } from "@/integrations/supabase/client";

/** Chave pública VAPID (pode ser pública por definição). */
export const VAPID_PUBLIC_KEY =
  "BD5-qNDx8tkh8e5oL8EK0WtbhxNZQHmEfmveulTiNLjgUTarIktME-Q1u09iI1H80gHgyrKQ4yvTP5Ws903DpVM";

const SW_PATH = "/push-sw.js";

export function isPushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/** iOS só entrega push quando o app está instalado na tela de início. */
export function isStandalone() {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

export function isIos() {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

function arrayBufferToBase64Url(buffer: ArrayBuffer | null) {
  if (!buffer) return "";
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return window
    .btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function getRegistration() {
  return navigator.serviceWorker.register(SW_PATH, { scope: "/" });
}

export async function getPushStatus() {
  if (!isPushSupported()) return { supported: false, enabled: false } as const;
  const permission = Notification.permission;
  if (permission !== "granted") return { supported: true, enabled: false } as const;
  const reg = await navigator.serviceWorker.getRegistration(SW_PATH);
  const sub = await reg?.pushManager.getSubscription();
  return { supported: true, enabled: Boolean(sub) } as const;
}

/** Pede permissão, assina o push e guarda o dispositivo no backend. */
export async function enablePush() {
  if (!isPushSupported()) throw new Error("Este navegador não suporta notificações push.");
  if (isIos() && !isStandalone()) {
    throw new Error(
      "No iPhone, instale o app na tela de início (Compartilhar → Adicionar à Tela de Início) para ativar as notificações.",
    );
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Permissão de notificações negada.");

  const reg = await getRegistration();
  await navigator.serviceWorker.ready;

  const existing = await reg.pushManager.getSubscription();
  const sub =
    existing ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    }));

  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error("Sessão expirada. Entre novamente.");

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: userId,
      endpoint: sub.endpoint,
      p256dh: arrayBufferToBase64Url(sub.getKey("p256dh")),
      auth: arrayBufferToBase64Url(sub.getKey("auth")),
      user_agent: window.navigator.userAgent,
    },
    { onConflict: "endpoint" },
  );
  if (error) throw new Error(error.message);
  return true;
}

export async function disablePush() {
  const reg = await navigator.serviceWorker.getRegistration(SW_PATH);
  const sub = await reg?.pushManager.getSubscription();
  if (sub) {
    await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
    await sub.unsubscribe();
  }
  return true;
}
