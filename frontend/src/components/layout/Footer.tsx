import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { brandCopy, footerGroups } from "@/content/site";

export function Footer({ tone = "full" }: { tone?: "full" | "compact" }) {
  if (tone === "compact") {
    return (
      <footer className="footer-shell footer-shell-compact">
        <div className="container flex flex-col gap-4 py-6 text-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-white">{brandCopy.name}</p>
            <p className="mt-1 text-[var(--color-text-muted)]">{brandCopy.operator}</p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-[var(--color-text-secondary)]">
            {footerGroups[1].items.slice(0, 4).map((item) => (
              <Link key={item.href} to={item.href} className="transition hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="footer-shell">
      <div className="container py-14">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr_0.9fr_0.9fr]">
          <div className="space-y-5">
            <p className="eyebrow">n8nExperts</p>
            <h2 className="max-w-sm text-2xl font-black tracking-[-0.03em] text-white">
              A clearer marketplace for serious n8n hiring and delivery.
            </h2>
            <p className="max-w-md text-sm leading-7 text-[var(--color-text-secondary)]">{brandCopy.summary}</p>
            <p className="text-sm text-[var(--color-text-muted)]">
              {brandCopy.operator}{" "}
              <a href="https://n8nlab.io" target="_blank" rel="noreferrer" className="font-semibold text-white transition hover:text-[var(--color-accent-cool)]">
                Visit n8nlab.io
              </a>
            </p>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">{group.title}</p>
              <ul className="mt-4 space-y-3">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link to={item.href} className={cn("text-sm text-[var(--color-text-secondary)] transition hover:text-white")}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-[var(--color-text-muted)] md:flex-row md:items-center md:justify-between">
          <p>(c) {new Date().getFullYear()} n8nExperts. Built for automation teams that need more trust and context.</p>
          <p>Public discovery, hiring workflow, and role-based workspace routes are live.</p>
        </div>
      </div>
    </footer>
  );
}
