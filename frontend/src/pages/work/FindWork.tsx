import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { BadgeCheck, BookmarkPlus, Briefcase, Clock3, DollarSign, Search, Send, ShieldCheck, SlidersHorizontal, Star } from "lucide-react";
import { expertApi, jobApi, savedApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useRouteFlash } from "@/hooks/useRouteFlash";
import type { FormFeedbackState, Job } from "@/types";
import { ProposalComposer } from "@/components/jobs/ProposalComposer";
import { JobBriefDetails } from "@/components/jobs/JobBriefView";
import { FormBanner } from "@/components/forms/FormFeedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EmptyState } from "@/components/layout/PagePrimitives";
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

  const openJobDetails = (job: Job) => {
    setSelectedJob(job);
    updateSearch({ jobId: job._id });
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
    <div className="container page-stack py-6 md:py-8">
      <div className="flex gap-6 w-full">
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="context-aside sticky top-[var(--chrome-sticky-offset)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">Filters</p>
                <h2 className="mt-2 text-lg font-black text-white">Find jobs</h2>
              </div>
              <SlidersHorizontal className="h-5 w-5 text-[var(--color-accent-cool)]" />
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <label className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]" htmlFor="jobs-search-side">
                  Search jobs
                </label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
                  <Input
                    id="jobs-search-side"
                    className="h-11 rounded-2xl border-white/10 bg-black/25 pl-10 text-sm text-white placeholder:text-slate-600 focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    placeholder="n8n, webhook, CRM..."
                    value={searchText}
                    onChange={(event) => updateSearch({ search: event.target.value })}
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Budget</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Input
                    className="h-11 rounded-2xl border-white/10 bg-black/25 text-sm text-white placeholder:text-slate-600 focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    placeholder="Min $"
                    inputMode="numeric"
                    value={minBudget}
                    onChange={(event) => updateSearch({ min: event.target.value })}
                  />
                  <Input
                    className="h-11 rounded-2xl border-white/10 bg-black/25 text-sm text-white placeholder:text-slate-600 focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    placeholder="Max $"
                    inputMode="numeric"
                    value={maxBudget}
                    onChange={(event) => updateSearch({ max: event.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]" htmlFor="jobs-skills-side">
                  Skills
                </label>
                <Input
                  id="jobs-skills-side"
                  className="mt-2 h-11 rounded-2xl border-white/10 bg-black/25 text-sm text-white placeholder:text-slate-600 focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  placeholder="Comma separated"
                  value={skillsFilter}
                  onChange={(event) => updateSearch({ skills: event.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]" htmlFor="jobs-sort-side">
                  Sort
                </label>
                <select
                  id="jobs-sort-side"
                  className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-black/25 px-3 text-sm font-bold text-white outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-glow)] [&>option]:bg-[#101624]"
                  value={sortFilter}
                  onChange={(event) => updateSearch({ sort: event.target.value })}
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="budgetDesc">Budget high to low</option>
                  <option value="budgetAsc">Budget low to high</option>
                  <option value="mostDetailed">Most detailed</option>
                  <option value="bestFit">Best fit</option>
                </select>
              </div>

              <div className="grid gap-2 border-t border-white/10 pt-5">
                {user?.role === "expert" && (
                  <Button size="sm" variant="outline" onClick={saveCurrentSearch} className="w-full rounded-full">
                    <BookmarkPlus className="mr-1 h-4 w-4" />
                    Save search
                  </Button>
                )}
                <button type="button" className="text-sm font-bold text-[var(--color-text-muted)] transition hover:text-white" onClick={() => setSearchParams(new URLSearchParams(), { replace: true })}>
                  Clear all filters
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Job Feed Content */}
        <div className="flex-1 min-w-0 max-w-3xl xl:max-w-4xl mx-auto w-full">
          <div className="mb-8 text-center xl:text-left">
            <p className="eyebrow">Job marketplace</p>
            <h1 className="mt-4 mb-2 text-3xl font-bold text-white md:text-4xl">Jobs you might like</h1>
            <p className="text-slate-400 text-base">Browse serious n8n briefs, compare client signals, and apply with a focused proposal.</p>
          </div>

          {flash && (
            <div
              className={`mb-6 rounded-xl px-4 py-3 text-sm font-semibold border ${
                flash.tone === "success"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : flash.tone === "error"
                    ? "border-red-500/30 bg-red-500/10 text-red-300"
                    : "border-sky-500/30 bg-sky-500/10 text-sky-300"
              }`}
            >
              {flash.text}
            </div>
          )}

          {/* Filters / Search Bar (Replaces PagePrimitives components to match Stitch) */}
          <div className="mb-8 p-4 rounded-xl border border-white/10 bg-white/5 space-y-4 lg:hidden">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  className="pl-10 bg-white/5 border-white/10 text-white rounded-xl focus:ring-primary focus:border-transparent h-10 w-full"
                  placeholder="Search projects..."
                  value={searchText}
                  onChange={(event) => updateSearch({ search: event.target.value })}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400 whitespace-nowrap">Sort:</span>
                <select
                  aria-label="Sort jobs"
                  className="bg-transparent border-none text-sm font-semibold focus:ring-0 p-0 pr-4 cursor-pointer text-primary appearance-none [&>option]:bg-[#1e1e1e]"
                  value={sortFilter}
                  onChange={(event) => updateSearch({ sort: event.target.value })}
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="budgetDesc">Budget: High to Low</option>
                  <option value="budgetAsc">Budget: Low to High</option>
                  <option value="mostDetailed">Most Detailed</option>
                  <option value="bestFit">Best Fit</option>
                </select>
              </div>

              {user?.role === "expert" && (
                <Button size="sm" variant="outline" onClick={saveCurrentSearch} className="rounded-md border-white/20 bg-white/5 hover:bg-white/10 ml-auto whitespace-nowrap">
                  <BookmarkPlus className="h-4 w-4 mr-1" />
                  Save search
                </Button>
              )}
            </div>
            
            {info && (
              <p className="text-xs text-emerald-400 px-2">
                {info}{" "}
                {info.includes("My Applications") && (
                  <Link to="/my-applications" className="font-bold underline underline-offset-4">
                    Open My Applications
                  </Link>
                )}
              </p>
            )}
          </div>

          <FormBanner message={pageError} className="mb-4" />

          {/* Feed List */}
          <div className="space-y-5">
            {isLoading && <p className="text-slate-400 text-center py-10 font-medium">Loading projects...</p>}
            
            {!isLoading && sortedJobs.length === 0 && (
              <EmptyState
                title="No jobs match these filters."
                description="Try clearing one or two filters, or switch back to newest."
                action={
                  <Button variant="outline" size="sm" onClick={() => setSearchParams(new URLSearchParams(), { replace: true })}>
                    Clear filters
                  </Button>
                }
              />
            )}

            {sortedJobs.map(({ job, summary }) => {
              const client = typeof job.clientId === "string" ? null : job.clientId;
              
              return (
                <article
                  key={job._id}
                  role="button"
                  tabIndex={0}
                  aria-label={`View details for ${job.title}`}
                  onClick={() => openJobDetails(job)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openJobDetails(job);
                    }
                  }}
                  className="group dense-list-card p-6 hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden"
                >
                  {/* Highlight bar for 'best fits' or 'strong briefs' */}
                  {(summary.detailTone === "strong" || summary.fit.score > 70) && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  )}
                  
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors text-balance mr-2">{job.title}</h3>
                        {client && client.hiresCount && client.hiresCount > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-black text-emerald-300">
                            <BadgeCheck className="h-3.5 w-3.5" />
                            Payment verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-slate-400">
                            New client
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-400 font-medium">
                        <span className="flex items-center gap-1.5 border border-white/10 bg-white/5 px-2 py-0.5 rounded-full text-xs">
                          <Clock3 className="h-3 w-3" /> Posted {formatRelativeTime(job.createdAt)}
                        </span>
                        {summary.detailTone === "strong" && (
                          <span className="flex items-center gap-1.5 border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full text-xs">
                            <ShieldCheck className="h-3 w-3" />
                            Detailed brief
                          </span>
                        )}
                        {summary.fit.overlap.length > 0 && (
                          <span className="flex items-center gap-1.5 border border-sky-500/20 bg-sky-500/10 text-sky-300 px-2 py-0.5 rounded-full text-xs cursor-help" title={`Matches: ${summary.fit.overlap.join(", ")}`}>
                            {summary.fit.overlap.length} skill match
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-right sm:min-w-36">
                      <p className="flex items-center justify-end gap-1 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                        <DollarSign className="h-3.5 w-3.5 text-emerald-300" />
                        Budget
                      </p>
                      <p className="mt-1 text-xl font-black text-white">${job.budgetAmount}</p>
                      <p className="text-xs font-bold text-slate-400">{job.budgetType === "hourly" ? "Hourly" : "Fixed price"}</p>
                    </div>
                  </div>

                  <p className="text-slate-300 my-5 line-clamp-3 leading-relaxed text-sm">
                    {job.description}
                  </p>

                  <div className="grid gap-3 rounded-xl border border-white/8 bg-black/15 p-3 mb-5 text-xs font-semibold text-slate-400 sm:grid-cols-3">
                    <span className="flex items-center gap-2">
                      <BadgeCheck className="h-4 w-4 text-emerald-300" />
                      {client?.hiresCount ? `${client.hiresCount} hires` : "Client history pending"}
                    </span>
                    <span className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-sky-300" />
                      {client?.jobsPostedCount ? `${client.jobsPostedCount} jobs posted` : "New job poster"}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-amber-300" />
                      {client?.avgClientResponseHours ? `${client.avgClientResponseHours}h avg response` : "Response unknown"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {job.skills.map((skill) => (
                      <span key={skill} className="bg-white/5 border border-white/10 text-slate-300 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <span className="material-symbols-outlined text-lg">group</span>
                        {client ? client.companyName || client.username : "Confidential Client"}
                      </span>
                      
                      {sortFilter === "mostDetailed" && <span className="text-slate-500">Detail: {summary.quality.score}</span>}
                      {sortFilter === "bestFit" && <span className="text-slate-500">Fit score: {summary.fit.score}</span>}
                    </div>

                    <div className="flex items-center gap-3">
                      {user?.role === "expert" && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSavedJob(job._id);
                          }}
                          className={`p-1.5 rounded-full transition-colors ${savedJobIds.has(job._id) ? "text-amber-400 bg-amber-400/10" : "text-slate-400 hover:text-white hover:bg-white/10"}`}
                          aria-label={savedJobIds.has(job._id) ? `Remove saved job ${job.title}` : `Save job ${job.title}`}
                          title={savedJobIds.has(job._id) ? "Remove saved job" : "Save job"}
                        >
                          <Star className={`h-4 w-4 ${savedJobIds.has(job._id) ? "fill-current" : ""}`} />
                        </button>
                      )}
                      <button type="button" className="text-primary text-sm font-bold flex items-center gap-1 group-hover:underline">
                        View details <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Sliding Proposal Drawer (Desktop Context Aside replacement) */}
        <aside className="hidden xl:block w-[450px] sticky h-[calc(100vh-8rem)] rounded-xl border border-white/10 shadow-2xl overflow-hidden bg-[var(--color-bg-elevated)]" style={{ top: "calc(var(--chrome-sticky-offset) + 1rem)" }}>
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                {selectedJob ? "Submit Proposal" : "Job Context"}
              </h2>
              {selectedJob && (
                <button onClick={() => { setSelectedJob(null); updateSearch({ jobId: "" }); }} className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-slate-400">
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              )}
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {!selectedJob ? (
                <div className="space-y-6">
                  <div className="text-center p-8 bg-white/5 rounded-2xl border border-white/5">
                    <span className="material-symbols-outlined text-5xl text-slate-500 mb-4">search</span>
                    <h3 className="text-lg font-bold text-white mb-2">Select a Job</h3>
                    <p className="text-sm text-slate-400">Click on a project from the feed to view its details and submit a proposal.</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">How sorting works</h4>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                      <p className="font-bold text-white text-sm mb-1">Most detailed</p>
                      <p className="text-xs text-slate-400 leading-relaxed">Rewards outcomes, systems, and clear constraints. Look for these for smoother communication.</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                      <p className="font-bold text-white text-sm mb-1">Best fit</p>
                      <p className="text-xs text-slate-400 leading-relaxed">Cross-references the job's stack against your profile skills.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Job Summary Header */}
                  <div className="p-5 bg-primary/10 rounded-xl border border-primary/20 relative overflow-hidden">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 relative z-10">Applying for</div>
                    <h4 className="text-lg font-bold text-white leading-tight relative z-10">{selectedJob.title}</h4>
                    <div className="mt-3 text-sm font-semibold text-slate-300 flex items-center gap-2 relative z-10">
                      <span className="material-symbols-outlined text-base">payments</span>
                      Budget: ${selectedJob.budgetAmount} {selectedJob.budgetType === "hourly" ? "Hourly Rate" : "Fixed"}
                    </div>
                  </div>

                  {/* Client Context */}
                  {typeof selectedJob.clientId !== "string" && (
                     <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-white">Client info</p>
                          <Link to={`/clients/${selectedJob.clientId._id}`} className="text-primary text-xs font-bold hover:underline">View Profile</Link>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-slate-500">Jobs Posted</p>
                            <p className="font-bold text-white text-lg">{selectedJob.clientId.jobsPostedCount ?? 0}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Avg Response</p>
                            <p className="font-bold text-white text-lg">{selectedJob.clientId.avgClientResponseHours ? `${selectedJob.clientId.avgClientResponseHours}h` : "New"}</p>
                          </div>
                        </div>
                     </div>
                  )}

                  {selectedJob.brief && <JobBriefDetails brief={selectedJob.brief} />}

                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-lg font-bold text-white mb-4">Your Proposal</h3>
                    
                    {!user || user.role !== "expert" ? (
                      <div className="rounded-xl border border-sky-400/20 bg-sky-500/10 p-5 text-sm font-medium text-sky-200">
                        <span className="material-symbols-outlined text-sky-400 text-3xl mb-2 block">info</span>
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

                  {user?.role === "expert" && (
                    <div className="pt-2">
                       <Button
                        className="w-full h-14 font-extrabold text-base bg-primary hover:bg-primary/90 text-white rounded-xl shadow-[0_0_20px_rgba(244,37,89,0.3)] transition-all flex items-center justify-center gap-2"
                        onClick={handleApply}
                        disabled={proposalData.coverLetter.trim().length < 30 || isSubmitting}
                      >
                        {isSubmitting ? (
                          "Submitting..."
                        ) : (
                          <>
                            Submit Proposal <Send className="h-5 w-5" />
                          </>
                        )}
                      </Button>
                      <p className="text-center text-xs font-semibold text-slate-500 mt-4 px-4">
                        By submitting, you agree to the n8n Experts terms of service and project agreement.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile Modal for selected job */}
      <Sheet
        open={Boolean(selectedJob)}
        onOpenChange={(open) => {
          if (open) return;
          setSelectedJob(null);
          updateSearch({ jobId: "" });
        }}
      >
        <SheetContent className="overflow-y-auto sm:max-w-xl bg-[#121212] border-white/10 text-white xl:hidden">
          <SheetHeader>
            <SheetTitle className="text-white">{selectedJob?.title}</SheetTitle>
            <SheetDescription className="text-slate-400">
              Review details and submit a customized proposal below.
            </SheetDescription>
          </SheetHeader>

          {selectedJob && (
            <div className="mt-6 space-y-6 pb-20">
              <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                <div className="text-sm font-semibold text-slate-300 flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-primary">payments</span>
                    Budget: ${selectedJob.budgetAmount} {selectedJob.budgetType === "hourly" ? "Hourly Rate" : "Fixed"}
                  </span>
                  
                  {user?.role === "expert" && (
                    <Button size="sm" variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-white" onClick={() => toggleSavedJob(selectedJob._id)}>
                      <Star className={`h-4 w-4 mr-1 ${savedJobIds.has(selectedJob._id) ? "fill-current text-amber-300" : ""}`} />
                      {savedJobIds.has(selectedJob._id) ? "Starred" : "Save"}
                    </Button>
                  )}
                </div>
              </div>

               <div className="text-sm text-slate-300 leading-relaxed font-medium bg-white/5 p-4 rounded-xl border border-white/10">
                 {selectedJob.description}
               </div>

              {selectedJob.brief && <JobBriefDetails brief={selectedJob.brief} />}

              <div className="pt-4 border-t border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">Your Proposal</h3>
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
            </div>
          )}

          <SheetFooter className="absolute bottom-0 left-0 right-0 p-4 bg-[#121212] border-t border-white/10 z-10">
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white h-12 font-bold rounded-xl"
              onClick={handleApply}
              disabled={!user || user.role !== "expert" || proposalData.coverLetter.trim().length < 30 || isSubmitting}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Submitting..." : user?.role === "expert" ? "Send proposal" : "Log in to apply"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
