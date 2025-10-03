"use client";

import { createClient } from "@/lib/supabase/client";
import { Tables } from "@/types/database.types";
import { createContext, ReactNode, useContext } from "react";
import useSWR from "swr";

interface SquadContextType {
  squad: Tables<"squad"> | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

const SquadContext = createContext<SquadContextType | undefined>(undefined);

interface SquadProviderProps {
  squadId: number;
  children: ReactNode;
}

export function SquadProvider({ squadId, children }: SquadProviderProps) {
  const supabase = createClient();

  const { data, error, isLoading, mutate } = useSWR(
    ["squad", squadId],
    async ([, squadId]) => {
      const { data, error } = await supabase
        .from("squad")
        .select("*")
        .eq("id", squadId)
        .single();
      if (error) throw error;
      return data;
    }
  );

  return (
    <SquadContext.Provider
      value={{
        squad: data || null,
        isLoading,
        error,
        refresh: mutate,
      }}
    >
      {children}
    </SquadContext.Provider>
  );
}

export function useSquad() {
  const context = useContext(SquadContext);
  if (context === undefined) {
    throw new Error("useSquad must be used within a SquadProvider");
  }
  return context;
}
