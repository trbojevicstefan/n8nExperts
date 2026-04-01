import createError from "./createError.js";

const isValidationDetail = (detail) =>
  typeof detail === "object" &&
  detail !== null &&
  typeof detail.message === "string" &&
  detail.message.trim().length > 0;

export const normalizeValidationErrors = (errors = []) =>
  (Array.isArray(errors) ? errors : [])
    .filter(isValidationDetail)
    .map((detail) => ({
      ...(detail.field ? { field: String(detail.field) } : {}),
      message: detail.message.trim(),
    }));

export const summarizeValidationErrors = (
  errors,
  fallbackMessage = "Please review the highlighted fields and try again."
) => {
  const details = normalizeValidationErrors(errors);
  if (details.length === 0) {
    return fallbackMessage;
  }
  if (details.length === 1) {
    return details[0].message;
  }
  return `Please fix ${details.length} fields and try again.`;
};

export const createValidationError = (errors, options = {}) => {
  const details = normalizeValidationErrors(errors);
  return createError(
    options.status || 400,
    options.message || summarizeValidationErrors(details, options.fallbackMessage),
    details
  );
};

export const createFieldValidationError = (field, message, status = 400) =>
  createValidationError([{ field, message }], { status, message });
