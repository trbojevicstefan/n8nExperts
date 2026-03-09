import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckSquare, Star, Square } from "lucide-react";
import { applicationApi, jobApi, reviewApi } from "@/lib/api";
import type { Job, JobApplication, JobApplicationsResponse } from "@/types";
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

const emptyCounts: JobApplicationsResponse["countsByStatus"] = {
  submitted: 0,
  shortlisted: 0,
  accepted: 0,
  rejected: 0,
};

const isPipelineStatus = (value: string | null): value is PipelineStatus =>
  value === "submitted" || value === "shortlisted" || value === "accepted" || value === "rejected";

const isPipelineFilter = (value: string | null): value is PipelineFilter => value === "all" || isPipelineStatus(value);

export default function MyJobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [countsByStatus, setCountsByStatus] = useState<JobApplicationsResponse["countsByStatus"]>(emptyCounts);
  const [loading, setLoading] = useState(true);
  const [appLoading, setAppLoading] = useState(false);
  const [error, setError] = useState("");
  const [reviewedJobIds, setReviewedJobIds] = useState<string[]>([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);
  const [selectedApplicationIds, setSelectedApplicationIds] = useState<string[]>([]);
  const [batchProcessing, setBatchProcessing] = useState(false);
  const initialJobIdFromQuery = searchParams.get("jobId");

  usePageMeta({
    title: "My Jobs | n8nExperts",
    description: "Review posted jobs, track job states, manage applicants, and move accepted work through a cleaner client workflow.",
    canonicalPath: "/my-jobs",
  });

  const selectedJob = useMemo(() => jobs.find((job) => job._id === selectedJobId) || null, [jobs, selectedJobId]);

  const statusFilter: PipelineFilter = isPipelineFilter(searchParams.get("status")) ? (searchParams.get("status") as PipelineFilter) : "all";
  const sourceFilter = searchParams.get("source") || "all";
  const sortFilter: SortOption =
    (searchParams.get("sort") as SortOption | null) &&
    ["newest", "oldest", "highestBid", "lowestBid", "updated"].includes(searchParams.get("sort") || "")
      ? (searchParams.get("sort") as SortOption)
      : "newest";
  const queryFilter = searchParams.get("q") || "";

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

  const loadJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await jobApi.getMyJobs();
      setJobs(response.data);
      if (response.data.length > 0) {
        const validInitialId = response.data.some((job) => job._id === initialJobIdFromQuery) ? initialJobIdFromQuery : null;
        if (!selectedJobId) {
          setSelectedJobId(validInitialId || response.data[0]._id);
        }
      }

      const reviewsResponse = await reviewApi.getMine();
      const reviewedIds = reviewsResponse.data.asClient
        .map((review) => (typeof review.jobId === "string" ? review.jobId : review.jobId._id))
        .filter(Boolean);
      setReviewedJobIds(reviewedIds);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async (jobId: string) => {
    setAppLoading(true);
    setError("");
    try {
      const params: Record<string, string | number> = {
        limit: statusFilter === "all" ? 120 : 40,
        sort: sortFilter,
      };
      if (statusFilter !== "all") params.status = statusFilter;
      if (sourceFilter !== "all") params.source = sourceFilter;
      if (queryFilter.trim()) params.q = queryFilter.trim();

      const response = await jobApi.getJobApplications(jobId, params);
      setApplications(response.data.applications);
      setCountsByStatus(response.data.countsByStatus || emptyCounts);
      setSelectedApplicationIds([]);
      setNoteDrafts((prev) => {
        const next = { ...prev };
        response.data.applications.forEach((application) => {
          if (next[application._id] === undefined) {
            next[application._id] = application.clientNote || "";
          }
        });
        return next;
      });
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to load applications.");
      setApplications([]);
      setCountsByStatus(emptyCounts);
    } finally {
      setAppLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedJobId) {
      setApplications([]);
      return;
    }

    const timeout = window.setTimeout(() => {
      loadApplications(selectedJobId);
    }, 150);

    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedJobId, statusFilter, sourceFilter, sortFilter, queryFilter]);

  const setJobStatus = async (jobId: string, status: Job["status"]) => {
    setError("");
    try {
      await jobApi.updateJobStatus(jobId, status);
      await loadJobs();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to update job.");
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: JobApplication["status"]) => {
    setError("");
    try {
      await applicationApi.updateStatus(applicationId, status);
      if (selectedJobId) await loadApplications(selectedJobId);
      await loadJobs();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to update application.");
    }
  };

  const runBatchStatusUpdate = async (targetStatus: JobApplication["status"]) => {
    if (selectedApplicationIds.length === 0 || !selectedJobId) return;

    const selectableIds = selectedApplicationIds.filter((id) => {
      const found = applications.find((application) => application._id === id);
      if (!found) return false;
      if (targetStatus === "accepted") {
        return found.status === "shortlisted";
      }
      if (targetStatus === "shortlisted") {
        return found.status === "submitted";
      }
      if (targetStatus === "rejected") {
        return found.status === "submitted" || found.status === "shortlisted";
      }
      return false;
    });

    if (selectableIds.length === 0) {
      setError(`No selected applications can transition to ${targetStatus}.`);
      return;
    }

    setBatchProcessing(true);
    setError("");
    try {
      await Promise.all(selectableIds.map((applicationId) => applicationApi.updateStatus(applicationId, targetStatus)));
      await loadApplications(selectedJobId);
      await loadJobs();
      setSelectedApplicationIds([]);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Batch status update failed.");
    } finally {
      setBatchProcessing(false);
    }
  };

  const saveClientNote = async (applicationId: string) => {
    setError("");
    setSavingNoteId(applicationId);
    try {
      await applicationApi.updateNote(applicationId, (noteDrafts[applicationId] || "").trim());
      if (selectedJobId) {
        await loadApplications(selectedJobId);
      }
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to save note.");
    } finally {
      setSavingNoteId(null);
    }
  };

  const submitReview = async () => {
    if (!selectedJob) return;
    setError("");
    try {
      await jobApi.createReview(selectedJob._id, { rating: reviewForm.rating, comment: reviewForm.comment.trim() || undefined });
      setReviewedJobIds((prev) => [...prev, selectedJob._id]);
      setReviewForm({ rating: 5, comment: "" });
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to submit review.");
    }
  };

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

  const jobSummary = useMemo(() => {
    return jobs.reduce(
      (acc, job) => {
        acc.total += 1;
        if (job.status === "open") acc.open += 1;
        if (job.status === "in_progress") acc.inProgress += 1;
        if (job.status === "completed") acc.completed += 1;
        return acc;
      },
      { total: 0, open: 0, inProgress: 0, completed: 0 }
    );
  }, [jobs]);

  const trackedJobs = useMemo(() => jobs.filter((job) => job.status === "in_progress" || job.status === "completed"), [jobs]);

  const toggleSelection = (applicationId: string) => {
    setSelectedApplicationIds((prev) =>
      prev.includes(applicationId) ? prev.filter((id) => id !== applicationId) : [...prev, applicationId]
    );
  };

  const toggleAllForSection = (sectionStatus: PipelineStatus) => {
    const sectionIds = groupedApplications[sectionStatus].map((item) => item._id);
    if (sectionIds.length === 0) return;

    const allSelected = sectionIds.every((id) => selectedApplicationIds.includes(id));
    if (allSelected) {
      setSelectedApplicationIds((prev) => prev.filter((id) => !sectionIds.includes(id)));
      return;
    }

    setSelectedApplicationIds((prev) => Array.from(new Set([...prev, ...sectionIds])));
  };

  return (
    <div className="container py-8">
      <AppPageHeader
        eyebrow="Client workflow"
        title="My Jobs"
        description="Keep job health, applicant review, and the transition into active work visible without mixing everything into one dense surface."
      >
        <StatStrip
          items={[
            { label: "Total jobs", value: jobSummary.total },
            { label: "Open", value: jobSummary.open },
            { label: "In progress", value: jobSummary.inProgress },
          ]}
        />
      </AppPageHeader>

      {error && <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200 mb-5">{error}</div>}

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <aside className="panel p-5">
          <h2 className="text-sm uppercase tracking-[0.16em] text-sky-300 font-bold">Posted Jobs</h2>
          <div className="mt-4 space-y-2">
            {loading && <p className="text-sm text-slate-300">Loading jobs...</p>}
            {!loading && jobs.length === 0 && <EmptyState title="No jobs posted yet." className="py-4" />}
            {jobs.map((job) => (
              <button
                key={job._id}
                onClick={() => {
                  setSelectedJobId(job._id);
                  updateSearch({ jobId: job._id });
                }}
                className={`w-full text-left rounded-lg border px-3 py-3 transition ${
                  selectedJobId === job._id ? "border-primary bg-primary/10" : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <p className="font-semibold text-white">{job.title}</p>
                <p className="mt-1 text-xs text-slate-400">
                  ${job.budgetAmount} {job.budgetType} | {job.status}
                </p>
              </button>
            ))}
          </div>
          <div className="mt-6 border-t border-white/10 pt-4">
            <h3 className="text-xs uppercase tracking-[0.16em] text-slate-400 font-bold">Accepted / Started</h3>
            <div className="mt-3 space-y-2">
              {trackedJobs.length === 0 && <p className="text-xs text-slate-400">No accepted jobs in progress yet.</p>}
              {trackedJobs.map((job) => (
                <button
                  key={`tracked-${job._id}`}
                  onClick={() => {
                    setSelectedJobId(job._id);
                    updateSearch({ jobId: job._id });
                  }}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left hover:bg-white/10"
                >
                  <p className="text-xs font-semibold text-white line-clamp-1">{job.title}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-wider text-slate-400">{job.status === "in_progress" ? "Started" : "Completed"}</p>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="panel p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white">Applicant Pipeline</h2>
              {selectedJob && <p className="mt-1 text-sm text-slate-400">Review the selected job and move applicants through the next decision.</p>}
            </div>
            <Link to="/my-jobs/pipeline" className="text-xs font-semibold text-sky-300 hover:underline">
              Open cross-job pipeline
            </Link>
            {selectedJob && (
              <div className="flex items-center gap-2">
                <Badge variant="outline">{selectedJob.status}</Badge>
                {selectedJob.status === "in_progress" && (
                  <Button size="sm" onClick={() => setJobStatus(selectedJob._id, "completed")}>
                    Mark Completed
                  </Button>
                )}
                {selectedJob.status !== "closed" && (
                  <Button size="sm" variant="outline" onClick={() => setJobStatus(selectedJob._id, "closed")}>
                    Close Job
                  </Button>
                )}
              </div>
            )}
          </div>

          {selectedJob && (
            <FilterToolbar className="mt-4" title="Filter this job's applicant queue">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="app-search">Search applications</Label>
                  <Input
                    id="app-search"
                    value={queryFilter}
                    onChange={(event) => updateSearch({ q: event.target.value })}
                    placeholder="Search by cover letter or expert profile"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status-view">Status view</Label>
                  <select
                    id="status-view"
                    aria-label="Status view"
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
                  <Label htmlFor="source-view">Source</Label>
                  <select
                    id="source-view"
                    aria-label="Source view"
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
                  <Label htmlFor="sort-view">Sort</Label>
                  <select
                    id="sort-view"
                    aria-label="Sort applications"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-white"
                    value={sortFilter}
                    onChange={(event) => updateSearch({ sort: event.target.value })}
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="highestBid">Highest bid</option>
                    <option value="lowestBid">Lowest bid</option>
                    <option value="updated">Recently updated</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {pipelineStatuses.map((status) => (
                  <Badge key={status} variant={statusFilter === status ? "default" : "secondary"}>
                    {statusLabel[status]} ({countsByStatus[status] || 0})
                  </Badge>
                ))}
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-3 flex flex-wrap gap-2 items-center">
                <p className="text-sm text-slate-300">Selected: {selectedApplicationIds.length}</p>
                <Button size="sm" variant="outline" disabled={batchProcessing || selectedApplicationIds.length === 0} onClick={() => runBatchStatusUpdate("shortlisted")}>
                  Batch Shortlist
                </Button>
                <Button size="sm" variant="outline" disabled={batchProcessing || selectedApplicationIds.length === 0} onClick={() => runBatchStatusUpdate("accepted")}>
                  Batch Accept
                </Button>
                <Button size="sm" variant="outline" disabled={batchProcessing || selectedApplicationIds.length === 0} onClick={() => runBatchStatusUpdate("rejected")}>
                  Batch Reject
                </Button>
              </div>
            </FilterToolbar>
          )}

          <div className="mt-5 space-y-5">
            {!selectedJob && <EmptyState title="Select a job to review applications." className="py-4" />}
            {selectedJob && appLoading && <p className="text-sm text-slate-300">Loading applications...</p>}

            {selectedJob &&
              selectedJob.status === "completed" &&
              !reviewedJobIds.includes(selectedJob._id) &&
              applications.some((application) => application.status === "accepted") && (
                <article className="rounded-xl border border-amber-300/20 bg-amber-300/10 p-4">
                  <h3 className="text-sm font-semibold text-white">Leave a review for the accepted expert</h3>
                  <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Review rating">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        className={`rounded-lg border px-3 py-1 text-xs font-bold transition ${
                          reviewForm.rating >= value ? "border-primary bg-primary/20 text-white" : "border-white/10 text-slate-300"
                        }`}
                        onClick={() => setReviewForm((prev) => ({ ...prev, rating: value }))}
                      >
                        <Star className="inline h-3.5 w-3.5 mr-1" />
                        {value}
                      </button>
                    ))}
                  </div>
                  <Textarea
                    className="mt-3 min-h-[110px]"
                    placeholder="Share quality, communication, and delivery feedback."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                  />
                  <Button className="mt-3" onClick={submitReview}>
                    Submit Review
                  </Button>
                </article>
              )}

            {selectedJob && !appLoading && applications.length === 0 && (
              <p className="text-sm text-slate-300">No applications match the current filters.</p>
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
                        aria-label={`Toggle select all ${statusLabel[sectionStatus]} applications`}
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
                    const noteValue = noteDrafts[application._id] ?? application.clientNote ?? "";
                    const isSelected = selectedApplicationIds.includes(application._id);

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
                                {expert?.headline || "n8n Specialist"}
                                {expert?.hourlyRate ? ` | $${expert.hourlyRate}/hr` : ""}
                              </p>
                              {expert?._id && (
                                <Link className="mt-2 inline-block text-xs text-sky-300 hover:underline" to={`/experts/${expert._id}`}>
                                  View profile
                                </Link>
                              )}
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <Badge variant="outline">{statusLabel[application.status]}</Badge>
                            <p className="text-[11px] uppercase tracking-wider text-slate-500">{application.source || "direct"}</p>
                          </div>
                        </div>

                        <p className="text-sm text-slate-200 mt-3 whitespace-pre-wrap">{application.coverLetter}</p>

                        <div className="mt-3 text-xs text-slate-400 flex flex-wrap gap-4">
                          {application.bidAmount ? <span>Bid: ${application.bidAmount}</span> : <span>Bid: not provided</span>}
                          {application.estimatedDuration && <span>ETA: {application.estimatedDuration}</span>}
                          {application.statusChangedAt && <span>Updated: {new Date(application.statusChangedAt).toLocaleString()}</span>}
                        </div>

                        <div className="mt-3 space-y-2">
                          <Label htmlFor={`note-${application._id}`}>Private note</Label>
                          <Textarea
                            id={`note-${application._id}`}
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
                          <Button size="sm" variant="outline" onClick={() => saveClientNote(application._id)} disabled={savingNoteId === application._id}>
                            {savingNoteId === application._id ? "Saving..." : "Save note"}
                          </Button>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {application.status === "submitted" && (
                            <>
                              <Button size="sm" onClick={() => updateApplicationStatus(application._id, "shortlisted")}>
                                Shortlist
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => updateApplicationStatus(application._id, "rejected")}>
                                Reject
                              </Button>
                            </>
                          )}
                          {application.status === "shortlisted" && (
                            <>
                              <Button size="sm" onClick={() => updateApplicationStatus(application._id, "accepted")}>
                                Accept
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => updateApplicationStatus(application._id, "rejected")}>
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
          </div>
        </section>
      </div>
    </div>
  );
}
