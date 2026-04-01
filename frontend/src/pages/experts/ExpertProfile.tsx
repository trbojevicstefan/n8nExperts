import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Briefcase, CalendarDays, Globe2, Link2, Send, ShieldCheck, Star } from "lucide-react";
import { expertApi, jobApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { getServiceIncludedItems, resolveServiceShortDesc, resolveServiceShortTitle } from "@/lib/servicePresentation";
import type { ExpertProfile as ExpertProfileType, Job, JobReview, PortfolioItem, ProfileCompleteness, Service } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContextAside, DenseListCard, EmptyState, PublicPageHero, StatStrip } from "@/components/layout/PagePrimitives";
import { ServiceVisual } from "@/components/services/ServiceVisual";
import { usePageMeta } from "@/hooks/usePageMeta";

const formatValue = (value?: string | number | null) => {
  if (value === null || value === undefined || value === "") return null;
  return String(value);
};

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

  usePageMeta({
    title: expert ? `${expert.username} | n8nExperts` : "Expert Profile | n8nExperts",
    description: expert ? expert.headline || expert.desc || "Review this expert's fit, proof, services, and availability." : "Review this expert's fit, proof, services, and availability.",
    canonicalPath: expertId ? `/experts/${expertId}` : undefined,
  });

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
      if (openJobs.length > 0) {
        setSelectedJobId(openJobs[0]._id);
      }
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

  const availabilityItems = useMemo(() => {
    if (!expert) return [];
    return [
      formatValue(expert.availability) ? { label: "Availability", value: expert.availability } : null,
      expert.hourlyRate ? { label: "Rate", value: `$${expert.hourlyRate}/hr` } : null,
      expert.timezone ? { label: "Timezone", value: expert.timezone } : null,
      expert.availabilityHoursPerWeek ? { label: "Weekly capacity", value: `${expert.availabilityHoursPerWeek} hrs/week` } : null,
      expert.responseSLAHours ? { label: "Response SLA", value: `${expert.responseSLAHours} hours` } : null,
      expert.minimumProjectBudget ? { label: "Minimum budget", value: `$${expert.minimumProjectBudget}` } : null,
    ].filter(Boolean) as Array<{ label: string; value: string }>;
  }, [expert]);

  const fitBadges = useMemo(() => {
    if (!expert) return [];
    return [...(expert.skills || []), ...(expert.industries || [])];
  }, [expert]);

  const engagementBadges = useMemo(() => {
    if (!expert) return [];
    return [...(expert.preferredEngagements || []), ...(expert.languages || [])];
  }, [expert]);

  if (loading) return <div className="container py-10 text-slate-300">Loading profile...</div>;
  if (!expert) return <div className="container py-10 text-slate-300">Expert not found.</div>;

  return (
    <div className="container py-8">
      {error && <div className="mb-5 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

      <PublicPageHero
        eyebrow="Expert profile"
        title={expert.headline || expert.username}
        description={`@${expert.username}`}
        className="mb-6"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center gap-4">
            <Avatar src={expert.img} fallback={expert.username} className="h-16 w-16" />
            <div>
              <p className="text-xs text-amber-300">
                {expert.ratingAvg ? `${expert.ratingAvg.toFixed(1)} / 5` : "No rating yet"}
                {expert.ratingCount ? ` (${expert.ratingCount} reviews)` : ""}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(expert.skills || []).slice(0, 6).map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <StatStrip
            className="lg:min-w-[420px]"
            items={[
              { label: "Fit", value: expert.yearsExperience ? `${expert.yearsExperience} years` : "n8n specialist" },
              { label: "Proof", value: `${portfolio.length + services.length} items` },
              { label: "Availability", value: expert.availability || "Available" },
            ]}
          />
        </div>
        {profileCompleteness && user?._id === expert._id && (
          <div className="mt-5 max-w-md rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Owner view</p>
            <p className="mt-2 text-sm text-slate-300">Profile completeness: {profileCompleteness.score}%</p>
          </div>
        )}
      </PublicPageHero>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <section className="panel p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-sky-300" />
              <h2 className="text-xl font-bold text-white">Fit</h2>
            </div>
            <div className="mt-4 space-y-4">
              {expert.desc && <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">{expert.desc}</p>}
              {fitBadges.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Relevant systems and domains</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {fitBadges.map((item) => (
                      <Badge key={item} variant="secondary">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {engagementBadges.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Working style and language</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {engagementBadges.map((item) => (
                      <Badge key={item} variant="outline">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="panel p-6">
            <h2 className="text-xl font-bold text-white">Proof</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Work samples</p>
                <p className="mt-2 text-lg font-semibold text-white">{portfolio.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Services</p>
                <p className="mt-2 text-lg font-semibold text-white">{services.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Completed projects</p>
                <p className="mt-2 text-lg font-semibold text-white">{expert.completedProjects || 0}</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {portfolio.length === 0 && <EmptyState title="No published work yet." description="Use services, reviews, and profile detail to judge fit for now." className="py-4" />}
              {portfolio.map((item) => (
                <DenseListCard key={item._id}>
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-slate-300">{item.summary}</p>
                  {item.link && (
                    <a className="mt-3 inline-flex items-center gap-1 text-sm text-sky-300 hover:underline" href={item.link} target="_blank" rel="noreferrer">
                      <Link2 className="h-4 w-4" />
                      View case study
                    </a>
                  )}
                </DenseListCard>
              ))}
            </div>
          </section>

          <section className="panel p-6">
            <h2 className="text-xl font-bold text-white">Services</h2>
            <div className="mt-4 space-y-4">
              {services.length === 0 && <EmptyState title="No services published yet." description="This expert may still be a fit based on proof and profile detail." className="py-4" />}
              {services.map((service) => (
                <article key={service._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                    <ServiceVisual
                      title={resolveServiceShortTitle(service)}
                      shortDesc={resolveServiceShortDesc(service)}
                      cover={service.cover}
                      price={service.price}
                      deliveryTime={service.deliveryTime}
                      serviceType={service.serviceType}
                      className="h-[200px]"
                    />
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-semibold text-white">{service.title}</p>
                          <p className="mt-2 text-sm leading-6 text-slate-300">{resolveServiceShortDesc(service)}</p>
                        </div>
                        <Badge variant="outline">{service.serviceType}</Badge>
                      </div>
                      {getServiceIncludedItems(service).length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {getServiceIncludedItems(service).slice(0, 5).map((item) => (
                            <Badge key={item} variant="secondary">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                        <span>${service.price}</span>
                        <span>{service.deliveryTime} days</span>
                        <span>{service.revisionNumber} revisions</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="panel p-6">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-300" />
              <h2 className="text-xl font-bold text-white">Reviews</h2>
            </div>
            <div className="mt-4 space-y-3">
              {reviews.length === 0 && <EmptyState title="No reviews yet." description="Use the fit, proof, and service sections to make the first shortlist decision." className="py-4" />}
              {reviews.map((review) => {
                const client = typeof review.clientId === "string" ? null : review.clientId;
                return (
                  <DenseListCard key={review._id}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white">{client?.username || "Client"}</p>
                      <p className="inline-flex items-center gap-1 text-sm text-amber-300">
                        <Star className="h-4 w-4" />
                        {review.rating}
                      </p>
                    </div>
                    {review.comment && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{review.comment}</p>}
                    <p className="mt-2 text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </DenseListCard>
                );
              })}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <ContextAside
            eyebrow="Availability"
            title="Availability and logistics"
            description="Use these details to see whether the working style, timing, and budget context fit before you send an invite."
            className="h-fit lg:sticky"
            style={{ top: "calc(var(--chrome-sticky-offset) + 0.5rem)" }}
          >
            <div className="space-y-3">
              {availabilityItems.length === 0 && <p className="text-sm text-slate-300">No extra availability details shared yet.</p>}
              {availabilityItems.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                  <p className="mt-2 font-semibold text-white">{item.value}</p>
                </div>
              ))}
              {expert.calendarLink && (
                <a href={expert.calendarLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-sky-300 hover:underline">
                  <CalendarDays className="h-4 w-4" />
                  Open calendar
                </a>
              )}
              {expert.country && (
                <p className="inline-flex items-center gap-2 text-sm text-slate-300">
                  <Globe2 className="h-4 w-4 text-sky-300" />
                  {expert.country}
                </p>
              )}
            </div>
          </ContextAside>

          <ContextAside
            eyebrow="Invite to job"
            title="Move from review into outreach"
            description="Invite this expert into one of your active projects once the fit, proof, and timing look aligned."
          >
            {user?.role === "client" ? (
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label>Select job</Label>
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
                  <Send className="mr-2 h-4 w-4" />
                  Send invitation
                </Button>
                {inviteFeedback && <p className="text-sm text-slate-300">{inviteFeedback}</p>}
              </div>
            ) : (
              <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
                Log in as a client to send invitations.
              </div>
            )}

            <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
              <p className="inline-flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-sky-300" />
                Proof items: {portfolio.length + services.length}
              </p>
            </div>
          </ContextAside>
        </div>
      </div>
    </div>
  );
}
