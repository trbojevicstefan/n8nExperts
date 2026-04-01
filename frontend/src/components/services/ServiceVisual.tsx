import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { Service } from "@/types";

type ServiceVisualProps = {
  title: string;
  shortDesc?: string;
  cover?: string;
  price?: number | string;
  deliveryTime?: number | string;
  serviceType?: Service["serviceType"];
  className?: string;
};

const fallbackThemes = [
  {
    shell: "from-emerald-300/20 via-cyan-400/20 to-slate-950",
    orbOne: "bg-emerald-300/25",
    orbTwo: "bg-cyan-300/20",
    chip: "border-emerald-200/20 bg-emerald-300/12 text-emerald-50",
  },
  {
    shell: "from-amber-300/20 via-rose-400/20 to-slate-950",
    orbOne: "bg-amber-300/20",
    orbTwo: "bg-rose-300/20",
    chip: "border-amber-200/20 bg-amber-300/12 text-amber-50",
  },
  {
    shell: "from-sky-300/20 via-indigo-400/20 to-slate-950",
    orbOne: "bg-sky-300/20",
    orbTwo: "bg-indigo-300/20",
    chip: "border-sky-200/20 bg-sky-300/12 text-sky-50",
  },
];

const hashTitle = (value: string) =>
  value.split("").reduce((total, character) => total + character.charCodeAt(0), 0);

export function ServiceVisual({ title, shortDesc, cover, price, deliveryTime, serviceType = "Fixed Price", className }: ServiceVisualProps) {
  const [failedCover, setFailedCover] = useState("");

  const theme = useMemo(() => fallbackThemes[hashTitle(title || "n8nExperts") % fallbackThemes.length], [title]);
  const showImage = Boolean(cover) && failedCover !== cover;

  if (showImage) {
    return (
      <div className={cn("relative overflow-hidden rounded-[1.35rem] border border-white/10 bg-slate-950", className)}>
        <img src={cover} alt={title} className="h-full w-full object-cover" onError={() => setFailedCover(cover || "")} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">n8nExperts</p>
          <p className="mt-2 max-w-[18ch] text-lg font-semibold leading-tight text-white">{title}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden rounded-[1.35rem] border border-white/10 bg-slate-950", className)}>
      <div className={cn("absolute inset-0 bg-gradient-to-br", theme.shell)} />
      <div className={cn("absolute -left-10 top-5 h-28 w-28 rounded-full blur-3xl", theme.orbOne)} />
      <div className={cn("absolute -right-8 bottom-4 h-24 w-24 rounded-full blur-3xl", theme.orbTwo)} />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_38%,rgba(255,255,255,0.03)_75%,transparent)]" />
      <div className="relative flex h-full flex-col justify-between p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">n8nExperts</p>
            <p className="mt-2 text-sm font-semibold text-white/80">Service preview</p>
          </div>
          <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]", theme.chip)}>
            {serviceType}
          </span>
        </div>

        <div>
          <p className="max-w-[18ch] text-xl font-semibold leading-tight text-white">{title || "Service title"}</p>
          <p className="mt-3 max-w-[28ch] text-xs leading-6 text-white/72">
            {shortDesc || "Add a title and best-fit note to generate a branded fallback card when no cover image is set."}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/65">
            {price !== undefined && price !== "" && <span>${price}</span>}
            {deliveryTime !== undefined && deliveryTime !== "" && <span>{deliveryTime} days</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
