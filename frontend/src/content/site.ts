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
    "A marketplace for teams hiring n8n experts and experts looking for serious automation work.",
  operator: "Built and operated by n8nlab.io",
};

export const publicNavGroups: NavGroup[] = [
  {
    title: "Explore",
    items: [
      {
        label: "How It Works",
        href: "/how-it-works",
        description: "See how clients hire and experts get hired.",
      },
      {
        label: "For Clients",
        href: "/for-clients",
        description: "See how hiring teams use the marketplace.",
      },
      {
        label: "For Experts",
        href: "/for-experts",
        description: "See how experts show proof and win work.",
      },
      {
        label: "Browse Experts",
        href: "/find-experts",
        description: "Compare public expert profiles, services, and proof.",
      },
      {
        label: "Find Jobs",
        href: "/jobs",
        description: "Browse open automation briefs and job opportunities.",
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
  { label: "Home", href: "/" },
  { label: "Jobs", href: "/my-jobs" },
  { label: "Messages", href: "/inbox" },
  { label: "Profile", href: "/client/profile" },
];

export const mobileExpertNav = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/jobs" },
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
      { label: "Browse Experts", href: "/find-experts" },
      { label: "Find Jobs", href: "/jobs" },
      { label: "Home", href: "/" },
      { label: "How It Works", href: "/how-it-works" },
    ],
  },
  {
    title: "Start",
    items: [
      { label: "Log In", href: "/auth/login" },
      { label: "Create Account", href: "/auth/role-select" },
      { label: "For Clients", href: "/for-clients" },
      { label: "For Experts", href: "/for-experts" },
    ],
  },
];

export const homeContent = {
  hero: {
    eyebrow: "Automation talent platform",
    title: "Hire n8n experts with less guessing.",
    description:
      "Browse real specialists, compare proof, and post projects that get better applications. Experts can show services, work samples, and availability in one place.",
    actions: [
      { label: "Browse Experts", href: "/find-experts", variant: "primary" as const },
      { label: "Find Jobs", href: "/jobs", variant: "secondary" as const },
    ],
    metrics: [
      { value: "Proof that matters", label: "Profiles, services, and work samples clients can scan fast." },
      { value: "Better job briefs", label: "Clearer project context leads to better applications." },
      { value: "Hiring in one place", label: "Inbox, pipeline, and profile tools stay tied to the same work." },
    ],
  },
  platformCards: [
    {
      eyebrow: "For hiring teams",
      title: "See fit before you reach out",
      description: "Compare proof, services, rates, and availability before you waste time on the wrong shortlist.",
    },
    {
      eyebrow: "For experts",
      title: "Show what you actually build",
      description: "Turn your work into a profile clients can understand at a glance instead of hiding it in a short bio.",
    },
    {
      eyebrow: "For both sides",
      title: "Move faster once there is a fit",
      description: "From job post to shortlist to messages, the next step stays obvious instead of scattered across tabs.",
    },
  ] satisfies ContentCard[],
  audiences: [
    {
      title: "Clients hiring automation talent",
      description:
        "Use n8nExperts to browse specialists, post better briefs, invite directly, and compare applicants without generic marketplace noise.",
    },
    {
      title: "Experts building serious n8n practices",
      description:
        "Use n8nExperts to show proof, publish services, and apply to jobs that already look worth your time.",
    },
  ] satisfies ContentCard[],
  workflow: [
    {
      title: "1. Define the project clearly",
      description: "Clients describe the outcome, tools involved, budget, and the details experts need to write a serious proposal.",
      outcome: "A clearer brief attracts better applications.",
    },
    {
      title: "2. Compare fit using real signals",
      description: "Clients review proof, services, rates, and profile detail before they send a message or invitation.",
      outcome: "You spend less time guessing who is a fit.",
    },
    {
      title: "3. Invite or apply with context",
      description: "Experts can apply to open jobs or respond to invitations with a delivery plan, timing, and relevant examples.",
      outcome: "Both sides start with context instead of cold outreach.",
    },
    {
      title: "4. Manage decisions and delivery",
      description: "Jobs, applications, notes, saved views, and messages stay connected once the hiring process is live.",
      outcome: "Hiring stays organized after the first reply arrives.",
    },
  ] satisfies WorkflowStep[],
  comparison: [
    {
      title: "Automation-specific context",
      n8nExperts: "Profiles and briefs are shaped around real n8n work, integrations, delivery proof, and scoped services.",
      generic: "General freelance marketplaces flatten specialist work into generic tags and short bios.",
    },
    {
      title: "Faster fit checks",
      n8nExperts: "Clients can compare rates, proof, availability, and response quality before they start a conversation.",
      generic: "The first message often has to uncover basic fit that should already be visible.",
    },
    {
      title: "Hiring workflow",
      n8nExperts: "Applications, notes, invitations, and inbox routes stay tied to the same job flow.",
      generic: "Hiring work often ends up split across disconnected pages and tools.",
    },
  ] satisfies ComparisonRow[],
  proofCards: [
    {
      title: "Proof before promises",
      description: "Profiles show services, work samples, pricing, skills, and availability so clients can judge substance quickly.",
    },
    {
      title: "Better project briefs",
      description: "Client flows push for clearer scope, systems, and success criteria so experts can write stronger responses.",
    },
    {
      title: "Built around real execution",
      description: "The platform is run by n8nlab.io and aimed at serious automation work, not random volume.",
    },
    {
      title: "Useful hiring surfaces",
      description: "Client profiles, saved searches, invitations, and applicant notes help decisions stay organized as hiring moves forward.",
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
        "It supports expert discovery, job posting, invitations, applications, saved views, public profiles, and job-linked inbox conversations around n8n work.",
    },
    {
      question: "Is this only for clients?",
      answer:
        "No. The platform is intentionally two-sided. Clients get a clearer way to hire, and experts get better surfaces to explain and package their work.",
    },
    {
      question: "Does the platform try to be everything at once?",
      answer:
        "No. The focus is better matching, clearer proof, and a cleaner workflow around hiring and project handoff.",
    },
    {
      question: "Why spend so much time on proof and structure?",
      answer:
        "Because automation buyers need to understand what good delivery looks like before they can confidently choose an expert.",
    },
  ] satisfies FAQItem[],
};

export const howItWorksContent = {
  hero: {
    eyebrow: "How n8nExperts works",
    title: "A simpler path from brief to shortlist to real work.",
    description:
      "The product helps clients write clearer briefs, compare proof faster, and move serious conversations into the right workflow.",
  },
  decisionPoints: [
    {
      title: "Clients compare fit faster",
      description: "Profiles, services, and work samples help clients decide who looks worth contacting.",
    },
    {
      title: "Experts spot better briefs",
      description: "Job discovery, saved searches, and invitations help experts focus on work that looks real and specific.",
    },
    {
      title: "Both sides see the next step",
      description: "Applications, invitations, notes, status changes, and inbox routes keep the workflow moving.",
    },
  ] satisfies ContentCard[],
};

export const forClientsContent = {
  hero: {
    eyebrow: "For clients",
    title: "Find someone who actually knows n8n.",
    description:
      "Browse proof, compare rates and fit, and post projects that get better applications than a generic freelance listing.",
  },
  benefits: [
    {
      title: "Compare more than a headline",
      description: "Profiles can show pricing, services, work samples, industries, and availability instead of a short bio and generic promises.",
    },
    {
      title: "Post a better brief",
      description: "The posting flow pushes you to define outcome, systems, and budget so experts can respond more accurately.",
    },
    {
      title: "Keep hiring organized",
      description: "Applications, saved views, notes, statuses, and inbox threads keep the shortlist usable after the first response arrives.",
    },
  ] satisfies ContentCard[],
};

export const forExpertsContent = {
  hero: {
    eyebrow: "For experts",
    title: "Show what you build and get found for the right work.",
    description:
      "Build a profile clients can read quickly, publish clear services, and apply to jobs that already have enough detail to be worth your time.",
  },
  benefits: [
    {
      title: "Make your work easier to trust",
      description: "Profile and setup flows give you room to show expertise, services, work samples, and practical delivery context.",
    },
    {
      title: "Spend time on better opportunities",
      description: "Open jobs, saved views, and invitations help you focus on briefs that look serious enough for a considered proposal.",
    },
    {
      title: "See what needs action next",
      description: "Applications, invitations, inbox, and accepted-work views make it easier to track what changed and where to respond.",
    },
  ] satisfies ContentCard[],
};

export const trustContent = {
  hero: {
    eyebrow: "Trust and standards",
    title: "Trust comes from proof, not platform slogans.",
    description:
      "The product is trying to make fit, proof, and next steps easier to read so clients and experts can make better decisions faster.",
  },
  standards: [
    {
      title: "Expert proof should be easy to read",
      description: "Profiles should show depth, service fit, work relevance, and rate context clearly enough for clients to judge them seriously.",
    },
    {
      title: "Client briefs should be specific",
      description: "Projects should explain systems, outcomes, and budget expectations well enough for experts to respond intelligently.",
    },
    {
      title: "The workflow should stay legible",
      description: "Applications, saved views, statuses, and inbox surfaces should make it obvious what is happening now and what comes next.",
    },
    {
      title: "Platform stewardship",
      description: "n8nlab.io operates the platform with a practical focus on useful hiring workflows instead of bloated marketplace features.",
    },
  ] satisfies ContentCard[],
};
