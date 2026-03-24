"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Scale,
  Store,
  Activity,
  Layers,
  Settings,
  Menu,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "next-themes";
import { useGlobalSearch } from "@/components/layout/Header";
import { Input } from "@/components/ui/input";
import { SITE } from "@/lib/site-config";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/price-benchmark", label: "Price Benchmark", icon: Scale },
  { href: "/seller-discovery", label: "Seller Discovery", icon: Store },
  { href: "/market-velocity", label: "Market Velocity", icon: Activity },
  { href: "/sku-drilldown", label: "SKU Drilldown", icon: Layers },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

function NavLinks({ className }: { className?: string }) {
  const pathname = usePathname() ?? "/";

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {navItems.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
              isActive
                ? "nav-active-glow bg-white/10 text-[#38bdf8]"
                : "text-[#8da2b2] hover:bg-white/5 hover:text-white"
            )}
          >
            <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-[#38bdf8]" : "text-current")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="mt-auto text-[#8da2b2] hover:bg-white/5 hover:text-white"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

function SidebarSearch() {
  const { globalFilter, setGlobalFilter } = useGlobalSearch();
  return (
    <div className="mt-auto border-t border-[#2d3a4d]/80 p-3">
      <Input
        placeholder="Search…"
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="glass-input h-9 w-full rounded-xl border-[#2d3a4d] bg-[#121a26]/60 text-sm placeholder:text-[#64748b]"
        aria-label="Sidebar search"
      />
    </div>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();
  React.useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <>
      <aside className="glass-sidebar hidden w-64 flex-col md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-[#2d3a4d]/80 px-4">
          <div className="leading-tight">
            <span className="text-gradient block text-sm font-bold tracking-tight">{SITE.brand}</span>
            <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-widest text-[#8da2b2]">
              Market Intelligence
            </span>
          </div>
        </div>
        <div className="scrollbar-glass flex flex-1 flex-col gap-2 overflow-auto p-3">
          <NavLinks />
          <ThemeToggle />
          <SidebarSearch />
        </div>
      </aside>

      <div className="glass-header flex w-full items-center px-4 py-3 md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-[#cbd5e1] hover:bg-white/10 hover:text-white">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 border-[#2d3a4d] bg-[#080c14]/95 p-0 backdrop-blur-xl">
            <div className="flex h-16 items-center gap-2 border-b border-[#2d3a4d]/80 px-4">
              <span className="text-gradient text-sm font-bold leading-tight">{SITE.brand}</span>
            </div>
            <div className="scrollbar-glass flex flex-col gap-2 overflow-auto p-3">
              <NavLinks />
              <ThemeToggle />
              <SidebarSearch />
            </div>
          </SheetContent>
        </Sheet>
        <span className="ml-2 text-sm font-bold text-gradient tracking-tight">{SITE.brand}</span>
      </div>
    </>
  );
}
