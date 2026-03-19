"use client";

import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDate, truncate } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import type { EbayProduct } from "@/types/ebay";
import type { AmazonProduct } from "@/types/amazon";
import { parseDateToSort } from "@/lib/utils";

type RecentRow = {
  marketplace: "eBay" | "Amazon";
  productName: string;
  productUrl: string;
  price: string;
  seller: string;
  dateScraped: string;
  sortTime: number;
};

export function RecentProductsTable() {
  const { ebayProducts, amazonProducts, loading } = useData();

  const rows: RecentRow[] = [];
  ebayProducts.forEach((p: EbayProduct) => {
    rows.push({
      marketplace: "eBay",
      productName: p["Product Name"],
      productUrl: p["Product URL"],
      price: formatPrice(p["Price (USD)"]),
      seller: p["Seller Name"],
      dateScraped: p["Date Scraped"],
      sortTime: parseDateToSort(p["Date Scraped"]),
    });
  });
  amazonProducts.forEach((p: AmazonProduct) => {
    rows.push({
      marketplace: "Amazon",
      productName: p["Product Name"],
      productUrl: p["product url"],
      price: p["Price (USD)"] != null ? formatPrice(p["Price (USD)"]) : "N/A",
      seller: p["Seller"],
      dateScraped: p["Date Scraped"],
      sortTime: parseDateToSort(p["Date Scraped"]),
    });
  });
  rows.sort((a, b) => b.sortTime - a.sortTime);
  const recent = rows.slice(0, 10);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Products</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (recent.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Products</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400">No products yet. Upload CSV data to see recent products.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Products</CardTitle>
        <p className="text-sm text-slate-400">Last 10 added across marketplaces</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Marketplace</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Date Scraped</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Badge variant={row.marketplace === "eBay" ? "ebay" : "amazon"}>
                      {row.marketplace}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <a
                      href={row.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      {truncate(row.productName, 40)}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </TableCell>
                  <TableCell>{row.price}</TableCell>
                  <TableCell>{row.seller}</TableCell>
                  <TableCell>
                    {formatDate(row.dateScraped, row.marketplace === "eBay" ? "ebay" : "amazon")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
