import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { BookmarkPlus, Globe2, Search, Star } from "lucide-react";
import { expertApi, savedApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { usePageMeta } from "@/hooks/usePageMeta";
import type { ExpertProfile } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DenseListCard, EmptyState, FilterToolbar, PublicPageHero, StatStrip } from "@/components/layout/PagePrimitives";

export default function ExpertMarketplace() {
  usePageMeta({
    title: "Find n8n Experts | n8nExperts",
    description:
      "Search n8n experts by skills, rates, and specialization. Review public portfolios and invite experts directly to client jobs.",
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
    if (!user || user.role !== "client") {
      return;
    }

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

  return (
    <div className="container py-8">
      <PublicPageHero
        eyebrow={
          <>
            <Globe2 className="h-4 w-4" />
            Client discovery
          </>
        }
        title="Explore expert profiles"
        description="Search by specialty, compare proof and rate context, and move into shortlist or invitation flow with better signal quality."
      >
        <StatStrip
          items={[
            { label: "Start with", value: "Relevant skills", hint: "Use search and filters to narrow the field." },
            { label: "Validate", value: "Proof", hint: "Compare portfolio depth and service framing, not just headlines." },
            { label: "Move into", value: "Action", hint: "Save experts or invite directly when fit looks credible." },
          ]}
        />
      </PublicPageHero>

      <FilterToolbar
        className="mt-6"
        title="Refine the shortlist"
        description="Keep the filter controls compact so the expert cards remain the dominant scanning surface."
        actions={
          user?.role === "client" ? (
            <>
              <Button size="sm" variant="outline" onClick={saveCurrentSearch}>
                <BookmarkPlus className="h-4 w-4 mr-1" />
                Save current search
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
              placeholder="Search by name, expertise, or stack..."
              value={searchQuery}
              onChange={(e) => updateSearch({ search: e.target.value })}
            />
          </div>
          <Input placeholder="Skills (comma separated)" value={skillsFilter} onChange={(e) => updateSearch({ skills: e.target.value })} />
          <Input placeholder="Min rate" value={minRate} onChange={(e) => updateSearch({ minRate: e.target.value })} />
          <div className="flex gap-2">
            <Input placeholder="Max rate" value={maxRate} onChange={(e) => updateSearch({ maxRate: e.target.value })} />
            <select
              aria-label="Sort experts"
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm text-white"
              value={sort}
              onChange={(e) => updateSearch({ sort: e.target.value })}
            >
              <option value="newest">Newest</option>
              <option value="rateAsc">Rate low to high</option>
              <option value="rateDesc">Rate high to low</option>
              <option value="projects">Most projects</option>
            </select>
          </div>
        </div>
        {info && <p className="mt-2 text-xs text-emerald-300">{info}</p>}
        <p className="mt-3 text-xs text-[var(--color-text-muted)]">
          Best practice: filter first by specialty or stack, then use public proof and rate context to compare the shortlist.
        </p>
      </FilterToolbar>

      {error && <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200 mb-4">{error}</div>}

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {loading && <p className="text-slate-300">Loading experts...</p>}
        {!loading && experts.length === 0 && (
          <EmptyState title="No experts match this filter." description="Remove one or more constraints to broaden the discovery set." className="md:col-span-2 xl:col-span-3" />
        )}
        {experts.map((expert) => (
          <DenseListCard key={expert._id}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar src={expert.img} fallback={expert.username} className="h-12 w-12" />
                <div>
                  <h2 className="text-white font-bold">{expert.username}</h2>
                  <p className="text-xs text-slate-400">{expert.headline || "n8n Specialist"}</p>
                </div>
              </div>
              <Badge variant="outline">${expert.hourlyRate || 0}/hr</Badge>
            </div>

            <p className="mt-4 text-sm text-slate-300 line-clamp-3">{expert.desc || "No bio available yet."}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {(expert.skills || []).slice(0, 5).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>

            <div className="mt-5">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to={`/experts/${expert._id}`}
                  className="inline-flex rounded-lg border border-primary/45 px-3 py-2 text-xs font-bold uppercase tracking-wide text-primary hover:bg-primary/10"
                >
                  View Profile
                </Link>
                {user?.role === "client" && (
                  <Button size="sm" variant="outline" onClick={() => toggleSavedExpert(expert._id)}>
                    <Star className="h-4 w-4 mr-1" />
                    {savedExpertIds.has(expert._id) ? "Saved" : "Save"}
                  </Button>
                )}
              </div>
            </div>
          </DenseListCard>
        ))}
      </div>
    </div>
  );
}
