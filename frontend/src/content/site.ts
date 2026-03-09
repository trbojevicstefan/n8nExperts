export type LinkAction = {
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "ghost";
};

export type Metric = {
  value: string;
  label: string;
};

export type ContentCard = {
  eyebrow?: string;
  title: string;
  description: string;
};

export type WorkflowStep = {
  title: string;
  description: string;
  outcome?: string;
};

export type ComparisonRow = {
  title: string;
  n8nExperts: string;
  generic: string;
};

export type FAQItem = {
  question: string;
  answer: string;
};

export type NavItem = {
  label: string;
  href: string;
  description: string;
  badge?: "invitations";
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const brandCopy = {
  name: "n8nExperts",
  label: "Automation talent platform",
  summary:
    "A trust-first marketplace for teams hiring n8n specialists and experts building serious automation practices.",
  operator: "Built and operated by n8nlab.io",
};

export const publicNavGroups: NavGroup[] = [
  {
    title: "Platform",
    items: [
      {
        label: "How It Works",
        href: "/how-it-works",
        description: "See the hiring and delivery flow from first brief to active work.",
      },
      {
        label: "Trust",
        href: "/trust",
        description: "Learn how the platform sets quality standards and credibility signals.",
      },
    ],
  },
  {
    title: "Audience",
    items: [
      {
        label: "For Clients",
        href: "/for-clients",
        description: "Why automation teams hire through n8nExperts.",
      },
      {
        label: "For Experts",
        href: "/for-experts",
        description: "Why experienced builders join and publish proof here.",
      },
    ],
  },
  {
    title: "Explore",
    items: [
      {
        label: "Find Experts",
        href: "/find-experts",
        description: "Browse public expert profiles, portfolios, and services.",
      },
      {
        label: "Find Jobs",
        href: "/jobs",
        description: "Review open automation briefs and application-ready roles.",
      },
    ],
  },
];

export const clientNavGroups: NavGroup[] = [
  {
    title: "Main",
    items: [
      { label: "Post a Job", href: "/post-project", description: "Create a job and start getting applications." },
      { label: "My Jobs", href: "/my-jobs", description: "See your jobs, applicants, and hiring progress." },
      { label: "Messages", href: "/inbox", description: "Reply to experts and keep hiring moving." },
      { label: "Profile", href: "/client/profile", description: "Update your company details and hiring profile." },
    ],
  },
  {
    title: "Browse",
    items: [
      { label: "Find Experts", href: "/find-experts", description: "Browse specialists by skills, proof, and rate." },
      { label: "Saved Experts", href: "/saved-experts", description: "Come back to experts you may want to hire." },
    ],
  },
  {
    title: "More",
    items: [
      { label: "All Applicants", href: "/my-jobs/pipeline", description: "Review applications from all jobs in one place." },
      { label: "Saved Searches", href: "/saved-searches", description: "Keep search views you want to reuse later." },
    ],
  },
];

export const expertNavGroups: NavGroup[] = [
  {
    title: "Main",
    items: [
      { label: "Find Work", href: "/jobs", description: "Browse open jobs and apply to the right ones." },
      { label: "My Applications", href: "/my-applications", description: "See where each application stands." },
      { label: "Messages", href: "/inbox", description: "Reply to clients and continue active conversations." },
      { label: "My Profile", href: "/expert/setup", description: "Update the profile clients see before they contact you." },
    ],
  },
  {
    title: "More",
    items: [
      { label: "Invitations", href: "/invitations", description: "Review direct invites from clients.", badge: "invitations" },
      { label: "Services", href: "/expert/services", description: "Create offers clients can understand quickly." },
      { label: "Saved Jobs", href: "/saved-jobs", description: "Come back to jobs you may want to apply to." },
      { label: "Saved Searches", href: "/saved-searches", description: "Keep job searches you want to reuse later." },
    ],
  },
];

export const mobilePublicNav = [
  { label: "Home", href: "/" },
  { label: "How", href: "/how-it-works" },
  { label: "Experts", href: "/find-experts" },
  { label: "Jobs", href: "/jobs" },
];

export const mobileClientNav = [
  { label: "Post", href: "/post-project" },
  { label: "Jobs", href: "/my-jobs" },
  { label: "Messages", href: "/inbox" },
  { label: "Profile", href: "/client/profile" },
];

export const mobileExpertNav = [
  { label: "Work", href: "/jobs" },
  { label: "My Apps", href: "/my-applications" },
  { label: "Messages", href: "/inbox" },
  { label: "Profile", href: "/expert/setup" },
];

export const footerGroups = [
  {
    title: "Learn",
    items: [
      { label: "How It Works", href: "/how-it-works" },
      { label: "Trust", href: "/trust" },
      { label: "For Clients", href: "/for-clients" },
      { label: "For Experts", href: "/for-experts" },
    ],
  },
  {
    title: "Explore",
    items: [
      { label: "Find Experts", href: "/find-experts" },
      { label: "Find Jobs", href: "/jobs" },
      { label: "Post Project", href: "/post-project" },
      { label: "Role Selection", href: "/auth/role-select" },
    ],
  },
  {
    title: "Workspace",
    items: [
      { label: "Log In", href: "/auth/login" },
      { label: "Create Account", href: "/auth/role-select" },
      { label: "Saved Searches", href: "/saved-searches" },
      { label: "Inbox", href: "/inbox" },
    ],
  },
];

export const homeContent = {
  hero: {
    eyebrow: "Automation talent platform",
    title: "A clearer way to hire, trust, and scale n8n delivery.",
    description:
      "n8nExperts helps clients understand who can deliver, how hiring works, and what strong automation execution should look like before a project even starts.",
    actions: [
      { label: "Find Experts", href: "/find-experts", variant: "primary" as const },
      { label: "How It Works", href: "/how-it-works", variant: "secondary" as const },
    ],
    metrics: [
      { value: "Profiles + Proof", label: "Public portfolios, services, and trust signals" },
      { value: "Structured Hiring", label: "Clear briefs, invitations, and application flow" },
      { value: "Workspace Ready", label: "Inbox, pipeline, and profile systems already live" },
    ],
  },
  platformCards: [
    {
      eyebrow: "For hiring teams",
      title: "Understand fit before outreach",
      description: "See specialist profiles, portfolio evidence, services, and client-facing trust signals in one place.",
    },
    {
      eyebrow: "For experts",
      title: "Show credibility beyond a short bio",
      description: "Package your expertise with practical proof so clients can understand how you work, not just what you claim.",
    },
    {
      eyebrow: "For both sides",
      title: "Move through a clearer workflow",
      description: "From job brief to shortlist to active conversation, the product keeps decisions visible and action-oriented.",
    },
  ] satisfies ContentCard[],
  audiences: [
    {
      title: "Clients hiring automation talent",
      description:
        "Use n8nExperts when you want to compare specialists, post clearer briefs, invite directly, and manage applicants with less marketplace noise.",
    },
    {
      title: "Experts building serious n8n practices",
      description:
        "Use n8nExperts when you need a profile that can explain your work quality, preferred project shape, and delivery credibility in a buyer-friendly way.",
    },
  ] satisfies ContentCard[],
  workflow: [
    {
      title: "1. Define the project clearly",
      description: "Clients publish outcomes, connected systems, constraints, budget model, and what success should look like.",
      outcome: "Better briefs attract better proposals.",
    },
    {
      title: "2. Compare fit using real signals",
      description: "Clients review profile depth, portfolio outcomes, services, rates, and platform trust indicators before reaching out.",
      outcome: "Selection quality improves before the first message.",
    },
    {
      title: "3. Invite or apply with context",
      description: "Experts apply to open jobs and can also respond to direct invitations with delivery framing and estimated timelines.",
      outcome: "Both sides start with better context, not cold guesswork.",
    },
    {
      title: "4. Manage decisions and delivery",
      description: "Jobs, applications, notes, saved views, and inbox conversations stay organized across the active workflow.",
      outcome: "Hiring stays operational instead of fragmented.",
    },
  ] satisfies WorkflowStep[],
  comparison: [
    {
      title: "Automation-specific context",
      n8nExperts: "Profiles and briefs are shaped around real n8n delivery, integrations, services, and workflow proof.",
      generic: "General freelance marketplaces flatten specialist context into generic skills and bios.",
    },
    {
      title: "Clarity before conversation",
      n8nExperts: "Clients see stronger structure around rates, expertise, portfolios, and project expectations.",
      generic: "The first message often has to compensate for weak listing structure and unclear proof.",
    },
    {
      title: "Hiring operations",
      n8nExperts: "Applications, notes, invitations, and pipeline views support practical decision-making.",
      generic: "Operational visibility is usually thinner or spread across multiple surfaces.",
    },
  ] satisfies ComparisonRow[],
  proofCards: [
    {
      title: "Expert proof, not just claims",
      description: "Profiles can show services, portfolio entries, pricing, skills, industries, and availability signals that make evaluation faster.",
    },
    {
      title: "Better project briefs",
      description: "Client workflows encourage clearer scope, systems, and success criteria so experts can respond with more confidence.",
    },
    {
      title: "Operator credibility",
      description: "The platform is operated by n8nlab.io and positioned around execution quality, not random marketplace volume.",
    },
    {
      title: "Trust-building product surfaces",
      description: "Client public profiles, saved searches, invitation flows, and applicant notes support better judgment over time.",
    },
  ] satisfies ContentCard[],
  useCases: [
    { title: "Lead routing and qualification", description: "Sync forms, CRM, Slack, and enrichment tools with clearer ownership rules." },
    { title: "Support and ticket automation", description: "Route incidents, triage support tasks, and keep escalation flows consistent." },
    { title: "Internal operations workflows", description: "Automate approvals, finance handoffs, notifications, and reporting pipelines." },
    { title: "AI-assisted process automation", description: "Layer AI steps into structured workflows without losing delivery clarity." },
  ] satisfies ContentCard[],
  walkthrough: [
    {
      title: "Public discovery surfaces",
      description: "Visitors can already browse experts, review jobs, and understand how the two-sided model works.",
    },
    {
      title: "Role-based workspaces",
      description: "Clients and experts move into role-specific routes for posting, applying, inviting, saving, and messaging.",
    },
    {
      title: "Decision-ready workflow views",
      description: "Application stages, job states, inbox routes, and saved views turn the marketplace into an operating system for hiring.",
    },
  ] satisfies ContentCard[],
  faqs: [
    {
      question: "What exactly does n8nExperts help with today?",
      answer:
        "It supports expert discovery, job posting, invitations, applications, saved views, client/expert profiles, and inbox-driven project conversations around n8n work.",
    },
    {
      question: "Is this only for clients?",
      answer:
        "No. The platform is intentionally two-sided. Clients get a clearer way to hire, and experts get better surfaces to explain and package their work.",
    },
    {
      question: "Does the platform try to be everything at once?",
      answer:
        "No. The current focus is quality of matching, clarity of proof, and better operational flow around hiring and delivery handoff.",
    },
    {
      question: "Why invest this much in explanation and trust?",
      answer:
        "Because automation buyers often need help understanding what good delivery looks like before they can confidently choose an expert.",
    },
  ] satisfies FAQItem[],
};

export const howItWorksContent = {
  hero: {
    eyebrow: "How n8nExperts works",
    title: "The marketplace is designed to make judgment easier before work begins.",
    description:
      "Every major surface aims to reduce ambiguity: who is qualified, what the project needs, how people connect, and where decisions happen next.",
  },
  decisionPoints: [
    {
      title: "Clients decide who to trust",
      description: "Public profiles, services, portfolio work, and trust cues are designed to help clients qualify fit earlier.",
    },
    {
      title: "Experts decide which work is worth pursuing",
      description: "Job discovery, saved searches, and invitation flows help experts focus on serious opportunities.",
    },
    {
      title: "Both sides move into clear next actions",
      description: "Applications, invites, notes, status changes, and inbox routes keep momentum visible.",
    },
  ] satisfies ContentCard[],
};

export const forClientsContent = {
  hero: {
    eyebrow: "For clients",
    title: "Hire n8n specialists through a platform built for clarity, not marketplace noise.",
    description:
      "n8nExperts helps teams compare real fit, publish stronger briefs, and operate a cleaner hiring pipeline for automation work.",
  },
  benefits: [
    {
      title: "Evaluate experts with more context",
      description: "Profiles can show pricing, services, portfolio work, industries, and client-facing proof instead of a short bio and generic promises.",
    },
    {
      title: "Create better briefs",
      description: "Posting flows encourage you to define outcomes, integrations, and budget model so proposals are more accurate.",
    },
    {
      title: "Run a real decision pipeline",
      description: "Applications, saved views, notes, statuses, and inbox threads keep hiring operational after the first response arrives.",
    },
  ] satisfies ContentCard[],
};

export const forExpertsContent = {
  hero: {
    eyebrow: "For experts",
    title: "Present your n8n practice in a way serious clients can actually understand.",
    description:
      "The platform gives experts room to package portfolio proof, services, availability, and preferred work shape so they are easier to trust and shortlist.",
  },
  benefits: [
    {
      title: "Show stronger proof",
      description: "Profile and setup flows support richer details around expertise, services, portfolio work, and practical delivery positioning.",
    },
    {
      title: "Choose better opportunities",
      description: "Open jobs, saved views, and invitation workflows help you focus on briefs that are worth a considered proposal.",
    },
    {
      title: "Track work stages clearly",
      description: "Applications, invitations, inbox, and accepted-work views make it easier to see what needs action next.",
    },
  ] satisfies ContentCard[],
};

export const trustContent = {
  hero: {
    eyebrow: "Trust and standards",
    title: "n8nExperts is being shaped around credibility, signal quality, and cleaner operational judgment.",
    description:
      "Trust comes from better product structure: richer expert proof, clearer client context, stronger workflow guidance, and visible operating standards.",
  },
  standards: [
    {
      title: "Expert credibility standards",
      description: "Profiles should communicate depth, service fit, portfolio relevance, and rate context clearly enough for clients to evaluate them seriously.",
    },
    {
      title: "Client brief quality standards",
      description: "Projects should explain systems, outcomes, and budget expectations well enough for experts to respond intelligently.",
    },
    {
      title: "Operational visibility standards",
      description: "Applications, saved views, statuses, and conversation surfaces should help both sides know what is happening now and what comes next.",
    },
    {
      title: "Platform stewardship",
      description: "n8nlab.io operates the platform with a practical focus on useful workflows rather than bloated marketplace features.",
    },
  ] satisfies ContentCard[],
};
