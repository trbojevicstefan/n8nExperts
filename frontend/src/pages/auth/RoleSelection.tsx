import { Link } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, ShieldCheck, UserRoundCog } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { usePageMeta } from "@/hooks/usePageMeta";
import { ContextAside } from "@/components/layout/PagePrimitives";

type Role = "client" | "expert" | null;

const roleCards = [
  {
    role: "client" as const,
    title: "I need to hire",
    subtitle: "Post a job and review applicants",
    points: ["Write a job post", "Invite experts", "Compare applicants and choose who to hire"],
    icon: BriefcaseBusiness,
  },
  {
    role: "expert" as const,
    title: "I want to get hired",
    subtitle: "Build a profile and apply to jobs",
    points: ["Add your headline, skills, and rate", "Show a service or work sample", "Apply to open jobs"],
    icon: UserRoundCog,
  },
];

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState<Role>(null);

  usePageMeta({
    title: "Choose Your Role | n8nExperts",
    description: "Choose whether you are joining n8nExperts as a client hiring automation talent or as an expert publishing proof and services.",
    canonicalPath: "/auth/role-select",
    noIndex: true,
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-10">
      <section className="container grid gap-6 lg:grid-cols-[1.05fr_0.8fr]">
        <div className="glass rounded-3xl p-7 md:p-8">
          <div className="relative z-10">
            <p className="eyebrow">Account setup</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight text-white md:text-5xl">What do you want to do here?</h1>
            <p className="mt-3 max-w-2xl text-sm text-[var(--color-text-secondary)] md:text-base">
              Pick the side of the platform that matches your goal right now. You can create an account in one step after this.
            </p>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {roleCards.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => setSelectedRole(item.role)}
                  className={cn(
                    "text-left rounded-[28px] border p-6 transition-all",
                    selectedRole === item.role
                      ? "border-[var(--color-border-hover)] bg-[rgba(255,107,61,0.12)] shadow-[0_18px_45px_rgba(255,107,61,0.18)]"
                      : "border-white/10 bg-white/6 hover:border-white/25 hover:bg-white/10"
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-lg font-bold text-white">{item.title}</p>
                      <p className="text-sm text-[var(--color-text-secondary)]">{item.subtitle}</p>
                    </div>
                    <span
                      className={cn(
                        "inline-flex h-11 w-11 items-center justify-center rounded-2xl border",
                        selectedRole === item.role ? "border-primary/40 bg-primary/15 text-primary" : "border-white/10 bg-white/5 text-slate-300"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <ul className="mt-4 space-y-3">
                    {item.points.map((point) => (
                      <li key={point} className="text-sm text-[var(--color-text-secondary)]">
                        {point}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            to={selectedRole ? `/auth/register?role=${selectedRole}` : "#"}
            onClick={(e) => !selectedRole && e.preventDefault()}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition",
              selectedRole
                ? "bg-primary text-white shadow-[0_18px_45px_var(--color-primary-glow)] hover:bg-primary-hover"
                : "cursor-not-allowed bg-white/10 text-slate-400"
            )}
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/auth/login" className="text-sm font-semibold text-[var(--color-text-secondary)] hover:text-white">
            I already have an account
          </Link>
        </div>

        <ContextAside
          eyebrow="Simple rule"
          title="Choose based on your next action."
          description="If you need to hire someone, choose client. If you want to show your work and apply to jobs, choose expert."
          className="self-start"
        >
          <div className="space-y-3 text-sm leading-7 text-[var(--color-text-secondary)]">
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="inline-flex items-center gap-2 font-semibold text-white">
                <ShieldCheck className="h-4 w-4 text-[var(--color-accent)]" />
                Clients
              </p>
              <p className="mt-2">Post jobs, invite experts, compare applicants, and hire with less confusion.</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="font-semibold text-white">Experts</p>
              <p className="mt-2">Set up your profile, publish services, apply to jobs, and respond to client messages.</p>
            </div>
          </div>
        </ContextAside>
      </section>
    </div>
  );
}
