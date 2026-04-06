"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { PriceBenchmarkView } from "@/components/phase1/PriceBenchmarkView";
import { SellerDiscoveryView } from "@/components/phase1/SellerDiscoveryView";
import { MarketVelocityView } from "@/components/phase1/MarketVelocityView";
import { SkuDrilldownView } from "@/components/phase1/SkuDrilldownView";

export type MarketIntelTabId = "benchmark" | "sellers" | "velocity" | "drilldown";

const TABS: { id: MarketIntelTabId; label: string }[] = [
  { id: "benchmark", label: "Price Benchmark" },
  { id: "sellers", label: "Seller Discovery" },
  { id: "velocity", label: "Market Velocity" },
  { id: "drilldown", label: "SKU Drilldown" },
];

function readTabFromHash(): MarketIntelTabId | null {
  if (typeof window === "undefined") return null;
  const h = window.location.hash.replace(/^#/, "");
  const found = TABS.find((t) => t.id === h);
  return found ? found.id : null;
}

export function MarketIntelligenceTabs() {
  const [active, setActive] = useState<MarketIntelTabId>("benchmark");

  useEffect(() => {
    const fromHash = readTabFromHash();
    if (fromHash) setActive(fromHash);
    const onHash = () => {
      const id = readTabFromHash();
      if (id) setActive(id);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const selectTab = useCallback((id: MarketIntelTabId) => {
    setActive(id);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${id}`);
    }
  }, []);

  return (
    <div className="space-y-0">
      <div
        className="flex flex-wrap gap-1 border-b border-[#334155] pb-0"
        role="tablist"
        aria-label="Market intelligence sections"
      >
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              id={`tab-${tab.id}`}
              aria-controls={`panel-${tab.id}`}
              onClick={() => selectTab(tab.id)}
              className={cn(
                "border-b-2 border-transparent px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-[#38bdf8] text-[#38bdf8]"
                  : "text-[#8da2b2] hover:text-white"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        className="mt-6"
        role="tabpanel"
        id={`panel-${active}`}
        aria-labelledby={`tab-${active}`}
      >
        {active === "benchmark" && <PriceBenchmarkView />}
        {active === "sellers" && <SellerDiscoveryView />}
        {active === "velocity" && <MarketVelocityView />}
        {active === "drilldown" && <SkuDrilldownView />}
      </div>
    </div>
  );
}
