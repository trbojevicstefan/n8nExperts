import { useMemo, useState } from "react";
import { Clock3, FileText, Sparkles, Target } from "lucide-react";
import type { FormFeedbackState, Job } from "@/types";
import { errorFieldClassName, FieldErrorText, FormBanner } from "@/components/forms/FormFeedback";
import { getFieldFeedback } from "@/lib/form-feedback";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  buildProposalTemplate,
  getProposalQuality,
  proposalTemplates,
  type ProposalTemplateKey,
} from "@/lib/proposal-quality";

const scoreVariant = (score: number) => {
  if (score >= 80) return "success" as const;
  if (score >= 40) return "warning" as const;
  return "outline" as const;
};

const splitPreview = (value: string) =>
  value
    .trim()
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

export function ProposalComposer({
  job,
  coverLetter,
  onCoverLetterChange,
  bidAmount,
  onBidAmountChange,
  estimatedDuration,
  onEstimatedDurationChange,
  allowBid = true,
  feedback,
  className,
}: {
  job: Pick<Job, "title" | "skills" | "brief" | "budgetAmount">;
  coverLetter: string;
  onCoverLetterChange: (value: string) => void;
  bidAmount?: string;
  onBidAmountChange?: (value: string) => void;
  estimatedDuration: string;
  onEstimatedDurationChange: (value: string) => void;
  allowBid?: boolean;
  feedback?: FormFeedbackState | null;
  className?: string;
}) {
  const [selectedTemplate, setSelectedTemplate] = useState<ProposalTemplateKey | null>(null);

  const quality = useMemo(
    () =>
      getProposalQuality({
        job,
        coverLetter,
        estimatedDuration,
      }),
    [coverLetter, estimatedDuration, job]
  );

  const previewParagraphs = useMemo(() => splitPreview(coverLetter), [coverLetter]);
  const systems = [...(job.brief?.systems || []), ...(job.brief?.integrations || []), ...(job.skills || [])].slice(0, 4);
  const bidAmountError = getFieldFeedback(feedback, "bidAmount");
  const durationError = getFieldFeedback(feedback, "estimatedDuration");
  const coverLetterError = getFieldFeedback(feedback, "coverLetter");

  return (
    <div className={cn("space-y-5", className)}>
      <FormBanner message={feedback?.summary} />
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">
            <Target className="h-3.5 w-3.5" />
            Outcome to reference
          </p>
          <p className="mt-2 text-sm text-slate-200">{job.brief?.outcome || job.title}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">
            <Sparkles className="h-3.5 w-3.5" />
            Systems to name
          </p>
          <p className="mt-2 text-sm text-slate-200">{systems.length > 0 ? systems.join(", ") : "Use the client brief and job title to be concrete."}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">
            <Clock3 className="h-3.5 w-3.5" />
            Timing cue
          </p>
          <p className="mt-2 text-sm text-slate-200">{job.brief?.timeline || "Set a first milestone or delivery window in your own words."}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Start from a job-specific proposal template</p>
            <p className="mt-1 text-sm text-slate-400">
              Recommended starting point:{" "}
              <span className="text-white">{proposalTemplates.find((template) => template.key === quality.recommendedTemplate)?.label}</span>
            </p>
          </div>
          <Badge variant="outline">Replace the draft, then edit</Badge>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {proposalTemplates.map((template) => (
            <button
              key={template.key}
              type="button"
              onClick={() => {
                setSelectedTemplate(template.key);
                onCoverLetterChange(buildProposalTemplate(template.key, job));
              }}
              className={`rounded-2xl border p-4 text-left transition ${
                (selectedTemplate || quality.recommendedTemplate) === template.key
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
              }`}
            >
              <p className="font-semibold text-white">{template.label}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">{template.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {allowBid && onBidAmountChange && (
          <div className="space-y-2">
            <Label htmlFor="proposal-bid-amount">Bid amount (optional)</Label>
            <Input
              id="proposal-bid-amount"
              type="number"
              min="1"
              className={bidAmountError ? errorFieldClassName : undefined}
              value={bidAmount || ""}
              onChange={(event) => onBidAmountChange(event.target.value)}
              placeholder="Leave blank to keep the listed budget"
              aria-invalid={Boolean(bidAmountError)}
            />
            <FieldErrorText message={bidAmountError} className="mt-2" />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="proposal-duration">Estimated duration</Label>
          <Input
            id="proposal-duration"
            className={durationError ? errorFieldClassName : undefined}
            value={estimatedDuration}
            onChange={(event) => onEstimatedDurationChange(event.target.value)}
            placeholder="Example: 5 days for phase one"
            aria-invalid={Boolean(durationError)}
          />
          <FieldErrorText message={durationError} className="mt-2" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="proposal-cover-letter">Proposal</Label>
        <Textarea
          id="proposal-cover-letter"
          className={cn("min-h-[220px]", coverLetterError && errorFieldClassName)}
          value={coverLetter}
          onChange={(event) => onCoverLetterChange(event.target.value)}
          placeholder="Reference the workflow outcome, name the systems involved, explain your delivery approach, and give the client a realistic first milestone."
          aria-invalid={Boolean(coverLetterError)}
        />
        <FieldErrorText message={coverLetterError} className="mt-2" />
        <p className="text-xs text-slate-400">Stronger proposals sound like a delivery plan for this job, not a reusable bio.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-white">
              <Sparkles className="h-4 w-4" />
              Live proposal quality
            </p>
            <Badge variant={scoreVariant(quality.score)}>Proposal score {quality.score}</Badge>
          </div>
          <div className="mt-4 space-y-3">
            {quality.checklist.map((item) => (
              <div key={item.key} className="rounded-xl border border-white/10 bg-black/10 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <Badge variant={item.complete ? "success" : "outline"}>{item.complete ? "Covered" : "Missing"}</Badge>
                </div>
                <p className="mt-2 text-xs leading-6 text-slate-400">{item.hint}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[var(--color-bg-elevated)] p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-white">
              <FileText className="h-4 w-4" />
              Client preview
            </p>
            <div className="flex flex-wrap gap-2">
              {allowBid && bidAmount && <Badge variant="secondary">${bidAmount}</Badge>}
              {estimatedDuration.trim() && <Badge variant="secondary">{estimatedDuration.trim()}</Badge>}
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">What the client will read</p>
            {previewParagraphs.length === 0 && (
              <p className="mt-3 text-sm leading-7 text-slate-400">
                The preview fills in as you write. Aim for a short opening, a delivery plan, and a timing note.
              </p>
            )}
            {previewParagraphs.map((paragraph, index) => (
              <p key={`${paragraph}-${index}`} className="mt-3 text-sm leading-7 text-slate-200">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {quality.missing.length === 0 ? (
              <Badge variant="success">Ready to send</Badge>
            ) : (
              quality.missing.slice(0, 3).map((item) => (
                <Badge key={item} variant="outline">
                  Add {item.toLowerCase()}
                </Badge>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
