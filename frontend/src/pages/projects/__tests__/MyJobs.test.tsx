import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import MyJobs from "@/pages/projects/MyJobs";
import { applicationApi, jobApi, reviewApi } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  jobApi: {
    getMyJobs: vi.fn(),
    getJobApplications: vi.fn(),
    updateJobStatus: vi.fn(),
    createReview: vi.fn(),
  },
  applicationApi: {
    updateStatus: vi.fn(),
    updateNote: vi.fn(),
  },
  reviewApi: {
    getMine: vi.fn(),
  },
}));

const mockedJobApi = vi.mocked(jobApi);
const mockedApplicationApi = vi.mocked(applicationApi);
const mockedReviewApi = vi.mocked(reviewApi);

describe("MyJobs", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedJobApi.getMyJobs.mockResolvedValue({
      data: [
        {
          _id: "job-1",
          title: "Lead automation",
          description: "Job description",
          budgetType: "fixed",
          budgetAmount: 900,
          skills: ["n8n"],
          attachments: [],
          visibility: "public",
          status: "open",
          clientId: "client-1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    } as never);

    mockedReviewApi.getMine.mockResolvedValue({
      data: { asClient: [], asExpert: [] },
    } as never);

    mockedJobApi.getJobApplications.mockResolvedValue({
      data: {
        applications: [
          {
            _id: "app-1",
            jobId: "job-1",
            clientId: "client-1",
            expertId: {
              _id: "expert-1",
              username: "Expert A",
              headline: "n8n specialist",
            },
            coverLetter: "I can deliver this quickly with robust retry handling and clear observability metrics.",
            bidAmount: 850,
            estimatedDuration: "6 days",
            status: "submitted",
            source: "direct",
            clientNote: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        countsByStatus: {
          submitted: 1,
          shortlisted: 0,
          accepted: 0,
          rejected: 0,
        },
        pagination: { page: 1, limit: 20, total: 1, pages: 1 },
      },
    } as never);

    mockedApplicationApi.updateNote.mockResolvedValue({
      data: { _id: "app-1", clientNote: "strong candidate", updatedAt: new Date().toISOString() },
    } as never);

    mockedApplicationApi.updateStatus.mockResolvedValue({
      data: { _id: "app-1", status: "shortlisted" },
    } as never);
  });

  it("saves private notes and supports batch shortlist", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/my-jobs"]}>
        <MyJobs />
      </MemoryRouter>
    );

    expect(await screen.findByText("Expert A")).toBeInTheDocument();

    const noteBox = screen.getByLabelText("Private note");
    await user.clear(noteBox);
    await user.type(noteBox, "strong candidate");
    await user.click(screen.getByRole("button", { name: "Save note" }));

    await waitFor(() => {
      expect(mockedApplicationApi.updateNote).toHaveBeenCalledWith("app-1", "strong candidate");
    });

    await user.click(screen.getByLabelText("Select application from Expert A"));
    await user.click(screen.getByRole("button", { name: "Batch Shortlist" }));

    await waitFor(() => {
      expect(mockedApplicationApi.updateStatus).toHaveBeenCalledWith("app-1", "shortlisted");
    });
  });
});
