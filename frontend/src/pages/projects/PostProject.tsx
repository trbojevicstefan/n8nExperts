import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, CircleDashed, Clock3, PencilRuler, ShieldAlert, Sparkles, Target, Users, Workflow } from "lucide-react";
import { jobApi } from "@/lib/api";
import { getJobBriefQuality } from "@/lib/hiring-signals";
import type { BriefExpertType, BriefHandoffExpectation, JobBrief } from "@/types";
import { JobBriefSignals } from "@/components/jobs/JobBriefView";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { errorFieldClassName, FieldErrorText, FormBanner } from "@/components/forms/FormFeedback";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useRouteFlash } from "@/hooks/useRouteFlash";
import { AppPageHeader, ContextAside, StatStrip } from "@/components/layout/PagePrimitives";
import { getFieldFeedback, getFormFeedback } from "@/lib/form-feedback";
import { cn } from "@/lib/utils";
import type { FormFeedbackState } from "@/types";

type PostProjectFormState = {
  title: string;
  description: string;
  budgetType: "hourly" | "fixed";
  budgetAmount: string;
  visibility: "public" | "invite_only";
  skills: string;
  brief: {
    outcome: string;
    systems: string;
    integrations: string;
    constraints: string;
    deliverables: string;
    timeline: string;
    successCriteria: string;
    expertTypeNeeded: BriefExpertType | "";
    handoffExpectation: BriefHandoffExpectation | "";
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

const buildBriefPayload = (formData: PostProjectFormState): JobBrief | undefined => {
  const hiringPreferences = {
    ...(formData.brief.expertTypeNeeded && { expertTypeNeeded: formData.brief.expertTypeNeeded }),
    ...(formData.brief.handoffExpectation && { handoffExpectation: formData.brief.handoffExpectation }),
  };

  const brief = {
    ...(formData.brief.outcome.trim() && { outcome: formData.brief.outcome.trim() }),
    ...(splitList(formData.brief.systems).length > 0 && { systems: splitList(formData.brief.systems) }),
    ...(splitList(formData.brief.integrations).length > 0 && { integrations: splitList(formData.brief.integrations) }),
    ...(splitList(formData.brief.constraints).length > 0 && { constraints: splitList(formData.brief.constraints) }),
    ...(splitList(formData.brief.deliverables).length > 0 && { deliverables: splitList(formData.brief.deliverables) }),
    ...(formData.brief.timeline.trim() && { timeline: formData.brief.timeline.trim() }),
    ...(splitList(formData.brief.successCriteria).length > 0 && { successCriteria: splitList(formData.brief.successCriteria) }),
    ...(Object.keys(hiringPreferences).length > 0 && { hiringPreferences }),
  };

  return Object.keys(brief).length > 0 ? brief : undefined;
};

const initialFormState: PostProjectFormState = {
  title: "",
  description: "",
  budgetType: "fixed",
  budgetAmount: "",
  visibility: "public",
  skills: "",
  brief: {
    outcome: "",
    systems: "",
    integrations: "",
    constraints: "",
    deliverables: "",
    timeline: "",
    successCriteria: "",
    expertTypeNeeded: "",
    handoffExpectation: "",
  },
};

const sectionCardClassName = "rounded-[28px] border border-white/8 bg-white/5 p-5 md:p-6";
const helperTextClassName = "text-sm leading-6 text-[var(--color-text-secondary)]";

export default function PostProject() {
  const navigate = useNavigate();
  const flash = useRouteFlash();
  const [formData, setFormData] = useState<PostProjectFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FormFeedbackState | null>(null);

  usePageMeta({
    title: "Post Project | n8nExperts",
    description: "Create a clearer n8n project brief with outcomes, systems, budget model, and trust-building context for experts.",
    canonicalPath: "/post-project",
    noIndex: true,
  });

  const briefPayload = useMemo(() => buildBriefPayload(formData), [formData]);
  const budgetAmount = Number(formData.budgetAmount) || 0;
  const briefQuality = useMemo(() => getJobBriefQuality({ brief: briefPayload, budgetAmount }), [briefPayload, budgetAmount]);

  const sectionProgress = useMemo(
    () => ({
      goal: [
        formData.title.trim(),
        formData.brief.outcome.trim(),
        formData.description.trim(),
        formData.brief.successCriteria.trim(),
      ].filter(Boolean).length,
      systems: [
        formData.brief.systems.trim() || formData.brief.integrations.trim(),
        formData.brief.deliverables.trim(),
        formData.skills.trim(),
      ].filter(Boolean).length,
      timing: [
        formData.brief.constraints.trim(),
        formData.budgetAmount.trim(),
        formData.brief.timeline.trim(),
      ].filter(Boolean).length,
      hiring: [formData.brief.expertTypeNeeded, formData.brief.handoffExpectation].filter(Boolean).length,
    }),
    [formData]
  );

  const updateField = <K extends keyof PostProjectFormState>(field: K, value: PostProjectFormState[K]) => {
    if (feedback) {
      setFeedback(null);
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateBriefField = <K extends keyof PostProjectFormState["brief"]>(field: K, value: PostProjectFormState["brief"][K]) => {
    if (feedback) {
      setFeedback(null);
    }
    setFormData((prev) => ({
      ...prev,
      brief: {
        ...prev.brief,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    try {
      await jobApi.createJob({
        title: formData.title.trim(),
        description: formData.description.trim(),
        budgetType: formData.budgetType,
        budgetAmount: Number(formData.budgetAmount),
        visibility: formData.visibility,
        skills: splitList(formData.skills),
        brief: briefPayload,
      });

      navigate("/my-jobs", {
        state: {
          flash: {
            tone: "success",
            text: "Project published. Review applicants here as they come in and move the strongest ones forward.",
          },
        },
      });
    } catch (err: unknown) {
      setFeedback(getFormFeedback(err, "We could not publish this project. Please review the highlighted fields and try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldError = (field: string, aliases: string[] = []) => getFieldFeedback(feedback, field, aliases);

  return (
    <div className="container py-8">
      {flash && (
        <div
          className={`mb-6 rounded-lg px-3 py-2 text-sm ${
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
      <AppPageHeader
        eyebrow={
          <>
            <PencilRuler className="h-4 w-4" />
            Client workspace
          </>
        }
        title="Post a better brief"
        description="Turn one big text box into a sharper hiring brief with a clear goal, named systems, timing, and realistic handoff expectations."
      >
        <StatStrip
          items={[
            { label: "Start with", value: "The outcome", hint: "What should work better once the automation is live?" },
            { label: "Include", value: "Systems + timing", hint: "Name the stack and the urgency, not just the idea." },
            { label: "Result", value: "Better fit", hint: "Specialists can self-select faster when the brief is specific." },
          ]}
        />
      </AppPageHeader>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <form onSubmit={handleSubmit} className="panel p-6 md:p-8">
          <div className="grid gap-5">
            <FormBanner message={feedback?.summary} />
            <section className={sectionCardClassName}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">
                    <Target className="h-4 w-4" />
                    Goal and context
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-white">Lead with the business outcome.</h2>
                </div>
                <Badge variant={sectionProgress.goal >= 3 ? "success" : "outline"}>{sectionProgress.goal}/4 complete</Badge>
              </div>
              <p className={`mt-2 ${helperTextClassName}`}>
                Example: "Reduce manual lead routing from 30 minutes to 5 minutes and alert sales in Slack when priority accounts arrive."
              </p>

              <div className="mt-5 grid gap-5">
                <div className="space-y-2">
                  <Label htmlFor="title">Project title</Label>
                  <Input
                    id="title"
                    className={fieldError("title") ? errorFieldClassName : undefined}
                    placeholder="Build n8n workflow for support ticket triage"
                    value={formData.title}
                    onChange={(event) => updateField("title", event.target.value)}
                    aria-invalid={Boolean(fieldError("title"))}
                    required
                  />
                  <FieldErrorText message={fieldError("title")} />
                  <p className={helperTextClassName}>Say what is being built, not just the department asking for it.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="outcome">Primary outcome</Label>
                  <Textarea
                    id="outcome"
                    className={cn("min-h-[110px]", fieldError("brief.outcome") && errorFieldClassName)}
                    placeholder="What should happen automatically when the workflow is working well?"
                    value={formData.brief.outcome}
                    onChange={(event) => updateBriefField("outcome", event.target.value)}
                    aria-invalid={Boolean(fieldError("brief.outcome"))}
                  />
                  <FieldErrorText message={fieldError("brief.outcome")} />
                  <p className={helperTextClassName}>Example: "Qualify inbound tickets, assign owners, and log the result back into HubSpot without manual triage."</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Overview / additional context</Label>
                  <Textarea
                    id="description"
                    className={cn("min-h-[170px]", fieldError("description") && errorFieldClassName)}
                    placeholder="Share current process, stakeholders, edge cases, or background that helps an expert scope the work."
                    value={formData.description}
                    onChange={(event) => updateField("description", event.target.value)}
                    aria-invalid={Boolean(fieldError("description"))}
                    required
                  />
                  <FieldErrorText message={fieldError("description")} />
                  <p className={helperTextClassName}>Use this for context and edge cases. The structured fields below should carry the main scope.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="successCriteria">Success criteria</Label>
                  <Textarea
                    id="successCriteria"
                    className={cn("min-h-[120px]", fieldError("brief.successCriteria") && errorFieldClassName)}
                    placeholder={"One item per line\nErrors are retried automatically\nOps sees Slack alerts within 2 minutes\nHandover doc explains failure recovery"}
                    value={formData.brief.successCriteria}
                    onChange={(event) => updateBriefField("successCriteria", event.target.value)}
                    aria-invalid={Boolean(fieldError("brief.successCriteria"))}
                  />
                  <FieldErrorText message={fieldError("brief.successCriteria")} />
                  <p className={helperTextClassName}>List the results you will use to say "yes, this is done."</p>
                </div>
              </div>
            </section>

            <section className={sectionCardClassName}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">
                    <Workflow className="h-4 w-4" />
                    Systems and scope
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-white">Name the tools, flows, and outputs.</h2>
                </div>
                <Badge variant={sectionProgress.systems >= 2 ? "success" : "outline"}>{sectionProgress.systems}/3 complete</Badge>
              </div>
              <p className={`mt-2 ${helperTextClassName}`}>
                Example: "n8n, HubSpot, Slack, Gmail, and a Postgres table for retry state."
              </p>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="systems">Core systems</Label>
                  <Input
                    id="systems"
                    className={fieldError("brief.systems") ? errorFieldClassName : undefined}
                    placeholder="n8n, HubSpot, Slack, Postgres"
                    value={formData.brief.systems}
                    onChange={(event) => updateBriefField("systems", event.target.value)}
                    aria-invalid={Boolean(fieldError("brief.systems"))}
                  />
                  <FieldErrorText message={fieldError("brief.systems")} />
                  <p className={helperTextClassName}>List the main systems the expert will need to understand.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="integrations">Integrations or external dependencies</Label>
                  <Input
                    id="integrations"
                    className={fieldError("brief.integrations") ? errorFieldClassName : undefined}
                    placeholder="Stripe API, Zendesk webhooks, internal REST API"
                    value={formData.brief.integrations}
                    onChange={(event) => updateBriefField("integrations", event.target.value)}
                    aria-invalid={Boolean(fieldError("brief.integrations"))}
                  />
                  <FieldErrorText message={fieldError("brief.integrations")} />
                  <p className={helperTextClassName}>Call out third-party APIs, custom services, or legacy tools.</p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="deliverables">Expected deliverables</Label>
                  <Textarea
                    id="deliverables"
                    className={cn("min-h-[120px]", fieldError("brief.deliverables") && errorFieldClassName)}
                    placeholder={"One item per line\nProduction-ready workflow\nTesting checklist\nRunbook for the ops team"}
                    value={formData.brief.deliverables}
                    onChange={(event) => updateBriefField("deliverables", event.target.value)}
                    aria-invalid={Boolean(fieldError("brief.deliverables"))}
                  />
                  <FieldErrorText message={fieldError("brief.deliverables")} />
                  <p className={helperTextClassName}>Be explicit about what should exist at handoff, not just the end state.</p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="skills">Relevant skills</Label>
                  <Input
                    id="skills"
                    className={fieldError("skills") ? errorFieldClassName : undefined}
                    placeholder="n8n, Slack, HubSpot, OpenAI"
                    value={formData.skills}
                    onChange={(event) => updateField("skills", event.target.value)}
                    aria-invalid={Boolean(fieldError("skills"))}
                  />
                  <FieldErrorText message={fieldError("skills")} />
                  <p className={helperTextClassName}>This still helps discovery and filtering, even though the brief carries more of the scope now.</p>
                </div>
              </div>
            </section>

            <section className={sectionCardClassName}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">
                    <ShieldAlert className="h-4 w-4" />
                    Constraints and timing
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-white">Make risk, budget, and urgency visible.</h2>
                </div>
                <Badge variant={sectionProgress.timing >= 2 ? "success" : "outline"}>{sectionProgress.timing}/3 complete</Badge>
              </div>
              <p className={`mt-2 ${helperTextClassName}`}>
                Example: "Must work with existing approval rules, stay inside EU data residency, and be ready for a pilot by May 15."
              </p>

              <div className="mt-5 grid gap-5">
                <div className="space-y-2">
                  <Label htmlFor="constraints">Constraints or known risks</Label>
                  <Textarea
                    id="constraints"
                    className={cn("min-h-[120px]", fieldError("brief.constraints") && errorFieldClassName)}
                    placeholder={"One item per line\nCannot change Salesforce object model\nNeeds audit logging\nMust avoid downtime during rollout"}
                    value={formData.brief.constraints}
                    onChange={(event) => updateBriefField("constraints", event.target.value)}
                    aria-invalid={Boolean(fieldError("brief.constraints"))}
                  />
                  <FieldErrorText message={fieldError("brief.constraints")} />
                  <p className={helperTextClassName}>Add anything that will shape architecture, delivery order, or approval flow.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Budget model</Label>
                    <select
                      className={cn(
                        "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-white",
                        fieldError("budgetType") && errorFieldClassName
                      )}
                      value={formData.budgetType}
                      onChange={(event) => updateField("budgetType", event.target.value as "hourly" | "fixed")}
                      aria-invalid={Boolean(fieldError("budgetType"))}
                    >
                      <option value="fixed">Fixed price</option>
                      <option value="hourly">Hourly</option>
                    </select>
                    <FieldErrorText message={fieldError("budgetType")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budgetAmount">Budget ({formData.budgetType === "hourly" ? "$/hour" : "total $"})</Label>
                    <Input
                      id="budgetAmount"
                      type="number"
                      min="1"
                      className={fieldError("budgetAmount") ? errorFieldClassName : undefined}
                      value={formData.budgetAmount}
                      onChange={(event) => updateField("budgetAmount", event.target.value)}
                      aria-invalid={Boolean(fieldError("budgetAmount"))}
                      required
                    />
                    <FieldErrorText message={fieldError("budgetAmount")} />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="timeline">Timeline or urgency</Label>
                    <Textarea
                      id="timeline"
                      className={cn("min-h-[100px]", fieldError("brief.timeline") && errorFieldClassName)}
                      placeholder="Need shortlist this week, implementation next sprint, and handoff before quarter-end."
                      value={formData.brief.timeline}
                      onChange={(event) => updateBriefField("timeline", event.target.value)}
                      aria-invalid={Boolean(fieldError("brief.timeline"))}
                    />
                    <FieldErrorText message={fieldError("brief.timeline")} />
                    <p className={helperTextClassName}>A deadline, milestone, or "start soon" note is better than silence.</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Visibility</Label>
                    <select
                      className={cn(
                        "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-white",
                        fieldError("visibility") && errorFieldClassName
                      )}
                      value={formData.visibility}
                      onChange={(event) => updateField("visibility", event.target.value as "public" | "invite_only")}
                      aria-invalid={Boolean(fieldError("visibility"))}
                    >
                      <option value="public">Public</option>
                      <option value="invite_only">Invite only</option>
                    </select>
                    <FieldErrorText message={fieldError("visibility")} />
                    <p className={helperTextClassName}>Use public for open discovery or invite-only if you already know who you want to approach.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className={sectionCardClassName}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">
                    <Users className="h-4 w-4" />
                    Hiring preferences
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-white">Set expectations for the kind of expert you want.</h2>
                </div>
                <Badge variant={sectionProgress.hiring === 2 ? "success" : "outline"}>{sectionProgress.hiring}/2 complete</Badge>
              </div>
              <p className={`mt-2 ${helperTextClassName}`}>
                Example: "Need a builder who can ship the first version and leave clear docs plus one training session for internal ops."
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="expertTypeNeeded">Best-fit expert type</Label>
                  <select
                    id="expertTypeNeeded"
                    className={cn(
                      "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-white",
                      fieldError("brief.hiringPreferences.expertTypeNeeded") && errorFieldClassName
                    )}
                    value={formData.brief.expertTypeNeeded}
                    onChange={(event) => updateBriefField("expertTypeNeeded", event.target.value as BriefExpertType | "")}
                    aria-invalid={Boolean(fieldError("brief.hiringPreferences.expertTypeNeeded"))}
                  >
                    <option value="">Select one</option>
                    <option value="builder">Builder</option>
                    <option value="consultant">Consultant</option>
                    <option value="maintainer">Maintainer</option>
                  </select>
                  <FieldErrorText message={fieldError("brief.hiringPreferences.expertTypeNeeded")} />
                  <p className={helperTextClassName}>Builder = implement, consultant = advise, maintainer = improve and support an existing system.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="handoffExpectation">Handoff / training expectation</Label>
                  <select
                    id="handoffExpectation"
                    className={cn(
                      "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-white",
                      fieldError("brief.hiringPreferences.handoffExpectation") && errorFieldClassName
                    )}
                    value={formData.brief.handoffExpectation}
                    onChange={(event) =>
                      updateBriefField("handoffExpectation", event.target.value as BriefHandoffExpectation | "")
                    }
                    aria-invalid={Boolean(fieldError("brief.hiringPreferences.handoffExpectation"))}
                  >
                    <option value="">Select one</option>
                    <option value="none">No handoff needed</option>
                    <option value="documentation">Documentation handoff</option>
                    <option value="training">Training only</option>
                    <option value="documentation_and_training">Documentation and training</option>
                  </select>
                  <FieldErrorText message={fieldError("brief.hiringPreferences.handoffExpectation")} />
                  <p className={helperTextClassName}>This keeps delivery expectations clear before you start comparing proposals.</p>
                </div>
              </div>
            </section>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <p className="inline-flex items-center gap-2 text-xs text-slate-400">
                <Sparkles className="h-4 w-4 text-amber-300" />
                Stronger briefs reduce generic bidding and make your shortlist easier to trust.
              </p>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Publishing..." : "Publish project"}
              </Button>
            </div>
          </div>
        </form>

        <ContextAside
          eyebrow="Brief health"
          title="Make the brief easy to evaluate."
          description="Experts should be able to tell whether the scope fits their skills, budget, and delivery style within a minute."
        >
          <div className="space-y-4 text-sm text-[var(--color-text-secondary)]">
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Completion</p>
                  <p className="mt-1 text-2xl font-bold text-white">{briefQuality.score}%</p>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <p>{briefQuality.completed} of {briefQuality.total} hiring signals</p>
                  <p className="mt-1">Budget counts too, so pricing helps the score.</p>
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-[var(--color-primary)] transition-[width] duration-300" style={{ width: `${briefQuality.percent}%` }} />
              </div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="font-semibold text-white">Primary signals</p>
              <JobBriefSignals job={{ brief: briefPayload, budgetAmount }} className="mt-3" showScore={false} />
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="font-semibold text-white">What is still missing?</p>
              <div className="mt-3 space-y-2">
                {briefQuality.checklist.map((item) => (
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

            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="font-semibold text-white">Current snapshot</p>
              <div className="mt-3 space-y-2 text-sm text-slate-300">
                <p>
                  <span className="text-slate-500">Outcome:</span> {briefPayload?.outcome || "Not added yet"}
                </p>
                <p>
                  <span className="text-slate-500">Systems named:</span>{" "}
                  {(briefPayload?.systems?.length || 0) + (briefPayload?.integrations?.length || 0)}
                </p>
                <p>
                  <span className="text-slate-500">Timeline:</span> {briefPayload?.timeline || "No urgency shown yet"}
                </p>
                <p className="inline-flex items-center gap-2 text-xs text-slate-400">
                  <Clock3 className="h-4 w-4 text-sky-300" />
                  The more specific your timing and constraints, the fewer "need more info" replies you will get.
                </p>
              </div>
            </div>
          </div>
        </ContextAside>
      </div>
    </div>
  );
}
