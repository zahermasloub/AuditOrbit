"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Container from "../../../components/layout/Container";
import SectionTitle from "../../../components/layout/SectionTitle";
import { apiFetch } from "../../../lib/apiFetch";
import DataTable, { DataTableColumn } from "../../../components/table/DataTable";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { Button } from "../../../components/ui/Button";

type Report = {
  id: string;
  engagement_id: string;
  version_no: number;
  kind: string;
  title: string;
  status: string;
  created_at: string;
};

export default function Page() {
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useQuery({
    queryKey: ["reports-approvals"],
    queryFn: () => apiFetch<{ items: Report[] }>("/reports?status=in_review&page=1&size=50"),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/reports/${id}/approve`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reports-approvals"] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/reports/${id}/reject`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reports-approvals"] }),
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
      accessorKey: "actions",
      header: "إجراءات / Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="success"
            onClick={() => approveMutation.mutate(row.id)}
            disabled={approveMutation.isPending}
          >
            اعتماد / Approve
          </Button>
          <Button
            variant="danger"
            onClick={() => rejectMutation.mutate(row.id)}
            disabled={rejectMutation.isPending}
          >
            رفض / Reject
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) return <Container className="py-8"><p>جارِ التحميل...</p></Container>;

  return (
    <Container className="py-8 sm:py-10 space-y-4">
      <SectionTitle title="الموافقات / Approvals" sub="مراجعة واعتماد." />
      <DataTable columns={columns} data={data?.items ?? []} />
    </Container>
  );
}
