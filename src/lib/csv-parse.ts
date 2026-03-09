import Papa from "papaparse";
import type { EbayProduct } from "@/types/ebay";
import type { AmazonProduct } from "@/types/amazon";

export function parseCSV(file: File): Promise<{ data: Record<string, unknown>[]; meta: Papa.ParseResult<unknown>["meta"] }> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0 && !results.data.length) {
          reject(new Error(results.errors.map((e) => e.message).join("; ")));
          return;
        }
        resolve({
          data: results.data as Record<string, unknown>[],
          meta: results.meta,
        });
      },
      error: (err: Error) => reject(err),
    });
  });
}

export async function parseCSVFromURL(
  url: string
): Promise<{ data: Record<string, unknown>[]; meta: Papa.ParseResult<unknown>["meta"] }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const text = await res.text();
  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0 && !results.data.length) {
          reject(new Error(results.errors.map((e) => e.message).join("; ")));
          return;
        }
        resolve({
          data: results.data as Record<string, unknown>[],
          meta: results.meta,
        });
      },
      error: (err: Error) => reject(err),
    });
  });
}

export function detectMarketplace(headers: string[]): "ebay" | "amazon" | null {
  const h = new Set(headers.map((x) => x.trim()));
  if (h.has("Search Term") && h.has("Total result for the search")) return "ebay";
  if (h.has("ASIN") && (h.has("Seller") || h.has("Best Sellers Rank"))) return "amazon";
  return null;
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

function toStr(v: unknown): string {
  if (v == null) return "";
  return String(v).trim();
}

function toStrOrNull(v: unknown): string | null {
  if (v == null || String(v).trim() === "") return null;
  return String(v).trim();
}

export function mapRowsToEbay(rows: Record<string, unknown>[]): EbayProduct[] {
  return rows.map((row) => ({
    "Search Term": toStr(row["Search Term"]),
    "Total result for the search": toNum(row["Total result for the search"]),
    "Product Name": toStr(row["Product Name"]),
    "Price (USD)": toNum(row["Price (USD)"]),
    "Location of Product": toStr(row["Location of Product"]),
    "Condition of Product": toStr(row["Condition of Product"]),
    "Total Items Sold (Product)": toNum(row["Total Items Sold (Product)"]),
    "Product URL": toStr(row["Product URL"]),
    "Seller Name": toStr(row["Seller Name"]),
    "Total Items Sold (Seller)": toNum(row["Total Items Sold (Seller)"]),
    "Number of Reviews (seller)": toNum(row["Number of Reviews (seller)"]),
    "Positive Review Percentage % (seller)": toNum(row["Positive Review Percentage % (seller)"]),
    "Seller Followers": toNum(row["Seller Followers"]),
    "Seller URL": toStr(row["Seller URL"]),
    "Date Scraped": toStr(row["Date Scraped"]),
    "Week Scraped": toStr(row["Week Scraped"]),
  }));
}

export function mapRowsToAmazon(rows: Record<string, unknown>[]): AmazonProduct[] {
  return rows.map((row) => ({
    "Seller": toStr(row["Seller"]),
    "Seller URL": toStr(row["Seller URL"]),
    "Business Name": toStr(row["Business Name"]),
    "Business Address": toStr(row["Business Address"]),
    "Brand": toStr(row["Brand"]),
    "Product Name": toStr(row["Product Name"]),
    "Price (USD)": toNumOrNull(row["Price (USD)"]),
    "Number of Ratings": toNumOrNull(row["Number of Ratings"]),
    "Customer Rating": toNumOrNull(row["Customer Rating"]),
    "product url": toStr(row["product url"]),
    "Best Sellers Rank": toStr(row["Best Sellers Rank"]),
    "Category Rank": toStr(row["Category Rank"]),
    "Search input": toStr(row["Search input"]),
    "Total Results": toNum(row["Total Results"]),
    "ASIN": toStr(row["ASIN"]),
    "Selected Size": toStrOrNull(row["Selected Size"]),
    "Selected Size ASIN": toStrOrNull(row["Selected Size ASIN"]),
    "Date Scraped": toStr(row["Date Scraped"]),
    "Week Scraped": toStr(row["Week Scraped"]),
    "Package Dimensions": toStrOrNull(row["Package Dimensions"]),
    "Item model number": toStr(row["Item model number"]),
    "Department": toStr(row["Department"]),
  }));
}
