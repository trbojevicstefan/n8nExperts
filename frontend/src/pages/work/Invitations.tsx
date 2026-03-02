import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, MailOpen, X } from "lucide-react";
import { invitationApi } from "@/lib/api";
import type { Invitation } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const invitationStatusVariant: Record<Invitation["status"], "outline" | "success" | "warning"> = {
  sent: "warning",
  accepted: "success",
  declined: "outline",
};

export default function Invitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeInvitationId, setActiveInvitationId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    coverLetter: "",
    estimatedDuration: "",
  });

  const loadInvitations = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await invitationApi.getMine({ role: "expert", limit: 50 });
      setInvitations(response.data.invitations);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to load invitations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  const respond = async (invitationId: string, status: "accepted" | "declined") => {
    setError("");
    setSubmitting(true);
    try {
      await invitationApi.respond(invitationId, {
        status,
        ...(status === "accepted" && {
          coverLetter: form.coverLetter.trim(),
          estimatedDuration: form.estimatedDuration.trim() || undefined,
        }),
      });

      setActiveInvitationId(null);
      setForm({ coverLetter: "", estimatedDuration: "" });
      await loadInvitations();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to respond to invitation.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-8">
      <section className="panel p-6 md:p-8 mb-6">
        <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-bold text-sky-300">
          <MailOpen className="h-4 w-4" />
          Expert Invitations
        </p>
        <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-white">Invitation Inbox</h1>
        <p className="mt-2 text-slate-300">Review invitations and respond with accept or decline actions.</p>
      </section>

      {error && <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200 mb-4">{error}</div>}

      <section className="panel p-5 space-y-3">
        {loading && <p className="text-sm text-slate-300">Loading invitations...</p>}
        {!loading && invitations.length === 0 && <p className="text-sm text-slate-300">No invitations yet.</p>}

        {invitations.map((invitation) => {
          const job = typeof invitation.jobId === "string" ? null : invitation.jobId;
          const client = typeof invitation.clientId === "string" ? null : invitation.clientId;
          const isSent = invitation.status === "sent";
          const isActive = activeInvitationId === invitation._id;

          return (
            <article key={invitation._id} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">{job?.title || "Job Invitation"}</h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Client: {client?.username || "Client"}
                    {job?.budgetAmount ? ` | $${job.budgetAmount} ${job.budgetType === "hourly" ? "/hr" : "fixed"}` : ""}
                  </p>
                  {job?._id && (
                    <Link to={`/jobs?jobId=${job._id}`} className="mt-2 inline-block text-xs text-sky-300 hover:underline">
                      View job details
                    </Link>
                  )}
                </div>
                <Badge variant={invitationStatusVariant[invitation.status]}>{invitation.status}</Badge>
              </div>

              {invitation.message && <p className="mt-3 text-sm text-slate-300 whitespace-pre-wrap">{invitation.message}</p>}

              {isSent && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => setActiveInvitationId(isActive ? null : invitation._id)}>
                    <Check className="h-4 w-4 mr-1.5" />
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => respond(invitation._id, "declined")} disabled={submitting}>
                    <X className="h-4 w-4 mr-1.5" />
                    Decline
                  </Button>
                </div>
              )}

              {isSent && isActive && (
                <div className="mt-4 rounded-lg border border-white/10 bg-[var(--color-bg-elevated)] p-4 space-y-3">
                  <div className="space-y-2">
                    <Label>Proposal (required)</Label>
                    <Textarea
                      className="min-h-[140px]"
                      value={form.coverLetter}
                      onChange={(e) => setForm((prev) => ({ ...prev, coverLetter: e.target.value }))}
                      placeholder="Explain your approach, relevant experience, and delivery plan."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Estimated Duration (optional)</Label>
                    <Input
                      value={form.estimatedDuration}
                      onChange={(e) => setForm((prev) => ({ ...prev, estimatedDuration: e.target.value }))}
                      placeholder="e.g. 7 days"
                    />
                  </div>
                  <p className="text-xs text-slate-400">Invited experts can accept or decline. Bid pricing is locked to the client job budget.</p>
                  <Button onClick={() => respond(invitation._id, "accepted")} disabled={submitting || form.coverLetter.trim().length < 30}>
                    {submitting ? "Submitting..." : "Send Acceptance"}
                  </Button>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
