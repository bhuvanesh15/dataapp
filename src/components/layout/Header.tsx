"use client";

import * as React from "react";
import { useData } from "@/context/DataContext";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const GlobalSearchContext = React.createContext<{
  globalFilter: string;
  setGlobalFilter: (v: string) => void;
} | null>(null);

export function GlobalSearchProvider({ children }: { children: React.ReactNode }) {
  const [globalFilter, setGlobalFilter] = React.useState("");
  return (
    <GlobalSearchContext.Provider value={{ globalFilter, setGlobalFilter }}>
      {children}
    </GlobalSearchContext.Provider>
  );
}

export function useGlobalSearch() {
  const ctx = React.useContext(GlobalSearchContext);
  return ctx ?? { globalFilter: "", setGlobalFilter: () => {} };
}

export function Header({ title }: { title: string }) {
  const { lastRefresh } = useData();
  const { globalFilter, setGlobalFilter } = useGlobalSearch();

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-card px-4 py-3">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-semibold">{title}</h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search all data..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-xs"
          />
          {lastRefresh && (
            <Badge variant="secondary" className="shrink-0">
              Updated {lastRefresh.toLocaleDateString()}
            </Badge>
          )}
        </div>
      </div>
    </header>
  );
}
