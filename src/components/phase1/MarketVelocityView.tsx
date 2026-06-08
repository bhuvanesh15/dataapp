"use client";

import { useMemo } from "react";
import { useData } from "@/context/DataContext";
import { buildVelocityMinis, buildVelocityTable } from "@/lib/market-stats";
import { titleCaseDisplay, formatPlatformLabel } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Phase1Insights } from "./Phase1Insights";

export function MarketVelocityView() {
  const { ebayProducts, amazonProducts, loading } = useData();
  const minis = useMemo(
    () => buildVelocityMinis(ebayProducts, amazonProducts),
    [ebayProducts, amazonProducts]
  );
  const table = useMemo(
    () => buildVelocityTable(ebayProducts, amazonProducts, 15),
    [ebayProducts, amazonProducts]
  );

  if (loading) {
    return <Skeleton className="h-[560px] w-full rounded-xl border border-[#2d3a4d] bg-[#121a26]/50" />;
  }

  return (
    <Card className="border-[#2d3a4d] bg-[#121a26]/50">
      <CardHeader>
        <CardTitle className="text-white">Market Velocity & Trends</CardTitle>
        <p className="text-sm text-[#8da2b2]">
          Derived from captured dates and marketplace sold-item fields in the current dataset.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {minis.map((m) => (
            <div
              key={m.label}
              className="rounded-lg border border-[#2d3a4d] bg-[#0f1623] p-4"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">
                {m.label}
              </p>
              <p className="mt-2 text-2xl font-bold tabular-nums text-white">{m.value}</p>
              <p className="mt-1 text-xs text-[#8da2b2]">{m.sub}</p>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#2d3a4d] bg-[#0f1623] text-[11px] font-semibold uppercase tracking-wide text-[#8da2b2]">
                <th className="p-3">Product Name</th>
                <th className="p-3">Platform</th>
                <th className="p-3">Location</th>
                <th className="p-3">Units Sold (MoM%)</th>
                <th className="p-3">Date Captured</th>
                <th className="p-3">Trend</th>
              </tr>
            </thead>
            <tbody>
              {table.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#8da2b2]">
                    No velocity rows yet.
                  </td>
                </tr>
              ) : (
                table.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-[#2d3a4d]/80 hover:bg-[#0f1623]/80"
                  >
                    <td className="p-3 text-white">{titleCaseDisplay(r.brandModel)}</td>
                    <td className="p-3 text-[#8da2b2]">{formatPlatformLabel(r.platform)}</td>
                    <td className="p-3 text-[#8da2b2]">{titleCaseDisplay(r.location)}</td>
                    <td className="p-3 text-[#cbd5e1]">{r.signal}</td>
                    <td className="p-3 text-[#64748b]">{r.dateCaptured}</td>
                    <td className="p-3">
                      <span
                        className={
                          r.trend === "Hot"
                            ? "rounded bg-rose-500/15 px-2 py-0.5 text-xs font-semibold text-rose-400"
                            : "rounded bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-400"
                        }
                      >
                        {r.trend}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Phase1Insights
          items={[
            {
              title: "Current coverage",
              description:
                "Captured-date recency and eBay units-sold fields support velocity signals on this dataset.",
            },
            {
              title: "Price momentum",
              description:
                "Multi-period tracking becomes more precise as additional historical snapshots accumulate.",
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
