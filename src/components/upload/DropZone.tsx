"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  className?: string;
  disabled?: boolean;
}

export function DropZone({
  onFileSelect,
  accept = ".csv",
  className,
  disabled,
}: DropZoneProps) {
  const [dragOver, setDragOver] = React.useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file && file.name.toLowerCase().endsWith(".csv")) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
    e.target.value = "";
  };

  return (
    <label
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
        dragOver && "border-primary bg-primary/5",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <Upload className="mb-2 h-10 w-10 text-muted-foreground" />
      <span className="text-sm font-medium">
        Drag and drop a CSV file here, or click to browse
      </span>
      <span className="mt-1 text-xs text-muted-foreground">Accepts .csv only</span>
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />
    </label>
  );
}
