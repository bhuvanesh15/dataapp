"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useData } from "@/context/DataContext";
import { useGlobalSearch } from "@/components/layout/Header";
import { useSettings } from "@/context/SettingsContext";
import { DataTable } from "@/components/tables/DataTable";
import { ColumnToggle } from "@/components/tables/ColumnToggle";
import { getEbayColumns, EbayDetailCard } from "@/components/tables/EbayColumns";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type { EbayProduct } from "@/types/ebay";
import { Skeleton } from "@/components/ui/skeleton";

function EbayPageContent() {
  const searchParams = useSearchParams();
  const { ebayProducts, loading } = useData();
  const { globalFilter } = useGlobalSearch();
  const { rowsPerPage } = useSettings();
  const [conditionFilter, setConditionFilter] = useState<string>("all");
  const [searchTermFilter, setSearchTermFilter] = useState<string>("all");
  const [sellerFilter, setSellerFilter] = useState<string>("all");
  const sellerFromUrl = searchParams.get("seller");
  useEffect(() => {
    if (sellerFromUrl) setSellerFilter(sellerFromUrl);
  }, [sellerFromUrl]);

  const columns = useMemo(() => getEbayColumns(), []);

  const conditions = useMemo(() => {
    const set = new Set<string>();
    ebayProducts.forEach((p) => set.add(p["Condition of Product"] || ""));
    return Array.from(set).filter(Boolean).sort();
  }, [ebayProducts]);

  const searchTerms = useMemo(() => {
    const set = new Set<string>();
    ebayProducts.forEach((p) => set.add(p["Search Term"] || ""));
    return Array.from(set).filter(Boolean).sort();
  }, [ebayProducts]);

  const sellerNames = useMemo(() => {
    const set = new Set<string>();
    ebayProducts.forEach((p) => set.add(p["Seller Name"] || ""));
    return Array.from(set).filter(Boolean).sort();
  }, [ebayProducts]);

  const filteredData = useMemo(() => {
    let list = ebayProducts;
    if (conditionFilter !== "all") {
      list = list.filter((p) => (p["Condition of Product"] || "") === conditionFilter);
    }
    if (searchTermFilter !== "all") {
      list = list.filter((p) => (p["Search Term"] || "") === searchTermFilter);
    }
    if (sellerFilter !== "all") {
      list = list.filter((p) => (p["Seller Name"] || "") === sellerFilter);
    }
    return list;
  }, [ebayProducts, conditionFilter, searchTermFilter, sellerFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={conditionFilter} onValueChange={setConditionFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All conditions</SelectItem>
            {conditions.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={searchTermFilter} onValueChange={setSearchTermFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Search term" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All search terms</SelectItem>
            {searchTerms.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sellerFilter} onValueChange={setSellerFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seller" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sellers</SelectItem>
            {sellerNames.slice(0, 100).map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DataTable<EbayProduct>
        columns={columns}
        data={filteredData}
        globalFilter={globalFilter}
        exportFilename="ebay-products"
        pageSize={rowsPerPage}
        loading={loading}
        renderSubComponent={(row) => <EbayDetailCard row={row.original} />}
        renderToolbar={(table) => <ColumnToggle table={table} />}
      />
    </div>
  );
}

export default function EbayPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <EbayPageContent />
    </Suspense>
  );
}
