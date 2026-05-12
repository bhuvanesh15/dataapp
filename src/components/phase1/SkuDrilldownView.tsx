"use client";

import { useMemo, useState } from "react";
import { useData } from "@/context/DataContext";
import {
  buildSkuCrossPlatformDrilldown,
  buildSkuMasterOptions,
} from "@/lib/market-stats";
import { formatPrice, formatNumber, formatSignedPercent1dp, cn } from "@/lib/utils";
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

export function SkuDrilldownView() {
  const { ebayProducts, amazonProducts, loading } = useData();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>("");

  const master = useMemo(
    () => buildSkuMasterOptions(ebayProducts, amazonProducts),
    [ebayProducts, amazonProducts]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return master;
    return master.filter((o) => o.displayLabel.toLowerCase().includes(q));
  }, [master, query]);

  const active = filtered.find((o) => o.id === selectedId) ?? filtered[0] ?? master[0] ?? null;

  const stats = useMemo(() => {
    if (!active) return null;
    return buildSkuCrossPlatformDrilldown(ebayProducts, amazonProducts, active.canonicalKey);
  }, [active, ebayProducts, amazonProducts]);

  if (loading) {
    return <Skeleton className="h-[520px] w-full rounded-xl border border-[#2d3a4d] bg-[#121a26]/50" />;
  }

  if (!master.length) {
    return (
      <Card className="border-[#2d3a4d] bg-[#121a26]/50">
        <CardContent className="p-8 text-[#8da2b2]">
          No cross-platform SKU keys found. SKU Drilldown needs eBay Search Term and/or Amazon Search input / item
          model numbers to align listings.
        </CardContent>
      </Card>
    );
  }

  const d = stats;

  return (
    <Card className="border-[#2d3a4d] bg-[#121a26]/50">
      <CardHeader className="flex flex-col gap-4">
        <div>
          <CardTitle className="text-white">SKU Deep Dive</CardTitle>
          <p className="mt-1 text-sm text-[#8da2b2]">
            Comprehensive pricing analysis, spread variance, and active listings for a specific product.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search SKU…"
            className="h-10 w-full max-w-xs border-[#2d3a4d] bg-[#0f1623] text-sm text-white placeholder:text-[#64748b]"
            aria-label="Search SKU"
          />
          <Select
            value={active?.id ?? ""}
            onValueChange={(id) => {
              setSelectedId(id);
              setQuery("");
            }}
          >
            <SelectTrigger className="w-full min-w-[240px] max-w-[min(100%,520px)] border-[#2d3a4d] bg-[#0f1623] text-sm text-white">
              <SelectValue placeholder="Select SKU" />
            </SelectTrigger>
            <SelectContent>
              {filtered.map((o) => (
                <SelectItem key={o.id} value={o.id} textValue={o.displayLabel}>
                  {o.displayLabel.length > 72 ? `${o.displayLabel.slice(0, 72)}…` : o.displayLabel}{" "}
                  <span className="text-[#64748b]">({o.listingCount})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="inline-flex min-h-10 max-w-full items-center rounded-xl border border-[#2d3a4d] bg-[#0f1623] px-3 py-2 text-sm font-medium text-white">
            {active?.displayLabel ?? "Select SKU"}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!filtered.length ? (
          <p className="text-sm text-[#8da2b2]">No SKUs match your search.</p>
        ) : null}
        {d && filtered.length > 0 && (
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
              <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#2d3a4d] bg-[#0f1623] text-[11px] font-semibold uppercase tracking-wide text-[#8da2b2]">
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Platform</th>
                    <th className="p-3">Seller</th>
                    <th className="p-3">Condition</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Currency</th>
                    <th className="p-3">VS median</th>
                    <th className="p-3">Last sold / listed</th>
                    <th className="p-3">Source URL</th>
                  </tr>
                </thead>
                <tbody>
                  {d.rows.map((r) => (
                    <tr key={r.id} className="border-b border-[#2d3a4d]/80 hover:bg-[#0f1623]/80">
                      <td className="p-3 text-white">{r.productName}</td>
                      <td className="p-3 text-[#cbd5e1]">{r.platform}</td>
                      <td className="p-3 text-white">{r.seller}</td>
                      <td className="p-3 text-[#8da2b2]">{r.condition}</td>
                      <td className="p-3 font-medium tabular-nums text-white">{formatPrice(r.price)}</td>
                      <td className="p-3 text-[#64748b]">{r.currency}</td>
                      <td className="p-3">
                        {r.vsMedianPct == null ? (
                          "—"
                        ) : (
                          <span
                            className={cn(
                              "inline-block rounded px-2 py-0.5 text-xs font-semibold",
                              r.vsMedianPct > 10 && "bg-emerald-500/15 text-emerald-400",
                              r.vsMedianPct < -10 && "bg-rose-500/15 text-rose-400",
                              r.vsMedianPct >= -10 &&
                                r.vsMedianPct <= 10 &&
                                "bg-amber-500/15 text-amber-400"
                            )}
                          >
                            {formatSignedPercent1dp(r.vsMedianPct)}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-[#64748b]">{r.lastDate}</td>
                      <td className="p-3">
                        {r.sourceUrl ? (
                          <a
                            href={r.sourceUrl}
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
        )}
      </CardContent>
    </Card>
  );
}
