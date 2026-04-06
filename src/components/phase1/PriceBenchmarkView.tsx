"use client";

import { useMemo, useState } from "react";
import { useData } from "@/context/DataContext";
import { benchmarkCategoryOptions, buildBenchmarkRows } from "@/lib/market-stats";
import { formatPrice, formatPercent, cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Phase1Insights } from "./Phase1Insights";

export function PriceBenchmarkView() {
  const { ebayProducts, amazonProducts, loading } = useData();
  const [category, setCategory] = useState<string>("all");
  const [platform, setPlatform] = useState<"all" | "ebay" | "amazon">("all");

  const categories = useMemo(
    () => benchmarkCategoryOptions(ebayProducts, amazonProducts),
    [ebayProducts, amazonProducts]
  );

  const rows = useMemo(
    () =>
      buildBenchmarkRows(ebayProducts, amazonProducts, {
        category: category === "all" ? undefined : category,
        platform,
      }),
    [ebayProducts, amazonProducts, category, platform]
  );

  if (loading) {
    return <Skeleton className="h-[480px] w-full rounded-xl border border-[#2d3a4d] bg-[#121a26]/50" />;
  }

  return (
    <Card className="border-[#2d3a4d] bg-[#121a26]/50">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-white">Price Benchmark Analysis</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px] border-[#2d3a4d] bg-[#0f1623] text-sm text-white">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories / terms</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c.length > 36 ? `${c.slice(0, 36)}…` : c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={platform} onValueChange={(v) => setPlatform(v as typeof platform)}>
            <SelectTrigger className="w-[140px] border-[#2d3a4d] bg-[#0f1623] text-sm text-white">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All platforms</SelectItem>
              <SelectItem value="ebay">eBay</SelectItem>
              <SelectItem value="amazon">Amazon</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#2d3a4d] bg-[#0f1623] text-[11px] font-semibold uppercase tracking-wide text-[#8da2b2]">
              <th className="p-3">Brand / model</th>
              <th className="p-3">Platform</th>
              <th className="p-3">Region / dept</th>
              <th className="p-3">Condition</th>
              <th className="p-3">Price (USD)</th>
              <th className="p-3">vs median</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#8da2b2]">
                  No rows match filters. Upload CSVs or widen filters.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-[#2d3a4d]/80 transition-colors hover:bg-[#0f1623]/80"
                >
                  <td className="p-3 text-white">{r.brandModel}</td>
                  <td className="p-3 text-[#cbd5e1]">{r.platform}</td>
                  <td className="p-3 text-[#8da2b2]">{r.region}</td>
                  <td className="p-3 text-[#8da2b2]">{r.condition}</td>
                  <td className="p-3 font-medium tabular-nums text-white">{formatPrice(r.price)}</td>
                  <td className="p-3">
                    {r.vsMarketPct == null ? (
                      "—"
                    ) : (
                      <span
                        className={cn(
                          "inline-block rounded px-2 py-0.5 text-xs font-semibold",
                          r.vsMarketPct > 10 && "bg-emerald-500/15 text-emerald-400",
                          r.vsMarketPct < -10 && "bg-rose-500/15 text-rose-400",
                          r.vsMarketPct >= -10 &&
                            r.vsMarketPct <= 10 &&
                            "bg-amber-500/15 text-amber-400"
                        )}
                      >
                        {r.vsMarketPct > 0 ? "+" : ""}
                        {formatPercent(r.vsMarketPct)}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <Phase1Insights
          items={[
            {
              title: "Dataset note",
              description:
                "“vs median” compares each row to the median price across all Amazon + eBay listings in the loaded scrape. Not a live competitor benchmark.",
            },
            {
              title: "Regional mix (illustrative)",
              description:
                "eBay rows use Location of Product; Amazon uses department or address tail. Tariff and cross-border routing are not modeled in Phase 1.",
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
