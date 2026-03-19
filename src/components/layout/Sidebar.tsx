"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Upload,
  Settings,
  Menu,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "next-themes";
import { useSettings } from "@/context/SettingsContext";
import { useGlobalSearch } from "@/components/layout/Header";
import { Input } from "@/components/ui/input";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ebay", label: "eBay Products", icon: ShoppingBag },
  { href: "/amazon", label: "Amazon Products", icon: Package },
  { href: "/sellers", label: "Sellers", icon: Users },
  { href: "/upload", label: "Upload Data", icon: Upload },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavLinks({ className }: { className?: string }) {
  const pathname = usePathname();
  const { showAmazon, showEbay } = useSettings();

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {navItems.map((item) => {
        if (item.href === "/ebay" && !showEbay) return null;
        if (item.href === "/amazon" && !showAmazon) return null;
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
              isActive
                ? "nav-active-glow bg-white/10 text-cyan-400"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            )}
          >
            <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-cyan-400" : "text-current")} />
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
      className="mt-auto text-slate-400 hover:bg-white/5 hover:text-white"
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
    <div className="mt-auto border-t border-white/10 p-3">
      <Input
        placeholder="Search..."
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="glass-input h-9 w-full rounded-xl border-white/10 bg-white/5 text-sm placeholder:text-slate-500"
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
      {/* Desktop sidebar */}
      <aside className="glass-sidebar hidden w-64 flex-col md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-4">
          <span className="text-gradient font-bold tracking-tight drop-shadow-[0_0_12px_rgba(34,211,238,0.25)]">
            Product Intelligent Dashboard
          </span>
        </div>
        <div className="scrollbar-glass flex flex-1 flex-col gap-2 overflow-auto p-3">
          <NavLinks />
          <ThemeToggle />
          <SidebarSearch />
        </div>
      </aside>

      {/* Mobile: header bar with hamburger */}
      <div className="glass-header flex w-full items-center px-4 py-3 md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-slate-300 hover:bg-white/10 hover:text-white">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 border-white/10 bg-black/90 p-0 backdrop-blur-xl">
            <div className="flex h-16 items-center gap-2 border-b border-white/10 px-4">
              <span className="text-gradient font-bold tracking-tight">Product Intelligent Dashboard</span>
            </div>
            <div className="scrollbar-glass flex flex-col gap-2 overflow-auto p-3">
              <NavLinks />
              <ThemeToggle />
              <SidebarSearch />
            </div>
          </SheetContent>
        </Sheet>
        <span className="ml-2 font-bold text-gradient tracking-tight">Product Intelligent Dashboard</span>
      </div>
    </>
  );
}
