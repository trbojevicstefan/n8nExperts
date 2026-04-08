import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Briefcase, Send, Star } from "lucide-react";
import { expertApi, jobApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { getServiceIncludedItems, resolveServiceShortDesc, resolveServiceShortTitle } from "@/lib/servicePresentation";
import type { ExpertProfile as ExpertProfileType, Job, JobReview, PortfolioItem, ProfileCompleteness, Service } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [, setProfileCompleteness] = useState<ProfileCompleteness | null>(null);
  const [clientJobs, setClientJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inviteFeedback, setInviteFeedback] = useState("");
  
  const [activeTab, setActiveTab] = useState<"about" | "portfolio" | "reviews">("about");

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

  if (loading) return <div className="container py-10 text-slate-300">Loading profile...</div>;
  if (!expert) return <div className="container py-10 text-slate-300">Expert not found.</div>;

  return (
    <div className="relative min-h-screen bg-[#0a0a0b] text-white">
      {/* Grid Background Layer */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-50 z-0"
        style={{ backgroundImage: 'radial-gradient(rgba(244, 37, 89, 0.1) 1px, transparent 1px)', backgroundSize: '30px 30px' }}
      ></div>

      <main className="relative z-10 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {error && <div className="lg:col-span-12 mb-5 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

          {/* Main Content (Left) */}
          <div className="lg:col-span-8 flex flex-col gap-10">
            {/* Profile Header Section */}
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              <div className="relative shrink-0">
                <div className="size-32 md:size-40 rounded-2xl p-1 bg-gradient-to-tr from-primary via-[#3b82f6] to-primary shadow-[0_0_30px_rgba(244,37,89,0.3)]">
                  <div 
                    className="w-full h-full rounded-xl bg-center bg-no-repeat bg-cover bg-[#161618]"
                    style={{ backgroundImage: expert.img ? `url('${expert.img}')` : undefined }}
                  >
                    {!expert.img && (
                      <div className="w-full h-full flex items-center justify-center font-black text-5xl text-slate-600">
                        {expert.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 size-8 bg-green-500 border-4 border-[#0a0a0b] rounded-full z-10"></div>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight">{expert.username}</h1>
                  <span className="material-symbols-outlined text-[#3b82f6] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  {(expert.ratingAvg && expert.ratingAvg >= 4.8) && (
                    <div className="flex items-center gap-1.5 bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      <span className="material-symbols-outlined text-sm">workspace_premium</span>
                      Top Rated
                    </div>
                  )}
                </div>
                <p className="text-lg md:text-xl text-slate-300 font-medium leading-relaxed">
                  {expert.headline || "n8n Automation Specialist"} 
                  {expert.country && <span className="text-slate-500"> • {expert.country}</span>}
                </p>
                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-slate-400 font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                    Member since {new Date(expert.createdAt).getFullYear()}
                  </div>
                  {expert.completedProjects ? (
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">task_alt</span>
                      {expert.completedProjects} Jobs Completed
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Stats Bar (Glassmorphic) */}
            <div className="rounded-2xl p-6 md:p-8 flex flex-wrap justify-between gap-6 shadow-xl border border-white/10 relative overflow-hidden" 
                 style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(12px)' }}>
              <div className="flex flex-col gap-1.5">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Rating</span>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#3b82f6]">
                    {expert.ratingAvg ? expert.ratingAvg.toFixed(1) : "N/A"}
                  </span>
                  {expert.ratingAvg && (
                    <div className="flex text-primary">
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="w-px bg-white/10 hidden md:block"></div>
              <div className="flex flex-col gap-1.5">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Job Success</span>
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#3b82f6]">100%</span>
              </div>
              <div className="w-px bg-white/10 hidden md:block"></div>
              <div className="flex flex-col gap-1.5">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Experience</span>
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#3b82f6]">
                  {expert.yearsExperience ? `${expert.yearsExperience} yrs` : "N/A"}
                </span>
              </div>
              <div className="w-px bg-white/10 hidden md:block"></div>
              <div className="flex flex-col gap-1.5">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Response</span>
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#3b82f6]">
                  {expert.responseSLAHours ? `< ${expert.responseSLAHours}h` : "Fast"}
                </span>
              </div>
            </div>

            {/* Main Tabs Section */}
            <div className="mt-4">
              <div className="flex border-b border-white/10 px-2 gap-8 mb-8 overflow-x-auto whitespace-nowrap custom-scrollbar">
                <button 
                  onClick={() => setActiveTab("about")}
                  className={`flex flex-col items-center pb-3 pt-2 px-1 transition-all border-b-2 ${activeTab === "about" ? "border-primary text-white" : "border-transparent text-slate-500 hover:text-slate-300"}`}
                >
                  <span className="text-sm font-bold tracking-wide">About Expert</span>
                </button>
                <button 
                  onClick={() => setActiveTab("portfolio")}
                  className={`flex flex-col items-center pb-3 pt-2 px-1 transition-all border-b-2 ${activeTab === "portfolio" ? "border-primary text-white" : "border-transparent text-slate-500 hover:text-slate-300"}`}
                >
                  <span className="text-sm font-bold tracking-wide">Portfolio & Services ({portfolio.length + services.length})</span>
                </button>
                <button 
                  onClick={() => setActiveTab("reviews")}
                  className={`flex flex-col items-center pb-3 pt-2 px-1 transition-all border-b-2 ${activeTab === "reviews" ? "border-primary text-white" : "border-transparent text-slate-500 hover:text-slate-300"}`}
                >
                  <span className="text-sm font-bold tracking-wide">Reviews ({reviews.length})</span>
                </button>
              </div>

              {/* Tab: About Expert */}
              {activeTab === "about" && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="prose prose-invert max-w-none">
                    <p className="text-slate-300 leading-relaxed text-lg whitespace-pre-wrap">
                      {expert.desc || "No bio available yet."}
                    </p>
                  </div>

                  {(fitBadges.length > 0 || (expert.preferredEngagements && expert.preferredEngagements.length > 0)) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {fitBadges.length > 0 && (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                          <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">terminal</span> Skills & Industries
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {fitBadges.map((badge) => (
                              <span key={badge} className="bg-white/10 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-200">
                                {badge}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {expert.preferredEngagements && expert.preferredEngagements.length > 0 && (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                          <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">integration_instructions</span> Working Style
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {expert.preferredEngagements.map((item) => (
                              <span key={item} className="bg-white/10 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-200">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Portfolio & Services */}
              {activeTab === "portfolio" && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Portfolio Grid */}
                  <div>
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-primary" />
                      Featured Projects
                    </h3>
                    {portfolio.length === 0 && <p className="text-slate-400">No portfolio items published yet.</p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {portfolio.map((item) => (
                        <div key={item._id} className="group relative overflow-hidden rounded-2xl bg-[#161618] border border-white/5 hover:border-primary/50 transition-all shadow-lg flex flex-col">
                          {(item as any).mediaUrl ? (
                            <div className="aspect-video bg-[#1e1e1e] bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${(item as any).mediaUrl})` }}></div>
                          ) : (
                            <div className="aspect-video bg-[#1e1e1e] border-b border-white/5 flex items-center justify-center">
                              <span className="material-symbols-outlined text-5xl text-slate-700">image</span>
                            </div>
                          )}
                          <div className="p-6 flex-1 flex flex-col">
                            <h4 className="font-bold text-lg mb-2 text-white">{item.title}</h4>
                            <p className="text-sm text-slate-400 mb-6 line-clamp-3 flex-1">{item.summary}</p>
                            {item.link && (
                              <a href={item.link} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold text-primary group-hover:gap-3 transition-all uppercase tracking-wider">
                                View Case Study <span className="material-symbols-outlined text-base">arrow_forward</span>
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Services Row */}
                  <div>
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                       <span className="material-symbols-outlined text-primary">shopping_bag</span>
                       Offered Services
                    </h3>
                    {services.length === 0 && <p className="text-slate-400">No packaged services available.</p>}
                    <div className="space-y-6">
                      {services.map((service) => (
                        <div key={service._id} className="flex flex-col sm:flex-row gap-6 bg-[#161618] border border-white/10 rounded-2xl p-6 hover:border-primary/30 transition-all">
                          <ServiceVisual
                            title={resolveServiceShortTitle(service)}
                            shortDesc={resolveServiceShortDesc(service)}
                            cover={service.cover}
                            price={service.price}
                            deliveryTime={service.deliveryTime}
                            serviceType={service.serviceType}
                            className="h-[200px] w-full sm:w-[280px] shrink-0 rounded-xl"
                          />
                          <div className="flex-1 flex flex-col">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-xl font-bold text-white">{service.title}</h4>
                            </div>
                            <p className="text-slate-300 text-sm mb-4 leading-relaxed line-clamp-3">
                              {service.desc}
                            </p>
                            
                            <div className="mt-auto space-y-4">
                              {getServiceIncludedItems(service).length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {getServiceIncludedItems(service).slice(0, 4).map((item) => (
                                    <span key={item} className="bg-white/5 border border-white/10 px-2 py-1 rounded text-[10px] font-bold text-slate-300 uppercase">
                                      {item}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <div className="flex items-center gap-5 text-sm font-semibold">
                                <span className="text-primary text-xl font-black">${service.price}</span>
                                <span className="text-slate-400 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-sm">schedule</span> {service.deliveryTime} days
                                </span>
                                <span className="text-slate-400 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-sm">autorenew</span> {service.revisionNumber} revs
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Reviews */}
              {activeTab === "reviews" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {reviews.length === 0 && <p className="text-slate-400">No reviews have been left for this expert yet.</p>}
                  {reviews.map((review) => {
                    const client = typeof review.clientId === "string" ? null : review.clientId;
                    return (
                      <div key={review._id} className="bg-[#161618]/50 border border-white/5 rounded-2xl p-6 relative">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="size-10 bg-white/10 rounded-full flex items-center justify-center font-bold text-white">
                               {client?.username?.charAt(0)?.toUpperCase() || "C"}
                            </div>
                            <div>
                               <p className="font-bold text-white">{client?.username || "Verified Client"}</p>
                               <p className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                            <span className="text-white font-bold text-sm">{review.rating}</span>
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          </div>
                        </div>
                        <p className="text-slate-300 leading-relaxed text-sm italic">
                          "{review.comment || "Excellent work, highly recommended!"}"
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Sidebar (Right) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 flex flex-col gap-8">
              
              {/* Main Action Card */}
              <div 
                className="rounded-3xl p-8 shadow-2xl relative overflow-hidden border border-white/10"
                style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(12px)' }}
              >
                <div className="absolute -top-16 -right-16 size-48 bg-primary/20 rounded-full blur-[50px] pointer-events-none"></div>
                
                <div className="mb-8 relative z-10">
                  <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Hourly Rate</p>
                  <h2 className="text-4xl sm:text-5xl font-black text-white mt-1">
                    ${expert.hourlyRate || 0}<span className="text-xl font-bold text-slate-500">/hr</span>
                  </h2>
                </div>

                {user?.role === "client" ? (
                  <div className="flex flex-col gap-4 relative z-10">
                    <div className="space-y-2">
                       <Label className="text-slate-300">Invite to Job</Label>
                       <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-primary">
                             <SelectValue placeholder={clientJobs.length ? "Select an open job" : "No open jobs"} />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1e1e1e] border-white/10 text-white">
                             {clientJobs.map((job) => (
                                <SelectItem key={job._id} value={job._id} className="focus:bg-white/10 focus:text-white cursor-pointer">
                                  {job.title}
                                </SelectItem>
                             ))}
                          </SelectContent>
                       </Select>
                    </div>

                    <div className="space-y-2">
                       <Textarea
                          value={inviteMessage}
                          onChange={(e) => setInviteMessage(e.target.value)}
                          className="min-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus-visible:ring-primary focus-visible:border-primary resize-none"
                          placeholder="Optional: Why are you reaching out?"
                       />
                    </div>

                    <Button 
                       onClick={handleInvite} 
                       disabled={!selectedJobId} 
                       className="w-full bg-primary hover:bg-primary/90 text-white font-extrabold h-14 rounded-xl shadow-[0_0_20px_rgba(244,37,89,0.3)] transition-all flex items-center justify-center gap-2 text-base mt-2"
                    >
                       <Send className="h-5 w-5" />
                       Send Invitation
                    </Button>
                    
                    {inviteFeedback && (
                      <p className={`text-sm text-center font-medium ${inviteFeedback.includes('sent') ? 'text-green-400' : 'text-primary'}`}>
                        {inviteFeedback}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 relative z-10">
                     <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-slate-300 text-sm font-medium text-center">
                        Login or create a Client account to invite {expert.username} to your project.
                     </div>
                  </div>
                )}
                
                {expert.calendarLink && (
                  <a 
                    href={expert.calendarLink} 
                    target="_blank" 
                    rel="noreferrer"
                    className="mt-4 w-full bg-white/5 hover:bg-white/10 text-white border border-white/20 font-bold h-14 rounded-xl transition-all flex items-center justify-center gap-2 relative z-10"
                  >
                    <span className="material-symbols-outlined">event_available</span>
                    Book 1:1 Consultation
                  </a>
                )}
              </div>

              {/* Availability Logistics Card */}
              <div 
                className="rounded-2xl p-6 border border-white/5"
                style={{ background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(8px)' }}
              >
                <h4 className="font-bold text-sm text-white mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>circle</span> 
                  Logistics & Availability
                </h4>
                <div className="space-y-4">
                  {availabilityItems.map((item) => (
                    <div key={item.label} className="flex justify-between items-center text-sm border-b border-white/5 pb-3 last:border-0 last:pb-0">
                      <span className="text-slate-400">{item.label}</span>
                      <span className="text-white font-semibold">{item.value}</span>
                    </div>
                  ))}
                  {availabilityItems.length === 0 && (
                    <p className="text-sm text-slate-500">No logistics details configured.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
