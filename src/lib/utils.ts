import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

export function formatPrice(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "N/A";
  const overThousand = Math.abs(value) >= 1000;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: overThousand ? 0 : 2,
    maximumFractionDigits: overThousand ? 0 : 2,
  }).format(value);
}

/** Large USD totals for KPIs: prefer $M / $K instead of long raw amounts. */
export function formatUsdLiquidity(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value) || value < 0) return "N/A";
  const abs = value;
  if (abs >= 1_000_000_000) return `$${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 100_000) return `$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `$${(abs / 1_000).toFixed(1)}K`;
  return formatPrice(abs);
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "N/A";
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "N/A";
  return `${value.toFixed(1)}%`;
}

/** Workbook positive fraction (0.998) or whole percent → display percent string. */
export function formatPositivePct(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  const pct = value > 0 && value <= 1 ? value * 100 : value;
  const rounded = Math.round(pct * 10) / 10;
  if (rounded >= 99.95) return "100%";
  return `${rounded % 1 === 0 ? Math.round(rounded) : rounded.toFixed(1)}%`;
}

export function formatPercentWhole(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "N/A";
  return `${Math.round(value)}%`;
}

/** Signed percent with one decimal (e.g. +4.0%, -12.3%). */
export function formatSignedPercent1dp(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "N/A";
  const v = Math.round(value * 10) / 10;
  const sign = v > 0 ? "+" : v < 0 ? "" : "";
  return `${sign}${v.toFixed(1)}%`;
}

/** Capitalize Each Word for demo display (Category, Product Name, Location, Condition). */
export function titleCaseDisplay(value: string | null | undefined): string {
  if (!value?.trim()) return "—";
  return value
    .trim()
    .toLowerCase()
    .replace(/\b[\w']+/g, (word) => word.charAt(0).toUpperCase() + word.slice(1));
}

export function formatPlatformLabel(platform: string | null | undefined): string {
  const s = (platform ?? "").trim().toLowerCase();
  if (s === "ebay") return "eBay";
  if (s === "amazon") return "Amazon";
  return titleCaseDisplay(platform);
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
