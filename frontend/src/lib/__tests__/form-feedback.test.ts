import { describe, expect, it } from "vitest";
import { createLocalFormFeedback, getFieldFeedback, getFormFeedback } from "@/lib/form-feedback";

describe("form-feedback", () => {
  it("maps api validation payloads into summary and field errors", () => {
    const feedback = getFormFeedback(
      {
        isAxiosError: true,
        response: {
          data: {
            message: "Please fix 2 fields and try again.",
            errors: [
              { field: "brief.systems[0]", message: "brief.systems items must be strings." },
              { field: "coverLetter", message: "coverLetter must be at least 30 characters." },
            ],
          },
        },
      },
      "Fallback"
    );

    expect(feedback?.summary).toBe("Please fix 2 fields and try again.");
    expect(getFieldFeedback(feedback, "brief.systems")).toBe("brief.systems items must be strings.");
    expect(getFieldFeedback(feedback, "coverLetter")).toBe("coverLetter must be at least 30 characters.");
  });

  it("supports local field aliases for derived ui fields", () => {
    const feedback = createLocalFormFeedback("Add more detail.", [
      { field: "included", message: "Add at least one included deliverable." },
    ]);

    expect(getFieldFeedback(feedback, "included", ["features", "desc"])).toBe(
      "Add at least one included deliverable."
    );
  });
});
