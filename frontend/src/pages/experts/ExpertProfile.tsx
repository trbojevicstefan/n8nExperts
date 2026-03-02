import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Briefcase, Link2, Send, Star } from "lucide-react";
import { expertApi, jobApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { ExpertProfile as ExpertProfileType, Job, JobReview, PortfolioItem, ProfileCompleteness, Service } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ExpertProfile() {
  const { expertId } = useParams();
  const { user } = useAuth();

  const [expert, setExpert] = useState<ExpertProfileType | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<JobReview[]>([]);
  const [profileCompleteness, setProfileCompleteness] = useState<ProfileCompleteness | null>(null);
  const [clientJobs, setClientJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inviteFeedback, setInviteFeedback] = useState("");

  const loadProfile = useCallback(async () => {
    if (!expertId) return;
    setLoading(true);
    setError("");
    try {
      const [profileResult, reviewsResult] = await Promise.allSettled([
        expertApi.getExpertProfile(expertId),
        expertApi.getExpertReviews(expertId, { limit: 8 }),
      ]);

      if (profileResult.status === "rejected") {
        throw profileResult.reason;
      }

      setExpert(profileResult.value.data.expert);
      setPortfolio(profileResult.value.data.portfolio);
      setServices(profileResult.value.data.services);
      setProfileCompleteness(profileResult.value.data.profileCompleteness || null);

      if (reviewsResult.status === "fulfilled") {
        setReviews(reviewsResult.value.data.reviews);
      } else {
        setReviews([]);
      }
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to load expert profile.");
    } finally {
      setLoading(false);
    }
  }, [expertId]);

  const loadClientJobs = useCallback(async () => {
    if (!user || user.role !== "client") return;
    try {
      const response = await jobApi.getMyJobs();
      const openJobs = response.data.filter((job) => job.status === "open");
      setClientJobs(openJobs);
      if (openJobs.length > 0) setSelectedJobId(openJobs[0]._id);
    } catch {
      setClientJobs([]);
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    loadClientJobs();
  }, [loadClientJobs]);

  const handleInvite = async () => {
    if (!expert || !selectedJobId) return;
    setInviteFeedback("");
    try {
      await jobApi.inviteExpert(selectedJobId, { expertId: expert._id, message: inviteMessage || undefined });
      setInviteFeedback("Invitation sent.");
      setInviteMessage("");
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setInviteFeedback(apiError.response?.data?.message || "Failed to send invitation.");
    }
  };

  if (loading) return <div className="container py-10 text-slate-300">Loading profile...</div>;
  if (!expert) return <div className="container py-10 text-slate-300">Expert not found.</div>;

  return (
    <div className="container py-8">
      {error && <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200 mb-5">{error}</div>}

      <section className="panel p-6 md:p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="flex items-center gap-4">
            <Avatar src={expert.img} fallback={expert.username} className="h-16 w-16" />
            <div>
              <h1 className="text-3xl font-extrabold text-white">{expert.username}</h1>
              <p className="text-slate-300">{expert.headline || "n8n Expert"}</p>
              <p className="mt-1 text-xs text-amber-300">
                {expert.ratingAvg ? `${expert.ratingAvg.toFixed(1)} / 5` : "No rating yet"}
                {expert.ratingCount ? ` (${expert.ratingCount} reviews)` : ""}
              </p>
            </div>
          </div>
          <Badge variant="outline">${expert.hourlyRate || 0}/hr</Badge>
        </div>
        <p className="mt-5 text-slate-200 whitespace-pre-wrap">{expert.desc || "No bio yet."}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(expert.skills || []).map((skill) => (
            <Badge key={skill} variant="secondary">
              {skill}
            </Badge>
          ))}
        </div>
        {profileCompleteness && (
          <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Profile completeness</p>
            <div className="mt-2 h-2 rounded-full bg-white/10">
              <div className="h-2 rounded-full bg-sky-300" style={{ width: `${profileCompleteness.score}%` }} />
            </div>
            <p className="mt-2 text-sm text-slate-300">{profileCompleteness.score}% complete</p>
          </div>
        )}
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="panel p-6">
            <h2 className="text-xl font-bold text-white">Portfolio</h2>
            <div className="mt-4 space-y-3">
              {portfolio.length === 0 && <p className="text-sm text-slate-300">No published work yet.</p>}
              {portfolio.map((item) => (
                <article key={item._id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="text-sm text-slate-300 mt-2">{item.summary}</p>
                  {item.link && (
                    <a
                      className="inline-flex items-center gap-1 text-sm text-sky-300 mt-3 hover:underline"
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Link2 className="h-4 w-4" />
                      View Case Study
                    </a>
                  )}
                </article>
              ))}
            </div>
          </section>

          <section className="panel p-6">
            <h2 className="text-xl font-bold text-white">Services</h2>
            <div className="mt-4 space-y-3">
              {services.length === 0 && <p className="text-sm text-slate-300">No services published yet.</p>}
              {services.map((service) => (
                <article key={service._id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-white">{service.title}</p>
                    <Badge variant="outline">{service.serviceType}</Badge>
                  </div>
                  <p className="text-sm text-slate-300 mt-2">{service.shortDesc}</p>
                  <p className="text-primary font-semibold mt-3">${service.price}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="panel p-6">
            <h2 className="text-xl font-bold text-white">Work Preferences</h2>
            <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm text-slate-300">
              <p>Experience: {expert.yearsExperience ? `${expert.yearsExperience} years` : "Not specified"}</p>
              <p>Timezone: {expert.timezone || "Not specified"}</p>
              <p>Availability: {expert.availability || "Not specified"}</p>
              <p>
                Weekly Capacity:{" "}
                {expert.availabilityHoursPerWeek ? `${expert.availabilityHoursPerWeek} hrs/week` : "Not specified"}
              </p>
              <p>Response SLA: {expert.responseSLAHours ? `${expert.responseSLAHours}h` : "Not specified"}</p>
              <p>
                Min Budget: {expert.minimumProjectBudget ? `$${expert.minimumProjectBudget}` : "Not specified"}
              </p>
            </div>
            {(expert.languages || []).length > 0 && (
              <div className="mt-4">
                <p className="text-xs uppercase tracking-wider text-slate-400">Languages</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {expert.languages?.map((language) => (
                    <Badge key={language} variant="secondary">
                      {language}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {(expert.industries || []).length > 0 && (
              <div className="mt-4">
                <p className="text-xs uppercase tracking-wider text-slate-400">Industries</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {expert.industries?.map((industry) => (
                    <Badge key={industry} variant="secondary">
                      {industry}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {(expert.preferredEngagements || []).length > 0 && (
              <div className="mt-4">
                <p className="text-xs uppercase tracking-wider text-slate-400">Preferred Engagements</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {expert.preferredEngagements?.map((engagement) => (
                    <Badge key={engagement} variant="outline">
                      {engagement}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="panel p-6">
            <h2 className="text-xl font-bold text-white">Client Reviews</h2>
            <div className="mt-4 space-y-3">
              {reviews.length === 0 && <p className="text-sm text-slate-300">No reviews yet.</p>}
              {reviews.map((review) => {
                const client = typeof review.clientId === "string" ? null : review.clientId;
                return (
                  <article key={review._id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white">{client?.username || "Client"}</p>
                      <p className="text-sm text-amber-300 inline-flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        {review.rating}
                      </p>
                    </div>
                    {review.comment && <p className="mt-2 text-sm text-slate-300 whitespace-pre-wrap">{review.comment}</p>}
                    <p className="mt-2 text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="panel p-6 h-fit lg:sticky lg:top-28">
          <h2 className="text-xl font-bold text-white">Invite to Job</h2>
          <p className="text-sm text-slate-300 mt-2">Send this expert an invitation to one of your active projects.</p>
          {user?.role === "client" ? (
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>Select Job</Label>
                <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                  <SelectTrigger>
                    <SelectValue placeholder={clientJobs.length ? "Select a job" : "No open jobs"} />
                  </SelectTrigger>
                  <SelectContent>
                    {clientJobs.map((job) => (
                      <SelectItem key={job._id} value={job._id}>
                        {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Message (optional)</Label>
                <Textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  className="min-h-[120px]"
                  placeholder="Share short context for this project."
                />
              </div>
              <Button onClick={handleInvite} disabled={!selectedJobId} className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Send Invitation
              </Button>
              {inviteFeedback && <p className="text-sm text-slate-300">{inviteFeedback}</p>}
            </div>
          ) : (
            <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-300 mt-4">
              Log in as a client to send invitations.
            </div>
          )}

          <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
            <p className="inline-flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-sky-300" />
              Availability: {expert.availability || "available"}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
