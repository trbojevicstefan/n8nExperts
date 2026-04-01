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

export const normalizeClientHiringContext = (value) => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return undefined;
  if (!isObject(value)) {
    throw createFieldValidationError("hiringContext", "hiringContext must be an object.");
  }

  return prune({
    automationGoal: cleanString(value.automationGoal, { field: "hiringContext.automationGoal", maxLength: 500 }),
    currentPainPoints: cleanStringList(value.currentPainPoints, {
      field: "hiringContext.currentPainPoints",
      maxItems: 10,
      maxLength: 160,
    }),
    expertTypeNeeded: cleanEnum(value.expertTypeNeeded, {
      field: "hiringContext.expertTypeNeeded",
      allowed: ["builder", "consultant", "maintainer"],
    }),
    successDefinition: cleanString(value.successDefinition, { field: "hiringContext.successDefinition", maxLength: 500 }),
    communicationPreference: cleanEnum(value.communicationPreference, {
      field: "hiringContext.communicationPreference",
      allowed: ["async_updates", "weekly_live", "shared_channel", "mixed"],
    }),
    timezoneOverlap: cleanString(value.timezoneOverlap, { field: "hiringContext.timezoneOverlap", maxLength: 120 }),
    documentationExpectation: cleanEnum(value.documentationExpectation, {
      field: "hiringContext.documentationExpectation",
      allowed: ["light", "standard", "runbook"],
    }),
    engagementPreference: cleanEnum(value.engagementPreference, {
      field: "hiringContext.engagementPreference",
      allowed: ["one_off", "ongoing", "fractional"],
    }),
  });
};
