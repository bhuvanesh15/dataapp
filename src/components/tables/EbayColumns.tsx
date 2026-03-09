"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { EbayProduct } from "@/types/ebay";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatNumber, formatPercent, truncate } from "@/lib/utils";
import { cn } from "@/lib/utils";

function ReviewPercentCell({ value }: { value: number }) {
  const p = value;
  const variant =
    p >= 98 ? "default" : p >= 95 ? "secondary" : "destructive";
  const colorClass =
    p >= 98
      ? "text-green-600 dark:text-green-400"
      : p >= 95
        ? "text-yellow-600 dark:text-yellow-400"
        : "text-red-600 dark:text-red-400";
  return <span className={cn("font-medium", colorClass)}>{formatPercent(p)}</span>;
}

export function getEbayColumns(): ColumnDef<EbayProduct, unknown>[] {
  return [
    {
      accessorKey: "Product Name",
      header: "Product Name",
      cell: ({ row }) => {
        const url = row.original["Product URL"];
        const name = row.original["Product Name"];
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            {truncate(name, 50)}
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        );
      },
      enableSorting: true,
    },
    {
      accessorKey: "Search Term",
      header: "Search Term",
      enableSorting: true,
    },
    {
      accessorKey: "Price (USD)",
      header: "Price",
      cell: ({ getValue }) => formatPrice(getValue() as number),
      enableSorting: true,
    },
    {
      accessorKey: "Condition of Product",
      header: "Condition",
      enableSorting: true,
    },
    {
      accessorKey: "Location of Product",
      header: "Location",
    },
    {
      accessorKey: "Total result for the search",
      header: "Total Results",
      cell: ({ getValue }) => formatNumber(getValue() as number),
      enableSorting: true,
    },
    {
      accessorKey: "Total Items Sold (Product)",
      header: "Items Sold (Product)",
      cell: ({ getValue }) => formatNumber(getValue() as number),
      enableSorting: true,
    },
    {
      accessorKey: "Seller Name",
      header: "Seller",
      cell: ({ row }) => {
        const url = row.original["Seller URL"];
        const name = row.original["Seller Name"];
        if (!url) return name;
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            {name}
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        );
      },
      enableSorting: true,
    },
    {
      accessorKey: "Total Items Sold (Seller)",
      header: "Seller Items Sold",
      cell: ({ getValue }) => formatNumber(getValue() as number),
      enableSorting: true,
    },
    {
      accessorKey: "Number of Reviews (seller)",
      header: "Reviews",
      cell: ({ getValue }) => formatNumber(getValue() as number),
      enableSorting: true,
    },
    {
      accessorKey: "Positive Review Percentage % (seller)",
      header: "Positive %",
      cell: ({ getValue }) => (
        <ReviewPercentCell value={Number(getValue()) || 0} />
      ),
      enableSorting: true,
    },
    {
      accessorKey: "Seller Followers",
      header: "Followers",
      cell: ({ getValue }) => formatNumber(getValue() as number),
      enableSorting: true,
    },
    {
      accessorKey: "Date Scraped",
      header: "Date Scraped",
      cell: ({ getValue }) => {
        const v = getValue() as string;
        if (!v) return "N/A";
        return v.length >= 10 ? `${v.slice(0, 4)}-${v.slice(5, 7)}-${v.slice(8, 10)}` : v;
      },
      enableSorting: true,
    },
    {
      accessorKey: "Week Scraped",
      header: "Week Scraped",
      cell: ({ getValue }) => {
        const v = getValue() as string;
        if (!v) return "N/A";
        return v.length >= 10 ? `${v.slice(0, 4)}-${v.slice(5, 7)}-${v.slice(8, 10)}` : v;
      },
      enableSorting: true,
    },
  ];
}

export function EbayDetailCard({ row }: { row: EbayProduct }) {
  const entries = Object.entries(row).filter(([, v]) => v != null && String(v).trim() !== "");
  return (
    <div className="grid gap-2 text-sm sm:grid-cols-2">
      {entries.map(([key, value]) => (
        <div key={key} className="flex flex-col">
          <span className="font-medium text-muted-foreground">{key}</span>
          <span className="break-all">
            {key === "Product URL" || key === "Seller URL" ? (
              <a
                href={String(value)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {String(value)}
                <ExternalLink className="ml-1 inline h-3 w-3" />
              </a>
            ) : typeof value === "number" ? (
              key.includes("Price") ? formatPrice(value) : key.includes("%") ? formatPercent(value) : formatNumber(value)
            ) : (
              String(value)
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
