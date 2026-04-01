import type { Job, JobBrief } from "@/types";
import { cn } from "@/lib/utils";
import {
  briefExpertTypeLabels,
  briefHandoffExpectationLabels,
  getJobBriefQuality,
} from "@/lib/hiring-signals";
import { Badge } from "@/components/ui/badge";

const sectionClassName = "rounded-2xl border border-white/8 bg-white/5 p-4";

const listIsVisible = (items?: string[]) => Array.isArray(items) && items.length > 0;

const scoreVariant = (score: number) => {
  if (score >= 78) return "success" as const;
  if (score >= 45) return "warning" as const;
  return "outline" as const;
};

export function JobBriefSignals({
  job,
  className,
  showScore = true,
}: {
  job: Pick<Job, "brief" | "budgetAmount">;
  className?: string;
  showScore?: boolean;
}) {
  const quality = getJobBriefQuality(job);

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {showScore && <Badge variant={scoreVariant(quality.score)}>Brief score {quality.score}</Badge>}
      {quality.signals.map((signal) => (
        <Badge key={signal.key} variant={signal.present ? "success" : "outline"}>
          {signal.label}
        </Badge>
      ))}
    </div>
  );
}

export function JobBriefDetails({ brief, className }: { brief?: JobBrief; className?: string }) {
  if (!brief) {
    return null;
  }

  const hasHiringPreferences = Boolean(brief.hiringPreferences?.expertTypeNeeded || brief.hiringPreferences?.handoffExpectation);

  return (
    <div className={cn("grid gap-3 md:grid-cols-2", className)}>
      {brief.outcome && (
        <section className={sectionClassName}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">Outcome</p>
          <p className="mt-2 text-sm text-slate-200">{brief.outcome}</p>
        </section>
      )}

      {brief.timeline && (
        <section className={sectionClassName}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">Timeline</p>
          <p className="mt-2 text-sm text-slate-200">{brief.timeline}</p>
        </section>
      )}

      {listIsVisible(brief.systems) && (
        <section className={sectionClassName}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">Systems</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {brief.systems?.map((item) => (
              <Badge key={item} variant="secondary">
                {item}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {listIsVisible(brief.integrations) && (
        <section className={sectionClassName}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">Integrations</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {brief.integrations?.map((item) => (
              <Badge key={item} variant="secondary">
                {item}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {listIsVisible(brief.deliverables) && (
        <section className={sectionClassName}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">Deliverables</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-200">
            {brief.deliverables?.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </section>
      )}

      {listIsVisible(brief.constraints) && (
        <section className={sectionClassName}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">Constraints</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-200">
            {brief.constraints?.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </section>
      )}

      {listIsVisible(brief.successCriteria) && (
        <section className={sectionClassName}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">Success Criteria</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-200">
            {brief.successCriteria?.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </section>
      )}

      {hasHiringPreferences && (
        <section className={sectionClassName}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">Hiring Preferences</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {brief.hiringPreferences?.expertTypeNeeded && (
              <Badge variant="secondary">{briefExpertTypeLabels[brief.hiringPreferences.expertTypeNeeded]}</Badge>
            )}
            {brief.hiringPreferences?.handoffExpectation && (
              <Badge variant="secondary">{briefHandoffExpectationLabels[brief.hiringPreferences.handoffExpectation]}</Badge>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
