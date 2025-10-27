"use client";
import { useQuery } from "@tanstack/react-query";
import Container from "../../../components/layout/Container";
import SectionTitle from "../../../components/layout/SectionTitle";
import { apiFetch } from "../../../lib/apiFetch";
import DataTable, { DataTableColumn } from "../../../components/table/DataTable";
import { StatusBadge } from "../../../components/ui/StatusBadge";

type Report = {
  id: string;
  engagement_id: string;
  version_no: number;
  kind: string;
  title: string;
  status: string;
  created_at: string;
  published_at?: string;
};

export default function Page() {
  const { data, isLoading } = useQuery({
    queryKey: ["reports-published"],
    queryFn: () => apiFetch<{ items: Report[] }>("/reports?status=published&page=1&size=50"),
  });

  const columns: DataTableColumn<Report>[] = [
    { accessorKey: "title", header: "العنوان / Title" },
    { accessorKey: "engagement_id", header: "المهمة / Engagement" },
    {
      accessorKey: "version_no",
      header: "الإصدار / Version",
      cell: ({ row }) => `${row.version_no} (${row.kind})`,
    },
    {
      accessorKey: "status",
      header: "الحالة / Status",
      cell: ({ row }) => <StatusBadge value={row.status} />,
    },
    {
      accessorKey: "published_at",
      header: "تاريخ النشر / Published",
      cell: ({ row }) => row.published_at ? new Date(row.published_at).toLocaleDateString("ar-SA") : "-",
    },
  ];

  if (isLoading) return <Container className="py-8"><p>جارِ التحميل...</p></Container>;

  return (
    <Container className="py-8 sm:py-10 space-y-4">
      <SectionTitle title="المنشورة / Published" sub="الإصدارات النهائية." />
      <DataTable columns={columns} data={data?.items ?? []} />
    </Container>
  );
}
