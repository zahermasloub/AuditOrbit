'use client';

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "../../lib/apiFetch";

type Scenario = {
  id: string;
  name: string;
  description?: string | null;
};

type ExtractionPayload = {
  json_payload?: Record<string, unknown>;
  extracted_at?: string;
};

type ExtractionResponse = {
  items: ExtractionPayload[];
};

type Finding = {
  id: string;
  check_id: string;
  title: string;
  severity: string;
  status: string;
  details: unknown;
  created_at: string;
};

type FindingsResponse = {
  items: Finding[];
};

const DEFAULT_RULES =
  '{"checks":[{"id":"PO_APPROVALS","any":["approve","موافقة","اعتماد"],"all":["PO","أمر شراء"],"severity":"high"}]}';

export default function AILabPage() {
  const queryClient = useQueryClient();
  const [evidenceId, setEvidenceId] = useState("");
  const [scenarioId, setScenarioId] = useState("");
  const [rulesDraft, setRulesDraft] = useState(DEFAULT_RULES);

  const scenariosQuery = useQuery<Scenario[]>({
    queryKey: ["scenarios"],
    queryFn: async () => apiFetch("/ai/scenarios"),
    staleTime: 0,
  });

  const extractionQuery = useQuery<ExtractionResponse>({
    queryKey: ["extractions", evidenceId],
    queryFn: async () => apiFetch(`/ai/extractions?evidence_id=${evidenceId}`),
    enabled: Boolean(evidenceId),
    staleTime: 0,
  });

  const findingsQuery = useQuery<FindingsResponse>({
    queryKey: ["findings", evidenceId],
    queryFn: async () => apiFetch(`/ai/findings?evidence_id=${evidenceId}`),
    enabled: Boolean(evidenceId),
    staleTime: 0,
  });

  const latestExtraction = extractionQuery.data?.items?.[0];
  const scenarioOptions = scenariosQuery.data ?? [];
  const findings = findingsQuery.data?.items ?? [];

  const handleRunExtraction = async () => {
    if (!evidenceId) {
      return;
    }
    await apiFetch(`/ai/extract/${evidenceId}`, { method: "POST" });
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ["extractions", evidenceId] });
    }, 2500);
  };

  const handleCreateScenario = async () => {
    try {
      const rules = JSON.parse(rulesDraft);
      const created = await apiFetch<{ id: string }>("/ai/scenarios", {
        method: "POST",
        body: JSON.stringify({ name: `Scenario ${Date.now()}`, rules }),
      });
      await scenariosQuery.refetch();
      setScenarioId(created.id);
    } catch (error) {
      console.error("Invalid rules JSON", error);
      alert("صيغة JSON غير صحيحة");
    }
  };

  const handleRunCompare = async () => {
    if (!evidenceId || !scenarioId) {
      return;
    }
    await apiFetch(`/ai/compare?evidence_id=${evidenceId}&scenario_id=${scenarioId}`, { method: "POST" });
    setTimeout(() => {
      findingsQuery.refetch();
    }, 2000);
  };

  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-bold">مختبر الذكاء الاصطناعي / AI Lab</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-2xl border bg-white p-4 dark:bg-neutral-900">
          <h2 className="font-semibold">تشغيل استخراج OCR</h2>
          <input
            className="w-full rounded-xl border p-2"
            placeholder="Evidence ID"
            value={evidenceId}
            onChange={(event) => setEvidenceId(event.target.value)}
          />
          <button className="rounded-xl border px-3 py-2" onClick={handleRunExtraction} disabled={!evidenceId}>
            Run Extraction
          </button>
          <div className="text-sm opacity-70">
            آخر استخراج: {latestExtraction?.extracted_at ?? "—"}
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border bg-white p-4 dark:bg-neutral-900">
          <h2 className="font-semibold">سيناريو المقارنة</h2>
          <textarea
            className="h-32 w-full rounded-xl border p-2"
            value={rulesDraft}
            onChange={(event) => setRulesDraft(event.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <button className="rounded-xl border px-3 py-2" onClick={handleCreateScenario}>
              Create Scenario
            </button>
            <select
              className="flex-1 rounded-xl border p-2"
              value={scenarioId}
              onChange={(event) => setScenarioId(event.target.value)}
            >
              <option value="">اختر سيناريو</option>
              {scenarioOptions.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </option>
              ))}
            </select>
            <button
              className="rounded-xl border px-3 py-2"
              onClick={handleRunCompare}
              disabled={!scenarioId || !evidenceId}
            >
              Run Compare
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-white p-4 dark:bg-neutral-900">
          <h3 className="mb-2 font-semibold">المُستخلص / Extracted Preview</h3>
          <pre className="max-h-96 overflow-auto text-xs">
            {JSON.stringify(latestExtraction?.json_payload, null, 2)}
          </pre>
        </div>
        <div className="rounded-2xl border bg-white p-4 dark:bg-neutral-900">
          <h3 className="mb-2 font-semibold">Findings</h3>
          {findings.length === 0 && <p className="opacity-60">لا توجد نتائج.</p>}
          <ul className="space-y-2">
            {findings.map((finding) => (
              <li key={finding.id} className="rounded-xl border p-3">
                <div className="text-sm font-semibold">
                  {finding.title} <span className="opacity-70">[{finding.severity}]</span>
                </div>
                <div className="text-xs opacity-70">{finding.created_at}</div>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm">تفاصيل</summary>
                  <pre className="max-h-64 overflow-auto text-xs">
                    {JSON.stringify(finding.details, null, 2)}
                  </pre>
                </details>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
