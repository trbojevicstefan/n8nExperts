import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";
import { notificationApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { Notification } from "@/types";
import { Button } from "@/components/ui/button";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await notificationApi.getAll({ limit: 50 });
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const fallbackTarget = useMemo(() => (user?.role === "expert" ? "/my-applications" : "/my-jobs"), [user?.role]);

  const getNotificationTarget = (item: Notification) => {
    const metadata = (item.metadata || {}) as Record<string, unknown>;
    const jobId = typeof metadata.jobId === "string" ? metadata.jobId : "";

    if (item.type === "chat_message" || item.entityType === "thread") {
      return "/inbox";
    }
    if (item.type.startsWith("invitation_")) {
      return user?.role === "expert" ? "/invitations" : jobId ? `/my-jobs?jobId=${jobId}` : "/my-jobs";
    }
    if (item.type === "application_submitted") {
      return jobId ? `/my-jobs?jobId=${jobId}` : "/my-jobs";
    }
    if (item.type === "application_status_updated" || item.type === "job_status_updated") {
      return user?.role === "expert" ? "/my-applications?tab=accepted" : jobId ? `/my-jobs?jobId=${jobId}` : "/my-jobs";
    }
    if (item.type === "review_received") {
      return user?.role === "expert" ? "/my-applications?tab=accepted" : "/my-jobs";
    }
    if (jobId) {
      return user?.role === "expert" ? `/jobs?jobId=${jobId}` : `/my-jobs?jobId=${jobId}`;
    }

    return fallbackTarget;
  };

  const openNotification = async (item: Notification) => {
    if (!item.isRead) {
      await markRead(item._id);
    }
    navigate(getNotificationTarget(item));
  };

  const markRead = async (notificationId: string) => {
    setError("");
    try {
      await notificationApi.markRead(notificationId);
      setNotifications((prev) =>
        prev.map((item) => (item._id === notificationId ? { ...item, isRead: true, readAt: new Date().toISOString() } : item))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to mark notification as read.");
    }
  };

  const markAllRead = async () => {
    setError("");
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true, readAt: item.readAt || new Date().toISOString() })));
      setUnreadCount(0);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to mark all as read.");
    }
  };

  return (
    <div className="container py-8">
      <section className="panel p-6 md:p-8 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-bold text-sky-300">
              <Bell className="h-4 w-4" />
              Notifications
            </p>
            <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-white">Activity Center</h1>
            <p className="mt-2 text-slate-300">Unread: {unreadCount}</p>
          </div>
          <Button variant="outline" onClick={markAllRead} disabled={unreadCount === 0}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all read
          </Button>
        </div>
      </section>

      {error && <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200 mb-4">{error}</div>}

      <section className="panel p-5 space-y-3">
        {loading && <p className="text-sm text-slate-300">Loading notifications...</p>}
        {!loading && notifications.length === 0 && <p className="text-sm text-slate-300">No notifications yet.</p>}

        {notifications.map((item) => (
          <article
            key={item._id}
            className={`rounded-xl border p-4 ${item.isRead ? "border-white/10 bg-white/5" : "border-primary/40 bg-primary/10"}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-white">{item.title}</h2>
                <p className="mt-1 text-sm text-slate-300">{item.message}</p>
                <p className="mt-2 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                {!item.isRead && (
                  <Button size="sm" variant="outline" onClick={() => markRead(item._id)}>
                    Mark read
                  </Button>
                )}
                <Button size="sm" onClick={() => openNotification(item)}>
                  Open
                </Button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
