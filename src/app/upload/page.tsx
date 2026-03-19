"use client";

import { useState, useCallback } from "react";
import { useData } from "@/context/DataContext";
import { parseCSV, detectMarketplace, mapRowsToEbay, mapRowsToAmazon } from "@/lib/csv-parse";
import { DropZone } from "@/components/upload/DropZone";
import { PreviewTable } from "@/components/upload/PreviewTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ToastSimple } from "@/components/ui/toast-simple";
import type { EbayProduct } from "@/types/ebay";
import type { AmazonProduct } from "@/types/amazon";

type DetectedFormat = "ebay" | "amazon" | null;

export default function UploadPage() {
  const { mergeEbayProducts, mergeAmazonProducts, clearAllData } = useData();
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<Record<string, unknown>[]>([]);
  const [detectedFormat, setDetectedFormat] = useState<DetectedFormat>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setToastOpen(true);
  }, []);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setParseError(null);
    setDetectedFormat(null);
    setParsedRows([]);
    setFile(selectedFile);
    try {
      const { data } = await parseCSV(selectedFile);
      const rows = data as Record<string, unknown>[];
      if (!rows.length) {
        setParseError("No rows found in CSV");
        return;
      }
      const headers = Object.keys(rows[0] || {});
      const format = detectMarketplace(headers);
      if (!format) {
        setParseError("Could not detect format. Expected Amazon or eBay column headers.");
        return;
      }
      setDetectedFormat(format);
      setParsedRows(rows);
    } catch (e) {
      setParseError(e instanceof Error ? e.message : "Failed to parse CSV");
    }
  }, []);

  const handleImport = useCallback(() => {
    if (!detectedFormat || !parsedRows.length) return;
    if (detectedFormat === "ebay") {
      const mapped = mapRowsToEbay(parsedRows);
      mergeEbayProducts(mapped);
      showToast(`Imported ${mapped.length} eBay product(s).`);
    } else {
      const mapped = mapRowsToAmazon(parsedRows);
      mergeAmazonProducts(mapped);
      showToast(`Imported ${mapped.length} Amazon product(s).`);
    }
    setFile(null);
    setParsedRows([]);
    setDetectedFormat(null);
  }, [detectedFormat, parsedRows, mergeEbayProducts, mergeAmazonProducts, showToast]);

  const handleClearAll = useCallback(() => {
    clearAllData();
    setClearDialogOpen(false);
    showToast("All data cleared.");
  }, [clearAllData, showToast]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload CSV</CardTitle>
          <p className="text-sm text-slate-400">
            Upload a CSV file to merge with existing data. Format is auto-detected from column headers.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <DropZone onFileSelect={handleFileSelect} />
          {parseError && (
            <p className="text-sm text-rose-400">{parseError}</p>
          )}
          {detectedFormat && (
            <>
              <p className="text-sm text-slate-400">
                Detected format: <strong className="text-white">{detectedFormat === "ebay" ? "eBay" : "Amazon"}</strong>
              </p>
              <p className="text-sm">First 5 rows:</p>
              <PreviewTable rows={parsedRows} maxRows={5} />
              <Button onClick={handleImport}>Import {parsedRows.length} row(s)</Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clear All Data</CardTitle>
          <p className="text-sm text-slate-400">
            Remove all loaded and imported data from the dashboard. This does not delete your CSV files.
          </p>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => setClearDialogOpen(true)}>
            Clear All Data
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expected CSV Format</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-400">
          <div>
            <strong className="text-white">eBay:</strong> Columns such as Search Term, Total result for the search,
            Product Name, Price (USD), Condition of Product, Seller Name, Date Scraped, Week Scraped, etc.
          </div>
          <div>
            <strong className="text-white">Amazon:</strong> Columns such as Seller, Seller URL, Business Name,
            Product Name, ASIN, Best Sellers Rank, product url, Date Scraped, Week Scraped, etc.
          </div>
        </CardContent>
      </Card>

      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear all data?</DialogTitle>
            <p className="text-sm text-slate-400">
              This will remove all products and sellers from the dashboard. You can reload data from CSV files or upload again.
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearAll}>
              Clear All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ToastSimple
        message={toastMessage}
        open={toastOpen}
        onClose={() => setToastOpen(false)}
      />
    </div>
  );
}
