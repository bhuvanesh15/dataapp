/**
 * Intelligents Market Intelligence — Phase 1 shell (branding + hero KPIs).
 * Phase 2 replaces static KPIs with JSON-backed data.
 */

export const SITE = {
  brand: "Intelligents",
  /** Wireframe / brief primary product title */
  productTitle: "Market Intelligence Dashboard",
  /** Browser tab + metadata */
  documentTitle: "Intelligents — Market Intelligence",
  description:
    "Dark-themed market intelligence dashboard — multi-platform pricing, seller discovery, velocity, and SKU drilldown.",
  /** Dashboard hero line (Phase 1) */
  dashboardSubtitle:
    "Proprietary dataset across 13+ global platforms — luxury watches, sneakers, and fashion.",
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

/** Sample metrics from project brief (Phase 1 demo / sales pitch). */
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
    note: "Phase 1 static snapshot — live JSON pipeline in Phase 2.",
  };
}
