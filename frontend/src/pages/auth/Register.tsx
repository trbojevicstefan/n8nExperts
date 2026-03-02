import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, UserRoundCog } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/types";

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
      setError(apiError.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-10">
      <div className="container grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="page-hero panel relative overflow-hidden rounded-3xl px-7 py-10 md:px-10">
          <div className="relative z-10">
            <p className="inline-flex items-center rounded-full border border-sky-300/25 bg-sky-300/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.16em] text-sky-100">
              Create Account
            </p>
            <h1 className="mt-5 max-w-xl text-4xl font-extrabold leading-tight text-white md:text-5xl">Start with the right role.</h1>
            <p className="mt-4 max-w-lg text-sm text-slate-300 md:text-base">
              Client accounts can post projects. Expert accounts can publish profiles, services, and portfolio work.
            </p>
            <div className="mt-8 space-y-3">
              <button
                type="button"
                onClick={() => setRole("client")}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                  role === "client"
                    ? "border-primary/45 bg-primary/12 text-white"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-white/25 hover:text-white"
                }`}
              >
                <span>
                  <p className="text-sm font-semibold">Client Workspace</p>
                  <p className="text-xs text-slate-300">Post jobs and manage applicants</p>
                </span>
                <BriefcaseBusiness className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setRole("expert")}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                  role === "expert"
                    ? "border-primary/45 bg-primary/12 text-white"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-white/25 hover:text-white"
                }`}
              >
                <span>
                  <p className="text-sm font-semibold">Expert Workspace</p>
                  <p className="text-xs text-slate-300">Publish profile and apply to jobs</p>
                </span>
                <UserRoundCog className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        <section className="glass rounded-3xl p-7 md:p-8">
          <h2 className="text-2xl font-extrabold text-white">Create your n8nExperts account</h2>
          <p className="mt-2 text-sm text-slate-300">Complete setup in less than a minute.</p>

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

          <p className="mt-5 text-sm text-slate-300">
            Already have an account?
            <Link to="/auth/login" className="ml-1.5 font-semibold text-primary hover:underline">
              Log in
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
