import { useEffect, useState } from "react";
import { FolderKanban, Save, Trash2, UserRoundCheck } from "lucide-react";
import { expertApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { PortfolioItem, ProfileCompleteness } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const engagementOptions = ["fixed", "hourly", "consulting"] as const;

export default function ExpertWizard() {
  const { user, refreshSession } = useAuth();
  const [profileData, setProfileData] = useState({
    headline: "",
    desc: "",
    hourlyRate: "",
    skills: "",
    availability: "available" as "available" | "busy" | "unavailable",
    yearsExperience: "",
    languages: "",
    timezone: "",
    industries: "",
    certifications: "",
    preferredEngagements: "",
    minimumProjectBudget: "",
    availabilityHoursPerWeek: "",
    responseSLAHours: "",
    calendarLink: "",
  });
  const [profileCompleteness, setProfileCompleteness] = useState<ProfileCompleteness | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [newItem, setNewItem] = useState({ title: "", summary: "", link: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    setMessage("");
    try {
      const response = await expertApi.getExpertProfile(user._id);
      const profile = response.data.expert;
      setProfileData({
        headline: profile.headline || "",
        desc: profile.desc || "",
        hourlyRate: String(profile.hourlyRate || ""),
        skills: (profile.skills || []).join(", "),
        availability: profile.availability || "available",
        yearsExperience: profile.yearsExperience ? String(profile.yearsExperience) : "",
        languages: (profile.languages || []).join(", "),
        timezone: profile.timezone || "",
        industries: (profile.industries || []).join(", "),
        certifications: (profile.certifications || []).join(", "),
        preferredEngagements: (profile.preferredEngagements || []).join(", "),
        minimumProjectBudget: profile.minimumProjectBudget ? String(profile.minimumProjectBudget) : "",
        availabilityHoursPerWeek: profile.availabilityHoursPerWeek ? String(profile.availabilityHoursPerWeek) : "",
        responseSLAHours: profile.responseSLAHours ? String(profile.responseSLAHours) : "",
        calendarLink: profile.calendarLink || "",
      });
      setPortfolio(response.data.portfolio);
      setProfileCompleteness(response.data.profileCompleteness || null);
    } catch {
      // First setup can return no profile yet.
      setPortfolio([]);
      setProfileCompleteness(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await expertApi.updateMyProfile({
        headline: profileData.headline.trim(),
        desc: profileData.desc.trim(),
        hourlyRate: Number(profileData.hourlyRate || 0),
        availability: profileData.availability,
        skills: profileData.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        yearsExperience: profileData.yearsExperience ? Number(profileData.yearsExperience) : undefined,
        languages: profileData.languages
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        timezone: profileData.timezone.trim() || undefined,
        industries: profileData.industries
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        certifications: profileData.certifications
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        preferredEngagements: profileData.preferredEngagements
          .split(",")
          .map((item) => item.trim())
          .filter(
            (item): item is (typeof engagementOptions)[number] =>
              engagementOptions.includes(item as (typeof engagementOptions)[number])
          ),
        minimumProjectBudget: profileData.minimumProjectBudget ? Number(profileData.minimumProjectBudget) : undefined,
        availabilityHoursPerWeek: profileData.availabilityHoursPerWeek ? Number(profileData.availabilityHoursPerWeek) : undefined,
        responseSLAHours: profileData.responseSLAHours ? Number(profileData.responseSLAHours) : undefined,
        calendarLink: profileData.calendarLink.trim() || undefined,
      });
      await refreshSession();
      setMessage("Profile saved.");
      await loadData();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setMessage(apiError.response?.data?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const addPortfolioItem = async () => {
    if (!newItem.title || !newItem.summary) return;
    setMessage("");
    try {
      const response = await expertApi.createPortfolioItem({
        title: newItem.title.trim(),
        summary: newItem.summary.trim(),
        link: newItem.link.trim() || undefined,
        imageUrl: undefined,
        tags: [],
      });
      setPortfolio((prev) => [response.data, ...prev]);
      setNewItem({ title: "", summary: "", link: "" });
      setMessage("Portfolio item published.");
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setMessage(apiError.response?.data?.message || "Failed to add portfolio item.");
    }
  };

  const removePortfolioItem = async (itemId: string) => {
    setMessage("");
    try {
      await expertApi.deletePortfolioItem(itemId);
      setPortfolio((prev) => prev.filter((item) => item._id !== itemId));
      setMessage("Portfolio item removed.");
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setMessage(apiError.response?.data?.message || "Failed to remove portfolio item.");
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-10 text-[var(--color-text-muted)]">Loading expert setup...</div>;
  }

  return (
    <div className="px-4 py-8">
      <div className="container space-y-6">
        <section className="page-hero panel relative overflow-hidden rounded-3xl px-6 py-8 md:px-8 md:py-10">
          <div className="relative z-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.16em] text-sky-100">
              <UserRoundCheck className="h-3.5 w-3.5" />
              Expert Setup
            </p>
            <h1 className="mt-4 text-3xl font-extrabold text-white md:text-4xl">Publish your expert profile</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
              Add your headline, bio, skills, availability, and portfolio highlights so clients can evaluate you quickly.
            </p>
          </div>
        </section>

        {message && <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">{message}</div>}

        <form onSubmit={saveProfile}>
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Public Profile</CardTitle>
              <CardDescription>These details appear on your public expert page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Headline</Label>
                <Input
                  value={profileData.headline}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, headline: e.target.value }))}
                  placeholder="Senior n8n automation engineer"
                />
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  className="min-h-[140px]"
                  value={profileData.desc}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, desc: e.target.value }))}
                  placeholder="Describe your n8n expertise and delivery approach."
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Hourly Rate</Label>
                  <Input
                    type="number"
                    min="0"
                    value={profileData.hourlyRate}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, hourlyRate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Skills (comma separated)</Label>
                  <Input
                    value={profileData.skills}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, skills: e.target.value }))}
                    placeholder="n8n, API integration, webhooks"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Availability</Label>
                <select
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-white"
                  value={profileData.availability}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      availability: e.target.value as "available" | "busy" | "unavailable",
                    }))
                  }
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
              <details className="rounded-xl border border-white/10 bg-white/5 p-3">
                <summary className="cursor-pointer text-sm font-semibold text-white">Experience and credibility (optional)</summary>
                <div className="grid gap-4 sm:grid-cols-2 mt-3">
                  <div className="space-y-2">
                    <Label>Years of Experience</Label>
                    <Input
                      type="number"
                      min="0"
                      value={profileData.yearsExperience}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, yearsExperience: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Input
                      value={profileData.timezone}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, timezone: e.target.value }))}
                      placeholder="UTC+1, America/New_York"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Languages (comma separated)</Label>
                    <Input
                      value={profileData.languages}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, languages: e.target.value }))}
                      placeholder="English, Spanish"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Industries (comma separated)</Label>
                    <Input
                      value={profileData.industries}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, industries: e.target.value }))}
                      placeholder="E-commerce, SaaS, Fintech"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Certifications (comma separated)</Label>
                    <Input
                      value={profileData.certifications}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, certifications: e.target.value }))}
                    />
                  </div>
                </div>
              </details>

              <details className="rounded-xl border border-white/10 bg-white/5 p-3">
                <summary className="cursor-pointer text-sm font-semibold text-white">Work preferences and availability (optional)</summary>
                <div className="grid gap-4 sm:grid-cols-2 mt-3">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Preferred Engagements (fixed, hourly, consulting)</Label>
                    <Input
                      value={profileData.preferredEngagements}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, preferredEngagements: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum Project Budget</Label>
                    <Input
                      type="number"
                      min="0"
                      value={profileData.minimumProjectBudget}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, minimumProjectBudget: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Availability (hours/week)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="168"
                      value={profileData.availabilityHoursPerWeek}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, availabilityHoursPerWeek: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Response SLA (hours)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={profileData.responseSLAHours}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, responseSLAHours: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Calendar Link</Label>
                    <Input
                      value={profileData.calendarLink}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, calendarLink: e.target.value }))}
                      placeholder="https://cal.com/..."
                    />
                  </div>
                </div>
              </details>
              {profileCompleteness && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-wider text-slate-400">Profile completeness</p>
                  <div className="mt-2 h-2 rounded-full bg-white/10">
                    <div className="h-2 rounded-full bg-sky-300" style={{ width: `${profileCompleteness.score}%` }} />
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{profileCompleteness.score}% complete</p>
                </div>
              )}
              <Button type="submit" disabled={saving} className="inline-flex items-center gap-2">
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </CardContent>
          </Card>
        </form>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              <FolderKanban className="h-5 w-5" />
              Portfolio
            </CardTitle>
            <CardDescription>Add and publish your best work.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {portfolio.length === 0 && <p className="text-sm text-[var(--color-text-muted)]">No portfolio items yet.</p>}
              {portfolio.map((item) => (
                <article key={item._id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-white">{item.title}</h3>
                      <p className="mt-1 text-sm text-slate-300">{item.summary}</p>
                      {item.link && (
                        <a href={item.link} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-primary hover:underline">
                          View link
                        </a>
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => removePortfolioItem(item._id)} className="inline-flex items-center gap-1.5">
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </article>
              ))}
            </div>

            <div className="space-y-3 border-t border-white/10 pt-4">
              <Label>New Portfolio Item</Label>
              <Input
                placeholder="Title"
                value={newItem.title}
                onChange={(e) => setNewItem((prev) => ({ ...prev, title: e.target.value }))}
              />
              <Textarea
                placeholder="Summary"
                className="min-h-[120px]"
                value={newItem.summary}
                onChange={(e) => setNewItem((prev) => ({ ...prev, summary: e.target.value }))}
              />
              <Input
                placeholder="Link (optional)"
                value={newItem.link}
                onChange={(e) => setNewItem((prev) => ({ ...prev, link: e.target.value }))}
              />
              <Button onClick={addPortfolioItem}>Publish Portfolio Item</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
