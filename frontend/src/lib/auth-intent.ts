import type { Role } from "@/types";

export type AuthIntent = {
  redirectPath?: string | null;
  requiredRole?: Role | null;
  blocked?: boolean;
};

const DEFAULT_POST_LOGIN_PATH: Record<Role, string> = {
  client: "/my-jobs",
  expert: "/my-applications",
};

const DEFAULT_POST_REGISTER_PATH: Record<Role, string> = {
  client: "/post-project",
  expert: "/expert/setup",
};

const routeActionLabels: Record<string, string> = {
  "/post-project": "post a project",
  "/my-jobs": "manage your jobs",
  "/my-jobs/pipeline": "review applicants",
  "/client/profile": "update your client profile",
  "/saved-experts": "save experts",
  "/my-applications": "track your applications",
  "/saved-jobs": "save jobs",
  "/invitations": "review invitations",
  "/expert/services": "publish services",
  "/expert/setup": "finish your expert profile",
};

export const ACCESS_REQUIRED_PATH = "/auth/access-required";

export function sanitizeRedirectPath(value?: string | null) {
  if (!value || !value.startsWith("/")) {
    return null;
  }

  return value.startsWith("//") ? null : value;
}

export function readAuthIntent(searchParams: URLSearchParams): AuthIntent {
  const redirectPath = sanitizeRedirectPath(searchParams.get("redirect"));
  const roleParam = searchParams.get("requiredRole");
  const requiredRole = roleParam === "client" || roleParam === "expert" ? roleParam : null;
  const blocked = searchParams.get("blocked") === "1";

  return {
    redirectPath,
    requiredRole,
    blocked,
  };
}

export function buildAuthIntentSearch(intent: AuthIntent) {
  const params = new URLSearchParams();

  if (intent.redirectPath) {
    params.set("redirect", intent.redirectPath);
  }

  if (intent.requiredRole) {
    params.set("requiredRole", intent.requiredRole);
  }

  if (intent.blocked) {
    params.set("blocked", "1");
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export function buildAccessRequiredPath(intent: AuthIntent) {
  return `${ACCESS_REQUIRED_PATH}${buildAuthIntentSearch(intent)}`;
}

export function buildLoginPath(intent: AuthIntent) {
  return `/auth/login${buildAuthIntentSearch(intent)}`;
}

export function buildRegisterPath(role: Role, intent: AuthIntent) {
  const params = new URLSearchParams();
  params.set("role", role);

  if (intent.redirectPath) {
    params.set("redirect", intent.redirectPath);
  }

  if (intent.requiredRole) {
    params.set("requiredRole", intent.requiredRole);
  }

  if (intent.blocked) {
    params.set("blocked", "1");
  }

  return `/auth/register?${params.toString()}`;
}

export function resolvePostAuthPath(userRole: Role, intent: AuthIntent, mode: "login" | "register") {
  if (intent.requiredRole && intent.requiredRole !== userRole) {
    return buildAccessRequiredPath({
      redirectPath: intent.redirectPath,
      requiredRole: intent.requiredRole,
      blocked: true,
    });
  }

  if (intent.redirectPath) {
    return intent.redirectPath;
  }

  return mode === "register" ? DEFAULT_POST_REGISTER_PATH[userRole] : DEFAULT_POST_LOGIN_PATH[userRole];
}

export function getRouteActionLabel(path?: string | null, requiredRole?: Role | null) {
  if (path && routeActionLabels[path]) {
    return routeActionLabels[path];
  }

  if (requiredRole === "client") {
    return "continue in the client workspace";
  }

  if (requiredRole === "expert") {
    return "continue in the expert workspace";
  }

  return "open this page";
}

export function getAccessRequiredCopy(intent: AuthIntent) {
  const action = getRouteActionLabel(intent.redirectPath, intent.requiredRole);

  if (intent.requiredRole === "client") {
    return {
      title: intent.blocked ? "This page is for client accounts." : `You need a client account to ${action}.`,
      description: intent.blocked
        ? "Sign in with a client account or create one, and we will bring you back to the same hiring step."
        : "Create a client account to publish a brief, compare experts, and pick up exactly where you left off after auth.",
      primaryCta: "Create client account",
      secondaryCta: "Log in",
    };
  }

  if (intent.requiredRole === "expert") {
    return {
      title: intent.blocked ? "This page is for expert accounts." : `You need an expert account to ${action}.`,
      description: intent.blocked
        ? "Sign in with an expert account or create one, and we will bring you back to the same workflow step."
        : "Create an expert account to finish your profile, apply to jobs, and return to this page after auth.",
      primaryCta: "Create expert account",
      secondaryCta: "Log in",
    };
  }

  return {
    title: "You need to sign in to continue.",
    description: "Sign in to keep your place and return to the same page after auth.",
    primaryCta: "Log in",
    secondaryCta: "Create account",
  };
}

export function getWorkspaceHomePath(role: Role) {
  return role === "client" ? "/my-jobs" : "/my-applications";
}
