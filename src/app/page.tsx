"use client";

import Link from "next/link";
import { Phase1HeroKpis } from "@/components/dashboard/Phase1HeroKpis";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SITE } from "@/lib/site-config";
import { Scale, Store, Activity, Layers } from "lucide-react";

const exploreLinks = [
  {
    href: "/price-benchmark",
    title: "Price Benchmark",
    desc: "SKU-level pricing vs market across platforms.",
    icon: Scale,
  },
  {
    href: "/seller-discovery",
    title: "Seller Discovery",
    desc: "Verified sellers outside tariff-heavy regions.",
    icon: Store,
  },
  {
    href: "/market-velocity",
    title: "Market Velocity",
    desc: "Transaction frequency and price momentum.",
    icon: Activity,
  },
  {
    href: "/sku-drilldown",
    title: "SKU Drilldown",
    desc: "Deep dive on a single reference across listings.",
    icon: Layers,
  },
] as const;

const exploreFade = [
  "opacity-0 animate-fade-in-up-delay-1",
  "opacity-0 animate-fade-in-up-delay-2",
  "opacity-0 animate-fade-in-up-delay-3",
  "opacity-0 animate-fade-in-up-delay-4",
] as const;

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <p className="text-gradient-subtle max-w-3xl text-sm font-medium tracking-wide md:text-base">
        {SITE.dashboardSubtitle}
      </p>

      <div className="opacity-0 animate-fade-in-up">
        <Phase1HeroKpis />
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-wide text-white">Explore</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {exploreLinks.map((item, i) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="group block">
                <Card
                  className={`h-full border-[#2d3a4d] transition-all duration-300 hover:border-[rgba(56,189,248,0.35)] ${exploreFade[i]}`}
                >
                  <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2">
                    <div className="rounded-lg bg-[rgba(56,189,248,0.12)] p-2 text-[#38bdf8] transition-colors group-hover:bg-[rgba(56,189,248,0.2)]">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <div>
                      <CardTitle className="text-base text-white group-hover:text-[#38bdf8]">
                        {item.title}
                      </CardTitle>
                      <CardDescription className="text-[#8da2b2]">{item.desc}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <span className="text-xs font-medium uppercase tracking-wider text-[#38bdf8]">
                      Open →
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
