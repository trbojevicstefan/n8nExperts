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
import { AppPageHeader, ContextAside, StatStrip } from "@/components/layout/PagePrimitives";

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
      await loadData();
      setMessage("Profile saved.");
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
        <AppPageHeader
          eyebrow={
            <>
              <UserRoundCheck className="h-3.5 w-3.5" />
              Profile setup
            </>
          }
          title="Set up your expert profile"
          description="Start with the basics clients care about first: what you do, what you charge, and what kind of work you can handle."
        >
          <StatStrip
            items={[
              { label: "Work samples", value: portfolio.length },
              { label: "Profile score", value: profileCompleteness ? `${profileCompleteness.score}%` : "Not scored" },
              { label: "Goal", value: "Easy to trust", hint: "A clear profile gets more replies than a vague one." },
            ]}
          />
        </AppPageHeader>

        {message && <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">{message}</div>}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <form onSubmit={saveProfile}>
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Start with the basics</CardTitle>
              <CardDescription>These are the first things clients will look at on your profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="expert-headline">Headline</Label>
                <Input
                  id="expert-headline"
                  value={profileData.headline}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, headline: e.target.value }))}
                  placeholder="Senior n8n automation engineer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expert-bio">Bio</Label>
                <Textarea
                  id="expert-bio"
                  className="min-h-[140px]"
                  value={profileData.desc}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, desc: e.target.value }))}
                  placeholder="Say what you build, who you help, and what makes your work reliable."
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="expert-hourly-rate">Hourly Rate</Label>
                  <Input
                    id="expert-hourly-rate"
                    type="number"
                    min="0"
                    value={profileData.hourlyRate}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, hourlyRate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="expert-skills">Skills (comma separated)</Label>
                  <Input
                    id="expert-skills"
                    value={profileData.skills}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, skills: e.target.value }))}
                    placeholder="n8n, API integration, webhooks"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expert-availability">Availability</Label>
                <select
                  id="expert-availability"
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
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                <p className="font-semibold text-white">Save this first</p>
                <p className="mt-2">You can stop after these basics and come back later for the optional details below.</p>
              </div>
              <details className="rounded-xl border border-white/10 bg-white/5 p-3">
                <summary className="cursor-pointer text-sm font-semibold text-white">Add more details later (optional)</summary>
                <div className="grid gap-4 sm:grid-cols-2 mt-3">
                  <div className="space-y-2">
                    <Label htmlFor="expert-years-experience">Years of Experience</Label>
                    <Input
                      id="expert-years-experience"
                      type="number"
                      min="0"
                      value={profileData.yearsExperience}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, yearsExperience: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expert-timezone">Timezone</Label>
                    <Input
                      id="expert-timezone"
                      value={profileData.timezone}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, timezone: e.target.value }))}
                      placeholder="UTC+1, America/New_York"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="expert-languages">Languages (comma separated)</Label>
                    <Input
                      id="expert-languages"
                      value={profileData.languages}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, languages: e.target.value }))}
                      placeholder="English, Spanish"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="expert-industries">Industries (comma separated)</Label>
                    <Input
                      id="expert-industries"
                      value={profileData.industries}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, industries: e.target.value }))}
                      placeholder="E-commerce, SaaS, Fintech"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="expert-certifications">Certifications (comma separated)</Label>
                    <Input
                      id="expert-certifications"
                      value={profileData.certifications}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, certifications: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="expert-preferred-engagements">Preferred Engagements (fixed, hourly, consulting)</Label>
                    <Input
                      id="expert-preferred-engagements"
                      value={profileData.preferredEngagements}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, preferredEngagements: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expert-minimum-project-budget">Minimum Project Budget</Label>
                    <Input
                      id="expert-minimum-project-budget"
                      type="number"
                      min="0"
                      value={profileData.minimumProjectBudget}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, minimumProjectBudget: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expert-availability-hours">Availability (hours/week)</Label>
                    <Input
                      id="expert-availability-hours"
                      type="number"
                      min="0"
                      max="168"
                      value={profileData.availabilityHoursPerWeek}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, availabilityHoursPerWeek: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expert-response-sla">Response SLA (hours)</Label>
                    <Input
                      id="expert-response-sla"
                      type="number"
                      min="0"
                      value={profileData.responseSLAHours}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, responseSLAHours: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expert-calendar-link">Calendar Link</Label>
                    <Input
                      id="expert-calendar-link"
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
              Add one work sample
            </CardTitle>
            <CardDescription>You do not need a full portfolio to start. One strong example already helps.</CardDescription>
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
              <Label htmlFor="expert-portfolio-title">New Portfolio Item</Label>
              <Input
                id="expert-portfolio-title"
                placeholder="Title"
                value={newItem.title}
                onChange={(e) => setNewItem((prev) => ({ ...prev, title: e.target.value }))}
              />
              <Textarea
                id="expert-portfolio-summary"
                placeholder="Summary"
                className="min-h-[120px]"
                value={newItem.summary}
                onChange={(e) => setNewItem((prev) => ({ ...prev, summary: e.target.value }))}
              />
              <Input
                id="expert-portfolio-link"
                placeholder="Link (optional)"
                value={newItem.link}
                onChange={(e) => setNewItem((prev) => ({ ...prev, link: e.target.value }))}
              />
              <Button onClick={addPortfolioItem}>Publish Portfolio Item</Button>
            </div>
          </CardContent>
        </Card>
        <ContextAside
          eyebrow="Keep it simple"
          title="Clients only need a few things to understand you."
          description="Most people scan headline, bio, skills, rate, availability, and one example of work. Start there."
        >
          <div className="space-y-3 text-sm text-[var(--color-text-secondary)]">
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="font-semibold text-white">Keep the top fields clear</p>
              <p className="mt-2">Say what kind of automation work you do best and what clients can expect from you.</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="font-semibold text-white">Add proof over time</p>
              <p className="mt-2">A service or one work sample makes the profile much easier to trust than a headline alone.</p>
            </div>
          </div>
        </ContextAside>
        </div>
      </div>
    </div>
  );
}
