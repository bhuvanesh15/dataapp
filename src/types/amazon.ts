export interface AmazonProduct {
  "Seller": string;
  "Seller URL": string;
  "Business Name": string;
  "Business Address": string;
  "Brand": string;
  "Product Name": string;
  "Price (USD)": number | null;
  "Number of Ratings": number | null;
  "Customer Rating": number | null;
  "product url": string;
  "Best Sellers Rank": string;
  "Category Rank": string;
  "Search input": string;
  "Total Results": number;
  "ASIN": string;
  "Selected Size": string | null;
  "Selected Size ASIN": string | null;
  "Date Scraped": string;
  "Week Scraped": string;
  "Package Dimensions": string | null;
  "Item model number": string;
  "Department": string;
}
