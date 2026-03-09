import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { BookmarkPlus, CheckSquare, Clock3, Square, Trash2 } from "lucide-react";
import { applicationApi, savedApi } from "@/lib/api";
import type { ClientPipelineResponse, JobApplication, SavedSearch } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePageMeta } from "@/hooks/usePageMeta";
import { AppPageHeader, EmptyState, FilterToolbar, StatStrip } from "@/components/layout/PagePrimitives";

const pipelineStatuses = ["submitted", "shortlisted", "accepted", "rejected"] as const;
type PipelineStatus = (typeof pipelineStatuses)[number];
type PipelineFilter = PipelineStatus | "all";
type SortOption = "newest" | "oldest" | "highestBid" | "lowestBid" | "updated";

const statusLabel: Record<PipelineStatus, string> = {
  submitted: "Submitted",
  shortlisted: "Shortlisted",
  accepted: "Accepted",
  rejected: "Rejected",
};

const emptyCounts: ClientPipelineResponse["countsByStatus"] = {
  submitted: 0,
  shortlisted: 0,
  accepted: 0,
  rejected: 0,
};

const isPipelineStatus = (value: string | null): value is PipelineStatus =>
  value === "submitted" || value === "shortlisted" || value === "accepted" || value === "rejected";

const isPipelineFilter = (value: string | null): value is PipelineFilter => value === "all" || isPipelineStatus(value);

const pickSlaBadge = (application: JobApplication) => {
  const baseTime = application.statusChangedAt || application.createdAt;
  const diffHours = Math.max(0, (Date.now() - new Date(baseTime).getTime()) / (1000 * 60 * 60));

  if (application.status === "submitted" && diffHours >= 24) {
    return { label: `Needs review (${Math.floor(diffHours)}h)`, tone: "warning" as const };
  }
  if (application.status === "shortlisted" && diffHours >= 72) {
    return { label: `Stale shortlist (${Math.floor(diffHours)}h)`, tone: "destructive" as const };
  }
  if ((application.status === "submitted" || application.status === "shortlisted") && diffHours >= 12) {
    return { label: `Review soon (${Math.floor(diffHours)}h)`, tone: "outline" as const };
  }
  return null;
};

const readStringParam = (searchParams: URLSearchParams, key: string) => searchParams.get(key) || "";

const asSearchPayload = (search: SavedSearch) => {
  const filters = (search.filters || {}) as Record<string, unknown>;
  return {
    q: typeof filters.q === "string" ? filters.q : "",
    status: typeof filters.status === "string" ? filters.status : "",
    source: typeof filters.source === "string" ? filters.source : "",
    jobId: typeof filters.jobId === "string" ? filters.jobId : "",
    sort: typeof filters.sort === "string" ? filters.sort : "",
    minBid: typeof filters.minBid === "string" ? filters.minBid : "",
    maxBid: typeof filters.maxBid === "string" ? filters.maxBid : "",
  };
};

export default function ApplicantPipeline() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [countsByStatus, setCountsByStatus] = useState<ClientPipelineResponse["countsByStatus"]>(emptyCounts);
  const [countsByJob, setCountsByJob] = useState<ClientPipelineResponse["countsByJob"]>([]);
  const [savedViews, setSavedViews] = useState<SavedSearch[]>([]);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [selectedApplicationIds, setSelectedApplicationIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);
  const [batchUpdating, setBatchUpdating] = useState(false);
  const [didAutoApplyDefaultView, setDidAutoApplyDefaultView] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  usePageMeta({
    title: "Applicant Pipeline | n8nExperts",
    description: "Operate the applicant queue across all jobs with filters, saved views, notes, status grouping, and bulk actions.",
    canonicalPath: "/my-jobs/pipeline",
  });

  const statusFilter: PipelineFilter = isPipelineFilter(searchParams.get("status")) ? (searchParams.get("status") as PipelineFilter) : "all";
  const sourceFilter = readStringParam(searchParams, "source") || "all";
  const sortFilter: SortOption =
    (searchParams.get("sort") as SortOption | null) &&
    ["newest", "oldest", "highestBid", "lowestBid", "updated"].includes(searchParams.get("sort") || "")
      ? (searchParams.get("sort") as SortOption)
      : "updated";
  const queryFilter = readStringParam(searchParams, "q");
  const minBidFilter = readStringParam(searchParams, "minBid");
  const maxBidFilter = readStringParam(searchParams, "maxBid");
  const jobFilter = readStringParam(searchParams, "jobId") || "all";

  const updateSearch = (patch: Record<string, string>) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (!value || value === "all") {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
    });
    setSearchParams(nextParams, { replace: true });
  };

  const loadSavedViews = async () => {
    try {
      const response = await savedApi.listSearches({ scope: "jobs" });
      const onlyPipeline = (response.data || []).filter((item) => {
        const filters = (item.filters || {}) as Record<string, unknown>;
        return filters.mode === "pipeline";
      });
      setSavedViews(onlyPipeline);

      if (!didAutoApplyDefaultView) {
        const hasActiveFilters = Array.from(searchParams.keys()).length > 0;
        if (!hasActiveFilters) {
          const defaultView = onlyPipeline.find((item) => {
            const filters = (item.filters || {}) as Record<string, unknown>;
            return Boolean(filters.isDefault);
          });
          if (defaultView) {
            const payload = asSearchPayload(defaultView);
            updateSearch(payload);
          }
        }
        setDidAutoApplyDefaultView(true);
      }
    } catch {
      setSavedViews([]);
    }
  };

  const loadPipeline = async () => {
    setLoading(true);
    setError("");
    try {
      const params: Record<string, string | number> = {
        limit: 120,
        sort: sortFilter,
      };
      if (statusFilter !== "all") params.status = statusFilter;
      if (sourceFilter !== "all") params.source = sourceFilter;
      if (queryFilter.trim()) params.q = queryFilter.trim();
      if (jobFilter !== "all") params.jobId = jobFilter;
      if (minBidFilter.trim()) params.minBid = minBidFilter.trim();
      if (maxBidFilter.trim()) params.maxBid = maxBidFilter.trim();

      const response = await applicationApi.getClientPipeline(params);
      setApplications(response.data.applications || []);
      setCountsByStatus(response.data.countsByStatus || emptyCounts);
      setCountsByJob(response.data.countsByJob || []);
      setSelectedApplicationIds([]);
      setNoteDrafts((prev) => {
        const next = { ...prev };
        (response.data.applications || []).forEach((application) => {
          if (next[application._id] === undefined) {
            next[application._id] = application.clientNote || "";
          }
        });
        return next;
      });
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to load applicant pipeline.");
      setApplications([]);
      setCountsByStatus(emptyCounts);
      setCountsByJob([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedViews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadPipeline();
    }, 120);
    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, sourceFilter, sortFilter, queryFilter, minBidFilter, maxBidFilter, jobFilter]);

  const groupedApplications = useMemo(() => {
    const groups: Record<PipelineStatus, JobApplication[]> = {
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

  const sectionsToRender: PipelineStatus[] = statusFilter === "all" ? [...pipelineStatuses] : [statusFilter];

  const toggleSelection = (applicationId: string) => {
    setSelectedApplicationIds((prev) =>
      prev.includes(applicationId) ? prev.filter((id) => id !== applicationId) : [...prev, applicationId]
    );
  };

  const toggleAllForSection = (sectionStatus: PipelineStatus) => {
    const sectionIds = groupedApplications[sectionStatus].map((application) => application._id);
    if (sectionIds.length === 0) return;

    const allSelected = sectionIds.every((id) => selectedApplicationIds.includes(id));
    if (allSelected) {
      setSelectedApplicationIds((prev) => prev.filter((id) => !sectionIds.includes(id)));
      return;
    }
    setSelectedApplicationIds((prev) => Array.from(new Set([...prev, ...sectionIds])));
  };

  const saveNote = async (applicationId: string) => {
    setError("");
    setMessage("");
    setSavingNoteId(applicationId);
    try {
      await applicationApi.updateNote(applicationId, (noteDrafts[applicationId] || "").trim());
      setMessage("Note saved.");
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to save note.");
    } finally {
      setSavingNoteId(null);
    }
  };

  const runBulkAction = async (status: "shortlisted" | "accepted" | "rejected") => {
    if (selectedApplicationIds.length === 0) return;
    setBatchUpdating(true);
    setError("");
    setMessage("");
    try {
      const response = await applicationApi.bulkUpdateStatus({
        applicationIds: selectedApplicationIds,
        status,
      });
      const skippedCount = response.data.skipped.length;
      setMessage(
        skippedCount > 0
          ? `Updated ${response.data.updatedCount}. Skipped ${skippedCount} items that were not eligible.`
          : `Updated ${response.data.updatedCount} applications.`
      );
      await loadPipeline();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Bulk update failed.");
    } finally {
      setBatchUpdating(false);
    }
  };

  const updateSingleStatus = async (applicationId: string, status: "shortlisted" | "accepted" | "rejected") => {
    setError("");
    setMessage("");
    try {
      await applicationApi.updateStatus(applicationId, status);
      setMessage(`Application moved to ${status}.`);
      await loadPipeline();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to update application status.");
    }
  };

  const saveCurrentView = async () => {
    const name = window.prompt("Name this pipeline view", "Open review queue")?.trim();
    if (!name) return;

    const payload = {
      name,
      scope: "jobs" as const,
      filters: {
        mode: "pipeline",
        ...(queryFilter.trim() && { q: queryFilter.trim() }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(sourceFilter !== "all" && { source: sourceFilter }),
        ...(jobFilter !== "all" && { jobId: jobFilter }),
        ...(sortFilter && { sort: sortFilter }),
        ...(minBidFilter.trim() && { minBid: minBidFilter.trim() }),
        ...(maxBidFilter.trim() && { maxBid: maxBidFilter.trim() }),
      },
      isPinned: false,
    };

    setError("");
    setMessage("");
    try {
      await savedApi.createSearch(payload);
      setMessage("Pipeline view saved.");
      await loadSavedViews();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to save view.");
    }
  };

  const applySavedView = async (view: SavedSearch) => {
    const payload = asSearchPayload(view);
    updateSearch(payload);
    try {
      await savedApi.markSearchUsed(view._id);
    } catch {
      // no-op
    }
  };

  const deleteSavedView = async (id: string) => {
    setError("");
    setMessage("");
    try {
      await savedApi.deleteSearch(id);
      setSavedViews((prev) => prev.filter((view) => view._id !== id));
      setMessage("Saved view deleted.");
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to delete view.");
    }
  };

  const setDefaultView = async (viewId: string) => {
    setError("");
    setMessage("");
    try {
      const updates = savedViews.map((view) => {
        const viewFilters = (view.filters || {}) as Record<string, unknown>;
        return savedApi.updateSearch(view._id, {
          filters: {
            ...viewFilters,
            isDefault: view._id === viewId,
          },
        });
      });

      await Promise.all(updates);
      setMessage("Default pipeline view updated.");
      await loadSavedViews();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to update default view.");
    }
  };

  return (
    <div className="container py-8 space-y-6">
      <AppPageHeader
        eyebrow="Client hiring ops"
        title="Applicant pipeline"
        description="Manage applicants across all jobs with status-grouped queues, saved views, and bulk actions that keep hiring ops legible."
      >
        <StatStrip
          items={[
            { label: "Submitted", value: countsByStatus.submitted || 0 },
            { label: "Shortlisted", value: countsByStatus.shortlisted || 0 },
            { label: "Accepted", value: countsByStatus.accepted || 0 },
          ]}
        />
      </AppPageHeader>

      {error && <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}
      {message && <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">{message}</div>}

      <FilterToolbar className="panel p-5 space-y-4" title="Cross-job filters" description="Use saved views and compact controls to reduce noise before making shortlist or rejection decisions.">
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="pipeline-search">Search</Label>
            <Input
              id="pipeline-search"
              placeholder="Search by expert, job title, or proposal text"
              value={queryFilter}
              onChange={(event) => updateSearch({ q: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pipeline-status">Status</Label>
            <select
              id="pipeline-status"
              aria-label="Status filter"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-white"
              value={statusFilter}
              onChange={(event) => updateSearch({ status: event.target.value })}
            >
              <option value="all">All statuses</option>
              <option value="submitted">Submitted</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pipeline-source">Source</Label>
            <select
              id="pipeline-source"
              aria-label="Source filter"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-white"
              value={sourceFilter}
              onChange={(event) => updateSearch({ source: event.target.value })}
            >
              <option value="all">All sources</option>
              <option value="direct">Direct</option>
              <option value="invitation">Invitation</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pipeline-job">Job</Label>
            <select
              id="pipeline-job"
              aria-label="Job filter"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-white"
              value={jobFilter}
              onChange={(event) => updateSearch({ jobId: event.target.value })}
            >
              <option value="all">All jobs</option>
              {countsByJob.map((job) => (
                <option key={job.jobId} value={job.jobId}>
                  {job.title} ({job.count})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pipeline-min-bid">Min bid</Label>
            <Input id="pipeline-min-bid" value={minBidFilter} onChange={(event) => updateSearch({ minBid: event.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pipeline-max-bid">Max bid</Label>
            <Input id="pipeline-max-bid" value={maxBidFilter} onChange={(event) => updateSearch({ maxBid: event.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pipeline-sort">Sort</Label>
            <select
              id="pipeline-sort"
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
          <div className="flex items-end gap-2">
            <Button variant="outline" onClick={saveCurrentView}>
              <BookmarkPlus className="h-4 w-4 mr-1" />
              Save view
            </Button>
            <Link to="/my-jobs" className="text-xs text-sky-300 hover:underline">
              Job-focused view
            </Link>
          </div>
        </div>
      </FilterToolbar>

      <section className="panel p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Saved Pipeline Views</h2>
          <Badge variant="outline">{savedViews.length}</Badge>
        </div>
        {savedViews.length === 0 && <EmptyState title="No saved views yet." className="py-4" />}
        <div className="grid gap-3 md:grid-cols-2">
          {savedViews.map((view) => (
            <article key={view._id} className="rounded-xl border border-white/10 bg-white/5 p-3">
              {Boolean((view.filters as Record<string, unknown>).isDefault) && (
                <Badge variant="secondary" className="mb-2">
                  Default
                </Badge>
              )}
              <p className="font-semibold text-white">{view.name}</p>
              <p className="mt-1 text-xs text-slate-400">Updated {new Date(view.updatedAt).toLocaleString()}</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => applySavedView(view)}>
                  Apply
                </Button>
                <Button size="sm" variant="outline" onClick={() => setDefaultView(view._id)}>
                  Set default
                </Button>
                <Button size="sm" variant="outline" onClick={() => deleteSavedView(view._id)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel p-5 space-y-4">
        <div className="rounded-lg border border-white/10 bg-white/5 p-3 flex flex-wrap gap-2 items-center">
          <p className="text-sm text-slate-300">Selected: {selectedApplicationIds.length}</p>
          <Button
            size="sm"
            variant="outline"
            disabled={batchUpdating || selectedApplicationIds.length === 0}
            onClick={() => runBulkAction("shortlisted")}
          >
            Batch Shortlist
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={batchUpdating || selectedApplicationIds.length === 0}
            onClick={() => runBulkAction("accepted")}
          >
            Batch Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={batchUpdating || selectedApplicationIds.length === 0}
            onClick={() => runBulkAction("rejected")}
          >
            Batch Reject
          </Button>
        </div>

        {loading && <p className="text-sm text-slate-300">Loading applications...</p>}
        {!loading && applications.length === 0 && (
          <EmptyState title="No applications match these filters." description="Broaden the saved view or remove some controls to see more of the queue." />
        )}

        {sectionsToRender.map((sectionStatus) => {
          const sectionIds = groupedApplications[sectionStatus].map((item) => item._id);
          const allSelected = sectionIds.length > 0 && sectionIds.every((id) => selectedApplicationIds.includes(id));

          return (
            <section key={sectionStatus} className="space-y-3">
              <header className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">{statusLabel[sectionStatus]}</h3>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleAllForSection(sectionStatus)}
                    disabled={groupedApplications[sectionStatus].length === 0}
                  >
                    {allSelected ? <CheckSquare className="h-4 w-4 mr-1" /> : <Square className="h-4 w-4 mr-1" />}
                    Select all
                  </Button>
                  <Badge variant="outline">{groupedApplications[sectionStatus].length}</Badge>
                </div>
              </header>

              {groupedApplications[sectionStatus].length === 0 && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-400">No applications in this stage.</div>
              )}

              {groupedApplications[sectionStatus].map((application) => {
                const expert = typeof application.expertId === "string" ? null : application.expertId;
                const job = typeof application.jobId === "string" ? null : application.jobId;
                const noteValue = noteDrafts[application._id] ?? application.clientNote ?? "";
                const isSelected = selectedApplicationIds.includes(application._id);
                const slaBadge = pickSlaBadge(application);

                return (
                  <article key={application._id} className={`rounded-xl border bg-white/5 p-4 ${isSelected ? "border-primary/70" : "border-white/10"}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          aria-label={`Select application from ${expert?.username || "expert"}`}
                          className="mt-1"
                          checked={isSelected}
                          onChange={() => toggleSelection(application._id)}
                        />
                        <div>
                          <p className="font-semibold text-white">{expert?.username || "Expert"}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {job?.title || "Job"}
                            {expert?.hourlyRate ? ` | $${expert.hourlyRate}/hr` : ""}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {expert?._id && (
                              <Link className="text-xs text-sky-300 hover:underline" to={`/experts/${expert._id}`}>
                                Expert profile
                              </Link>
                            )}
                            {job?._id && (
                              <Link className="text-xs text-sky-300 hover:underline" to={`/my-jobs?jobId=${job._id}`}>
                                Open job
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge variant="outline">{statusLabel[application.status]}</Badge>
                        <p className="text-[11px] uppercase tracking-wider text-slate-500">{application.source || "direct"}</p>
                        {slaBadge && (
                          <Badge variant={slaBadge.tone} className="inline-flex items-center gap-1">
                            <Clock3 className="h-3 w-3" />
                            {slaBadge.label}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-slate-200 mt-3 whitespace-pre-wrap line-clamp-4">{application.coverLetter}</p>

                    <div className="mt-3 text-xs text-slate-400 flex flex-wrap gap-4">
                      {application.bidAmount ? <span>Bid: ${application.bidAmount}</span> : <span>Bid: not provided</span>}
                      {application.estimatedDuration && <span>ETA: {application.estimatedDuration}</span>}
                      {application.statusChangedAt && <span>Updated: {new Date(application.statusChangedAt).toLocaleString()}</span>}
                    </div>

                    <div className="mt-3 space-y-2">
                      <Label htmlFor={`pipeline-note-${application._id}`}>Private note</Label>
                      <Textarea
                        id={`pipeline-note-${application._id}`}
                        className="min-h-[80px]"
                        value={noteValue}
                        onChange={(event) =>
                          setNoteDrafts((prev) => ({
                            ...prev,
                            [application._id]: event.target.value,
                          }))
                        }
                        placeholder="Internal note for your hiring process"
                      />
                      <Button size="sm" variant="outline" onClick={() => saveNote(application._id)} disabled={savingNoteId === application._id}>
                        {savingNoteId === application._id ? "Saving..." : "Save note"}
                      </Button>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {application.status === "submitted" && (
                        <>
                          <Button size="sm" onClick={() => updateSingleStatus(application._id, "shortlisted")}>
                            Shortlist
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => updateSingleStatus(application._id, "rejected")}>
                            Reject
                          </Button>
                        </>
                      )}
                      {application.status === "shortlisted" && (
                        <>
                          <Button size="sm" onClick={() => updateSingleStatus(application._id, "accepted")}>
                            Accept
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => updateSingleStatus(application._id, "rejected")}>
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </article>
                );
              })}
            </section>
          );
        })}
      </section>
    </div>
  );
}
