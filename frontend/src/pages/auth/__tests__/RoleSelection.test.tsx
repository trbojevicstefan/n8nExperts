import { MemoryRouter } from "react-router-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RoleSelection from "@/pages/auth/RoleSelection";

describe("RoleSelection", () => {
  it("keeps the continue CTA disabled until a role is selected", () => {
    render(
      <MemoryRouter>
        <RoleSelection />
      </MemoryRouter>
    );

    const continueButton = screen.getByRole("button", { name: /choose a role to continue/i });
    expect(continueButton).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /i need to hire/i }));

    expect(screen.getByRole("button", { name: /continue as client/i })).toBeEnabled();
    expect(screen.getByText(/next: create a client account\./i)).toBeInTheDocument();
  });
});
