"use client";

import { useMemo, useState } from "react";
import { useData } from "@/context/DataContext";
import { buildSellerDiscoveryCards } from "@/lib/market-stats";
import { formatNumber, formatPercentWhole, titleCaseDisplay } from "@/lib/utils";
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
  const [locationScope, setLocationScope] = useState<"non_us" | "all">("non_us");
  const [minRating, setMinRating] = useState<string>("all");

  const minRatingPct = minRating === "all" ? null : minRating === "95" ? 95 : minRating === "90" ? 90 : null;

  const sellers = useMemo(
    () =>
      buildSellerDiscoveryCards(ebayProducts, amazonProducts, {
        onlyNonUS: locationScope === "non_us",
        minRatingPct,
        includeUnrated: minRating === "all",
        limit: 24,
      }),
    [ebayProducts, amazonProducts, locationScope, minRating, minRatingPct]
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
            <Select value={locationScope} onValueChange={(v) => setLocationScope(v as typeof locationScope)}>
              <SelectTrigger className="w-[200px] border-[#2d3a4d] bg-[#0f1623] text-sm text-white">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="non_us">Outside US</SelectItem>
                <SelectItem value="all">All Locations</SelectItem>
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
          {sellers.length === 0 ? (
            <p className="text-[#8da2b2]">
              No sellers match these filters. Try &quot;All Locations&quot; or a lower minimum rating.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#2d3a4d] bg-[#0f1623] text-[11px] font-semibold uppercase tracking-wide text-[#8da2b2]">
                    <th className="p-3">Seller</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Units Sold</th>
                    <th className="p-3">Product Listings</th>
                    <th className="p-3">Reviews</th>
                    <th className="p-3">Followers</th>
                    <th className="p-3">Positive %</th>
                  </tr>
                </thead>
                <tbody>
                  {sellers.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-[#2d3a4d]/80 transition-colors hover:bg-[#0f1623]/80"
                    >
                      <td className="p-3 text-white">{s.name}</td>
                      <td className="p-3 text-[#8da2b2]">{titleCaseDisplay(s.location)}</td>
                      <td className="p-3 text-[#cbd5e1]">{formatNumber(s.itemsSold)}</td>
                      <td className="p-3 text-[#cbd5e1]">{formatNumber(s.productListings)}</td>
                      <td className="p-3 text-[#cbd5e1]">{formatNumber(s.reviews)}</td>
                      <td className="p-3 text-[#cbd5e1]">{formatNumber(s.followers)}</td>
                      <td className="p-3">
                        {s.ratingPct == null ? (
                          <span className="text-[#64748b]">—</span>
                        ) : (
                          <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                            {formatPercentWhole(s.ratingPct)}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
