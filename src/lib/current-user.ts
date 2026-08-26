import { useMemo } from "react";
import { useSessionUser } from "@/hooks/use-session-user";

export interface CurrentUser {
  name: string;
  fullName: string;
  email: string;
  initials: string;
}

function initialsOf(value: string) {
  return value
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/** Dados de exibição do usuário autenticado. */
export function useCurrentUser(): CurrentUser {
  const { user } = useSessionUser();

  return useMemo(() => {
    const meta = user?.user_metadata ?? {};
    const email = user?.email ?? "";
    const fullName =
      (meta["full_name"] as string | undefined) ??
      (meta["name"] as string | undefined) ??
      (email ? (email.split("@")[0] ?? email) : "");
    const name = fullName.split(" ")[0] ?? "";

    return {
      name,
      fullName: fullName || email,
      email,
      initials: initialsOf(fullName || email) || "?",
    };
  }, [user]);
}
