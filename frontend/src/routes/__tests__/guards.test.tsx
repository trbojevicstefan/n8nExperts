import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
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

function LocationEcho() {
  const location = useLocation();
  return <div>{`${location.pathname}${location.search}`}</div>;
}

describe("route guards", () => {
  beforeEach(() => {
    authState.isAuthenticated = false;
    authState.isLoading = false;
    authState.user = null;
  });

  it("redirects unauthenticated users to login for shared protected routes and preserves intent", async () => {
    render(
      <MemoryRouter initialEntries={["/private?tab=messages"]}>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route path="/private" element={<div>Private Area</div>} />
          </Route>
          <Route
            path="/auth/login"
            element={
              <div>
                Login Page
                <LocationEcho />
              </div>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Login Page")).toBeInTheDocument();
    expect(screen.getByText("/auth/login?redirect=%2Fprivate%3Ftab%3Dmessages")).toBeInTheDocument();
  });

  it("redirects unauthenticated users to the access-required screen for role-protected routes", async () => {
    render(
      <MemoryRouter initialEntries={["/client-only"]}>
        <Routes>
          <Route element={<RequireRole role="client" />}>
            <Route path="/client-only" element={<div>Client Only</div>} />
          </Route>
          <Route
            path="/auth/access-required"
            element={
              <div>
                Access Required
                <LocationEcho />
              </div>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Access Required")).toBeInTheDocument();
    expect(screen.getByText("/auth/access-required?redirect=%2Fclient-only&requiredRole=client")).toBeInTheDocument();
  });

  it("redirects wrong role to the access-required screen with a blocked flag", async () => {
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
          <Route
            path="/auth/access-required"
            element={
              <div>
                Access Required
                <LocationEcho />
              </div>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Access Required")).toBeInTheDocument();
    expect(screen.getByText("/auth/access-required?redirect=%2Fclient-only&requiredRole=client&blocked=1")).toBeInTheDocument();
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

