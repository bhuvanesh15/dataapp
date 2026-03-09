"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const DialogContext = React.createContext<{ open: boolean; setOpen: (v: boolean) => void } | null>(null);

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <DialogContext.Provider value={{ open, setOpen: onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

function DialogTrigger({
  children,
  asChild,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const ctx = React.useContext(DialogContext);
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

function DialogContent({
  className,
  children,
  onPointerDownOutside,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { onPointerDownOutside?: () => void }) {
  const ctx = React.useContext(DialogContext);
  if (!ctx?.open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/80"
        aria-hidden
        onClick={() => {
          onPointerDownOutside?.();
          ctx.setOpen(false);
        }}
      />
      <div
        role="dialog"
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200",
          className
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
      </div>
    </>
  );
}

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />;
}

function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />;
}

function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
  );
}

function DialogClose({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ctx = React.useContext(DialogContext);
  return (
    <button type="button" onClick={() => ctx?.setOpen(false)} className={className} {...props}>
      {children ?? "Close"}
    </button>
  );
}

export { DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose };
