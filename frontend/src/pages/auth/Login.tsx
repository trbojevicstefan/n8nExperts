import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { ArrowRight, LockKeyhole, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePageMeta } from "@/hooks/usePageMeta";
import { cn } from "@/lib/utils";
import { FieldErrorText, FormBanner } from "@/components/forms/FormFeedback";
import { getFieldFeedback, getFormFeedback } from "@/lib/form-feedback";
import { buildRegisterPath, readAuthIntent, resolvePostAuthPath } from "@/lib/auth-intent";
import { buildApiUrl } from "@/lib/api";
import type { FormFeedbackState } from "@/types";

export default function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [feedback, setFeedback] = useState<FormFeedbackState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const intent = readAuthIntent(searchParams);
  const createAccountHref = intent.requiredRole ? buildRegisterPath(intent.requiredRole, intent) : "/auth/role-select";

  usePageMeta({
    title: "Log In | n8nExperts",
    description: "Access your n8nExperts workspace to manage experts, jobs, applications, invitations, and inbox activity.",
    canonicalPath: "/auth/login",
    noIndex: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsLoading(true);

    try {
      const signedInUser = await login(formData);
      navigate(resolvePostAuthPath(signedInUser.role, intent, "login"), { replace: true });
    } catch (err: unknown) {
      setFeedback(getFormFeedback(err, "We could not sign you in. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const clearFeedback = () => {
    if (feedback) setFeedback(null);
  };
  const usernameError = getFieldFeedback(feedback, "username");
  const passwordError = getFieldFeedback(feedback, "password");

  return (
    <div className="container py-4 md:py-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(8,11,19,0.96),rgba(15,22,35,0.88))] shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
        <div className="hero-glow hero-glow-left" />
        <div className="hero-glow hero-glow-right" />

        <div className="relative z-10 grid min-h-[calc(100vh-12rem)] gap-0 lg:grid-cols-[0.92fr_1.08fr]">
          <aside className="hidden border-r border-white/10 p-8 lg:flex lg:flex-col lg:justify-between">
            <div>
              <p className="eyebrow">Workspace access</p>
              <h1 className="mt-6 max-w-[10ch] text-5xl font-black leading-[0.95] tracking-[-0.05em] text-white">
                Welcome back
              </h1>
              <p className="mt-5 max-w-md text-base leading-8 text-[var(--color-text-secondary)]">
                Sign in to pick up the exact hiring or delivery workflow you were working on.
              </p>
            </div>

            <div className="grid gap-3">
              {[
                "Protected routes preserve your intended destination.",
                "Client and expert workspaces stay role-aware.",
                "Jobs, messages, services, and saved views stay connected.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm text-[var(--color-text-secondary)]">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success)]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </aside>

          <main className="flex items-center justify-center p-5 md:p-8 lg:p-10">
            <div className="w-full max-w-[30rem]">
              <div className="mb-7 text-center lg:text-left">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-[var(--color-accent-cool)] lg:mx-0">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-black tracking-[-0.04em] text-white">Log in to n8nExperts</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">
                  {user ? `Signed in as ${user.username}` : "Use email, username, or Google to continue into your workspace."}
                </p>
              </div>

              <a
                href={buildApiUrl("/auth/google")}
                className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-white/10 bg-white/6 px-4 text-sm font-bold text-white transition hover:border-white/20 hover:bg-white/10"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>Continue with Google</span>
              </a>

              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--color-text-muted)]">or use password</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]" htmlFor="login-email">
                    Email or username
                  </label>
                  <div
                    className={cn(
                      "relative rounded-2xl border border-white/10 bg-black/25 transition focus-within:border-[var(--color-primary)] focus-within:shadow-[0_0_0_3px_var(--color-primary-glow)]",
                      usernameError && "border-[var(--color-error)]/70"
                    )}
                  >
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
                    <input
                      className="h-12 w-full border-none bg-transparent pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:ring-0"
                      id="login-email"
                      placeholder="alex@company.com"
                      type="text"
                      autoComplete="username"
                      value={formData.username}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, username: e.target.value }));
                        clearFeedback();
                      }}
                      aria-invalid={Boolean(usernameError)}
                      required
                    />
                  </div>
                  <FieldErrorText message={usernameError} className="mt-1" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]" htmlFor="login-password">
                    Password
                  </label>
                  <div
                    className={cn(
                      "relative rounded-2xl border border-white/10 bg-black/25 transition focus-within:border-[var(--color-primary)] focus-within:shadow-[0_0_0_3px_var(--color-primary-glow)]",
                      passwordError && "border-[var(--color-error)]/70"
                    )}
                  >
                    <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
                    <input
                      className="h-12 w-full border-none bg-transparent pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:ring-0"
                      id="login-password"
                      placeholder="Password"
                      type="password"
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, password: e.target.value }));
                        clearFeedback();
                      }}
                      aria-invalid={Boolean(passwordError)}
                      required
                    />
                  </div>
                  <FieldErrorText message={passwordError} className="mt-1" />
                </div>

                <div className="flex items-center justify-between gap-3 text-xs">
                  <label className="flex cursor-pointer items-center gap-2 text-[var(--color-text-secondary)]">
                    <input className="h-4 w-4 rounded border-white/10 bg-white/5 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" type="checkbox" />
                    <span>Keep me signed in on this device</span>
                  </label>
                  <span className="text-[var(--color-text-muted)]">Password reset coming soon</span>
                </div>

                <FormBanner message={feedback?.summary} />

                <button
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-6 text-base font-black text-white shadow-[0_18px_45px_var(--color-primary-glow)] transition hover:bg-[var(--color-primary-hover)] active:scale-[0.98] disabled:opacity-60"
                  type="submit"
                  disabled={isLoading}
                >
                  <span>{isLoading ? "Signing in..." : "Sign in"}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <p className="mt-7 text-center text-sm text-[var(--color-text-secondary)]">
                Don&apos;t have an account?{" "}
                <Link to={createAccountHref} className="font-bold text-white underline decoration-[var(--color-primary)]/50 underline-offset-4 hover:text-[var(--color-accent-cool)]">
                  Choose your path
                </Link>
              </p>
            </div>
          </main>
        </div>
      </section>
    </div>
  );
}
