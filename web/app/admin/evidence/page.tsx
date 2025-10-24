"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "../../lib/apiFetch";

type Evidence = {
  id: string;
  filename: string;
  mime_type?: string | null;
  size_bytes?: number | null;
  status: string;
  created_at: string;
};

type EvidenceInitResponse = {
  evidence_id: string;
  bucket: string;
  object_key: string;
  upload_url: string;
};

export default function EvidencePage() {
  const [engagementId, setEngagementId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data, refetch, isFetching } = useQuery<Evidence[]>({
    queryKey: ["evidence", engagementId],
    queryFn: () => apiFetch<Evidence[]>(`/evidence?engagement_id=${engagementId}`),
    enabled: !!engagementId,
  });

  const doUpload = async () => {
    if (!engagementId || !file) return;
    setIsUploading(true);
    try {
      const init = await apiFetch<EvidenceInitResponse>("/evidence/init", {
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
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const doDownload = async (evidenceId: string) => {
    try {
      const { url } = await apiFetch<{ url: string }>(`/evidence/${evidenceId}/download`);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Please try again.");
    }
  };

  const doDelete = async (evidenceId: string) => {
    const confirmed = window.confirm("تأكيد الحذف؟");
    if (!confirmed) return;
    try {
      await apiFetch(`/evidence/${evidenceId}`, { method: "DELETE" });
      await refetch();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Delete failed. Please try again.");
    }
  };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">الأدلة / Evidence</h1>
      <div className="flex flex-wrap items-end gap-2">
        <input
          className="flex-1 rounded-xl border p-2"
          placeholder="Engagement ID"
          value={engagementId}
          onChange={(e) => setEngagementId(e.target.value)}
        />
        <input
          className="rounded-xl border p-2"
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <button
          onClick={doUpload}
          className="rounded-xl bg-black px-3 py-2 text-white disabled:opacity-60"
          disabled={!engagementId || !file || isUploading}
        >
          {isUploading ? "جارِ الرفع…" : "رفع / Upload"}
        </button>
      </div>

      {isFetching && <p>جارِ التحميل…</p>}
      {data && data.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border bg-white dark:bg-neutral-900">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-3 py-2 text-left">Filename</th>
                <th className="px-3 py-2 text-left">MIME</th>
                <th className="px-3 py-2 text-left">Size</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Created</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((ev) => (
                <tr key={ev.id} className="border-t">
                  <td className="px-3 py-2">{ev.filename}</td>
                  <td className="px-3 py-2">{ev.mime_type ?? "—"}</td>
                  <td className="px-3 py-2">
                    {ev.size_bytes ? `${(ev.size_bytes / 1024).toFixed(2)} KB` : "—"}
                  </td>
                  <td className="px-3 py-2">{ev.status}</td>
                  <td className="px-3 py-2">{ev.created_at}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        className="rounded-lg border px-2 py-1"
                        onClick={() => doDownload(ev.id)}
                      >
                        Download
                      </button>
                      <button
                        className="rounded-lg border px-2 py-1"
                        onClick={() => doDelete(ev.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && data.length === 0 && (
        <p className="text-sm opacity-70">لا توجد أدلة لهذا الـ Engagement.</p>
      )}
    </section>
  );
}
