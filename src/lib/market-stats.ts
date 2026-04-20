import type { EbayProduct } from "@/types/ebay";
import type { AmazonProduct } from "@/types/amazon";
import type { Phase1HeroKpi, HeroKpiTrend } from "@/lib/site-config";
import { PHASE1_HERO_KPIS } from "@/lib/site-config";
import {
  formatUsdLiquidity,
  formatNumber,
  formatPercent,
  parseDateToSort,
  truncate,
  clamp,
} from "@/lib/utils";

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

/** Central price level resistant to extreme tails (5–95% window). */
function robustMarketMedian(nums: number[]): number | null {
  if (!nums.length) return null;
  if (nums.length < 6) return median(nums);
  const s = [...nums].sort((a, b) => a - b);
  const lo = Math.max(0, Math.floor(s.length * 0.05));
  const hi = Math.min(s.length, Math.ceil(s.length * 0.95));
  const slice = s.slice(lo, hi);
  return median(slice.length ? slice : s);
}

/** Average listing price with light tail trim for KPI stability. */
function trimmedMean(nums: number[], trimFrac = 0.1): number | null {
  if (!nums.length) return null;
  if (nums.length < 6) return mean(nums);
  const s = [...nums].sort((a, b) => a - b);
  const k = Math.max(1, Math.floor(s.length * trimFrac));
  const slice = s.slice(k, s.length - k);
  const m = mean(slice.length ? slice : s);
  return m;
}

function vsMedianPercent(price: number, med: number | null): number | null {
  if (med == null || med <= 0) return null;
  const raw = ((price - med) / med) * 100;
  return clamp(raw, -999, 999);
}

/** Hero KPI row: real metrics from monitored marketplace data where possible; tariff row stays static demo. */
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
          footnote:
            "Median listing price spread between eBay and Amazon from monitored marketplace records in the current dataset.",
        }
      : { ...PHASE1_HERO_KPIS[0]! };

  const k2: Phase1HeroKpi = { ...PHASE1_HERO_KPIS[1]! };

  const allPrices = [...ebayPrices, ...amazonPrices];
  const medMarket = robustMarketMedian(allPrices);
  const avgListing = trimmedMean(allPrices, 0.1);
  const k3: Phase1HeroKpi =
    medMarket != null && medMarket > 0 && avgListing != null
      ? {
          id: "market-price-position",
          label: "Market Price Position",
          value: formatPercent(clamp(((avgListing - medMarket) / medMarket) * 100, -99.9, 99.9)),
          trendLabel: "vs market median",
          trend: avgListing >= medMarket ? ("positive" as HeroKpiTrend) : ("negative" as HeroKpiTrend),
          footnote:
            "Average listing price compared with the typical (median) ask across monitored marketplaces.",
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
          footnote: "Approx. aggregate listed value ($M / $K) across monitored listings.",
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
  return robustMarketMedian(all);
}

function displayRegion(raw: string | undefined | null): string {
  const t = (raw || "").trim();
  if (!t || t === "—") return "US";
  return truncate(t, 28);
}

export function buildBenchmarkRows(
  ebay: EbayProduct[],
  amazon: AmazonProduct[],
  opts?: {
    category?: string;
    platform?: "all" | "ebay" | "amazon";
    condition?: string;
  }
): BenchmarkRow[] {
  const med = globalMedianPrice(ebay, amazon);
  const cat = opts?.category?.toLowerCase();
  const plat = opts?.platform ?? "all";
  const condFilter = opts?.condition?.toLowerCase();

  const rows: BenchmarkRow[] = [];

  if (plat !== "amazon") {
    for (const p of ebay) {
      const price = p["Price (USD)"];
      if (typeof price !== "number" || price <= 0) continue;
      const term = p["Search Term"] || "";
      const cond = (p["Condition of Product"] || "").trim();
      if (condFilter && condFilter !== "all" && cond.toLowerCase() !== condFilter) continue;
      if (cat && cat !== "all" && !term.toLowerCase().includes(cat) && !p["Product Name"].toLowerCase().includes(cat))
        continue;
      rows.push({
        id: `ebay-${p["Product URL"]}-${rows.length}`,
        brandModel: truncate(p["Product Name"], 56),
        platform: "eBay",
        region: displayRegion(p["Location of Product"]),
        condition: truncate(p["Condition of Product"] || "—", 28),
        price,
        vsMarketPct: vsMedianPercent(price, med),
      });
    }
  }

  if (plat !== "ebay") {
    for (const p of amazon) {
      const price = p["Price (USD)"];
      if (price == null || typeof price !== "number" || price <= 0) continue;
      const brand = p["Brand"] || "";
      const search = p["Search input"] || "";
      const dept = (p["Department"] || "").trim();
      if (condFilter && condFilter !== "all" && dept.toLowerCase() !== condFilter) continue;
      if (
        cat &&
        cat !== "all" &&
        !brand.toLowerCase().includes(cat) &&
        !search.toLowerCase().includes(cat) &&
        !p["Product Name"].toLowerCase().includes(cat)
      )
        continue;
      const tail = p["Business Address"]?.split(",").pop()?.trim();
      rows.push({
        id: `amz-${p["ASIN"]}-${rows.length}`,
        brandModel: truncate([brand, p["Product Name"]].filter(Boolean).join(" · ") || p["Product Name"], 56),
        platform: "Amazon",
        region: displayRegion(dept || tail),
        condition: dept ? truncate(dept, 28) : "—",
        price,
        vsMarketPct: vsMedianPercent(price, med),
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

export function benchmarkConditionOptions(ebay: EbayProduct[], amazon: AmazonProduct[]): string[] {
  const set = new Set<string>();
  ebay.forEach((p) => {
    const c = p["Condition of Product"]?.trim();
    if (c) set.add(c);
  });
  amazon.forEach((p) => {
    const c = p["Department"]?.trim();
    if (c) set.add(c);
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b)).slice(0, 30);
}

/** Heuristic: listing location reads as United States. */
export function isLikelyUSLocation(location: string): boolean {
  const s = (location || "").trim();
  if (!s) return false;
  const u = s.toUpperCase();
  if (/\bUNITED STATES\b/.test(u)) return true;
  if (/\bUSA\b/.test(u)) return true;
  if (u.endsWith(", US") || u.endsWith(", USA")) return true;
  if (u.endsWith(" US") || u.endsWith(" USA")) return true;
  return false;
}

export type SellerCardRow = {
  id: string;
  name: string;
  source: string;
  ratingPct: number | null;
  ratingStars: number | null;
  location: string;
  /** Sum of Total Items Sold (Product) across seller rows */
  itemsSold: number;
  reviews: number;
  followers: number;
  /** Max Total result for the search across rows */
  productListings: number;
  listingRowCount: number;
};

export function buildSellerDiscoveryCards(
  ebay: EbayProduct[],
  _amazon: AmazonProduct[],
  opts?: {
    onlyNonUS?: boolean;
    minRatingPct?: number | null;
    limit?: number;
    includeUnrated?: boolean;
  }
): SellerCardRow[] {
  const onlyNonUS = opts?.onlyNonUS ?? true;
  const minRating = opts?.minRatingPct ?? null;
  const includeUnrated = opts?.includeUnrated ?? false;
  const limit = opts?.limit ?? 24;

  const bySeller = new Map<string, EbayProduct[]>();
  ebay.forEach((p) => {
    const n = p["Seller Name"];
    if (!n?.trim()) return;
    if (!bySeller.has(n)) bySeller.set(n, []);
    bySeller.get(n)!.push(p);
  });

  const cards: SellerCardRow[] = [];

  for (const [name, rows] of Array.from(bySeller.entries())) {
    const loc = rows[0]?.["Location of Product"] || "";
    if (onlyNonUS) {
      if (!loc.trim() || isLikelyUSLocation(loc)) continue;
    }

    const ratingVals = rows
      .map((r) => r["Positive Review Percentage % (seller)"])
      .filter((x): x is number => typeof x === "number" && x > 0 && !Number.isNaN(x));
    const ratingPct = ratingVals.length ? Math.max(...ratingVals) : null;

    if (!includeUnrated && ratingPct == null) continue;
    if (minRating != null && (ratingPct == null || ratingPct < minRating)) continue;

    const unitsSold = rows.reduce((s, r) => s + (r["Total Items Sold (Product)"] || 0), 0);
    const reviewNums = rows.map((r) => r["Number of Reviews (seller)"] || 0);
    const reviews = reviewNums.length ? Math.max(...reviewNums) : 0;
    const followerNums = rows.map((r) => r["Seller Followers"] || 0);
    const followers = followerNums.length ? Math.max(...followerNums) : 0;
    const tr = rows
      .map((r) => r["Total result for the search"])
      .filter((n): n is number => typeof n === "number" && !Number.isNaN(n) && n > 0);
    const productListings = tr.length ? Math.max(...tr) : rows.length;

    cards.push({
      id: `ebay-${name}`,
      name,
      source: "eBay",
      ratingPct,
      ratingStars: null,
      location: truncate(loc || "—", 48),
      itemsSold: unitsSold,
      reviews,
      followers,
      productListings,
      listingRowCount: rows.length,
    });
  }

  cards.sort((a, b) => {
    const ar = a.ratingPct != null ? 1 : 0;
    const br = b.ratingPct != null ? 1 : 0;
    if (ar !== br) return br - ar;
    if (a.ratingPct != null && b.ratingPct != null && b.ratingPct !== a.ratingPct) return b.ratingPct - a.ratingPct;
    return b.itemsSold - a.itemsSold;
  });

  return cards.slice(0, limit);
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
      label: "Listings Updated (7D)",
      value: `${pct7}%`,
      sub: "Share of tracked listings updated in the last 7 days.",
      fromData: true,
    },
    {
      label: "New Listings Detected (30D)",
      value: formatNumber(scraped30),
      sub: "Listings first observed in the last 30 days.",
      fromData: true,
    },
    {
      label: "Units Sold (eBay)",
      value: formatNumber(itemsSold),
      sub: "Sum of units sold on monitored eBay product rows.",
      fromData: true,
    },
    {
      label: "Listings Tracked",
      value: formatNumber(total),
      sub: "Amazon and eBay rows in the current dataset.",
      fromData: true,
    },
  ];
}

export type VelocityTableRow = {
  id: string;
  brandModel: string;
  platform: string;
  signal: string;
  dateCaptured: string;
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
      signal: `Units Sold: ${formatNumber(p["Total Items Sold (Product)"])}`,
      dateCaptured: p["Date Scraped"] || "—",
      trend: (p["Total Items Sold (Product)"] || 0) > 500 ? "Hot" : "Steady",
    }));

  if (ebayRows.length >= limit) return ebayRows;

  const need = limit - ebayRows.length;
  const amz = [...amazon].slice(0, need).map((p, i) => ({
    id: `v-amz-${i}`,
    brandModel: truncate(p["Product Name"], 48),
    platform: "Amazon",
    signal: p["Best Sellers Rank"] ? `BSR ${truncate(p["Best Sellers Rank"], 32)}` : "Listed",
    dateCaptured: p["Date Scraped"] || "—",
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
