import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: {
      _id: "client-1",
      role: "client",
    },
  }),
}));

import DashboardOverview from "@/pages/workspace/DashboardOverview";

describe("DashboardOverview", () => {
  it("renders role-aware metrics, quick links, and notifications", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <DashboardOverview />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /welcome back, alex/i })).toBeInTheDocument();
    expect(screen.getByText("$2,160.00")).toBeInTheDocument();
    expect(screen.getByText("98%")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Client" })).toHaveAttribute("aria-pressed", "true");

    expect(screen.getByRole("link", { name: /post project/i })).toHaveAttribute("href", "/post-project");
    expect(screen.getByRole("link", { name: /find talent/i })).toHaveAttribute("href", "/find-experts");
    expect(screen.getByRole("link", { name: /withdraw funds/i })).toHaveAttribute("href", "/workspace?intent=withdraw");

    expect(screen.getByRole("heading", { name: /active projects/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /recent messages/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /notifications/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Expert" }));
    expect(screen.getByRole("button", { name: "Expert" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("$4,500.00")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /find work/i })).toHaveAttribute("href", "/jobs");
    expect(screen.getAllByRole("link", { name: /open inbox/i })[0]).toHaveAttribute("href", "/inbox");
  });
});
