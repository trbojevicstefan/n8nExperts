import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePageMeta } from "@/hooks/usePageMeta";
import { cn } from "@/lib/utils";
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
    <div className="min-h-screen flex flex-col font-display text-gray-100 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at top right, rgba(244, 37, 89, 0.15), transparent 40%)' }}></div>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-[460px]">
          {/* Glassmorphic Card */}
          <div className="backdrop-blur-xl border border-white/10 rounded-xl p-8 lg:p-10" style={{ background: 'rgba(25, 25, 25, 0.7)', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.8)' }}>
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
              <p className="text-gray-400 text-sm">
                {user ? `Signed in as ${user.username}` : "Sign in to your n8nExperts account"}
              </p>
            </div>

            {/* Social Login */}
            <div className="space-y-4 mb-8">
              <button className="w-full flex items-center justify-center gap-3 bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] text-white py-3 px-4 rounded-lg transition-all duration-200">
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="text-sm font-semibold tracking-wide">Continue with Google</span>
              </button>
            </div>

            {/* Separator */}
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0a0a0a] px-3 text-gray-500 font-medium">or continue with email</span>
              </div>
            </div>

            {/* Form Fields */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider pl-1" htmlFor="login-email">Email Address</label>
                <div className={cn(
                  "relative rounded-lg border border-white/10 transition-all duration-200 focus-within:border-primary focus-within:shadow-[0_0_0_2px_rgba(244,37,89,0.2)]",
                  usernameError && "border-red-500/50"
                )}>
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xl">mail</span>
                  <input
                    className="w-full bg-transparent border-none py-3 pl-11 pr-4 text-white placeholder:text-gray-600 focus:ring-0 text-sm outline-none"
                    id="login-email"
                    placeholder="alex@company.com"
                    type="text"
                    value={formData.username}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, username: e.target.value }));
                      if (feedback) setFeedback(null);
                    }}
                    aria-invalid={Boolean(usernameError)}
                    required
                  />
                </div>
                <FieldErrorText message={usernameError} className="mt-1" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider pl-1" htmlFor="login-password">Password</label>
                <div className={cn(
                  "relative rounded-lg border border-white/10 transition-all duration-200 focus-within:border-primary focus-within:shadow-[0_0_0_2px_rgba(244,37,89,0.2)]",
                  passwordError && "border-red-500/50"
                )}>
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xl">lock</span>
                  <input
                    className="w-full bg-transparent border-none py-3 pl-11 pr-4 text-white placeholder:text-gray-600 focus:ring-0 text-sm outline-none"
                    id="login-password"
                    placeholder="••••••••"
                    type="password"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, password: e.target.value }));
                      if (feedback) setFeedback(null);
                    }}
                    aria-invalid={Boolean(passwordError)}
                    required
                  />
                </div>
                <FieldErrorText message={passwordError} className="mt-1" />
              </div>

              <div className="flex items-center justify-between text-xs py-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary" type="checkbox" />
                  <span className="text-gray-400 group-hover:text-gray-200 transition-colors">Remember me</span>
                </label>
                <a className="text-primary hover:underline font-semibold" href="#">Forgot password?</a>
              </div>

              <FormBanner message={feedback?.summary} />

              {/* Action Button */}
              <button
                className="w-full flex items-center justify-between bg-primary hover:brightness-110 active:scale-[0.98] text-white font-bold py-3.5 px-6 rounded-lg transition-all duration-200 shadow-lg shadow-primary/20 disabled:opacity-60"
                type="submit"
                disabled={isLoading}
              >
                <span className="flex-1 text-center ml-4">{isLoading ? "Signing in..." : "Sign in"}</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </form>

            {/* Footer */}
            <div className="mt-10 text-center">
              <p className="text-gray-400 text-sm">
                Don&apos;t have an account?
                <Link to={createAccountHref} className="text-primary font-bold hover:underline ml-1">Sign up</Link>
              </p>
            </div>
          </div>

          {/* Trust Elements */}
          <div className="mt-12 flex items-center justify-center gap-8 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              <span className="text-xs font-medium uppercase tracking-widest">Enterprise Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">encrypted</span>
              <span className="text-xs font-medium uppercase tracking-widest">Secure Payments</span>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Gradient Accent */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
    </div>
  );
}
