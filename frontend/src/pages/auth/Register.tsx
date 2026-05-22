import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePageMeta } from "@/hooks/usePageMeta";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";
import { errorFieldClassName, FieldErrorText, FormBanner } from "@/components/forms/FormFeedback";
import { createLocalFormFeedback, getFieldFeedback, getFormFeedback } from "@/lib/form-feedback";
import { buildLoginPath, readAuthIntent, resolvePostAuthPath } from "@/lib/auth-intent";
import { buildApiUrl } from "@/lib/api";
import type { FormFeedbackState } from "@/types";

export default function Register() {
  const [searchParams] = useSearchParams();
  const initialRole: Role = searchParams.get("role") === "expert" ? "expert" : "client";
  const [role, setRole] = useState<Role>(initialRole);
  const intent = readAuthIntent(searchParams);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "US",
  });
  const [feedback, setFeedback] = useState<FormFeedbackState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  usePageMeta({
    title: `${role === "expert" ? "Create Expert Account" : "Create Client Account"} | n8nExperts`,
    description:
      role === "expert"
        ? "Create your expert account to publish proof, set up your profile, and apply to n8n work."
        : "Create your client account to post projects, compare experts, and manage applicants.",
    canonicalPath: "/auth/register",
    noIndex: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (formData.password !== formData.confirmPassword) {
      setFeedback(
        createLocalFormFeedback("Passwords do not match.", [
          { field: "confirmPassword", message: "Passwords do not match." },
        ])
      );
      return;
    }

    setIsLoading(true);
    try {
      const createdUser = await register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        country: formData.country,
        role,
      });

      const destination = resolvePostAuthPath(createdUser.role, intent, "register");
      const flashText = intent.redirectPath
        ? "Account created. You are back at the workflow step you wanted to open."
        : createdUser.role === "expert"
          ? "Expert account created. Start with your basics, then add one proof item to reach a usable profile."
          : "Client account created. Start with a project brief so experts can judge the scope quickly.";

      navigate(destination, {
        replace: true,
        state: {
          flash: {
            tone: "success",
            text: flashText,
          },
        },
      });
    } catch (err: unknown) {
      setFeedback(getFormFeedback(err, "We could not create the account. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const usernameError = getFieldFeedback(feedback, "username");
  const emailError = getFieldFeedback(feedback, "email");
  const passwordError = getFieldFeedback(feedback, "password");
  const confirmPasswordError = getFieldFeedback(feedback, "confirmPassword");

  return (
    <div className="min-h-screen flex flex-col font-display text-white relative" style={{
      backgroundImage: `
        radial-gradient(circle at 0% 0%, rgba(255, 107, 61, 0.09) 0%, transparent 40%),
        radial-gradient(circle at 100% 100%, rgba(132, 216, 255, 0.08) 0%, transparent 40%),
        linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)`,
      backgroundSize: '100% 100%, 100% 100%, 40px 40px, 40px 40px',
    }}>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-[640px] flex flex-col gap-8">
          {/* Hero Header */}
          <div className="text-center space-y-2">
            <h1 className="text-white tracking-tight text-4xl font-extrabold leading-tight">Create your account</h1>
            <p className="text-slate-400 text-lg font-medium">Join the world&apos;s leading n8n automation marketplace.</p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client Card */}
            <button
              type="button"
              onClick={() => setRole("client")}
              className={cn(
                "p-6 rounded-xl cursor-pointer flex flex-col gap-4 transition-all text-left",
                "backdrop-blur-xl border",
                role === "client"
                  ? "border-primary shadow-[0_0_20px_var(--color-primary-glow),inset_0_0_10px_rgba(255,107,61,0.05)]"
                  : "border-white/5 hover:border-white/20"
              )}
              style={{ background: 'rgba(22, 17, 18, 0.7)' }}
            >
              <div className="flex justify-between items-start">
                <div className={cn(
                  "size-12 rounded-lg flex items-center justify-center",
                  role === "client" ? "bg-primary/20 text-primary" : "bg-white/5 text-slate-300"
                )}>
                  <span className="material-symbols-outlined text-3xl">person</span>
                </div>
                <div className={cn(
                  "size-5 rounded-full border-2 flex items-center justify-center",
                  role === "client" ? "border-primary" : "border-white/10"
                )}>
                  {role === "client" && <div className="size-2.5 rounded-full bg-primary"></div>}
                </div>
              </div>
              <div>
                <h3 className="text-white text-lg font-bold">I&apos;m a Client</h3>
                <p className="text-slate-400 text-sm leading-relaxed mt-1">I want to hire an expert to build my workflows.</p>
              </div>
            </button>

            {/* Expert Card */}
            <button
              type="button"
              onClick={() => setRole("expert")}
              className={cn(
                "p-6 rounded-xl cursor-pointer flex flex-col gap-4 transition-all text-left",
                "backdrop-blur-xl border",
                role === "expert"
                  ? "border-primary shadow-[0_0_20px_var(--color-primary-glow),inset_0_0_10px_rgba(255,107,61,0.05)]"
                  : "border-white/5 hover:border-white/20"
              )}
              style={{ background: 'rgba(22, 17, 18, 0.7)' }}
            >
              <div className="flex justify-between items-start">
                <div className={cn(
                  "size-12 rounded-lg flex items-center justify-center",
                  role === "expert" ? "bg-primary/20 text-primary" : "bg-white/5 text-slate-300"
                )}>
                  <span className="material-symbols-outlined text-3xl">business_center</span>
                </div>
                <div className={cn(
                  "size-5 rounded-full border-2 flex items-center justify-center",
                  role === "expert" ? "border-primary" : "border-white/10"
                )}>
                  {role === "expert" && <div className="size-2.5 rounded-full bg-primary"></div>}
                </div>
              </div>
              <div>
                <h3 className="text-white text-lg font-bold">I&apos;m an Expert</h3>
                <p className="text-slate-400 text-sm leading-relaxed mt-1">I want to offer my n8n automation services.</p>
              </div>
            </button>
          </div>

          {/* Social Auth */}
          <a href={buildApiUrl("/auth/google")} className="w-full flex items-center justify-center gap-3 h-12 rounded-lg bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </a>

          {/* Separator */}
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10"></div>
            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">or continue with email</span>
            <div className="h-px flex-1 bg-white/10"></div>
          </div>

          {/* Registration Form */}
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-300 ml-1">Username</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xl group-focus-within:text-primary transition">person</span>
                <input
                  className={cn(
                    "w-full bg-white/5 border border-white/10 rounded-lg h-12 pl-11 pr-4 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition placeholder:text-slate-600 outline-none",
                    usernameError && errorFieldClassName
                  )}
                  placeholder="johndoe"
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

            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-300 ml-1">Email Address</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xl group-focus-within:text-primary transition">mail</span>
                <input
                  className={cn(
                    "w-full bg-white/5 border border-white/10 rounded-lg h-12 pl-11 pr-4 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition placeholder:text-slate-600 outline-none",
                    emailError && errorFieldClassName
                  )}
                  placeholder="john@example.com"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, email: e.target.value }));
                    if (feedback) setFeedback(null);
                  }}
                  aria-invalid={Boolean(emailError)}
                  required
                />
              </div>
              <FieldErrorText message={emailError} className="mt-1" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-300 ml-1">Password</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xl group-focus-within:text-primary transition">lock</span>
                <input
                  className={cn(
                    "w-full bg-white/5 border border-white/10 rounded-lg h-12 pl-11 pr-4 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition placeholder:text-slate-600 outline-none",
                    passwordError && errorFieldClassName
                  )}
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

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-300 ml-1">Confirm Password</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xl group-focus-within:text-primary transition">lock_clock</span>
                <input
                  className={cn(
                    "w-full bg-white/5 border border-white/10 rounded-lg h-12 pl-11 pr-4 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition placeholder:text-slate-600 outline-none",
                    confirmPasswordError && errorFieldClassName
                  )}
                  placeholder="••••••••"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }));
                    if (feedback) setFeedback(null);
                  }}
                  aria-invalid={Boolean(confirmPasswordError)}
                  required
                />
              </div>
              <FieldErrorText message={confirmPasswordError} className="mt-1" />
            </div>

            {/* Submit Action */}
            <div className="md:col-span-2 mt-4">
              <FormBanner message={feedback?.summary} />
              <button
                className="w-full h-14 bg-primary text-white font-extrabold rounded-lg text-lg shadow-lg shadow-primary/20 hover:scale-[1.01] hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-60"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : `Sign up as ${role === "client" ? "Client" : "Expert"}`}
              </button>
            </div>
          </form>

          {/* Footer */}
          <footer className="text-center pb-12">
            <p className="text-slate-500 text-sm">
              By clicking &quot;Sign up&quot;, you agree to our{" "}
              <a className="text-primary hover:underline" href="#">Terms of Service</a> and{" "}
              <a className="text-primary hover:underline" href="#">Privacy Policy</a>.
            </p>
            <p className="mt-4 text-slate-400 text-sm">
              Already have an account?{" "}
              <Link to={buildLoginPath(intent)} className="text-primary font-bold hover:underline">Log in</Link>
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
