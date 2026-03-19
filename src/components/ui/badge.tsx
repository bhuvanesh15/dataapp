import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400/30",
  {
    variants: {
      variant: {
        default:
          "border-cyan-400/30 bg-cyan-400/20 text-cyan-300",
        secondary:
          "border-white/10 bg-white/10 text-slate-300",
        destructive:
          "border-rose-400/30 bg-rose-500/20 text-rose-300",
        outline: "border-white/20 text-slate-300",
        ebay: "border-[#E53238]/40 bg-[#E53238]/25 text-red-200",
        amazon: "border-[#FF9900]/40 bg-[#FF9900]/25 text-amber-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
