"use client";

import { useTheme } from "next-themes";
import { useSettings } from "@/context/SettingsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { rowsPerPage, setRowsPerPage, showAmazon, showEbay, setShowAmazon, setShowEbay } = useSettings();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <p className="text-sm text-slate-400">Choose light, dark, or system.</p>
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
          <CardTitle>Table</CardTitle>
          <p className="text-sm text-slate-400">Default rows per page in product tables.</p>
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
          <CardTitle>Marketplace visibility</CardTitle>
          <p className="text-sm text-slate-400">Show or hide eBay and Amazon in the sidebar and dashboard.</p>
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

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-slate-400">
          <p>Product Intelligent Dashboard v1.0.0</p>
          <p>Last updated: March 2026</p>
        </CardContent>
      </Card>
    </div>
  );
}
