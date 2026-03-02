import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Workflow } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(formData);
      navigate("/");
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-10">
      <div className="container grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="page-hero panel relative overflow-hidden rounded-3xl px-7 py-10 md:px-10">
          <div className="relative z-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-sky-300/25 bg-sky-300/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.16em] text-sky-100">
              <Workflow className="h-3.5 w-3.5" />
              Welcome Back
            </p>
            <h1 className="mt-5 max-w-xl text-4xl font-extrabold leading-tight text-white md:text-5xl">
              Continue building better n8n automations.
            </h1>
            <p className="mt-4 max-w-lg text-sm text-slate-300 md:text-base">
              Sign in to manage your profile, jobs, and applications. Session state restores automatically across refreshes.
            </p>
            <div className="mt-7 space-y-3">
              <div className="glass-card rounded-xl p-4">
                <p className="text-sm font-semibold text-white">Clients</p>
                <p className="mt-1 text-sm text-slate-300">Post projects, review applicants, and invite experts directly.</p>
              </div>
              <div className="glass-card rounded-xl p-4">
                <p className="text-sm font-semibold text-white">Experts</p>
                <p className="mt-1 text-sm text-slate-300">Publish your services, showcase work, and track applications.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="glass rounded-3xl p-7 md:p-8">
          <h2 className="text-2xl font-extrabold text-white">Sign in</h2>
          <p className="mt-2 text-sm text-slate-300">
            {user ? `Signed in as ${user.username}` : "Access your n8nExperts account"}
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

          <p className="mt-5 text-sm text-slate-300">
            Don&apos;t have an account?
            <Link to="/auth/role-select" className="ml-1.5 font-semibold text-primary hover:underline">
              Create one
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
