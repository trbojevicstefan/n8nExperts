import { Link } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, ShieldCheck, UserCheck } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";

const points = [
  {
    icon: UserCheck,
    title: "Expert-first Profiles",
    description: "Experts publish bios, skills, portfolio projects, and service offers in one public profile.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Real Job Pipeline",
    description: "Clients post jobs, experts apply, and clients shortlist/accept/reject with clear status tracking.",
  },
  {
    icon: ShieldCheck,
    title: "Quality-focused MVP",
    description: "No payment complexity in MVP. Focus is stability, clean data, and dependable role workflows.",
  },
];

const clientBenefits = [
  "Post jobs with realistic budget and technical scope",
  "Organize applicants by status with notes and quick actions",
  "Invite experts directly from profiles and services",
  "Track started/completed jobs from active routes",
];

const expertBenefits = [
  "Build richer public profiles with practical credibility signals",
  "Show portfolio and services in one discoverable profile",
  "Receive in-app invitations and respond quickly",
  "Track application outcomes and active work in one place",
];

export default function WhyUs() {
  usePageMeta({
    title: "Why n8nExperts | n8n Project Marketplace",
    description:
      "Learn why teams use n8nExperts for focused n8n hiring workflows: structured job briefs, public expert proof, and clean application pipelines.",
  });

  return (
    <div className="px-4 py-10">
      <section className="container page-hero panel relative overflow-hidden rounded-3xl px-7 py-10 md:px-10">
        <div className="relative z-10 text-center">
          <p className="inline-flex rounded-full border border-sky-300/20 bg-sky-300/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.16em] text-sky-100">
            Why n8nExperts
          </p>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-tight text-white md:text-5xl">
            A focused marketplace for n8n projects.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-300 md:text-base">
            We keep the MVP focused on what matters right now: expert visibility, high-quality client briefs, and a reliable
            application lifecycle. n8nExperts is operated by n8nlab.io.
          </p>
        </div>

        <div className="relative z-10 mt-10 grid gap-4 md:grid-cols-3">
          {points.map((point) => {
            const Icon = point.icon;
            return (
              <article key={point.title} className="glass-card rounded-2xl p-6">
                <Icon className="h-7 w-7 text-primary" />
                <h2 className="mt-4 text-lg font-bold text-white">{point.title}</h2>
                <p className="mt-2 text-sm text-slate-300">{point.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="container mt-6 panel rounded-3xl p-7 md:p-10">
        <h2 className="text-2xl font-extrabold text-white">What makes this marketplace useful day to day</h2>
        <p className="mt-3 max-w-3xl text-sm text-slate-300 md:text-base">
          We prioritize practical operations over vanity features: faster qualification, cleaner hiring decisions, and clear
          job ownership across client and expert workflows.
        </p>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-sky-200">For Clients</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {clientBenefits.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-200">For Experts</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {expertBenefits.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="container mt-6 rounded-3xl border border-primary/25 bg-[linear-gradient(145deg,rgba(255,93,59,0.18),rgba(255,93,59,0.08))] px-7 py-9 text-center md:px-10">
        <h2 className="text-3xl font-extrabold text-white">Ready to start?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-100 md:text-base">
          Post your project as a client or publish your profile as an expert in a few minutes.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/find-experts"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary-hover"
          >
            Find Experts
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/auth/role-select"
            className="inline-flex items-center justify-center rounded-xl border border-white/40 px-5 py-3 text-sm font-bold text-white hover:bg-white/10"
          >
            Create Account
          </Link>
        </div>
      </section>
    </div>
  );
}
