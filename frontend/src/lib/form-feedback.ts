import axios from "axios";
import type { ApiErrorResponse, ApiValidationError, FormFeedbackState } from "@/types";

const normalizeFieldPath = (field?: string) => field?.trim().replace(/\[(\d+)\]/g, ".$1");

const normalizeValidationDetails = (details?: ApiValidationError[]) =>
  (Array.isArray(details) ? details : [])
    .filter((detail): detail is ApiValidationError => Boolean(detail?.message?.trim()))
    .map((detail) => ({
      ...(detail.field ? { field: normalizeFieldPath(detail.field) } : {}),
      message: detail.message.trim(),
    }));

const buildSummary = (message: string | undefined, details: ApiValidationError[], fallbackMessage: string) => {
  const trimmedMessage = message?.trim();
  if (trimmedMessage) {
    return trimmedMessage;
  }
  if (details.length === 1) {
    return details[0].message;
  }
  if (details.length > 1) {
    return `Please fix ${details.length} fields and try again.`;
  }
  return fallbackMessage;
};

const buildFieldErrors = (details: ApiValidationError[]) =>
  details.reduce<Record<string, string>>((fieldErrors, detail) => {
    if (!detail.field) {
      return fieldErrors;
    }
    if (!fieldErrors[detail.field]) {
      fieldErrors[detail.field] = detail.message;
    }
    return fieldErrors;
  }, {});

const toFormFeedback = ({
  message,
  errors,
  fallbackMessage,
}: {
  message?: string;
  errors?: ApiValidationError[];
  fallbackMessage: string;
}): FormFeedbackState | null => {
  const details = normalizeValidationDetails(errors);
  const summary = buildSummary(message, details, fallbackMessage);
  if (!summary && details.length === 0) {
    return null;
  }

  return {
    summary,
    fieldErrors: buildFieldErrors(details),
    details,
  };
};

export const getFormFeedback = (error: unknown, fallbackMessage: string): FormFeedbackState | null => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    return toFormFeedback({
      message: data?.message,
      errors: data?.errors,
      fallbackMessage,
    });
  }

  if (error instanceof Error) {
    return toFormFeedback({
      message: error.message,
      fallbackMessage,
    });
  }

  return toFormFeedback({ message: fallbackMessage, fallbackMessage });
};

export const createLocalFormFeedback = (
  message: string,
  errors?: ApiValidationError[]
): FormFeedbackState => ({
  summary: message,
  fieldErrors: buildFieldErrors(normalizeValidationDetails(errors)),
  details: normalizeValidationDetails(errors),
});

const matchesField = (detailField: string | undefined, candidateField: string) => {
  const normalizedDetail = normalizeFieldPath(detailField);
  const normalizedCandidate = normalizeFieldPath(candidateField);

  if (!normalizedDetail || !normalizedCandidate) {
    return false;
  }

  return normalizedDetail === normalizedCandidate || normalizedDetail.startsWith(`${normalizedCandidate}.`);
};

export const getFieldFeedback = (
  feedback: FormFeedbackState | null | undefined,
  field: string,
  aliases: string[] = []
) => {
  if (!feedback) {
    return "";
  }

  const candidates = [field, ...aliases].map(normalizeFieldPath).filter(Boolean) as string[];

  for (const candidate of candidates) {
    const exact = feedback.fieldErrors[candidate];
    if (exact) {
      return exact;
    }
  }

  const matchedDetail = feedback.details.find((detail) =>
    candidates.some((candidate) => matchesField(detail.field, candidate))
  );

  return matchedDetail?.message || "";
};
