"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/app/lib/apiFetch";
import { Empty, Loading } from "@/app/components/ui/States";
import { Table, TBody, THead } from "@/app/components/ui/Table";

interface AuditLogItem {
  id: number;
  actor_id?: string | null;
  action: string;
  resource: string;
  at: string;
  meta?: Record<string, unknown> | null;
}

interface AuditLogResponse {
  items: AuditLogItem[];
  total: number;
  page: number;
  size: number;
}

export default function AuditLogPage() {
  const [actorId, setActorId] = useState("");
  const [action, setAction] = useState("");
  const [resourceLike, setResourceLike] = useState("");

  const searchParams = useMemo(() => {
    const params = new URLSearchParams();
    if (actorId) params.set("actor_id", actorId);
    if (action) params.set("action", action);
    if (resourceLike) params.set("resource_like", resourceLike);
    return params.toString();
  }, [actorId, action, resourceLike]);

  const { data, isLoading } = useQuery<AuditLogResponse>({
    queryKey: ["audit-log", actorId, action, resourceLike],
    queryFn: () => apiFetch<AuditLogResponse>(`/audit-logs?${searchParams}`),
  });

  return (
    <section className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">سجل التدقيق</h1>
        <p className="text-sm text-muted">مراقبة نشاط النظام مع إمكانيات التصفية.</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <input
          className="border border-border rounded-xl px-3 py-2 text-sm"
          placeholder="معرّف المنفذ (Actor ID)"
          value={actorId}
          onChange={(event) => setActorId(event.target.value)}
        />
        <input
          className="border border-border rounded-xl px-3 py-2 text-sm"
          placeholder="الإجراء (Action)"
          value={action}
          onChange={(event) => setAction(event.target.value)}
        />
        <input
          className="border border-border rounded-xl px-3 py-2 text-sm"
          placeholder="المورد يحتوي على"
          value={resourceLike}
          onChange={(event) => setResourceLike(event.target.value)}
        />
      </div>

      {isLoading ? (
        <Loading />
      ) : !data?.items?.length ? (
        <Empty title="لا توجد سجلات" hint="حاول توسيع معايير البحث" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <Table>
            <THead>
              <tr>
                <th className="text-xs uppercase tracking-wide text-muted">ID</th>
                <th className="text-xs uppercase tracking-wide text-muted">Actor</th>
                <th className="text-xs uppercase tracking-wide text-muted">Action</th>
                <th className="text-xs uppercase tracking-wide text-muted">Resource</th>
                <th className="text-xs uppercase tracking-wide text-muted">When</th>
              </tr>
            </THead>
            <TBody>
              {data.items.map((item) => (
                <tr key={item.id} className="border-t border-border">
                  <td className="text-sm font-mono">{item.id}</td>
                  <td className="text-xs font-mono text-muted">{item.actor_id ?? "—"}</td>
                  <td className="text-sm">{item.action}</td>
                  <td className="max-w-[520px] truncate text-sm" title={item.resource}>
                    {item.resource}
                  </td>
                  <td className="text-xs text-muted">
                    {new Date(item.at).toLocaleString("ar-SA")}
                  </td>
                </tr>
              ))}
            </TBody>
          </Table>
        </div>
      )}
    </section>
  );
}
