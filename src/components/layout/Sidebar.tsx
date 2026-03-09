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
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
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
      className="mt-auto"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();
  React.useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-card md:flex">
        <div className="flex h-16 items-center gap-2 border-b px-4">
          <span className="font-semibold">Product Intelligent Dashboard</span>
        </div>
        <div className="flex flex-1 flex-col gap-2 overflow-auto p-2">
          <NavLinks />
          <ThemeToggle />
        </div>
      </aside>

      {/* Mobile: header bar with hamburger */}
      <div className="flex w-full items-center border-b bg-card px-4 py-3 md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-16 items-center gap-2 border-b px-4">
              <span className="font-semibold">Product Intelligent Dashboard</span>
            </div>
            <div className="flex flex-col gap-2 p-2">
              <NavLinks />
              <ThemeToggle />
            </div>
          </SheetContent>
        </Sheet>
        <span className="ml-2 font-semibold">Product Intelligent Dashboard</span>
      </div>
    </>
  );
}
