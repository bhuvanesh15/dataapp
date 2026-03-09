"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { EbayProduct } from "@/types/ebay";
import type { AmazonProduct } from "@/types/amazon";
import {
  parseCSVFromURL,
  mapRowsToEbay,
  mapRowsToAmazon,
} from "@/lib/csv-parse";

type DataContextValue = {
  ebayProducts: EbayProduct[];
  amazonProducts: AmazonProduct[];
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
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [ebayRes, amazonRes] = await Promise.all([
        parseCSVFromURL("/data/ebay.csv").catch((e) => {
          console.warn("eBay CSV load failed:", e);
          return { data: [] as Record<string, unknown>[], meta: {} };
        }),
        parseCSVFromURL("/data/amazon.csv").catch((e) => {
          console.warn("Amazon CSV load failed:", e);
          return { data: [] as Record<string, unknown>[], meta: {} };
        }),
      ]);
      setEbayProducts(mapRowsToEbay(ebayRes.data));
      setAmazonProducts(mapRowsToAmazon(amazonRes.data));
      setLastRefresh(new Date());
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load data");
      setEbayProducts([]);
      setAmazonProducts([]);
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
    setLastRefresh(new Date());
  }, []);

  const value: DataContextValue = {
    ebayProducts,
    amazonProducts,
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
