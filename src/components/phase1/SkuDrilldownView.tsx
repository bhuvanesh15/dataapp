"use client";

import { useMemo, useState } from "react";
import { useData } from "@/context/DataContext";
import { formatPrice, formatNumber, titleCaseDisplay, formatPlatformLabel } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEMO_CATEGORIES = ["Sneakers"] as const;
const DEMO_BRANDS = ["Nike", "Jordan"] as const;

function median(values: number[]): number | null {
  const sorted = values.filter((n) => n > 0).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

function priceBand(values: number[]): { min: number; max: number } {
  const sorted = values.filter((n) => n > 0).sort((a, b) => a - b);
  if (!sorted.length) return { min: 0, max: 0 };
  const lo = Math.floor(sorted.length * 0.1);
  const hi = Math.ceil(sorted.length * 0.9) - 1;
  return {
    min: sorted[Math.max(0, lo)] ?? sorted[0]!,
    max: sorted[Math.min(sorted.length - 1, Math.max(0, hi))] ?? sorted[sorted.length - 1]!,
  };
}

export function SkuDrilldownView() {
  const { skuIndexRows, loading } = useData();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [brand, setBrand] = useState<string>("all");
  const [selectedSku, setSelectedSku] = useState<string>("");

  const filteredPool = useMemo(() => {
    return skuIndexRows.filter((r) => {
      if (category !== "all" && r.normalized_category !== category) return false;
      if (brand !== "all" && r.normalized_Brand !== brand) return false;
      return true;
    });
  }, [skuIndexRows, category, brand]);

  const skuOptions = useMemo(() => {
    const map = new Map<
      string,
      { sku: string; label: string; count: number; score: number }
    >();
    for (const r of filteredPool) {
      const existing = map.get(r.normalized_sku);
      if (!existing) {
        map.set(r.normalized_sku, {
          sku: r.normalized_sku,
          label: `${r.normalized_sku} · ${titleCaseDisplay(r.product_family)}`,
          count: 1,
          score: r.demo_priority_score,
        });
      } else {
        existing.count += 1;
        existing.score = Math.max(existing.score, r.demo_priority_score);
      }
    }
    return Array.from(map.values()).sort((a, b) => b.score - a.score || b.count - a.count);
  }, [filteredPool]);

  const searchFiltered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return skuOptions;
    return skuOptions.filter(
      (o) => o.sku.toLowerCase().includes(q) || o.label.toLowerCase().includes(q)
    );
  }, [skuOptions, query]);

  const activeSku =
    searchFiltered.find((o) => o.sku === selectedSku)?.sku ??
    searchFiltered[0]?.sku ??
    skuOptions[0]?.sku ??
    "";

  const listingRows = useMemo(() => {
    if (!activeSku) return [];
    return filteredPool
      .filter((r) => r.normalized_sku === activeSku)
      .sort((a, b) => b.clean_price_usd - a.clean_price_usd);
  }, [filteredPool, activeSku]);

  const stats = useMemo(() => {
    const prices = listingRows.map((r) => r.clean_price_usd);
    const { min, max } = priceBand(prices);
    return {
      bandMin: min,
      bandMax: max,
      median: median(prices),
      count: listingRows.length,
    };
  }, [listingRows]);

  if (loading) {
    return <Skeleton className="h-[520px] w-full rounded-xl border border-[#2d3a4d] bg-[#121a26]/50" />;
  }

  if (!skuIndexRows.length) {
    return (
      <Card className="border-[#2d3a4d] bg-[#121a26]/50">
        <CardContent className="p-8 text-[#8da2b2]">
          No SKU index data loaded. Expected sku_index_v2.csv in public/data.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#2d3a4d] bg-[#121a26]/50">
      <CardHeader className="flex flex-col gap-4">
        <div>
          <CardTitle className="text-white">SKU Deep Dive</CardTitle>
          <p className="mt-1 text-sm text-[#8da2b2]">
            Cross-platform listings from the validated sku_index_v2 export (Amazon and eBay).
          </p>
        </div>
        <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full min-w-[160px] max-w-[180px] border-[#2d3a4d] bg-[#0f1623] text-sm text-white">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {DEMO_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {titleCaseDisplay(c)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={brand} onValueChange={setBrand}>
            <SelectTrigger className="w-full min-w-[140px] max-w-[160px] border-[#2d3a4d] bg-[#0f1623] text-sm text-white">
              <SelectValue placeholder="Brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {DEMO_BRANDS.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search SKU…"
            className="h-10 w-full max-w-xs border-[#2d3a4d] bg-[#0f1623] text-sm text-white placeholder:text-[#64748b]"
            aria-label="Search SKU"
          />
          <Select
            value={activeSku}
            onValueChange={(sku) => {
              setSelectedSku(sku);
              setQuery("");
            }}
          >
            <SelectTrigger className="w-full min-w-[240px] max-w-[min(100%,520px)] border-[#2d3a4d] bg-[#0f1623] text-sm text-white">
              <SelectValue placeholder="Select SKU" />
            </SelectTrigger>
            <SelectContent>
              {searchFiltered.map((o) => (
                <SelectItem key={o.sku} value={o.sku} textValue={o.label}>
                  {o.label.length > 72 ? `${o.label.slice(0, 72)}…` : o.label}{" "}
                  <span className="text-[#64748b]">({o.count})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!searchFiltered.length ? (
          <p className="text-sm text-[#8da2b2]">No SKUs match your filters or search.</p>
        ) : listingRows.length > 0 ? (
          <>
            <div className="rounded-lg border border-[#2d3a4d] bg-[#0f1623] p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                Typical listing range (USD)
              </p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-white">
                {formatPrice(stats.bandMin)} – {formatPrice(stats.bandMax)}
              </p>
              <p className="mt-2 text-sm text-[#8da2b2]">
                Median {stats.median != null ? formatPrice(stats.median) : "N/A"} ·{" "}
                {formatNumber(stats.count)} matching listings · SKU {activeSku}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#2d3a4d] bg-[#0f1623] text-[11px] font-semibold uppercase tracking-wide text-[#8da2b2]">
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Platform</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Condition</th>
                    <th className="p-3">Price (USD)</th>
                    <th className="p-3">Source URL</th>
                  </tr>
                </thead>
                <tbody>
                  {listingRows.map((r, i) => (
                    <tr
                      key={`${r.platform}-${r.product_url}-${i}`}
                      className="border-b border-[#2d3a4d]/80 hover:bg-[#0f1623]/80"
                    >
                      <td className="p-3 text-white">{titleCaseDisplay(r.product_family)}</td>
                      <td className="p-3 text-[#cbd5e1]">{formatPlatformLabel(r.platform)}</td>
                      <td className="p-3 font-mono text-xs text-[#8da2b2]">{r.normalized_sku}</td>
                      <td className="p-3 text-[#8da2b2]">
                        {titleCaseDisplay(r.normalized_condition)}
                      </td>
                      <td className="p-3 font-medium tabular-nums text-white">
                        {formatPrice(r.clean_price_usd)}
                      </td>
                      <td className="p-3">
                        {r.product_url ? (
                          <a
                            href={r.product_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:underline"
                          >
                            Open
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
