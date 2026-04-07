import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { BookmarkPlus, Star } from "lucide-react";
import { expertApi, savedApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { usePageMeta } from "@/hooks/usePageMeta";
import type { ExpertProfile } from "@/types";
import { Button } from "@/components/ui/button";

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
      setInfo("Search saved.");
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
      } else {
        await savedApi.saveExpert(expertId);
        setSavedExpertIds((prev) => new Set([...prev, expertId]));
      }
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to update saved experts.");
    }
  };

  const skillPresets = ["n8n", "JavaScript", "API Design", "Python", "PostgreSQL", "OpenAI"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Header */}
      <div className="flex flex-col items-center mb-12">
        <div className="w-full max-w-2xl">
          <div className="group flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 transition-all duration-300 focus-within:shadow-[0_0_15px_rgba(244,37,89,0.3)] focus-within:border-primary">
            <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary mr-3">search</span>
            <input
              className="w-full bg-transparent border-none focus:ring-0 text-lg placeholder:text-slate-500 text-white outline-none"
              placeholder="Search experts by name or skill..."
              type="text"
              value={searchQuery}
              onChange={(e) => updateSearch({ search: e.target.value })}
            />
          </div>
          <p className="text-center mt-4 text-sm text-slate-400">
            Showing <span className="text-primary font-semibold">{experts.length} experts</span> matching your criteria
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 shrink-0 space-y-8">
          {/* Rate Filter */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Hourly Rate</h3>
            <div className="flex gap-2">
              <input
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:ring-primary focus:border-primary outline-none"
                placeholder="Min $"
                value={minRate}
                onChange={(e) => updateSearch({ minRate: e.target.value })}
              />
              <input
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:ring-primary focus:border-primary outline-none"
                placeholder="Max $"
                value={maxRate}
                onChange={(e) => updateSearch({ maxRate: e.target.value })}
              />
            </div>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Specialized Skills</h3>
            <div className="flex flex-wrap gap-2">
              {skillPresets.map((skill) => {
                const isActive = skillsFilter.split(",").map(s => s.trim()).includes(skill);
                return (
                  <button
                    key={skill}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-primary text-white"
                        : "bg-white/5 border border-white/10 hover:border-primary/50"
                    }`}
                    onClick={() => {
                      const current = skillsFilter.split(",").map(s => s.trim()).filter(Boolean);
                      const next = isActive
                        ? current.filter(s => s !== skill)
                        : [...current, skill];
                      updateSearch({ skills: next.join(",") });
                    }}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
            <input
              className="mt-3 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:ring-primary focus:border-primary outline-none"
              placeholder="Custom skills (comma separated)"
              value={skillsFilter}
              onChange={(e) => updateSearch({ skills: e.target.value })}
            />
          </div>

          {/* Sort */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Sort By</h3>
            <select
              aria-label="Sort experts"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-primary focus:border-primary outline-none"
              value={sort}
              onChange={(e) => updateSearch({ sort: e.target.value })}
            >
              <option value="newest">Newest</option>
              <option value="rateAsc">Rate low to high</option>
              <option value="rateDesc">Rate high to low</option>
              <option value="projects">Most projects</option>
            </select>
          </div>

          {/* Client Actions */}
          {user?.role === "client" && (
            <div className="space-y-3">
              <Button size="sm" variant="outline" onClick={saveCurrentSearch} className="w-full">
                <BookmarkPlus className="h-4 w-4 mr-1" />
                Save current search
              </Button>
              <Link to="/saved-searches" className="block text-xs text-primary hover:underline text-center">
                Manage saved searches
              </Link>
            </div>
          )}
        </aside>

        {/* Expert Grid */}
        <div className="flex-1">
          {error && <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200 mb-4">{error}</div>}
          {info && <p className="mb-4 text-xs text-emerald-300">{info}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {loading && <p className="text-slate-300 col-span-full">Loading experts...</p>}
            {!loading && experts.length === 0 && (
              <div className="col-span-full text-center py-16">
                <span className="material-symbols-outlined text-5xl text-slate-600 mb-4 block">search_off</span>
                <h3 className="text-lg font-bold text-white mb-2">No experts match this filter</h3>
                <p className="text-slate-400 text-sm">Remove one or more constraints to broaden the discovery set.</p>
              </div>
            )}
            {experts.map((expert) => (
              <div
                key={expert._id}
                className="rounded-xl p-6 flex flex-col hover:scale-[1.02] transition-transform duration-300 border border-white/8"
                style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(12px)' }}
              >
                {/* Avatar + Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="rounded-full" style={{ background: 'linear-gradient(45deg, #f42559, #8b5cf6)', padding: '2px' }}>
                    <div
                      className="size-16 rounded-full bg-cover bg-center border-2 border-[#0d0d0d]"
                      style={{ backgroundImage: expert.img ? `url('${expert.img}')` : undefined, backgroundColor: !expert.img ? '#1e1316' : undefined }}
                    >
                      {!expert.img && (
                        <div className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {expert.username?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full flex items-center gap-1" style={{ background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.2), rgba(244, 37, 89, 0.2))', border: '1px solid rgba(244, 37, 89, 0.3)' }}>
                    <span className="material-symbols-outlined text-xs text-green-400">check_circle</span>
                    <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Verified</span>
                  </div>
                </div>

                {/* Name + Title */}
                <div className="mb-4">
                  <div className="flex items-center gap-1">
                    <h3 className="text-lg font-bold text-white">{expert.username}</h3>
                    <span className="material-symbols-outlined text-blue-400 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  </div>
                  <p className="text-sm text-primary font-medium">{expert.headline || "n8n Specialist"}</p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-6 text-sm text-slate-400">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-yellow-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="text-white font-medium">4.9</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">payments</span>
                    <span className="text-white font-medium">${expert.hourlyRate || 0}/hr</span>
                  </div>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-8 flex-grow">
                  {(expert.skills || []).slice(0, 3).map((skill) => (
                    <span key={skill} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] uppercase font-bold text-slate-400">
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Link
                    to={`/experts/${expert._id}`}
                    className="flex-1 py-2 rounded-lg border border-primary text-primary text-sm font-bold hover:bg-primary/10 transition-colors text-center"
                  >
                    View Profile
                  </Link>
                  {user?.role === "client" ? (
                    <button
                      onClick={() => toggleSavedExpert(expert._id)}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
                        savedExpertIds.has(expert._id)
                          ? "bg-primary/20 text-primary border border-primary/30"
                          : "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
                      }`}
                    >
                      <Star className="h-3.5 w-3.5 inline mr-1" />
                      {savedExpertIds.has(expert._id) ? "Saved" : "Save"}
                    </button>
                  ) : (
                    <Link
                      to={`/experts/${expert._id}`}
                      className="flex-1 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 text-center"
                    >
                      Invite
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          {!loading && experts.length > 0 && (
            <div className="flex justify-center mt-12">
              <button className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-all flex items-center gap-2">
                Load More Experts
                <span className="material-symbols-outlined">expand_more</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
