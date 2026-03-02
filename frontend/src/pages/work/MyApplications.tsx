import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { applicationApi } from "@/lib/api";
import type { JobApplication } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const appStatuses = ["submitted", "shortlisted", "accepted", "rejected"] as const;
type AppStatus = (typeof appStatuses)[number];
type AppTab = "all" | AppStatus;

const statusLabel: Record<AppStatus, string> = {
  submitted: "Submitted",
  shortlisted: "Shortlisted",
  accepted: "Accepted",
  rejected: "Rejected",
};

const isAppTab = (value: string | null): value is AppTab => {
  return value === "all" || value === "submitted" || value === "shortlisted" || value === "accepted" || value === "rejected";
};

export default function MyApplications() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [activeWork, setActiveWork] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const tabFilter: AppTab = isAppTab(searchParams.get("tab")) ? (searchParams.get("tab") as AppTab) : "all";
  const sourceFilter = searchParams.get("source") || "all";
  const sortFilter = searchParams.get("sort") || "updated";
  const activeOnly = searchParams.get("active") === "1";

  const updateSearch = (patch: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (!value || value === "all" || value === "0") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    setSearchParams(next, { replace: true });
  };

  const loadApplications = async () => {
    setLoading(true);
    setError("");
    try {
      const statusParam =
        tabFilter === "all" ? (activeOnly ? "active" : "") : tabFilter;

      const [response, activeResponse] = await Promise.all([
        applicationApi.getMyApplications({
          ...(statusParam ? { status: statusParam } : {}),
          source: sourceFilter,
          sort: sortFilter,
          limit: 80,
        }),
        applicationApi.getMyApplications({
          status: "accepted",
          sort: "updated",
          limit: 40,
        }),
      ]);
      setApplications(response.data.applications);
      setActiveWork(activeResponse.data.applications);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to load applications.");
      setApplications([]);
      setActiveWork([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabFilter, sourceFilter, sortFilter, activeOnly]);

  const withdraw = async (applicationId: string) => {
    setError("");
    try {
      await applicationApi.withdraw(applicationId);
      await loadApplications();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to withdraw application.");
    }
  };

  const grouped = useMemo(() => {
    const groups: Record<AppStatus, JobApplication[]> = {
      submitted: [],
      shortlisted: [],
      accepted: [],
      rejected: [],
    };
    applications.forEach((application) => {
      groups[application.status].push(application);
    });
    return groups;
  }, [applications]);

  const renderStatuses: AppStatus[] = tabFilter === "all" ? [...appStatuses] : [tabFilter];

  return (
    <div className="container py-8">
      <section className="panel p-6 md:p-8 mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white">My Applications</h1>
        <p className="mt-2 text-slate-300">Track each proposal stage with timeline context and clear client trust signals.</p>
      </section>

      {error && <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200 mb-5">{error}</div>}

      <section className="panel p-5 mb-5">
        <h2 className="text-sm uppercase tracking-wider font-semibold text-slate-300">Accepted / Started Jobs</h2>
        <div className="mt-3 grid gap-2">
          {activeWork.length === 0 && <p className="text-sm text-slate-400">No accepted jobs yet.</p>}
          {activeWork.map((application) => {
            const job = typeof application.jobId === "string" ? null : application.jobId;
            const status = job?.status || "in_progress";
            return (
              <article key={`active-${application._id}`} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-white">{job?.title || "Job"}</p>
                  <Badge variant={status === "completed" ? "success" : "outline"}>{status === "in_progress" ? "Started" : status}</Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs">
                  {job?._id && (
                    <Link to={`/jobs?jobId=${job._id}`} className="text-sky-300 hover:underline">
                      Open job details
                    </Link>
                  )}
                  <Link to="/inbox" className="text-sky-300 hover:underline">
                    Open inbox
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="panel p-5">
        <div className="flex flex-wrap items-end gap-3 mb-5">
          <Tabs value={tabFilter} onValueChange={(value) => updateSearch({ tab: value })}>
            <TabsList aria-label="Application status tabs">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="submitted">Submitted</TabsTrigger>
              <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
              <TabsTrigger value="accepted">Accepted</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>

          <label className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(event) => updateSearch({ active: event.target.checked ? "1" : "0" })}
              aria-label="Filter active applications"
            />
            Active only
          </label>

          <div className="ml-auto grid sm:grid-cols-2 gap-3">
            <div className="space-y-2 min-w-[180px]">
              <Label htmlFor="source-filter">Source</Label>
              <select
                id="source-filter"
                aria-label="Filter by source"
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-white"
                value={sourceFilter}
                onChange={(event) => updateSearch({ source: event.target.value })}
              >
                <option value="all">All sources</option>
                <option value="direct">Direct</option>
                <option value="invitation">Invitation</option>
              </select>
            </div>
            <div className="space-y-2 min-w-[180px]">
              <Label htmlFor="sort-filter">Sort</Label>
              <select
                id="sort-filter"
                aria-label="Sort applications"
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-white"
                value={sortFilter}
                onChange={(event) => updateSearch({ sort: event.target.value })}
              >
                <option value="updated">Recently updated</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="highestBid">Highest bid</option>
                <option value="lowestBid">Lowest bid</option>
              </select>
            </div>
          </div>
        </div>

        {loading && <p className="text-sm text-slate-300">Loading applications...</p>}
        {!loading && applications.length === 0 && <p className="text-sm text-slate-300">No applications match this view.</p>}

        <div className="space-y-5">
          {renderStatuses.map((status) => (
            <section key={status} className="space-y-3" aria-label={`${statusLabel[status]} applications`}>
              <header className="flex items-center justify-between">
                <h2 className="text-sm uppercase tracking-wider font-semibold text-slate-300">{statusLabel[status]}</h2>
                <Badge variant="outline">{grouped[status].length}</Badge>
              </header>

              {grouped[status].length === 0 && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-400">No applications in this stage.</div>
              )}

              {grouped[status].map((application) => {
                const job = typeof application.jobId === "string" ? null : application.jobId;
                const client = typeof application.clientId === "string" ? null : application.clientId;
                const isWithdrawn = Boolean(application.withdrawnAt);

                return (
                  <article key={application._id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{job?.title || "Job"}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Client: {client?.companyName || client?.username || "Client"}
                          {job?.budgetAmount ? ` | $${job.budgetAmount} ${job.budgetType === "hourly" ? "/hr" : "fixed"}` : ""}
                        </p>
                        {client?._id && (
                          <Link className="mt-2 inline-block text-xs text-sky-300 hover:underline" to={`/clients/${client._id}`}>
                            View client profile
                          </Link>
                        )}
                      </div>
                      <div className="text-right space-y-1">
                        <Badge variant="outline">{statusLabel[application.status]}</Badge>
                        <p className="text-[11px] uppercase tracking-wider text-slate-500">{application.source || "direct"}</p>
                      </div>
                    </div>

                    {client && (
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
                        <p>
                          Posted: <span className="font-semibold text-white">{client.jobsPostedCount ?? 0}</span>
                        </p>
                        <p>
                          Completed: <span className="font-semibold text-white">{client.jobsCompletedCount ?? 0}</span>
                        </p>
                        <p>
                          Hires: <span className="font-semibold text-white">{client.hiresCount ?? 0}</span>
                        </p>
                        <p>
                          Avg response: <span className="font-semibold text-white">{client.avgClientResponseHours ?? 0}h</span>
                        </p>
                      </div>
                    )}

                    <p className="text-sm text-slate-300 mt-3 line-clamp-4 whitespace-pre-wrap">{application.coverLetter}</p>

                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                      <span>Submitted: {new Date(application.createdAt).toLocaleString()}</span>
                      {application.statusChangedAt && <span>Status updated: {new Date(application.statusChangedAt).toLocaleString()}</span>}
                      {isWithdrawn && <span>Withdrawn: {new Date(application.withdrawnAt || "").toLocaleString()}</span>}
                    </div>

                    {(application.status === "submitted" || application.status === "shortlisted") && !isWithdrawn && (
                      <Button size="sm" variant="outline" className="mt-4" onClick={() => withdraw(application._id)}>
                        Withdraw
                      </Button>
                    )}
                  </article>
                );
              })}
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}
