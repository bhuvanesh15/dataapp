"use client";

import { useMemo, useState } from "react";
import { useData } from "@/context/DataContext";
import { drilldownForSearchTerm, ebaySearchTermsByVolume } from "@/lib/market-stats";
import { formatPrice, formatNumber } from "@/lib/utils";
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

export function SkuDrilldownView() {
  const { ebayProducts, loading } = useData();
  const terms = useMemo(() => ebaySearchTermsByVolume(ebayProducts), [ebayProducts]);
  const [term, setTerm] = useState<string>("");

  const stats = useMemo(() => {
    const t = term || terms[0]?.term || "";
    if (!t) return null;
    return drilldownForSearchTerm(ebayProducts, t);
  }, [ebayProducts, term, terms]);

  if (loading) {
    return <Skeleton className="h-[520px] w-full rounded-xl border border-[#2d3a4d] bg-[#121a26]/50" />;
  }

  if (!terms.length) {
    return (
      <Card className="border-[#2d3a4d] bg-[#121a26]/50">
        <CardContent className="p-8 text-[#8da2b2]">
          No eBay search terms in dataset. SKU drilldown uses eBay “Search Term” grouping.
        </CardContent>
      </Card>
    );
  }

  const activeTerm = term || terms[0]!.term;
  const d = stats ?? drilldownForSearchTerm(ebayProducts, activeTerm);

  return (
    <Card className="border-[#2d3a4d] bg-[#121a26]/50">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-white">SKU deep dive (eBay search term)</CardTitle>
          <p className="mt-1 text-sm text-[#8da2b2]">
            Price spread across listings that share the same scraped search term.
          </p>
        </div>
        <Select value={activeTerm} onValueChange={setTerm}>
          <SelectTrigger className="w-[min(100%,280px)] border-[#2d3a4d] bg-[#0f1623] text-sm text-white">
            <SelectValue placeholder="Search term" />
          </SelectTrigger>
          <SelectContent>
            {terms.map((t) => {
              const label = t.term.length > 36 ? `${t.term.slice(0, 36)}…` : t.term;
              return (
                <SelectItem key={t.term} value={t.term}>
                  {label} ({t.count})
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-6">
        {d && (
          <>
            <div className="rounded-lg border border-[#2d3a4d] bg-[#0f1623] p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                Price range (USD)
              </p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-white">
                {formatPrice(d.min)} – {formatPrice(d.max)}
              </p>
              <p className="mt-2 text-sm text-[#8da2b2]">
                Median {d.median != null ? formatPrice(d.median) : "N/A"} · {formatNumber(d.count)} eBay rows · same
                search term
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#2d3a4d] bg-[#0f1623] text-[11px] font-semibold uppercase tracking-wide text-[#8da2b2]">
                    <th className="p-3">Seller</th>
                    <th className="p-3">Condition</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Scrape date</th>
                  </tr>
                </thead>
                <tbody>
                  {d.rows.map((r, i) => (
                    <tr key={i} className="border-b border-[#2d3a4d]/80 hover:bg-[#0f1623]/80">
                      <td className="p-3 text-white">{r.seller}</td>
                      <td className="p-3 text-[#8da2b2]">{r.condition}</td>
                      <td className="p-3 font-medium tabular-nums text-white">{formatPrice(r.price)}</td>
                      <td className="p-3 text-[#64748b]">{r.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Phase1Insights
              items={[
                {
                  title: "Condition spread",
                  description:
                    "Compare min/median/max and the condition column to see how grading affects ask prices within the same search term.",
                },
                {
                  title: "Amazon drilldown",
                  description:
                    "Amazon rows are not grouped by a single SKU id in this CSV; use Price Benchmark for Amazon vs eBay side-by-side.",
                },
              ]}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
