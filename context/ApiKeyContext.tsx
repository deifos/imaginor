"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { fal } from "@fal-ai/client";
type ApiKeyContextType = {
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
};

// NEVER USE API KEYS ON A CLIENT COMPONENT THIS IS JUST FOR DEMO PURPOSES

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem("fal_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }

    //REMOVE KEY FROM LOCAL STORAGE IF THE TAB IS CLOSED
    const handleBeforeUnload = () => {
      localStorage.removeItem("fal_api_key");
      setApiKey(null);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    fal.config(
      apiKey ? { credentials: apiKey } : { proxyUrl: "/api/fal/proxy" }
    );
  }, [apiKey]);

  return (
    <ApiKeyContext.Provider value={{ apiKey, setApiKey }}>
      {children}
    </ApiKeyContext.Provider>
  );
}

export const useApiKey = () => {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error("useApiKey must be used within an ApiKeyProvider");
  }
  return context;
};
