import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { BookmarkPlus, Briefcase, Clock3, Search, Send, Star } from "lucide-react";
import { jobApi, savedApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { usePageMeta } from "@/hooks/usePageMeta";
import type { Job } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatRelativeTime } from "@/lib/utils";

export default function FindWork() {
  usePageMeta({
    title: "Find n8n Jobs | n8nExperts",
    description:
      "Browse open n8n automation jobs, save interesting opportunities, and apply with focused proposals on n8nExperts.",
  });

  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [proposalData, setProposalData] = useState({
    bidAmount: "",
    coverLetter: "",
    estimatedDuration: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());

  const searchText = searchParams.get("search") || "";
  const skillsFilter = searchParams.get("skills") || "";
  const minBudget = searchParams.get("min") || "";
  const maxBudget = searchParams.get("max") || "";
  const sortFilter = searchParams.get("sort") || "newest";
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
    setError("");
    try {
      const params: Record<string, string | number> = {
        status: "open",
        limit: 40,
        sort: sortFilter,
      };
      if (searchText.trim()) params.search = searchText.trim();
      if (skillsFilter.trim()) params.skills = skillsFilter.trim();
      if (minBudget.trim()) params.min = minBudget.trim();
      if (maxBudget.trim()) params.max = maxBudget.trim();

      const response = await jobApi.getJobs(params);
      setJobs(response.data.jobs);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to load jobs.");
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

  const saveCurrentSearch = async () => {
    if (!user || user.role !== "expert") {
      return;
    }

    const suggested = searchText.trim() ? `Jobs: ${searchText.trim()}` : "Open n8n jobs";
    const name = window.prompt("Name this saved search", suggested)?.trim();
    if (!name) return;

    setInfo("");
    setError("");
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
      setInfo("Search saved.");
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to save current search.");
    }
  };

  const handleApply = async () => {
    if (!selectedJob) return;

    setIsSubmitting(true);
    setError("");
    try {
      await jobApi.applyToJob(selectedJob._id, {
        coverLetter: proposalData.coverLetter.trim(),
        bidAmount: proposalData.bidAmount ? Number(proposalData.bidAmount) : undefined,
        estimatedDuration: proposalData.estimatedDuration || undefined,
      });
      setSelectedJob(null);
      setProposalData({ bidAmount: "", coverLetter: "", estimatedDuration: "" });
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to submit proposal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSavedJob = async (jobId: string) => {
    setError("");
    try {
      if (savedJobIds.has(jobId)) {
        await savedApi.unsaveJob(jobId);
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
      } else {
        await savedApi.saveJob(jobId);
        setSavedJobIds((prev) => new Set([...prev, jobId]));
      }
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to update saved jobs.");
    }
  };

  return (
    <div className="container py-8">
      <section className="page-hero panel p-6 md:p-8 mb-6">
        <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-bold text-emerald-300">
          <Briefcase className="h-4 w-4" />
          Expert Workspace
        </p>
        <h1 className="mt-3 text-3xl md:text-5xl font-extrabold text-white">Find and apply to n8n projects</h1>
        <p className="mt-3 text-slate-300 max-w-2xl">
          Review open client briefs, then submit focused proposals with rate and timeline.
        </p>
      </section>

      <div className="panel p-4 md:p-5 mb-6">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="relative xl:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              className="pl-10"
              placeholder="Search jobs by title, stack, or integration..."
              value={searchText}
              onChange={(e) => updateSearch({ search: e.target.value })}
            />
          </div>
          <Input placeholder="Skills (comma separated)" value={skillsFilter} onChange={(e) => updateSearch({ skills: e.target.value })} />
          <Input placeholder="Min budget" value={minBudget} onChange={(e) => updateSearch({ min: e.target.value })} />
          <div className="flex gap-2">
            <Input placeholder="Max budget" value={maxBudget} onChange={(e) => updateSearch({ max: e.target.value })} />
            <select
              aria-label="Sort jobs"
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm text-white"
              value={sortFilter}
              onChange={(e) => updateSearch({ sort: e.target.value })}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="budgetDesc">High budget</option>
              <option value="budgetAsc">Low budget</option>
            </select>
          </div>
        </div>
        {user?.role === "expert" && (
          <div className="mt-3 flex items-center gap-3">
            <Button size="sm" variant="outline" onClick={saveCurrentSearch}>
              <BookmarkPlus className="h-4 w-4 mr-1" />
              Save current search
            </Button>
            <Link to="/saved-searches" className="text-xs text-sky-300 hover:underline">
              Manage saved searches
            </Link>
          </div>
        )}
        {info && <p className="mt-2 text-xs text-emerald-300">{info}</p>}
      </div>

      {error && <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200 mb-4">{error}</div>}

      <div className="grid gap-4">
        {isLoading && <p className="text-slate-300">Loading jobs...</p>}
        {!isLoading && jobs.length === 0 && <p className="text-slate-300">No open jobs found.</p>}

        {jobs.map((job) => (
          <article key={job._id} className="panel p-5 hover:border-[var(--color-border-hover)] transition">
            <button type="button" onClick={() => {
              setSelectedJob(job);
              updateSearch({ jobId: job._id });
            }} className="text-left w-full">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white">{job.title}</h2>
                  <p className="mt-2 text-sm text-slate-300 line-clamp-2">{job.description}</p>
                </div>
                <Badge variant="outline">{job.visibility}</Badge>
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
            {typeof job.clientId !== "string" && (
              <div className="mt-3 border-t border-white/10 pt-3 text-xs text-slate-400">
                <span>Client: {job.clientId.companyName || job.clientId.username}</span>
                <Link to={`/clients/${job.clientId._id}`} className="ml-3 text-sky-300 hover:underline">
                  View client profile
                </Link>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-lg border border-white/10 bg-white/5 p-2">
                  <p>
                    Posted: <span className="font-semibold text-white">{job.clientId.jobsPostedCount ?? 0}</span>
                  </p>
                  <p>
                    Completed: <span className="font-semibold text-white">{job.clientId.jobsCompletedCount ?? 0}</span>
                  </p>
                  <p>
                    Hires: <span className="font-semibold text-white">{job.clientId.hiresCount ?? 0}</span>
                  </p>
                  <p>
                    Avg response: <span className="font-semibold text-white">{job.clientId.avgClientResponseHours ?? 0}h</span>
                  </p>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>

      <Sheet
        open={Boolean(selectedJob)}
        onOpenChange={(open) => {
          if (open) return;
          setSelectedJob(null);
          updateSearch({ jobId: "" });
        }}
      >
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedJob?.title}</SheetTitle>
            <SheetDescription>Send a proposal for this project.</SheetDescription>
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
                <p>{selectedJob.description}</p>
                <p className="mt-3 font-semibold text-primary">
                  Budget: ${selectedJob.budgetAmount} {selectedJob.budgetType === "hourly" ? "/hr" : "fixed"}
                </p>
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
                        Avg response: <span className="font-semibold text-white">{selectedJob.clientId.avgClientResponseHours ?? 0}h</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bidAmount">Bid Amount (optional)</Label>
                <Input
                  id="bidAmount"
                  type="number"
                  min="1"
                  value={proposalData.bidAmount}
                  onChange={(e) => setProposalData((prev) => ({ ...prev, bidAmount: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coverLetter">Proposal</Label>
                <Textarea
                  id="coverLetter"
                  className="min-h-[160px]"
                  placeholder="Describe your approach, relevant examples, and delivery plan."
                  value={proposalData.coverLetter}
                  onChange={(e) => setProposalData((prev) => ({ ...prev, coverLetter: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Estimated Duration (optional)</Label>
                <Input
                  id="duration"
                  placeholder="e.g. 5 days"
                  value={proposalData.estimatedDuration}
                  onChange={(e) => setProposalData((prev) => ({ ...prev, estimatedDuration: e.target.value }))}
                />
              </div>
            </div>
          )}

          <SheetFooter className="mt-6">
            <Button
              className="w-full"
              onClick={handleApply}
              disabled={!user || user.role !== "expert" || !proposalData.coverLetter || isSubmitting}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Submitting..." : user?.role === "expert" ? "Submit Proposal" : "Log in as expert to apply"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
