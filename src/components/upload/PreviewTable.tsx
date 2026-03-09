"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PreviewTableProps {
  rows: Record<string, unknown>[];
  maxRows?: number;
}

export function PreviewTable({ rows, maxRows = 5 }: PreviewTableProps) {
  const display = rows.slice(0, maxRows);
  const headers = display.length
    ? (Object.keys(display[0]) as string[])
    : [];

  if (headers.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((h) => (
              <TableHead key={h} className="whitespace-nowrap text-xs">
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {display.map((row, i) => (
            <TableRow key={i}>
              {headers.map((key) => (
                <TableCell key={key} className="max-w-[200px] truncate text-xs">
                  {String(row[key] ?? "")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
