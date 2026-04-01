import { describe, expect, it } from "vitest";
import {
  buildServiceDescription,
  deriveServiceShortTitle,
  resolveServiceShortDesc,
  serviceTemplates,
  splitServiceLines,
} from "@/lib/servicePresentation";

describe("servicePresentation", () => {
  it("parses included lines cleanly", () => {
    expect(splitServiceLines("- First item\nSecond item\n\n* Third item")).toEqual(["First item", "Second item", "Third item"]);
  });

  it("builds a readable fallback description", () => {
    expect(buildServiceDescription(["Workflow review", "Prioritized fixes"], "Teams with brittle live automations")).toContain("Included:");
    expect(buildServiceDescription(["Workflow review", "Prioritized fixes"], "Teams with brittle live automations")).toContain("Best for:");
  });

  it("derives short presentation copy from the service title and best-fit note", () => {
    expect(deriveServiceShortTitle(serviceTemplates[0].title)).toBe("Audit an existing n8n workflow for reliability and handoff gaps");
    expect(
      resolveServiceShortDesc({
        bestFor: "Teams with brittle live automations that need a second opinion before another rebuild.",
        desc: "",
        features: [],
      })
    ).toBe("Teams with brittle live automations that need a second opinion before another rebuild.");
  });
});
