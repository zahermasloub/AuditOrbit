"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/app/lib/apiFetch";
import { Badge } from "@/app/components/ui/Badge";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { Empty, Loading } from "@/app/components/ui/States";

interface NotificationItem {
  id: string;
  kind: string;
  title: string;
  body?: string | null;
  status: string;
  created_at: string;
}

interface NotificationsResponse {
  items: NotificationItem[];
  total: number;
  page: number;
  size: number;
}

export default function AdminNotificationsPage() {
  const [status, setStatus] = useState<"" | "unread" | "read">("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<NotificationsResponse>({
    queryKey: ["notifications", status],
    queryFn: () => apiFetch<NotificationsResponse>(`/notifications${status ? `?status=${status}` : ""}`),
  });

  const markRead = useMutation({
    mutationFn: (notificationId: string) =>
      apiFetch<{ ok: boolean }>(`/notifications/${notificationId}/mark-read`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  if (isLoading) {
    return <Loading />;
  }

  if (!data?.items?.length) {
    return <Empty title="لا يوجد إشعارات" hint="لنبدأ بإرسال بعض الأحداث" />;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">الإشعارات</h1>
          <p className="text-sm text-muted">مراقبة التنبيهات المرسلة للمستخدمين</p>
        </div>
        <select
          className="border border-border rounded-xl px-3 py-2 text-sm bg-card"
          value={status}
          onChange={(event) => setStatus(event.target.value as "" | "unread" | "read")}
        >
          <option value="">جميع الحالات</option>
          <option value="unread">غير مقروء</option>
          <option value="read">مقروء</option>
        </select>
      </div>

      <div className="grid gap-3">
        {data.items.map((notification) => (
          <Card key={notification.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase tracking-wide text-muted">{notification.kind}</span>
                <h2 className="text-base font-semibold text-fg">{notification.title}</h2>
              </div>
              <Badge color={notification.status === "unread" ? "warning" : "muted"}>
                {notification.status === "unread" ? "غير مقروء" : "مقروء"}
              </Badge>
            </div>
            <p className="text-sm text-muted">{notification.body ?? "—"}</p>
            <div className="flex items-center justify-between text-xs text-muted">
              <span className="font-mono">{new Date(notification.created_at).toLocaleString("ar-SA")}</span>
              {notification.status === "unread" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markRead.mutate(notification.id)}
                  disabled={markRead.isPending}
                >
                  تعليم كمقروء
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
