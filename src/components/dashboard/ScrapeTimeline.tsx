"use client";

import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { parseDateToSort } from "@/lib/utils";

function normalizeWeekKey(weekStr: string, source: "ebay" | "amazon"): string {
  if (!weekStr || typeof weekStr !== "string") return "";
  const s = weekStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (/^\d{2}-\d{2}-\d{4}$/.test(s)) {
    const [d, m, y] = s.split("-");
    return `${y}-${m}-${d}`;
  }
  return s;
}

export function ScrapeTimeline() {
  const { ebayProducts, amazonProducts, loading } = useData();

  const weekCounts = new Map<string, { amazon: number; ebay: number }>();
  ebayProducts.forEach((p) => {
    const key = normalizeWeekKey(p["Week Scraped"], "ebay");
    if (!key) return;
    const prev = weekCounts.get(key) || { amazon: 0, ebay: 0 };
    prev.ebay += 1;
    weekCounts.set(key, prev);
  });
  amazonProducts.forEach((p) => {
    const key = normalizeWeekKey(p["Week Scraped"], "amazon");
    if (!key) return;
    const prev = weekCounts.get(key) || { amazon: 0, ebay: 0 };
    prev.amazon += 1;
    weekCounts.set(key, prev);
  });
  const data = Array.from(weekCounts.entries())
    .map(([week, counts]) => ({ week, ...counts, total: counts.amazon + counts.ebay }))
    .sort((a, b) => parseDateToSort(a.week) - parseDateToSort(b.week));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scrape Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scrape Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="week" tick={{ fill: "#64748b", fontSize: 10 }} />
            <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: "rgba(0,0,0,0.8)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                backdropFilter: "blur(12px)",
                color: "#f1f5f9",
              }}
            />
            <Legend wrapperStyle={{ color: "#94a3b8" }} />
            <Line type="monotone" dataKey="amazon" stroke="#FF9900" name="Amazon" strokeWidth={2} />
            <Line type="monotone" dataKey="ebay" stroke="#E53238" name="eBay" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
