import type { EbayProduct } from "@/types/ebay";
import type { AmazonProduct } from "@/types/amazon";

/** Join listing location from ebay_clean_v2 / amazon_clean_v2 by product URL (reference files). */
export function buildListingLocationLookup(
  ebay: EbayProduct[],
  amazon: AmazonProduct[]
): Map<string, string> {
  const byUrl = new Map<string, string>();
  for (const p of ebay) {
    const url = p["Product URL"]?.trim();
    const loc = p["Location of Product"]?.trim();
    if (url && loc) byUrl.set(url, loc);
  }
  for (const p of amazon) {
    const url = p["product url"]?.trim();
    const loc = p.Department?.trim();
    if (url && loc) byUrl.set(url, loc);
  }
  return byUrl;
}
