import { useEffect, useMemo, useState } from "react";
import { Building2, CheckCircle2, CircleDashed, Save, Users } from "lucide-react";
import { clientApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import {
  briefExpertTypeLabels,
  communicationPreferenceLabels,
  documentationExpectationLabels,
  engagementPreferenceLabels,
  getClientHiringContextChecklist,
} from "@/lib/hiring-signals";
import type {
  BriefExpertType,
  ClientCommunicationPreference,
  ClientDocumentationExpectation,
  ClientEngagementPreference,
  FormFeedbackState,
  ClientHiringContext,
  ClientTrustMetrics,
  User,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { errorFieldClassName, FieldErrorText, FormBanner } from "@/components/forms/FormFeedback";
import { usePageMeta } from "@/hooks/usePageMeta";
import { AppPageHeader, ContextAside, StatStrip } from "@/components/layout/PagePrimitives";
import { getFieldFeedback, getFormFeedback } from "@/lib/form-feedback";
import { cn } from "@/lib/utils";

type ClientProfileFormState = {
  desc: string;
  country: string;
  companyName: string;
  companyWebsite: string;
  companySize: string;
  industry: string;
  foundedYear: string;
  location: string;
  teamDescription: string;
  logoUrl: string;
  projectPreferences: string;
  hiringContext: {
    automationGoal: string;
    currentPainPoints: string;
    expertTypeNeeded: BriefExpertType | "";
    successDefinition: string;
    communicationPreference: ClientCommunicationPreference | "";
    timezoneOverlap: string;
    documentationExpectation: ClientDocumentationExpectation | "";
    engagementPreference: ClientEngagementPreference | "";
  };
};

const splitList = (value: string) =>
  Array.from(
    new Set(
      value
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );

const buildHiringContextPayload = (formData: ClientProfileFormState): ClientHiringContext | undefined => {
  const hiringContext = {
    ...(formData.hiringContext.automationGoal.trim() && { automationGoal: formData.hiringContext.automationGoal.trim() }),
    ...(splitList(formData.hiringContext.currentPainPoints).length > 0 && {
      currentPainPoints: splitList(formData.hiringContext.currentPainPoints),
    }),
    ...(formData.hiringContext.expertTypeNeeded && { expertTypeNeeded: formData.hiringContext.expertTypeNeeded }),
    ...(formData.hiringContext.successDefinition.trim() && { successDefinition: formData.hiringContext.successDefinition.trim() }),
    ...(formData.hiringContext.communicationPreference && {
      communicationPreference: formData.hiringContext.communicationPreference,
    }),
    ...(formData.hiringContext.timezoneOverlap.trim() && { timezoneOverlap: formData.hiringContext.timezoneOverlap.trim() }),
    ...(formData.hiringContext.documentationExpectation && {
      documentationExpectation: formData.hiringContext.documentationExpectation,
    }),
    ...(formData.hiringContext.engagementPreference && { engagementPreference: formData.hiringContext.engagementPreference }),
  };

  return Object.keys(hiringContext).length > 0 ? hiringContext : undefined;
};

const sectionCardClassName = "rounded-[28px] border border-white/8 bg-white/5 p-5 md:p-6";
const helperTextClassName = "text-sm leading-6 text-[var(--color-text-secondary)]";

const createInitialFormState = (user?: User | null): ClientProfileFormState => ({
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
  hiringContext: {
    automationGoal: user?.hiringContext?.automationGoal || "",
    currentPainPoints: (user?.hiringContext?.currentPainPoints || []).join("\n"),
    expertTypeNeeded: user?.hiringContext?.expertTypeNeeded || "",
    successDefinition: user?.hiringContext?.successDefinition || "",
    communicationPreference: user?.hiringContext?.communicationPreference || "",
    timezoneOverlap: user?.hiringContext?.timezoneOverlap || "",
    documentationExpectation: user?.hiringContext?.documentationExpectation || "",
    engagementPreference: user?.hiringContext?.engagementPreference || "",
  },
});

export default function ClientProfileEdit() {
  const { user, refreshSession } = useAuth();
  const [formData, setFormData] = useState<ClientProfileFormState>(createInitialFormState(user));
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<FormFeedbackState | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [trustMetrics, setTrustMetrics] = useState<ClientTrustMetrics | null>(null);

  const canSubmit = useMemo(() => Boolean(user && user.role === "client"), [user]);
  const hiringContextPayload = useMemo(() => buildHiringContextPayload(formData), [formData]);
  const hiringChecklist = useMemo(() => getClientHiringContextChecklist(hiringContextPayload), [hiringContextPayload]);

  usePageMeta({
    title: "Client Profile | n8nExperts",
    description: "Update your company details, hiring context, and working style so experts can judge fit faster.",
    canonicalPath: "/client/profile",
    noIndex: true,
  });

  useEffect(() => {
    if (user) {
      setFormData(createInitialFormState(user));
    }
  }, [user]);

  const sectionProgress = useMemo(
    () => ({
      basics: [
        formData.companyName.trim(),
        formData.companyWebsite.trim(),
        formData.industry.trim(),
        formData.teamDescription.trim(),
      ].filter(Boolean).length,
      context: [
        formData.hiringContext.automationGoal.trim(),
        formData.hiringContext.currentPainPoints.trim(),
        formData.hiringContext.successDefinition.trim(),
        formData.projectPreferences.trim(),
      ].filter(Boolean).length,
      style: [
        formData.desc.trim(),
        formData.hiringContext.communicationPreference,
        formData.hiringContext.timezoneOverlap.trim(),
        formData.hiringContext.documentationExpectation,
        formData.hiringContext.engagementPreference,
      ].filter(Boolean).length,
    }),
    [formData]
  );

  const updateField = <K extends keyof ClientProfileFormState>(field: K, value: ClientProfileFormState[K]) => {
    if (feedback) {
      setFeedback(null);
    }
    if (successMessage) {
      setSuccessMessage("");
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateHiringContextField = <K extends keyof ClientProfileFormState["hiringContext"]>(
    field: K,
    value: ClientProfileFormState["hiringContext"][K]
  ) => {
    if (feedback) {
      setFeedback(null);
    }
    if (successMessage) {
      setSuccessMessage("");
    }
    setFormData((prev) => ({
      ...prev,
      hiringContext: {
        ...prev.hiringContext,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    setSaving(true);
    setFeedback(null);
    setSuccessMessage("");
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
        projectPreferences: splitList(formData.projectPreferences),
        hiringContext: hiringContextPayload,
      });

      if (response.data.trustMetrics) {
        setTrustMetrics(response.data.trustMetrics);
      }
      await refreshSession();
      setSuccessMessage("Client profile saved. Experts can now read your company context, hiring goals, and working style in one pass.");
    } catch (err: unknown) {
      setFeedback(getFormFeedback(err, "We could not save your client profile. Please review the highlighted fields and try again."));
    } finally {
      setSaving(false);
    }
  };

  const fieldError = (field: string, aliases: string[] = []) => getFieldFeedback(feedback, field, aliases);

  return (
    <div className="container py-8">
      <AppPageHeader
        eyebrow={
          <>
            <Building2 className="h-4 w-4" />
            Client workspace
          </>
        }
        title="Company and hiring profile"
        description="Give experts a clearer picture of your team, the kind of automation help you need, and how you prefer to work."
      >
        <StatStrip
          items={[
            { label: "Show", value: "Team context", hint: "Explain who you are and what you are trying to improve." },
            { label: "Clarify", value: "Hiring style", hint: "Set expectations for collaboration, docs, and engagement type." },
            { label: "Result", value: "Better fit", hint: "Experts can decide faster whether the work matches their strengths." },
          ]}
        />
      </AppPageHeader>

      <div className="mt-6 space-y-3">
        <FormBanner tone="success" message={successMessage} />
        <FormBanner message={feedback?.summary} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <form onSubmit={handleSubmit} className="panel p-6 md:p-8">
          <div className="grid gap-5">
            <section className={sectionCardClassName}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">
                    <Building2 className="h-4 w-4" />
                    Company basics
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-white">Help experts understand who they would be working with.</h2>
                </div>
                <Badge variant={sectionProgress.basics >= 3 ? "success" : "outline"}>{sectionProgress.basics}/4 complete</Badge>
              </div>
              <p className={`mt-2 ${helperTextClassName}`}>
                Example: "B2B SaaS team with a lean ops function, a busy support queue, and a growing CRM automation backlog."
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company name</Label>
                  <Input
                    id="company-name"
                    className={fieldError("companyName") ? errorFieldClassName : undefined}
                    value={formData.companyName}
                    onChange={(event) => updateField("companyName", event.target.value)}
                    aria-invalid={Boolean(fieldError("companyName"))}
                  />
                  <FieldErrorText message={fieldError("companyName")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-website">Company website</Label>
                  <Input
                    id="company-website"
                    className={fieldError("companyWebsite") ? errorFieldClassName : undefined}
                    value={formData.companyWebsite}
                    onChange={(event) => updateField("companyWebsite", event.target.value)}
                    placeholder="https://"
                    aria-invalid={Boolean(fieldError("companyWebsite"))}
                  />
                  <FieldErrorText message={fieldError("companyWebsite")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    className={fieldError("industry") ? errorFieldClassName : undefined}
                    value={formData.industry}
                    onChange={(event) => updateField("industry", event.target.value)}
                    aria-invalid={Boolean(fieldError("industry"))}
                  />
                  <FieldErrorText message={fieldError("industry")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-size">Company size</Label>
                  <Input
                    id="company-size"
                    className={fieldError("companySize") ? errorFieldClassName : undefined}
                    value={formData.companySize}
                    onChange={(event) => updateField("companySize", event.target.value)}
                    aria-invalid={Boolean(fieldError("companySize"))}
                  />
                  <FieldErrorText message={fieldError("companySize")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="founded-year">Founded year</Label>
                  <Input
                    id="founded-year"
                    type="number"
                    className={fieldError("foundedYear") ? errorFieldClassName : undefined}
                    min="1900"
                    max="2100"
                    value={formData.foundedYear}
                    onChange={(event) => updateField("foundedYear", event.target.value)}
                    aria-invalid={Boolean(fieldError("foundedYear"))}
                  />
                  <FieldErrorText message={fieldError("foundedYear")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    className={fieldError("location") ? errorFieldClassName : undefined}
                    value={formData.location}
                    onChange={(event) => updateField("location", event.target.value)}
                    aria-invalid={Boolean(fieldError("location"))}
                  />
                  <FieldErrorText message={fieldError("location")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    className={fieldError("country") ? errorFieldClassName : undefined}
                    value={formData.country}
                    onChange={(event) => updateField("country", event.target.value)}
                    aria-invalid={Boolean(fieldError("country"))}
                  />
                  <FieldErrorText message={fieldError("country")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo-url">Logo URL</Label>
                  <Input
                    id="logo-url"
                    className={fieldError("logoUrl") ? errorFieldClassName : undefined}
                    value={formData.logoUrl}
                    onChange={(event) => updateField("logoUrl", event.target.value)}
                    aria-invalid={Boolean(fieldError("logoUrl"))}
                  />
                  <FieldErrorText message={fieldError("logoUrl")} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="team-description">Team description</Label>
                  <Textarea
                    id="team-description"
                    className={cn("min-h-[130px]", fieldError("teamDescription") && errorFieldClassName)}
                    value={formData.teamDescription}
                    onChange={(event) => updateField("teamDescription", event.target.value)}
                    placeholder="What your team owns, where automation is used today, and what kind of stakeholders an expert would work with."
                    aria-invalid={Boolean(fieldError("teamDescription"))}
                  />
                  <FieldErrorText message={fieldError("teamDescription")} />
                  <p className={helperTextClassName}>Focus on team context, operating environment, and why outside help matters right now.</p>
                </div>
              </div>
            </section>

            <section className={sectionCardClassName}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">
                    <Users className="h-4 w-4" />
                    Hiring context
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-white">Show what kind of automation help you are trying to buy.</h2>
                </div>
                <Badge variant={sectionProgress.context >= 3 ? "success" : "outline"}>{sectionProgress.context}/4 complete</Badge>
              </div>
              <p className={`mt-2 ${helperTextClassName}`}>
                Example: "Need a builder to replace brittle manual triage with a reliable n8n workflow and a simple operator handoff."
              </p>

              <div className="mt-5 grid gap-5">
                <div className="space-y-2">
                  <Label htmlFor="automation-goal">Automation goal</Label>
                  <Textarea
                    id="automation-goal"
                    className={cn("min-h-[110px]", fieldError("hiringContext.automationGoal") && errorFieldClassName)}
                    value={formData.hiringContext.automationGoal}
                    onChange={(event) => updateHiringContextField("automationGoal", event.target.value)}
                    placeholder="Describe the repeated automation outcome your team wants to create or improve."
                    aria-invalid={Boolean(fieldError("hiringContext.automationGoal"))}
                  />
                  <FieldErrorText message={fieldError("hiringContext.automationGoal")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pain-points">Current pain points</Label>
                  <Textarea
                    id="pain-points"
                    className={cn("min-h-[120px]", fieldError("hiringContext.currentPainPoints") && errorFieldClassName)}
                    value={formData.hiringContext.currentPainPoints}
                    onChange={(event) => updateHiringContextField("currentPainPoints", event.target.value)}
                    placeholder={"One item per line\nOps handoffs are manual\nFailure alerts are inconsistent\nNobody owns workflow documentation"}
                    aria-invalid={Boolean(fieldError("hiringContext.currentPainPoints"))}
                  />
                  <FieldErrorText message={fieldError("hiringContext.currentPainPoints")} />
                  <p className={helperTextClassName}>The best specialists react to real bottlenecks faster than generic project labels.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="expert-type-needed">Best-fit expert type</Label>
                    <select
                      id="expert-type-needed"
                      className={cn(
                        "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-white",
                        fieldError("hiringContext.expertTypeNeeded") && errorFieldClassName
                      )}
                      value={formData.hiringContext.expertTypeNeeded}
                      onChange={(event) => updateHiringContextField("expertTypeNeeded", event.target.value as BriefExpertType | "")}
                      aria-invalid={Boolean(fieldError("hiringContext.expertTypeNeeded"))}
                    >
                      <option value="">Select one</option>
                      <option value="builder">Builder</option>
                      <option value="consultant">Consultant</option>
                      <option value="maintainer">Maintainer</option>
                    </select>
                    <FieldErrorText message={fieldError("hiringContext.expertTypeNeeded")} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="success-definition">Success definition</Label>
                    <Textarea
                      id="success-definition"
                      className={cn("min-h-[110px]", fieldError("hiringContext.successDefinition") && errorFieldClassName)}
                      value={formData.hiringContext.successDefinition}
                      onChange={(event) => updateHiringContextField("successDefinition", event.target.value)}
                      placeholder="What would make this engagement feel successful for your team?"
                      aria-invalid={Boolean(fieldError("hiringContext.successDefinition"))}
                    />
                    <FieldErrorText message={fieldError("hiringContext.successDefinition")} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project-preferences">Common project themes</Label>
                  <Input
                    id="project-preferences"
                    className={fieldError("projectPreferences") ? errorFieldClassName : undefined}
                    value={formData.projectPreferences}
                    onChange={(event) => updateField("projectPreferences", event.target.value)}
                    placeholder="API integrations, CRM automation, AI workflows"
                    aria-invalid={Boolean(fieldError("projectPreferences"))}
                  />
                  <FieldErrorText message={fieldError("projectPreferences")} />
                  <p className={helperTextClassName}>These tags help experts connect your profile to the kinds of jobs and systems they already know.</p>
                </div>
              </div>
            </section>

            <section className={sectionCardClassName}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">
                    <Save className="h-4 w-4" />
                    Working style
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-white">Clarify how your team prefers to communicate and hand work over.</h2>
                </div>
                <Badge variant={sectionProgress.style >= 4 ? "success" : "outline"}>{sectionProgress.style}/5 complete</Badge>
              </div>
              <p className={`mt-2 ${helperTextClassName}`}>
                Example: "Prefer async progress updates in Slack, at least 3 hours of timezone overlap, and a standard handoff doc before internal rollout."
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="hiring-bio">Hiring bio / collaboration note</Label>
                  <Textarea
                    id="hiring-bio"
                    className={cn("min-h-[120px]", fieldError("desc") && errorFieldClassName)}
                    value={formData.desc}
                    onChange={(event) => updateField("desc", event.target.value)}
                    placeholder="Describe how you usually scope, review, and collaborate with external experts."
                    aria-invalid={Boolean(fieldError("desc"))}
                  />
                  <FieldErrorText message={fieldError("desc")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="communication-preference">Communication preference</Label>
                  <select
                    id="communication-preference"
                    className={cn(
                      "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-white",
                      fieldError("hiringContext.communicationPreference") && errorFieldClassName
                    )}
                    value={formData.hiringContext.communicationPreference}
                    onChange={(event) =>
                      updateHiringContextField("communicationPreference", event.target.value as ClientCommunicationPreference | "")
                    }
                    aria-invalid={Boolean(fieldError("hiringContext.communicationPreference"))}
                  >
                    <option value="">Select one</option>
                    <option value="async_updates">Async updates</option>
                    <option value="weekly_live">Weekly live sync</option>
                    <option value="shared_channel">Shared channel</option>
                    <option value="mixed">Mixed rhythm</option>
                  </select>
                  <FieldErrorText message={fieldError("hiringContext.communicationPreference")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone-overlap">Timezone overlap needed</Label>
                  <Input
                    id="timezone-overlap"
                    className={fieldError("hiringContext.timezoneOverlap") ? errorFieldClassName : undefined}
                    value={formData.hiringContext.timezoneOverlap}
                    onChange={(event) => updateHiringContextField("timezoneOverlap", event.target.value)}
                    placeholder="At least 3 overlap hours on weekdays"
                    aria-invalid={Boolean(fieldError("hiringContext.timezoneOverlap"))}
                  />
                  <FieldErrorText message={fieldError("hiringContext.timezoneOverlap")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentation-expectation">Documentation expectation</Label>
                  <select
                    id="documentation-expectation"
                    className={cn(
                      "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-white",
                      fieldError("hiringContext.documentationExpectation") && errorFieldClassName
                    )}
                    value={formData.hiringContext.documentationExpectation}
                    onChange={(event) =>
                      updateHiringContextField(
                        "documentationExpectation",
                        event.target.value as ClientDocumentationExpectation | ""
                      )
                    }
                    aria-invalid={Boolean(fieldError("hiringContext.documentationExpectation"))}
                  >
                    <option value="">Select one</option>
                    <option value="light">Light notes</option>
                    <option value="standard">Standard handoff</option>
                    <option value="runbook">Full runbook</option>
                  </select>
                  <FieldErrorText message={fieldError("hiringContext.documentationExpectation")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="engagement-preference">Engagement preference</Label>
                  <select
                    id="engagement-preference"
                    className={cn(
                      "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-white",
                      fieldError("hiringContext.engagementPreference") && errorFieldClassName
                    )}
                    value={formData.hiringContext.engagementPreference}
                    onChange={(event) =>
                      updateHiringContextField("engagementPreference", event.target.value as ClientEngagementPreference | "")
                    }
                    aria-invalid={Boolean(fieldError("hiringContext.engagementPreference"))}
                  >
                    <option value="">Select one</option>
                    <option value="one_off">One-off project</option>
                    <option value="ongoing">Ongoing support</option>
                    <option value="fractional">Fractional partner</option>
                  </select>
                  <FieldErrorText message={fieldError("hiringContext.engagementPreference")} />
                </div>
              </div>
            </section>

            <Button type="submit" disabled={!canSubmit || saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save client profile"}
            </Button>
          </div>
        </form>

        <ContextAside
          eyebrow="Hiring signals"
          title="Give experts enough context to self-select."
          description="A strong client profile does not need to be long, but it should explain the kind of work you need and how you like to collaborate."
        >
          <div className="space-y-4 text-sm text-[var(--color-text-secondary)]">
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Checklist score</p>
                  <p className="mt-1 text-2xl font-bold text-white">{hiringChecklist.score}%</p>
                </div>
                <p className="text-right text-xs text-slate-400">
                  {hiringChecklist.completed} of {hiringChecklist.total} signals complete
                </p>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-[var(--color-primary)] transition-[width] duration-300" style={{ width: `${hiringChecklist.percent}%` }} />
              </div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="font-semibold text-white">Live preview</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {hiringContextPayload?.expertTypeNeeded && (
                  <Badge variant="secondary">{briefExpertTypeLabels[hiringContextPayload.expertTypeNeeded]}</Badge>
                )}
                {hiringContextPayload?.communicationPreference && (
                  <Badge variant="secondary">{communicationPreferenceLabels[hiringContextPayload.communicationPreference]}</Badge>
                )}
                {hiringContextPayload?.documentationExpectation && (
                  <Badge variant="secondary">
                    {documentationExpectationLabels[hiringContextPayload.documentationExpectation]}
                  </Badge>
                )}
                {hiringContextPayload?.engagementPreference && (
                  <Badge variant="secondary">{engagementPreferenceLabels[hiringContextPayload.engagementPreference]}</Badge>
                )}
              </div>
              <div className="mt-3 space-y-2 text-sm text-slate-300">
                <p>
                  <span className="text-slate-500">Automation goal:</span>{" "}
                  {hiringContextPayload?.automationGoal || "Not added yet"}
                </p>
                <p>
                  <span className="text-slate-500">Pain points named:</span> {hiringContextPayload?.currentPainPoints?.length || 0}
                </p>
                <p>
                  <span className="text-slate-500">Timezone overlap:</span>{" "}
                  {hiringContextPayload?.timezoneOverlap || "Not added yet"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="font-semibold text-white">What still helps?</p>
              <div className="mt-3 space-y-2">
                {hiringChecklist.items.map((item) => (
                  <div key={item.key} className="flex items-start gap-3">
                    {item.complete ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
                    ) : (
                      <CircleDashed className="mt-0.5 h-4 w-4 text-slate-500" />
                    )}
                    <div>
                      <p className={item.complete ? "text-white" : "text-slate-300"}>{item.label}</p>
                      <p className="text-xs text-slate-500">{item.hint}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ContextAside>
      </div>

      {trustMetrics && (
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="panel p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Jobs posted</p>
            <p className="mt-2 text-2xl font-bold text-white">{trustMetrics.jobsPosted}</p>
          </article>
          <article className="panel p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Jobs completed</p>
            <p className="mt-2 text-2xl font-bold text-white">{trustMetrics.jobsCompleted}</p>
          </article>
          <article className="panel p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Hire rate</p>
            <p className="mt-2 text-2xl font-bold text-white">{trustMetrics.hireRate}%</p>
          </article>
          <article className="panel p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Avg response</p>
            <p className="mt-2 text-2xl font-bold text-white">{trustMetrics.avgResponseHours}h</p>
          </article>
        </section>
      )}
    </div>
  );
}
