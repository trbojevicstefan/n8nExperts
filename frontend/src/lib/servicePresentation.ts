import type { Service } from "@/types";

export type ServiceTemplateKey = "audit" | "build" | "rescue" | "consulting";

export type ServiceTemplate = {
  key: ServiceTemplateKey;
  label: string;
  summary: string;
  serviceType: Service["serviceType"];
  title: string;
  included: string;
  bestFor: string;
  price: string;
  deliveryTime: string;
  revisionNumber: string;
};

const cleanText = (value?: string | null) => (typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "");

const clamp = (value: string, maxLength: number) => {
  if (!value) return "";
  if (value.length <= maxLength) return value;
  return `${value.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
};

export const serviceTemplates: ServiceTemplate[] = [
  {
    key: "audit",
    label: "Audit",
    summary: "Review an existing automation stack and show what needs cleanup first.",
    serviceType: "Fixed Price",
    title: "Audit an existing n8n workflow for reliability and handoff gaps",
    included: ["Workflow review with issue list", "Failure-risk notes", "Prioritized fixes", "Short Loom or written summary"].join("\n"),
    bestFor: "Teams with live workflows that break quietly, feel brittle, or need a second opinion before they keep investing.",
    price: "350",
    deliveryTime: "3",
    revisionNumber: "1",
  },
  {
    key: "build",
    label: "Build",
    summary: "Ship a production-ready workflow with implementation and handoff basics.",
    serviceType: "Fixed Price",
    title: "Build a production-ready n8n workflow with monitoring and handoff",
    included: ["Workflow implementation", "Retries and alerting", "Testing pass", "Launch notes or runbook"].join("\n"),
    bestFor: "Clients who already know the workflow outcome they need and want a builder to deliver the first strong version end to end.",
    price: "1400",
    deliveryTime: "7",
    revisionNumber: "2",
  },
  {
    key: "rescue",
    label: "Rescue",
    summary: "Stabilize a failing workflow and explain what caused the breakage.",
    serviceType: "Fixed Price",
    title: "Rescue a broken n8n workflow and make it safe to run again",
    included: ["Debugging and root-cause review", "Workflow fixes", "Stability checks", "Recovery notes for the team"].join("\n"),
    bestFor: "Teams dealing with failed runs, duplicated actions, webhook errors, or urgent production issues that need fast stabilization.",
    price: "650",
    deliveryTime: "2",
    revisionNumber: "1",
  },
  {
    key: "consulting",
    label: "Consulting",
    summary: "Turn a fuzzy automation idea into a concrete delivery plan.",
    serviceType: "Consultation",
    title: "Consult on n8n architecture, scope, and implementation approach",
    included: ["Live consulting session", "Scope recommendation", "Integration risks", "Next-step implementation plan"].join("\n"),
    bestFor: "Clients who need to pressure-test scope, choose the right architecture, or decide whether to build, rebuild, or phase the work.",
    price: "180",
    deliveryTime: "1",
    revisionNumber: "0",
  },
];

export const splitServiceLines = (value?: string | null) =>
  (value || "")
    .split(/\r?\n/)
    .map((item) => item.trim().replace(/^[-*]\s*/, ""))
    .filter(Boolean);

export const joinServiceLines = (items?: string[] | null) => (items || []).map((item) => item.trim()).filter(Boolean).join("\n");

export const deriveServiceShortTitle = (title?: string | null) => clamp(cleanText(title), 70);

export const deriveServiceShortDesc = (service: Pick<Service, "bestFor" | "shortDesc" | "desc" | "features"> | { bestFor?: string; shortDesc?: string; desc?: string; features?: string[] }) => {
  const preferred = cleanText(service.shortDesc) || cleanText(service.bestFor);
  if (preferred) {
    return clamp(preferred, 160);
  }

  const firstFeature = service.features?.find(Boolean);
  if (firstFeature) {
    return clamp(`Includes ${cleanText(firstFeature).toLowerCase()}.`, 160);
  }

  return clamp(cleanText(service.desc), 160);
};

export const buildServiceDescription = (features: string[], bestFor: string) => {
  const sections: string[] = [];
  const cleanFeatures = features.map((item) => cleanText(item)).filter(Boolean);
  const cleanBestFor = cleanText(bestFor);

  if (cleanFeatures.length > 0) {
    sections.push(["Included:", ...cleanFeatures.map((item) => `- ${item}`)].join("\n"));
  }

  if (cleanBestFor) {
    sections.push(`Best for:\n${cleanBestFor}`);
  }

  return sections.join("\n\n").trim();
};

export const getServiceIncludedItems = (service: Pick<Service, "features" | "desc"> | { features?: string[]; desc?: string }) => {
  if (service.features && service.features.length > 0) {
    return service.features.map((item) => cleanText(item)).filter(Boolean);
  }

  return splitServiceLines(service.desc);
};

export const resolveServiceShortTitle = (service: Pick<Service, "title" | "shortTitle"> | { title?: string; shortTitle?: string }) =>
  cleanText(service.shortTitle) || deriveServiceShortTitle(service.title);

export const resolveServiceShortDesc = (
  service: Pick<Service, "bestFor" | "shortDesc" | "desc" | "features"> | { bestFor?: string; shortDesc?: string; desc?: string; features?: string[] }
) => cleanText(service.shortDesc) || deriveServiceShortDesc(service);

export const getServiceFormValues = (service: Service) => ({
  title: service.title,
  included: joinServiceLines(getServiceIncludedItems(service)),
  bestFor: cleanText(service.bestFor) || cleanText(service.shortDesc),
  serviceType: service.serviceType,
  price: String(service.price),
  deliveryTime: String(service.deliveryTime),
  revisionNumber: String(service.revisionNumber ?? 0),
  cover: service.cover || "",
});
