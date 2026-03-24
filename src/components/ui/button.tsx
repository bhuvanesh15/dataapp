import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-50 cursor-pointer hover:scale-[1.02] active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#38bdf8] via-[#6366f1] to-[#a78bfa] text-[#080c14] shadow-lg shadow-[#38bdf8]/25 hover:shadow-[#38bdf8]/35 hover:brightness-110",
        destructive:
          "bg-rose-500/90 text-white hover:bg-rose-500 shadow-lg shadow-rose-500/20",
        outline:
          "border border-white/10 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 hover:border-white/20",
        secondary:
          "border border-white/10 bg-white/5 backdrop-blur-md text-slate-200 hover:bg-white/10",
        ghost: "text-slate-300 hover:bg-white/5 hover:text-white",
        link: "text-[#38bdf8] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-11 rounded-xl px-8",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
