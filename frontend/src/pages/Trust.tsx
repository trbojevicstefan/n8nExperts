import { Building2, ClipboardCheck, ShieldCheck, Workflow } from "lucide-react";
import { ConversionRail } from "@/components/marketing/ConversionRail";
import { PageHero } from "@/components/marketing/PageHero";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { trustContent } from "@/content/site";
import { useAuth } from "@/hooks/useAuth";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function Trust() {
  const { user } = useAuth();
  const heroActions = user
    ? user.role === "expert"
      ? [
          { label: "Browse Jobs", href: "/jobs" },
          { label: "Open Profile", href: "/expert/setup", variant: "secondary" as const },
        ]
      : [
          { label: "Explore Experts", href: "/find-experts" },
          { label: "Open My Jobs", href: "/my-jobs", variant: "secondary" as const },
        ]
    : [
        { label: "Explore Experts", href: "/find-experts" },
        { label: "How It Works", href: "/how-it-works", variant: "secondary" as const },
      ];

  usePageMeta({
    title: "Trust | Quality signals and operating standards on n8nExperts",
    description:
      "Learn how n8nExperts approaches trust: richer proof, better briefs, clearer workflow guidance, and platform stewardship by n8nlab.io.",
    canonicalPath: "/trust",
  });

  return (
    <div className="container page-stack">
      <PageHero
        eyebrow={trustContent.hero.eyebrow}
        title={trustContent.hero.title}
        description={trustContent.hero.description}
        actions={heroActions}
        metrics={[
          { value: "Proof surfaces", label: "Profiles, services, and portfolios support stronger evaluation." },
          { value: "Better operating context", label: "Client profiles, notes, statuses, and inbox routes reduce ambiguity." },
          { value: "Platform stewardship", label: "n8nlab.io is explicit about the product being built for execution quality." },
        ]}
      />

      <section className="section-shell">
        <SectionHeading
          eyebrow="Standards"
          title="Trust is not a badge. It is the result of better product structure."
          description="The platform should help visitors understand why a claim is credible and why a project or expert looks worth engaging."
        />
        <div className="section-grid mt-6">
          {trustContent.standards.map((standard, index) => {
            const Icon = [ShieldCheck, ClipboardCheck, Workflow, Building2][index];
            return (
              <article key={standard.title} className="surface-card">
                <Icon className="h-6 w-6 text-[var(--color-accent)]" />
                <h3 className="mt-5 text-xl font-bold text-white">{standard.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">{standard.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section-shell">
        <SectionHeading
          eyebrow="What users should be able to trust"
          title="The site should make the quality model understandable."
          description="That means stronger explanation across the public site and clearer guidance across active app routes."
        />
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {[
            "Clients should understand why a profile looks credible or incomplete.",
            "Experts should understand what makes a brief serious and why that matters for proposal quality.",
            "Both sides should know which route or workflow state represents the correct next step.",
            "The product should communicate its current scope honestly without sounding unfinished or vague.",
          ].map((item) => (
            <article key={item} className="feature-panel">
              <p className="text-sm leading-7 text-[var(--color-text-secondary)]">{item}</p>
            </article>
          ))}
        </div>
      </section>

      <ConversionRail
        eyebrow="Trust in practice"
        title="The best trust signal is a product that explains itself clearly."
        description="If the standards resonate, explore the live platform routes and see how the trust model carries through public discovery, role setup, search, applications, and pipeline management."
        primaryAction={user?.role === "expert" ? { label: "Browse Jobs", href: "/jobs" } : { label: "See Experts", href: "/find-experts" }}
        secondaryAction={
          user
            ? user.role === "expert"
              ? { label: "Open Inbox", href: "/inbox" }
              : { label: "Open My Jobs", href: "/my-jobs" }
            : { label: "Create Account", href: "/auth/role-select" }
        }
      />
    </div>
  );
}
