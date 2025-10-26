"use client";

import * as React from "react";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";

type DataTableProps<T> = { columns: ColumnDef<T, any>[]; data: T[]; loading?: boolean; emptyMessage?: string };

export function DataTable<T>({ columns, data, loading=false, emptyMessage="لا توجد بيانات" }: DataTableProps<T>) {
  const table = useReactTable({ columns, data, getCoreRowModel: getCoreRowModel() });
  
  return (
    <div className="rounded-2xl bg-surface shadow-soft p-3 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-muted border-b border-border">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <th key={h.id} className="text-left py-2 font-medium">
                  {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length} className="text-center py-4 text-muted">جاري التحميل...</td></tr>
          ) : data.length === 0 ? (
            <tr><td colSpan={columns.length} className="text-center py-4 text-muted">{emptyMessage}</td></tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="py-2">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

