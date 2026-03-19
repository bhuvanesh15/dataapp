"use client";

import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export function MarketplaceChart() {
  const { ebayProducts, amazonProducts, loading } = useData();

  const data = [
    { name: "Amazon", count: amazonProducts.length, fill: "#FF9900" },
    { name: "eBay", count: ebayProducts.length, fill: "#E53238" },
  ];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Products by Marketplace</CardTitle>
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
        <CardTitle>Products by Marketplace</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="barGradAmazon" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF9900" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#FF9900" stopOpacity={0.5} />
              </linearGradient>
              <linearGradient id="barGradEbay" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E53238" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#E53238" stopOpacity={0.5} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} />
            <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: "rgba(0,0,0,0.8)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                backdropFilter: "blur(12px)",
                color: "#f1f5f9",
              }}
              labelStyle={{ color: "#94a3b8" }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
