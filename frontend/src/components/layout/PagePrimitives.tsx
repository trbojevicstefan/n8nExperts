import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LinkAction, Metric } from "@/content/site";

type PublicPageHeroProps = {
  eyebrow?: ReactNode;
  title: string;
  description?: string;
  actions?: LinkAction[];
  metrics?: Metric[];
  align?: "left" | "center";
  children?: ReactNode;
  className?: string;
};

type AppPageHeaderProps = {
  eyebrow?: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
};

type StatStripProps = {
  items: Array<{ label: string; value: ReactNode; hint?: string }>;
  className?: string;
};

type FilterToolbarProps = {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

type DenseListCardProps = {
  className?: string;
  children: ReactNode;
};

type ContextAsideProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
};

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

const actionClasses: Record<NonNullable<LinkAction["variant"]>, string> = {
  primary:
    "bg-[var(--color-primary)] text-white shadow-[0_16px_38px_var(--color-primary-glow)] hover:bg-[var(--color-primary-hover)]",
  secondary:
    "border border-white/12 bg-white/6 text-white hover:border-white/24 hover:bg-white/10",
  ghost: "text-[var(--color-text-secondary)] hover:text-white",
};

export function PublicPageHero({
  eyebrow,
  title,
  description,
  actions,
  metrics,
  align = "left",
  children,
  className,
}: PublicPageHeroProps) {
  return (
    <section className={cn("public-page-hero", align === "center" && "text-center", className)}>
      <div className="hero-glow hero-glow-left" />
      <div className="hero-glow hero-glow-right" />
      <div className="relative z-10">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1
          className={cn(
            "mt-4 max-w-4xl text-4xl font-black leading-[1.02] text-white md:text-[3.6rem] xl:text-[4.5rem]",
            align === "center" && "mx-auto"
          )}
        >
          {title}
        </h1>
        {description && (
          <p
            className={cn(
              "mt-4 max-w-2xl text-sm leading-7 text-[var(--color-text-secondary)] md:text-base",
              align === "center" && "mx-auto"
            )}
          >
            {description}
          </p>
        )}

        {actions && actions.length > 0 && (
          <div className={cn("mt-7 flex flex-wrap gap-3", align === "center" && "justify-center")}>
            {actions.map((action) => (
              <Link
                key={`${action.href}-${action.label}`}
                to={action.href}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all",
                  actionClasses[action.variant || "primary"]
                )}
              >
                <span>{action.label}</span>
                {action.variant !== "ghost" && <ArrowRight className="h-4 w-4" />}
              </Link>
            ))}
          </div>
        )}

        {metrics && metrics.length > 0 && <StatStrip items={metrics.map((metric) => ({ label: metric.label, value: metric.value }))} className="mt-7" />}

        {children && <div className="mt-7">{children}</div>}
      </div>
    </section>
  );
}

export function AppPageHeader({ eyebrow, title, description, actions, children, className }: AppPageHeaderProps) {
  return (
    <section className={cn("app-page-header", className)}>
      <div className="space-y-3">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <div className="space-y-2">
          <h1 className="max-w-3xl text-3xl font-black tracking-[-0.03em] text-white md:text-[3rem]">{title}</h1>
          {description && <p className="max-w-2xl text-sm leading-7 text-[var(--color-text-secondary)] md:text-base">{description}</p>}
        </div>
      </div>
      {(actions || children) && (
        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          {children}
          {actions && <div className="app-page-actions">{actions}</div>}
        </div>
      )}
    </section>
  );
}

export function StatStrip({ items, className }: StatStripProps) {
  return (
    <div className={cn("stat-strip", className)}>
      {items.map((item) => (
        <article key={item.label} className="stat-pill">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">{item.label}</p>
          <p className="mt-2 text-lg font-bold text-white">{item.value}</p>
          {item.hint && <p className="mt-1 text-xs leading-6 text-[var(--color-text-dim)]">{item.hint}</p>}
        </article>
      ))}
    </div>
  );
}

export function FilterToolbar({ title, description, actions, children, className }: FilterToolbarProps) {
  return (
    <section className={cn("filter-toolbar", className)}>
      {(title || description || actions) && (
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            {title && <h2 className="text-base font-semibold text-white">{title}</h2>}
            {description && <p className="max-w-2xl text-sm text-[var(--color-text-secondary)]">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function DenseListCard({ className, children }: DenseListCardProps) {
  return <article className={cn("dense-list-card", className)}>{children}</article>;
}

export function ContextAside({ eyebrow, title, description, children, className }: ContextAsideProps) {
  return (
    <aside className={cn("context-aside", className)}>
      {eyebrow && <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-cool)]">{eyebrow}</p>}
      <h2 className="mt-3 text-xl font-bold text-white">{title}</h2>
      {description && <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">{description}</p>}
      {children && <div className="mt-5">{children}</div>}
    </aside>
  );
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("empty-state", className)}>
      <p className="text-base font-semibold text-white">{title}</p>
      {description && <p className="mt-2 max-w-md text-sm leading-7 text-[var(--color-text-secondary)]">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
