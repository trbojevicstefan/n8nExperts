import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Sparkles, Workflow } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePageMeta } from "@/hooks/usePageMeta";
import { buildLoginPath, buildRegisterPath, readAuthIntent } from "@/lib/auth-intent";

type SelectableRole = "client" | "expert";

const roleCards: Array<{
  role: SelectableRole;
  ariaLabel: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: typeof BriefcaseBusiness;
  bullets: string[];
}> = [
  {
    role: "client",
    ariaLabel: "I need to hire",
    eyebrow: "For clients",
    title: "I need to hire",
    description: "Post a sharper n8n brief, compare proof, invite experts, and keep applicants organized.",
    icon: BriefcaseBusiness,
    bullets: ["Structured project briefs", "Expert proof and services", "Pipeline, notes, and inbox"],
  },
  {
    role: "expert",
    ariaLabel: "I want to offer services",
    eyebrow: "For experts",
    title: "I want to offer services",
    description: "Build a profile clients can trust, package services, and apply to serious n8n work.",
    icon: Sparkles,
    bullets: ["Profile and portfolio setup", "Service offers with clear scope", "Jobs, invitations, and saved views"],
  },
];

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState<SelectableRole | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const intent = useMemo(() => readAuthIntent(searchParams), [searchParams]);

  usePageMeta({
    title: "Choose Your Role | n8nExperts",
    description: "Choose whether you are joining n8nExperts as a client hiring automation talent or as an expert publishing proof and services.",
    canonicalPath: "/auth/role-select",
    noIndex: true,
  });

  const continueLabel = selectedRole ? `Continue as ${selectedRole === "client" ? "Client" : "Expert"}` : "Choose a role to continue";

  return (
    <div className="container py-4 md:py-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(8,11,19,0.96),rgba(15,22,35,0.88))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)] md:p-8 lg:p-10">
        <div className="hero-glow hero-glow-left" />
        <div className="hero-glow hero-glow-right" />

        <div className="relative z-10 grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <div>
            <p className="eyebrow">Choose your path</p>
            <h1 className="mt-5 max-w-[11ch] text-4xl font-black leading-[0.95] tracking-[-0.05em] text-white md:text-6xl">
              Join n8nExperts
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-[var(--color-text-secondary)] md:text-lg">
              Pick the side of the marketplace that matches what you want to do next. We will route your account setup and workspace around that choice.
            </p>

            <div className="mt-7 grid gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-4">
              {[
                "Clients start with a project brief or expert search.",
                "Experts start with profile proof and services.",
                "Your intended protected route is preserved through auth.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm text-[var(--color-text-secondary)]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success)]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              {roleCards.map((card) => {
                const selected = selectedRole === card.role;
                const Icon = card.icon;

                return (
                  <button
                    key={card.role}
                    type="button"
                    aria-label={card.ariaLabel}
                    aria-pressed={selected}
                    onClick={() => setSelectedRole(card.role)}
                    className={cn(
                      "group relative min-h-[23rem] overflow-hidden rounded-[1.75rem] border p-6 text-left transition duration-300",
                      "bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))]",
                      selected
                        ? "border-[var(--color-primary)] shadow-[0_24px_60px_var(--color-primary-glow)]"
                        : "border-white/10 opacity-90 hover:-translate-y-1 hover:border-white/25 hover:opacity-100"
                    )}
                  >
                    <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_50%_0%,rgba(132,216,255,0.16),transparent_65%)] opacity-80" />
                    <div className="relative z-10 flex h-full flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <span
                          className={cn(
                            "inline-flex h-14 w-14 items-center justify-center rounded-2xl border transition",
                            selected
                              ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                              : "border-white/10 bg-white/6 text-[var(--color-accent-cool)] group-hover:border-white/20"
                          )}
                        >
                          <Icon className="h-6 w-6" />
                        </span>
                        <span
                          className={cn(
                            "inline-flex h-7 w-7 items-center justify-center rounded-full border transition",
                            selected ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white" : "border-white/15 text-transparent"
                          )}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </span>
                      </div>

                      <p className="mt-7 text-[11px] font-black uppercase tracking-[0.24em] text-[var(--color-text-muted)]">{card.eyebrow}</p>
                      <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-white">{card.title}</h2>
                      <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">{card.description}</p>

                      <ul className="mt-6 space-y-3">
                        {card.bullets.map((bullet) => (
                          <li key={bullet} className="flex items-start gap-3 text-sm font-medium text-slate-300">
                            <span className={cn("mt-2 h-1.5 w-1.5 shrink-0 rounded-full", selected ? "bg-[var(--color-primary)]" : "bg-[var(--color-accent-cool)]")} />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-auto pt-7 text-sm font-bold text-white">
                        {selected ? "Selected path" : "Select this path"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4 md:p-5">
              <button
                type="button"
                disabled={!selectedRole}
                onClick={() => selectedRole && navigate(buildRegisterPath(selectedRole, intent))}
                className={cn(
                  "flex h-14 w-full items-center justify-center gap-2 rounded-full px-6 text-base font-black transition",
                  selectedRole
                    ? "bg-[var(--color-primary)] text-white shadow-[0_18px_45px_var(--color-primary-glow)] hover:bg-[var(--color-primary-hover)] active:scale-[0.98]"
                    : "cursor-not-allowed border border-white/10 bg-white/6 text-[var(--color-text-muted)]"
                )}
              >
                <span>{continueLabel}</span>
                {selectedRole && <ArrowRight className="h-4 w-4" />}
              </button>

              {!selectedRole && (
                <p className="mt-3 text-center text-sm text-[var(--color-text-muted)]">
                  Choose client or expert first so the next screen matches your workflow.
                </p>
              )}

              <p className="mt-5 text-center text-sm text-[var(--color-text-secondary)]">
                Already have an account?{" "}
                <Link to={buildLoginPath(intent)} className="font-bold text-white underline decoration-[var(--color-primary)]/50 underline-offset-4 hover:text-[var(--color-accent-cool)]">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-8 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          <Workflow className="h-4 w-4 text-[var(--color-accent-cool)]" />
          <span>Role-aware onboarding</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>Protected route recovery</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>Built by n8nlab.io</span>
        </div>
      </section>
    </div>
  );
}
