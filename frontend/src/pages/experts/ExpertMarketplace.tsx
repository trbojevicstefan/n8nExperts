import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  BookmarkPlus,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  DollarSign,
  Heart,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
} from "lucide-react";
import { expertApi, savedApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { usePageMeta } from "@/hooks/usePageMeta";
import type { ExpertProfile } from "@/types";
import { Button } from "@/components/ui/button";

const skillPresets = ["n8n", "JavaScript", "API Design", "Python", "PostgreSQL", "OpenAI", "HubSpot", "Slack"];

const formatRate = (rate?: number) => (rate ? `$${rate}/hr` : "Rate on profile");

const getExpertTitle = (expert: ExpertProfile) => expert.headline || "n8n automation specialist";

const getExpertSummary = (expert: ExpertProfile) =>
  expert.desc ||
  "Builds, audits, and maintains n8n automation systems with clear delivery scope and handoff expectations.";

const getAvailabilityLabel = (availability?: ExpertProfile["availability"]) => {
  if (availability === "busy") return "Limited availability";
  if (availability === "unavailable") return "Unavailable";
  return "Available now";
};

export default function ExpertMarketplace() {
  usePageMeta({
    title: "Find n8n Experts | n8nExperts",
    description:
      "Search n8n experts by skills, rates, and specialization. Review public portfolios and invite experts directly to client jobs.",
    canonicalPath: "/find-experts",
  });

  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [experts, setExperts] = useState<ExpertProfile[]>([]);
  const [savedExpertIds, setSavedExpertIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const searchQuery = searchParams.get("search") || "";
  const skillsFilter = searchParams.get("skills") || "";
  const minRate = searchParams.get("minRate") || "";
  const maxRate = searchParams.get("maxRate") || "";
  const sort = searchParams.get("sort") || "newest";
  const selectedSkills = useMemo(() => skillsFilter.split(",").map((skill) => skill.trim()).filter(Boolean), [skillsFilter]);

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

  const clearFilters = () => setSearchParams(new URLSearchParams(), { replace: true });

  const loadExperts = async () => {
    setLoading(true);
    setError("");
    try {
      const params: Record<string, string | number> = { limit: 36, sort };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (skillsFilter.trim()) params.skills = skillsFilter.trim();
      if (minRate.trim()) params.minRate = minRate.trim();
      if (maxRate.trim()) params.maxRate = maxRate.trim();

      const response = await expertApi.getExperts(params);
      setExperts(response.data.experts);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to load experts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExperts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, skillsFilter, minRate, maxRate, sort]);

  useEffect(() => {
    const loadSaved = async () => {
      if (!user || user.role !== "client") {
        setSavedExpertIds(new Set());
        return;
      }
      try {
        const response = await savedApi.getSavedExperts({ limit: 200 });
        setSavedExpertIds(new Set(response.data.items.map((item) => item.expert._id)));
      } catch {
        setSavedExpertIds(new Set());
      }
    };
    loadSaved();
  }, [user]);

  const saveCurrentSearch = async () => {
    if (!user || user.role !== "client") return;
    const suggested = searchQuery.trim() ? `Experts: ${searchQuery.trim()}` : "Top n8n experts";
    const name = window.prompt("Name this saved search", suggested)?.trim();
    if (!name) return;
    setInfo("");
    setError("");
    try {
      await savedApi.createSearch({
        name,
        scope: "experts",
        filters: {
          ...(searchQuery.trim() && { search: searchQuery.trim() }),
          ...(skillsFilter.trim() && { skills: skillsFilter.trim() }),
          ...(minRate.trim() && { minRate: minRate.trim() }),
          ...(maxRate.trim() && { maxRate: maxRate.trim() }),
          ...(sort && { sort }),
        },
        isPinned: false,
      });
      setInfo("Search saved. You can reopen it from Saved Searches.");
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to save current search.");
    }
  };

  const toggleSavedExpert = async (expertId: string) => {
    setError("");
    try {
      if (savedExpertIds.has(expertId)) {
        await savedApi.unsaveExpert(expertId);
        setSavedExpertIds((prev) => {
          const next = new Set(prev);
          next.delete(expertId);
          return next;
        });
        setInfo("Expert removed from your saved list.");
      } else {
        await savedApi.saveExpert(expertId);
        setSavedExpertIds((prev) => new Set([...prev, expertId]));
        setInfo("Expert saved. You can compare them later from Saved Experts.");
      }
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to update saved experts.");
    }
  };

  const toggleSkill = (skill: string) => {
    const next = selectedSkills.includes(skill) ? selectedSkills.filter((item) => item !== skill) : [...selectedSkills, skill];
    updateSearch({ skills: next.join(",") });
  };

  const activeFilterCount = [searchQuery, skillsFilter, minRate, maxRate].filter(Boolean).length;

  return (
    <div className="container page-stack">
      <section className="app-page-header">
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="eyebrow">Talent marketplace</p>
            <h1 className="mt-5 max-w-4xl text-3xl font-bold leading-tight text-white md:text-4xl">
              Hire n8n experts with proof, rates, and fit in view.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--color-text-secondary)]">
              Search like a serious hiring marketplace: compare specialists by skill, availability, delivery proof, and budget fit before opening a profile.
            </p>
          </div>
          <div className="grid gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm text-[var(--color-text-secondary)] sm:min-w-72">
            <div className="flex items-center justify-between gap-3">
              <span>Visible experts</span>
              <strong className="text-xl text-white">{loading ? "..." : experts.length}</strong>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Active filters</span>
              <strong className="text-xl text-white">{activeFilterCount}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="context-aside h-fit lg:sticky lg:top-[var(--chrome-sticky-offset)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">Filters</p>
              <h2 className="mt-2 text-lg font-black text-white">Narrow talent</h2>
            </div>
            <SlidersHorizontal className="h-5 w-5 text-[var(--color-accent-cool)]" />
          </div>

          <div className="mt-6 space-y-6">
            <div>
              <label className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]" htmlFor="expert-search">
                Search
              </label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  id="expert-search"
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/25 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-glow)]"
                  placeholder="n8n, Slack, HubSpot..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => updateSearch({ search: e.target.value })}
                />
              </div>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Hourly rate</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input
                  className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-glow)]"
                  placeholder="Min $"
                  inputMode="numeric"
                  value={minRate}
                  onChange={(e) => updateSearch({ minRate: e.target.value })}
                />
                <input
                  className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-glow)]"
                  placeholder="Max $"
                  inputMode="numeric"
                  value={maxRate}
                  onChange={(e) => updateSearch({ maxRate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Skills</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {skillPresets.map((skill) => {
                  const active = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      className={
                        active
                          ? "rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-xs font-black text-white"
                          : "rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-[var(--color-text-secondary)] transition hover:border-white/25 hover:text-white"
                      }
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
              <input
                className="mt-3 h-11 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-glow)]"
                placeholder="Custom skills"
                value={skillsFilter}
                onChange={(e) => updateSearch({ skills: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]" htmlFor="expert-sort">
                Sort
              </label>
              <select
                id="expert-sort"
                className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-sm font-bold text-white outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-glow)] [&>option]:bg-[#101624]"
                value={sort}
                onChange={(e) => updateSearch({ sort: e.target.value })}
              >
                <option value="newest">Newest</option>
                <option value="rateAsc">Rate low to high</option>
                <option value="rateDesc">Rate high to low</option>
                <option value="projects">Most projects</option>
              </select>
            </div>

            <div className="grid gap-2 border-t border-white/10 pt-5">
              {user?.role === "client" && (
                <Button size="sm" variant="outline" onClick={saveCurrentSearch} className="w-full rounded-md">
                  <BookmarkPlus className="mr-1 h-4 w-4" />
                  Save search
                </Button>
              )}
              <button type="button" className="text-sm font-bold text-[var(--color-text-muted)] transition hover:text-white" onClick={clearFilters}>
                Clear all filters
              </button>
            </div>
          </div>
        </aside>

        <div className="min-w-0 space-y-4">
          <div className="filter-toolbar flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold text-white">
                {loading ? "Loading experts..." : `${experts.length} n8n experts available`}
              </p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                Upwork-style list view: compare rate, proof, availability, and specialties without opening every profile.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-bold text-[var(--color-text-muted)]">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Verified profiles</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Service offers</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Job-ready proof</span>
            </div>
          </div>

          {error && <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm font-semibold text-red-200">{error}</div>}
          {info && <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-200">{info}</div>}

          {loading && (
            <div className="grid gap-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="dense-list-card animate-pulse">
                  <div className="h-6 w-1/3 rounded bg-white/10" />
                  <div className="mt-4 h-4 w-2/3 rounded bg-white/8" />
                  <div className="mt-6 h-16 rounded bg-white/6" />
                </div>
              ))}
            </div>
          )}

          {!loading && experts.length === 0 && (
            <div className="empty-state text-center">
              <Search className="mx-auto h-10 w-10 text-[var(--color-text-muted)]" />
              <h3 className="mt-4 text-xl font-black text-white">No experts match this search</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-text-secondary)]">
                Try a broader skill, remove a rate range, or clear filters to see the full talent pool.
              </p>
              <button type="button" className="mt-5 rounded-full bg-[var(--color-primary)] px-5 py-2 text-sm font-black text-white" onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          )}

          {!loading &&
            experts.map((expert) => {
              const saved = savedExpertIds.has(expert._id);
              const skills = (expert.skills || []).slice(0, 8);
              const completedProjects = expert.completedProjects || expert.jobsCompletedCount || 0;
              const rating = expert.ratingAvg || 0;

              return (
                <article key={expert._id} className="dense-list-card transition hover:border-[var(--color-border-hover)] hover:bg-[rgba(17,23,37,0.96)]">
                  <div className="grid gap-5 lg:grid-cols-[auto_minmax(0,1fr)_12rem]">
                    <Link
                      to={`/experts/${expert._id}`}
                      aria-label={`View ${expert.username}'s profile`}
                      className="group relative h-20 w-20 overflow-hidden rounded-full border border-white/10 bg-white/5 md:h-24 md:w-24"
                    >
                      {expert.img ? (
                        <img src={expert.img} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,rgba(132,216,255,0.24),rgba(255,107,61,0.22))] text-2xl font-black text-white">
                          {expert.username?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                      )}
                      <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-[#111827] bg-[var(--color-success)]" />
                    </Link>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link to={`/experts/${expert._id}`} className="text-xl font-black text-white transition hover:text-[var(--color-accent-cool)]">
                          {expert.username}
                        </Link>
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-black text-emerald-300">
                          <BadgeCheck className="h-3.5 w-3.5" />
                          Verified
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-[var(--color-text-secondary)]">
                          <Clock3 className="h-3.5 w-3.5" />
                          {getAvailabilityLabel(expert.availability)}
                        </span>
                      </div>

                      <h2 className="mt-2 text-base font-bold text-[var(--color-text-secondary)]">{getExpertTitle(expert)}</h2>
                      <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-text-secondary)]">{getExpertSummary(expert)}</p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {skills.length > 0 ? (
                          skills.map((skill) => (
                            <span key={skill} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-[var(--color-text-secondary)]">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-[var(--color-text-muted)]">
                            Skills coming soon
                          </span>
                        )}
                      </div>

                      <div className="mt-5 grid gap-3 text-sm text-[var(--color-text-secondary)] sm:grid-cols-3">
                        <span className="inline-flex items-center gap-2">
                          <Star className="h-4 w-4 text-[var(--color-warning)]" />
                          {rating ? `${rating.toFixed(1)} rating` : "New to reviews"}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <BriefcaseBusiness className="h-4 w-4 text-[var(--color-accent-cool)]" />
                          {completedProjects} completed
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-[var(--color-text-muted)]" />
                          {expert.location || expert.country || "Remote"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 lg:items-stretch">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Rate</p>
                        <p className="mt-1 flex items-center gap-1 text-2xl font-black text-white">
                          <DollarSign className="h-5 w-5 text-[var(--color-success)]" />
                          {formatRate(expert.hourlyRate).replace("$", "")}
                        </p>
                        <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)]">
                          <CheckCircle2 className="h-4 w-4 text-[var(--color-success)]" />
                          Profile ready for review
                        </p>
                      </div>

                      <div className="grid gap-2">
                        <Link
                          to={`/experts/${expert._id}`}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-4 py-2.5 text-sm font-black text-white shadow-[0_18px_45px_var(--color-primary-glow)] transition hover:bg-[var(--color-primary-hover)]"
                        >
                          View profile
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                        {user?.role === "client" ? (
                          <button
                            type="button"
                            onClick={() => toggleSavedExpert(expert._id)}
                            className={
                              saved
                                ? "inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-primary)] bg-[var(--color-primary)]/10 px-4 py-2.5 text-sm font-black text-[var(--color-accent)]"
                                : "inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2.5 text-sm font-black text-white transition hover:bg-white/10"
                            }
                          >
                            <Heart className={saved ? "h-4 w-4 fill-current" : "h-4 w-4"} />
                            {saved ? "Saved" : "Save expert"}
                          </button>
                        ) : (
                          <Link
                            to="/auth/role-select"
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2.5 text-sm font-black text-white transition hover:bg-white/10"
                          >
                            <Sparkles className="h-4 w-4" />
                            Hire path
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
        </div>
      </section>
    </div>
  );
}
