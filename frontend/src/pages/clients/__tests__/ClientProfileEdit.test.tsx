import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import ClientProfileEdit from "@/pages/clients/ClientProfileEdit";
import { clientApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

vi.mock("@/lib/api", () => ({
  clientApi: {
    updateMyProfile: vi.fn(),
  },
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

const mockedClientApi = vi.mocked(clientApi);
const mockedUseAuth = vi.mocked(useAuth);

describe("ClientProfileEdit", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseAuth.mockReturnValue({
      user: {
        _id: "client-1",
        username: "client",
        email: "client@example.com",
        role: "client",
        isClient: true,
        isExpert: false,
        isSeller: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn().mockResolvedValue(undefined),
    });

    mockedClientApi.updateMyProfile.mockResolvedValue({
      data: {
        _id: "client-1",
        role: "client",
        trustMetrics: {
          jobsPosted: 3,
          jobsCompleted: 2,
          hireRate: 66.7,
          avgResponseHours: 6,
          activeJobs: 1,
        },
      },
    } as never);
  });

  it("submits client profile fields and parses preferences", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ClientProfileEdit />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText("Company Name"), "Acme Labs");
    await user.type(screen.getByLabelText("Project Preferences (comma separated)"), "AI workflows, CRM automation");
    await user.click(screen.getByRole("button", { name: "Save Client Profile" }));

    await waitFor(() => {
      expect(mockedClientApi.updateMyProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          companyName: "Acme Labs",
          projectPreferences: ["AI workflows", "CRM automation"],
        })
      );
    });

    expect(await screen.findByText("Client profile updated.")).toBeInTheDocument();
  });
});
