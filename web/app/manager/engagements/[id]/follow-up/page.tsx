"use client";

import { FormEvent, useState } from "react";

import Container from "@/app/components/layout/Container";
import SectionTitle from "@/app/components/layout/SectionTitle";
import { Button } from "@/app/components/ui/Button";
import { Input, Textarea } from "@/app/components/ui/Input";
import { apiFetch } from "@/app/lib/apiFetch";

export default function EngagementFollowUpPage({ params }: { params: { id: string } }) {
  const engagementId = params.id;
  const [findingId, setFindingId] = useState("");
  const [notes, setNotes] = useState("");
  const [nextReviewAt, setNextReviewAt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);
    try {
      await apiFetch<{ id: string }>("/followups", {
        method: "POST",
        body: JSON.stringify({
          finding_id: findingId.trim(),
          notes: notes.trim() || undefined,
          next_review_at: nextReviewAt || undefined,
        }),
      });
      setSuccess("تم إنشاء متابعة جديدة بنجاح.");
      setFindingId("");
      setNotes("");
      setNextReviewAt("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر إنشاء المتابعة.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Container className="py-8">
      <SectionTitle title="متابعة التوصيات / Follow-Up" sub={`Engagement: ${engagementId}`} />
      <form onSubmit={handleSubmit} className="grid max-w-xl gap-3">
        <Input
          required
          placeholder="Finding ID"
          value={findingId}
          onChange={(event) => setFindingId(event.target.value)}
        />
        <Textarea
          placeholder="Notes"
          value={notes}
          rows={4}
          onChange={(event) => setNotes(event.target.value)}
        />
        <label className="text-sm">
          الموعد القادم للمراجعة / Next Review
          <Input
            type="date"
            value={nextReviewAt}
            onChange={(event) => setNextReviewAt(event.target.value)}
            className="mt-1"
          />
        </label>
        {error && <p className="text-sm text-danger">{error}</p>}
        {success && <p className="text-sm text-success">{success}</p>}
        <div className="flex gap-3">
          <Button type="submit" disabled={isSaving || !findingId.trim()}>
            {isSaving ? "جارٍ الحفظ..." : "إنشاء متابعة"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFindingId("");
              setNotes("");
              setNextReviewAt("");
            }}
            disabled={isSaving}
          >
            إعادة تعيين
          </Button>
        </div>
      </form>
    </Container>
  );
}
