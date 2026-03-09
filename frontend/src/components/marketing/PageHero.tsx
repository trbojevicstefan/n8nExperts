import type { ReactNode } from "react";
import { PublicPageHero } from "@/components/layout/PagePrimitives";
import type { LinkAction, Metric } from "@/content/site";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: LinkAction[];
  metrics?: Metric[];
  align?: "left" | "center";
  visual?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  metrics,
  align = "left",
  visual,
  children,
  className,
}: PageHeroProps) {
  return (
    <PublicPageHero
      eyebrow={eyebrow}
      title={title}
      description={description}
      actions={actions}
      metrics={metrics}
      align={align}
      visual={visual}
      className={className}
    >
      {children}
    </PublicPageHero>
  );
}
