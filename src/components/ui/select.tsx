"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type SelectContextValue = {
  value: string;
  onValueChange: (v: string) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  labels: Record<string, string>;
  registerLabel: (value: string, label: string) => void;
};

const SelectContext = React.createContext<SelectContextValue | null>(null);

export function Select({
  value,
  onValueChange,
  children,
}: {
  value?: string;
  onValueChange: (v: string) => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState("");
  const [labels, setLabels] = React.useState<Record<string, string>>({});
  const val = value ?? internalValue;

  const handleChange = React.useCallback(
    (v: string) => {
      if (value === undefined) setInternalValue(v);
      onValueChange(v);
      setOpen(false);
    },
    [onValueChange, value]
  );

  const registerLabel = React.useCallback((optionValue: string, label: string) => {
    setLabels((prev) => (prev[optionValue] === label ? prev : { ...prev, [optionValue]: label }));
  }, []);

  const contextValue = React.useMemo<SelectContextValue>(
    () => ({
      value: val,
      onValueChange: handleChange,
      open,
      setOpen,
      labels,
      registerLabel,
    }),
    [val, handleChange, open, labels, registerLabel]
  );

  return (
    <SelectContext.Provider value={contextValue}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
}

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { children?: React.ReactNode }
>(({ className, children, ...props }, ref) => {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return null;
  return (
    <button
      ref={ref}
      type="button"
      role="combobox"
      aria-expanded={ctx.open}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 transition-all duration-200",
        className
      )}
      onClick={() => ctx.setOpen(!ctx.open)}
      {...props}
    >
      {children}
      <span aria-hidden className="ml-2 shrink-0 text-xs text-[#8da2b2]">
        ▼
      </span>
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return null;
  return <span>{ctx.labels[ctx.value] || placeholder}</span>;
};

const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const ctx = React.useContext(SelectContext);
    const divRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
      if (!ctx?.open) return;
      const handleClick = (e: MouseEvent) => {
        if (divRef.current && !divRef.current.contains(e.target as Node)) {
          ctx.setOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, [ctx?.open, ctx?.setOpen]);

    if (!ctx?.open) return null;

    return (
      <div
        ref={(r) => {
          divRef.current = r;
          if (typeof ref === "function") ref(r);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = r;
        }}
        className={cn(
          "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-white/10 bg-black/90 p-1 text-white shadow-xl backdrop-blur-xl",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SelectContent.displayName = "SelectContent";

const SelectItem = ({
  value,
  textValue,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string; textValue?: string }) => {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return null;

  const label = React.useMemo(() => {
    if (textValue?.trim()) return textValue.trim();
    if (typeof children === "string") return children;
    if (Array.isArray(children)) {
      return children
        .filter((c) => typeof c === "string")
        .join("")
        .trim();
    }
    return value;
  }, [children, textValue, value]);

  const { registerLabel } = ctx;
  React.useEffect(() => {
    if (label) registerLabel(value, label);
  }, [registerLabel, label, value]);

  return (
    <div
      role="option"
      aria-selected={ctx.value === value}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-lg py-1.5 pl-8 pr-2 text-sm text-slate-200 outline-none hover:bg-white/10 hover:text-white focus:bg-white/10 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      onClick={() => ctx.onValueChange(value)}
      {...props}
    >
      {ctx.value === value && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center text-cyan-400">✓</span>
      )}
      {children}
    </div>
  );
};

export { SelectTrigger, SelectValue, SelectContent, SelectItem };
