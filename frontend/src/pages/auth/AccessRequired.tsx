import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, LogIn, UserRoundCog } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { ContextAside } from "@/components/layout/PagePrimitives";
import { useAuth } from "@/hooks/useAuth";
import {
  buildLoginPath,
  buildRegisterPath,
  getAccessRequiredCopy,
  getWorkspaceHomePath,
  readAuthIntent,
} from "@/lib/auth-intent";

export default function AccessRequired() {
  const [searchParams] = useSearchParams();
  const intent = readAuthIntent(searchParams);
  const copy = getAccessRequiredCopy(intent);
  const { user } = useAuth();

  usePageMeta({
    title: "Access Required | n8nExperts",
    description: "Choose the right account type to continue into the correct n8nExperts workflow.",
    canonicalPath: "/auth/access-required",
    noIndex: true,
  });

  const registerHref = buildRegisterPath(intent.requiredRole || "client", intent);
  const loginHref = buildLoginPath(intent);
  const workspaceHref = user ? getWorkspaceHomePath(user.role) : "/";

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-10">
      <div className="container grid gap-6 lg:grid-cols-[0.95fr_0.8fr]">
        <section className="glass rounded-3xl p-7 md:p-8">
          <p className="eyebrow">Protected route</p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight text-white md:text-5xl">{copy.title}</h1>
          <p className="mt-3 max-w-2xl text-sm text-[var(--color-text-secondary)] md:text-base">{copy.description}</p>

          {intent.redirectPath && (
            <div className="mt-6 rounded-2xl border border-white/8 bg-white/5 p-4 text-sm text-[var(--color-text-secondary)]">
              <p className="font-semibold text-white">Saved next step</p>
              <p className="mt-2">
                After auth, we will send you back to <span className="font-semibold text-white">{intent.redirectPath}</span>.
              </p>
            </div>
          )}

          {user && intent.requiredRole && user.role !== intent.requiredRole && (
            <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
              <p className="font-semibold text-white">Signed in as {user.role}</p>
              <p className="mt-2">This route needs a {intent.requiredRole} account.</p>
            </div>
          )}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            {!user || !intent.requiredRole || user.role === intent.requiredRole ? (
              <>
                <Link
                  to={registerHref}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-[0_18px_45px_var(--color-primary-glow)] transition hover:bg-primary-hover"
                >
                  {copy.primaryCta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to={loginHref} className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)] hover:text-white">
                  <LogIn className="h-4 w-4" />
                  {copy.secondaryCta}
                </Link>
              </>
            ) : (
              <>
                <Link
                  to={workspaceHref}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-[0_18px_45px_var(--color-primary-glow)] transition hover:bg-primary-hover"
                >
                  Go to {user.role} workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to={loginHref} className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)] hover:text-white">
                  <LogIn className="h-4 w-4" />
                  Sign in with another account
                </Link>
              </>
            )}
          </div>
        </section>

        <ContextAside
          eyebrow="Why this happens"
          title="Some routes only make sense for one side of the marketplace."
          description="We keep the hiring and expert workflows separate so each person lands in the right tools, copy, and next actions."
          className="self-start"
        >
          <div className="space-y-3 text-sm leading-7 text-[var(--color-text-secondary)]">
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="inline-flex items-center gap-2 font-semibold text-white">
                <BriefcaseBusiness className="h-4 w-4 text-[var(--color-accent)]" />
                Client account
              </p>
              <p className="mt-2">Post projects, review applicants, invite experts, and manage the hiring pipeline.</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="inline-flex items-center gap-2 font-semibold text-white">
                <UserRoundCog className="h-4 w-4 text-[var(--color-accent-cool)]" />
                Expert account
              </p>
              <p className="mt-2">Build a profile, publish services, apply to jobs, and reply to client invitations.</p>
            </div>
          </div>
        </ContextAside>
      </div>
    </div>
  );
}
