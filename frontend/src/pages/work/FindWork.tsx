import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { BookmarkPlus, Briefcase, Clock3, Search, Send, Star } from "lucide-react";
import { expertApi, jobApi, savedApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useRouteFlash } from "@/hooks/useRouteFlash";
import type { FormFeedbackState, Job } from "@/types";
import { ProposalComposer } from "@/components/jobs/ProposalComposer";
import { JobBriefDetails, JobBriefSignals } from "@/components/jobs/JobBriefView";
import { FormBanner } from "@/components/forms/FormFeedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  AppPageHeader,
  ContextAside,
  DenseListCard,
  EmptyState,
  FilterToolbar,
  StatStrip,
} from "@/components/layout/PagePrimitives";
import { getFormFeedback } from "@/lib/form-feedback";
import { getJobMarketplaceSummary } from "@/lib/hiring-signals";
import { formatRelativeTime } from "@/lib/utils";

type SortOption = "newest" | "oldest" | "budgetDesc" | "budgetAsc" | "mostDetailed" | "bestFit";

const supportedServerSorts: Record<string, "newest" | "oldest" | "budgetDesc" | "budgetAsc"> = {
  newest: "newest",
  oldest: "oldest",
  budgetDesc: "budgetDesc",
  budgetAsc: "budgetAsc",
};

const isSortOption = (value: string | null): value is SortOption =>
  value === "newest" ||
  value === "oldest" ||
  value === "budgetDesc" ||
  value === "budgetAsc" ||
  value === "mostDetailed" ||
  value === "bestFit";

const seriousnessVariant = (score: number) => {
  if (score >= 70) return "success" as const;
  if (score >= 45) return "warning" as const;
  return "outline" as const;
};

const detailBadge = (tone: "strong" | "mixed" | "weak") => {
  if (tone === "strong") {
    return {
      label: "Strong brief",
      variant: "success" as const,
      cardClassName: "border-emerald-400/25 bg-[linear-gradient(180deg,rgba(16,185,129,0.08),rgba(2,6,23,0.92))]",
    };
  }

  if (tone === "mixed") {
    return {
      label: "Some detail",
      variant: "warning" as const,
      cardClassName: "border-amber-400/20 bg-[linear-gradient(180deg,rgba(245,158,11,0.06),rgba(2,6,23,0.92))]",
    };
  }

  return {
    label: "Needs detail",
    variant: "outline" as const,
    cardClassName: "border-white/10 bg-white/5",
  };
};

export default function FindWork() {
  usePageMeta({
    title: "Find n8n Jobs | n8nExperts",
    description:
      "Browse open n8n automation jobs, save interesting opportunities, and apply with focused proposals on n8nExperts.",
    canonicalPath: "/jobs",
  });

  const flash = useRouteFlash();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [proposalData, setProposalData] = useState({
    bidAmount: "",
    coverLetter: "",
    estimatedDuration: "",
  });
  const [expertSkills, setExpertSkills] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageError, setPageError] = useState("");
  const [applyFeedback, setApplyFeedback] = useState<FormFeedbackState | null>(null);
  const [info, setInfo] = useState("");
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());

  const searchText = searchParams.get("search") || "";
  const skillsFilter = searchParams.get("skills") || "";
  const minBudget = searchParams.get("min") || "";
  const maxBudget = searchParams.get("max") || "";
  const sortFilter: SortOption = isSortOption(searchParams.get("sort")) ? (searchParams.get("sort") as SortOption) : "newest";
  const focusedJobId = searchParams.get("jobId") || "";

  const updateSearch = (patch: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (!value || value === "all") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    setSearchParams(next, { replace: true });
  };

  const loadJobs = async () => {
    setIsLoading(true);
    setPageError("");
    try {
      const params: Record<string, string | number> = {
        status: "open",
        limit: 40,
        sort: supportedServerSorts[sortFilter] || "newest",
      };
      if (searchText.trim()) params.search = searchText.trim();
      if (skillsFilter.trim()) params.skills = skillsFilter.trim();
      if (minBudget.trim()) params.min = minBudget.trim();
      if (maxBudget.trim()) params.max = maxBudget.trim();

      const response = await jobApi.getJobs(params);
      setJobs(response.data.jobs);
    } catch (err: unknown) {
      setPageError(getFormFeedback(err, "We could not load jobs right now.")?.summary || "We could not load jobs right now.");
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, skillsFilter, minBudget, maxBudget, sortFilter]);

  useEffect(() => {
    if (!focusedJobId || jobs.length === 0) return;
    const matched = jobs.find((job) => job._id === focusedJobId);
    if (matched) {
      setSelectedJob(matched);
    }
  }, [focusedJobId, jobs]);

  useEffect(() => {
    setProposalData({ bidAmount: "", coverLetter: "", estimatedDuration: "" });
    setApplyFeedback(null);
  }, [selectedJob?._id]);

  useEffect(() => {
    const loadSaved = async () => {
      if (!user || user.role !== "expert") {
        setSavedJobIds(new Set());
        return;
      }

      try {
        const response = await savedApi.getSavedJobs({ limit: 200 });
        setSavedJobIds(new Set(response.data.items.map((item) => item.job._id)));
      } catch {
        setSavedJobIds(new Set());
      }
    };

    loadSaved();
  }, [user]);

  useEffect(() => {
    const loadExpertSignals = async () => {
      if (!user || user.role !== "expert") {
        setExpertSkills([]);
        return;
      }

      try {
        const response = await expertApi.getExpertProfile(user._id);
        setExpertSkills(response.data.expert.skills || []);
      } catch {
        setExpertSkills([]);
      }
    };

    loadExpertSignals();
  }, [user]);

  const jobsWithSummary = useMemo(
    () =>
      jobs.map((job) => ({
        job,
        summary: getJobMarketplaceSummary(job, expertSkills),
      })),
    [expertSkills, jobs]
  );

  const sortedJobs = useMemo(() => {
    const sorted = [...jobsWithSummary];

    sorted.sort((left, right) => {
      if (sortFilter === "oldest") {
        return new Date(left.job.createdAt).getTime() - new Date(right.job.createdAt).getTime();
      }

      if (sortFilter === "budgetDesc") {
        return right.job.budgetAmount - left.job.budgetAmount;
      }

      if (sortFilter === "budgetAsc") {
        return left.job.budgetAmount - right.job.budgetAmount;
      }

      if (sortFilter === "mostDetailed") {
        return (
          right.summary.quality.score - left.summary.quality.score ||
          right.summary.seriousness.score - left.summary.seriousness.score ||
          new Date(right.job.createdAt).getTime() - new Date(left.job.createdAt).getTime()
        );
      }

      if (sortFilter === "bestFit") {
        return (
          right.summary.fit.score - left.summary.fit.score ||
          right.summary.quality.score - left.summary.quality.score ||
          new Date(right.job.createdAt).getTime() - new Date(left.job.createdAt).getTime()
        );
      }

      return new Date(right.job.createdAt).getTime() - new Date(left.job.createdAt).getTime();
    });

    return sorted;
  }, [jobsWithSummary, sortFilter]);

  const selectedJobSummary = useMemo(
    () => (selectedJob ? getJobMarketplaceSummary(selectedJob, expertSkills) : null),
    [expertSkills, selectedJob]
  );

  const strongBriefs = sortedJobs.filter((item) => item.summary.detailTone === "strong").length;
  const seriousClients = sortedJobs.filter((item) => item.summary.seriousness.score >= 70).length;

  const saveCurrentSearch = async () => {
    if (!user || user.role !== "expert") {
      return;
    }

    const suggested = searchText.trim() ? `Jobs: ${searchText.trim()}` : "Open n8n jobs";
    const name = window.prompt("Name this saved search", suggested)?.trim();
    if (!name) return;

    setInfo("");
    setPageError("");
    try {
      await savedApi.createSearch({
        name,
        scope: "jobs",
        filters: {
          status: "open",
          ...(searchText.trim() && { search: searchText.trim() }),
          ...(skillsFilter.trim() && { skills: skillsFilter.trim() }),
          ...(minBudget.trim() && { min: minBudget.trim() }),
          ...(maxBudget.trim() && { max: maxBudget.trim() }),
          ...(sortFilter && { sort: sortFilter }),
        },
        isPinned: false,
      });
      setInfo("Search saved. You can reopen this exact view from Saved Searches.");
    } catch (err: unknown) {
      setPageError(getFormFeedback(err, "We could not save this search right now.")?.summary || "We could not save this search right now.");
    }
  };

  const handleApply = async () => {
    if (!selectedJob) return;

    setIsSubmitting(true);
    setPageError("");
    setApplyFeedback(null);
    setInfo("");
    try {
      await jobApi.applyToJob(selectedJob._id, {
        coverLetter: proposalData.coverLetter.trim(),
        bidAmount: proposalData.bidAmount ? Number(proposalData.bidAmount) : undefined,
        estimatedDuration: proposalData.estimatedDuration.trim() || undefined,
      });
      const appliedTitle = selectedJob.title;
      setSelectedJob(null);
      updateSearch({ jobId: "" });
      setProposalData({ bidAmount: "", coverLetter: "", estimatedDuration: "" });
      setInfo(`Proposal sent for ${appliedTitle}. Open My Applications to track the client response.`);
    } catch (err: unknown) {
      setApplyFeedback(getFormFeedback(err, "We could not submit this proposal. Please review the highlighted fields and try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSavedJob = async (jobId: string) => {
    setPageError("");
    try {
      if (savedJobIds.has(jobId)) {
        await savedApi.unsaveJob(jobId);
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
        setInfo("Job removed from your short list.");
      } else {
        await savedApi.saveJob(jobId);
        setSavedJobIds((prev) => new Set([...prev, jobId]));
        setInfo("Job saved so you can come back with a stronger proposal later.");
      }
    } catch (err: unknown) {
      setPageError(getFormFeedback(err, "We could not update your saved jobs right now.")?.summary || "We could not update your saved jobs right now.");
    }
  };

  const updateProposalField = (field: keyof typeof proposalData, value: string) => {
    if (applyFeedback) {
      setApplyFeedback(null);
    }
    setProposalData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container py-8">
      <AppPageHeader
        eyebrow={
          <>
            <Briefcase className="h-4 w-4" />
            Expert workspace
          </>
        }
        title="Find Work"
        description="Sort for detail, filter for fit, and apply with a proposal that sounds specific to the job in front of you."
      >
        <StatStrip
          items={[
            { label: "Results", value: sortedJobs.length, hint: "Open jobs in the current view." },
            { label: "Strong briefs", value: strongBriefs, hint: "Jobs with the clearest structured scope." },
            { label: "Serious clients", value: seriousClients, hint: "Brief quality plus visible hiring proof." },
            {
              label: "Best-fit basis",
              value: expertSkills.length > 0 ? `${expertSkills.length} profile skills` : "Structured brief",
              hint: "Best fit uses your skills when available, then falls back to the brief.",
            },
          ]}
        />
      </AppPageHeader>

      {flash && (
        <div
          className={`mt-6 rounded-lg px-3 py-2 text-sm ${
            flash.tone === "success"
              ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
              : flash.tone === "error"
                ? "border border-red-500/20 bg-red-500/10 text-red-200"
                : "border border-sky-500/20 bg-sky-500/10 text-sky-200"
          }`}
        >
          {flash.text}
        </div>
      )}

      <FilterToolbar
        className="mt-6"
        title="Filter jobs"
        description="Use a few simple filters, then switch between newest, most detailed, or best fit without waiting on a new ranking service."
        actions={
          user?.role === "expert" ? (
            <>
              <Button size="sm" variant="outline" onClick={saveCurrentSearch}>
                <BookmarkPlus className="h-4 w-4 mr-1" />
                Save search
              </Button>
              <Link to="/saved-searches" className="text-xs text-sky-300 hover:underline">
                Manage saved searches
              </Link>
            </>
          ) : null
        }
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="relative xl:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              className="pl-10"
              placeholder="Search jobs by title, stack, or integration..."
              value={searchText}
              onChange={(event) => updateSearch({ search: event.target.value })}
            />
          </div>
          <Input placeholder="Skills (comma separated)" value={skillsFilter} onChange={(event) => updateSearch({ skills: event.target.value })} />
          <Input placeholder="Min budget" value={minBudget} onChange={(event) => updateSearch({ min: event.target.value })} />
          <div className="flex gap-2">
            <Input placeholder="Max budget" value={maxBudget} onChange={(event) => updateSearch({ max: event.target.value })} />
            <select
              aria-label="Sort jobs"
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm text-white"
              value={sortFilter}
              onChange={(event) => updateSearch({ sort: event.target.value })}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="budgetDesc">High budget</option>
              <option value="budgetAsc">Low budget</option>
              <option value="mostDetailed">Most detailed</option>
              <option value="bestFit">Best fit</option>
            </select>
          </div>
        </div>
        {info && (
          <p className="mt-2 text-xs text-emerald-300">
            {info}{" "}
            {info.includes("My Applications") && (
              <Link to="/my-applications" className="font-semibold text-emerald-200 underline underline-offset-4">
                Open My Applications
              </Link>
            )}
          </p>
        )}
        <p className="mt-3 text-xs text-[var(--color-text-muted)]">
          Most detailed and best fit are client-side sorts based on the structured brief, visible client history, and your current expert skills when available.
        </p>
      </FilterToolbar>

      <FormBanner message={pageError} className="mb-4" />

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-4">
          {isLoading && <p className="text-slate-300">Loading jobs...</p>}
          {!isLoading && sortedJobs.length === 0 && (
            <EmptyState
              title="No jobs match these filters."
              description="Try clearing one or two filters, or switch back to newest so you can widen the search before new jobs come in."
              action={
                <Button variant="outline" size="sm" onClick={() => setSearchParams(new URLSearchParams(), { replace: true })}>
                  Clear filters
                </Button>
              }
            />
          )}

          {sortedJobs.map(({ job, summary }) => {
            const client = typeof job.clientId === "string" ? null : job.clientId;
            const detail = detailBadge(summary.detailTone);

            return (
              <DenseListCard key={job._id} className={`transition hover:border-[var(--color-border-hover)] ${detail.cardClassName}`}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedJob(job);
                    updateSearch({ jobId: job._id });
                  }}
                  className="w-full text-left"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={detail.variant}>{detail.label}</Badge>
                        <Badge variant={seriousnessVariant(summary.seriousness.score)}>{summary.seriousness.label}</Badge>
                        {summary.fit.overlap.length > 0 && (
                          <Badge variant="secondary">
                            {summary.fit.overlap.length} shared skill{summary.fit.overlap.length === 1 ? "" : "s"}
                          </Badge>
                        )}
                      </div>
                      <h2 className="text-lg font-bold text-white">{job.title}</h2>
                      <p className="text-sm text-slate-300 line-clamp-3">{job.description}</p>
                    </div>
                    <Badge variant="outline">{job.visibility}</Badge>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
                    <JobBriefSignals job={job} showScore />
                    {summary.fit.overlap.map((skill) => (
                      <Badge key={`${job._id}-${skill}`} variant="secondary" className="capitalize">
                        Match: {skill}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-3 rounded-xl border border-white/10 bg-black/10 p-3">
                    <p className="text-sm font-medium text-white">{summary.seriousness.summary}</p>
                    <p className="mt-1 text-xs text-slate-400">{summary.fit.summary}</p>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                    <p className="font-semibold text-primary">
                      ${job.budgetAmount} {job.budgetType === "hourly" ? "/hr" : "fixed"}
                    </p>
                    <p className="inline-flex items-center gap-1 text-slate-400">
                      <Clock3 className="h-4 w-4" />
                      {formatRelativeTime(job.createdAt)}
                    </p>
                    {sortFilter === "bestFit" && <p className="text-slate-300">Fit score {summary.fit.score}</p>}
                    {sortFilter === "mostDetailed" && <p className="text-slate-300">Detail score {summary.quality.score}</p>}
                  </div>
                </button>

                {user?.role === "expert" && (
                  <div className="mt-3">
                    <Button size="sm" variant="outline" onClick={() => toggleSavedJob(job._id)}>
                      <Star className={`h-4 w-4 mr-1 ${savedJobIds.has(job._id) ? "fill-current text-amber-300" : ""}`} />
                      {savedJobIds.has(job._id) ? "Starred for later" : "Star job for later"}
                    </Button>
                  </div>
                )}

                {client && (
                  <div className="mt-3 border-t border-white/10 pt-3 text-xs text-slate-400">
                    <div className="flex flex-wrap items-center gap-2">
                      <span>Client: {client.companyName || client.username}</span>
                      <Link to={`/clients/${client._id}`} className="text-sky-300 hover:underline">
                        View client profile
                      </Link>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {summary.seriousness.signals
                        .filter((signal) => signal.present)
                        .slice(0, 3)
                        .map((signal) => (
                          <Badge key={`${job._id}-${signal.key}`} variant="secondary">
                            {signal.detail}
                          </Badge>
                        ))}
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-white/5 p-2 sm:grid-cols-4">
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
                        Avg response:{" "}
                        <span className="font-semibold text-white">
                          {client.avgClientResponseHours ? `${client.avgClientResponseHours}h` : "New"}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </DenseListCard>
            );
          })}
        </div>

        <ContextAside
          eyebrow="How to sort"
          title="Use detail first, then decide if the fit is real."
          description="A strong application starts by checking whether the brief is specific enough to support a serious conversation."
          className="h-fit xl:sticky"
          style={{ top: "calc(var(--chrome-sticky-offset) + 0.5rem)" }}
        >
          <div className="space-y-3 text-sm text-[var(--color-text-secondary)]">
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="font-semibold text-white">Most detailed</p>
              <p className="mt-2">This sort rewards outcome, systems, constraints, deliverables, and timing signals already present in the brief.</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="font-semibold text-white">Best fit</p>
              <p className="mt-2">This combines brief strength with direct overlap against your current expert skills when we have them.</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="font-semibold text-white">Proposal rule</p>
              <p className="mt-2">If the client brief still feels thin, qualify the scope in your proposal instead of pretending the work is already fully defined.</p>
            </div>
          </div>
        </ContextAside>
      </div>

      <Sheet
        open={Boolean(selectedJob)}
        onOpenChange={(open) => {
          if (open) return;
          setSelectedJob(null);
          updateSearch({ jobId: "" });
        }}
      >
        <SheetContent className="overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{selectedJob?.title}</SheetTitle>
            <SheetDescription>
              Write a proposal that references this client&apos;s outcome, systems, risks, and timing instead of sending a generic introduction.
            </SheetDescription>
          </SheetHeader>

          {selectedJob && (
            <div className="mt-6 space-y-5">
              {user?.role === "expert" && (
                <div className="flex items-center justify-end">
                  <Button size="sm" variant="outline" onClick={() => toggleSavedJob(selectedJob._id)}>
                    <Star className={`h-4 w-4 mr-1 ${savedJobIds.has(selectedJob._id) ? "fill-current text-amber-300" : ""}`} />
                    {savedJobIds.has(selectedJob._id) ? "Starred for later" : "Star for later"}
                  </Button>
                </div>
              )}

              <div className="rounded-xl border border-white/10 bg-[var(--color-bg-elevated)] p-4 text-sm text-slate-300">
                <div className="flex flex-wrap gap-2">
                  {selectedJobSummary && (
                    <>
                      <Badge variant={detailBadge(selectedJobSummary.detailTone).variant}>{detailBadge(selectedJobSummary.detailTone).label}</Badge>
                      <Badge variant={seriousnessVariant(selectedJobSummary.seriousness.score)}>{selectedJobSummary.seriousness.label}</Badge>
                      {selectedJobSummary.fit.overlap.length > 0 && (
                        <Badge variant="secondary">{selectedJobSummary.fit.overlap.join(", ")}</Badge>
                      )}
                    </>
                  )}
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Overview</p>
                <p className="mt-2">{selectedJob.description}</p>
                <p className="mt-3 font-semibold text-primary">
                  Budget: ${selectedJob.budgetAmount} {selectedJob.budgetType === "hourly" ? "/hr" : "fixed"}
                </p>
                <JobBriefSignals job={selectedJob} className="mt-3" />
                {typeof selectedJob.clientId !== "string" && (
                  <div className="mt-3 text-xs text-slate-400">
                    <p>
                      Client: {selectedJob.clientId.companyName || selectedJob.clientId.username}
                      <Link to={`/clients/${selectedJob.clientId._id}`} className="ml-2 text-sky-300 hover:underline">
                        Open profile
                      </Link>
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-white/5 p-2">
                      <p>
                        Jobs posted: <span className="font-semibold text-white">{selectedJob.clientId.jobsPostedCount ?? 0}</span>
                      </p>
                      <p>
                        Completed: <span className="font-semibold text-white">{selectedJob.clientId.jobsCompletedCount ?? 0}</span>
                      </p>
                      <p>
                        Hires: <span className="font-semibold text-white">{selectedJob.clientId.hiresCount ?? 0}</span>
                      </p>
                      <p>
                        Avg response:{" "}
                        <span className="font-semibold text-white">
                          {selectedJob.clientId.avgClientResponseHours ? `${selectedJob.clientId.avgClientResponseHours}h` : "New"}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {selectedJob.brief && <JobBriefDetails brief={selectedJob.brief} />}

              {!user || user.role !== "expert" ? (
                <div className="rounded-xl border border-sky-400/20 bg-sky-500/10 p-4 text-sm text-sky-100">
                  Browse the job here, then switch into an expert account when you are ready to apply.
                </div>
              ) : (
                <ProposalComposer
                  key={selectedJob._id}
                  job={selectedJob}
                  coverLetter={proposalData.coverLetter}
                  onCoverLetterChange={(coverLetter) => updateProposalField("coverLetter", coverLetter)}
                  bidAmount={proposalData.bidAmount}
                  onBidAmountChange={(bidAmount) => updateProposalField("bidAmount", bidAmount)}
                  estimatedDuration={proposalData.estimatedDuration}
                  onEstimatedDurationChange={(estimatedDuration) => updateProposalField("estimatedDuration", estimatedDuration)}
                  feedback={applyFeedback}
                />
              )}
            </div>
          )}

          <SheetFooter className="mt-6">
            <Button
              className="w-full"
              onClick={handleApply}
              disabled={!user || user.role !== "expert" || proposalData.coverLetter.trim().length < 30 || isSubmitting}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Submitting..." : user?.role === "expert" ? "Send proposal" : "Log in as expert to apply"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
