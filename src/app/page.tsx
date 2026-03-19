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
      <p className="text-gradient-subtle text-sm font-medium tracking-wide md:text-base">
        Real-time product intelligence across Amazon &amp; eBay
      </p>
      <div className="opacity-0 animate-fade-in-up">
        <KPICards />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {showEbay && (
          <div className="opacity-0 animate-fade-in-up-delay-1">
            <MarketplaceChart />
          </div>
        )}
        {showEbay && (
          <div className="opacity-0 animate-fade-in-up-delay-2">
            <TopSellersChart />
          </div>
        )}
        {showEbay && (
          <div className="opacity-0 animate-fade-in-up-delay-3">
            <ConditionPieChart />
          </div>
        )}
        <div className="opacity-0 animate-fade-in-up-delay-4">
          <ScrapeTimeline />
        </div>
      </div>
      <div className="opacity-0 animate-fade-in-up-delay-5">
        <RecentProductsTable />
      </div>
    </div>
  );
}
