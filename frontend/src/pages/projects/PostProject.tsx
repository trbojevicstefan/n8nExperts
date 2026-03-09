import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PencilRuler, Sparkles } from "lucide-react";
import { jobApi } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks/usePageMeta";
import { AppPageHeader, ContextAside, StatStrip } from "@/components/layout/PagePrimitives";

export default function PostProject() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budgetType: "fixed" as "hourly" | "fixed",
    budgetAmount: "",
    visibility: "public" as "public" | "invite_only",
    skills: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  usePageMeta({
    title: "Post Project | n8nExperts",
    description: "Create a clearer n8n project brief with outcomes, systems, budget model, and trust-building context for experts.",
    canonicalPath: "/post-project",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await jobApi.createJob({
        title: formData.title.trim(),
        description: formData.description.trim(),
        budgetType: formData.budgetType,
        budgetAmount: Number(formData.budgetAmount),
        visibility: formData.visibility,
        skills: formData.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      });

      navigate("/my-jobs");
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to post project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8">
        <AppPageHeader
        eyebrow={
          <>
            <PencilRuler className="h-4 w-4" />
            Client workspace
          </>
        }
        title="Post a Job"
        description="Explain what you need, what systems are involved, and what a good result looks like."
      >
        <StatStrip
          items={[
            { label: "Start with", value: "The goal", hint: "Say what should happen when the automation works." },
            { label: "Include", value: "Main systems", hint: "Mention the tools and handoffs involved." },
            { label: "Expect", value: "Better replies", hint: "A clearer job post leads to better applications." },
          ]}
        />
      </AppPageHeader>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <form onSubmit={handleSubmit} className="panel p-6 md:p-8">
          <div className="grid gap-5">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              placeholder="Build n8n workflow for support ticket triage"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Project Description</Label>
            <Textarea
              id="description"
              className="min-h-[190px]"
              placeholder="Explain workflow triggers, connected systems, expected outputs, and edge cases."
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Budget Model</Label>
              <select
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-white"
                value={formData.budgetType}
                onChange={(e) => setFormData((prev) => ({ ...prev, budgetType: e.target.value as "hourly" | "fixed" }))}
              >
                <option value="fixed">Fixed Price</option>
                <option value="hourly">Hourly</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budgetAmount">Budget ({formData.budgetType === "hourly" ? "$/hour" : "total $"})</Label>
              <Input
                id="budgetAmount"
                type="number"
                min="1"
                value={formData.budgetAmount}
                onChange={(e) => setFormData((prev) => ({ ...prev, budgetAmount: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Visibility</Label>
              <select
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-white"
                value={formData.visibility}
                onChange={(e) => setFormData((prev) => ({ ...prev, visibility: e.target.value as "public" | "invite_only" }))}
              >
                <option value="public">Public</option>
                <option value="invite_only">Invite only</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">Skills (comma separated)</Label>
              <Input
                id="skills"
                placeholder="n8n, Slack, HubSpot, OpenAI"
                value={formData.skills}
                onChange={(e) => setFormData((prev) => ({ ...prev, skills: e.target.value }))}
              />
            </div>
          </div>

          {error && <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <p className="inline-flex items-center gap-2 text-xs text-slate-400">
              <Sparkles className="h-4 w-4 text-amber-300" />
              Tip: include current pain points and success criteria.
            </p>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Publishing..." : "Publish Project"}
            </Button>
          </div>
          </div>
        </form>

        <ContextAside
          eyebrow="Quick checklist"
          title="Make it easy for someone to say yes or no."
          description="A good job post answers the goal, the tools involved, the budget, and any important constraints."
        >
          <div className="space-y-3 text-sm text-[var(--color-text-secondary)]">
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="font-semibold text-white">Primary outcome</p>
              <p className="mt-2">What should happen automatically once the workflow is live?</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="font-semibold text-white">Operational details</p>
              <p className="mt-2">Name the systems, team handoffs, and any failure modes that matter.</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="font-semibold text-white">Decision quality</p>
              <p className="mt-2">A stronger brief reduces generic bidding and improves your shortlist quality.</p>
            </div>
          </div>
        </ContextAside>
      </div>
    </div>
  );
}
