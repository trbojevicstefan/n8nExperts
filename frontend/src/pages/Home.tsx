import {
  ArrowRight,
  ArrowRightLeft,
  BellDot,
  BriefcaseBusiness,
  MessagesSquare,
  SearchCode,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  Workflow,
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { ConversionRail } from "@/components/marketing/ConversionRail";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { homeContent } from "@/content/site";
import { useAuth } from "@/hooks/useAuth";
import { usePageMeta } from "@/hooks/usePageMeta";

const heroInsightCards = [
  {
    eyebrow: "Browse faster",
    title: "See fit before the first message",
    description: "Profiles, services, and work samples help clients judge fit before they start outreach.",
    icon: ShieldCheck,
    accent: "text-[var(--color-accent)]",
  },
  {
    eyebrow: "Better job flow",
    title: "Move from brief to shortlist faster",
    description: "Applications, invitations, and job states keep the next action visible once hiring starts.",
    icon: Workflow,
    accent: "text-[var(--color-accent-cool)]",
  },
  {
    eyebrow: "Keep context",
    title: "Messages stay tied to the job",
    description: "Notes, messages, and accepted work stay connected instead of getting scattered across tabs.",
    icon: MessagesSquare,
    accent: "text-[var(--color-success)]",
  },
  {
    eyebrow: "One place",
    title: "Discovery and hiring live together",
    description: "Experts, jobs, applications, and inbox routes stay in the same product once you sign in.",
    icon: BellDot,
    accent: "text-[var(--color-accent-soft)]",
  },
];

export default function Home() {
  const { user } = useAuth();
  const heroActions = homeContent.hero.actions;
  const homeRail = {
    title: "Start with the side of the marketplace that matches your goal.",
    description:
      "If you are hiring, browse experts or post a project. If you are an expert, create your account and show the kind of work you want to be hired for.",
    primaryAction: { label: "Browse Experts", href: "/find-experts" },
    secondaryAction: { label: "Create Account", href: "/auth/role-select" },
    signals: ["Browse proof before outreach", "Post jobs with clearer context", "Show services and work samples", "Built by n8nlab.io"],
  };

  usePageMeta({
    title: "n8nExperts | Hire n8n experts with clearer trust and workflow context",
    description:
      "n8nExperts is a trust-first marketplace for teams hiring n8n specialists and experts presenting stronger delivery proof.",
    canonicalPath: "/",
  });

  if (user) {
    return <Navigate to="/workspace" replace />;
  }

  return (
    <div className="container page-stack">
      <section className="home-hero-shell">
        <div className="home-hero-grid">
          <div className="home-hero-copy">
            <p className="eyebrow">{homeContent.hero.eyebrow}</p>
            <h1 className="home-hero-title">{homeContent.hero.title}</h1>
            <p className="home-hero-description">{homeContent.hero.description}</p>

            <div className="home-hero-actions">
              {heroActions.map((action) => (
                <Link
                  key={`${action.href}-${action.label}`}
                  to={action.href}
                  className={
                    action.variant === "secondary"
                      ? "home-hero-action home-hero-action-secondary"
                      : "home-hero-action home-hero-action-primary"
                  }
                >
                  <span>{action.label}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ))}
            </div>

            <div className="home-hero-metrics">
              {homeContent.hero.metrics.map((metric) => (
                <article key={metric.label} className="home-hero-metric-card">
                  <p className="home-hero-metric-value">{metric.value}</p>
                  <p className="home-hero-metric-label">{metric.label}</p>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="home-hero-support-grid">
          {heroInsightCards.map((card) => {
            const Icon = card.icon;

            return (
              <article key={card.title} className="hero-insight-card">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="hero-insight-eyebrow">{card.eyebrow}</p>
                    <h3 className="hero-insight-title">{card.title}</h3>
                  </div>
                  <span className={`hero-insight-icon ${card.accent}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <p className="hero-insight-copy">{card.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section-shell">
        <SectionHeading
          eyebrow="Start here"
          title="Three things the platform helps you do quickly."
          description="Understand who fits, what the work is, and what to do next without digging through noise."
        />
        <div className="section-grid mt-6">
          {homeContent.platformCards.map((card, index) => {
            const Icon = [BriefcaseBusiness, UserRoundCheck, Workflow][index];
            return (
              <article key={card.title} className="surface-card">
                <Icon className="h-6 w-6 text-[var(--color-accent-cool)]" />
                {card.eyebrow && <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">{card.eyebrow}</p>}
                <h3 className="mt-3 text-xl font-bold text-white">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">{card.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section-shell">
        <SectionHeading
          eyebrow="Who it is for"
          title="Choose the side that matches your goal."
          description="Clients come here to hire. Experts come here to show their work and get hired."
        />
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {homeContent.audiences.map((audience, index) => (
            <article key={audience.title} className="feature-panel">
              <div className="inline-flex rounded-full border border-white/10 bg-white/6 p-3">
                {index === 0 ? (
                  <BriefcaseBusiness className="h-5 w-5 text-[var(--color-accent)]" />
                ) : (
                  <Sparkles className="h-5 w-5 text-[var(--color-accent-cool)]" />
                )}
              </div>
              <h3 className="mt-5 text-2xl font-bold text-white">{audience.title}</h3>
              <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">{audience.description}</p>
              <Link
                to={index === 0 ? "/for-clients" : "/for-experts"}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-[var(--color-accent-cool)]"
              >
                <span>{index === 0 ? "See the client path" : "See the expert path"}</span>
                <ArrowRightLeft className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <SectionHeading
          eyebrow="How it works"
          title="The flow is simple."
          description="Post or find a job, compare fit, then move the conversation forward without extra guesswork."
        />
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {homeContent.workflow.map((step, index) => (
            <article key={step.title} className="timeline-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent-cool)]">Stage {index + 1}</p>
                  <h3 className="mt-3 text-xl font-bold text-white">{step.title}</h3>
                </div>
                <Workflow className="h-5 w-5 text-[var(--color-text-muted)]" />
              </div>
              <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">{step.description}</p>
              {step.outcome && <p className="mt-4 text-sm font-medium text-[var(--color-accent)]">{step.outcome}</p>}
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <SectionHeading
          eyebrow="Why it feels different"
          title="Built for fit, proof, and next steps."
          description="It gives both sides better information before they commit time to a conversation."
        />
        <div className="mt-6 overflow-hidden rounded-[28px] border border-white/10">
          <div className="grid grid-cols-[1.1fr_1fr_1fr] bg-white/6 px-6 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            <span>Decision area</span>
            <span>n8nExperts</span>
            <span>Generic marketplace</span>
          </div>
          {homeContent.comparison.map((row) => (
            <div key={row.title} className="grid grid-cols-1 gap-4 border-t border-white/10 px-6 py-5 md:grid-cols-[1.1fr_1fr_1fr]">
              <div>
                <p className="text-base font-semibold text-white">{row.title}</p>
              </div>
              <p className="text-sm leading-7 text-[var(--color-text-secondary)]">{row.n8nExperts}</p>
              <p className="text-sm leading-7 text-[var(--color-text-muted)]">{row.generic}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <SectionHeading
          eyebrow="Proof and detail"
          title="A profile or brief should make sense quickly."
          description="That is why services, work samples, job details, and messaging flow live in the same product."
        />
        <div className="section-grid mt-6">
          {homeContent.proofCards.slice(0, 3).map((card, index) => {
            const Icon = [ShieldCheck, SearchCode, MessagesSquare][index];
            return (
              <article key={card.title} className="surface-card">
                <Icon className="h-6 w-6 text-[var(--color-accent)]" />
                <h3 className="mt-5 text-xl font-bold text-white">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">{card.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section-shell">
        <SectionHeading
          eyebrow="FAQ"
          title="A few questions people usually have first."
          description="These answers should help someone understand the product quickly."
        />
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {homeContent.faqs.slice(0, 4).map((faq) => (
            <article key={faq.question} className="surface-card">
              <h3 className="text-lg font-bold text-white">{faq.question}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <ConversionRail
        eyebrow="Get started"
        title={homeRail.title}
        description={homeRail.description}
        primaryAction={homeRail.primaryAction}
        secondaryAction={homeRail.secondaryAction}
        signals={homeRail.signals}
      />
    </div>
  );
}
