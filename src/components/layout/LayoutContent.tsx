"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/ebay": "eBay Products",
  "/amazon": "Amazon Products",
  "/sellers": "Sellers",
  "/upload": "Upload Data",
  "/settings": "Settings",
};

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title = titles[pathname ?? ""] ?? "Dashboard";
  return (
    <>
      <Header title={title} />
      <main className="scrollbar-glass flex-1 overflow-auto p-4 md:p-6">{children}</main>
    </>
  );
}
