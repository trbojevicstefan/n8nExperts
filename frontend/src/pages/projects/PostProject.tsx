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

const sectionCardClassName = "rounded-2xl border border-white/10 bg-white/[0.02] p-6 lg:p-8 relative overflow-hidden transition-all hover:border-white/20";
const helperTextClassName = "text-sm text-slate-400 font-medium";

// Custom dark styled inputs
const customInputClasses = "w-full bg-black/40 border-white/10 text-white rounded-xl focus:ring-primary focus:border-transparent placeholder:text-slate-600 transition-all";

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
    <div className="relative min-h-screen bg-[#0a0a0a] text-white overflow-hidden py-10 pb-24">
      {/* Dynamic Dot Grid Background tailored to Pro Max styling */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-50 z-0"
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }}
      ></div>
      
      <div className="absolute top-0 right-0 w-1/2 h-[500px] bg-primary/10 blur-[150px] pointer-events-none rounded-full transform translate-x-1/3 -translate-y-1/2 z-0"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Header Text matching the Stitch mock */}
        <div className="text-center mb-12 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-primary mb-6">
             <PencilRuler className="h-4 w-4" /> Client Workspace
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-500 tracking-tight">
            Post a Project
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Describe your automation needs to find the perfect n8n specialist. A clearer brief gets better proposals faster.
          </p>
        </div>

        {flash && (
          <div className={`mb-6 max-w-3xl mx-auto rounded-xl px-4 py-3 text-sm font-semibold border ${
            flash.tone === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" :
            flash.tone === "error" ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-sky-500/30 bg-sky-500/10 text-sky-300"
          }`}>
            {flash.text}
          </div>
        )}

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px] items-start">
          
          {/* Main Form Area */}
          <form onSubmit={handleSubmit} className="w-full glass-card bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 lg:p-10 shadow-2xl space-y-8">
            <FormBanner message={feedback?.summary} />
            
            <section className={sectionCardClassName}>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-tight">Goal & Context</h2>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Lead with the business outcome</p>
                  </div>
                </div>
                <Badge variant={sectionProgress.goal >= 3 ? "success" : "secondary"} className="bg-black/30 border-white/10">
                  {sectionProgress.goal}/4 complete
                </Badge>
              </div>

              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-300 uppercase text-xs tracking-wider font-bold">Project Title</Label>
                  <Input
                    id="title"
                    className={cn(customInputClasses, "h-14 text-lg font-medium", fieldError("title") && errorFieldClassName)}
                    placeholder="e.g. Automate CRM lead syncing with n8n and Airtable"
                    value={formData.title}
                    onChange={(event) => updateField("title", event.target.value)}
                    aria-invalid={Boolean(fieldError("title"))}
                    required
                  />
                  <FieldErrorText message={fieldError("title")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="outcome" className="text-slate-300 uppercase text-xs tracking-wider font-bold">Primary Outcome</Label>
                  <Textarea
                    id="outcome"
                    className={cn(customInputClasses, "min-h-[100px] resize-none pt-4", fieldError("brief.outcome") && errorFieldClassName)}
                    placeholder="e.g. Reduce manual lead routing from 30 minutes to 5 minutes..."
                    value={formData.brief.outcome}
                    onChange={(event) => updateBriefField("outcome", event.target.value)}
                    aria-invalid={Boolean(fieldError("brief.outcome"))}
                  />
                  <FieldErrorText message={fieldError("brief.outcome")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-300 uppercase text-xs tracking-wider font-bold">Detailed Description</Label>
                  <Textarea
                    id="description"
                    className={cn(customInputClasses, "min-h-[160px] resize-vertical pt-4", fieldError("description") && errorFieldClassName)}
                    placeholder="Describe current process, stakeholders, edge cases, and background..."
                    value={formData.description}
                    onChange={(event) => updateField("description", event.target.value)}
                    aria-invalid={Boolean(fieldError("description"))}
                    required
                  />
                  <FieldErrorText message={fieldError("description")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="successCriteria" className="text-slate-300 uppercase text-xs tracking-wider font-bold">Success Criteria</Label>
                  <Textarea
                    id="successCriteria"
                    className={cn(customInputClasses, "min-h-[100px] resize-none pt-4", fieldError("brief.successCriteria") && errorFieldClassName)}
                    placeholder={"One item per line\nErrors are retried automatically\nOps sees Slack alerts within 2 mins"}
                    value={formData.brief.successCriteria}
                    onChange={(event) => updateBriefField("successCriteria", event.target.value)}
                    aria-invalid={Boolean(fieldError("brief.successCriteria"))}
                  />
                  <FieldErrorText message={fieldError("brief.successCriteria")} />
                </div>
              </div>
            </section>

            <section className={sectionCardClassName}>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                    <Workflow className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-tight">Systems & Scope</h2>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Name the tools and outputs</p>
                  </div>
                </div>
                <Badge variant={sectionProgress.systems >= 2 ? "success" : "secondary"} className="bg-black/30 border-white/10">
                  {sectionProgress.systems}/3 complete
                </Badge>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="systems" className="text-slate-300 uppercase text-xs tracking-wider font-bold">Core Systems</Label>
                  <Input
                    id="systems"
                    className={cn(customInputClasses, "h-12", fieldError("brief.systems") && errorFieldClassName)}
                    placeholder="n8n, HubSpot, Slack..."
                    value={formData.brief.systems}
                    onChange={(event) => updateBriefField("systems", event.target.value)}
                    aria-invalid={Boolean(fieldError("brief.systems"))}
                  />
                  <FieldErrorText message={fieldError("brief.systems")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="integrations" className="text-slate-300 uppercase text-xs tracking-wider font-bold">Custom Integrations</Label>
                  <Input
                    id="integrations"
                    className={cn(customInputClasses, "h-12", fieldError("brief.integrations") && errorFieldClassName)}
                    placeholder="Stripe API, internal REST..."
                    value={formData.brief.integrations}
                    onChange={(event) => updateBriefField("integrations", event.target.value)}
                    aria-invalid={Boolean(fieldError("brief.integrations"))}
                  />
                  <FieldErrorText message={fieldError("brief.integrations")} />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="skills" className="text-slate-300 uppercase text-xs tracking-wider font-bold">Relevant Skills (comma separated)</Label>
                  <Input
                    id="skills"
                    className={cn(customInputClasses, "h-12", fieldError("skills") && errorFieldClassName)}
                    placeholder="n8n, Postgres, JSON..."
                    value={formData.skills}
                    onChange={(event) => updateField("skills", event.target.value)}
                    aria-invalid={Boolean(fieldError("skills"))}
                  />
                  <FieldErrorText message={fieldError("skills")} />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="deliverables" className="text-slate-300 uppercase text-xs tracking-wider font-bold">Expected Deliverables</Label>
                  <Textarea
                    id="deliverables"
                    className={cn(customInputClasses, "min-h-[100px] pt-4 resize-none", fieldError("brief.deliverables") && errorFieldClassName)}
                    placeholder={"One item per line\nProduction-ready workflow\nRunbook for the ops team..."}
                    value={formData.brief.deliverables}
                    onChange={(event) => updateBriefField("deliverables", event.target.value)}
                    aria-invalid={Boolean(fieldError("brief.deliverables"))}
                  />
                  <FieldErrorText message={fieldError("brief.deliverables")} />
                </div>
              </div>
            </section>

            <section className={sectionCardClassName}>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                    <ShieldAlert className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-tight">Constraints & Timing</h2>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Risk, budget, and urgency</p>
                  </div>
                </div>
                <Badge variant={sectionProgress.timing >= 2 ? "success" : "secondary"} className="bg-black/30 border-white/10">
                  {sectionProgress.timing}/3 complete
                </Badge>
              </div>

              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-300 uppercase text-xs tracking-wider font-bold">Budget Structure</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {/* Fixed Price Toggle */}
                    <label className="relative cursor-pointer group">
                      <input 
                        type="radio" 
                        name="budgetType" 
                        className="peer hidden" 
                        checked={formData.budgetType === "fixed"} 
                        onChange={() => updateField("budgetType", "fixed")} 
                      />
                      <div className="p-4 rounded-xl border border-white/10 bg-black/40 peer-checked:border-primary peer-checked:bg-primary/5 transition-all flex items-start gap-3">
                        <div className="size-5 shrink-0 rounded-full border-2 border-white/20 flex items-center justify-center peer-checked:border-primary mt-0.5">
                          <div className="size-2 bg-primary rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                        </div>
                        <div>
                          <p className="font-bold text-white">Fixed Price</p>
                          <p className="text-xs text-gray-500 mt-1">Set a total price for the project.</p>
                        </div>
                      </div>
                    </label>
                    {/* Hourly Toggle */}
                    <label className="relative cursor-pointer group">
                      <input 
                        type="radio" 
                        name="budgetType" 
                        className="peer hidden" 
                        checked={formData.budgetType === "hourly"} 
                        onChange={() => updateField("budgetType", "hourly")} 
                      />
                      <div className="p-4 rounded-xl border border-white/10 bg-black/40 peer-checked:border-primary peer-checked:bg-primary/5 transition-all flex items-start gap-3">
                        <div className="size-5 shrink-0 rounded-full border-2 border-white/20 flex items-center justify-center peer-checked:border-primary mt-0.5">
                          <div className="size-2 bg-primary rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                        </div>
                        <div>
                          <p className="font-bold text-white">Hourly Rate</p>
                          <p className="text-xs text-gray-500 mt-1">Pay for the hours worked.</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="space-y-2 relative max-w-sm">
                  <Label htmlFor="budgetAmount" className="text-slate-300 uppercase text-xs tracking-wider font-bold">Amount ({formData.budgetType === "hourly" ? "$/hour" : "Total $"})</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-primary font-bold text-lg">$</span>
                    </div>
                    <Input
                      id="budgetAmount"
                      type="number"
                      min="1"
                      className={cn(customInputClasses, "h-14 pl-10 text-lg font-bold", fieldError("budgetAmount") && errorFieldClassName)}
                      placeholder="0.00"
                      value={formData.budgetAmount}
                      onChange={(event) => updateField("budgetAmount", event.target.value)}
                      aria-invalid={Boolean(fieldError("budgetAmount"))}
                      required
                    />
                  </div>
                  <FieldErrorText message={fieldError("budgetAmount")} />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="timeline" className="text-slate-300 uppercase text-xs tracking-wider font-bold">Timeline / Urgency</Label>
                    <Textarea
                      id="timeline"
                      className={cn(customInputClasses, "min-h-[100px] resize-none pt-4", fieldError("brief.timeline") && errorFieldClassName)}
                      placeholder="E.g. Need implementation next sprint..."
                      value={formData.brief.timeline}
                      onChange={(event) => updateBriefField("timeline", event.target.value)}
                      aria-invalid={Boolean(fieldError("brief.timeline"))}
                    />
                    <FieldErrorText message={fieldError("brief.timeline")} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="constraints" className="text-slate-300 uppercase text-xs tracking-wider font-bold">Risks & Constraints</Label>
                    <Textarea
                      id="constraints"
                      className={cn(customInputClasses, "min-h-[100px] resize-none pt-4", fieldError("brief.constraints") && errorFieldClassName)}
                      placeholder="E.g. Must avoid downtime during rollout..."
                      value={formData.brief.constraints}
                      onChange={(event) => updateBriefField("constraints", event.target.value)}
                      aria-invalid={Boolean(fieldError("brief.constraints"))}
                    />
                    <FieldErrorText message={fieldError("brief.constraints")} />
                  </div>
                </div>
              </div>
            </section>

            <section className={sectionCardClassName}>
               <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-tight">Hiring Preferences</h2>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Expert type and handoff</p>
                  </div>
                </div>
                <Badge variant={sectionProgress.hiring === 2 ? "success" : "secondary"} className="bg-black/30 border-white/10">
                  {sectionProgress.hiring}/2 complete
                </Badge>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="expertTypeNeeded" className="text-slate-300 uppercase text-xs tracking-wider font-bold">Best-Fit Expert Type</Label>
                  <select
                    id="expertTypeNeeded"
                    className={cn(
                      customInputClasses, "h-14 px-4 appearance-none [&>option]:bg-zinc-900 border-white/10",
                      fieldError("brief.hiringPreferences.expertTypeNeeded") && errorFieldClassName
                    )}
                    value={formData.brief.expertTypeNeeded}
                    onChange={(event) => updateBriefField("expertTypeNeeded", event.target.value as BriefExpertType | "")}
                  >
                    <option value="">Select type</option>
                    <option value="builder">Builder (Implementer)</option>
                    <option value="consultant">Consultant (Advisor)</option>
                    <option value="maintainer">Maintainer (Support)</option>
                  </select>
                  <FieldErrorText message={fieldError("brief.hiringPreferences.expertTypeNeeded")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="handoffExpectation" className="text-slate-300 uppercase text-xs tracking-wider font-bold">Handoff Expectation</Label>
                  <select
                    id="handoffExpectation"
                    className={cn(
                       customInputClasses, "h-14 px-4 appearance-none [&>option]:bg-zinc-900 border-white/10",
                      fieldError("brief.hiringPreferences.handoffExpectation") && errorFieldClassName
                    )}
                    value={formData.brief.handoffExpectation}
                    onChange={(event) => updateBriefField("handoffExpectation", event.target.value as BriefHandoffExpectation | "")}
                  >
                    <option value="">Select expectation</option>
                    <option value="none">No handoff needed</option>
                    <option value="documentation">Documentation handoff</option>
                    <option value="training">Training only</option>
                    <option value="documentation_and_training">Documentation & Training</option>
                  </select>
                  <FieldErrorText message={fieldError("brief.hiringPreferences.handoffExpectation")} />
                </div>
                
                <div className="space-y-2 md:col-span-2 pt-2">
                    <Label className="text-slate-300 uppercase text-xs tracking-wider font-bold">Visibility Settings</Label>
                    <div className="flex items-center justify-between p-5 rounded-xl bg-black/40 border border-white/10">
                      <div className="flex items-center gap-4">
                        <div className="size-10 bg-white/5 rounded-lg flex items-center justify-center">
                          <span className="material-symbols-outlined text-gray-400">public</span>
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">Public Project</p>
                          <p className="text-xs text-gray-500">Visible to all verified experts on the marketplace.</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={formData.visibility === "public"}
                          onChange={(e) => updateField("visibility", e.target.checked ? "public" : "invite_only")}
                        />
                        <div className="w-12 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                </div>
              </div>
            </section>

            {/* CTA Button styled precisely as the Stitch mock */}
            <div className="pt-6 relative w-full overflow-hidden">
               {/* Background glow on button hover */}
               <div className="absolute inset-0 bg-primary/20 blur-2xl group-hover:bg-primary/40 transition-all rounded-full pointer-events-none"></div>
               <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="group relative w-full bg-primary hover:bg-primary/90 text-white font-extrabold text-lg py-5 rounded-2xl shadow-[0_0_30px_rgba(244,37,89,0.3)] transition-all flex items-center justify-center gap-3 overflow-hidden"
                >
                  <span className="relative z-10">{isSubmitting ? "Publishing..." : "Post Project Now"}</span>
                  {!isSubmitting && <span className="material-symbols-outlined relative z-10 group-hover:scale-110 transition-transform">rocket_launch</span>}
                  
                  {/* Subtle shine effect */}
                  <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] group-hover:left-[200%] transition-all duration-1000 ease-out"></div>
               </button>
               <p className="text-center text-sm text-zinc-500 flex items-center justify-center gap-1.5 mt-4 font-semibold">
                  <span className="material-symbols-outlined text-[16px] text-green-400">verified_user</span>
                   Your project will be accessible instantly after posting.
               </p>
            </div>
          </form>

          {/* Sticky Health Tracker Sidebar (Styled as glass panel) */}
          <div className="hidden xl:block sticky top-24 space-y-6">
            <div 
              className="rounded-3xl border border-white/10 p-6 shadow-2xl space-y-6 relative overflow-hidden"
              style={{ background: 'rgba(24, 24, 27, 0.4)', backdropFilter: 'blur(20px)' }}
            >
               {/* Decorative background circle */}
               <div className="absolute -top-10 -right-10 size-40 bg-primary/10 rounded-full blur-[40px]"></div>
               
               <div>
                 <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500 mb-1">Brief Health</p>
                 <div className="flex items-end justify-between">
                    <h3 className="text-4xl font-black text-white">{briefQuality.score}%</h3>
                    <p className="text-sm text-slate-400 font-medium mb-1">
                      {briefQuality.completed} / {briefQuality.total} Signals
                    </p>
                 </div>
                 
                 <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-black/50 border border-white/5 relative">
                   <div 
                     className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-primary to-primary transition-all duration-500 ease-out" 
                     style={{ width: `${briefQuality.percent}%` }} 
                   />
                 </div>
               </div>

               <div className="pt-4 border-t border-white/10">
                 <p className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-400" /> Improvement Suggestions
                 </p>
                 <div className="space-y-3">
                   {briefQuality.checklist.map((item) => (
                     <div key={item.key} className="flex gap-3 bg-black/20 p-3 rounded-lg border border-white/5">
                       <div className="shrink-0 mt-0.5">
                         {item.complete ? (
                           <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                         ) : (
                           <CircleDashed className="h-4 w-4 text-slate-600" />
                         )}
                       </div>
                       <div>
                         <p className={`text-sm font-semibold ${item.complete ? "text-slate-200" : "text-slate-400"}`}>{item.label}</p>
                         {!item.complete && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.hint}</p>}
                       </div>
                     </div>
                   ))}
                 </div>
               </div>

               <div className="pt-4 border-t border-white/10">
                 <p className="font-bold text-white text-sm mb-3">Live Preview</p>
                 <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                    <JobBriefSignals job={{ brief: briefPayload, budgetAmount }} className="mb-2" showScore={false} />
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
