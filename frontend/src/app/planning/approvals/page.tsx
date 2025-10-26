"use client";

import PageShell from "@/components/layout/PageShell";
import { Section } from "@/components/ui/Section";
import { useState } from "react";

export default function Page(){
  const [log, setLog] = useState<string[]>([]);
  return (
    <PageShell title="الاعتمادات" subtitle="Manager → CAE → لجنة"
      sidebarItems={[
        { href: "/planning/risk-universe", label: "Risk Universe" },
        { href: "/planning/scoring", label: "Scoring & Heat Map" },
        { href: "/planning/plan-builder", label: "Plan Builder" },
        { href: "/planning/approvals", label: "Approvals" },
        { href: "/planning/calendar", label: "Calendar" },
      ]}
    >
      <Section title="الإجراءات" right={<div className="flex gap-2">
        <button className="px-3 py-2 rounded-xl border">Submit</button>
        <button className="px-3 py-2 rounded-xl border">Approve (CAE)</button>
        <button className="px-3 py-2 rounded-xl border">Approve (Committee)</button>
        <button className="px-3 py-2 rounded-xl border">Publish</button>
      </div>}>
        <div className="rounded-2xl border border-[rgb(var(--border))] p-4 text-sm">
          <div className="font-semibold mb-2">سجل العمليات</div>
          <pre className="whitespace-pre-wrap">{log.join("\n") || "—"}</pre>
        </div>
      </Section>
    </PageShell>
  );
}

