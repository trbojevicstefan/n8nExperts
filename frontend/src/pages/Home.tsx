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
import { Link } from "react-router-dom";
import { ConversionRail } from "@/components/marketing/ConversionRail";
import { HeroWorkflowScene } from "@/components/marketing/HeroWorkflowScene";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { homeContent } from "@/content/site";
import { useAuth } from "@/hooks/useAuth";
import { usePageMeta } from "@/hooks/usePageMeta";

const heroInsightCards = [
  {
    eyebrow: "Trust signals",
    title: "See fit before the first message",
    description: "Profiles, services, and portfolio proof are designed to reduce guesswork before outreach starts.",
    icon: ShieldCheck,
    accent: "text-[var(--color-accent)]",
  },
  {
    eyebrow: "Workflow visibility",
    title: "Move from brief to shortlist faster",
    description: "Applications, invitations, and job states keep both sides oriented around the next clear action.",
    icon: Workflow,
    accent: "text-[var(--color-accent-cool)]",
  },
  {
    eyebrow: "Conversation handoff",
    title: "Keep context when the work gets serious",
    description: "Messages, notes, and accepted work stay tied to the same hiring flow instead of scattering across tabs.",
    icon: MessagesSquare,
    accent: "text-[var(--color-success)]",
  },
  {
    eyebrow: "Live surfaces",
    title: "One product, not disconnected pages",
    description: "Experts, jobs, applications, messages, and notes all stay in the same operating context once you sign in.",
    icon: BellDot,
    accent: "text-[var(--color-accent-soft)]",
  },
];

export default function Home() {
  const { user } = useAuth();
  const heroActions = user
    ? user.role === "expert"
      ? [
          { label: "Find Work", href: "/jobs", variant: "primary" as const },
          { label: "My Applications", href: "/my-applications", variant: "secondary" as const },
        ]
      : [
          { label: "Find Experts", href: "/find-experts", variant: "primary" as const },
          { label: "Post a Job", href: "/post-project", variant: "secondary" as const },
        ]
    : homeContent.hero.actions;
  const homeRail = user
    ? user.role === "expert"
      ? {
          title: "Use the home page as your jump point into live work.",
          description:
            "Browse jobs, reply to invitations, update your profile proof, and keep conversations moving without losing the broader platform context.",
          primaryAction: { label: "Find Work", href: "/jobs" },
          secondaryAction: { label: "Open Profile", href: "/expert/setup" },
          signals: [
            "One home route for guests and members",
            "Invitations and applications close at hand",
            "Profile proof stays central",
            "Messages stay tied to live work",
          ],
        }
      : {
          title: "Use the home page as your control surface for hiring.",
          description:
            "Jump from the market narrative into live hiring actions like browsing experts, posting jobs, and reviewing applicants without switching context.",
          primaryAction: { label: "Find Experts", href: "/find-experts" },
          secondaryAction: { label: "Open My Jobs", href: "/my-jobs" },
          signals: [
            "One home route for guests and members",
            "Expert discovery and hiring flow connected",
            "Shortlist and pipeline routes stay nearby",
            "Trust narrative remains visible",
          ],
        }
    : {
        title: "Take the platform seriously because it is being built to explain serious automation work.",
        description:
          "If you are hiring, start by exploring experts and project flow. If you are an expert, start by choosing your role and publishing stronger proof.",
        primaryAction: { label: "Find Experts", href: "/find-experts" },
        secondaryAction: { label: "Create Account", href: "/auth/role-select" },
        signals: ["Balanced client and expert narrative", "Trust-first positioning", "Live workflow pages already active", "Built by n8nlab.io"],
      };

  usePageMeta({
    title: "n8nExperts | Hire n8n experts with clearer trust and workflow context",
    description:
      "n8nExperts is a trust-first marketplace for teams hiring n8n specialists and experts presenting stronger delivery proof.",
    canonicalPath: "/",
  });

  return (
    <div className="container page-stack">
      <section className="home-hero-shell">
        <div className="hero-glow hero-glow-left" />
        <div className="hero-glow hero-glow-right" />

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

          <div className="home-hero-visual">
            <HeroWorkflowScene />
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
          description="Post or find a job, compare fit, then move the conversation forward with less back-and-forth."
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
          title="The platform is built for clarity, not volume."
          description="It gives both sides better signals before they commit time to a conversation."
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
          eyebrow="Trust and proof"
          title="People should understand why a profile or brief is worth taking seriously."
          description="That is why services, portfolio items, job details, and messaging flow are part of the same product."
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
