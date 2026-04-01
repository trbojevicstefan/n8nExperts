import type {
  BriefExpertType,
  BriefHandoffExpectation,
  ClientCommunicationPreference,
  ClientDocumentationExpectation,
  ClientEngagementPreference,
  ClientHiringContext,
  Job,
  JobBrief,
} from "@/types";

type ChecklistItem = {
  key: string;
  label: string;
  hint: string;
  complete: boolean;
};

export type JobBriefSignal = {
  key: "outcome" | "systems" | "budget" | "urgency";
  label: string;
  present: boolean;
};

export type JobBriefQuality = {
  score: number;
  percent: number;
  completed: number;
  total: number;
  missing: string[];
  signals: JobBriefSignal[];
  checklist: ChecklistItem[];
};

export type ClientHiringChecklist = {
  score: number;
  percent: number;
  completed: number;
  total: number;
  missing: string[];
  items: ChecklistItem[];
};

export type ClientSeriousnessSignal = {
  key: "brief" | "history" | "delivery" | "hire" | "response";
  label: string;
  present: boolean;
  detail: string;
};

export type ClientSeriousnessSummary = {
  score: number;
  label: string;
  summary: string;
  signals: ClientSeriousnessSignal[];
};

export type JobFitSummary = {
  score: number;
  overlap: string[];
  summary: string;
};

export type JobMarketplaceSummary = {
  quality: JobBriefQuality;
  seriousness: ClientSeriousnessSummary;
  fit: JobFitSummary;
  detailTone: "strong" | "mixed" | "weak";
};

export const briefExpertTypeLabels: Record<BriefExpertType, string> = {
  builder: "Builder",
  consultant: "Consultant",
  maintainer: "Maintainer",
};

export const briefHandoffExpectationLabels: Record<BriefHandoffExpectation, string> = {
  none: "No handoff needed",
  documentation: "Documentation handoff",
  training: "Team training",
  documentation_and_training: "Docs plus training",
};

export const communicationPreferenceLabels: Record<ClientCommunicationPreference, string> = {
  async_updates: "Async updates",
  weekly_live: "Weekly live sync",
  shared_channel: "Shared channel",
  mixed: "Mixed rhythm",
};

export const documentationExpectationLabels: Record<ClientDocumentationExpectation, string> = {
  light: "Light notes",
  standard: "Standard handoff",
  runbook: "Full runbook",
};

export const engagementPreferenceLabels: Record<ClientEngagementPreference, string> = {
  one_off: "One-off project",
  ongoing: "Ongoing support",
  fractional: "Fractional partner",
};

const hasText = (value?: string | null) => Boolean(value?.trim());
const hasList = (value?: string[] | null) => Array.isArray(value) && value.some((item) => item.trim().length > 0);
const normalizePhrase = (value: string) => value.trim().toLowerCase();
const uniquePhrases = (items: string[]) => Array.from(new Set(items.map(normalizePhrase).filter(Boolean)));

const toSummary = (items: ChecklistItem[]) => {
  const completed = items.filter((item) => item.complete).length;
  const total = items.length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return {
    completed,
    total,
    percent,
    score: percent,
    missing: items.filter((item) => !item.complete).map((item) => item.label),
  };
};

export const getJobBriefQuality = (job: Pick<Job, "brief" | "budgetAmount"> | { brief?: JobBrief; budgetAmount?: number }): JobBriefQuality => {
  const brief = job.brief;
  const systemsPresent = hasList(brief?.systems) || hasList(brief?.integrations);

  const checklist: ChecklistItem[] = [
    {
      key: "outcome",
      label: "Outcome",
      hint: "What should work better when this engagement is done?",
      complete: hasText(brief?.outcome),
    },
    {
      key: "systems",
      label: "Systems",
      hint: "Name the core tools, apps, or data sources involved.",
      complete: systemsPresent,
    },
    {
      key: "constraints",
      label: "Constraints",
      hint: "Call out approvals, security, uptime, or compliance limits.",
      complete: hasList(brief?.constraints),
    },
    {
      key: "deliverables",
      label: "Deliverables",
      hint: "Be clear about what you expect to receive at the end.",
      complete: hasList(brief?.deliverables),
    },
    {
      key: "timeline",
      label: "Urgency / timing",
      hint: "Give experts a deadline, milestone, or response window.",
      complete: hasText(brief?.timeline),
    },
    {
      key: "successCriteria",
      label: "Success criteria",
      hint: "Say how you will judge whether the work is successful.",
      complete: hasList(brief?.successCriteria),
    },
    {
      key: "expertTypeNeeded",
      label: "Expert type",
      hint: "Tell people whether you need a builder, consultant, or maintainer.",
      complete: Boolean(brief?.hiringPreferences?.expertTypeNeeded),
    },
    {
      key: "handoffExpectation",
      label: "Handoff expectation",
      hint: "Set expectations for docs, training, or post-delivery support.",
      complete: Boolean(brief?.hiringPreferences?.handoffExpectation),
    },
    {
      key: "budget",
      label: "Budget",
      hint: "A visible budget helps experts decide whether to engage.",
      complete: Number(job.budgetAmount) > 0,
    },
  ];

  const signals: JobBriefSignal[] = [
    { key: "outcome", label: "Has outcome", present: checklist[0].complete },
    { key: "systems", label: "Has systems", present: systemsPresent },
    { key: "budget", label: "Has budget", present: Number(job.budgetAmount) > 0 },
    { key: "urgency", label: "Has urgency", present: checklist[4].complete },
  ];

  return {
    ...toSummary(checklist),
    signals,
    checklist,
  };
};

export const getClientHiringContextChecklist = (context?: ClientHiringContext): ClientHiringChecklist => {
  const items: ChecklistItem[] = [
    {
      key: "automationGoal",
      label: "Automation goal",
      hint: "Say what kind of automation outcome you want repeatedly.",
      complete: hasText(context?.automationGoal),
    },
    {
      key: "currentPainPoints",
      label: "Pain points",
      hint: "Share the blockers that create urgency or rework today.",
      complete: hasList(context?.currentPainPoints),
    },
    {
      key: "expertTypeNeeded",
      label: "Expert type",
      hint: "Help experts self-select faster.",
      complete: Boolean(context?.expertTypeNeeded),
    },
    {
      key: "successDefinition",
      label: "Success definition",
      hint: "Describe what a successful engagement looks like for your team.",
      complete: hasText(context?.successDefinition),
    },
    {
      key: "communicationPreference",
      label: "Communication style",
      hint: "Explain whether you prefer async updates, live calls, or a mix.",
      complete: Boolean(context?.communicationPreference),
    },
    {
      key: "timezoneOverlap",
      label: "Timezone overlap",
      hint: "Say how much overlap you need, not just where you are based.",
      complete: hasText(context?.timezoneOverlap),
    },
    {
      key: "documentationExpectation",
      label: "Documentation expectation",
      hint: "Set the right handoff depth before conversations start.",
      complete: Boolean(context?.documentationExpectation),
    },
    {
      key: "engagementPreference",
      label: "Engagement preference",
      hint: "Tell experts whether this is one-off, ongoing, or fractional.",
      complete: Boolean(context?.engagementPreference),
    },
  ];

  return {
    ...toSummary(items),
    items,
  };
};

export const getBriefDetailTone = (score: number): JobMarketplaceSummary["detailTone"] => {
  if (score >= 78) return "strong";
  if (score >= 45) return "mixed";
  return "weak";
};

export const getClientSeriousnessSummary = (
  job: Pick<Job, "brief" | "budgetAmount" | "clientId">
): ClientSeriousnessSummary => {
  const quality = getJobBriefQuality(job);
  const client = typeof job.clientId === "string" ? null : job.clientId;
  const posted = client?.jobsPostedCount ?? 0;
  const completed = client?.jobsCompletedCount ?? 0;
  const hires = client?.hiresCount ?? 0;
  const responseHours = client?.avgClientResponseHours ?? 0;

  const signals: ClientSeriousnessSignal[] = [
    {
      key: "brief",
      label: "Detailed brief",
      present: quality.score >= 45,
      detail: `Brief score ${quality.score}`,
    },
    {
      key: "history",
      label: "Posted before",
      present: posted > 1 || completed > 0 || hires > 0,
      detail: posted > 0 ? `${posted} jobs posted` : "No posting history yet",
    },
    {
      key: "delivery",
      label: "Completed work",
      present: completed > 0,
      detail: completed > 0 ? `${completed} completed jobs` : "No completed jobs yet",
    },
    {
      key: "hire",
      label: "Hired before",
      present: hires > 0,
      detail: hires > 0 ? `${hires} hires made` : "No hires recorded yet",
    },
    {
      key: "response",
      label: "Responsive client",
      present: responseHours > 0 && responseHours <= 24,
      detail: responseHours > 0 ? `${responseHours}h avg response` : "No response history yet",
    },
  ];

  const score =
    (quality.score >= 78 ? 26 : quality.score >= 45 ? 18 : quality.score >= 25 ? 10 : 0) +
    (signals[1].present ? 16 : 0) +
    (signals[2].present ? 20 : 0) +
    (signals[3].present ? 20 : 0) +
    (responseHours > 0 && responseHours <= 12 ? 18 : responseHours > 0 && responseHours <= 24 ? 12 : responseHours > 0 && responseHours <= 48 ? 6 : 0);

  if (score >= 70) {
    return {
      score,
      label: "Serious client",
      summary: "Detailed brief plus real hiring history.",
      signals,
    };
  }

  if (score >= 45) {
    return {
      score,
      label: "Some proof",
      summary: "There is useful hiring context, but verify the scope carefully.",
      signals,
    };
  }

  return {
    score,
    label: "Early signal",
    summary: "Treat this as an early-stage brief and qualify the scope in your proposal.",
    signals,
  };
};

export const getJobFitSummary = (
  job: Pick<Job, "title" | "skills" | "brief" | "budgetAmount">,
  expertSkills: string[] = []
): JobFitSummary => {
  const quality = getJobBriefQuality(job);
  const relevantTerms = uniquePhrases([
    ...(job.skills || []),
    ...(job.brief?.systems || []),
    ...(job.brief?.integrations || []),
  ]);
  const profileSkills = uniquePhrases(expertSkills || []);
  const overlap = profileSkills.filter((skill) => relevantTerms.includes(skill)).slice(0, 4);
  const score = Math.min(
    100,
    Math.round(overlap.length * 18 + quality.score * 0.45 + (quality.signals.find((signal) => signal.key === "systems")?.present ? 8 : 0))
  );

  if (overlap.length > 0) {
    return {
      score,
      overlap,
      summary: `${overlap.length} matching skill${overlap.length === 1 ? "" : "s"} from your profile.`,
    };
  }

  return {
    score: Math.round(Math.max(score, quality.score * 0.65)),
    overlap: [],
    summary: "Fit is based on the structured scope because no direct skill overlap was found.",
  };
};

export const getJobMarketplaceSummary = (
  job: Pick<Job, "title" | "skills" | "brief" | "budgetAmount" | "clientId">,
  expertSkills: string[] = []
): JobMarketplaceSummary => {
  const quality = getJobBriefQuality(job);

  return {
    quality,
    seriousness: getClientSeriousnessSummary(job),
    fit: getJobFitSummary(job, expertSkills),
    detailTone: getBriefDetailTone(quality.score),
  };
};
