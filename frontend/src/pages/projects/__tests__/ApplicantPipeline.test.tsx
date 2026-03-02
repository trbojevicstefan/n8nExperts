import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import ApplicantPipeline from "@/pages/projects/ApplicantPipeline";
import { applicationApi, savedApi } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  applicationApi: {
    getClientPipeline: vi.fn(),
    bulkUpdateStatus: vi.fn(),
    updateNote: vi.fn(),
  },
  savedApi: {
    listSearches: vi.fn(),
    createSearch: vi.fn(),
    markSearchUsed: vi.fn(),
    deleteSearch: vi.fn(),
  },
}));

const mockedApplicationApi = vi.mocked(applicationApi);
const mockedSavedApi = vi.mocked(savedApi);

describe("ApplicantPipeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedSavedApi.listSearches.mockResolvedValue({
      data: [],
    } as never);

    mockedApplicationApi.getClientPipeline.mockResolvedValue({
      data: {
        applications: [
          {
            _id: "app-pipeline-1",
            jobId: {
              _id: "job-1",
              title: "Pipeline job A",
              budgetType: "fixed",
              budgetAmount: 1200,
              status: "open",
              createdAt: new Date().toISOString(),
            },
            clientId: "client-1",
            expertId: {
              _id: "expert-1",
              username: "Pipeline Expert",
              headline: "n8n specialist",
            },
            coverLetter: "I can deliver this project with quality, monitoring, and robust retry handling for edge cases.",
            bidAmount: 950,
            estimatedDuration: "7 days",
            status: "submitted",
            source: "direct",
            clientNote: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            statusChangedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
          },
        ],
        countsByStatus: {
          submitted: 1,
          shortlisted: 0,
          accepted: 0,
          rejected: 0,
        },
        countsByJob: [{ jobId: "job-1", title: "Pipeline job A", count: 1 }],
        pagination: { page: 1, limit: 30, total: 1, pages: 1 },
      },
    } as never);

    mockedApplicationApi.bulkUpdateStatus.mockResolvedValue({
      data: {
        requested: 1,
        updatedCount: 1,
        updatedIds: ["app-pipeline-1"],
        skipped: [],
        notFoundIds: [],
      },
    } as never);

    mockedApplicationApi.updateNote.mockResolvedValue({
      data: {
        _id: "app-pipeline-1",
        clientNote: "priority applicant",
        updatedAt: new Date().toISOString(),
      },
    } as never);
  });

  it("supports note save and bulk reject from cross-job pipeline", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/my-jobs/pipeline"]}>
        <ApplicantPipeline />
      </MemoryRouter>
    );

    expect(await screen.findByText("Pipeline Expert")).toBeInTheDocument();
    expect(screen.getByText(/Needs review/i)).toBeInTheDocument();

    const noteField = screen.getByLabelText("Private note");
    await user.clear(noteField);
    await user.type(noteField, "priority applicant");
    await user.click(screen.getByRole("button", { name: "Save note" }));

    await waitFor(() => {
      expect(mockedApplicationApi.updateNote).toHaveBeenCalledWith("app-pipeline-1", "priority applicant");
    });

    await user.click(screen.getByLabelText("Select application from Pipeline Expert"));
    await user.click(screen.getByRole("button", { name: "Batch Reject" }));

    await waitFor(() => {
      expect(mockedApplicationApi.bulkUpdateStatus).toHaveBeenCalledWith({
        applicationIds: ["app-pipeline-1"],
        status: "rejected",
      });
    });
  });
});
