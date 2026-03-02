import { Link } from "react-router-dom";
import { BriefcaseBusiness, SearchCode, UserRoundCheck, Workflow } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";

const stats = [
  { label: "Live Experts", value: "120+" },
  { label: "Open Projects", value: "40+" },
  { label: "Application SLA", value: "<24h" },
];

const workflowSteps = [
  {
    title: "1. Post clear n8n jobs",
    description: "Clients publish scope, required integrations, budget model, and priority outcomes.",
  },
  {
    title: "2. Review expert proof",
    description: "Compare profile depth, portfolio examples, services, and ratings before outreach.",
  },
  {
    title: "3. Invite or accept applications",
    description: "Use invitations and status pipelines to shortlist, accept, and start work quickly.",
  },
  {
    title: "4. Track delivery and quality",
    description: "Follow started/completed jobs, active inbox threads, and post-completion reviews.",
  },
];

const faqs = [
  {
    q: "What can clients do today?",
    a: "Post jobs, invite experts, manage applicants by status, track active work, and leave reviews after completion.",
  },
  {
    q: "What can experts do today?",
    a: "Publish a public profile, add services and portfolio work, receive invitations, chat in-context, and apply to open jobs.",
  },
  {
    q: "Does this include payments?",
    a: "No. This phase is quality-first marketplace operations only. Payments and email are intentionally out of scope.",
  },
  {
    q: "Who operates n8nExperts?",
    a: "n8nExperts is built and operated by n8nlab.io for teams shipping production n8n automations.",
  },
];

export default function Home() {
  usePageMeta({
    title: "n8nExperts | Hire n8n Experts and Find n8n Projects",
    description:
      "n8nExperts is a focused marketplace where clients post n8n projects and experts publish profiles, services, and portfolio work.",
  });

  return (
    <div className="min-h-screen">
      <section className="pt-28 pb-20">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(140deg,rgba(7,13,20,0.96),rgba(13,22,34,0.94))] px-7 py-12 md:px-12 md:py-16">
            <div className="pointer-events-none absolute -left-24 -top-20 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 -bottom-20 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative z-10 max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sky-200">
                <Workflow className="h-3.5 w-3.5" />
                n8n Experts Marketplace
              </p>
              <h1 className="mt-6 text-4xl md:text-6xl font-extrabold leading-[1.04] text-white">
                Hire vetted n8n specialists,
                <span className="gradient-text"> launch automation faster.</span>
              </h1>
              <p className="mt-6 text-lg text-slate-300 max-w-2xl">
                Clients post real automation jobs. Experts publish public profiles, services, and portfolio outcomes. Both sides
                move through a clean invitation, application, and delivery workflow.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/find-experts"
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-[0_8px_25px_var(--color-primary-glow)] hover:bg-primary-hover"
                >
                  Find Experts
                </Link>
                <Link
                  to="/jobs"
                  className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-white hover:bg-white/10"
                >
                  Explore Jobs
                </Link>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-3 max-w-xl">
                {stats.map((stat) => (
                  <div key={stat.label} className="panel px-4 py-3">
                    <p className="text-xl font-extrabold text-white">{stat.value}</p>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-5">
            <article className="glass-card rounded-2xl p-6">
              <UserRoundCheck className="h-7 w-7 text-sky-300" />
              <h2 className="mt-5 text-lg font-bold text-white">Public Expert Profiles</h2>
              <p className="mt-2 text-sm text-slate-300">
                Experts publish proven delivery history, services, and portfolio work so clients can evaluate fit quickly.
              </p>
            </article>
            <article className="glass-card rounded-2xl p-6">
              <BriefcaseBusiness className="h-7 w-7 text-orange-300" />
              <h2 className="mt-5 text-lg font-bold text-white">Structured Job Posting</h2>
              <p className="mt-2 text-sm text-slate-300">
                Clients post fixed-price or hourly n8n projects with scope, integrations, budgets, and required skills.
              </p>
            </article>
            <article className="glass-card rounded-2xl p-6">
              <SearchCode className="h-7 w-7 text-emerald-300" />
              <h2 className="mt-5 text-lg font-bold text-white">Actionable Pipeline</h2>
              <p className="mt-2 text-sm text-slate-300">
                Track invitations, applications, chat, started work, and reviews from active routes used daily.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="pb-8">
        <div className="container">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
            <h2 className="text-2xl font-extrabold text-white">Built for real n8n delivery teams</h2>
            <p className="mt-3 text-sm text-slate-300 max-w-3xl">
              n8nExperts focuses on execution quality over marketplace noise: clear job briefs, transparent expert credentials,
              direct invitation flow, and role-specific dashboards that reduce time-to-hire.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-10">
        <div className="container">
          <div className="panel p-6 md:p-8">
            <h2 className="text-2xl font-extrabold text-white">How n8nExperts works</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {workflowSteps.map((step) => (
                <article key={step.title} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-sky-200">{step.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="container">
          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map((item) => (
              <article key={item.q} className="glass-card rounded-2xl p-5">
                <h3 className="text-base font-bold text-white">{item.q}</h3>
                <p className="mt-2 text-sm text-slate-300">{item.a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
