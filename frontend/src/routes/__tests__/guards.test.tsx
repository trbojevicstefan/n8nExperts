import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RequireAuth, RequireRole } from "@/routes/guards";

type MockAuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    _id: string;
    username: string;
    email: string;
    role: "client" | "expert";
  } | null;
};

const authState: MockAuthState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
};

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => authState,
}));

describe("route guards", () => {
  beforeEach(() => {
    authState.isAuthenticated = false;
    authState.isLoading = false;
    authState.user = null;
  });

  it("redirects unauthenticated users to login for protected routes", async () => {
    render(
      <MemoryRouter initialEntries={["/private"]}>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route path="/private" element={<div>Private Area</div>} />
          </Route>
          <Route path="/auth/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Login Page")).toBeInTheDocument();
  });

  it("redirects wrong role to home for role-protected routes", async () => {
    authState.isAuthenticated = true;
    authState.user = {
      _id: "expert-1",
      username: "expert",
      email: "expert@example.com",
      role: "expert",
    };

    render(
      <MemoryRouter initialEntries={["/client-only"]}>
        <Routes>
          <Route element={<RequireRole role="client" />}>
            <Route path="/client-only" element={<div>Client Only</div>} />
          </Route>
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Home Page")).toBeInTheDocument();
  });

  it("renders outlet for matching role", async () => {
    authState.isAuthenticated = true;
    authState.user = {
      _id: "client-1",
      username: "client",
      email: "client@example.com",
      role: "client",
    };

    render(
      <MemoryRouter initialEntries={["/client-only"]}>
        <Routes>
          <Route element={<RequireRole role="client" />}>
            <Route path="/client-only" element={<div>Client Only</div>} />
          </Route>
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Client Only")).toBeInTheDocument();
  });
});

