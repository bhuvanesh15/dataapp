"use client";

import { useMemo, useState } from "react";
import { useData } from "@/context/DataContext";
import { buildSellerDiscoveryCards } from "@/lib/market-stats";
import { formatNumber } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SellerDiscoveryView() {
  const { ebayProducts, amazonProducts, loading } = useData();
  const [regionScope, setRegionScope] = useState<"non_us" | "all">("non_us");
  const [minRating, setMinRating] = useState<string>("all");

  const minRatingPct = minRating === "all" ? null : minRating === "95" ? 95 : minRating === "90" ? 90 : null;

  const cards = useMemo(
    () =>
      buildSellerDiscoveryCards(ebayProducts, amazonProducts, {
        onlyNonUS: regionScope === "non_us",
        minRatingPct,
        includeUnrated: minRating === "all",
        limit: 24,
      }),
    [ebayProducts, amazonProducts, regionScope, minRating, minRatingPct]
  );

  if (loading) {
    return <Skeleton className="h-[520px] w-full rounded-xl border border-[#2d3a4d] bg-[#121a26]/50" />;
  }

  return (
    <div className="space-y-4">
      <Card className="border-[#2d3a4d] bg-[#121a26]/50">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-white">Alternative Seller Discovery</CardTitle>
            <p className="mt-1 text-sm text-[#8da2b2]">
              eBay sellers aggregated from monitored product rows. Default view highlights non-US locations.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={regionScope} onValueChange={(v) => setRegionScope(v as typeof regionScope)}>
              <SelectTrigger className="w-[200px] border-[#2d3a4d] bg-[#0f1623] text-sm text-white">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="non_us">Outside US</SelectItem>
                <SelectItem value="all">All Regions</SelectItem>
              </SelectContent>
            </Select>
            <Select value={minRating} onValueChange={setMinRating}>
              <SelectTrigger className="w-[180px] border-[#2d3a4d] bg-[#0f1623] text-sm text-white">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="95">Min Rating: 95%+</SelectItem>
                <SelectItem value="90">Min Rating: 90%+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {cards.length === 0 ? (
            <p className="text-[#8da2b2]">
              No sellers match these filters. Try &quot;All Regions&quot; or a lower minimum rating.
            </p>
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
                    {s.ratingPct != null
                      ? `${formatNumber(s.ratingPct)}% positive`
                      : "Rating unavailable"}
                  </div>
                </div>
                <div className="grid gap-2 text-sm text-[#8da2b2] sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <strong className="text-[#cbd5e1]">Location</strong>
                    <br />
                    {s.location}
                  </div>
                  <div>
                    <strong className="text-[#cbd5e1]">Units Sold</strong>
                    <br />
                    {formatNumber(s.itemsSold)}
                  </div>
                  <div>
                    <strong className="text-[#cbd5e1]">Product Listings</strong>
                    <br />
                    {formatNumber(s.productListings)}
                  </div>
                  <div>
                    <strong className="text-[#cbd5e1]">Reviews</strong>
                    <br />
                    {formatNumber(s.reviews)}
                  </div>
                  <div>
                    <strong className="text-[#cbd5e1]">Followers</strong>
                    <br />
                    {formatNumber(s.followers)}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
