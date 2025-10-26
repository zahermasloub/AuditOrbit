import PageShell from "@/components/layout/PageShell";
import { Section } from "@/components/ui/Section";
import { EmptyState } from "@/components/ui/EmptyState";

export default function Reports(){
	return (
		<PageShell title="التقارير والموازنات" subtitle="تقرير الخطة السنوية">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
				<div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-6 shadow-soft">
					<div className="text-sm text-[rgb(var(--muted))] mb-1">إجمالي الساعات</div>
					<div className="text-3xl font-semibold">2400</div>
				</div>
				<div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-6 shadow-soft">
					<div className="text-sm text-[rgb(var(--muted))] mb-1">عدد المراجعات</div>
					<div className="text-3xl font-semibold">24</div>
				</div>
				<div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-6 shadow-soft">
					<div className="text-sm text-[rgb(var(--muted))] mb-1">الجاهزية</div>
					<div className="text-3xl font-semibold">100%</div>
				</div>
			</div>
					<Section title="تقرير الخطة" desc="يمكن تصديره بعد الاعتماد"
									 right={
								 <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
									 Export PDF
								 </button>
							 }>
						<EmptyState title="No final report yet" desc="The report will be generated after publishing" />
			</Section>
		</PageShell>
	);
}
