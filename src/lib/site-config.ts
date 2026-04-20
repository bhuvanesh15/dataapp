/** Intelligents Market Intelligence — branding and default hero KPI copy. */

export const SITE = {
  brand: "Intelligents",
  productTitle: "Market Intelligence Dashboard",
  documentTitle: "Intelligents — Market Intelligence",
  description:
    "Market intelligence dashboard — monitored marketplace pricing, seller discovery, velocity, and SKU drilldown.",
  dashboardSubtitle:
    "Pricing, supplier intelligence, and market trends across 13+ market data sources.",
} as const;

export type HeroKpiTrend = "positive" | "negative" | "neutral";

export type Phase1HeroKpi = {
  id: string;
  label: string;
  value: string;
  trendLabel: string;
  trend: HeroKpiTrend;
  footnote: string;
};

/** Fallback hero KPIs when data is empty or a metric cannot be computed. */
export const PHASE1_HERO_KPIS: Phase1HeroKpi[] = [
  {
    id: "cross-market-price-gap",
    label: "Cross-Market Price Gap",
    value: "18.5%",
    trendLabel: "+3.2%",
    trend: "positive",
    footnote: "US vs EU/Japan avg. gap widening",
  },
  {
    id: "tariff-margin-impact",
    label: "Tariff Margin Impact",
    value: "+$142",
    trendLabel: "vs prior quarter",
    trend: "negative",
    footnote: "Avg landed cost incl. tariffs",
  },
  {
    id: "market-price-position",
    label: "Market Price Position",
    value: "-4.0%",
    trendLabel: "−1.8%",
    trend: "negative",
    footnote: "Pricing vs market avg across competitors",
  },
  {
    id: "alt-vendor-liquidity",
    label: "Alt. Vendor Liquidity",
    value: "$8.4M",
    trendLabel: "+12%",
    trend: "positive",
    footnote: "Inventory outside tariff regions (340+ vendors)",
  },
];

export function buildPhase1DownloadPayload() {
  return {
    exportedAt: new Date().toISOString(),
    product: SITE.productTitle,
    kpis: PHASE1_HERO_KPIS.map(({ id, label, value, trendLabel, trend, footnote }) => ({
      id,
      label,
      value,
      trendLabel,
      trend,
      footnote,
    })),
    note: "Snapshot of hero KPI labels and values at export time.",
  };
}
