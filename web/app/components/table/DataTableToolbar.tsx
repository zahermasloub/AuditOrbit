"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Filter, Plus, Download } from "lucide-react";

import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

type DataTableToolbarProps = {
  onSearchAction?: (query: string) => void;
  onCreateAction?: () => void;
  right?: ReactNode;
  placeholder?: string;
};

export function DataTableToolbar({ onSearchAction, onCreateAction, right, placeholder = "ابحث..." }: DataTableToolbarProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!onSearchAction) return;
    const handle = setTimeout(() => {
      onSearchAction(query.trim());
    }, 300);
    return () => clearTimeout(handle);
  }, [onSearchAction, query]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-[240px]">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            aria-label="بحث"
          />
        </div>
        <Button variant="outline" type="button">
          <Filter className="h-4 w-4" />
          فلاتر
        </Button>
        <Button variant="outline" type="button">
          <Download className="h-4 w-4" />
          تصدير
        </Button>
      </div>
      <div className="flex items-center gap-2">
        {right}
        {onCreateAction ? (
          <Button type="button" onClick={onCreateAction}>
            <Plus className="h-4 w-4" />
            جديد
          </Button>
        ) : null}
      </div>
    </div>
  );
}
