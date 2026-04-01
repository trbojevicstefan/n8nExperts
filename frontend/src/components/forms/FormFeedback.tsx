import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export const errorFieldClassName = "border-red-500/50 focus:border-red-400 focus:ring-red-400/40";

export function FormBanner({
  tone = "error",
  message,
  className,
}: {
  tone?: "error" | "success" | "info";
  message?: string | null;
  className?: string;
}) {
  if (!message) {
    return null;
  }

  const icon =
    tone === "success" ? <CheckCircle2 className="h-4 w-4" /> : tone === "info" ? <Info className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />;

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-xl border px-3 py-2 text-sm",
        tone === "success" && "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
        tone === "info" && "border-sky-500/20 bg-sky-500/10 text-sky-200",
        tone === "error" && "border-red-500/30 bg-red-500/10 text-red-200",
        className
      )}
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      <p>{message}</p>
    </div>
  );
}

export function FieldErrorText({ message, className }: { message?: string | null; className?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p role="alert" className={cn("text-sm text-red-300", className)}>
      {message}
    </p>
  );
}
