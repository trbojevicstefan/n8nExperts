import { describe, expect, it } from "vitest";
import { getClientHiringContextChecklist, getJobBriefQuality } from "@/lib/hiring-signals";

describe("hiring-signals helpers", () => {
  it("calculates brief quality signals from structured fields", () => {
    const quality = getJobBriefQuality({
      budgetAmount: 1200,
      brief: {
        outcome: "Reduce manual triage time",
        systems: ["n8n", "HubSpot"],
        timeline: "Need shortlist this week",
        deliverables: ["Workflow", "Runbook"],
      },
    });

    expect(quality.score).toBeGreaterThan(0);
    expect(quality.signals.find((signal) => signal.key === "outcome")?.present).toBe(true);
    expect(quality.signals.find((signal) => signal.key === "systems")?.present).toBe(true);
    expect(quality.signals.find((signal) => signal.key === "budget")?.present).toBe(true);
    expect(quality.signals.find((signal) => signal.key === "urgency")?.present).toBe(true);
  });

  it("tracks missing client hiring context items", () => {
    const checklist = getClientHiringContextChecklist({
      automationGoal: "Stabilize support ops automations",
      currentPainPoints: ["Manual escalations"],
      communicationPreference: "async_updates",
    });

    expect(checklist.completed).toBe(3);
    expect(checklist.missing).toContain("Expert type");
    expect(checklist.missing).toContain("Documentation expectation");
  });
});
