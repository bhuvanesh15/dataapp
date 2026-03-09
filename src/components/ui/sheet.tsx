"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const SheetContext = React.createContext<{ open: boolean; setOpen: (v: boolean) => void } | null>(null);

export function Sheet({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <SheetContext.Provider value={{ open, setOpen: onOpenChange }}>
      {children}
    </SheetContext.Provider>
  );
}

function SheetTrigger({
  children,
  asChild,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const ctx = React.useContext(SheetContext);
  if (!ctx) return null;
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: React.MouseEventHandler }>, {
      onClick: (e: React.MouseEvent) => {
        ctx.setOpen(true);
        (children as React.ReactElement<{ onClick?: React.MouseEventHandler }>).props.onClick?.(e);
      },
    });
  }
  return (
    <button type="button" onClick={() => ctx.setOpen(true)} {...props}>
      {children}
    </button>
  );
}

function SheetContent({
  side = "left",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { side?: "left" | "right" }) {
  const ctx = React.useContext(SheetContext);
  if (!ctx?.open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/80"
        aria-hidden
        onClick={() => ctx.setOpen(false)}
      />
      <div
        className={cn(
          "fixed z-50 flex h-full w-full max-w-sm flex-col gap-2 border bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          side === "right" ? "inset-y-0 right-0 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right" : "inset-y-0 left-0 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
          className
        )}
        data-state={ctx.open ? "open" : "closed"}
        {...props}
      >
        {children}
      </div>
    </>
  );
}

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />;
}

function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold text-foreground", className)} {...props} />;
}

function SheetClose({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ctx = React.useContext(SheetContext);
  return (
    <button type="button" onClick={() => ctx?.setOpen(false)} className={className} {...props}>
      {children ?? "Close"}
    </button>
  );
}

export { SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose };
