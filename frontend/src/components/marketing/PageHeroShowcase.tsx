import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  BriefcaseBusiness,
  ClipboardCheck,
  MessagesSquare,
  SearchCode,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  Workflow,
} from "lucide-react";

type ShowcaseVariant = "workflow" | "client" | "expert";

type ShowcaseCard = {
  title: string;
  body: string;
  icon: LucideIcon;
};

const showcaseContent: Record<
  ShowcaseVariant,
  {
    eyebrow: string;
    title: string;
    chips: string[];
    steps: string[];
    cards: ShowcaseCard[];
  }
> = {
  workflow: {
    eyebrow: "Flow visibility",
    title: "Short path, clearer handoff",
    chips: ["Clear brief", "Proof visible", "Messages ready"],
    steps: ["Brief", "Review", "Invite", "Deliver"],
    cards: [
      { title: "Client brief", body: "Outcome, systems, budget, and delivery context are visible up front.", icon: BriefcaseBusiness },
      { title: "Fit review", body: "Profiles, services, and proof make the comparison step faster.", icon: ShieldCheck },
      { title: "Decision route", body: "Invitations, applications, and inbox routes create the next action.", icon: Workflow },
    ],
  },
  client: {
    eyebrow: "Client view",
    title: "Find, compare, shortlist",
    chips: ["Specialist search", "Better briefs", "Pipeline clarity"],
    steps: ["Search", "Compare", "Invite", "Hire"],
    cards: [
      { title: "Search intent", body: "Find experts by relevance, not just a headline and hourly rate.", icon: SearchCode },
      { title: "Shortlist proof", body: "Services, portfolio work, and profile details support faster judgment.", icon: ClipboardCheck },
      { title: "Inbox handoff", body: "Once fit is clear, messages and job routes keep momentum visible.", icon: MessagesSquare },
    ],
  },
  expert: {
    eyebrow: "Expert view",
    title: "Publish stronger signal",
    chips: ["Profile depth", "Better opportunities", "Visible progress"],
    steps: ["Publish", "Discover", "Respond", "Track"],
    cards: [
      { title: "Profile signal", body: "Explain your positioning, service shape, and delivery strengths clearly.", icon: UserRoundCheck },
      { title: "Service offers", body: "Turn common entry points into offers clients can actually understand.", icon: Sparkles },
      { title: "Application flow", body: "Jobs, invitations, and accepted work stay connected to one timeline.", icon: BadgeCheck },
    ],
  },
};

export function PageHeroShowcase({ variant }: { variant: ShowcaseVariant }) {
  const showcase = showcaseContent[variant];

  return (
    <div className={`hero-showcase hero-showcase-${variant}`}>
      <div className="hero-showcase-orb hero-showcase-orb-a" />
      <div className="hero-showcase-orb hero-showcase-orb-b" />

      <div className="hero-showcase-header">
        <p className="hero-showcase-eyebrow">{showcase.eyebrow}</p>
        <h3 className="hero-showcase-title">{showcase.title}</h3>
      </div>

      <div className="hero-showcase-chip-row">
        {showcase.chips.map((chip, index) => (
          <div key={chip} className={`hero-showcase-chip hero-showcase-chip-${index + 1}`}>
            <span className="hero-showcase-chip-dot" />
            <span>{chip}</span>
          </div>
        ))}
      </div>

      <div className="hero-showcase-grid">
        {showcase.cards.map((card, index) => {
          const Icon = card.icon;

          return (
            <article key={card.title} className={`hero-showcase-card hero-showcase-card-${index + 1}`}>
              <div className="hero-showcase-card-icon">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="hero-showcase-card-title">{card.title}</p>
                <p className="hero-showcase-card-body">{card.body}</p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="hero-showcase-rail">
        {showcase.steps.map((step) => (
          <div key={step} className="hero-showcase-step">
            <span className="hero-showcase-step-dot" />
            <span>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
