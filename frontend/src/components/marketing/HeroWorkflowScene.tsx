import { useEffect, useState } from "react";
import { BriefcaseBusiness, Network, ShieldCheck, Sparkles, UserRoundCheck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type HeroPhase = "brief" | "match" | "handoff" | "stream";

const phaseOrder: Array<{ key: HeroPhase; duration: number }> = [
  { key: "brief", duration: 1000 },
  { key: "match", duration: 1200 },
  { key: "handoff", duration: 1100 },
  { key: "stream", duration: 4200 },
];

const lineOnePath = "M 240 250 C 265 250, 265 135, 290 135";
const lineTwoPath = "M 490 135 C 515 135, 515 250, 540 250";

const sceneBadges = [
  { label: "Safely", icon: ShieldCheck, className: "hero-badge-safe", style: { top: "45px", left: "345px" } },
  { label: "Fast", icon: Zap, className: "hero-badge-fast", style: { top: "155px", left: "600px" } },
  { label: "Intuitive", icon: Sparkles, className: "hero-badge-intuitive", style: { top: "310px", left: "340px" } },
];

export function HeroWorkflowScene() {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const phase = phaseOrder[phaseIndex]?.key ?? "brief";

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setPhaseIndex((current) => (current + 1) % phaseOrder.length);
    }, phaseOrder[phaseIndex]?.duration ?? 1000);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [phaseIndex]);

  const showLineOne = phase !== "brief";
  const showLineTwo = phase === "handoff" || phase === "stream";
  const showPackets = phase === "stream";

  return (
    <section className="hero-workflow-shell" data-phase={phase} aria-label="Animated platform workflow">
      <div className="hero-scene-wrapper">
        <div className="hero-scene-canvas">
          <svg className="hero-connection-layer" viewBox="0 0 800 500" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <filter id="hero-glow-packet" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <path d={lineOnePath} className="hero-connection-track" />
            <path d={lineTwoPath} className="hero-connection-track" />

            <path d={lineOnePath} className={cn("hero-draw-line hero-draw-line-coral", showLineOne && "hero-draw-line-visible")} />
            <path d={lineTwoPath} className={cn("hero-draw-line hero-draw-line-emerald", showLineTwo && "hero-draw-line-visible")} />

            <circle className={cn("hero-data-packet hero-data-packet-coral", showPackets && "hero-data-packet-visible")} r="5" fill="currentColor" filter="url(#hero-glow-packet)">
              <animateMotion dur="1.2s" repeatCount="indefinite" path={lineOnePath} />
            </circle>
            <circle className={cn("hero-data-packet hero-data-packet-emerald", showPackets && "hero-data-packet-visible")} r="5" fill="currentColor" filter="url(#hero-glow-packet)">
              <animateMotion dur="1.2s" repeatCount="indefinite" path={lineTwoPath} />
            </circle>
          </svg>

          {sceneBadges.map((badge) => {
            const Icon = badge.icon;
            const visible =
              (badge.label === "Safely" && (phase === "match" || phase === "handoff" || phase === "stream")) ||
              (badge.label === "Fast" && (phase === "handoff" || phase === "stream")) ||
              (badge.label === "Intuitive" && phase === "stream");

            return (
              <div key={badge.label} className={cn("hero-workflow-badge", badge.className, visible && "hero-workflow-badge-visible")} style={badge.style}>
                <Icon className="h-4 w-4" />
                <span>{badge.label}</span>
              </div>
            );
          })}

          <article className={cn("hero-scene-node hero-scene-node-client", phase === "brief" && "hero-scene-node-active hero-scene-node-active-indigo")}>
            <span className="hero-node-endpoint hero-node-endpoint-right" />
            <div className="hero-scene-icon hero-scene-icon-indigo">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>
            <div className="hero-scene-content">
              <p className="hero-scene-title">Client Brief</p>
              <p className="hero-scene-subtitle">Trigger: New Request</p>
            </div>
          </article>

          <article
            className={cn(
              "hero-scene-node hero-scene-node-platform",
              (phase === "match" || phase === "handoff" || phase === "stream") && "hero-scene-node-active hero-scene-node-active-coral"
            )}
          >
            <span className="hero-node-endpoint hero-node-endpoint-left" />
            <span className="hero-node-endpoint hero-node-endpoint-right" />
            <div className="hero-scene-icon hero-scene-icon-coral">
              <Network className="h-5 w-5" />
            </div>
            <div className="hero-scene-content">
              <p className="hero-scene-title">n8nExperts</p>
              <p className="hero-scene-subtitle">Secure Hub Match</p>
            </div>
          </article>

          <article
            className={cn(
              "hero-scene-node hero-scene-node-expert",
              (phase === "handoff" || phase === "stream") && "hero-scene-node-active hero-scene-node-active-emerald"
            )}
          >
            <span className="hero-node-endpoint hero-node-endpoint-left" />
            <div className="hero-scene-icon hero-scene-icon-emerald">
              <UserRoundCheck className="h-5 w-5" />
            </div>
            <div className="hero-scene-content">
              <p className="hero-scene-title">Verified Expert</p>
              <p className="hero-scene-subtitle">Action: Execute</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
