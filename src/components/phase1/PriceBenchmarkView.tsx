"use client";



import { useMemo, useState } from "react";

import { useData } from "@/context/DataContext";

import { formatPrice, formatNumber, titleCaseDisplay, formatPlatformLabel } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Skeleton } from "@/components/ui/skeleton";

import {

  Select,

  SelectContent,

  SelectItem,

  SelectTrigger,

  SelectValue,

} from "@/components/ui/select";

import { Phase1Insights } from "./Phase1Insights";



const DEMO_CATEGORIES = ["Sneakers"] as const;

const DEMO_BRANDS = ["Nike", "Jordan"] as const;



export function PriceBenchmarkView() {

  const { priceBenchmarkRows, loading } = useData();

  const [category, setCategory] = useState<string>("all");

  const [brand, setBrand] = useState<string>("all");

  const [platform, setPlatform] = useState<"all" | "ebay" | "amazon">("all");



  const rows = useMemo(() => {

    return priceBenchmarkRows.filter((r) => {

      if (category !== "all" && r.normalized_category !== category) return false;

      if (brand !== "all" && r.normalized_Brand !== brand) return false;

      if (platform !== "all" && r.platform !== platform) return false;

      return true;

    });

  }, [priceBenchmarkRows, category, brand, platform]);



  if (loading) {

    return <Skeleton className="h-[480px] w-full rounded-xl border border-[#2d3a4d] bg-[#121a26]/50" />;

  }



  return (

    <Card className="border-[#2d3a4d] bg-[#121a26]/50">

      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <CardTitle className="text-white">Price Benchmark Analysis</CardTitle>

        <div className="flex flex-wrap gap-2">

          <Select value={category} onValueChange={setCategory}>

            <SelectTrigger className="w-[180px] border-[#2d3a4d] bg-[#0f1623] text-sm text-white">

              <SelectValue placeholder="Category" />

            </SelectTrigger>

            <SelectContent>

              <SelectItem value="all">All Categories</SelectItem>

              {DEMO_CATEGORIES.map((c) => (

                <SelectItem key={c} value={c}>

                  {titleCaseDisplay(c)}

                </SelectItem>

              ))}

            </SelectContent>

          </Select>

          <Select value={brand} onValueChange={setBrand}>

            <SelectTrigger className="w-[160px] border-[#2d3a4d] bg-[#0f1623] text-sm text-white">

              <SelectValue placeholder="Brand" />

            </SelectTrigger>

            <SelectContent>

              <SelectItem value="all">All Brands</SelectItem>

              {DEMO_BRANDS.map((b) => (

                <SelectItem key={b} value={b}>

                  {b}

                </SelectItem>

              ))}

            </SelectContent>

          </Select>

          <Select value={platform} onValueChange={(v) => setPlatform(v as typeof platform)}>

            <SelectTrigger className="w-[160px] border-[#2d3a4d] bg-[#0f1623] text-sm text-white">

              <SelectValue placeholder="Platform" />

            </SelectTrigger>

            <SelectContent>

              <SelectItem value="all">All Platforms</SelectItem>

              <SelectItem value="ebay">eBay</SelectItem>

              <SelectItem value="amazon">Amazon</SelectItem>

            </SelectContent>

          </Select>

        </div>

      </CardHeader>

      <CardContent className="space-y-4 overflow-x-auto">

        <table className="w-full min-w-[720px] border-collapse text-left text-sm">

          <thead>

            <tr className="border-b border-[#2d3a4d] bg-[#0f1623] text-[11px] font-semibold uppercase tracking-wide text-[#8da2b2]">

              <th className="p-3">Product Name</th>

              <th className="p-3">Platform</th>

              <th className="p-3">SKU</th>

              <th className="p-3">Listings</th>

              <th className="p-3">Median Price (USD)</th>

              <th className="p-3">Avg Price (USD)</th>

            </tr>

          </thead>

          <tbody>

            {rows.length === 0 ? (

              <tr>

                <td colSpan={6} className="p-8 text-center text-[#8da2b2]">

                  No rows match filters. Try a different filter.

                </td>

              </tr>

            ) : (

              rows.map((r, i) => (

                <tr

                  key={`${r.normalized_sku}-${r.platform}-${i}`}

                  className="border-b border-[#2d3a4d]/80 transition-colors hover:bg-[#0f1623]/80"

                >

                  <td className="p-3 text-white">{titleCaseDisplay(r.product_family)}</td>

                  <td className="p-3 text-[#cbd5e1]">{formatPlatformLabel(r.platform)}</td>

                  <td className="p-3 font-mono text-xs text-[#8da2b2]">{r.normalized_sku}</td>

                  <td className="p-3 tabular-nums text-[#cbd5e1]">{formatNumber(r.listing_count)}</td>

                  <td className="p-3 font-medium tabular-nums text-white">{formatPrice(r.median_price)}</td>

                  <td className="p-3 tabular-nums text-[#cbd5e1]">{formatPrice(r.avg_price)}</td>

                </tr>

              ))

            )}

          </tbody>

        </table>



        <Phase1Insights

          items={[

            {

              title: "Data source",

              description:

                "Rows are loaded directly from the validated price_benchmark_v2 export (Amazon and eBay). No frontend subsetting or rebuild.",

            },

            {

              title: "Brand filter",

              description:

                "Brand values are limited to Nike and Jordan per the mapped workbook (Air Jordan consolidated to Jordan).",

            },

            {

              title: "Pricing note",

              description:

                "Median and average prices reflect the validated export fields median_price and avg_price per SKU and platform.",

            },

          ]}

        />

      </CardContent>

    </Card>

  );

}


