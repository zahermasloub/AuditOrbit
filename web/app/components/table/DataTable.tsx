"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

export type DataTableColumn<T extends Record<string, unknown>> = {
  header: React.ReactNode;
  accessorKey: keyof T | string;
  cell?: (ctx: { row: T }) => React.ReactNode;
  sortable?: boolean;
};

type SortState = { key: string; dir: "asc" | "desc" } | null;

type DataTableProps<T extends Record<string, unknown>> = {
  columns: DataTableColumn<T>[];
  data: T[];
  pageSize?: number;
};

function readValue<T extends Record<string, unknown>>(row: T, accessor: keyof T | string) {
  if (typeof accessor === "string" && accessor in row) {
    return row[accessor as keyof T];
  }
  return row[accessor as keyof T] ?? (row as Record<string, unknown>)[accessor as string];
}

function compareValues(a: unknown, b: unknown) {
  const normalize = (value: unknown) => {
    if (value === null || value === undefined) return "";
    if (value instanceof Date) return value.getTime();
    if (typeof value === "number") return value;
    return value.toString();
  };

  const aValue = normalize(a);
  const bValue = normalize(b);

  if (typeof aValue === "number" && typeof bValue === "number") {
    return aValue - bValue;
  }

  return aValue.toString().localeCompare(bValue.toString(), "ar");
}

export function DataTable<T extends Record<string, unknown>>({ columns, data, pageSize = 10 }: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<SortState>(null);

  const sortedData = useMemo(() => {
    if (!sort) return data;
    const column = columns.find((col) => {
      const key = typeof col.accessorKey === "string" ? col.accessorKey : String(col.accessorKey);
      return key === sort.key;
    });
    if (!column) return data;

    const accessor = column.accessorKey;
    const snapshot = [...data];
    snapshot.sort((a, b) => compareValues(readValue(a, accessor), readValue(b, accessor)));
    return sort.dir === "asc" ? snapshot : snapshot.reverse();
  }, [columns, data, sort]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
    if (page > totalPages - 1) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, pageSize, sortedData.length]);

  const pageRows = useMemo(
    () => sortedData.slice(page * pageSize, page * pageSize + pageSize),
    [page, pageSize, sortedData],
  );

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));

  return (
    <div className="rounded-2xl border">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-[color:var(--ao-muted)]/30 text-left">
            <tr>
              {columns.map((column, index) => {
                const key = typeof column.accessorKey === "string" ? column.accessorKey : String(column.accessorKey);
                const isActive = sort?.key === key;
                const indicator = isActive ? (sort?.dir === "asc" ? " ▲" : " ▼") : "";

                return (
                  <th
                    key={index}
                    className="cursor-pointer select-none px-3 py-2"
                    onClick={() => {
                      if (column.sortable === false) return;
                      setSort((current) => {
                        if (!current || current.key !== key) {
                          return { key, dir: "asc" };
                        }
                        return { key, dir: current.dir === "asc" ? "desc" : "asc" };
                      });
                    }}
                  >
                    {column.header}
                    {indicator}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pageRows.length ? (
              pageRows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-t hover:bg-[color:var(--ao-muted)]/15">
                  {columns.map((column, columnIndex) => {
                    const rawValue = column.cell ? column.cell({ row }) : readValue(row, column.accessorKey);
                    const content: ReactNode = column.cell
                      ? (rawValue as ReactNode)
                      : rawValue === undefined || rawValue === null
                        ? ""
                        : typeof rawValue === "number" || typeof rawValue === "string"
                          ? rawValue
                          : rawValue instanceof Date
                            ? rawValue.toLocaleDateString("ar")
                            : String(rawValue);

                    return (
                      <td key={`${rowIndex}-${columnIndex}`} className="px-3 py-2 align-middle">
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-3 py-6 text-center text-sm opacity-70" colSpan={columns.length}>
                  لا توجد بيانات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-end gap-2 p-2 text-sm">
        <span className="px-2 opacity-70">
          صفحة {page + 1}/{totalPages}
        </span>
        <button
          type="button"
          className="rounded border px-2 py-1 disabled:opacity-50"
          onClick={() => setPage((prev) => Math.max(0, prev - 1))}
          disabled={page === 0}
        >
          السابق
        </button>
        <button
          type="button"
          className="rounded border px-2 py-1 disabled:opacity-50"
          onClick={() => setPage((prev) => (prev + 1 < totalPages ? prev + 1 : prev))}
          disabled={page + 1 >= totalPages}
        >
          التالي
        </button>
      </div>
    </div>
  );
}

export default DataTable;
