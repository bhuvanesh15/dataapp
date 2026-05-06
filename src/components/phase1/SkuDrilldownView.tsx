"use client";

import { useEffect, useMemo, useState } from "react";
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

function inferBrandAndCategory(term: string): { brand: string; category: string } {
  const t = term.toLowerCase();
  let brand = "Other";
  if (t.includes("air jordan") || t.includes("jordan")) brand = "Air Jordan";
  else if (t.includes("nike")) brand = "Nike";
  else if (t.includes("adidas")) brand = "Adidas";
  else if (t.includes("new balance")) brand = "New Balance";
  else if (t.includes("puma")) brand = "Puma";
  else if (t.includes("rolex")) brand = "Rolex";

  let category = "Other";
  if (
    t.includes("sneaker") ||
    t.includes("shoe") ||
    t.includes("trainer") ||
    t.includes("jordan") ||
    t.includes("yeezy")
  ) {
    category = "Sneakers";
  } else if (t.includes("watch")) {
    category = "Watches";
  }

  return { brand, category };
}

export function SkuDrilldownView() {
  const { ebayProducts, loading } = useData();
  const terms = useMemo(() => ebaySearchTermsByVolume(ebayProducts), [ebayProducts]);
  const [brand, setBrand] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [sku, setSku] = useState<string>("");

  const termMeta = useMemo(
    () =>
      terms.map((t) => ({
        ...t,
        ...inferBrandAndCategory(t.term),
      })),
    [terms]
  );

  const brandOptions = useMemo(
    () => Array.from(new Set(termMeta.map((t) => t.brand))).sort((a, b) => a.localeCompare(b)),
    [termMeta]
  );
  const categoryOptions = useMemo(
    () => Array.from(new Set(termMeta.map((t) => t.category))).sort((a, b) => a.localeCompare(b)),
    [termMeta]
  );
  const filteredTerms = useMemo(
    () =>
      termMeta.filter(
        (t) => (brand === "all" || t.brand === brand) && (category === "all" || t.category === category)
      ),
    [brand, category, termMeta]
  );
  const activeSku = filteredTerms.some((t) => t.term === sku) ? sku : filteredTerms[0]?.term || "";

  useEffect(() => {
    if (activeSku && sku !== activeSku) setSku(activeSku);
  }, [activeSku, sku]);

  const stats = useMemo(() => {
    const t = activeSku;
    if (!t) return null;
    return drilldownForSearchTerm(ebayProducts, t);
  }, [activeSku, ebayProducts]);

  if (loading) {
    return <Skeleton className="h-[520px] w-full rounded-xl border border-[#2d3a4d] bg-[#121a26]/50" />;
  }

  if (!terms.length) {
    return (
      <Card className="border-[#2d3a4d] bg-[#121a26]/50">
        <CardContent className="p-8 text-[#8da2b2]">
          No tracked product queries in the dataset. SKU Deep Dive groups eBay rows by tracked search term.
        </CardContent>
      </Card>
    );
  }

  const d = stats ?? drilldownForSearchTerm(ebayProducts, activeSku);

  return (
    <Card className="border-[#2d3a4d] bg-[#121a26]/50">
      <CardHeader className="flex flex-col gap-4">
        <div>
          <CardTitle className="text-white">SKU Deep Dive</CardTitle>
          <p className="mt-1 text-sm text-[#8da2b2]">
            Comprehensive pricing analysis, spread variance, and active listings for a specific product.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={brand} onValueChange={setBrand}>
            <SelectTrigger className="w-[190px] border-[#2d3a4d] bg-[#0f1623] text-sm text-white">
              <SelectValue placeholder="All Brands" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {brandOptions.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[200px] border-[#2d3a4d] bg-[#0f1623] text-sm text-white">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categoryOptions.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={activeSku} onValueChange={setSku}>
            <SelectTrigger className="w-[min(100%,320px)] border-[#2d3a4d] bg-[#0f1623] text-sm text-white">
              <SelectValue placeholder="Select SKU" />
            </SelectTrigger>
            <SelectContent>
              {filteredTerms.map((t) => {
                const label = t.term.length > 40 ? `${t.term.slice(0, 40)}…` : t.term;
                return (
                  <SelectItem key={t.term} value={t.term}>
                    {label} ({t.count})
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <div className="inline-flex h-10 max-w-[280px] items-center rounded-xl border border-[#2d3a4d] bg-[#0f1623] px-3 text-sm font-medium text-white">
            {activeSku || "Select SKU"}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!d ? (
          <p className="text-sm text-[#8da2b2]">No SKUs match the selected Brand and Category filters.</p>
        ) : null}
        {d && (
          <>
            <div className="rounded-lg border border-[#2d3a4d] bg-[#0f1623] p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                Typical listing range (USD)
              </p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-white">
                {formatPrice(d.bandMin)} – {formatPrice(d.bandMax)}
              </p>
              <p className="mt-2 text-sm text-[#8da2b2]">
                Median {d.median != null ? formatPrice(d.median) : "N/A"} · {formatNumber(d.count)} matching listings
              </p>
              <p className="mt-2 text-xs leading-relaxed text-[#64748b]">
                Represents the core market pricing band. Algorithm excludes extreme edge-cases and anomalous auction
                data to provide a highly accurate pricing baseline.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#2d3a4d] bg-[#0f1623] text-[11px] font-semibold uppercase tracking-wide text-[#8da2b2]">
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Seller</th>
                    <th className="p-3">Condition</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Date Captured</th>
                  </tr>
                </thead>
                <tbody>
                  {d.rows.map((r, i) => (
                    <tr key={i} className="border-b border-[#2d3a4d]/80 hover:bg-[#0f1623]/80">
                      <td className="p-3 text-white">{r.productName}</td>
                      <td className="p-3 text-white">{r.seller}</td>
                      <td className="p-3 text-[#8da2b2]">{r.condition}</td>
                      <td className="p-3 font-medium tabular-nums text-white">{formatPrice(r.price)}</td>
                      <td className="p-3 text-[#64748b]">{r.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
