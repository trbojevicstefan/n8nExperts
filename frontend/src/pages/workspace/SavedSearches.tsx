import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Pin, PinOff, Trash2 } from "lucide-react";
import { savedApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { SavedSearch } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SearchScope = "jobs" | "experts";

const getScopeFromRole = (role?: string): SearchScope => (role === "client" ? "experts" : "jobs");

const formatFilterSummary = (filters: Record<string, unknown>) => {
  const entries = Object.entries(filters || {}).filter(([, value]) => value !== undefined && value !== null && value !== "");
  if (entries.length === 0) return "No filters";
  return entries
    .slice(0, 4)
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : String(value)}`)
    .join(" | ");
};

const buildSearchLink = (scope: SearchScope, filters: Record<string, unknown>) => {
  const base = scope === "jobs" ? "/jobs" : "/find-experts";
  const params = new URLSearchParams();

  Object.entries(filters || {}).forEach(([key, rawValue]) => {
    if (rawValue === undefined || rawValue === null || rawValue === "") return;
    if (Array.isArray(rawValue)) {
      if (rawValue.length === 0) return;
      params.set(key, rawValue.join(","));
      return;
    }
    params.set(key, String(rawValue));
  });

  const query = params.toString();
  return query ? `${base}?${query}` : base;
};

export default function SavedSearches() {
  const { user } = useAuth();
  const [scope, setScope] = useState<SearchScope>(getScopeFromRole(user?.role));
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [newName, setNewName] = useState("");
  const [query, setQuery] = useState("");
  const [skills, setSkills] = useState("");
  const [status, setStatus] = useState("open");
  const [sort, setSort] = useState("newest");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const labels = useMemo(
    () => ({
      min: scope === "jobs" ? "Min Budget" : "Min Rate",
      max: scope === "jobs" ? "Max Budget" : "Max Rate",
      minPlaceholder: scope === "jobs" ? "e.g. 500" : "e.g. 60",
      maxPlaceholder: scope === "jobs" ? "e.g. 5000" : "e.g. 140",
    }),
    [scope]
  );

  useEffect(() => {
    setScope(getScopeFromRole(user?.role));
  }, [user?.role]);

  useEffect(() => {
    setStatus("open");
    setSort("newest");
    setQuery("");
    setSkills("");
    setMinValue("");
    setMaxValue("");
  }, [scope]);

  const loadSearches = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await savedApi.listSearches({ scope });
      const simpleDiscoveryViews = (response.data || []).filter((item) => {
        const filters = (item.filters || {}) as Record<string, unknown>;
        return filters.mode !== "pipeline";
      });
      setSearches(simpleDiscoveryViews);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to load saved searches.");
      setSearches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSearches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  const buildFiltersFromForm = () => {
    if (scope === "jobs") {
      return {
        status,
        ...(query.trim() && { search: query.trim() }),
        ...(skills.trim() && { skills: skills.trim() }),
        ...(minValue.trim() && { min: minValue.trim() }),
        ...(maxValue.trim() && { max: maxValue.trim() }),
        ...(sort && { sort }),
      };
    }

    return {
      ...(query.trim() && { search: query.trim() }),
      ...(skills.trim() && { skills: skills.trim() }),
      ...(minValue.trim() && { minRate: minValue.trim() }),
      ...(maxValue.trim() && { maxRate: maxValue.trim() }),
      ...(sort && { sort }),
    };
  };

  const createSearch = async () => {
    const trimmedName = newName.trim();
    if (!trimmedName) {
      setError("Search name is required.");
      return;
    }

    const filters = buildFiltersFromForm();

    setCreating(true);
    setError("");
    setMessage("");
    try {
      await savedApi.createSearch({
        name: trimmedName,
        scope,
        filters,
        isPinned: false,
      });
      setNewName("");
      setMessage("Saved search created.");
      await loadSearches();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to create search.");
    } finally {
      setCreating(false);
    }
  };

  const togglePinned = async (search: SavedSearch) => {
    setError("");
    setMessage("");
    try {
      await savedApi.updateSearch(search._id, { isPinned: !search.isPinned });
      await loadSearches();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to update search.");
    }
  };

  const removeSearch = async (searchId: string) => {
    setError("");
    setMessage("");
    try {
      await savedApi.deleteSearch(searchId);
      setSearches((prev) => prev.filter((search) => search._id !== searchId));
      setMessage("Saved search deleted.");
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to delete search.");
    }
  };

  const markUsed = async (searchId: string) => {
    try {
      await savedApi.markSearchUsed(searchId);
    } catch {
      // Non-blocking telemetry action.
    }
  };

  return (
    <div className="container py-8 space-y-6">
      <section className="panel p-6 md:p-8">
        <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-bold text-sky-300">
          <Bookmark className="h-4 w-4" />
          Saved Searches
        </p>
        <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-white">Save searches without JSON</h1>
        <p className="mt-2 text-slate-300">Use plain filters, save once, and reopen from this page any time.</p>
      </section>

      {error && <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}
      {message && <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">{message}</div>}

      <section className="panel p-5 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="saved-search-scope">Scope</Label>
            <select
              id="saved-search-scope"
              value={scope}
              onChange={(event) => setScope(event.target.value as SearchScope)}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-white"
            >
              <option value="jobs">Jobs</option>
              <option value="experts">Experts</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="saved-search-name">Name</Label>
            <Input
              id="saved-search-name"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder={scope === "jobs" ? "Open webhook jobs" : "Senior US-based experts"}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2 xl:col-span-2">
            <Label htmlFor="saved-search-query">Query</Label>
            <Input id="saved-search-query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Title, skill, stack, profile..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="saved-search-skills">Skills</Label>
            <Input id="saved-search-skills" value={skills} onChange={(event) => setSkills(event.target.value)} placeholder="n8n, slack, hubspot" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="saved-search-sort">Sort</Label>
            <select
              id="saved-search-sort"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-white"
            >
              {scope === "jobs" ? (
                <>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="budgetDesc">High budget</option>
                  <option value="budgetAsc">Low budget</option>
                </>
              ) : (
                <>
                  <option value="newest">Newest</option>
                  <option value="rateDesc">Highest rate</option>
                  <option value="rateAsc">Lowest rate</option>
                  <option value="projects">Most projects</option>
                </>
              )}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="saved-search-min">{labels.min}</Label>
            <Input id="saved-search-min" value={minValue} onChange={(event) => setMinValue(event.target.value)} placeholder={labels.minPlaceholder} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="saved-search-max">{labels.max}</Label>
            <Input id="saved-search-max" value={maxValue} onChange={(event) => setMaxValue(event.target.value)} placeholder={labels.maxPlaceholder} />
          </div>
          {scope === "jobs" && (
            <div className="space-y-2">
              <Label htmlFor="saved-search-status">Status</Label>
              <select
                id="saved-search-status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-white"
              >
                <option value="open">Open</option>
                <option value="in_progress">In progress</option>
                <option value="completed">Completed</option>
                <option value="closed">Closed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}
        </div>

        <Button onClick={createSearch} disabled={creating}>
          {creating ? "Saving..." : "Save search"}
        </Button>
      </section>

      <section className="panel p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Your saved {scope}</h2>
          <Badge variant="outline">{searches.length}</Badge>
        </div>

        <div className="mt-4 space-y-3">
          {loading && <p className="text-sm text-slate-300">Loading saved searches...</p>}
          {!loading && searches.length === 0 && <p className="text-sm text-slate-300">No saved searches yet.</p>}

          {searches.map((search) => {
            const linkTarget = buildSearchLink(search.scope, (search.filters || {}) as Record<string, unknown>);
            return (
              <article key={search._id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{search.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{formatFilterSummary((search.filters || {}) as Record<string, unknown>)}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-wider text-slate-500">
                      Updated {new Date(search.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {search.isPinned && <Badge variant="secondary">Pinned</Badge>}
                    <Badge variant="outline">{search.scope}</Badge>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link to={linkTarget} onClick={() => markUsed(search._id)} className="text-xs text-sky-300 hover:underline">
                    Open search
                  </Link>
                  <Button size="sm" variant="outline" onClick={() => togglePinned(search)}>
                    {search.isPinned ? <PinOff className="h-4 w-4 mr-1" /> : <Pin className="h-4 w-4 mr-1" />}
                    {search.isPinned ? "Unpin" : "Pin"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => removeSearch(search._id)}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
