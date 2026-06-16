export type SellerDiscoveryV3Row = {
  seller: string;
  location: string;
  units_sold: number;
  product_listings: number;
  reviews: number;
  /** Decimal fraction (e.g. 0.998) or whole percent from workbook */
  positive_pct: number;
};
