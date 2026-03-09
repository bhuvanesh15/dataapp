"use client";

import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ["#E53238", "#FF9900", "#22c55e", "#3b82f6", "#a855f7", "#64748b"];

export function ConditionPieChart() {
  const { ebayProducts, loading } = useData();

  const conditionCounts = new Map<string, number>();
  ebayProducts.forEach((p) => {
    const c = p["Condition of Product"] || "Unknown";
    conditionCounts.set(c, (conditionCounts.get(c) || 0) + 1);
  });
  const data = Array.from(conditionCounts.entries()).map(([name, value]) => ({ name, value }));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Product Condition Distribution</CardTitle>
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
        <CardTitle>Product Condition Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={70}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
