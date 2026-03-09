import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "N/A";
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "N/A";
  return `${value.toFixed(1)}%`;
}

/** Normalize and format date string. Handles YYYY-MM-DD (eBay), DD-MM-YYYY (Amazon), MM-DD-YYYY */
export function formatDate(
  dateStr: string | null | undefined,
  source?: "ebay" | "amazon"
): string {
  if (!dateStr || typeof dateStr !== "string") return "N/A";
  const s = dateStr.trim();
  if (!s) return "N/A";

  let year: string, month: string, day: string;

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    [year, month, day] = s.split("-");
  } else if (/^\d{2}-\d{2}-\d{4}$/.test(s)) {
    const parts = s.split("-");
    if (source === "amazon") {
      [day, month, year] = parts;
    } else {
      [month, day, year] = parts;
    }
  } else {
    return s;
  }

  const date = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
  if (Number.isNaN(date.getTime())) return s;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Parse date string to Date for sorting. Handles YYYY-MM-DD and DD-MM-YYYY */
export function parseDateToSort(dateStr: string | null | undefined): number {
  if (!dateStr || typeof dateStr !== "string") return 0;
  const s = dateStr.trim();
  let year: string, month: string, day: string;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    [year, month, day] = s.split("-");
  } else if (/^\d{2}-\d{2}-\d{4}$/.test(s)) {
    const parts = s.split("-");
    [day, month, year] = parts;
  } else {
    return 0;
  }
  const date = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
  return date.getTime();
}

export function truncate(str: string | null | undefined, maxLen: number): string {
  if (!str) return "";
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + "…";
}
