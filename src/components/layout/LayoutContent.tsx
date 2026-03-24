"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { SITE } from "@/lib/site-config";

const pageMeta: Record<
  string,
  {
    title: string;
    subtitle?: string;
  }
> = {
  "/": {
    title: SITE.productTitle,
    subtitle: SITE.dashboardSubtitle,
  },
  "/price-benchmark": {
    title: "Price Benchmark",
    subtitle: "Multi-platform pricing comparison at SKU level (Phase 2).",
  },
  "/seller-discovery": {
    title: "Seller Discovery",
    subtitle: "Alternative vendors outside tariff-heavy regions (Phase 2).",
  },
  "/market-velocity": {
    title: "Market Velocity",
    subtitle: "Transaction frequency and price momentum (Phase 2).",
  },
  "/sku-drilldown": {
    title: "SKU Drilldown",
    subtitle: "Single-SKU analysis across platforms (Phase 2).",
  },
  "/settings": { title: "Settings" },
  "/upload": { title: "Upload Data", subtitle: "Legacy CSV workflow (Phase 0)." },
  "/ebay": { title: "eBay Products", subtitle: "Legacy sample data." },
  "/amazon": { title: "Amazon Products", subtitle: "Legacy sample data." },
  "/sellers": { title: "Sellers", subtitle: "Legacy sample data." },
  "/legacy": { title: "Sample data dashboard", subtitle: "Amazon / eBay charts from uploaded CSVs." },
};

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const meta = pageMeta[pathname] ?? { title: SITE.productTitle, subtitle: SITE.dashboardSubtitle };
  return (
    <>
      <Header title={meta.title} subtitle={meta.subtitle} />
      <main className="scrollbar-glass flex-1 overflow-auto p-4 md:p-6">{children}</main>
    </>
  );
}
