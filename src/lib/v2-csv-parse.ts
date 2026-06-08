import type { EbayProduct } from "@/types/ebay";
import type { AmazonProduct } from "@/types/amazon";
import type { PriceBenchmarkV2Row, SkuIndexV2Row } from "@/types/v2";

function toStr(v: unknown): string {
  if (v == null) return "";
  return String(v).trim();
}

function toNum(v: unknown): number {
  if (v == null || v === "") return 0;
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  const n = Number(String(v).replace(/[^0-9.-]/g, ""));
  return Number.isNaN(n) ? 0 : n;
}

function toNumOrNull(v: unknown): number | null {
  if (v == null || v === "") return null;
  if (typeof v === "number") return Number.isNaN(v) ? null : v;
  const n = Number(String(v).replace(/[^0-9.-]/g, ""));
  return Number.isNaN(n) ? null : n;
}

function toPlatform(v: unknown): "ebay" | "amazon" {
  const s = toStr(v).toLowerCase();
  return s === "amazon" ? "amazon" : "ebay";
}

function toBool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  const s = toStr(v).toLowerCase();
  return s === "true" || s === "1" || s === "yes";
}

/** v2 ebay export has no scrape date; map demo_priority_score to a recent capture window. */
function deriveV2CaptureDate(demoPriorityScore: number): string {
  const anchor = new Date(2026, 4, 19);
  const daysAgo = Math.round(Math.min(30, Math.max(0, (18 - demoPriorityScore) * 1.7)));
  anchor.setDate(anchor.getDate() - daysAgo);
  const y = anchor.getFullYear();
  const m = String(anchor.getMonth() + 1).padStart(2, "0");
  const d = String(anchor.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function deriveV2WeekCaptured(isoDate: string): string {
  const parts = isoDate.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return "";
  const dt = new Date(parts[0]!, parts[1]! - 1, parts[2]!);
  const start = new Date(dt);
  start.setDate(dt.getDate() - dt.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = (d: Date) =>
    `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
  return `${fmt(start)} - ${fmt(end)}`;
}

export function mapPriceBenchmarkV2(rows: Record<string, unknown>[]): PriceBenchmarkV2Row[] {
  return rows.map((row) => ({
    normalized_category: toStr(row["normalized_category"]),
    normalized_Brand: toStr(row["normalized_Brand"]),
    product_family: toStr(row["product_family"]),
    normalized_sku: toStr(row["normalized_sku"]),
    platform: toPlatform(row["platform"]),
    listing_count: toNum(row["listing_count"]),
    median_price: toNum(row["median_price"]),
    avg_price: toNum(row["avg_price"]),
    demo_priority_score: toNum(row["demo_priority_score"]),
  }));
}

export function mapSkuIndexV2(rows: Record<string, unknown>[]): SkuIndexV2Row[] {
  return rows.map((row) => ({
    platform: toPlatform(row["platform"]),
    normalized_category: toStr(row["normalized_category"]),
    normalized_Brand: toStr(row["normalized_Brand"]),
    product_family: toStr(row["product_family"]),
    normalized_sku: toStr(row["normalized_sku"]),
    raw_sku: toStr(row["raw_sku"]),
    product_title: toStr(row["product_title"]),
    clean_price_usd: toNum(row["clean_price_usd"]),
    normalized_condition: toStr(row["normalized_condition"]),
    product_url: toStr(row["product_url"]),
    demo_priority_score: toNum(row["demo_priority_score"]),
    demo_eligible: toBool(row["demo_eligible"]),
    platform_rank: toNum(row["platform_rank"]),
  }));
}

/** Map ebay_clean_v2.csv into legacy EbayProduct shape for seller/velocity/KPI tabs. */
export function mapRowsToEbayV2(rows: Record<string, unknown>[]): EbayProduct[] {
  return rows.map((row) => {
    const scraped = toStr(row["Date Scraped"]);
    const score = toNum(row["demo_priority_score"]);
    const dateScraped = scraped || deriveV2CaptureDate(score);
    return {
      "Search Term": toStr(row["Category"] || row["source_category"] || row["normalized_category"]),
      "Total result for the search": 0,
      "Product Name": toStr(row["Product Name"] || row["product_title"]),
      "Price (USD)": toNum(row["Price (USD)"]),
      "Location of Product": toStr(row["Location of Product"] || row["Location"]),
      "Condition of Product": toStr(row["normalized_condition"] || row["Condition"]),
      "Total Items Sold (Product)": toNum(row["Total Items Sold (Product)"]),
      "Product URL": toStr(row["Product URL"]),
      "Seller Name": toStr(row["Seller Name"]),
      "Total Items Sold (Seller)": 0,
      "Number of Reviews (seller)": toNum(row["Number of Reviews (seller)"]),
      "Positive Review Percentage % (seller)": toNum(row["Positive Review Percentage % (seller)"]),
      "Seller Followers": 0,
      "Seller URL": "",
      "Date Scraped": dateScraped,
      "Week Scraped": toStr(row["Week Scraped"]) || deriveV2WeekCaptured(dateScraped),
    };
  });
}

/** Map amazon_clean_v2.csv into legacy AmazonProduct shape for seller/velocity/KPI tabs. */
export function mapRowsToAmazonV2(rows: Record<string, unknown>[]): AmazonProduct[] {
  return rows.map((row) => {
    const scraped = toStr(row["Date Scraped"]);
    const score = toNum(row["demo_priority_score"]);
    const dateScraped = scraped || deriveV2CaptureDate(score);
    return {
      Seller: toStr(row["Seller"]),
      "Seller URL": "",
      "Business Name": "",
      "Business Address": "",
      Brand: toStr(row["normalized_Brand"] || row["Brand"]),
      "Product Name": toStr(row["Product Name"] || row["product_title"]),
      "Price (USD)": toNumOrNull(row["clean_price_usd"] ?? row["Price (USD)"]),
      "Number of Ratings": toNumOrNull(row["Number of Ratings"]),
      "Customer Rating": toNumOrNull(row["Customer Rating"]),
      "product url": toStr(row["product url"]),
      "Best Sellers Rank": "",
      "Category Rank": "",
      "Search input": toStr(row["source_category"] || row["normalized_category"]),
      "Total Results": 0,
      ASIN: toStr(row["ASIN"]),
      "Selected Size": toStr(row["Selected Size"]) || null,
      "Selected Size ASIN": null,
      "Date Scraped": dateScraped,
      "Week Scraped": toStr(row["Week Scraped"]) || deriveV2WeekCaptured(dateScraped),
      "Package Dimensions": null,
      "Item model number": toStr(row["normalized_sku"] || row["Item model number"] || row["raw_sku"]),
      Department: toStr(row["Department"]),
    };
  });
}
