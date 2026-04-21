"use client";

import { useSettings } from "@/context/SettingsContext";
import { KPICards } from "@/components/dashboard/KPICards";
import { MarketplaceChart } from "@/components/dashboard/MarketplaceChart";
import { TopSellersChart } from "@/components/dashboard/TopSellersChart";
import { ConditionPieChart } from "@/components/dashboard/ConditionPieChart";
import { ScrapeTimeline } from "@/components/dashboard/ScrapeTimeline";
import { RecentProductsTable } from "@/components/dashboard/RecentProductsTable";

/** Sample charts and tables from loaded Amazon / eBay data (Settings toggles marketplaces). */
export default function LegacySampleDashboardPage() {
  const { showAmazon, showEbay } = useSettings();

  return (
    <div className="space-y-6">
      <p className="text-sm text-[#8da2b2]">
        Explore Amazon and eBay tables and charts from your loaded dataset. Use Settings to show or hide each marketplace.
      </p>
      <KPICards />
      <div className="grid gap-4 md:grid-cols-2">
        {showEbay && <MarketplaceChart />}
        {showEbay && <TopSellersChart />}
        {showEbay && <ConditionPieChart />}
        <ScrapeTimeline />
      </div>
      <RecentProductsTable />
    </div>
  );
}
