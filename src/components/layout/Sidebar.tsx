"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, Menu, Sun, Moon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "next-themes";
import { useGlobalSearch } from "@/components/layout/Header";
import { Input } from "@/components/ui/input";
import { SITE } from "@/lib/site-config";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

function NavLinks({ className, collapsed }: { className?: string; collapsed: boolean }) {
  const pathname = usePathname() ?? "/";

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {navItems.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        const link = (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center rounded-lg text-sm font-medium transition-all duration-200",
              collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2",
              isActive
                ? "nav-active-glow bg-white/10 text-[#38bdf8]"
                : "text-[#8da2b2] hover:bg-white/5 hover:text-white"
            )}
          >
            <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-[#38bdf8]" : "text-current")} />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );

        if (collapsed) {
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>{link}</TooltipTrigger>
              <TooltipContent className="!bottom-auto !left-full !top-1/2 z-50 ml-2 !mb-0 !translate-x-0 -translate-y-1/2 border-[#2d3a4d] bg-[#121a26] text-white">
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        }
        return link;
      })}
    </nav>
  );
}

function ThemeToggle({ collapsed }: { collapsed: boolean }) {
  const { theme, setTheme } = useTheme();
  const btn = (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(
        "text-[#8da2b2] hover:bg-white/5 hover:text-white",
        collapsed ? "mx-auto w-10" : ""
      )}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{btn}</TooltipTrigger>
        <TooltipContent className="!bottom-auto !left-full !top-1/2 z-50 ml-2 !mb-0 !translate-x-0 -translate-y-1/2 border-[#2d3a4d] bg-[#121a26] text-white">
          Toggle theme
        </TooltipContent>
      </Tooltip>
    );
  }
  return btn;
}

function SidebarSearch({ collapsed }: { collapsed: boolean }) {
  const { globalFilter, setGlobalFilter } = useGlobalSearch();
  if (collapsed) return null;
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
  /** Desktop rail starts collapsed on load; use chevron to expand full nav. */
  const [collapsed, setCollapsed] = React.useState(true);
  const pathname = usePathname();

  React.useEffect(() => setMobileOpen(false), [pathname]);

  const toggleCollapsed = React.useCallback(() => {
    setCollapsed((c) => !c);
  }, []);

  return (
    <TooltipProvider>
      <>
        <aside
          className={cn(
            "glass-sidebar relative hidden shrink-0 flex-col border-r border-[#2d3a4d]/60 transition-[width] duration-200 ease-out md:flex",
            collapsed ? "w-[4.5rem]" : "w-64"
          )}
        >
          <div
            className={cn(
              "flex h-16 shrink-0 items-center border-b border-[#2d3a4d]/80",
              collapsed ? "flex-col justify-center gap-1 px-1 py-2" : "gap-2 px-3"
            )}
          >
            {!collapsed && (
              <div className="min-w-0 flex-1 leading-tight">
                <span className="text-gradient block truncate text-sm font-bold tracking-tight">{SITE.brand}</span>
                <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-widest text-[#8da2b2]">
                  Market Intelligence
                </span>
              </div>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={toggleCollapsed}
                  className={cn(
                    "shrink-0 text-[#8da2b2] hover:bg-white/10 hover:text-white",
                    collapsed ? "h-8 w-8" : "h-9 w-9"
                  )}
                  aria-expanded={!collapsed}
                  aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent
                className={cn(
                  "!bottom-auto z-50 !mb-0 border-[#2d3a4d] bg-[#121a26] text-white",
                  collapsed
                    ? "!left-full !top-1/2 ml-2 !translate-x-0 -translate-y-1/2"
                    : "!left-1/2 !top-full !mt-2 !-translate-x-1/2 !translate-y-0"
                )}
              >
                {collapsed ? "Expand sidebar" : "Collapse sidebar"}
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="scrollbar-glass flex flex-1 flex-col gap-2 overflow-auto p-2">
            <NavLinks collapsed={collapsed} />
            <div className={cn("mt-auto flex flex-col gap-1", collapsed && "items-center")}>
              <ThemeToggle collapsed={collapsed} />
              <SidebarSearch collapsed={collapsed} />
            </div>
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
                <NavLinks collapsed={false} />
                <ThemeToggle collapsed={false} />
                <SidebarSearch collapsed={false} />
              </div>
            </SheetContent>
          </Sheet>
          <span className="ml-2 text-sm font-bold text-gradient tracking-tight">{SITE.brand}</span>
        </div>
      </>
    </TooltipProvider>
  );
}
