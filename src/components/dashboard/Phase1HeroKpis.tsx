"use client";

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PHASE1_HERO_KPIS, type HeroKpiTrend } from "@/lib/site-config";
import { cn } from "@/lib/utils";

function TrendIcon({ trend }: { trend: HeroKpiTrend }) {
  if (trend === "positive") return <ArrowUpRight className="h-4 w-4" aria-hidden />;
  if (trend === "negative") return <ArrowDownRight className="h-4 w-4" aria-hidden />;
  return <Minus className="h-4 w-4" aria-hidden />;
}

const accentClass: Record<string, string> = {
  "cross-market-price-gap": "card-accent-cyan",
  "tariff-margin-impact": "card-accent-warning",
  "market-price-position": "card-accent-purple",
  "alt-vendor-liquidity": "card-accent-emerald",
};

export function Phase1HeroKpis() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {PHASE1_HERO_KPIS.map((kpi) => {
        const trendColor =
          kpi.trend === "positive"
            ? "text-[#00d084]"
            : kpi.trend === "negative"
              ? "text-[#ff5e5e]"
              : "text-[#8da2b2]";
        return (
          <Card
            key={kpi.id}
            className={cn(accentClass[kpi.id] ?? "card-accent-cyan")}
          >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <span className="text-[13px] font-normal uppercase leading-tight tracking-wide text-[#8da2b2]">
                {kpi.label}
              </span>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap items-end gap-2">
                <span className="text-[32px] font-bold leading-none tabular-nums tracking-tight text-white">
                  {kpi.value}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-sm font-semibold tabular-nums",
                    trendColor
                  )}
                >
                  <TrendIcon trend={kpi.trend} />
                  {kpi.trendLabel}
                </span>
              </div>
              <p className="text-xs leading-snug text-[#64748b]">{kpi.footnote}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
