/** Mapped workbook v2 exports — use row/column structure as-is (no frontend rebuild). */

export type PriceBenchmarkV2Row = {
  normalized_category: string;
  normalized_Brand: string;
  product_family: string;
  normalized_sku: string;
  platform: "ebay" | "amazon";
  listing_count: number;
  median_price: number;
  avg_price: number;
  demo_priority_score: number;
  canonical_product_name: string;
};

export type SkuIndexV2Row = {
  platform: "ebay" | "amazon";
  normalized_category: string;
  normalized_Brand: string;
  product_family: string;
  normalized_sku: string;
  raw_sku: string;
  product_title: string;
  clean_price_usd: number;
  normalized_condition: string;
  product_url: string;
  demo_priority_score: number;
  demo_eligible: boolean;
  platform_rank: number;
};
