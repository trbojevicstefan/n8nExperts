import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookmarkCheck, Sparkles, Trash2 } from "lucide-react";
import { recommendationApi, savedApi } from "@/lib/api";
import type { Job, JobRecommendation, SavedJobItem } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function SavedJobs() {
  const [savedItems, setSavedItems] = useState<SavedJobItem[]>([]);
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [basedOnSkills, setBasedOnSkills] = useState<string[]>([]);
  const [weights, setWeights] = useState({
    skillWeight: 8,
    recencyWeight: 2,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const savedJobIds = useMemo(() => new Set(savedItems.map((item) => item.job._id)), [savedItems]);

  const loadData = async (customWeights = weights) => {
    setLoading(true);
    setError("");
    try {
      const [savedResponse, recommendationResponse] = await Promise.all([
        savedApi.getSavedJobs({ limit: 50 }),
        recommendationApi.getJobs({ limit: 12, ...customWeights }),
      ]);

      setSavedItems(savedResponse.data.items || []);
      setRecommendations(recommendationResponse.data.recommendations || []);
      setBasedOnSkills(recommendationResponse.data.basedOnSkills || []);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to load saved jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeSavedJob = async (jobId: string) => {
    setError("");
    try {
      await savedApi.unsaveJob(jobId);
      setSavedItems((prev) => prev.filter((item) => item.job._id !== jobId));
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to remove saved job.");
    }
  };

  const saveRecommendedJob = async (jobId: string) => {
    setError("");
    try {
      await savedApi.saveJob(jobId);
      await loadData();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to save job.");
    }
  };

  const applyWeights = async () => {
    const normalized = {
      skillWeight: Math.max(0, Math.min(10, Number(weights.skillWeight) || 8)),
      recencyWeight: Math.max(0, Math.min(10, Number(weights.recencyWeight) || 2)),
    };
    setWeights(normalized);
    await loadData(normalized);
  };

  const renderJobCard = (job: Job, actions: ReactNode) => (
    <article key={job._id} className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-white">{job.title}</h3>
          <p className="mt-1 text-xs text-slate-400">
            ${job.budgetAmount} {job.budgetType === "hourly" ? "/hr" : "fixed"} | {job.status}
          </p>
        </div>
        <Badge variant="outline">{job.visibility}</Badge>
      </div>
      <p className="mt-3 text-sm text-slate-300 line-clamp-3">{job.description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {(job.skills || []).slice(0, 6).map((skill) => (
          <Badge key={skill} variant="secondary" className="text-xs">
            {skill}
          </Badge>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">{actions}</div>
    </article>
  );

  return (
    <div className="container py-8 space-y-6">
      <section className="panel p-6 md:p-8">
        <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] font-bold text-sky-300">
          <BookmarkCheck className="h-4 w-4" />
          Saved Jobs
        </p>
        <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-white">Your short list of opportunities</h1>
        <p className="mt-2 text-slate-300">Keep jobs you want to revisit, compare, and apply when timing is right.</p>
        <Link to="/saved-searches" className="mt-3 inline-block text-xs text-sky-300 hover:underline">
          Manage saved searches
        </Link>
      </section>

      {error && <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

      <section className="panel p-5">
        <h2 className="text-lg font-semibold text-white">Saved</h2>
        <div className="mt-4 grid gap-3">
          {loading && <p className="text-sm text-slate-300">Loading saved jobs...</p>}
          {!loading && savedItems.length === 0 && <p className="text-sm text-slate-300">No saved jobs yet.</p>}
          {savedItems.map((item) =>
            renderJobCard(item.job, (
              <>
                <Button size="sm" variant="outline" onClick={() => removeSavedJob(item.job._id)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
                <Link to="/jobs" className="text-xs text-sky-300 hover:underline">
                  Open jobs feed
                </Link>
              </>
            ))
          )}
        </div>
      </section>

      <section className="panel p-5">
        <h2 className="text-lg font-semibold text-white inline-flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-300" />
          Recommended for you
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          Match score = skill overlap + job recency. Use sliders to prefer closer skill match or newer jobs, then open and apply.
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="job-skill-weight">Skill weight</Label>
            <input
              id="job-skill-weight"
              type="range"
              min="0"
              max="10"
              step="1"
              value={weights.skillWeight}
              onChange={(event) => setWeights((prev) => ({ ...prev, skillWeight: Number(event.target.value) }))}
              className="w-full accent-primary"
            />
            <p className="text-xs text-slate-400">Current: {weights.skillWeight}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="job-recency-weight">Recency weight</Label>
            <input
              id="job-recency-weight"
              type="range"
              min="0"
              max="10"
              step="1"
              value={weights.recencyWeight}
              onChange={(event) => setWeights((prev) => ({ ...prev, recencyWeight: Number(event.target.value) }))}
              className="w-full accent-primary"
            />
            <p className="text-xs text-slate-400">Current: {weights.recencyWeight}</p>
          </div>
          <div className="flex items-end">
            <Button variant="outline" onClick={applyWeights} disabled={loading}>
              Apply ranking
            </Button>
          </div>
        </div>
        {basedOnSkills.length > 0 && (
          <p className="mt-3 text-xs text-slate-400">Based on: {basedOnSkills.slice(0, 8).join(", ")}</p>
        )}
        <div className="mt-4 grid gap-3">
          {!loading && recommendations.length === 0 && <p className="text-sm text-slate-300">No recommendations yet.</p>}
          {recommendations.map((item) =>
            renderJobCard(item.job, (
              <>
                <Badge variant="secondary">Match score: {item.matchScore}</Badge>
                {savedJobIds.has(item.job._id) ? (
                  <Badge variant="outline">Saved</Badge>
                ) : (
                  <Button size="sm" onClick={() => saveRecommendedJob(item.job._id)}>
                    Save
                  </Button>
                )}
                <Link to={`/jobs?jobId=${item.job._id}`} className="text-xs text-sky-300 hover:underline">
                  Open and apply
                </Link>
              </>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
