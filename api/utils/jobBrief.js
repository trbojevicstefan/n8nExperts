import { createFieldValidationError } from "./validationErrors.js";

const isObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);

const cleanString = (value, { field, maxLength }) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") {
    throw createFieldValidationError(field, `${field} must be a string.`);
  }

  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.length > maxLength) {
    throw createFieldValidationError(field, `${field} must be at most ${maxLength} characters.`);
  }

  return trimmed;
};

const cleanStringList = (value, { field, maxItems, maxLength }) => {
  if (value === undefined || value === null) return undefined;

  const values = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/\r?\n|,/)
      : null;

  if (!values) {
    throw createFieldValidationError(field, `${field} must be an array or comma-separated string.`);
  }

  const normalized = Array.from(
    new Set(
      values
        .map((item) => {
          if (typeof item !== "string") {
            throw createFieldValidationError(field, `${field} items must be strings.`);
          }
          const trimmed = item.trim();
          if (trimmed.length > maxLength) {
            throw createFieldValidationError(field, `${field} items must be at most ${maxLength} characters.`);
          }
          return trimmed;
        })
        .filter(Boolean)
    )
  );

  if (normalized.length > maxItems) {
    throw createFieldValidationError(field, `${field} must have at most ${maxItems} items.`);
  }

  return normalized.length > 0 ? normalized : undefined;
};

const cleanEnum = (value, { field, allowed }) => {
  const normalized = cleanString(value, {
    field,
    maxLength: Math.max(...allowed.map((item) => item.length)),
  });

  if (!normalized) return undefined;
  if (!allowed.includes(normalized)) {
    throw createFieldValidationError(field, `${field} must be one of: ${allowed.join(", ")}.`);
  }

  return normalized;
};

const prune = (value) => {
  if (!isObject(value)) return undefined;
  const entries = Object.entries(value).filter(([, item]) => {
    if (Array.isArray(item)) return item.length > 0;
    return item !== undefined;
  });
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
};

export const normalizeJobBrief = (value) => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return undefined;
  if (!isObject(value)) {
    throw createFieldValidationError("brief", "brief must be an object.");
  }

  const hiringPreferencesInput = value.hiringPreferences;
  if (hiringPreferencesInput !== undefined && hiringPreferencesInput !== null && !isObject(hiringPreferencesInput)) {
    throw createFieldValidationError("brief.hiringPreferences", "brief.hiringPreferences must be an object.");
  }

  const hiringPreferences = prune({
    expertTypeNeeded: cleanEnum(hiringPreferencesInput?.expertTypeNeeded, {
      field: "brief.hiringPreferences.expertTypeNeeded",
      allowed: ["builder", "consultant", "maintainer"],
    }),
    handoffExpectation: cleanEnum(hiringPreferencesInput?.handoffExpectation, {
      field: "brief.hiringPreferences.handoffExpectation",
      allowed: ["none", "documentation", "training", "documentation_and_training"],
    }),
  });

  return prune({
    outcome: cleanString(value.outcome, { field: "brief.outcome", maxLength: 500 }),
    systems: cleanStringList(value.systems, { field: "brief.systems", maxItems: 12, maxLength: 80 }),
    integrations: cleanStringList(value.integrations, { field: "brief.integrations", maxItems: 12, maxLength: 80 }),
    constraints: cleanStringList(value.constraints, { field: "brief.constraints", maxItems: 12, maxLength: 180 }),
    deliverables: cleanStringList(value.deliverables, { field: "brief.deliverables", maxItems: 12, maxLength: 180 }),
    timeline: cleanString(value.timeline, { field: "brief.timeline", maxLength: 240 }),
    successCriteria: cleanStringList(value.successCriteria, {
      field: "brief.successCriteria",
      maxItems: 12,
      maxLength: 180,
    }),
    hiringPreferences,
  });
};
