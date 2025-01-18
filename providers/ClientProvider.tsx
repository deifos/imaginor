"use client";

import { ApiKeyProvider } from "@/context/ApiKeyContext";

export function ClientProvider({ children }: { children: React.ReactNode }) {
  return <ApiKeyProvider>{children}</ApiKeyProvider>;
}
