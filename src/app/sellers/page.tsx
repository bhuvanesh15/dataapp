"use client";

import { useMemo, useState } from "react";
import { useData } from "@/context/DataContext";
import { useGlobalSearch } from "@/components/layout/Header";
import { SellerCard, type SellerCardData } from "@/components/sellers/SellerCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function SellersPage() {
  const { ebayProducts, amazonProducts, loading } = useData();
  const { globalFilter } = useGlobalSearch();
  const [sortBy, setSortBy] = useState<"itemsSold" | "reviews" | "positive" | "products">("itemsSold");

  const sellers = useMemo(() => {
    const map = new Map<string, SellerCardData>();

    ebayProducts.forEach((p) => {
      const name = p["Seller Name"];
      if (!name) return;
      const key = `ebay-${name}-${p["Seller URL"] || ""}`;
      const existing = map.get(key);
      if (existing) {
        existing.productCount += 1;
      } else {
        map.set(key, {
          id: key,
          name,
          marketplace: "ebay",
          locationOrAddress: p["Location of Product"] || "",
          totalItemsSold: p["Total Items Sold (Seller)"] || 0,
          reviewCount: p["Number of Reviews (seller)"] || 0,
          positivePercent: p["Positive Review Percentage % (seller)"] || 0,
          followers: p["Seller Followers"] || 0,
          productCount: 1,
          sellerUrl: p["Seller URL"] || "#",
          productsLink: `/ebay?seller=${encodeURIComponent(name)}`,
        });
      }
    });

    amazonProducts.forEach((p) => {
      const name = p["Seller"];
      if (!name) return;
      const key = `amazon-${name}-${p["Seller URL"] || ""}`;
      const existing = map.get(key);
      if (existing) {
        existing.productCount += 1;
      } else {
        map.set(key, {
          id: key,
          name,
          marketplace: "amazon",
          businessName: p["Business Name"] || undefined,
          locationOrAddress: p["Business Address"] || "",
          totalItemsSold: 0,
          reviewCount: 0,
          positivePercent: 0,
          productCount: 1,
          sellerUrl: p["Seller URL"] || "#",
          productsLink: `/amazon?seller=${encodeURIComponent(name)}`,
        });
      }
    });

    let list = Array.from(map.values());

    if (globalFilter.trim()) {
      const q = globalFilter.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.businessName || "").toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case "itemsSold":
        list.sort((a, b) => b.totalItemsSold - a.totalItemsSold);
        break;
      case "reviews":
        list.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case "positive":
        list.sort((a, b) => b.positivePercent - a.positivePercent);
        break;
      case "products":
        list.sort((a, b) => b.productCount - a.productCount);
        break;
    }
    return list;
  }, [ebayProducts, amazonProducts, globalFilter, sortBy]);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-[180px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="itemsSold">Items sold</SelectItem>
            <SelectItem value="reviews">Review count</SelectItem>
            <SelectItem value="positive">Positive %</SelectItem>
            <SelectItem value="products">Products tracked</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {sellers.length === 0 ? (
        <div className="rounded-lg border border-dashed py-12 text-center text-muted-foreground">
          No sellers found. Load or upload data to see sellers.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sellers.map((data) => (
            <SellerCard key={data.id} data={data} />
          ))}
        </div>
      )}
    </div>
  );
}
