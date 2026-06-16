"use client";

import { useData } from "@/context/DataContext";
import { formatNumber, formatPositivePct, titleCaseDisplay } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SellerDiscoveryView() {
  const { sellerDiscoveryRows, loading } = useData();

  if (loading) {
    return <Skeleton className="h-[520px] w-full rounded-xl border border-[#2d3a4d] bg-[#121a26]/50" />;
  }

  return (
    <div className="space-y-4">
      <Card className="border-[#2d3a4d] bg-[#121a26]/50">
        <CardHeader>
          <div>
            <CardTitle className="text-white">Seller Discovery</CardTitle>
            <p className="mt-1 text-sm text-[#8da2b2]">
              Top eBay sellers by units sold, reviews, and positive feedback from monitored sneaker listings.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {sellerDiscoveryRows.length === 0 ? (
            <p className="text-[#8da2b2]">No seller data loaded.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#2d3a4d] bg-[#0f1623] text-[11px] font-semibold uppercase tracking-wide text-[#8da2b2]">
                    <th className="p-3">Seller</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Units Sold</th>
                    <th className="p-3">Product Listings</th>
                    <th className="p-3">Reviews</th>
                    <th className="p-3">Positive %</th>
                  </tr>
                </thead>
                <tbody>
                  {sellerDiscoveryRows.map((s) => (
                    <tr
                      key={s.seller}
                      className="border-b border-[#2d3a4d]/80 transition-colors hover:bg-[#0f1623]/80"
                    >
                      <td className="p-3 text-white">{s.seller}</td>
                      <td className="p-3 text-[#8da2b2]">{titleCaseDisplay(s.location)}</td>
                      <td className="p-3 text-[#cbd5e1]">{formatNumber(s.units_sold)}</td>
                      <td className="p-3 text-[#cbd5e1]">{formatNumber(s.product_listings)}</td>
                      <td className="p-3 text-[#cbd5e1]">{formatNumber(s.reviews)}</td>
                      <td className="p-3">
                        <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                          {formatPositivePct(s.positive_pct)}
                        </span>
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
