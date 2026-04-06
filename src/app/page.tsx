"use client";

import { Phase1HeroKpis } from "@/components/dashboard/Phase1HeroKpis";
import { MarketIntelligenceTabs } from "@/components/dashboard/MarketIntelligenceTabs";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="opacity-0 animate-fade-in-up">
        <Phase1HeroKpis />
      </div>

      <section className="opacity-0 animate-fade-in-up-delay-1 space-y-0">
        <MarketIntelligenceTabs />
      </section>
    </div>
  );
}
