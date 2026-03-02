import { Link } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, UserRoundCog } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Role = "client" | "expert" | null;

const roleCards = [
  {
    role: "client" as const,
    title: "I am a Client",
    subtitle: "Post projects and review applications",
    points: ["Create jobs with budget + scope", "Invite experts from profiles and services", "Manage shortlists and decisions"],
    icon: BriefcaseBusiness,
  },
  {
    role: "expert" as const,
    title: "I am an Expert",
    subtitle: "Showcase your work and win projects",
    points: ["Publish your bio, skills, and rate", "Add services and portfolio entries", "Apply to open n8n jobs"],
    icon: UserRoundCog,
  },
];

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState<Role>(null);

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-10">
      <section className="container page-hero panel relative overflow-hidden rounded-3xl px-6 py-10 md:px-10 md:py-14">
        <div className="relative z-10">
          <p className="inline-flex items-center rounded-full border border-sky-300/25 bg-sky-300/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.16em] text-sky-100">
            Account Setup
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight text-white md:text-5xl">Choose how you want to use n8nExperts</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
            This picks your default workspace and permissions. You can complete profile details on the next step.
          </p>
        </div>

        <div className="relative z-10 mt-8 grid gap-4 md:grid-cols-2">
          {roleCards.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.role}
                type="button"
                onClick={() => setSelectedRole(item.role)}
                className={cn(
                  "text-left rounded-2xl border p-6 transition-all",
                  selectedRole === item.role
                    ? "border-[var(--color-border-hover)] bg-[rgba(255,93,59,0.12)] shadow-[0_8px_30px_rgba(255,93,59,0.16)]"
                    : "border-white/10 bg-[rgba(15,24,35,0.78)] hover:border-white/25 hover:bg-[rgba(19,30,42,0.92)]"
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-white">{item.title}</p>
                    <p className="text-sm text-slate-300">{item.subtitle}</p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex h-10 w-10 items-center justify-center rounded-xl border",
                      selectedRole === item.role ? "border-primary/40 bg-primary/15 text-primary" : "border-white/10 bg-white/5 text-slate-300"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <ul className="mt-4 space-y-2">
                  {item.points.map((point) => (
                    <li key={point} className="text-sm text-slate-300">
                      {point}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        <div className="relative z-10 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            to={selectedRole ? `/auth/register?role=${selectedRole}` : "#"}
            onClick={(e) => !selectedRole && e.preventDefault()}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition",
              selectedRole
                ? "bg-primary text-white shadow-[0_10px_26px_var(--color-primary-glow)] hover:bg-primary-hover"
                : "cursor-not-allowed bg-white/10 text-slate-400"
            )}
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/auth/login" className="text-sm font-semibold text-slate-300 hover:text-white">
            I already have an account
          </Link>
        </div>
      </section>
    </div>
  );
}
