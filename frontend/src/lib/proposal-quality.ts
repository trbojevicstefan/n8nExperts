import type { Job } from "@/types";
import { getJobBriefQuality } from "@/lib/hiring-signals";

export type ProposalTemplateKey = "implementation_first" | "audit_first" | "consulting_led";

type ProposalChecklistItem = {
  key: string;
  label: string;
  hint: string;
  complete: boolean;
};

export type ProposalQuality = {
  score: number;
  completed: number;
  total: number;
  missing: string[];
  checklist: ProposalChecklistItem[];
  recommendedTemplate: ProposalTemplateKey;
};

export const proposalTemplates: Array<{
  key: ProposalTemplateKey;
  label: string;
  description: string;
}> = [
  {
    key: "implementation_first",
    label: "Implementation-first",
    description: "Lead with the build plan, delivery scope, and the first working version you would ship.",
  },
  {
    key: "audit_first",
    label: "Audit-first",
    description: "Start with a short audit or discovery phase when the scope still has risk, gaps, or dependencies.",
  },
  {
    key: "consulting_led",
    label: "Consulting-led",
    description: "Position this as advisory or workshop-led work before deeper implementation begins.",
  },
];

const stopWords = new Set([
  "about",
  "after",
  "before",
  "between",
  "could",
  "into",
  "need",
  "needs",
  "their",
  "there",
  "these",
  "those",
  "this",
  "with",
  "from",
  "that",
  "your",
  "have",
  "will",
  "would",
  "should",
  "team",
  "workflow",
]);

const uniqueList = (items: Array<string | undefined | null>) =>
  Array.from(new Set(items.map((item) => item?.trim()).filter((item): item is string => Boolean(item))));

const tokenize = (value?: string | string[] | null) => {
  const text = Array.isArray(value) ? value.join(" ") : value || "";

  return Array.from(
    new Set(
      text
        .toLowerCase()
        .split(/[^a-z0-9+]+/i)
        .map((item) => item.trim())
        .filter((item) => item.length >= 3 && !stopWords.has(item))
    )
  );
};

const textIncludesAny = (text: string, values: string[]) => {
  if (!text.trim()) return false;

  const normalized = text.toLowerCase();
  return values.some((value) => normalized.includes(value.toLowerCase()));
};

const listToSentence = (items: string[], fallback: string) => {
  if (items.length === 0) return fallback;
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
};

const firstListItem = (items?: string[] | null, fallback?: string) => {
  return items?.find((item) => item.trim().length > 0) || fallback || "";
};

export const getRecommendedProposalTemplate = (job: Pick<Job, "brief" | "budgetAmount">): ProposalTemplateKey => {
  const quality = getJobBriefQuality(job);
  const expertType = job.brief?.hiringPreferences?.expertTypeNeeded;

  if (expertType === "consultant") {
    return "consulting_led";
  }

  if (quality.score < 45 || (!job.brief?.deliverables?.length && !job.brief?.successCriteria?.length)) {
    return "audit_first";
  }

  return "implementation_first";
};

export const buildProposalTemplate = (template: ProposalTemplateKey, job: Pick<Job, "title" | "brief" | "skills">) => {
  const outcome = job.brief?.outcome || `the ${job.title.toLowerCase()} scope`;
  const systems = listToSentence(
    uniqueList([...(job.brief?.systems || []), ...(job.brief?.integrations || []), ...(job.skills || [])]).slice(0, 4),
    "the current workflow and integrations"
  );
  const deliverable = firstListItem(job.brief?.deliverables, "a production-ready workflow with testing and handoff notes");
  const timeline = job.brief?.timeline || "a realistic first milestone and delivery window";
  const success = firstListItem(job.brief?.successCriteria, "a clear definition of done before launch");

  if (template === "audit_first") {
    return `This looks like a project where a short audit should happen first so the implementation is based on the real workflow shape instead of assumptions.

I would review ${systems}, map the blockers around ${outcome}, and turn that into a concrete build plan with risks, dependencies, and delivery steps. From there, I can either execute the implementation myself or hand you a scoped plan your team can approve quickly.

For timing, I would treat the first milestone as a focused audit plus recommended build sequence, then move into delivery once the scope is confirmed.`;
  }

  if (template === "consulting_led") {
    return `I would approach this as a consulting-led engagement first, then move into hands-on delivery once the decisions are clear.

The first step would be to align on ${outcome}, review ${systems}, and decide which parts need architecture guidance, direct implementation, or team training. The output would be a practical action plan, recommended workflow design, and a delivery path that lines up with ${success}.

If that direction fits, I can outline the first working session and the milestones that should follow.`;
  }

  return `I can take this from scope to working delivery without a long discovery phase.

Based on your brief, I would start with ${systems} mapping and then build the first production-ready version focused on ${outcome}. The delivery would include ${deliverable}, testing on the main edge cases, and handoff notes so the workflow stays maintainable after launch.

If the current constraints stay the same, I would aim for ${timeline}. I would also flag any risks around integrations, data quality, or approval steps before build work starts.`;
};

export const getProposalQuality = ({
  job,
  coverLetter,
  estimatedDuration,
}: {
  job: Pick<Job, "title" | "brief" | "skills" | "budgetAmount">;
  coverLetter: string;
  estimatedDuration?: string;
}): ProposalQuality => {
  const text = coverLetter.trim();
  const outcomeTokens = tokenize([job.title, job.brief?.outcome || "", ...(job.brief?.successCriteria || [])]);
  const systemsTokens = tokenize([...(job.skills || []), ...(job.brief?.systems || []), ...(job.brief?.integrations || [])]);
  const hasOutcomeReference = outcomeTokens.length > 0 && textIncludesAny(text, outcomeTokens);
  const hasSystemsReference = systemsTokens.length > 0 && textIncludesAny(text, systemsTokens);
  const hasApproach = /build|implement|audit|review|fix|map|ship|deliver|phase|scope|test|document|handoff|monitor|plan|stabilize|debug/i.test(text);
  const hasTiming = Boolean(estimatedDuration?.trim()) || /day|days|week|weeks|sprint|phase|milestone|timeline|start|deliver/i.test(text);
  const hasRiskContext = /risk|constraint|dependency|assumption|handoff|training|docs|document|monitor|alert|retry|qa|test/i.test(text);

  const checklist: ProposalChecklistItem[] = [
    {
      key: "outcome",
      label: "Reference the outcome",
      hint: "Anchor the proposal in the workflow result the client wants, not just your background.",
      complete: hasOutcomeReference,
    },
    {
      key: "systems",
      label: "Name the systems",
      hint: "Mention the tools, apps, or integrations you would work with.",
      complete: hasSystemsReference,
    },
    {
      key: "approach",
      label: "Explain your approach",
      hint: "Tell the client how you would handle the work, not only that you can do it.",
      complete: hasApproach && text.length >= 120,
    },
    {
      key: "timing",
      label: "Set timing",
      hint: "Add an estimated duration or a first milestone so the client can judge pace.",
      complete: hasTiming,
    },
    {
      key: "risk",
      label: "Cover risk or handoff",
      hint: "Call out testing, constraints, monitoring, or how handoff will be handled.",
      complete: hasRiskContext,
    },
  ];

  const completed = checklist.filter((item) => item.complete).length;
  const total = checklist.length;
  const score = Math.round((completed / total) * 100);

  return {
    score,
    completed,
    total,
    missing: checklist.filter((item) => !item.complete).map((item) => item.label),
    checklist,
    recommendedTemplate: getRecommendedProposalTemplate(job),
  };
};
