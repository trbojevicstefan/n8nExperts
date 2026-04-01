import createError from "../utils/createError.js";
import { createValidationError } from "../utils/validationErrors.js";

const isObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);

const validateRule = (value, rule, field, errors) => {
  const hasValue = value !== undefined && value !== null && value !== "";

  if (rule.required && !hasValue) {
    errors.push({ field, message: `${field} is required.` });
    return;
  }

  if (!hasValue) {
    return;
  }

  if (rule.type === "string" && typeof value !== "string") {
    errors.push({ field, message: `${field} must be a string.` });
    return;
  }
  if (rule.type === "number" && typeof value !== "number") {
    errors.push({ field, message: `${field} must be a number.` });
    return;
  }
  if (rule.type === "array" && !Array.isArray(value)) {
    errors.push({ field, message: `${field} must be an array.` });
    return;
  }
  if (rule.type === "object" && !isObject(value)) {
    errors.push({ field, message: `${field} must be an object.` });
    return;
  }

  if (rule.minLength !== undefined && typeof value === "string" && value.trim().length < rule.minLength) {
    errors.push({ field, message: `${field} must be at least ${rule.minLength} characters.` });
  }
  if (rule.maxLength !== undefined && typeof value === "string" && value.trim().length > rule.maxLength) {
    errors.push({ field, message: `${field} must be at most ${rule.maxLength} characters.` });
  }
  if (rule.min !== undefined && typeof value === "number" && value < rule.min) {
    errors.push({ field, message: `${field} must be at least ${rule.min}.` });
  }
  if (rule.max !== undefined && typeof value === "number" && value > rule.max) {
    errors.push({ field, message: `${field} must be at most ${rule.max}.` });
  }
  if (rule.enum && !rule.enum.includes(value)) {
    errors.push({ field, message: `${field} must be one of: ${rule.enum.join(", ")}.` });
  }
  if (rule.maxItems !== undefined && Array.isArray(value) && value.length > rule.maxItems) {
    errors.push({ field, message: `${field} must have at most ${rule.maxItems} items.` });
  }
  if (rule.minItems !== undefined && Array.isArray(value) && value.length < rule.minItems) {
    errors.push({ field, message: `${field} must have at least ${rule.minItems} items.` });
  }

  if (rule.type === "array" && rule.of && Array.isArray(value)) {
    value.forEach((item, index) => {
      validateRule(item, { ...rule.of, required: true }, `${field}[${index}]`, errors);
    });
  }

  if (rule.type === "object" && rule.schema && isObject(value)) {
    Object.entries(rule.schema).forEach(([childField, childRule]) => {
      validateRule(value[childField], childRule, `${field}.${childField}`, errors);
    });
  }
};

export const validateBody = (schema) => (req, _res, next) => {
  if (!isObject(req.body)) {
    return next(createError(400, "Request body must be a JSON object."));
  }

  const errors = [];
  const payload = req.body;

  Object.entries(schema).forEach(([field, rule]) => validateRule(payload[field], rule, field, errors));

  if (errors.length > 0) {
    return next(createValidationError(errors));
  }

  return next();
};
