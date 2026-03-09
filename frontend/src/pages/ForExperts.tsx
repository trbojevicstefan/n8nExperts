import { Briefcase, Sparkles, UserRoundCheck, Workflow } from "lucide-react";
import { ConversionRail } from "@/components/marketing/ConversionRail";
import { PageHero } from "@/components/marketing/PageHero";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { forExpertsContent } from "@/content/site";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function ForExperts() {
  usePageMeta({
    title: "For Experts | Showcase and win serious n8n work",
    description:
      "Learn why experts use n8nExperts to present stronger proof, respond to better-scoped work, and track applications and invitations more clearly.",
    canonicalPath: "/for-experts",
  });

  return (
    <div className="container space-y-8 py-8 md:space-y-10">
      <PageHero
        eyebrow={forExpertsContent.hero.eyebrow}
        title={forExpertsContent.hero.title}
        description={forExpertsContent.hero.description}
        actions={[
          { label: "Choose Expert Role", href: "/auth/register?role=expert" },
          { label: "Browse Jobs", href: "/jobs", variant: "secondary" },
        ]}
        metrics={[
          { value: "Profile depth", label: "Explain positioning, services, portfolio relevance, and availability." },
          { value: "Better opportunities", label: "Focus on real briefs and direct invitations instead of pure volume." },
          { value: "Visible progress", label: "Track proposal stages, accepted work, and inbox activity." },
        ]}
      />

      <section className="section-shell">
        <SectionHeading
          eyebrow="Why experts join"
          title="This is for experts who want their work to make sense at a glance."
          description="The value is not only finding jobs. It is helping clients understand how you work and why they should trust you."
        />
        <div className="section-grid mt-8">
          {forExpertsContent.benefits.map((benefit, index) => {
            const Icon = [UserRoundCheck, Briefcase, Workflow][index];
            return (
              <article key={benefit.title} className="surface-card">
                <Icon className="h-6 w-6 text-[var(--color-accent)]" />
                <h3 className="mt-5 text-xl font-bold text-white">{benefit.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">{benefit.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section-shell">
        <SectionHeading
          eyebrow="What strong experts should show"
          title="A good profile does more than list tools."
          description="It tells a client what you do best, what proof you have, and how to hire you."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {[
            "Headline and bio that explain the kind of automation outcomes you are best at.",
            "Portfolio entries that show problem, systems involved, and practical delivery context.",
            "Services that make common entry points or scoped offers easier for clients to understand.",
            "Availability, pricing, and engagement preferences that reduce avoidable back-and-forth.",
          ].map((item) => (
            <article key={item} className="feature-panel">
              <Sparkles className="h-5 w-5 text-[var(--color-accent-cool)]" />
              <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <SectionHeading
          eyebrow="Expert path"
          title="Experts can both find work and be found."
          description="Browse jobs directly, or get invited through your profile and services."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {[
            {
              title: "Discover",
              body: "Use job discovery, saved jobs, and saved searches to focus on briefs with enough substance to merit a proposal.",
            },
            {
              title: "Respond",
              body: "Apply with context or accept invitations with a stronger explanation of your approach and timing.",
            },
            {
              title: "Operate",
              body: "Track what changed, what was accepted, and where active conversation should continue next.",
            },
          ].map((item) => (
            <article key={item.title} className="timeline-card">
              <h3 className="text-xl font-bold text-white">{item.title}</h3>
              <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <ConversionRail
        eyebrow="Expert next step"
        title="Start by publishing the kind of proof serious buyers can understand."
        description="Choose the expert role to create your account, then complete profile and service surfaces so clients can evaluate fit earlier and more confidently."
        primaryAction={{ label: "Create Expert Account", href: "/auth/register?role=expert" }}
        secondaryAction={{ label: "Browse Jobs", href: "/jobs" }}
      />
    </div>
  );
}
