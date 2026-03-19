"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { AmazonProduct } from "@/types/amazon";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatNumber, truncate } from "@/lib/utils";

function rankDisplay(str: string | null | undefined): string {
  if (!str || typeof str !== "string") return "N/A";
  return str.trim();
}

export function getAmazonColumns(): ColumnDef<AmazonProduct, unknown>[] {
  return [
    {
      accessorKey: "Product Name",
      header: "Product Name",
      cell: ({ row }) => {
        const url = row.original["product url"];
        const name = row.original["Product Name"];
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-cyan-400 hover:underline"
          >
            {truncate(name, 50)}
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        );
      },
      enableSorting: true,
    },
    {
      accessorKey: "ASIN",
      header: "ASIN",
      cell: ({ getValue }) => (
        <Badge variant="secondary">{String(getValue() ?? "N/A")}</Badge>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "Seller",
      header: "Seller",
      cell: ({ row }) => {
        const url = row.original["Seller URL"];
        const name = row.original["Seller"];
        if (!url) return name || "N/A";
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-cyan-400 hover:underline"
          >
            {name || "N/A"}
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        );
      },
      enableSorting: true,
    },
    {
      accessorKey: "Price (USD)",
      header: "Price",
      cell: ({ getValue }) => {
        const v = getValue();
        if (v == null || v === "") return <span className="text-slate-500">N/A</span>;
        return formatPrice(v as number);
      },
      enableSorting: true,
    },
    {
      accessorKey: "Best Sellers Rank",
      header: "Best Sellers Rank",
      cell: ({ getValue }) => (
        <span className="text-sm">{rankDisplay(getValue() as string)}</span>
      ),
    },
    {
      accessorKey: "Category Rank",
      header: "Category Rank",
      cell: ({ getValue }) => (
        <span className="text-sm">{rankDisplay(getValue() as string)}</span>
      ),
    },
    {
      accessorKey: "Number of Ratings",
      header: "Ratings",
      cell: ({ getValue }) => {
        const v = getValue();
        if (v == null || v === "") return <span className="text-slate-500">N/A</span>;
        return formatNumber(v as number);
      },
      enableSorting: true,
    },
    {
      accessorKey: "Customer Rating",
      header: "Rating",
      cell: ({ getValue }) => {
        const v = getValue();
        if (v == null || v === "") return <span className="text-slate-500">N/A</span>;
        return String(v);
      },
      enableSorting: true,
    },
    {
      accessorKey: "Search input",
      header: "Search",
      enableSorting: true,
    },
    {
      accessorKey: "Total Results",
      header: "Total Results",
      cell: ({ getValue }) => formatNumber(getValue() as number),
      enableSorting: true,
    },
    {
      accessorKey: "Business Name",
      header: "Business Name",
      cell: ({ getValue }) => getValue() || <span className="text-slate-500">N/A</span>,
    },
    {
      accessorKey: "Date Scraped",
      header: "Date Scraped",
      cell: ({ getValue }) => {
        const v = getValue() as string;
        if (!v) return <span className="text-slate-500">N/A</span>;
        return v;
      },
      enableSorting: true,
    },
    {
      accessorKey: "Week Scraped",
      header: "Week Scraped",
      cell: ({ getValue }) => {
        const v = getValue() as string;
        if (!v) return <span className="text-slate-500">N/A</span>;
        return v;
      },
      enableSorting: true,
    },
    {
      accessorKey: "Department",
      header: "Department",
    },
    {
      accessorKey: "Item model number",
      header: "Model #",
      cell: ({ getValue }) => getValue() || <span className="text-slate-500">N/A</span>,
    },
  ];
}

export function AmazonDetailCard({ row }: { row: AmazonProduct }) {
  const entries = Object.entries(row).filter(([, v]) => v != null && String(v).trim() !== "");
  return (
    <div className="grid gap-2 text-sm sm:grid-cols-2">
      {entries.map(([key, value]) => (
        <div key={key} className="flex flex-col">
          <span className="font-medium text-slate-500">{key}</span>
          <span className="break-all">
            {key === "Seller URL" || key === "product url" ? (
              <a
                href={String(value)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline"
              >
                {String(value)}
                <ExternalLink className="ml-1 inline h-3 w-3" />
              </a>
            ) : typeof value === "number" ? (
              key.includes("Price") ? formatPrice(value) : formatNumber(value)
            ) : (
              String(value)
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
