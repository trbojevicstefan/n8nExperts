import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, FolderKanban, Save, Sparkles, Trash2, UserRoundCheck } from "lucide-react";
import { expertApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useRouteFlash } from "@/hooks/useRouteFlash";
import type { FormFeedbackState, PortfolioItem, ProfileCompleteness } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { errorFieldClassName, FieldErrorText, FormBanner } from "@/components/forms/FormFeedback";
import { AppPageHeader, ContextAside, EmptyState, StatStrip } from "@/components/layout/PagePrimitives";
import { createLocalFormFeedback, getFieldFeedback, getFormFeedback } from "@/lib/form-feedback";
import { cn } from "@/lib/utils";

const engagementOptions = ["fixed", "hourly", "consulting"] as const;

const emptyProfileData = {
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
};

const stepLabels = [
  { step: 1, title: "Basics", description: "Positioning clients read first." },
  { step: 2, title: "Proof", description: "Add one work sample or service." },
  { step: 3, title: "Finish profile", description: "Add the details that improve fit." },
] as const;

const parseCommaList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export default function ExpertWizard() {
  const { user, refreshSession } = useAuth();
  const flash = useRouteFlash();
  const [profileData, setProfileData] = useState(emptyProfileData);
  const [profileCompleteness, setProfileCompleteness] = useState<ProfileCompleteness | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [servicesCount, setServicesCount] = useState(0);
  const [newItem, setNewItem] = useState({ title: "", summary: "", link: "" });
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(true);
  const [savingStep, setSavingStep] = useState<"basics" | "details" | null>(null);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [formFeedback, setFormFeedback] = useState<FormFeedbackState | null>(null);

  const loadData = async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!user) return;
    if (!silent) {
      setLoading(true);
    }

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
      setServicesCount(response.data.services.length);
      setProfileCompleteness(response.data.profileCompleteness || null);
    } catch {
      setPortfolio([]);
      setServicesCount(0);
      setProfileCompleteness(null);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const basicsComplete = useMemo(
    () =>
      Boolean(
        profileData.headline.trim() &&
          profileData.desc.trim() &&
          parseCommaList(profileData.skills).length > 0 &&
          Number(profileData.hourlyRate || 0) > 0 &&
          profileData.availability
      ),
    [profileData]
  );

  const hasProof = portfolio.length > 0 || servicesCount > 0;
  const usableProfile = basicsComplete && hasProof;
  const optionalSignalCount = useMemo(() => {
    const values = [
      Number(profileData.yearsExperience || 0) > 0,
      parseCommaList(profileData.languages).length > 0,
      Boolean(profileData.timezone.trim()),
      parseCommaList(profileData.industries).length > 0,
      parseCommaList(profileData.certifications).length > 0,
      parseCommaList(profileData.preferredEngagements).length > 0,
      Number(profileData.minimumProjectBudget || 0) > 0,
      Number(profileData.availabilityHoursPerWeek || 0) > 0,
      Number(profileData.responseSLAHours || 0) > 0,
      Boolean(profileData.calendarLink.trim()),
    ];
    return values.filter(Boolean).length;
  }, [profileData]);

  useEffect(() => {
    if (!basicsComplete) {
      setActiveStep(1);
      return;
    }

    if (!hasProof) {
      setActiveStep(2);
      return;
    }

    if (optionalSignalCount === 0) {
      setActiveStep(3);
    }
  }, [basicsComplete, hasProof, optionalSignalCount]);

  const saveBasics = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingStep("basics");
    setFormFeedback(null);
    setMessage(null);

    try {
      await expertApi.updateMyProfile({
        headline: profileData.headline.trim(),
        desc: profileData.desc.trim(),
        hourlyRate: Number(profileData.hourlyRate || 0),
        availability: profileData.availability,
        skills: parseCommaList(profileData.skills),
      });
      await refreshSession();
      await loadData({ silent: true });
      setActiveStep(hasProof ? 3 : 2);
      setMessage({
        tone: "success",
        text: hasProof
          ? "Step 1 saved. Your positioning is live. Finish the profile details when you are ready."
          : "Step 1 saved. Next add one work sample or service to reach a usable-profile milestone.",
      });
    } catch (err: unknown) {
      setFormFeedback(getFormFeedback(err, "We could not save step 1. Please review the highlighted fields and try again."));
    } finally {
      setSavingStep(null);
    }
  };

  const saveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingStep("details");
    setFormFeedback(null);
    setMessage(null);

    try {
      await expertApi.updateMyProfile({
        yearsExperience: profileData.yearsExperience ? Number(profileData.yearsExperience) : undefined,
        languages: parseCommaList(profileData.languages),
        timezone: profileData.timezone.trim() || undefined,
        industries: parseCommaList(profileData.industries),
        certifications: parseCommaList(profileData.certifications),
        preferredEngagements: parseCommaList(profileData.preferredEngagements).filter(
          (item): item is (typeof engagementOptions)[number] => engagementOptions.includes(item as (typeof engagementOptions)[number])
        ),
        minimumProjectBudget: profileData.minimumProjectBudget ? Number(profileData.minimumProjectBudget) : undefined,
        availabilityHoursPerWeek: profileData.availabilityHoursPerWeek ? Number(profileData.availabilityHoursPerWeek) : undefined,
        responseSLAHours: profileData.responseSLAHours ? Number(profileData.responseSLAHours) : undefined,
        calendarLink: profileData.calendarLink.trim() || undefined,
      });
      await refreshSession();
      await loadData({ silent: true });
      setMessage({
        tone: "success",
        text: "Step 3 saved. Your availability and working-style details are now visible to clients.",
      });
    } catch (err: unknown) {
      setFormFeedback(getFormFeedback(err, "We could not save step 3. Please review the highlighted fields and try again."));
    } finally {
      setSavingStep(null);
    }
  };

  const addPortfolioItem = async () => {
    if (!newItem.title.trim() || !newItem.summary.trim()) {
      setFormFeedback(
        createLocalFormFeedback("Please add a title and a summary before publishing this work sample.", [
          ...(!newItem.title.trim() ? [{ field: "title", message: "Add a title for this work sample." }] : []),
          ...(!newItem.summary.trim() ? [{ field: "summary", message: "Add a summary that explains the work and result." }] : []),
        ])
      );
      return;
    }

    setFormFeedback(null);
    setMessage(null);
    try {
      await expertApi.createPortfolioItem({
        title: newItem.title.trim(),
        summary: newItem.summary.trim(),
        link: newItem.link.trim() || undefined,
        imageUrl: undefined,
        tags: [],
      });
      setNewItem({ title: "", summary: "", link: "" });
      await loadData({ silent: true });
      setMessage({
        tone: "success",
        text: basicsComplete
          ? "Step 2 saved. One strong work sample is enough to make this a usable client-facing profile."
          : "Work sample published. Finish your basics next so clients can understand the full profile.",
      });
    } catch (err: unknown) {
      setFormFeedback(getFormFeedback(err, "We could not publish this work sample. Please review the highlighted fields and try again."));
    }
  };

  const removePortfolioItem = async (itemId: string) => {
    setFormFeedback(null);
    setMessage(null);
    try {
      await expertApi.deletePortfolioItem(itemId);
      await loadData({ silent: true });
      setMessage({ tone: "success", text: "Work sample removed." });
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setMessage({ tone: "error", text: apiError.response?.data?.message || "Failed to remove work sample." });
    }
  };

  const updateProfileField = <K extends keyof typeof emptyProfileData>(field: K, value: (typeof emptyProfileData)[K]) => {
    if (formFeedback) {
      setFormFeedback(null);
    }
    if (message?.tone === "success") {
      setMessage(null);
    }
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const updateNewItemField = <K extends keyof typeof newItem>(field: K, value: (typeof newItem)[K]) => {
    if (formFeedback) {
      setFormFeedback(null);
    }
    if (message?.tone === "success") {
      setMessage(null);
    }
    setNewItem((prev) => ({ ...prev, [field]: value }));
  };

  const fieldError = (field: string, aliases: string[] = []) => getFieldFeedback(formFeedback, field, aliases);

  const stepStatus = [
    basicsComplete ? "Complete" : "Required",
    hasProof ? "Complete" : "Needed for usable profile",
    optionalSignalCount > 0 ? `${optionalSignalCount} details added` : "Optional",
  ];

  const previewSkills = parseCommaList(profileData.skills);

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
              Expert setup
            </>
          }
          title="Set up your expert profile in three steps"
          description="Start with the few signals clients use first, add one piece of proof, then finish the details that help them decide whether to reach out."
        >
          <StatStrip
            items={[
              { label: "Step 1", value: basicsComplete ? "Ready" : "In progress" },
              { label: "Proof items", value: portfolio.length + servicesCount },
              { label: "Milestone", value: usableProfile ? "Usable profile live" : "Not there yet", hint: "Basics plus one work sample or service is enough." },
              { label: "Profile score", value: profileCompleteness ? `${profileCompleteness.score}%` : "Not scored" },
            ]}
          />
        </AppPageHeader>

        {flash && (
          <div
            className={`rounded-xl px-3 py-2 text-sm ${
              flash.tone === "success"
                ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                : flash.tone === "error"
                  ? "border border-red-500/20 bg-red-500/10 text-red-200"
                  : "border border-sky-500/20 bg-sky-500/10 text-sky-200"
            }`}
          >
            {flash.text}
          </div>
        )}

        {message && (
          <FormBanner tone={message.tone === "success" ? "success" : "error"} message={message.text} />
        )}

        <div className="grid gap-3 md:grid-cols-3">
          {stepLabels.map((item, index) => {
            const currentStep = (index + 1) as 1 | 2 | 3;
            const isActive = activeStep === currentStep;
            return (
              <button
                key={item.step}
                type="button"
                onClick={() => setActiveStep(currentStep)}
                className={`rounded-2xl border p-4 text-left transition ${
                  isActive
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">
                    {item.step}. {item.title}
                  </p>
                  <Badge variant={stepStatus[index] === "Complete" ? "success" : "outline"}>{stepStatus[index]}</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{item.description}</p>
              </button>
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            {activeStep === 1 && (
              <form onSubmit={saveBasics}>
                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle>Step 1. Basics</CardTitle>
                    <CardDescription>Keep this step minimal: headline, core value, skills, rate, and availability.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <FormBanner message={formFeedback?.summary} />
                    <div className="space-y-2">
                      <Label htmlFor="expert-headline">Headline</Label>
                      <Input
                        id="expert-headline"
                        className={fieldError("headline") ? errorFieldClassName : undefined}
                        value={profileData.headline}
                        onChange={(e) => updateProfileField("headline", e.target.value)}
                        placeholder="n8n builder for support ops, CRM workflows, and handoff-ready automations"
                        aria-invalid={Boolean(fieldError("headline"))}
                        required
                      />
                      <FieldErrorText message={fieldError("headline")} />
                      <p className="text-xs text-[var(--color-text-muted)]">
                        Strong examples say what you build, for whom, or the type of system you own end to end.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expert-bio">Core value</Label>
                      <Textarea
                        id="expert-bio"
                        className={cn("min-h-[150px]", fieldError("desc") && errorFieldClassName)}
                        value={profileData.desc}
                        onChange={(e) => updateProfileField("desc", e.target.value)}
                        placeholder="I build n8n workflows for teams that need HubSpot, Slack, internal tools, or support systems to stay in sync. My projects usually include retries, alerting, and handoff notes so the workflow stays manageable after launch."
                        aria-invalid={Boolean(fieldError("desc"))}
                        required
                      />
                      <FieldErrorText message={fieldError("desc")} />
                      <p className="text-xs text-[var(--color-text-muted)]">
                        Write this like a client summary, not a resume. Mention the systems, outcome, and reliability angle they can expect.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="expert-skills">Skills (comma separated)</Label>
                        <Input
                          id="expert-skills"
                          className={fieldError("skills") ? errorFieldClassName : undefined}
                          value={profileData.skills}
                          onChange={(e) => updateProfileField("skills", e.target.value)}
                          placeholder="n8n, HubSpot, Slack, webhooks, API integration"
                          aria-invalid={Boolean(fieldError("skills"))}
                          required
                        />
                        <FieldErrorText message={fieldError("skills")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expert-hourly-rate">Rate</Label>
                        <Input
                          id="expert-hourly-rate"
                          type="number"
                          min="1"
                          className={fieldError("hourlyRate") ? errorFieldClassName : undefined}
                          value={profileData.hourlyRate}
                          onChange={(e) => updateProfileField("hourlyRate", e.target.value)}
                          aria-invalid={Boolean(fieldError("hourlyRate"))}
                          required
                        />
                        <FieldErrorText message={fieldError("hourlyRate")} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expert-availability">Availability</Label>
                      <select
                        id="expert-availability"
                        className={cn(
                          "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-white",
                          fieldError("availability") && errorFieldClassName
                        )}
                        value={profileData.availability}
                        onChange={(e) =>
                          updateProfileField("availability", e.target.value as "available" | "busy" | "unavailable")
                        }
                        aria-invalid={Boolean(fieldError("availability"))}
                      >
                        <option value="available">Available</option>
                        <option value="busy">Busy</option>
                        <option value="unavailable">Unavailable</option>
                      </select>
                      <FieldErrorText message={fieldError("availability")} />
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">How this sounds to a client</p>
                        <p className="mt-3 text-xl font-semibold text-white">{profileData.headline.trim() || "Your headline will show here"}</p>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--color-text-secondary)]">
                          {profileData.desc.trim() || "Clients want a short explanation of the systems you handle, the outcome you deliver, and how reliable the work will feel."}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {previewSkills.length === 0 && <span className="text-sm text-[var(--color-text-secondary)]">Add a few clear skills clients already search for.</span>}
                          {previewSkills.map((skill) => (
                            <Badge key={skill} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        <p className="mt-4 text-sm text-[var(--color-text-secondary)]">
                          {Number(profileData.hourlyRate || 0) > 0
                            ? `Available ${profileData.availability} at $${profileData.hourlyRate}/hr.`
                            : "Add your rate so clients can judge budget fit without guessing."}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-[var(--color-text-secondary)]">
                        <p className="font-semibold text-white">Client reading guidance</p>
                        <p className="mt-2">If the first two lines sound generic, the client will keep scrolling. Lead with your buyer, systems, and outcome.</p>
                        <p className="mt-3">Good direction: "I help support teams fix brittle n8n workflows and add the monitoring they need to trust production."</p>
                      </div>
                    </div>

                    <Button type="submit" disabled={savingStep === "basics"} className="inline-flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      {savingStep === "basics" ? "Saving..." : "Save step 1"}
                    </Button>
                  </CardContent>
                </Card>
              </form>
            )}

            {activeStep === 2 && (
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="inline-flex items-center gap-2">
                    <FolderKanban className="h-5 w-5" />
                    Step 2. Add proof
                  </CardTitle>
                  <CardDescription>One work sample or one service is enough to move this from a profile draft to a usable profile.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <FormBanner message={formFeedback?.summary} />
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{usableProfile ? "Usable profile milestone reached" : "Usable profile milestone not reached yet"}</p>
                        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                          {usableProfile
                            ? "Clients can now understand your positioning and see at least one piece of proof."
                            : "Finish step 1, then publish one work sample or service so your profile feels credible on first read."}
                        </p>
                      </div>
                      {usableProfile && (
                        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-200">
                          <CheckCircle2 className="h-4 w-4" />
                          Ready to share
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                    <div className="space-y-3">
                      {portfolio.length === 0 && (
                        <EmptyState
                          title="No work samples yet."
                          description="Add one example below that explains what changed after your work went live. One clear proof item is enough for this step."
                          className="py-6"
                        />
                      )}
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

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-[var(--color-text-secondary)]">
                      <p className="font-semibold text-white">Alternative proof path</p>
                      <p className="mt-2">You already have {servicesCount} published service{servicesCount === 1 ? "" : "s"}.</p>
                      <p className="mt-3">If a client can compare one service and one clear profile, that is already a usable profile.</p>
                      <Link to="/expert/services" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:underline">
                        <Sparkles className="h-4 w-4" />
                        Manage services
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-white/10 pt-4">
                    <Label htmlFor="expert-portfolio-title">New work sample</Label>
                    <Input
                      id="expert-portfolio-title"
                      className={fieldError("title") ? errorFieldClassName : undefined}
                      placeholder="Example: Rebuilt a brittle support triage workflow with retries and alerting"
                      value={newItem.title}
                      onChange={(e) => updateNewItemField("title", e.target.value)}
                      aria-invalid={Boolean(fieldError("title"))}
                    />
                    <FieldErrorText message={fieldError("title")} />
                    <Textarea
                      id="expert-portfolio-summary"
                      placeholder="Say what was broken or needed, what you built, and what changed after launch."
                      className={cn("min-h-[140px]", fieldError("summary") && errorFieldClassName)}
                      value={newItem.summary}
                      onChange={(e) => updateNewItemField("summary", e.target.value)}
                      aria-invalid={Boolean(fieldError("summary"))}
                    />
                    <FieldErrorText message={fieldError("summary")} />
                    <Input
                      id="expert-portfolio-link"
                      className={fieldError("link") ? errorFieldClassName : undefined}
                      placeholder="Link (optional)"
                      value={newItem.link}
                      onChange={(e) => updateNewItemField("link", e.target.value)}
                      aria-invalid={Boolean(fieldError("link"))}
                    />
                    <FieldErrorText message={fieldError("link")} />
                    <Button onClick={addPortfolioItem}>Publish work sample</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeStep === 3 && (
              <form onSubmit={saveDetails}>
                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle>Step 3. Finish profile</CardTitle>
                    <CardDescription>Add the extra signals that help clients understand how you work and whether the engagement logistics line up.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <FormBanner message={formFeedback?.summary} />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="expert-years-experience">Years of experience</Label>
                        <Input
                          id="expert-years-experience"
                          type="number"
                          min="0"
                          className={fieldError("yearsExperience") ? errorFieldClassName : undefined}
                          value={profileData.yearsExperience}
                          onChange={(e) => updateProfileField("yearsExperience", e.target.value)}
                          aria-invalid={Boolean(fieldError("yearsExperience"))}
                        />
                        <FieldErrorText message={fieldError("yearsExperience")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expert-timezone">Timezone</Label>
                        <Input
                          id="expert-timezone"
                          className={fieldError("timezone") ? errorFieldClassName : undefined}
                          value={profileData.timezone}
                          onChange={(e) => updateProfileField("timezone", e.target.value)}
                          placeholder="UTC+1, America/New_York"
                          aria-invalid={Boolean(fieldError("timezone"))}
                        />
                        <FieldErrorText message={fieldError("timezone")} />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="expert-languages">Languages (comma separated)</Label>
                        <Input
                          id="expert-languages"
                          className={fieldError("languages") ? errorFieldClassName : undefined}
                          value={profileData.languages}
                          onChange={(e) => updateProfileField("languages", e.target.value)}
                          placeholder="English, Serbian"
                          aria-invalid={Boolean(fieldError("languages"))}
                        />
                        <FieldErrorText message={fieldError("languages")} />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="expert-industries">Industries (comma separated)</Label>
                        <Input
                          id="expert-industries"
                          className={fieldError("industries") ? errorFieldClassName : undefined}
                          value={profileData.industries}
                          onChange={(e) => updateProfileField("industries", e.target.value)}
                          placeholder="SaaS, support ops, ecommerce"
                          aria-invalid={Boolean(fieldError("industries"))}
                        />
                        <FieldErrorText message={fieldError("industries")} />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="expert-certifications">Certifications (comma separated)</Label>
                        <Input
                          id="expert-certifications"
                          className={fieldError("certifications") ? errorFieldClassName : undefined}
                          value={profileData.certifications}
                          onChange={(e) => updateProfileField("certifications", e.target.value)}
                          placeholder="n8n certification, AWS Practitioner"
                          aria-invalid={Boolean(fieldError("certifications"))}
                        />
                        <FieldErrorText message={fieldError("certifications")} />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="expert-preferred-engagements">Preferred engagements (fixed, hourly, consulting)</Label>
                        <Input
                          id="expert-preferred-engagements"
                          className={fieldError("preferredEngagements") ? errorFieldClassName : undefined}
                          value={profileData.preferredEngagements}
                          onChange={(e) => updateProfileField("preferredEngagements", e.target.value)}
                          aria-invalid={Boolean(fieldError("preferredEngagements"))}
                        />
                        <FieldErrorText message={fieldError("preferredEngagements")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expert-minimum-project-budget">Minimum project budget</Label>
                        <Input
                          id="expert-minimum-project-budget"
                          type="number"
                          min="0"
                          className={fieldError("minimumProjectBudget") ? errorFieldClassName : undefined}
                          value={profileData.minimumProjectBudget}
                          onChange={(e) => updateProfileField("minimumProjectBudget", e.target.value)}
                          aria-invalid={Boolean(fieldError("minimumProjectBudget"))}
                        />
                        <FieldErrorText message={fieldError("minimumProjectBudget")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expert-availability-hours">Availability (hours/week)</Label>
                        <Input
                          id="expert-availability-hours"
                          type="number"
                          min="0"
                          max="168"
                          className={fieldError("availabilityHoursPerWeek") ? errorFieldClassName : undefined}
                          value={profileData.availabilityHoursPerWeek}
                          onChange={(e) => updateProfileField("availabilityHoursPerWeek", e.target.value)}
                          aria-invalid={Boolean(fieldError("availabilityHoursPerWeek"))}
                        />
                        <FieldErrorText message={fieldError("availabilityHoursPerWeek")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expert-response-sla">Response SLA (hours)</Label>
                        <Input
                          id="expert-response-sla"
                          type="number"
                          min="0"
                          className={fieldError("responseSLAHours") ? errorFieldClassName : undefined}
                          value={profileData.responseSLAHours}
                          onChange={(e) => updateProfileField("responseSLAHours", e.target.value)}
                          aria-invalid={Boolean(fieldError("responseSLAHours"))}
                        />
                        <FieldErrorText message={fieldError("responseSLAHours")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expert-calendar-link">Calendar link</Label>
                        <Input
                          id="expert-calendar-link"
                          className={fieldError("calendarLink") ? errorFieldClassName : undefined}
                          value={profileData.calendarLink}
                          onChange={(e) => updateProfileField("calendarLink", e.target.value)}
                          placeholder="https://cal.com/..."
                          aria-invalid={Boolean(fieldError("calendarLink"))}
                        />
                        <FieldErrorText message={fieldError("calendarLink")} />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-[var(--color-text-secondary)]">
                      <p className="font-semibold text-white">What these details change</p>
                      <p className="mt-2">They help clients decide if your timezone, communication pace, and budget fit are workable before they invite you.</p>
                    </div>

                    <Button type="submit" disabled={savingStep === "details"} className="inline-flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      {savingStep === "details" ? "Saving..." : "Save step 3"}
                    </Button>
                  </CardContent>
                </Card>
              </form>
            )}
          </div>

          <ContextAside
            eyebrow="Setup progress"
            title="Build the version a client can judge in one pass."
            description="Clients do not need every detail up front. They need clear positioning, one piece of proof, and enough logistics to know whether the next conversation is worth having."
            className="h-fit lg:sticky"
            style={{ top: "calc(var(--chrome-sticky-offset) + 0.5rem)" }}
          >
            <div className="space-y-3 text-sm text-[var(--color-text-secondary)]">
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <p className="font-semibold text-white">Step 1 matters most</p>
                <p className="mt-2">Headline, core value, skills, rate, and availability are the first decision layer.</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <p className="font-semibold text-white">One proof item is enough</p>
                <p className="mt-2">A single work sample or service already makes the profile feel materially more trustworthy.</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <p className="font-semibold text-white">Optional details sharpen fit</p>
                <p className="mt-2">Timezone, working style, and budget context help the right clients self-select faster.</p>
              </div>
            </div>
          </ContextAside>
        </div>
      </div>
    </div>
  );
}
