"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

const ROWS_PER_PAGE_KEY = "product-intel-rows-per-page";
const SHOW_AMAZON_KEY = "product-intel-show-amazon";
const SHOW_EBAY_KEY = "product-intel-show-ebay";

type SettingsContextValue = {
  rowsPerPage: number;
  setRowsPerPage: (n: number) => void;
  showAmazon: boolean;
  showEbay: boolean;
  setShowAmazon: (v: boolean) => void;
  setShowEbay: (v: boolean) => void;
};

const defaultRows = 25;
function getStoredRows(): number {
  if (typeof window === "undefined") return defaultRows;
  const v = localStorage.getItem(ROWS_PER_PAGE_KEY);
  const n = Number(v);
  if ([10, 25, 50, 100].includes(n)) return n;
  return defaultRows;
}
function getStoredShowAmazon(): boolean {
  if (typeof window === "undefined") return true;
  const v = localStorage.getItem(SHOW_AMAZON_KEY);
  return v !== "false";
}
function getStoredShowEbay(): boolean {
  if (typeof window === "undefined") return true;
  const v = localStorage.getItem(SHOW_EBAY_KEY);
  return v !== "false";
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [rowsPerPage, setRowsPerPageState] = useState(defaultRows);
  const [showAmazon, setShowAmazonState] = useState(true);
  const [showEbay, setShowEbayState] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setRowsPerPageState(getStoredRows());
    setShowAmazonState(getStoredShowAmazon());
    setShowEbayState(getStoredShowEbay());
    setMounted(true);
  }, []);

  const setRowsPerPage = useCallback((n: number) => {
    setRowsPerPageState(n);
    if (typeof window !== "undefined") localStorage.setItem(ROWS_PER_PAGE_KEY, String(n));
  }, []);

  const setShowAmazon = useCallback((v: boolean) => {
    setShowAmazonState(v);
    if (typeof window !== "undefined") localStorage.setItem(SHOW_AMAZON_KEY, String(v));
  }, []);

  const setShowEbay = useCallback((v: boolean) => {
    setShowEbayState(v);
    if (typeof window !== "undefined") localStorage.setItem(SHOW_EBAY_KEY, String(v));
  }, []);

  const value: SettingsContextValue = mounted
    ? { rowsPerPage, setRowsPerPage, showAmazon, showEbay, setShowAmazon, setShowEbay }
    : {
        rowsPerPage: defaultRows,
        setRowsPerPage,
        showAmazon: true,
        showEbay: true,
        setShowAmazon,
        setShowEbay,
      };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
