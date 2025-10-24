"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "../../lib/apiFetch";

type Evidence = {
  id: string;
  filename: string;
  mime_type?: string | null;
  size_bytes?: number | null;
  status: string;
  created_at: string;
};

type Extraction = {
  id: string;
  extracted_at: string;
  source_type: string;
  confidence?: number | null;
  json_payload: unknown;
};

type NormalizedPayload = {
  sections?: Array<{ text?: string }>;
};

const extractPrimaryText = (payload: unknown): string | null => {
  if (!payload || typeof payload !== "object") {
    return null;
  }
  const normalized = payload as NormalizedPayload;
  const text = normalized.sections?.[0]?.text;
  return typeof text === "string" ? text : null;
};

export default function EvidencePage() {
  const queryClient = useQueryClient();
  const [engagementId, setEngagementId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [mimeFilter, setMimeFilter] = useState<string>("");

  const { data: evidences, refetch, isFetching } = useQuery<Evidence[]>({
    queryKey: ["evidence", engagementId],
    queryFn: () => apiFetch(`/evidence?engagement_id=${engagementId}`),
    enabled: !!engagementId,
  });

  const filtered = useMemo(() => {
    let items = evidences ?? [];
    if (statusFilter) {
      items = items.filter((item) => item.status === statusFilter);
    }
    if (mimeFilter) {
      items = items.filter((item) => (item.mime_type ?? "").includes(mimeFilter));
    }
    return items;
  }, [evidences, statusFilter, mimeFilter]);

  const { data: extractions, refetch: refetchExtractions } = useQuery<{ items: Extraction[] } | undefined>({
    queryKey: ["extractions", selectedId],
    queryFn: () => apiFetch(`/ai/extractions?evidence_id=${selectedId}`),
    enabled: !!selectedId,
    staleTime: 0,
  });

  const latestExtraction = extractions?.items?.[0];

  const doUpload = async () => {
    if (!engagementId || !file) {
      return;
    }

    const init = await apiFetch<{ evidence_id: string; upload_url: string }>("/evidence/init", {
      method: "POST",
      body: JSON.stringify({
        engagement_id: engagementId,
        filename: file.name,
        mime_type: file.type,
        size_bytes: file.size,
      }),
    });

    await fetch(init.upload_url, {
      method: "PUT",
      body: file,
      headers: file.type ? { "Content-Type": file.type } : undefined,
    });

    await apiFetch(`/evidence/${init.evidence_id}/confirm`, {
      method: "POST",
      body: JSON.stringify({
        size_bytes: file.size,
        mime_type: file.type,
      }),
    });

    setFile(null);
    await refetch();
  };

  const runExtraction = async (evidenceId: string) => {
    await apiFetch(`/ai/extract/${evidenceId}`, { method: "POST" });
    setSelectedId(evidenceId);
    setTimeout(() => {
      refetchExtractions();
      queryClient.invalidateQueries({ queryKey: ["evidence", engagementId] });
    }, 2500);
  };

  const download = async (evidenceId: string) => {
    const { url } = await apiFetch<{ url: string }>(`/evidence/${evidenceId}/download`);
    window.open(url, "_blank");
  };

  const remove = async (evidenceId: string) => {
    if (!window.confirm("تأكيد الحذف؟")) {
      return;
    }
    await apiFetch(`/evidence/${evidenceId}`, { method: "DELETE" });
    if (selectedId === evidenceId) {
      setSelectedId(null);
    }
    await refetch();
  };

  useEffect(() => {
    if (!filtered.find((item) => item.id === selectedId)) {
      setSelectedId(null);
    }
  }, [filtered, selectedId]);

  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-bold">الأدلة / Evidence</h1>

      <div className="flex flex-wrap items-end gap-2">
        <input
          className="flex-1 min-w-[260px] rounded-xl border p-2"
          placeholder="Engagement ID"
          value={engagementId}
          onChange={(event) => setEngagementId(event.target.value)}
        />
        <input
          className="min-w-[260px] rounded-xl border p-2"
          type="file"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
        <button
          onClick={doUpload}
          className="rounded-xl bg-black px-3 py-2 text-white disabled:opacity-60"
          disabled={!engagementId || !file}
        >
          رفع / Upload
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          className="rounded-xl border p-2"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="">كل الحالات</option>
          <option value="uploaded">uploaded</option>
          <option value="processing">processing</option>
          <option value="ready">ready</option>
          <option value="failed">failed</option>
        </select>
        <input
          className="rounded-xl border p-2"
          placeholder="فلتر MIME"
          value={mimeFilter}
          onChange={(event) => setMimeFilter(event.target.value)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-x-auto rounded-2xl border bg-white dark:bg-neutral-900">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left">Filename</th>
                <th className="px-3 py-2">MIME</th>
                <th className="px-3 py-2">Size</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className={`border-t ${selectedId === item.id ? "bg-neutral-50 dark:bg-neutral-800" : ""}`}
                >
                  <td className="px-3 py-2">
                    <button className="underline" onClick={() => setSelectedId(item.id)}>
                      {item.filename}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-center">{item.mime_type ?? "-"}</td>
                  <td className="px-3 py-2 text-center">{item.size_bytes ?? "-"}</td>
                  <td className="px-3 py-2 text-center">{item.status}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      <button className="rounded-lg border px-2 py-1" onClick={() => download(item.id)}>
                        Download
                      </button>
                      <button className="rounded-lg border px-2 py-1" onClick={() => runExtraction(item.id)}>
                        Run Extraction
                      </button>
                      <button className="rounded-lg border px-2 py-1" onClick={() => remove(item.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-center opacity-60" colSpan={5}>
                    لا توجد ملفات مطابقة للفلاتر
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="min-h-[240px] rounded-2xl border bg-white p-4 dark:bg-neutral-900">
          <h2 className="mb-2 font-semibold">المعاينة / Preview</h2>
          {!selectedId && <p className="opacity-70">اختر ملفًا من الجدول لمشاهدة المُستخلَص.</p>}
          {selectedId && !latestExtraction && (
            <p className="opacity-70">لا توجد نتائج بعد. استعمل &quot;Run Extraction&quot;.</p>
          )}
          {latestExtraction && (
            <div className="space-y-2 text-sm">
              <div className="opacity-80">
                <div>
                  Source: {latestExtraction.source_type} · Extracted: {latestExtraction.extracted_at}
                </div>
                {typeof latestExtraction.confidence === "number" && (
                  <div>Confidence: {latestExtraction.confidence.toFixed(2)}</div>
                )}
              </div>
              <div className="max-h-80 overflow-auto rounded-xl border p-3">
                <pre className="whitespace-pre-wrap text-xs">
                  {(() => {
                    try {
                      const text = extractPrimaryText(latestExtraction.json_payload) ?? "";
                      return text.length > 2000 ? `${text.slice(0, 2000)}…(truncated)` : text;
                    } catch {
                      return JSON.stringify(latestExtraction.json_payload, null, 2);
                    }
                  })()}
                </pre>
              </div>
              <details>
                <summary className="cursor-pointer text-sm">عرض JSON الكامل</summary>
                <pre className="max-h-80 overflow-auto text-xs">
                  {JSON.stringify(latestExtraction.json_payload, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>

      {isFetching && <p>جارِ التحميل…</p>}
      {filtered.length === 0 && evidences && evidences.length > 0 && (
        <p className="text-sm opacity-70">لا توجد ملفات مطابقة للفلاتر.</p>
      )}
      {!evidences && engagementId && !isFetching && (
        <p className="text-sm opacity-70">لا توجد أدلة لهذا الـ Engagement.</p>
      )}
    </section>
  );
}
