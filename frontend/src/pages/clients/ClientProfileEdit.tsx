import { useMemo, useState } from "react";
import { Building2, Save } from "lucide-react";
import { clientApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { ClientTrustMetrics } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ClientProfileEdit() {
  const { user, refreshSession } = useAuth();
  const [formData, setFormData] = useState({
    desc: user?.desc || "",
    country: user?.country || "",
    companyName: user?.companyName || "",
    companyWebsite: user?.companyWebsite || "",
    companySize: user?.companySize || "",
    industry: user?.industry || "",
    foundedYear: user?.foundedYear ? String(user.foundedYear) : "",
    location: user?.location || "",
    teamDescription: user?.teamDescription || "",
    logoUrl: user?.logoUrl || "",
    projectPreferences: (user?.projectPreferences || []).join(", "),
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [trustMetrics, setTrustMetrics] = useState<ClientTrustMetrics | null>(null);

  const canSubmit = useMemo(() => Boolean(user && user.role === "client"), [user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    setSaving(true);
    setMessage("");
    try {
      const response = await clientApi.updateMyProfile({
        desc: formData.desc.trim() || undefined,
        country: formData.country.trim() || undefined,
        companyName: formData.companyName.trim() || undefined,
        companyWebsite: formData.companyWebsite.trim() || undefined,
        companySize: formData.companySize.trim() || undefined,
        industry: formData.industry.trim() || undefined,
        foundedYear: formData.foundedYear ? Number(formData.foundedYear) : undefined,
        location: formData.location.trim() || undefined,
        teamDescription: formData.teamDescription.trim() || undefined,
        logoUrl: formData.logoUrl.trim() || undefined,
        projectPreferences: formData.projectPreferences
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });

      if (response.data.trustMetrics) {
        setTrustMetrics(response.data.trustMetrics);
      }
      await refreshSession();
      setMessage("Client profile updated.");
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setMessage(apiError.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-8">
      <section className="panel p-6 md:p-8 mb-6">
        <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] font-bold text-sky-300">
          <Building2 className="h-4 w-4" />
          Client Profile
        </p>
        <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-white">Company and hiring profile</h1>
        <p className="mt-2 text-slate-300 max-w-2xl">
          Keep this profile up to date so experts understand your team context and project expectations before applying.
        </p>
      </section>

      {message && <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-200 mb-5">{message}</div>}

      <form onSubmit={handleSubmit} className="panel p-6 space-y-5">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name</Label>
            <Input id="company-name" value={formData.companyName} onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-website">Company Website</Label>
            <Input
              id="company-website"
              value={formData.companyWebsite}
              onChange={(e) => setFormData((prev) => ({ ...prev, companyWebsite: e.target.value }))}
              placeholder="https://"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input id="industry" value={formData.industry} onChange={(e) => setFormData((prev) => ({ ...prev, industry: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-size">Company Size</Label>
            <Input id="company-size" value={formData.companySize} onChange={(e) => setFormData((prev) => ({ ...prev, companySize: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="founded-year">Founded Year</Label>
            <Input
              id="founded-year"
              type="number"
              min="1900"
              max="2100"
              value={formData.foundedYear}
              onChange={(e) => setFormData((prev) => ({ ...prev, foundedYear: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={formData.location} onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" value={formData.country} onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo-url">Logo URL</Label>
            <Input id="logo-url" value={formData.logoUrl} onChange={(e) => setFormData((prev) => ({ ...prev, logoUrl: e.target.value }))} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="team-description">Team Description</Label>
          <Textarea
            id="team-description"
            className="min-h-[120px]"
            value={formData.teamDescription}
            onChange={(e) => setFormData((prev) => ({ ...prev, teamDescription: e.target.value }))}
            placeholder="What your team builds and how you work with external experts."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hiring-bio">Hiring Bio</Label>
          <Textarea
            id="hiring-bio"
            className="min-h-[120px]"
            value={formData.desc}
            onChange={(e) => setFormData((prev) => ({ ...prev, desc: e.target.value }))}
            placeholder="Describe your project style and collaboration expectations."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="project-preferences">Project Preferences (comma separated)</Label>
          <Input
            id="project-preferences"
            value={formData.projectPreferences}
            onChange={(e) => setFormData((prev) => ({ ...prev, projectPreferences: e.target.value }))}
            placeholder="API integrations, CRM automation, AI workflows"
          />
        </div>

        <Button type="submit" disabled={!canSubmit || saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Client Profile"}
        </Button>
      </form>

      {trustMetrics && (
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <article className="panel p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Jobs Posted</p>
            <p className="mt-2 text-2xl font-bold text-white">{trustMetrics.jobsPosted}</p>
          </article>
          <article className="panel p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Jobs Completed</p>
            <p className="mt-2 text-2xl font-bold text-white">{trustMetrics.jobsCompleted}</p>
          </article>
          <article className="panel p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Hire Rate</p>
            <p className="mt-2 text-2xl font-bold text-white">{trustMetrics.hireRate}%</p>
          </article>
          <article className="panel p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Avg Response</p>
            <p className="mt-2 text-2xl font-bold text-white">{trustMetrics.avgResponseHours}h</p>
          </article>
        </section>
      )}
    </div>
  );
}
