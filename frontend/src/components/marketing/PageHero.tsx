import { PublicPageHero } from "@/components/layout/PagePrimitives";
import type { LinkAction, Metric } from "@/content/site";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: LinkAction[];
  metrics?: Metric[];
  align?: "left" | "center";
  children?: React.ReactNode;
  className?: string;
};

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  metrics,
  align = "left",
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
      className={className}
    >
      {children}
    </PublicPageHero>
  );
}
