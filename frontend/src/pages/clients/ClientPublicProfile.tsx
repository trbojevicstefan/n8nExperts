import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Building2, Calendar, Globe2, MapPin } from "lucide-react";
import { clientApi } from "@/lib/api";
import type { ClientProfilePublic } from "@/types";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function ClientPublicProfile() {
  const { clientId } = useParams();
  const [profile, setProfile] = useState<ClientProfilePublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      if (!clientId) return;
      setLoading(true);
      setError("");
      try {
        const response = await clientApi.getPublicProfile(clientId);
        setProfile(response.data);
      } catch (err: unknown) {
        const apiError = err as { response?: { data?: { message?: string } } };
        setError(apiError.response?.data?.message || "Failed to load client profile.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [clientId]);

  if (loading) {
    return <div className="container py-10 text-slate-300">Loading client profile...</div>;
  }

  if (!profile) {
    return <div className="container py-10 text-slate-300">Client profile not found.</div>;
  }

  const { client, trustMetrics } = profile;

  return (
    <div className="container py-8">
      {error && <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200 mb-5">{error}</div>}

      <section className="panel p-6 md:p-8 mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Avatar src={client.logoUrl || client.img} fallback={client.companyName || client.username} className="h-16 w-16" />
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-sky-300 font-bold">Client Profile</p>
              <h1 className="mt-1 text-3xl font-extrabold text-white">{client.companyName || client.username}</h1>
              <p className="text-sm text-slate-300">{client.industry || "General"}</p>
            </div>
          </div>
          <Badge variant="outline">{trustMetrics.activeJobs} active jobs</Badge>
        </div>

        <div className="mt-4 grid md:grid-cols-2 gap-3 text-sm text-slate-300">
          {client.location && (
            <p className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-sky-300" />
              {client.location}
            </p>
          )}
          {client.foundedYear && (
            <p className="inline-flex items-center gap-2">
              <Calendar className="h-4 w-4 text-sky-300" />
              Founded {client.foundedYear}
            </p>
          )}
          {client.companyWebsite && (
            <a href={client.companyWebsite} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sky-300 hover:underline">
              <Globe2 className="h-4 w-4" />
              Website
            </a>
          )}
          {client.companySize && (
            <p className="inline-flex items-center gap-2">
              <Building2 className="h-4 w-4 text-sky-300" />
              Team: {client.companySize}
            </p>
          )}
        </div>

        {client.desc && <p className="mt-5 text-slate-200 whitespace-pre-wrap">{client.desc}</p>}
        {client.teamDescription && <p className="mt-3 text-slate-300 whitespace-pre-wrap">{client.teamDescription}</p>}

        {(client.projectPreferences || []).length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {client.projectPreferences?.map((item) => (
              <Badge key={item} variant="secondary">
                {item}
              </Badge>
            ))}
          </div>
        )}
      </section>

      <section className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <article className="panel p-4">
          <p className="text-xs uppercase tracking-wider text-slate-400">Jobs Posted</p>
          <p className="mt-2 text-2xl font-bold text-white">{trustMetrics.jobsPosted}</p>
        </article>
        <article className="panel p-4">
          <p className="text-xs uppercase tracking-wider text-slate-400">Jobs Completed</p>
          <p className="mt-2 text-2xl font-bold text-white">{trustMetrics.jobsCompleted}</p>
        </article>
        <article className="panel p-4">
          <p className="text-xs uppercase tracking-wider text-slate-400">Hire Rate</p>
          <p className="mt-2 text-2xl font-bold text-white">{trustMetrics.hireRate}%</p>
        </article>
        <article className="panel p-4">
          <p className="text-xs uppercase tracking-wider text-slate-400">Avg Response</p>
          <p className="mt-2 text-2xl font-bold text-white">{trustMetrics.avgResponseHours}h</p>
        </article>
        <article className="panel p-4">
          <p className="text-xs uppercase tracking-wider text-slate-400">Active Jobs</p>
          <p className="mt-2 text-2xl font-bold text-white">{trustMetrics.activeJobs}</p>
        </article>
      </section>

      <div className="mt-6">
        <Link to="/jobs" className="text-sm text-sky-300 hover:underline">
          Back to open jobs
        </Link>
      </div>
    </div>
  );
}
