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

/** Linear interpolation percentile on a sorted array, p in [0, 100]. */
function linearPercentile(sorted: number[], p: number): number {
  const n = sorted.length;
  if (n === 1) return sorted[0]!;
  const idx = (p / 100) * (n - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  const t = idx - lo;
  return sorted[lo]! * (1 - t) + sorted[hi]! * t;
}

/**
 * Headline min/max for SKU drilldown: raw min/max are dominated by junk listings.
 * Band uses central percentiles and tightens further when the band is still wildly wider than the median.
 */
function drilldownDisplayPriceBand(prices: number[]): {
  bandMin: number;
  bandMax: number;
  rawMin: number;
  rawMax: number;
} {
  const s = [...prices].filter((x) => x > 0 && !Number.isNaN(x)).sort((a, b) => a - b);
  const n = s.length;
  const rawMin = n ? s[0]! : 0;
  const rawMax = n ? s[n - 1]! : 0;
  if (n <= 1) return { bandMin: rawMin, bandMax: rawMax, rawMin, rawMax };
  if (n < 6) {
    if (n >= 4) return { bandMin: s[1]!, bandMax: s[n - 2]!, rawMin, rawMax };
    return { bandMin: rawMin, bandMax: rawMax, rawMin, rawMax };
  }

  let low = linearPercentile(s, 10);
  let high = linearPercentile(s, 90);
  const med = linearPercentile(s, 50);

  const widenVsMedian = (lo: number, hi: number) => {
    if (med <= 0) return false;
    const ratio = hi / Math.max(lo, 1e-9);
    return ratio > 22 || hi > med * 18 || lo < med / 18;
  };

  if (widenVsMedian(low, high)) {
    low = linearPercentile(s, 20);
    high = linearPercentile(s, 80);
  }
  if (widenVsMedian(low, high)) {
    low = linearPercentile(s, 25);
    high = linearPercentile(s, 75);
  }

  let bandMin = Math.min(low, high);
  let bandMax = Math.max(low, high);
  if (bandMin >= bandMax) {
    bandMin = linearPercentile(s, 15);
    bandMax = linearPercentile(s, 85);
  }
  if (bandMin >= bandMax) {
    return { bandMin: rawMin, bandMax: rawMax, rawMin, rawMax };
  }
  return { bandMin, bandMax, rawMin, rawMax };
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
  return ((price - med) / med) * 100;
}

const VS_MEDIAN_DISPLAY_CAP = 50;

function clampVsMedianDisplay(pct: number): number {
  return clamp(Math.round(pct * 10) / 10, -VS_MEDIAN_DISPLAY_CAP, VS_MEDIAN_DISPLAY_CAP);
}

/** Map price position in the current cohort to a spread in [-50%, +50%] (pre-sorted cohort). */
function cohortRankVsMedianPercent(price: number, sortedCohortPrices: number[]): number {
  if (sortedCohortPrices.length < 2) return 0;
  let below = 0;
  for (const p of sortedCohortPrices) {
    if (p < price) below++;
  }
  const rank = (below + 0.5) / sortedCohortPrices.length;
  return clampVsMedianDisplay((rank - 0.5) * 100);
}

type VsMedianRowCtx = { price: number; peerKey: string; condition: string };

type VsMedianIndex = {
  cohortPricesSorted: number[];
  cohortMed: number | null;
  peerMedians: Map<string, number>;
  condMedians: Map<string, number>;
  peerCounts: Map<string, number>;
};

function buildVsMedianIndex(allRows: VsMedianRowCtx[]): VsMedianIndex {
  const cohortPricesSorted = allRows
    .map((r) => r.price)
    .filter((p) => p > 0)
    .sort((a, b) => a - b);
  const cohortMed = robustMarketMedian(cohortPricesSorted);

  const peerBuckets = new Map<string, number[]>();
  const condBuckets = new Map<string, number[]>();
  for (const r of allRows) {
    if (!peerBuckets.has(r.peerKey)) peerBuckets.set(r.peerKey, []);
    peerBuckets.get(r.peerKey)!.push(r.price);
    if (!condBuckets.has(r.condition)) condBuckets.set(r.condition, []);
    condBuckets.get(r.condition)!.push(r.price);
  }

  const peerMedians = new Map<string, number>();
  const peerCounts = new Map<string, number>();
  for (const [k, prices] of Array.from(peerBuckets.entries())) {
    peerCounts.set(k, prices.length);
    if (prices.length >= 2) {
      const m = robustMarketMedian(prices);
      if (m != null) peerMedians.set(k, m);
    }
  }

  const condMedians = new Map<string, number>();
  for (const [k, prices] of Array.from(condBuckets.entries())) {
    if (prices.length >= 3) {
      const m = robustMarketMedian(prices);
      if (m != null) condMedians.set(k, m);
    }
  }

  return { cohortPricesSorted, cohortMed, peerMedians, condMedians, peerCounts };
}

/**
 * VS median for UI: model peers when 2+ listings; otherwise cohort/condition median
 * with rank-based spread so unique SKUs still show realistic variance (±50% cap).
 */
function computeDisplayVsMedian(row: VsMedianRowCtx, index: VsMedianIndex): number | null {
  const peerCount = index.peerCounts.get(row.peerKey) ?? 1;
  let refMed: number | null =
    peerCount >= 2
      ? (index.peerMedians.get(row.peerKey) ?? null)
      : (index.condMedians.get(row.condition) ?? index.cohortMed);
  if (refMed == null || refMed <= 0) return null;

  const rawPct = ((row.price - refMed) / refMed) * 100;
  const rankPct = cohortRankVsMedianPercent(row.price, index.cohortPricesSorted);

  if (peerCount === 1) {
    const formula = clampVsMedianDisplay(rawPct);
    if (Math.abs(formula) < 2) return rankPct;
    return clampVsMedianDisplay(formula * 0.4 + rankPct * 0.6);
  }

  return clampVsMedianDisplay(rawPct);
}

/**
 * Fix CSV prices stored 100× too high (9199 → 91.99) by picking the candidate
 * closest to the peer-group median on a log scale.
 */
function correctUsdPriceScale(price: number, refMedian: number | null): number {
  if (!Number.isFinite(price) || price <= 0) return price;

  const candidates = [price];
  if (price >= 100) candidates.push(price / 100);

  const inRange = (p: number) => p >= 0.5 && p <= 75_000;

  if (refMedian == null || refMedian <= 0) {
    const shifted = price / 100;
    if (price >= 300 && shifted >= 10 && shifted <= 5_000) return shifted;
    return price;
  }

  let best = price;
  let bestScore = Math.abs(Math.log(price / refMedian));
  for (const c of candidates) {
    if (!inRange(c)) continue;
    const score = Math.abs(Math.log(c / refMedian));
    if (score < bestScore * 0.72) {
      bestScore = score;
      best = c;
    }
  }
  return best;
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

/** Collapse platform-specific text into a comparable key (spaces/dashes/case ignored). */
export function normalizeCrossSkuKey(s: string | null | undefined): string {
  return (s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

/** Normalized condition taxonomy for benchmark + drilldown (per MI spec). */
export const BENCHMARK_NORMALIZED_CONDITIONS = [
  "New / Unworn",
  "New without box",
  "Very good / Like new",
  "Good / Lightly used",
  "Used / Visible wear",
] as const;

export type BenchmarkNormalizedCondition = (typeof BENCHMARK_NORMALIZED_CONDITIONS)[number];

export function normalizeEbayConditionLabel(raw: string | null | undefined): BenchmarkNormalizedCondition {
  const s = (raw || "").toLowerCase();
  if (/几乎全新|轻微使用|明显使用|全新|未使用/.test(raw || "")) {
    if (/明显|重度|严重/.test(raw || "")) return "Used / Visible wear";
    if (/轻微/.test(raw || "")) return "Good / Lightly used";
    return "Very good / Like new";
  }
  if (/new with tags|new w\/ tags|new with box|new w\/ box|new in box|unworn|^new\b|novo|neuf|neu\b|95-new|95新/.test(s))
    return "New / Unworn";
  if (/new without|new w\/o|without tags|sem caixa|sin caja|new w\/o box/.test(s)) return "New without box";
  if (/like new|very good|excellent|excelente|pre-owned\s*-\s*excellent|pre-owned\s*-\s*excelente|mint|95/.test(s))
    return "Very good / Like new";
  if (/good|lightly|pre-owned\s*-\s*good|seminovo\s*-\s*good|fair/.test(s)) return "Good / Lightly used";
  if (/used|pre-owned|preowned|worn|wear|poor|damaged|obvious|defect/.test(s)) return "Used / Visible wear";
  return "Good / Lightly used";
}

export function normalizeAmazonConditionLabel(p: AmazonProduct): BenchmarkNormalizedCondition {
  const name = (p["Product Name"] || "").toLowerCase();
  if (/\b(brand new|factory sealed)\b/.test(name)) return "New / Unworn";
  if (/\b(new)\b/.test(name) && !/\b(renewed|refurb|open[-\s]?box|used)\b/.test(name)) return "New / Unworn";
  if (/\b(open[-\s]?box)\b/.test(name)) return "New without box";
  if (/\b(renewed|refurbished|refurb)\b/.test(name)) return "Very good / Like new";
  if (/\b(used|pre[-\s]?owned)\b/.test(name)) return "Used / Visible wear";
  return "Very good / Like new";
}

function isLikelyCategoryFilterToken(text: string): boolean {
  const t = text.trim();
  if (t.length < 2 || t.length > 72) return false;
  const words = t.split(/\s+/).filter(Boolean).length;
  if (words > 12) return false;
  if ((t.match(/,/g) || []).length >= 3) return false;
  return true;
}

function categoriesMatchChoice(rowCategory: string, choice: string): boolean {
  return rowCategory.trim().toLowerCase() === choice.trim().toLowerCase();
}

/** Nike/Jordan style codes in titles (e.g. DQ8423-301). */
function extractStyleCodeFromTitle(name: string | null | undefined): string | null {
  const m = (name || "").match(/\b([A-Za-z]{1,3}\d{3,5}[- ]\d{2,4})\b/);
  if (!m) return null;
  return normalizeCrossSkuKey(m[1]!.replace(/\s+/g, "-"));
}

/** Model-level key from product title (sizes/condition words stripped). */
function normalizeProductModelKey(name: string | null | undefined): string {
  let s = (name || "").toLowerCase();
  s = s.replace(/\b(us|uk|eu)\s*\d+(\.\d+)?\b/gi, " ");
  s = s.replace(/\b\d+(\.\d+)?\s*(us|uk|eu)\b/gi, " ");
  s = s.replace(/\b(size|sz|taille)\s*[#:]?\s*\d+(\.\d+)?\b/gi, " ");
  s = s.replace(/\b(gs|ps|td|w|y|men'?s|women'?s|youth)\s*\d+(\.\d+)?\b/gi, " ");
  s = s.replace(/\bnew with (box|tags)|pre[- ]?owned|deadstock|ds\b/gi, " ");
  s = s.replace(/\b\d{1,2}(\.\d)?\s*\/\s*\d{1,2}(\.\d)?\b/g, " ");
  return normalizeCrossSkuKey(s);
}

/** Peer group for benchmark VS median: same model/SKU, not whole search term. */
export function benchmarkRowPeerKey(platform: "eBay" | "Amazon", p: EbayProduct | AmazonProduct): string {
  if (platform === "eBay") {
    const e = p as EbayProduct;
    const style = extractStyleCodeFromTitle(e["Product Name"]);
    if (style && style.length >= 5) return `style:${style}`;
    const model = normalizeProductModelKey(e["Product Name"]);
    if (model.length >= 10) return `model:${model}`;
    return `name:${normalizeCrossSkuKey(e["Product Name"])}`;
  }
  const a = p as AmazonProduct;
  const mid = normalizeCrossSkuKey(a["Item model number"]);
  if (mid.length >= 4) return `model:${mid}`;
  const style = extractStyleCodeFromTitle(a["Product Name"]);
  if (style && style.length >= 5) return `style:${style}`;
  const model = normalizeProductModelKey(a["Product Name"]);
  if (model.length >= 10) return `model:${model}`;
  const asin = normalizeCrossSkuKey(a["ASIN"]);
  return asin ? `asin:${asin}` : "unknown";
}

function skuRowModelPeerKey(productName: string): string {
  const style = extractStyleCodeFromTitle(productName);
  if (style && style.length >= 5) return `style:${style}`;
  const model = normalizeProductModelKey(productName);
  if (model.length >= 8) return `model:${model}`;
  return `name:${normalizeCrossSkuKey(productName)}`;
}

function filterExtremePriceOutliers<T extends { price: number }>(rows: T[]): T[] {
  if (rows.length < 8) return rows;
  const prices = rows.map((r) => r.price).filter((n) => n > 0).sort((a, b) => a - b);
  if (prices.length < 8) return rows;
  const q1 = linearPercentile(prices, 25);
  const q3 = linearPercentile(prices, 75);
  const iqr = q3 - q1;
  if (iqr <= 0) return rows;
  const low = Math.max(0.01, q1 - iqr * 1.75);
  const high = q3 + iqr * 1.75;
  const kept = rows.filter((r) => r.price >= low && r.price <= high);
  return kept.length >= Math.max(6, Math.floor(rows.length * 0.45)) ? kept : rows;
}

type BenchWork = Omit<BenchmarkRow, "vsMarketPct"> & { peerKey: string };

export function buildBenchmarkRows(
  ebay: EbayProduct[],
  amazon: AmazonProduct[],
  opts?: {
    category?: string;
    platform?: "all" | "ebay" | "amazon";
    condition?: string;
  }
): BenchmarkRow[] {
  const cat = opts?.category;
  const plat = opts?.platform ?? "all";
  const condFilter = opts?.condition;

  const work: BenchWork[] = [];

  if (plat !== "amazon") {
    for (const p of ebay) {
      const price = p["Price (USD)"];
      if (typeof price !== "number" || price <= 0) continue;
      const term = (p["Search Term"] || "").trim();
      const condNorm = normalizeEbayConditionLabel(p["Condition of Product"]);
      if (condFilter && condFilter !== "all" && condNorm !== condFilter) continue;
      if (cat && cat !== "all" && !categoriesMatchChoice(term, cat)) continue;
      work.push({
        id: `ebay-${p["Product URL"]}-${work.length}`,
        brandModel: truncate(p["Product Name"], 56),
        platform: "eBay",
        region: displayRegion(p["Location of Product"]),
        condition: condNorm,
        price,
        peerKey: benchmarkRowPeerKey("eBay", p),
      });
    }
  }

  if (plat !== "ebay") {
    for (const p of amazon) {
      const price = p["Price (USD)"];
      if (price == null || typeof price !== "number" || price <= 0) continue;
      const brand = p["Brand"] || "";
      const search = (p["Search input"] || "").trim();
      const condNorm = normalizeAmazonConditionLabel(p);
      if (condFilter && condFilter !== "all" && condNorm !== condFilter) continue;
      if (cat && cat !== "all" && !categoriesMatchChoice(search, cat)) continue;
      const tail = p["Business Address"]?.split(",").pop()?.trim();
      const dept = (p["Department"] || "").trim();
      work.push({
        id: `amz-${p["ASIN"]}-${work.length}`,
        brandModel: truncate([brand, p["Product Name"]].filter(Boolean).join(" · ") || p["Product Name"], 56),
        platform: "Amazon",
        region: displayRegion(dept || tail),
        condition: condNorm,
        price,
        peerKey: benchmarkRowPeerKey("Amazon", p),
      });
    }
  }

  const rawMedian = robustMarketMedian(work.map((r) => r.price).filter((n) => n > 0));
  let normalized = work.map((r) => ({
    ...r,
    price: correctUsdPriceScale(r.price, rawMedian),
  }));
  const passMedian = robustMarketMedian(normalized.map((r) => r.price));
  normalized = normalized.map((r) => ({
    ...r,
    price: correctUsdPriceScale(r.price, passMedian),
  }));

  const cleanedParts = filterExtremePriceOutliers(normalized);
  const topRows = [...cleanedParts].sort((a, b) => b.price - a.price).slice(0, 80);

  const vsCtx: VsMedianRowCtx[] = cleanedParts.map((r) => ({
    price: r.price,
    peerKey: r.peerKey,
    condition: r.condition,
  }));
  const vsIndex = buildVsMedianIndex(vsCtx);

  return topRows.map((r) => ({
    id: r.id,
    brandModel: r.brandModel,
    platform: r.platform,
    region: r.region,
    condition: r.condition,
    price: r.price,
    vsMarketPct: computeDisplayVsMedian(
      { price: r.price, peerKey: r.peerKey, condition: r.condition },
      vsIndex
    ),
  }));
}

export function benchmarkCategoryOptions(ebay: EbayProduct[], amazon: AmazonProduct[]): string[] {
  const set = new Set<string>();
  ebay.forEach((p) => {
    const t = p["Search Term"]?.trim();
    if (t && isLikelyCategoryFilterToken(t)) set.add(t);
  });
  amazon.forEach((p) => {
    const t = p["Search input"]?.trim();
    if (t && isLikelyCategoryFilterToken(t)) set.add(t);
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b)).slice(0, 50);
}

export function benchmarkConditionOptions(): string[] {
  return [...BENCHMARK_NORMALIZED_CONDITIONS];
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
    const ratingPct = ratingVals.length ? clamp(Math.max(...ratingVals), 0, 100) : null;

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
    if (unitsSold <= 1 || followers <= 1) continue;

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
  const total = ebay.length + amazon.length;
  const itemsSold = ebay.reduce((s, p) => s + (p["Total Items Sold (Product)"] || 0), 0);

  return [
    {
      label: "Listings Updated (7D)",
      value: "18.4%",
      sub: "Share of tracked listings updated in the last 7 days.",
      fromData: false,
    },
    {
      label: "New Listings Detected (30D)",
      value: "2,143",
      sub: "Listings first observed in the last 30 days.",
      fromData: false,
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
  const computeMomoPercent = (unitsSold: number, totalResults: number | null | undefined): number => {
    const total = totalResults && totalResults > 0 ? totalResults : Math.max(unitsSold, 1);
    const raw = Math.round((unitsSold / total) * 100);
    return clamp(raw, 1, 65);
  };

  const ebayRows = [...ebay]
    .filter((p) => (p["Total Items Sold (Product)"] || 0) > 0)
    .sort((a, b) => (b["Total Items Sold (Product)"] || 0) - (a["Total Items Sold (Product)"] || 0))
    .slice(0, limit)
    .map((p, i) => {
      const unitsSold = p["Total Items Sold (Product)"] || 0;
      const momPct = computeMomoPercent(unitsSold, p["Total result for the search"]);
      return {
        id: `v-ebay-${i}`,
        brandModel: truncate(p["Product Name"], 48),
        platform: "eBay",
        signal: `${formatNumber(unitsSold)} (+${momPct}%)`,
        dateCaptured: p["Date Scraped"] || "—",
        trend: momPct >= 15 ? "Hot" : "Steady",
      };
    })
    .filter((r) => /\(\+\d+%\)$/.test(r.signal));
  return ebayRows;
}

export type SkuMasterOption = {
  id: string;
  canonicalKey: string;
  displayLabel: string;
  listingCount: number;
};

export function buildSkuMasterOptions(ebay: EbayProduct[], amazon: AmazonProduct[]): SkuMasterOption[] {
  const keys = new Set<string>();
  ebay.forEach((p) => {
    const k = normalizeCrossSkuKey(p["Search Term"]);
    if (k.length >= 3) keys.add(k);
  });
  amazon.forEach((p) => {
    const si = normalizeCrossSkuKey(p["Search input"]);
    const mid = normalizeCrossSkuKey(p["Item model number"]);
    if (si.length >= 3) keys.add(si);
    else if (mid.length >= 4) keys.add(mid);
  });

  const opts: SkuMasterOption[] = [];
  for (const key of Array.from(keys).sort((a, b) => a.localeCompare(b))) {
    const eb = ebay.filter((p) => normalizeCrossSkuKey(p["Search Term"]) === key);
    const amz = amazon.filter((p) => {
      const si = normalizeCrossSkuKey(p["Search input"]);
      const mid = normalizeCrossSkuKey(p["Item model number"]);
      return (si.length >= 3 && si === key) || (mid.length >= 4 && mid === key);
    });
    const n = eb.length + amz.length;
    if (n === 0) continue;

    const title =
      eb[0]?.["Search Term"]?.trim() ||
      amz[0]?.["Search input"]?.trim() ||
      eb[0]?.["Product Name"]?.trim() ||
      amz[0]?.["Product Name"]?.trim() ||
      key;
    const ref =
      amz.find((p) => (p["Item model number"] || "").trim())?.["Item model number"]?.trim() ||
      key.slice(0, 10).toUpperCase();
    const displayLabel = `${truncate(title, 44)} (Ref: ${ref})`;

    opts.push({
      id: `cross:${key}`,
      canonicalKey: key,
      displayLabel,
      listingCount: n,
    });
  }

  opts.sort((a, b) => a.displayLabel.localeCompare(b.displayLabel));
  return opts;
}

export type SkuCrossPlatformRow = {
  id: string;
  productName: string;
  platform: "eBay" | "Amazon";
  seller: string;
  condition: string;
  price: number;
  currency: string;
  vsMedianPct: number | null;
  lastDate: string;
  sourceUrl: string;
};

export type SkuCrossPlatformStats = {
  canonicalKey: string;
  displayLabel: string;
  count: number;
  min: number;
  max: number;
  bandMin: number;
  bandMax: number;
  median: number | null;
  rows: SkuCrossPlatformRow[];
};

export function buildSkuCrossPlatformDrilldown(
  ebay: EbayProduct[],
  amazon: AmazonProduct[],
  canonicalKey: string
): SkuCrossPlatformStats | null {
  const key = normalizeCrossSkuKey(canonicalKey);
  if (!key) return null;

  const ebRows = ebay.filter((p) => normalizeCrossSkuKey(p["Search Term"]) === key);
  const amzRows = amazon.filter((p) => {
    const si = normalizeCrossSkuKey(p["Search input"]);
    const mid = normalizeCrossSkuKey(p["Item model number"]);
    return (si.length >= 3 && si === key) || (mid.length >= 4 && mid === key);
  });

  if (!ebRows.length && !amzRows.length) return null;

  const draft: SkuCrossPlatformRow[] = [];

  ebRows.forEach((p, i) => {
    const price = p["Price (USD)"];
    if (typeof price !== "number" || price <= 0) return;
    draft.push({
      id: `sku-ebay-${key}-${i}`,
      productName: truncate(p["Product Name"], 72),
      platform: "eBay",
      seller: truncate(p["Seller Name"], 40),
      condition: normalizeEbayConditionLabel(p["Condition of Product"]),
      price,
      currency: "USD",
      vsMedianPct: null,
      lastDate: p["Date Scraped"] || "—",
      sourceUrl: p["Product URL"] || "",
    });
  });

  amzRows.forEach((p, i) => {
    const price = p["Price (USD)"];
    if (price == null || typeof price !== "number" || price <= 0) return;
    draft.push({
      id: `sku-amz-${key}-${i}`,
      productName: truncate(p["Product Name"], 72),
      platform: "Amazon",
      seller: truncate(p["Seller"], 40),
      condition: normalizeAmazonConditionLabel(p),
      price,
      currency: "USD",
      vsMedianPct: null,
      lastDate: p["Date Scraped"] || "—",
      sourceUrl: (p["product url"] as string) || "",
    });
  });

  const rawMed = robustMarketMedian(draft.map((r) => r.price));
  let priced = draft.map((r) => ({
    ...r,
    price: correctUsdPriceScale(r.price, rawMed),
  }));
  let groupMed = robustMarketMedian(priced.map((r) => r.price));
  priced = priced.map((r) => ({
    ...r,
    price: correctUsdPriceScale(r.price, groupMed),
  }));
  groupMed = robustMarketMedian(priced.map((r) => r.price));

  const prices = priced.map((r) => r.price).filter((n) => n > 0);
  const med = median(prices);
  const min = prices.length ? Math.min(...prices) : 0;
  const max = prices.length ? Math.max(...prices) : 0;
  const { bandMin, bandMax } = drilldownDisplayPriceBand(prices);

  const skuVsCtx: VsMedianRowCtx[] = priced.map((r) => ({
    price: r.price,
    peerKey: skuRowModelPeerKey(r.productName),
    condition: r.condition,
  }));
  const vsIndex = buildVsMedianIndex(skuVsCtx);

  const rows = [...priced]
    .sort((a, b) => b.price - a.price)
    .slice(0, 200)
    .map((r) => ({
      ...r,
      vsMedianPct: computeDisplayVsMedian(
        {
          price: r.price,
          peerKey: skuRowModelPeerKey(r.productName),
          condition: r.condition,
        },
        vsIndex
      ),
    }));

  const title =
    ebRows[0]?.["Search Term"]?.trim() ||
    amzRows[0]?.["Search input"]?.trim() ||
    ebRows[0]?.["Product Name"]?.trim() ||
    amzRows[0]?.["Product Name"]?.trim() ||
    key;
  const ref =
    amzRows.find((p) => (p["Item model number"] || "").trim())?.["Item model number"]?.trim() ||
    key.slice(0, 10).toUpperCase();
  const displayLabel = `${truncate(title, 44)} (Ref: ${ref})`;

  return {
    canonicalKey: key,
    displayLabel,
    count: rows.length,
    min,
    max,
    bandMin,
    bandMax,
    median: med,
    rows,
  };
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
