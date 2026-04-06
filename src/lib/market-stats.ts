import type { EbayProduct } from "@/types/ebay";
import type { AmazonProduct } from "@/types/amazon";
import type { Phase1HeroKpi, HeroKpiTrend } from "@/lib/site-config";
import { PHASE1_HERO_KPIS } from "@/lib/site-config";
import { formatUsdLiquidity, formatNumber, formatPercent, parseDateToSort, truncate } from "@/lib/utils";

function median(nums: number[]): number | null {
  if (!nums.length) return null;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
}

function mean(nums: number[]): number | null {
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/** Hero KPI row: real metrics from CSV where possible; tariff row stays static demo. */
export function computeHeroKpis(ebayProducts: EbayProduct[], amazonProducts: AmazonProduct[]): Phase1HeroKpi[] {
  const ebayPrices = ebayProducts
    .map((p) => p["Price (USD)"])
    .filter((n): n is number => typeof n === "number" && !Number.isNaN(n) && n > 0);
  const amazonPrices = amazonProducts
    .map((p) => p["Price (USD)"])
    .filter((n): n is number => n != null && typeof n === "number" && !Number.isNaN(n) && n > 0);

  const medE = median(ebayPrices);
  const medA = median(amazonPrices);

  const k1: Phase1HeroKpi =
    medE != null && medA != null && medE + medA > 0
      ? {
          id: "cross-market-price-gap",
          label: "Cross-Market Price Gap",
          value: formatPercent((Math.abs(medE - medA) / ((medE + medA) / 2)) * 100),
          trendLabel: "eBay vs Amazon",
          trend: "neutral" as HeroKpiTrend,
          footnote: "Median listing price spread between eBay and Amazon in the current dataset (proxy for cross-market gap).",
        }
      : { ...PHASE1_HERO_KPIS[0]! };

  const k2: Phase1HeroKpi = { ...PHASE1_HERO_KPIS[1]! };

  const allPrices = [...ebayPrices, ...amazonPrices];
  const medAll = median(allPrices);
  const meanAll = mean(allPrices);
  const k3: Phase1HeroKpi =
    medAll != null && medAll > 0 && meanAll != null
      ? {
          id: "market-price-position",
          label: "Market Price Position",
          value: formatPercent(((meanAll - medAll) / medAll) * 100),
          trendLabel: "mean vs median",
          trend: meanAll >= medAll ? ("positive" as HeroKpiTrend) : ("negative" as HeroKpiTrend),
          footnote: "Average listing price vs median across all tracked Amazon and eBay rows.",
        }
      : { ...PHASE1_HERO_KPIS[2]! };

  const sumList = allPrices.reduce((a, b) => a + b, 0);
  const k4: Phase1HeroKpi =
    sumList > 0
      ? {
          id: "alt-vendor-liquidity",
          label: "Alternative Vendor Liquidity",
          value: formatUsdLiquidity(sumList),
          trendLabel: `${formatNumber(allPrices.length)} listings`,
          trend: "neutral" as HeroKpiTrend,
          footnote: "Approx. aggregate listed value ($M / $K); illustrative, not deduplicated inventory.",
        }
      : { ...PHASE1_HERO_KPIS[3]! };

  return [k1, k2, k3, k4];
}

export type BenchmarkRow = {
  id: string;
  brandModel: string;
  platform: "eBay" | "Amazon";
  region: string;
  condition: string;
  price: number;
  vsMarketPct: number | null;
};

export function globalMedianPrice(ebay: EbayProduct[], amazon: AmazonProduct[]): number | null {
  const all = [
    ...ebay.map((p) => p["Price (USD)"]).filter((n) => typeof n === "number" && n > 0),
    ...amazon.map((p) => p["Price (USD)"]).filter((n): n is number => n != null && typeof n === "number" && n > 0),
  ];
  return median(all);
}

export function buildBenchmarkRows(
  ebay: EbayProduct[],
  amazon: AmazonProduct[],
  opts?: { category?: string; platform?: "all" | "ebay" | "amazon" }
): BenchmarkRow[] {
  const med = globalMedianPrice(ebay, amazon);
  const cat = opts?.category?.toLowerCase();
  const plat = opts?.platform ?? "all";

  const rows: BenchmarkRow[] = [];

  if (plat !== "amazon") {
    for (const p of ebay) {
      const price = p["Price (USD)"];
      if (typeof price !== "number" || price <= 0) continue;
      const term = p["Search Term"] || "";
      if (cat && cat !== "all" && !term.toLowerCase().includes(cat) && !p["Product Name"].toLowerCase().includes(cat))
        continue;
      rows.push({
        id: `ebay-${p["Product URL"]}-${rows.length}`,
        brandModel: truncate(p["Product Name"], 56),
        platform: "eBay",
        region: truncate(p["Location of Product"] || "—", 24),
        condition: truncate(p["Condition of Product"] || "—", 28),
        price,
        vsMarketPct: med != null && med > 0 ? ((price - med) / med) * 100 : null,
      });
    }
  }

  if (plat !== "ebay") {
    for (const p of amazon) {
      const price = p["Price (USD)"];
      if (price == null || typeof price !== "number" || price <= 0) continue;
      const brand = p["Brand"] || "";
      const search = p["Search input"] || "";
      if (
        cat &&
        cat !== "all" &&
        !brand.toLowerCase().includes(cat) &&
        !search.toLowerCase().includes(cat) &&
        !p["Product Name"].toLowerCase().includes(cat)
      )
        continue;
      rows.push({
        id: `amz-${p["ASIN"]}-${rows.length}`,
        brandModel: truncate([brand, p["Product Name"]].filter(Boolean).join(" · ") || p["Product Name"], 56),
        platform: "Amazon",
        region: truncate(p["Department"] || p["Business Address"]?.split(",").pop()?.trim() || "—", 28),
        condition: p["Department"] ? truncate(p["Department"], 28) : "—",
        price,
        vsMarketPct: med != null && med > 0 ? ((price - med) / med) * 100 : null,
      });
    }
  }

  rows.sort((a, b) => b.price - a.price);
  return rows.slice(0, 80);
}

export function benchmarkCategoryOptions(ebay: EbayProduct[], amazon: AmazonProduct[]): string[] {
  const set = new Set<string>();
  ebay.forEach((p) => {
    if (p["Search Term"]?.trim()) set.add(p["Search Term"].trim());
  });
  amazon.forEach((p) => {
    if (p["Search input"]?.trim()) set.add(p["Search input"].trim());
    if (p["Brand"]?.trim()) set.add(p["Brand"].trim());
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b)).slice(0, 40);
}

export type SellerCardRow = {
  id: string;
  name: string;
  source: string;
  ratingPct: number | null;
  /** Amazon customer rating 1–5 when source is Amazon */
  ratingStars: number | null;
  location: string;
  itemsSold: number;
  reviews: number;
  followers: number;
  listingSample: number;
};

export function buildSellerDiscoveryCards(ebay: EbayProduct[], amazon: AmazonProduct[], limit = 12): SellerCardRow[] {
  const ebayBySeller = new Map<string, EbayProduct[]>();
  ebay.forEach((p) => {
    const n = p["Seller Name"];
    if (!n) return;
    if (!ebayBySeller.has(n)) ebayBySeller.set(n, []);
    ebayBySeller.get(n)!.push(p);
  });

  const ebayCards: SellerCardRow[] = Array.from(ebayBySeller.entries()).map(([name, rows]) => {
    const sold = Math.max(...rows.map((r) => r["Total Items Sold (Seller)"] || 0));
    const reviews = Math.max(...rows.map((r) => r["Number of Reviews (seller)"] || 0));
    const rating = rows.find((r) => r["Positive Review Percentage % (seller)"] > 0)?.[
      "Positive Review Percentage % (seller)"
    ] ?? null;
    const followers = Math.max(...rows.map((r) => r["Seller Followers"] || 0));
    const loc = rows[0]?.["Location of Product"] || "—";
    return {
      id: `ebay-${name}`,
      name,
      source: "eBay",
      ratingPct: rating,
      ratingStars: null,
      location: truncate(loc, 48),
      itemsSold: sold,
      reviews,
      followers,
      listingSample: rows.length,
    };
  });

  ebayCards.sort((a, b) => b.itemsSold - a.itemsSold);

  const amzBySeller = new Map<string, AmazonProduct[]>();
  amazon.forEach((p) => {
    const n = p["Seller"];
    if (!n) return;
    if (!amzBySeller.has(n)) amzBySeller.set(n, []);
    amzBySeller.get(n)!.push(p);
  });

  const amzCards: SellerCardRow[] = Array.from(amzBySeller.entries()).map(([name, rows]) => {
    const ratings = rows.map((r) => r["Number of Ratings"]).filter((n): n is number => n != null && n > 0);
    const maxRatings = ratings.length ? Math.max(...ratings) : 0;
    const starVals = rows
      .map((r) => r["Customer Rating"])
      .filter((n): n is number => n != null && typeof n === "number" && !Number.isNaN(n));
    const avgStars = starVals.length ? starVals.reduce((a, b) => a + b, 0) / starVals.length : null;
    const addr = rows[0]?.["Business Address"] || "—";
    return {
      id: `amz-${name}`,
      name,
      source: "Amazon",
      ratingPct: null,
      ratingStars: avgStars,
      location: truncate(addr, 48),
      itemsSold: rows.length,
      reviews: maxRatings,
      followers: 0,
      listingSample: rows.length,
    };
  });

  amzCards.sort((a, b) => b.listingSample - a.listingSample);

  return [...ebayCards.slice(0, limit), ...amzCards.slice(0, Math.max(0, limit - ebayCards.length))].slice(0, limit);
}

const MS_PER_DAY = 86400000;

export type VelocityMini = { label: string; value: string; sub: string; fromData: boolean };

export function buildVelocityMinis(ebay: EbayProduct[], amazon: AmazonProduct[]): VelocityMini[] {
  const now = Date.now();
  const seven = now - 7 * MS_PER_DAY;
  const thirty = now - 30 * MS_PER_DAY;

  let scraped7 = 0;
  let scraped30 = 0;
  [...ebay, ...amazon].forEach((p) => {
    const t = parseDateToSort("Date Scraped" in p ? p["Date Scraped"] : "");
    if (t >= seven) scraped7++;
    if (t >= thirty) scraped30++;
  });

  const total = ebay.length + amazon.length;
  const pct7 = total > 0 ? Math.round((scraped7 / total) * 100) : 0;

  const itemsSold = ebay.reduce((s, p) => s + (p["Total Items Sold (Product)"] || 0), 0);

  return [
    {
      label: "Rows refreshed (7d)",
      value: `${pct7}%`,
      sub: "Share of listings with scrape date in the last 7 days (by row).",
      fromData: true,
    },
    {
      label: "New / recent rows (30d)",
      value: formatNumber(scraped30),
      sub: "Listings with scrape date in the last 30 days.",
      fromData: true,
    },
    {
      label: "Units sold (eBay)",
      value: formatNumber(itemsSold),
      sub: "Sum of Total Items Sold (Product) across eBay rows.",
      fromData: true,
    },
    {
      label: "Tracked listings",
      value: formatNumber(total),
      sub: "Amazon + eBay rows in the current dataset.",
      fromData: true,
    },
  ];
}

export type VelocityTableRow = {
  id: string;
  brandModel: string;
  platform: string;
  signal: string;
  lastScrape: string;
  trend: string;
};

export function buildVelocityTable(ebay: EbayProduct[], amazon: AmazonProduct[], limit = 15): VelocityTableRow[] {
  const ebayRows = [...ebay]
    .filter((p) => (p["Total Items Sold (Product)"] || 0) > 0)
    .sort((a, b) => (b["Total Items Sold (Product)"] || 0) - (a["Total Items Sold (Product)"] || 0))
    .slice(0, limit)
    .map((p, i) => ({
      id: `v-ebay-${i}`,
      brandModel: truncate(p["Product Name"], 48),
      platform: "eBay",
      signal: `${formatNumber(p["Total Items Sold (Product)"])} sold (row)`,
      lastScrape: p["Date Scraped"] || "—",
      trend: (p["Total Items Sold (Product)"] || 0) > 500 ? "Hot" : "Steady",
    }));

  if (ebayRows.length >= limit) return ebayRows;

  const need = limit - ebayRows.length;
  const amz = [...amazon].slice(0, need).map((p, i) => ({
    id: `v-amz-${i}`,
    brandModel: truncate(p["Product Name"], 48),
    platform: "Amazon",
    signal: p["Best Sellers Rank"] ? `BSR ${truncate(p["Best Sellers Rank"], 32)}` : "Listed",
    lastScrape: p["Date Scraped"] || "—",
    trend: "Listed",
  }));

  return [...ebayRows, ...amz];
}

export function ebaySearchTermsByVolume(ebay: EbayProduct[]): { term: string; count: number }[] {
  const m = new Map<string, number>();
  ebay.forEach((p) => {
    const t = p["Search Term"]?.trim() || "Unknown";
    m.set(t, (m.get(t) || 0) + 1);
  });
  return Array.from(m.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .map(([term, count]) => ({ term, count }));
}

export type SkuDrilldownStats = {
  term: string;
  count: number;
  min: number;
  max: number;
  median: number | null;
  rows: { seller: string; condition: string; price: number; date: string }[];
};

export function drilldownForSearchTerm(ebay: EbayProduct[], term: string): SkuDrilldownStats | null {
  const rows = ebay.filter((p) => (p["Search Term"] || "").trim() === term.trim());
  if (!rows.length) return null;
  const prices = rows.map((p) => p["Price (USD)"]).filter((n) => typeof n === "number" && n > 0);
  const med = median(prices);
  const min = prices.length ? Math.min(...prices) : 0;
  const max = prices.length ? Math.max(...prices) : 0;
  return {
    term,
    count: rows.length,
    min,
    max,
    median: med,
    rows: rows.slice(0, 40).map((p) => ({
      seller: truncate(p["Seller Name"], 36),
      condition: truncate(p["Condition of Product"] || "—", 24),
      price: p["Price (USD)"] || 0,
      date: p["Date Scraped"] || "—",
    })),
  };
}
