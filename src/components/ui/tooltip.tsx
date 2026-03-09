"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const TooltipContext = React.createContext<{ open: boolean; setOpen: (v: boolean) => void } | null>(null);

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Tooltip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </TooltipContext.Provider>
  );
}

function TooltipTrigger({
  children,
  asChild,
  ...props
}: React.HTMLAttributes<HTMLElement> & { asChild?: boolean }) {
  const ctx = React.useContext(TooltipContext);
  if (!ctx) return null;
  const onMouseEnter = () => ctx.setOpen(true);
  const onMouseLeave = () => ctx.setOpen(false);
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onMouseEnter?: React.MouseEventHandler; onMouseLeave?: React.MouseEventHandler }>, {
      onMouseEnter: (e: React.MouseEvent) => {
        onMouseEnter();
        (children as React.ReactElement<{ onMouseEnter?: React.MouseEventHandler }>).props.onMouseEnter?.(e);
      },
      onMouseLeave: (e: React.MouseEvent) => {
        onMouseLeave();
        (children as React.ReactElement<{ onMouseLeave?: React.MouseEventHandler }>).props.onMouseLeave?.(e);
      },
    });
  }
  return (
    <span onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} {...props}>
      {children}
    </span>
  );
}

function TooltipContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(TooltipContext);
  if (!ctx?.open) return null;
  return (
    <div
      className={cn(
        "absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { TooltipTrigger, TooltipContent };
