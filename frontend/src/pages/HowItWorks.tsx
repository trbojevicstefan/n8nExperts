import { CheckCircle2, Compass, MessagesSquare, ShieldCheck, Workflow } from "lucide-react";
import { ConversionRail } from "@/components/marketing/ConversionRail";
import { PageHero } from "@/components/marketing/PageHero";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { homeContent, howItWorksContent } from "@/content/site";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function HowItWorks() {
  usePageMeta({
    title: "How n8nExperts Works | Clearer hiring and delivery workflow",
    description:
      "Understand how n8nExperts helps clients and experts move from clearer briefs to better evaluation, invitations, applications, and active work.",
    canonicalPath: "/how-it-works",
  });

  return (
    <div className="container space-y-8 py-8 md:space-y-10">
      <PageHero
        eyebrow={howItWorksContent.hero.eyebrow}
        title={howItWorksContent.hero.title}
        description={howItWorksContent.hero.description}
        actions={[
          { label: "Find Experts", href: "/find-experts" },
          { label: "Find Jobs", href: "/jobs", variant: "secondary" },
        ]}
      />

      <section className="section-shell">
        <SectionHeading
          eyebrow="Core idea"
          title="The product is built around a few simple questions."
          description="Who fits, why trust them, what should happen next, and where does that next step live?"
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          {[
            { icon: Compass, title: "Who fits?", body: "Public profiles and filters support earlier fit evaluation." },
            { icon: ShieldCheck, title: "Why trust them?", body: "Portfolios, services, and profile detail make proof more visible." },
            { icon: MessagesSquare, title: "What happens next?", body: "Invites, applications, and inbox routes create an obvious next move." },
            { icon: Workflow, title: "How is it managed?", body: "Job, pipeline, and saved-view surfaces keep the process operational." },
          ].map((item) => (
            <article key={item.title} className="surface-card">
              <item.icon className="h-6 w-6 text-[var(--color-accent-cool)]" />
              <h3 className="mt-5 text-lg font-bold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <SectionHeading
          eyebrow="End-to-end flow"
          title="The path is short."
          description="Understand the work, compare fit, then move into applications, invitations, and messages."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {homeContent.workflow.map((step, index) => (
            <article key={step.title} className="timeline-card">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">Step {index + 1}</p>
              <h3 className="mt-3 text-2xl font-bold text-white">{step.title}</h3>
              <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">{step.description}</p>
              {step.outcome && (
                <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-white">
                  <CheckCircle2 className="h-4 w-4 text-[var(--color-accent)]" />
                  <span>{step.outcome}</span>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <SectionHeading
          eyebrow="Why it helps"
          title="Each side gets a clearer decision moment."
          description="The point is not only listing and messaging. It is helping people decide faster and with less confusion."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {howItWorksContent.decisionPoints.slice(0, 3).map((card) => (
            <article key={card.title} className="feature-panel">
              <h3 className="text-xl font-bold text-white">{card.title}</h3>
              <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">{card.description}</p>
            </article>
          ))}
        </div>
      </section>

      <ConversionRail
        eyebrow="Next step"
        title="Move from explanation into action."
        description="If the workflow makes sense, the fastest next move is to explore active profiles or start with a role-specific account."
        primaryAction={{ label: "Explore Experts", href: "/find-experts" }}
        secondaryAction={{ label: "Choose a Role", href: "/auth/role-select" }}
      />
    </div>
  );
}
