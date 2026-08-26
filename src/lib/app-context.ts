import { createContext, useContext } from "react";
import type { AppContextValue } from "./store-types";

export const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp deve ser usado dentro de AppProvider");
  return ctx;
}

let counter = 0;
export const uid = (prefix = "id") => `${prefix}_${Date.now().toString(36)}_${counter++}`;
