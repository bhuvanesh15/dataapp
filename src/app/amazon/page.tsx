"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useData } from "@/context/DataContext";
import { useGlobalSearch } from "@/components/layout/Header";
import { useSettings } from "@/context/SettingsContext";
import { DataTable } from "@/components/tables/DataTable";
import { ColumnToggle } from "@/components/tables/ColumnToggle";
import { getAmazonColumns, AmazonDetailCard } from "@/components/tables/AmazonColumns";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type { AmazonProduct } from "@/types/amazon";
import { Skeleton } from "@/components/ui/skeleton";

function AmazonPageContent() {
  const searchParams = useSearchParams();
  const { amazonProducts, loading } = useData();
  const { globalFilter } = useGlobalSearch();
  const { rowsPerPage } = useSettings();
  const [sellerFilter, setSellerFilter] = useState<string>("all");
  const [searchInputFilter, setSearchInputFilter] = useState<string>("all");
  const sellerFromUrl = searchParams.get("seller");
  useEffect(() => {
    if (sellerFromUrl) setSellerFilter(sellerFromUrl);
  }, [sellerFromUrl]);

  const columns = useMemo(() => getAmazonColumns(), []);

  const sellers = useMemo(() => {
    const set = new Set<string>();
    amazonProducts.forEach((p) => set.add(p["Seller"] || ""));
    return Array.from(set).filter(Boolean).sort();
  }, [amazonProducts]);

  const searchInputs = useMemo(() => {
    const set = new Set<string>();
    amazonProducts.forEach((p) => set.add(p["Search input"] || ""));
    return Array.from(set).filter(Boolean).sort();
  }, [amazonProducts]);

  const filteredData = useMemo(() => {
    let list = amazonProducts;
    if (sellerFilter !== "all") {
      list = list.filter((p) => (p["Seller"] || "") === sellerFilter);
    }
    if (searchInputFilter !== "all") {
      list = list.filter((p) => (p["Search input"] || "") === searchInputFilter);
    }
    return list;
  }, [amazonProducts, sellerFilter, searchInputFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={sellerFilter} onValueChange={setSellerFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seller" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sellers</SelectItem>
            {sellers.slice(0, 100).map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={searchInputFilter} onValueChange={setSearchInputFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Search input" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All search inputs</SelectItem>
            {searchInputs.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DataTable<AmazonProduct>
        columns={columns}
        data={filteredData}
        globalFilter={globalFilter}
        exportFilename="amazon-products"
        pageSize={rowsPerPage}
        loading={loading}
        renderSubComponent={(row) => <AmazonDetailCard row={row.original} />}
        renderToolbar={(table) => <ColumnToggle table={table} />}
      />
    </div>
  );
}

export default function AmazonPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <AmazonPageContent />
    </Suspense>
  );
}
