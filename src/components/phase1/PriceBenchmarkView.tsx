"use client";

import { useMemo, useState } from "react";
import { useData } from "@/context/DataContext";
import { benchmarkCategoryOptions, benchmarkConditionOptions, buildBenchmarkRows } from "@/lib/market-stats";
import { formatPrice, formatPercentWhole, cn } from "@/lib/utils";
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
  const [condition, setCondition] = useState<string>("all");

  const categories = useMemo(
    () => benchmarkCategoryOptions(ebayProducts, amazonProducts),
    [ebayProducts, amazonProducts]
  );
  const conditions = useMemo(
    () => benchmarkConditionOptions(ebayProducts, amazonProducts),
    [ebayProducts, amazonProducts]
  );

  const rows = useMemo(
    () =>
      buildBenchmarkRows(ebayProducts, amazonProducts, {
        category: category === "all" ? undefined : category,
        platform,
        condition: condition === "all" ? undefined : condition,
      }),
    [ebayProducts, amazonProducts, category, platform, condition]
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
            <SelectTrigger className="w-[200px] border-[#2d3a4d] bg-[#0f1623] text-sm text-white">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c.length > 36 ? `${c.slice(0, 36)}…` : c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={platform} onValueChange={(v) => setPlatform(v as typeof platform)}>
            <SelectTrigger className="w-[160px] border-[#2d3a4d] bg-[#0f1623] text-sm text-white">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="ebay">eBay</SelectItem>
              <SelectItem value="amazon">Amazon</SelectItem>
            </SelectContent>
          </Select>
          <Select value={condition} onValueChange={setCondition}>
            <SelectTrigger className="w-[180px] border-[#2d3a4d] bg-[#0f1623] text-sm text-white">
              <SelectValue placeholder="Condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Conditions</SelectItem>
              {conditions.map((c) => (
                <SelectItem key={c} value={c}>
                  {c.length > 34 ? `${c.slice(0, 34)}…` : c}
                </SelectItem>
              ))}
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
              <th className="p-3">Region</th>
              <th className="p-3">Condition</th>
              <th className="p-3">Price (USD)</th>
              <th className="p-3">vs median</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#8da2b2]">
                  No rows match filters. Try a different filter.
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
                        {formatPercentWhole(r.vsMarketPct)}
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
              title: "Pricing note",
              description:
                "Prices reflect ask and listing prices from monitored marketplace records. Not adjusted for shipping or duties.",
            },
            {
              title: "Region",
              description:
                "Region reflects available seller or listing location from monitored marketplace data.",
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
