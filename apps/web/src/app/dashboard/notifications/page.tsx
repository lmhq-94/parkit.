"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/lib/toastStore";
import { useAuthStore, useDashboardStore } from "@/lib/store";
import { apiClient } from "@/lib/api";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { PageLoader } from "@/components/PageLoader";
import { LoadingSpinner } from "@/components/LoadingSpinner";

type NotificationItem = {
  id?: string;
  title?: string;
  type?: string;
  status?: string;
  createdAt?: string;
};

const STATUS_STYLES: Record<string, string> = {
  DELIVERED: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  READ: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  SENT: "bg-company-primary-subtle text-company-primary border-company-primary-muted",
  FAILED: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
};

const TYPE_STYLES: Record<string, string> = {
  PUSH: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30",
  SMS: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  EMAIL: "bg-company-primary-subtle text-company-primary border-company-primary-muted",
};

function getStatusStyle(s: string | undefined): string {
  return STATUS_STYLES[s ?? ""] ?? "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
}

function getTypeStyle(t: string | undefined): string {
  return TYPE_STYLES[t ?? ""] ?? "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
}

export default function NotificationsPage() {
  const { t, tEnum } = useTranslation();
  const { showError: showToastError } = useToast();
  const user = useAuthStore((s) => s.user);
  const selectedCompanyId = useDashboardStore((s: { selectedCompanyId: string | null }) => s.selectedCompanyId);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<NotificationItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get<NotificationItem[]>(`/notifications/user/${user.id}`);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar");
      showToastError(t("common.loadError"));
    } finally {
      setLoading(false);
    }
  }, [user?.id, showToastError, t]);

  useEffect(() => {
    load();
  }, [load, selectedCompanyId]);

  const handleMarkAsRead = useCallback(async (row: NotificationItem) => {
    if (!row.id) return;
    try {
      setMarkingId(row.id);
      await apiClient.patch(`/notifications/${row.id}/read`);
      await load();
    } finally {
      setMarkingId(null);
    }
  }, [load]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!pendingDelete?.id) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/notifications/${pendingDelete.id}`);
      setPendingDelete(null);
      await load();
    } finally {
      setDeleting(false);
    }
  }, [pendingDelete, load]);

  if (loading && items.length === 0) {
    return (
      <div className="flex-1 flex flex-col pt-14 pb-8 px-4 md:px-10 lg:px-12 w-full">
        <div className="flex flex-1 items-center justify-center">
          <PageLoader />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col pt-14 pb-8 px-4 md:px-10 lg:px-12 w-full">
      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-6 mb-4">
            <Bell className="w-12 h-12 text-slate-400" />
          </div>
          <p className="text-text-secondary font-medium">{t("tables.notifications.empty")}</p>
          <p className="text-sm text-text-muted mt-1">Las notificaciones aparecerán aquí.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => (
            <li
              key={n.id}
              className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-border bg-card/60 hover:bg-card/80 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-primary truncate">{n.title ?? "—"}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${getTypeStyle(n.type)}`}>
                    {tEnum("notificationType", n.type)}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${getStatusStyle(n.status)}`}>
                    {tEnum("notificationStatus", n.status)}
                  </span>
                  {n.createdAt && (
                    <span className="text-xs text-text-muted">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleMarkAsRead(n)}
                  disabled={markingId === n.id || n.status === "READ"}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-company-primary hover:bg-company-primary-subtle disabled:opacity-50 disabled:pointer-events-none transition-colors"
                >
                  {markingId === n.id ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {t("tables.notifications.markAsRead")}
                </button>
                <button
                  type="button"
                  onClick={() => setPendingDelete(n)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  {t("common.delete")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDeleteModal
        open={pendingDelete != null}
        title={t("common.confirmDeleteTitle")}
        message={t("tables.notifications.confirmDeleteItem").replace(/\{\{item\}\}/g, pendingDelete?.title ?? "—")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPendingDelete(null)}
        loading={deleting}
      />
    </div>
  );
}
