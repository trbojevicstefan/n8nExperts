import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck, Workflow } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePageMeta } from "@/hooks/usePageMeta";
import { ContextAside } from "@/components/layout/PagePrimitives";

export default function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
  const nextPath = fromPath && !fromPath.startsWith("/auth") ? fromPath : "/";

  usePageMeta({
    title: "Log In | n8nExperts",
    description: "Access your n8nExperts workspace to manage experts, jobs, applications, invitations, and inbox activity.",
    canonicalPath: "/auth/login",
    noIndex: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(formData);
      navigate(nextPath, { replace: true });
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "We could not sign you in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-10">
      <div className="container grid gap-6 lg:grid-cols-[0.95fr_0.75fr]">
        <section className="glass rounded-3xl p-7 md:p-8">
          <h2 className="text-2xl font-extrabold text-white">Sign in</h2>
          <p className="mt-2 text-sm text-slate-300">
            {user ? `Signed in as ${user.username}` : "Pick up where you left off."}
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Username or Email</label>
              <input
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-white outline-none transition focus:border-primary/70 focus:ring-1 focus:ring-primary/60"
                value={formData.username}
                onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Password</label>
              <input
                type="password"
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-white outline-none transition focus:border-primary/70 focus:ring-1 focus:ring-primary/60"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>

            {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>}

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-[0_8px_25px_var(--color-primary-glow)] transition hover:bg-primary-hover disabled:opacity-60"
            >
              <ShieldCheck className="h-4 w-4" />
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-white/8 bg-white/5 p-4 text-sm text-[var(--color-text-secondary)]">
            <p className="font-semibold text-white">What happens next</p>
            <p className="mt-2">Clients go back to jobs and hiring. Experts go back to applications, messages, and profile updates.</p>
          </div>

          <p className="mt-5 text-sm text-slate-300">
            Don&apos;t have an account?
            <Link to="/auth/role-select" className="ml-1.5 font-semibold text-primary hover:underline">
              Create one
            </Link>
          </p>
        </section>

        <ContextAside
          eyebrow="Welcome back"
          title="Sign in and get back to work."
          description="This page should feel direct. Sign in, land in your workspace, and keep going without extra steps."
          className="self-start"
        >
          <div className="space-y-3">
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                <Workflow className="h-4 w-4 text-[var(--color-accent-cool)]" />
                Clients
              </p>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Post jobs, review applicants, message experts, and keep hiring moving.</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">Experts</p>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Apply to jobs, reply to messages, and keep your profile and services up to date.</p>
            </div>
          </div>
        </ContextAside>
      </div>
    </div>
  );
}
