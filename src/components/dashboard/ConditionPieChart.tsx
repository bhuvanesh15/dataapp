"use client";

import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/utils";

const COLORS = ["#E53238", "#FF9900", "#22c55e", "#3b82f6", "#a855f7", "#64748b"];
const TOP_N = 5; // Show top N conditions, rest as "Other" to avoid clutter

export function ConditionPieChart() {
  const { ebayProducts, loading } = useData();

  const conditionSold = new Map<string, number>();
  ebayProducts.forEach((p) => {
    const c = p["Condition of Product"] || "Unknown";
    const sold = p["Total Items Sold (Product)"] || 0;
    conditionSold.set(c, (conditionSold.get(c) || 0) + sold);
  });
  const sorted = Array.from(conditionSold.entries())
    .map(([name, value]) => ({ name, value }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  const top = sorted.slice(0, TOP_N);
  const rest = sorted.slice(TOP_N);
  const otherSum = rest.reduce((s, d) => s + d.value, 0);
  const data =
    otherSum > 0 ? [...top, { name: "Other", value: otherSum }] : top;
  const totalSold = data.reduce((sum, d) => sum + d.value, 0);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales by Condition (units sold)</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[260px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales by Condition (units sold)</CardTitle>
          <p className="text-sm text-muted-foreground">eBay items sold by product condition.</p>
        </CardHeader>
        <CardContent>
          <div className="flex h-[240px] items-center justify-center rounded-md border border-dashed border-muted text-muted-foreground">
            No sales data
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="min-h-0">
      <CardHeader className="pb-2">
        <CardTitle>Sales by Condition (units sold)</CardTitle>
        <p className="text-sm text-muted-foreground">eBay items sold by product condition.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative h-[220px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={80}
                paddingAngle={2}
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={(props) => (
                  <SalesByConditionTooltip {...props} totalSold={totalSold} />
                )}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-xs font-medium text-muted-foreground">Total sold</span>
            <span className="text-xl font-bold text-foreground tabular-nums">
              {formatNumber(totalSold)}
            </span>
          </div>
        </div>
        <div
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground"
          style={{ minHeight: 40 }}
        >
          {data.map((d, index) => (
            <span key={d.name} className="inline-flex items-center gap-1.5">
              <span
                className="size-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="truncate max-w-[120px]" title={d.name}>
                {d.name}
              </span>
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SalesByConditionTooltip(
  props: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    totalSold: number;
  }
) {
  const { active, payload, totalSold } = props;
  if (!active || !payload?.length || totalSold <= 0) return null;
  const item = payload[0];
  const pct = ((item.value / totalSold) * 100).toFixed(1);
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-sm">
      <p className="font-medium text-foreground">{item.name}</p>
      <p className="text-sm text-muted-foreground">
        {formatNumber(item.value)} units ({pct}%)
      </p>
    </div>
  );
}
