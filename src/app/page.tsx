"use client";

import { useSettings } from "@/context/SettingsContext";
import { KPICards } from "@/components/dashboard/KPICards";
import { MarketplaceChart } from "@/components/dashboard/MarketplaceChart";
import { TopSellersChart } from "@/components/dashboard/TopSellersChart";
import { ConditionPieChart } from "@/components/dashboard/ConditionPieChart";
import { ScrapeTimeline } from "@/components/dashboard/ScrapeTimeline";
import { RecentProductsTable } from "@/components/dashboard/RecentProductsTable";

export default function DashboardPage() {
  const { showAmazon, showEbay } = useSettings();

  return (
    <div className="space-y-6">
      <KPICards />
      <div className="grid gap-4 md:grid-cols-2">
        {showEbay && <MarketplaceChart />}
        {showEbay && <TopSellersChart />}
        {showEbay && <ConditionPieChart />}
        <ScrapeTimeline />
      </div>
      <div>
        <RecentProductsTable />
      </div>
    </div>
  );
}
