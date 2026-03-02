import createError from "../utils/createError.js";

const isObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);

export const validateBody = (schema) => (req, _res, next) => {
  if (!isObject(req.body)) {
    return next(createError(400, "Request body must be a JSON object."));
  }

  const errors = [];
  const payload = req.body;

  Object.entries(schema).forEach(([field, rule]) => {
    const value = payload[field];
    const hasValue = value !== undefined && value !== null && value !== "";

    if (rule.required && !hasValue) {
      errors.push(`${field} is required.`);
      return;
    }

    if (!hasValue) {
      return;
    }

    if (rule.type === "string" && typeof value !== "string") {
      errors.push(`${field} must be a string.`);
      return;
    }
    if (rule.type === "number" && typeof value !== "number") {
      errors.push(`${field} must be a number.`);
      return;
    }
    if (rule.type === "array" && !Array.isArray(value)) {
      errors.push(`${field} must be an array.`);
      return;
    }

    if (rule.minLength && typeof value === "string" && value.trim().length < rule.minLength) {
      errors.push(`${field} must be at least ${rule.minLength} characters.`);
    }
    if (rule.maxLength && typeof value === "string" && value.trim().length > rule.maxLength) {
      errors.push(`${field} must be at most ${rule.maxLength} characters.`);
    }
    if (rule.min && typeof value === "number" && value < rule.min) {
      errors.push(`${field} must be at least ${rule.min}.`);
    }
    if (rule.max && typeof value === "number" && value > rule.max) {
      errors.push(`${field} must be at most ${rule.max}.`);
    }
    if (rule.enum && !rule.enum.includes(value)) {
      errors.push(`${field} must be one of: ${rule.enum.join(", ")}.`);
    }
  });

  if (errors.length > 0) {
    return next(createError(400, errors.join(" ")));
  }

  return next();
};
