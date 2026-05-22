import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BellRing,
  BriefcaseBusiness,
  CircleCheck,
  Clock3,
  DollarSign,
  FolderKanban,
  Handshake,
  MessageCircleMore,
  Search,
  Wallet,
} from "lucide-react";
import { dashboardData } from "@/data/mockData";
import { useAuth } from "@/hooks/useAuth";
import { usePageMeta } from "@/hooks/usePageMeta";

type WorkspaceMode = "expert" | "client";

const quickActionsByMode: Record<
  WorkspaceMode,
  Array<{ title: string; detail: string; to: string; icon: typeof FolderKanban }>
> = {
  client: [
    {
      title: "Post Project",
      detail: "Publish a scoped brief",
      to: "/post-project",
      icon: FolderKanban,
    },
    {
      title: "Find Talent",
      detail: "Browse verified experts",
      to: "/find-experts",
      icon: Search,
    },
    {
      title: "Withdraw Funds",
      detail: "Open billing controls",
      to: "/workspace?intent=withdraw",
      icon: Wallet,
    },
  ],
  expert: [
    {
      title: "Find Work",
      detail: "Browse open client briefs",
      to: "/jobs",
      icon: Search,
    },
    {
      title: "Open Inbox",
      detail: "Respond to active threads",
      to: "/inbox",
      icon: MessageCircleMore,
    },
    {
      title: "Withdraw Funds",
      detail: "Open billing controls",
      to: "/workspace?intent=withdraw",
      icon: Wallet,
    },
  ],
};

export default function DashboardOverview() {
  const { user } = useAuth();
  const resolvedMode: WorkspaceMode = user?.role === "client" ? "client" : "expert";
  const [viewMode, setViewMode] = useState<WorkspaceMode>(resolvedMode);

  useEffect(() => {
    setViewMode(resolvedMode);
  }, [resolvedMode]);

  usePageMeta({
    title: "Workspace | n8nExperts",
    description: "Control center for active jobs, earnings, completion rate, and message context.",
    canonicalPath: "/workspace",
    noIndex: true,
  });

  const topMetric = viewMode === "client"
    ? {
        label: "Spending This Month",
        value: dashboardData.metrics.monthlySpending,
        change: dashboardData.metrics.spendChange,
        isPositive: true,
        icon: Wallet,
      }
    : {
        label: "Earnings This Month",
        value: dashboardData.metrics.monthlyEarnings,
        change: dashboardData.metrics.growth,
        isPositive: true,
        icon: DollarSign,
      };

  const projectsRoute = viewMode === "client" ? "/my-jobs" : "/my-applications";
  const quickActions = quickActionsByMode[viewMode];

  const notificationTone = {
    info: "border-sky-400/35 bg-sky-400/10 text-sky-200",
    success: "border-emerald-500/35 bg-emerald-500/10 text-emerald-200",
    warning: "border-amber-400/35 bg-amber-400/10 text-amber-200",
  } as const;
  type NotificationLevel = keyof typeof notificationTone;

  return (
    <div className="container page-stack py-6 md:py-8">
      <section className="app-page-header">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Workspace</p>
            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">Welcome back, {dashboardData.user.name}</h1>
            <p className="max-w-3xl text-sm text-slate-300">Keep project health, communication, and payout readiness in one place.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              <CircleCheck className="h-3.5 w-3.5" />
              Available
            </span>
            <div className="inline-flex items-center overflow-hidden rounded-full border border-white/15 bg-white/5 p-0.5" role="group" aria-label="Dashboard view mode">
              <button
                type="button"
                onClick={() => setViewMode("expert")}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${viewMode === "expert" ? "bg-primary text-white" : "text-slate-300 hover:text-white"}`}
                aria-pressed={viewMode === "expert"}
              >
                Expert
              </button>
              <button
                type="button"
                onClick={() => setViewMode("client")}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${viewMode === "client" ? "bg-primary text-white" : "text-slate-300 hover:text-white"}`}
                aria-pressed={viewMode === "client"}
              >
                Client
              </button>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
              <Handshake className="h-3.5 w-3.5" />
              {viewMode === "client" ? "Client View" : "Expert View"}
            </span>
          </div>
        </div>
      </section>

      <section className="stat-strip">
        <article className="stat-pill">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{topMetric.label}</p>
          <div className="mt-2 flex items-end justify-between gap-2">
            <p className="text-2xl font-extrabold text-white">{topMetric.value}</p>
            <topMetric.icon className="h-5 w-5 text-primary" />
          </div>
          <p className={`mt-2 text-xs font-semibold ${topMetric.isPositive ? "text-emerald-300" : "text-amber-300"}`}>{topMetric.change}</p>
        </article>

        <article className="stat-pill">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{viewMode === "client" ? "Active Jobs" : "Active Contracts"}</p>
          <div className="mt-2 flex items-end justify-between gap-2">
            <p className="text-2xl font-extrabold text-white">{dashboardData.metrics.activeProjects}</p>
            <BriefcaseBusiness className="h-5 w-5 text-primary" />
          </div>
          <p className="mt-2 text-xs font-semibold text-slate-300">{viewMode === "client" ? "In delivery this week" : "Across live engagements"}</p>
        </article>

        <article className="stat-pill">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Completion Rate</p>
          <div className="mt-2 flex items-end justify-between gap-2">
            <p className="text-2xl font-extrabold text-emerald-300">{dashboardData.metrics.successRate}</p>
            <CircleCheck className="h-5 w-5 text-emerald-300" />
          </div>
          <p className="mt-2 text-xs font-semibold text-slate-300">Across closed milestones</p>
        </article>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              to={action.to}
              className="surface-card group flex min-h-24 items-center justify-between rounded-xl px-4 py-3 transition-colors hover:border-primary/40"
            >
              <div>
                <p className="text-sm font-semibold text-white">{action.title}</p>
                <p className="mt-1 text-xs text-slate-400">{action.detail}</p>
              </div>
              <div className="flex items-center gap-2 text-primary">
                <Icon className="h-4 w-4" />
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <article className="surface-card rounded-xl">
          <header className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">{viewMode === "client" ? "Active Projects" : "Active Contracts"}</h2>
              <p className="text-xs text-slate-400">Track milestone progress and due-state at a glance.</p>
            </div>
            <Link to={projectsRoute} className="text-xs font-semibold text-primary hover:text-white">
              View all
            </Link>
          </header>

          <div className="space-y-3">
            {dashboardData.activeProjects.map((project) => {
              const isUrgent = project.statusColor === "primary";
              return (
                <Link
                  key={project.id}
                  to={projectsRoute}
                  className="dense-list-card block rounded-xl p-4 transition-colors hover:border-primary/30"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-white">{project.title}</h3>
                      <p className="text-xs text-slate-400">{viewMode === "client" ? `Client: ${project.client}` : `Partner: ${project.client}`}</p>
                    </div>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${
                        isUrgent
                          ? "border border-primary/45 bg-primary/15 text-primary"
                          : "border border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-300">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                      Next: {project.nextMilestone}
                    </span>
                    <span className="font-semibold text-white">{project.progress}%</span>
                  </div>

                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full ${isUrgent ? "bg-primary" : "bg-emerald-400"}`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </article>

        <div className="space-y-4">
          <article className="context-aside rounded-xl">
            <header className="mb-3 flex items-center justify-between gap-3">
              <h2 className="inline-flex items-center gap-2 text-lg font-bold text-white">
                <MessageCircleMore className="h-5 w-5 text-primary" />
                Recent Messages
              </h2>
              <Link to="/inbox" className="text-xs font-semibold text-primary hover:text-white">
                Open inbox
              </Link>
            </header>

            <div className="space-y-2">
              {dashboardData.recentMessages.map((message) => (
                <Link
                  key={message.id}
                  to="/inbox"
                  className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/3 p-3 transition-colors hover:border-primary/35"
                >
                  <img src={message.avatar} alt={message.sender} className="h-10 w-10 rounded-full border border-white/10 object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-white">{message.sender}</p>
                      <p className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{message.time}</p>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-300">{message.preview}</p>
                  </div>
                </Link>
              ))}
            </div>
          </article>

          <article className="context-aside rounded-xl">
            <header className="mb-3 flex items-center justify-between gap-3">
              <h2 className="inline-flex items-center gap-2 text-lg font-bold text-white">
                <BellRing className="h-5 w-5 text-primary" />
                Notifications
              </h2>
              <Link to="/notifications" className="text-xs font-semibold text-primary hover:text-white">
                View all
              </Link>
            </header>

            <div className="space-y-2">
              {dashboardData.notifications.map((notification) => {
                const level = notification.level as NotificationLevel;
                return (
                  <Link
                    key={notification.id}
                    to={notification.to}
                    className="block rounded-xl border border-white/10 bg-white/3 p-3 transition-colors hover:border-primary/35"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white">{notification.title}</p>
                      <p className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{notification.time}</p>
                    </div>
                    <p className="mt-1 text-xs text-slate-300">{notification.detail}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${notificationTone[level]}`}>
                        {level}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                        {notification.cta}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
