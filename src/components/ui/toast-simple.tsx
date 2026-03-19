"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function ToastSimple({
  message,
  open,
  onClose,
  className,
}: {
  message: string;
  open: boolean;
  onClose: () => void;
  className?: string;
}) {
  React.useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/10 bg-black/90 px-4 py-2 text-sm text-white shadow-xl backdrop-blur-xl",
        className
      )}
      role="alert"
    >
      {message}
    </div>
  );
}
