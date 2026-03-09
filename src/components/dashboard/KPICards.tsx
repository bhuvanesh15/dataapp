"use client";

import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatNumber } from "@/lib/utils";

export function KPICards() {
  const { ebayProducts, amazonProducts, loading } = useData();

  const totalProducts = ebayProducts.length + amazonProducts.length;

  const uniqueSellers = (() => {
    const set = new Set<string>();
    ebayProducts.forEach((p) => set.add(p["Seller Name"]));
    amazonProducts.forEach((p) => set.add(p["Seller"]));
    return set.size;
  })();

  const prices: number[] = [];
  ebayProducts.forEach((p) => {
    const v = p["Price (USD)"];
    if (typeof v === "number" && !Number.isNaN(v) && v > 0) prices.push(v);
  });
  amazonProducts.forEach((p) => {
    const v = p["Price (USD)"];
    if (v != null && typeof v === "number" && !Number.isNaN(v) && v > 0) prices.push(v);
  });
  const avgPrice = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

  const totalItemsSold = ebayProducts.reduce(
    (sum, p) => sum + (p["Total Items Sold (Product)"] || 0),
    0
  );

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <span className="text-sm font-medium text-muted-foreground">Total Products Tracked</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(totalProducts)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <span className="text-sm font-medium text-muted-foreground">Total Sellers Tracked</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(uniqueSellers)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <span className="text-sm font-medium text-muted-foreground">Average Price (USD)</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPrice(avgPrice)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <span className="text-sm font-medium text-muted-foreground">Total Items Sold (eBay)</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(totalItemsSold)}</div>
        </CardContent>
      </Card>
    </div>
  );
}
