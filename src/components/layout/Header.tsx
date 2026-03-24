"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Download } from "lucide-react";
import { useData } from "@/context/DataContext";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildPhase1DownloadPayload } from "@/lib/site-config";

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

function downloadPhase1Summary() {
  const payload = buildPhase1DownloadPayload();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "intelligents-dashboard-summary.json";
  a.click();
  URL.revokeObjectURL(url);
}

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const { lastRefresh } = useData();
  const { globalFilter, setGlobalFilter } = useGlobalSearch();
  const pathname = usePathname() ?? "/";
  const isHome = pathname === "/";

  return (
    <header className="glass-header sticky top-0 z-50 flex min-h-16 shrink-0 flex-col justify-center gap-1 px-4 py-3">
      <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <h1
            className={`text-xl font-bold tracking-tight md:text-[28px] md:leading-tight ${
              isHome ? "text-gradient" : "text-white"
            }`}
          >
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 max-w-3xl text-xs font-normal leading-snug text-[#8da2b2] md:text-sm">
              {subtitle}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="glass-input h-9 max-w-xs rounded-xl border-[#2d3a4d] bg-[#121a26]/80 placeholder:text-[#64748b]"
            aria-label="Search"
          />
          <Button
            type="button"
            variant="default"
            size="sm"
            className="shrink-0 gap-1.5 rounded-xl"
            onClick={downloadPhase1Summary}
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          {lastRefresh ? (
            <Badge
              variant="secondary"
              className="shrink-0 border-[rgba(56,189,248,0.35)] bg-[rgba(56,189,248,0.12)] px-2.5 py-0.5 text-[#bae6fd] shadow-[0_0_12px_rgba(56,189,248,0.15)] backdrop-blur-sm"
            >
              Data loaded {lastRefresh.toLocaleDateString()}
            </Badge>
          ) : null}
        </div>
      </div>
    </header>
  );
}
