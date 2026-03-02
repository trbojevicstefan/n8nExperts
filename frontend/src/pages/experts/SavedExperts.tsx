import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookmarkCheck, Sparkles, Trash2 } from "lucide-react";
import { recommendationApi, savedApi } from "@/lib/api";
import type { ExpertProfile, ExpertRecommendation, SavedExpertItem } from "@/types";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function SavedExperts() {
  const [savedItems, setSavedItems] = useState<SavedExpertItem[]>([]);
  const [recommendations, setRecommendations] = useState<ExpertRecommendation[]>([]);
  const [basedOnSkills, setBasedOnSkills] = useState<string[]>([]);
  const [weights, setWeights] = useState({
    skillWeight: 7,
    ratingWeight: 5,
    completedWeight: 3,
    availabilityWeight: 2,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const savedExpertIds = useMemo(() => new Set(savedItems.map((item) => item.expert._id)), [savedItems]);

  const loadData = async (customWeights = weights) => {
    setLoading(true);
    setError("");
    try {
      const [savedResponse, recommendationResponse] = await Promise.all([
        savedApi.getSavedExperts({ limit: 50 }),
        recommendationApi.getExperts({ limit: 12, ...customWeights }),
      ]);

      setSavedItems(savedResponse.data.items || []);
      setRecommendations(recommendationResponse.data.recommendations || []);
      setBasedOnSkills(recommendationResponse.data.basedOnSkills || []);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to load saved experts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeSavedExpert = async (expertId: string) => {
    setError("");
    try {
      await savedApi.unsaveExpert(expertId);
      setSavedItems((prev) => prev.filter((item) => item.expert._id !== expertId));
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to remove saved expert.");
    }
  };

  const saveRecommendedExpert = async (expertId: string) => {
    setError("");
    try {
      await savedApi.saveExpert(expertId);
      await loadData();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to save expert.");
    }
  };

  const applyWeights = async () => {
    const normalized = {
      skillWeight: Math.max(0, Math.min(10, Number(weights.skillWeight) || 7)),
      ratingWeight: Math.max(0, Math.min(10, Number(weights.ratingWeight) || 5)),
      completedWeight: Math.max(0, Math.min(10, Number(weights.completedWeight) || 3)),
      availabilityWeight: Math.max(0, Math.min(10, Number(weights.availabilityWeight) || 2)),
    };
    setWeights(normalized);
    await loadData(normalized);
  };

  const renderExpertCard = (expert: ExpertProfile, actions: ReactNode) => (
    <article key={expert._id} className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar src={expert.img} fallback={expert.username} className="h-11 w-11" />
          <div>
            <h3 className="font-semibold text-white">{expert.username}</h3>
            <p className="text-xs text-slate-400">{expert.headline || "n8n Expert"}</p>
          </div>
        </div>
        <Badge variant="outline">${expert.hourlyRate || 0}/hr</Badge>
      </div>
      <p className="mt-3 text-sm text-slate-300 line-clamp-3">{expert.desc || "No profile summary yet."}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {(expert.skills || []).slice(0, 6).map((skill) => (
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
          Saved Experts
        </p>
        <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-white">Your curated expert shortlist</h1>
        <p className="mt-2 text-slate-300">Keep top candidates ready for invitations as your projects move to execution.</p>
        <Link to="/saved-searches" className="mt-3 inline-block text-xs text-sky-300 hover:underline">
          Manage saved searches
        </Link>
      </section>

      {error && <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

      <section className="panel p-5">
        <h2 className="text-lg font-semibold text-white">Saved</h2>
        <div className="mt-4 grid gap-3">
          {loading && <p className="text-sm text-slate-300">Loading saved experts...</p>}
          {!loading && savedItems.length === 0 && <p className="text-sm text-slate-300">No saved experts yet.</p>}
          {savedItems.map((item) =>
            renderExpertCard(item.expert, (
              <>
                <Button size="sm" variant="outline" onClick={() => removeSavedExpert(item.expert._id)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
                <Link to={`/experts/${item.expert._id}`} className="text-xs text-sky-300 hover:underline">
                  View profile
                </Link>
              </>
            ))
          )}
        </div>
      </section>

      <section className="panel p-5">
        <h2 className="text-lg font-semibold text-white inline-flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-300" />
          Recommended experts
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          Tune ranking with four simple sliders: skills, rating, completed work, and availability.
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="space-y-2">
            <Label htmlFor="expert-skill-weight">Skill weight</Label>
            <input
              id="expert-skill-weight"
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
            <Label htmlFor="expert-rating-weight">Rating weight</Label>
            <input
              id="expert-rating-weight"
              type="range"
              min="0"
              max="10"
              step="1"
              value={weights.ratingWeight}
              onChange={(event) => setWeights((prev) => ({ ...prev, ratingWeight: Number(event.target.value) }))}
              className="w-full accent-primary"
            />
            <p className="text-xs text-slate-400">Current: {weights.ratingWeight}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="expert-completed-weight">Completed weight</Label>
            <input
              id="expert-completed-weight"
              type="range"
              min="0"
              max="10"
              step="1"
              value={weights.completedWeight}
              onChange={(event) => setWeights((prev) => ({ ...prev, completedWeight: Number(event.target.value) }))}
              className="w-full accent-primary"
            />
            <p className="text-xs text-slate-400">Current: {weights.completedWeight}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="expert-availability-weight">Availability weight</Label>
            <input
              id="expert-availability-weight"
              type="range"
              min="0"
              max="10"
              step="1"
              value={weights.availabilityWeight}
              onChange={(event) => setWeights((prev) => ({ ...prev, availabilityWeight: Number(event.target.value) }))}
              className="w-full accent-primary"
            />
            <p className="text-xs text-slate-400">Current: {weights.availabilityWeight}</p>
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
            renderExpertCard(item.expert, (
              <>
                <Badge variant="secondary">Match score: {item.matchScore}</Badge>
                {savedExpertIds.has(item.expert._id) ? (
                  <Badge variant="outline">Saved</Badge>
                ) : (
                  <Button size="sm" onClick={() => saveRecommendedExpert(item.expert._id)}>
                    Save
                  </Button>
                )}
              </>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
