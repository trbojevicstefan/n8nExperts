import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({ eyebrow, title, description, align = "left", className }: SectionHeadingProps) {
  return (
    <div className={cn("max-w-[var(--max-width-copy)]", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] text-white md:text-[2.1rem]">{title}</h2>
      {description && <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)] md:text-base">{description}</p>}
    </div>
  );
}
