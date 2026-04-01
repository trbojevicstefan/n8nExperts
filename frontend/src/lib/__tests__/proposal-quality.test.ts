import { describe, expect, it } from "vitest";
import { buildProposalTemplate, getProposalQuality, getRecommendedProposalTemplate } from "@/lib/proposal-quality";

describe("proposal-quality helpers", () => {
  const job = {
    title: "Lead routing rebuild",
    budgetAmount: 1800,
    skills: ["n8n", "HubSpot", "Slack"],
    brief: {
      outcome: "Reduce manual lead routing and alert stale assignments fast.",
      systems: ["n8n", "HubSpot"],
      integrations: ["Slack"],
      deliverables: ["Working workflow", "Handoff notes"],
      timeline: "Need first milestone this week.",
      successCriteria: ["Leads route automatically within five minutes."],
      hiringPreferences: {
        expertTypeNeeded: "builder" as const,
      },
    },
  };

  it("recommends implementation-first when the brief is already specific", () => {
    expect(getRecommendedProposalTemplate(job)).toBe("implementation_first");
  });

  it("builds a template that references the job-specific outcome and systems", () => {
    const template = buildProposalTemplate("implementation_first", job);

    expect(template).toMatch(/lead routing/i);
    expect(template).toMatch(/hubspot/i);
  });

  it("scores stronger proposals higher when they reference the brief and timing", () => {
    const weak = getProposalQuality({
      job,
      coverLetter: "I am interested in this project.",
      estimatedDuration: "",
    });

    const strong = getProposalQuality({
      job,
      coverLetter:
        "I would start by mapping the n8n and HubSpot routing logic, then implement the first working flow with Slack alerts, testing, and handoff notes. I would also flag edge cases, monitoring, and delivery risks before launch.",
      estimatedDuration: "5 days for phase one",
    });

    expect(strong.score).toBeGreaterThan(weak.score);
    expect(strong.missing).not.toContain("Reference the outcome");
    expect(strong.missing).not.toContain("Name the systems");
  });
});
