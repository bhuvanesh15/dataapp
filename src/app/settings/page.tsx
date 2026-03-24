"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useSettings } from "@/context/SettingsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SITE } from "@/lib/site-config";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { rowsPerPage, setRowsPerPage, showAmazon, showEbay, setShowAmazon, setShowEbay } = useSettings();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <p className="text-sm text-[#8da2b2]">Choose light, dark, or system.</p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {(["light", "dark", "system"] as const).map((t) => (
              <Button
                key={t}
                variant={theme === t ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Table (legacy data)</CardTitle>
          <p className="text-sm text-[#8da2b2]">Rows per page for Amazon/eBay product tables.</p>
        </CardHeader>
        <CardContent>
          <Select value={String(rowsPerPage)} onValueChange={(v) => setRowsPerPage(Number(v))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Marketplace visibility (legacy)</CardTitle>
          <p className="text-sm text-[#8da2b2]">Controls which legacy charts appear on the sample data dashboard.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-amazon">Show Amazon</Label>
            <Button
              id="show-amazon"
              variant={showAmazon ? "default" : "outline"}
              size="sm"
              onClick={() => setShowAmazon(!showAmazon)}
            >
              {showAmazon ? "On" : "Off"}
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-ebay">Show eBay</Label>
            <Button
              id="show-ebay"
              variant={showEbay ? "default" : "outline"}
              size="sm"
              onClick={() => setShowEbay(!showEbay)}
            >
              {showEbay ? "On" : "Off"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Legacy sample data</CardTitle>
          <p className="text-sm text-[#8da2b2]">Phase 0 CSV workflow — kept for demos and uploads.</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link
            href="/legacy"
            className={cn(buttonVariants({ variant: "outline" }), "rounded-xl border-[#2d3a4d] text-center")}
          >
            Sample charts dashboard
          </Link>
          <Link
            href="/upload"
            className={cn(buttonVariants({ variant: "outline" }), "rounded-xl border-[#2d3a4d] text-center")}
          >
            Upload Data
          </Link>
          <Link
            href="/ebay"
            className={cn(buttonVariants({ variant: "outline" }), "rounded-xl border-[#2d3a4d] text-center")}
          >
            eBay Products
          </Link>
          <Link
            href="/amazon"
            className={cn(buttonVariants({ variant: "outline" }), "rounded-xl border-[#2d3a4d] text-center")}
          >
            Amazon Products
          </Link>
          <Link
            href="/sellers"
            className={cn(buttonVariants({ variant: "outline" }), "rounded-xl border-[#2d3a4d] text-center")}
          >
            Sellers
          </Link>
        </CardContent>
      </Card>

      <Separator className="bg-[#2d3a4d]" />

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-[#8da2b2]">
          <p>
            {SITE.brand} — {SITE.productTitle}
          </p>
          <p>Phase 1 shell (branding, hero KPIs, navigation, deploy target: intelligents.work/dashboard)</p>
          <p>Last updated: March 2026</p>
        </CardContent>
      </Card>
    </div>
  );
}
