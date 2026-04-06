"use client";

import { useMemo } from "react";
import { useData } from "@/context/DataContext";
import { buildSellerDiscoveryCards } from "@/lib/market-stats";
import { formatNumber } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Phase1Insights } from "./Phase1Insights";

export function SellerDiscoveryView() {
  const { ebayProducts, amazonProducts, loading } = useData();
  const cards = useMemo(
    () => buildSellerDiscoveryCards(ebayProducts, amazonProducts, 12),
    [ebayProducts, amazonProducts]
  );

  if (loading) {
    return <Skeleton className="h-[520px] w-full rounded-xl border border-[#2d3a4d] bg-[#121a26]/50" />;
  }

  return (
    <div className="space-y-4">
      <Card className="border-[#2d3a4d] bg-[#121a26]/50">
        <CardHeader>
          <CardTitle className="text-white">Alternative Seller Discovery</CardTitle>
          <p className="text-sm text-[#8da2b2]">
            Top sellers from your Amazon and eBay CSVs (by items sold / listing count).
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {cards.length === 0 ? (
            <p className="text-[#8da2b2]">No seller rows in dataset.</p>
          ) : (
            cards.map((s) => (
              <div
                key={s.id}
                className="rounded-lg border border-[#2d3a4d] bg-[#0f1623] p-4"
              >
                <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-white">{s.name}</p>
                    <p className="mt-1 text-xs text-[#64748b]">Source: {s.source}</p>
                  </div>
                  <div className="rounded bg-emerald-500/15 px-2 py-1 text-xs font-semibold text-emerald-400">
                    {s.source === "eBay" && s.ratingPct != null
                      ? `${formatNumber(s.ratingPct)}% positive`
                      : s.source === "Amazon" && s.ratingStars != null
                        ? `${s.ratingStars.toFixed(1)}★ avg`
                        : "Rating N/A"}
                  </div>
                </div>
                <div className="grid gap-2 text-sm text-[#8da2b2] sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <strong className="text-[#cbd5e1]">Location / address</strong>
                    <br />
                    {s.location}
                  </div>
                  <div>
                    <strong className="text-[#cbd5e1]">Items sold / rows</strong>
                    <br />
                    {s.source === "eBay" ? formatNumber(s.itemsSold) : `${formatNumber(s.listingSample)} listings`}
                  </div>
                  <div>
                    <strong className="text-[#cbd5e1]">Reviews / ratings</strong>
                    <br />
                    {formatNumber(s.reviews)}
                  </div>
                  {s.source === "eBay" && (
                    <div>
                      <strong className="text-[#cbd5e1]">Followers</strong>
                      <br />
                      {formatNumber(s.followers)}
                    </div>
                  )}
                  <div>
                    <strong className="text-[#cbd5e1]">Listings in scrape</strong>
                    <br />
                    {formatNumber(s.listingSample)}
                  </div>
                </div>
              </div>
            ))
          )}

          <Phase1Insights
            items={[
              {
                title: "Data coverage",
                description:
                  "Seller metrics come from the uploaded scrape only. “340+ vendors” style figures from the wireframe are not inferred automatically.",
              },
              {
                title: "Quality signal (placeholder)",
                description:
                  "High positive % on eBay and strong Amazon ratings often correlate with reliability — validate externally before sourcing.",
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
