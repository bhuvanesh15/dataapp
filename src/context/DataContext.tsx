"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { EbayProduct } from "@/types/ebay";
import type { AmazonProduct } from "@/types/amazon";
import type { PriceBenchmarkV2Row, SkuIndexV2Row } from "@/types/v2";
import { parseCSVFromURL } from "@/lib/csv-parse";
import {
  mapPriceBenchmarkV2,
  mapSkuIndexV2,
  mapRowsToEbayV2,
  mapRowsToAmazonV2,
} from "@/lib/v2-csv-parse";

type DataContextValue = {
  ebayProducts: EbayProduct[];
  amazonProducts: AmazonProduct[];
  priceBenchmarkRows: PriceBenchmarkV2Row[];
  skuIndexRows: SkuIndexV2Row[];
  loading: boolean;
  loadError: string | null;
  lastRefresh: Date | null;
  setEbayProducts: (p: EbayProduct[] | ((prev: EbayProduct[]) => EbayProduct[])) => void;
  setAmazonProducts: (p: AmazonProduct[] | ((prev: AmazonProduct[]) => AmazonProduct[])) => void;
  mergeEbayProducts: (rows: EbayProduct[]) => void;
  mergeAmazonProducts: (rows: AmazonProduct[]) => void;
  clearAllData: () => void;
  reloadFromCSV: () => Promise<void>;
};

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [ebayProducts, setEbayProducts] = useState<EbayProduct[]>([]);
  const [amazonProducts, setAmazonProducts] = useState<AmazonProduct[]>([]);
  const [priceBenchmarkRows, setPriceBenchmarkRows] = useState<PriceBenchmarkV2Row[]>([]);
  const [skuIndexRows, setSkuIndexRows] = useState<SkuIndexV2Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [ebayRes, amazonRes, benchmarkRes, skuRes] = await Promise.all([
        parseCSVFromURL("/data/ebay_clean_v2.csv").catch((e) => {
          console.warn("eBay v2 CSV load failed:", e);
          return { data: [] as Record<string, unknown>[], meta: {} };
        }),
        parseCSVFromURL("/data/amazon_clean_v2.csv").catch((e) => {
          console.warn("Amazon v2 CSV load failed:", e);
          return { data: [] as Record<string, unknown>[], meta: {} };
        }),
        parseCSVFromURL("/data/price_benchmark_v2.csv").catch((e) => {
          console.warn("Price benchmark v2 CSV load failed:", e);
          return { data: [] as Record<string, unknown>[], meta: {} };
        }),
        parseCSVFromURL("/data/sku_index_v2.csv").catch((e) => {
          console.warn("SKU index v2 CSV load failed:", e);
          return { data: [] as Record<string, unknown>[], meta: {} };
        }),
      ]);

      setEbayProducts(mapRowsToEbayV2(ebayRes.data));
      setAmazonProducts(mapRowsToAmazonV2(amazonRes.data));
      setPriceBenchmarkRows(mapPriceBenchmarkV2(benchmarkRes.data));
      setSkuIndexRows(mapSkuIndexV2(skuRes.data));
      setLastRefresh(new Date());
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load data");
      setEbayProducts([]);
      setAmazonProducts([]);
      setPriceBenchmarkRows([]);
      setSkuIndexRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const mergeEbayProducts = useCallback((rows: EbayProduct[]) => {
    setEbayProducts((prev) => [...prev, ...rows]);
    setLastRefresh(new Date());
  }, []);

  const mergeAmazonProducts = useCallback((rows: AmazonProduct[]) => {
    setAmazonProducts((prev) => [...prev, ...rows]);
    setLastRefresh(new Date());
  }, []);

  const clearAllData = useCallback(() => {
    setEbayProducts([]);
    setAmazonProducts([]);
    setPriceBenchmarkRows([]);
    setSkuIndexRows([]);
    setLastRefresh(new Date());
  }, []);

  const value: DataContextValue = {
    ebayProducts,
    amazonProducts,
    priceBenchmarkRows,
    skuIndexRows,
    loading,
    loadError,
    lastRefresh,
    setEbayProducts,
    setAmazonProducts,
    mergeEbayProducts,
    mergeAmazonProducts,
    clearAllData,
    reloadFromCSV: loadData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
