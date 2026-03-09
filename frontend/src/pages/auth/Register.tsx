import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, UserRoundCog } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePageMeta } from "@/hooks/usePageMeta";
import type { Role } from "@/types";
import { ContextAside } from "@/components/layout/PagePrimitives";

export default function Register() {
  const [searchParams] = useSearchParams();
  const initialRole: Role = searchParams.get("role") === "expert" ? "expert" : "client";
  const [role, setRole] = useState<Role>(initialRole);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "US",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  usePageMeta({
    title: "Create Account | n8nExperts",
    description: "Create your n8nExperts account as a client hiring automation talent or an expert publishing stronger proof and services.",
    canonicalPath: "/auth/register",
    noIndex: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        country: formData.country,
        role,
      });

      navigate(role === "expert" ? "/expert/setup" : "/my-jobs");
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "We could not create the account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-10">
      <div className="container grid gap-6 lg:grid-cols-[0.95fr_0.8fr]">
        <section className="glass rounded-3xl p-7 md:p-8">
          <h2 className="text-2xl font-extrabold text-white">Create your n8nExperts account</h2>
          <p className="mt-2 text-sm text-slate-300">Choose what you want to do first, then create your account.</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setRole("client")}
              className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                role === "client"
                  ? "border-primary/45 bg-primary/12 text-white"
                  : "border-white/10 bg-white/6 text-slate-300 hover:border-white/25 hover:text-white"
              }`}
            >
              <span>
                <p className="text-sm font-semibold">Client Workspace</p>
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">Post jobs and hire experts</p>
              </span>
              <BriefcaseBusiness className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setRole("expert")}
              className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                role === "expert"
                  ? "border-primary/45 bg-primary/12 text-white"
                  : "border-white/10 bg-white/6 text-slate-300 hover:border-white/25 hover:text-white"
              }`}
            >
              <span>
                <p className="text-sm font-semibold">Expert Workspace</p>
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">Show your work and apply to jobs</p>
              </span>
              <UserRoundCog className="h-4 w-4" />
            </button>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Username</label>
              <input
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-white outline-none transition focus:border-primary/70 focus:ring-1 focus:ring-primary/60"
                value={formData.username}
                onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Email</label>
              <input
                type="email"
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-white outline-none transition focus:border-primary/70 focus:ring-1 focus:ring-primary/60"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
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
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Confirm Password</label>
                <input
                  type="password"
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-white outline-none transition focus:border-primary/70 focus:ring-1 focus:ring-primary/60"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                />
              </div>
            </div>

            {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>}

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-[0_8px_25px_var(--color-primary-glow)] transition hover:bg-primary-hover disabled:opacity-60"
            >
              {isLoading ? "Creating account..." : `Sign up as ${role}`}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-white/8 bg-white/5 p-4 text-sm text-[var(--color-text-secondary)]">
            <p className="font-semibold text-white">After signup</p>
            <p className="mt-2">{role === "expert" ? "You will land on your profile setup page and fill in the basics first." : "You will land in your job dashboard and can post a job right away."}</p>
          </div>

          <p className="mt-5 text-sm text-slate-300">
            Already have an account?
            <Link to="/auth/login" className="ml-1.5 font-semibold text-primary hover:underline">
              Log in
            </Link>
          </p>
        </section>

        <ContextAside
          eyebrow="Create account"
          title="Choose the side of the platform you need first."
          description="Think of this as choosing your starting point. Clients start in hiring. Experts start in profile setup and job search."
          className="self-start"
        >
          <div className="space-y-3">
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">Client accounts</p>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Best for posting jobs, reviewing applicants, and talking to experts.</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">Expert accounts</p>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Best for building a profile, publishing services, and applying to jobs.</p>
            </div>
          </div>
        </ContextAside>
      </div>
    </div>
  );
}
