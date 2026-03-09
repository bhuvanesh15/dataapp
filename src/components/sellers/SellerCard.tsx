"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber, formatPercent } from "@/lib/utils";
import Link from "next/link";

export type SellerSource = "ebay" | "amazon";

export type SellerCardData = {
  id: string;
  name: string;
  marketplace: SellerSource;
  businessName?: string;
  locationOrAddress: string;
  totalItemsSold: number;
  reviewCount: number;
  positivePercent: number;
  followers?: number;
  productCount: number;
  sellerUrl: string;
  productsLink: string;
};

export function SellerCard({ data }: { data: SellerCardData }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold leading-tight">{data.name}</h3>
            <Badge
              variant={data.marketplace === "ebay" ? "ebay" : "amazon"}
              className="mt-1"
            >
              {data.marketplace === "ebay" ? "eBay" : "Amazon"}
            </Badge>
          </div>
          <a
            href={data.sellerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
        {data.businessName && (
          <p className="mt-1 text-sm text-muted-foreground">{data.businessName}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {data.locationOrAddress && (
          <p className="text-muted-foreground">{data.locationOrAddress}</p>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span>Items sold: {formatNumber(data.totalItemsSold)}</span>
          {data.reviewCount > 0 && (
            <span>Reviews: {formatNumber(data.reviewCount)}</span>
          )}
          {data.positivePercent > 0 && (
            <span>Positive: {formatPercent(data.positivePercent)}</span>
          )}
          {data.followers != null && data.followers > 0 && (
            <span>Followers: {formatNumber(data.followers)}</span>
          )}
          <span>Products tracked: {data.productCount}</span>
        </div>
        <Link
          href={data.productsLink}
          className={cn(
            "mt-2 inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Package className="mr-2 h-4 w-4" />
          View products
        </Link>
      </CardContent>
    </Card>
  );
}
