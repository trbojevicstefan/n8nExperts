import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { LinkAction } from "@/content/site";

type ConversionRailProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryAction: LinkAction;
  secondaryAction: LinkAction;
  signals?: string[];
};

export function ConversionRail({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  signals = [],
}: ConversionRailProps) {
  return (
    <section className="cta-rail">
      <div className="hero-glow hero-glow-left" />
      <div className="hero-glow hero-glow-right" />
      <div className="relative z-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.03em] text-white md:text-5xl">{title}</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--color-text-secondary)]">{description}</p>
        </div>

        <div className="space-y-5">
          <div className="flex flex-wrap gap-3">
            {[primaryAction, secondaryAction].map((action, index) => (
              <Link
                key={`${action.href}-${action.label}`}
                to={action.href}
                className={
                  index === 0
                    ? "inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_var(--color-primary-glow)] transition hover:bg-[var(--color-primary-hover)]"
                    : "inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/6 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10"
                }
              >
                <span>{action.label}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ))}
          </div>

          {signals.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-2">
              {signals.map((signal) => (
                <div key={signal} className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                  {signal}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
