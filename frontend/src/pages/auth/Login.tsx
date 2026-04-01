import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ShieldCheck, Workflow } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePageMeta } from "@/hooks/usePageMeta";
import { cn } from "@/lib/utils";
import { ContextAside } from "@/components/layout/PagePrimitives";
import { errorFieldClassName, FieldErrorText, FormBanner } from "@/components/forms/FormFeedback";
import { getFieldFeedback, getFormFeedback } from "@/lib/form-feedback";
import { buildRegisterPath, readAuthIntent, resolvePostAuthPath } from "@/lib/auth-intent";
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

  const usernameError = getFieldFeedback(feedback, "username");
  const passwordError = getFieldFeedback(feedback, "password");

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-10">
      <div className="container grid gap-6 lg:grid-cols-[0.95fr_0.75fr]">
        <section className="glass rounded-3xl p-7 md:p-8">
          <h2 className="text-2xl font-extrabold text-white">Sign in</h2>
          <p className="mt-2 text-sm text-slate-300">
            {user ? `Signed in as ${user.username}` : "Get back to your jobs, applicants, messages, or profile updates."}
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Username or Email</label>
              <input
                className={cn(
                  "mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-white outline-none transition focus:border-primary/70 focus:ring-1 focus:ring-primary/60",
                  usernameError && errorFieldClassName
                )}
                value={formData.username}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, username: e.target.value }));
                  if (feedback) {
                    setFeedback(null);
                  }
                }}
                aria-invalid={Boolean(usernameError)}
                required
              />
              <FieldErrorText message={usernameError} className="mt-2" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Password</label>
              <input
                type="password"
                className={cn(
                  "mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-white outline-none transition focus:border-primary/70 focus:ring-1 focus:ring-primary/60",
                  passwordError && errorFieldClassName
                )}
                value={formData.password}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, password: e.target.value }));
                  if (feedback) {
                    setFeedback(null);
                  }
                }}
                aria-invalid={Boolean(passwordError)}
                required
              />
              <FieldErrorText message={passwordError} className="mt-2" />
            </div>

            <FormBanner message={feedback?.summary} />

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
            <p className="mt-2">
              {intent.redirectPath
                ? `After sign in, we will return you to ${intent.redirectPath}.`
                : "Clients go back to jobs and hiring. Experts go back to applications, messages, and profile updates."}
            </p>
          </div>

          <p className="mt-5 text-sm text-slate-300">
            Don&apos;t have an account?
            <Link to={createAccountHref} className="ml-1.5 font-semibold text-primary hover:underline">
              Create one
            </Link>
          </p>
        </section>

        <ContextAside
          eyebrow="Welcome back"
          title="Sign in and get back to work."
          description="This page should feel direct. Sign in, land in the right workspace, and keep going without extra steps."
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
