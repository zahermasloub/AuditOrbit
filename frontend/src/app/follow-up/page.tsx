import PageShell from "@/components/layout/PageShell";
import { Section } from "@/components/ui/Section";
import { EmptyState } from "@/components/ui/EmptyState";

export default function FollowUp(){
	return (
		<PageShell title="متابعة التوصيات" subtitle="تتبع تنفيذ نتائج التدقيق السابقة">
			<div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
				<div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-6 shadow-soft">
					<div className="text-sm text-[rgb(var(--muted))] mb-1">إجمالي التوصيات</div>
					<div className="text-3xl font-semibold">0</div>
				</div>
				<div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-6 shadow-soft">
					<div className="text-sm text-[rgb(var(--muted))] mb-1">منفذة</div>
					<div className="text-3xl font-semibold text-green-600">0</div>
				</div>
				<div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-6 shadow-soft">
					<div className="text-sm text-[rgb(var(--muted))] mb-1">قيد التنفيذ</div>
					<div className="text-3xl font-semibold text-yellow-600">0</div>
				</div>
				<div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-6 shadow-soft">
					<div className="text-sm text-[rgb(var(--muted))] mb-1">متأخرة</div>
					<div className="text-3xl font-semibold text-red-600">0</div>
				</div>
			</div>
			<Section title="التوصيات النشطة" desc="يمكن تحديث الحالة أو إضافة مرفقات"
							 right={
								 <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
									 New Follow-up
								 </button>
							 }>
				<EmptyState title="No follow-up items yet" desc="Follow-up items will appear here after audits are completed" />
			</Section>
		</PageShell>
	);
}
