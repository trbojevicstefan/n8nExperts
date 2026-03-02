import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import MyApplications from "@/pages/work/MyApplications";
import { applicationApi } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  applicationApi: {
    getMyApplications: vi.fn(),
    withdraw: vi.fn(),
  },
}));

const mockedGetMyApplications = vi.mocked(applicationApi.getMyApplications);

describe("MyApplications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("groups applications by status and applies filters", async () => {
    mockedGetMyApplications.mockResolvedValue({
      data: {
        applications: [
          {
            _id: "app-submitted",
            jobId: { _id: "job-1", title: "Lead routing", budgetType: "fixed", budgetAmount: 800, status: "open", createdAt: new Date().toISOString() },
            clientId: {
              _id: "client-1",
              username: "Client One",
              companyName: "Acme",
              jobsPostedCount: 4,
              jobsCompletedCount: 2,
              hiresCount: 2,
              avgClientResponseHours: 4,
            },
            expertId: "expert-1",
            coverLetter: "I can help with this workflow and deliver quickly with robust retries and monitoring.",
            status: "submitted",
            source: "direct",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            _id: "app-rejected",
            jobId: { _id: "job-2", title: "Ops alerts", budgetType: "hourly", budgetAmount: 90, status: "open", createdAt: new Date().toISOString() },
            clientId: { _id: "client-2", username: "Client Two", companyName: "Beta" },
            expertId: "expert-1",
            coverLetter: "I have strong incident escalation experience and can deliver production-grade monitoring flows.",
            status: "rejected",
            source: "invitation",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        pagination: { page: 1, limit: 20, total: 2, pages: 1 },
      },
    } as never);

    render(
      <MemoryRouter initialEntries={["/my-applications?tab=all"]}>
        <MyApplications />
      </MemoryRouter>
    );

    const leadRoutingMatches = await screen.findAllByText("Lead routing");
    expect(leadRoutingMatches.length).toBeGreaterThan(0);
    const opsAlertsMatches = screen.getAllByText("Ops alerts");
    expect(opsAlertsMatches.length).toBeGreaterThan(0);
    expect(screen.getByText(/Acme/i)).toBeInTheDocument();
    expect(screen.getByText(/Beta/i)).toBeInTheDocument();

    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText("Filter by source"), "invitation");

    await waitFor(() => {
      expect(mockedGetMyApplications.mock.calls.some((call) => call[0]?.source === "invitation")).toBe(true);
    });
  });
});
