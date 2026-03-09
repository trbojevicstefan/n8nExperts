import { BriefcaseBusiness, ClipboardCheck, SearchCode, ShieldCheck } from "lucide-react";
import { ConversionRail } from "@/components/marketing/ConversionRail";
import { PageHero } from "@/components/marketing/PageHero";
import { PageHeroShowcase } from "@/components/marketing/PageHeroShowcase";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { forClientsContent, homeContent } from "@/content/site";
import { useAuth } from "@/hooks/useAuth";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function ForClients() {
  const { user } = useAuth();
  const heroActions = user
    ? user.role === "expert"
      ? [
          { label: "Browse Jobs", href: "/jobs" },
          { label: "My Applications", href: "/my-applications", variant: "secondary" as const },
        ]
      : [
          { label: "Find Experts", href: "/find-experts" },
          { label: "Post Project", href: "/post-project", variant: "secondary" as const },
        ]
    : [
        { label: "Find Experts", href: "/find-experts" },
        { label: "Post Project", href: "/post-project", variant: "secondary" as const },
      ];

  usePageMeta({
    title: "For Clients | Hire n8n specialists with more confidence",
    description:
      "See why teams use n8nExperts to compare specialists, publish stronger briefs, invite experts directly, and operate a cleaner hiring pipeline.",
    canonicalPath: "/for-clients",
  });

  return (
    <div className="container page-stack">
      <PageHero
        eyebrow={forClientsContent.hero.eyebrow}
        title={forClientsContent.hero.title}
        description={forClientsContent.hero.description}
        actions={heroActions}
        visual={<PageHeroShowcase variant="client" />}
        metrics={[
          { value: "Richer profiles", label: "Compare more than a headline and rate." },
          { value: "Better briefs", label: "Attract proposals with more context and less ambiguity." },
          { value: "Operational pipeline", label: "Shortlist, note, review, and message from one system." },
        ]}
      />

      <section className="section-shell">
        <SectionHeading
          eyebrow="Why clients use it"
          title="The goal is to make hiring feel clearer."
          description="That matters most when the automation work touches multiple systems and handoffs."
        />
        <div className="section-grid mt-6">
          {forClientsContent.benefits.map((benefit, index) => {
            const Icon = [SearchCode, ClipboardCheck, BriefcaseBusiness][index];
            return (
              <article key={benefit.title} className="surface-card">
                <Icon className="h-6 w-6 text-[var(--color-accent-cool)]" />
                <h3 className="mt-5 text-xl font-bold text-white">{benefit.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">{benefit.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section-shell">
        <SectionHeading
          eyebrow="What to evaluate"
          title="A client should be able to judge fit quickly."
          description="The best decision usually comes from specialization, proof, pricing, and how clearly the expert responds."
        />
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {[
            "Does the profile explain the kind of n8n work this expert actually does well?",
            "Do service and portfolio surfaces show enough evidence to trust their positioning?",
            "Is the pricing context compatible with the size and complexity of the work?",
            "Does the expert respond to the brief as a delivery problem, not just a keyword match?",
          ].map((item) => (
            <article key={item} className="feature-panel">
              <ShieldCheck className="h-5 w-5 text-[var(--color-accent)]" />
              <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <SectionHeading
          eyebrow="Client path"
          title="The hiring path should feel straightforward."
          description="Post the job, review proof, invite or shortlist, then move the conversation into messages."
        />
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {homeContent.workflow.map((step) => (
            <article key={step.title} className="timeline-card">
              <h3 className="text-xl font-bold text-white">{step.title}</h3>
              <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">{step.description}</p>
              {step.outcome && <p className="mt-4 text-sm font-medium text-[var(--color-accent)]">{step.outcome}</p>}
            </article>
          ))}
        </div>
      </section>

      <ConversionRail
        eyebrow="Client next step"
        title="If you are hiring, start where fit becomes visible."
        description="Explore expert profiles first if you want to understand market shape, or post a project if your brief is ready and you want to attract or invite specialists now."
        primaryAction={user?.role === "expert" ? { label: "Browse Jobs", href: "/jobs" } : { label: "Explore Experts", href: "/find-experts" }}
        secondaryAction={
          user
            ? user.role === "expert"
              ? { label: "Open Inbox", href: "/inbox" }
              : { label: "Post Project", href: "/post-project" }
            : { label: "Post Project", href: "/post-project" }
        }
      />
    </div>
  );
}
