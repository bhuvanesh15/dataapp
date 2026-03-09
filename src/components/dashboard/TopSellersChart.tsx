"use client";

import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export function TopSellersChart() {
  const { ebayProducts, loading } = useData();

  const sellerTotals = new Map<string, number>();
  ebayProducts.forEach((p) => {
    const name = p["Seller Name"];
    const sold = p["Total Items Sold (Seller)"] || 0;
    sellerTotals.set(name, sold);
  });
  const data = Array.from(sellerTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name: name.length > 20 ? name.slice(0, 20) + "…" : name, count }));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Sellers by Items Sold</CardTitle>
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
        <CardTitle>Top 10 Sellers by Items Sold</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#E53238" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
