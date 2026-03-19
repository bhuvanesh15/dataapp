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

  const isDashboard = title === "Dashboard";
  return (
    <header className="glass-header sticky top-0 z-50 flex h-16 shrink-0 items-center gap-4 px-4 py-3">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className={`text-xl font-bold tracking-tight ${isDashboard ? "text-gradient" : "text-white"}`}>
          {title}
        </h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search all data..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="glass-input max-w-xs rounded-xl border-white/10 bg-white/5 placeholder:text-slate-500"
          />
          {lastRefresh && (
            <Badge
              variant="secondary"
              className="shrink-0 border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.2)] backdrop-blur-sm"
            >
              Updated {lastRefresh.toLocaleDateString()}
            </Badge>
          )}
        </div>
      </div>
    </header>
  );
}
