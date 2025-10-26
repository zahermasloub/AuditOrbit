"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Container from "../../../components/layout/Container";
import SectionTitle from "../../../components/layout/SectionTitle";
import { apiFetch } from "../../../lib/apiFetch";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";

type Engagement = {
  id: string;
  title: string;
};

export default function Page() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [engagementId, setEngagementId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState('{"sections":[{"title":"Executive Summary","text":""}]}');

  const { data: engagements } = useQuery({
    queryKey: ["engagements-list"],
    queryFn: () => apiFetch<{ items: Engagement[] }>("/engagements?page=1&size=100"),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const parsed = JSON.parse(content);
      return apiFetch("/reports", {
        method: "POST",
        body: JSON.stringify({
          engagement_id: engagementId,
          title,
          content: parsed,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports-drafts"] });
      router.push("/manager/reports/drafts");
    },
  });

  return (
    <Container className="py-8 sm:py-10 space-y-4">
      <SectionTitle title="إنشاء تقرير جديد / New Report" sub="من قالب أو فارغ." />
      
      <Card className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">المهمة / Engagement</label>
          <select
            className="w-full rounded-xl border p-2"
            value={engagementId}
            onChange={(e) => setEngagementId(e.target.value)}
          >
            <option value="">-- اختر المهمة --</option>
            {engagements?.items.map((eng) => (
              <option key={eng.id} value={eng.id}>
                {eng.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">العنوان / Title</label>
          <input
            type="text"
            className="w-full rounded-xl border p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Report Title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">المحتوى / Content (JSON)</label>
          <textarea
            className="w-full rounded-xl border p-2 font-mono text-xs"
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={() => createMutation.mutate()}
            disabled={!engagementId || !title || createMutation.isPending}
          >
            {createMutation.isPending ? "جارِ الحفظ..." : "إنشاء / Create"}
          </Button>
          <Button onClick={() => router.back()}>إلغاء / Cancel</Button>
        </div>
      </Card>
    </Container>
  );
}
