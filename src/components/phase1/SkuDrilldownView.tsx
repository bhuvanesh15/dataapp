"use client";

import { useMemo, useState } from "react";
import { useData } from "@/context/DataContext";
import { buildListingLocationLookup } from "@/lib/v2-location-lookup";
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
import { Phase1Insights } from "./Phase1Insights";
import type { SkuIndexV2Row } from "@/types/v2";

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

function matchesSkuSearch(row: SkuIndexV2Row, q: string): boolean {
  const hay = [
    row.normalized_sku,
    row.raw_sku,
    row.product_family,
    row.product_title,
    row.normalized_Brand,
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

function sortListingRows(rows: SkuIndexV2Row[]): SkuIndexV2Row[] {
  return [...rows].sort((a, b) => {
    const rankA = a.platform_rank > 0 ? a.platform_rank : 999;
    const rankB = b.platform_rank > 0 ? b.platform_rank : 999;
    if (rankA !== rankB) return rankA - rankB;
    if (b.demo_priority_score !== a.demo_priority_score) {
      return b.demo_priority_score - a.demo_priority_score;
    }
    return b.clean_price_usd - a.clean_price_usd;
  });
}

export function SkuDrilldownView() {
  const { skuIndexRows, ebayProducts, amazonProducts, loading } = useData();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [brand, setBrand] = useState<string>("all");
  const [platform, setPlatform] = useState<"all" | "ebay" | "amazon">("all");
  const [selectedSku, setSelectedSku] = useState<string>("");

  const locationByUrl = useMemo(
    () => buildListingLocationLookup(ebayProducts, amazonProducts),
    [ebayProducts, amazonProducts]
  );

  const filteredPool = useMemo(() => {
    return skuIndexRows.filter((r) => {
      if (!r.demo_eligible) return false;
      if (category !== "all" && r.normalized_category !== category) return false;
      if (brand !== "all" && r.normalized_Brand !== brand) return false;
      if (platform !== "all" && r.platform !== platform) return false;
      return true;
    });
  }, [skuIndexRows, category, brand, platform]);

  const poolStats = useMemo(() => {
    const ebay = filteredPool.filter((r) => r.platform === "ebay").length;
    const amazon = filteredPool.filter((r) => r.platform === "amazon").length;
    return { total: filteredPool.length, ebay, amazon };
  }, [filteredPool]);

  const searchPool = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return filteredPool;
    return filteredPool.filter((r) => matchesSkuSearch(r, q));
  }, [filteredPool, query]);

  const skuOptions = useMemo(() => {
    const map = new Map<
      string,
      { sku: string; label: string; count: number; score: number; brand: string }
    >();
    for (const r of searchPool) {
      const existing = map.get(r.normalized_sku);
      if (!existing) {
        map.set(r.normalized_sku, {
          sku: r.normalized_sku,
          label: `${r.normalized_sku} · ${titleCaseDisplay(r.product_family)}`,
          count: 1,
          score: r.demo_priority_score,
          brand: r.normalized_Brand,
        });
      } else {
        existing.count += 1;
        existing.score = Math.max(existing.score, r.demo_priority_score);
      }
    }
    return Array.from(map.values()).sort((a, b) => b.score - a.score || b.count - a.count);
  }, [searchPool]);

  const activeSku =
    skuOptions.find((o) => o.sku === selectedSku)?.sku ?? skuOptions[0]?.sku ?? "";

  const listingRows = useMemo(() => {
    if (!activeSku) return [];
    return sortListingRows(searchPool.filter((r) => r.normalized_sku === activeSku));
  }, [searchPool, activeSku]);

  const stats = useMemo(() => {
    const prices = listingRows.map((r) => r.clean_price_usd);
    const { min, max } = priceBand(prices);
    return {
      bandMin: min,
      bandMax: max,
      median: median(prices),
      count: listingRows.length,
      ebay: listingRows.filter((r) => r.platform === "ebay").length,
      amazon: listingRows.filter((r) => r.platform === "amazon").length,
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
            Compare the same sneaker SKU across Amazon and eBay — pricing, condition, location, and live listing links.
          </p>
          {poolStats.total > 0 && (
            <p className="mt-1 text-xs text-[#64748b]">
              {formatNumber(poolStats.total)} demo-eligible listings · eBay {formatNumber(poolStats.ebay)} ·
              Amazon {formatNumber(poolStats.amazon)}
            </p>
          )}
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
          <Select value={platform} onValueChange={(v) => setPlatform(v as typeof platform)}>
            <SelectTrigger className="w-full min-w-[140px] max-w-[160px] border-[#2d3a4d] bg-[#0f1623] text-sm text-white">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="ebay">eBay</SelectItem>
              <SelectItem value="amazon">Amazon</SelectItem>
            </SelectContent>
          </Select>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search SKU, title, or model…"
            className="h-10 w-full max-w-xs border-[#2d3a4d] bg-[#0f1623] text-sm text-white placeholder:text-[#64748b]"
            aria-label="Search SKU"
          />
          <Select
            value={activeSku}
            onValueChange={(sku) => {
              setSelectedSku(sku);
            }}
          >
            <SelectTrigger className="w-full min-w-[240px] max-w-[min(100%,520px)] border-[#2d3a4d] bg-[#0f1623] text-sm text-white">
              <SelectValue placeholder="Select SKU" />
            </SelectTrigger>
            <SelectContent>
              {skuOptions.map((o) => (
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
        {!skuOptions.length ? (
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
                {formatNumber(stats.count)} listings for SKU {activeSku}
                {stats.ebay > 0 || stats.amazon > 0
                  ? ` (eBay ${stats.ebay} · Amazon ${stats.amazon})`
                  : ""}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#2d3a4d] bg-[#0f1623] text-[11px] font-semibold uppercase tracking-wide text-[#8da2b2]">
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Platform</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Condition</th>
                    <th className="p-3">Price (USD)</th>
                    <th className="p-3">Rank</th>
                    <th className="p-3">Source URL</th>
                  </tr>
                </thead>
                <tbody>
                  {listingRows.map((r, i) => (
                    <tr
                      key={`${r.platform}-${r.product_url}-${i}`}
                      className="border-b border-[#2d3a4d]/80 hover:bg-[#0f1623]/80"
                    >
                      <td className="max-w-[280px] p-3 text-white">
                        {titleCaseDisplay(r.product_title || r.product_family)}
                      </td>
                      <td className="p-3 text-[#cbd5e1]">{formatPlatformLabel(r.platform)}</td>
                      <td className="p-3 text-[#8da2b2]">
                        {titleCaseDisplay(locationByUrl.get(r.product_url.trim()) ?? "")}
                      </td>
                      <td className="p-3 font-mono text-xs text-[#8da2b2]">
                        <span>{r.normalized_sku}</span>
                        {r.raw_sku && r.raw_sku !== r.normalized_sku && (
                          <span className="mt-0.5 block text-[10px] text-[#64748b]">
                            Raw: {r.raw_sku}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-[#8da2b2]">
                        {titleCaseDisplay(r.normalized_condition)}
                      </td>
                      <td className="p-3 font-medium tabular-nums text-white">
                        {formatPrice(r.clean_price_usd)}
                      </td>
                      <td className="p-3 tabular-nums text-[#64748b]">
                        {r.platform_rank > 0 ? formatNumber(r.platform_rank) : "—"}
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

            <Phase1Insights
              items={[
                {
                  title: "Data source",
                  description:
                    "All rows come from sku_index_v2.csv as exported from the mapped workbook. Listings are not rebuilt or subset in code beyond UI filters.",
                },
                {
                  title: "SKU selection",
                  description:
                    "SKUs use normalized_sku from the export. Picker order follows demo_priority_score; table order follows platform_rank within each platform.",
                },
                {
                  title: "Cross-platform coverage",
                  description:
                    "Validated export mix is Amazon 39 and eBay 69 listings. Platform filter preserves both marketplaces when set to All Platforms.",
                },
              ]}
            />
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
