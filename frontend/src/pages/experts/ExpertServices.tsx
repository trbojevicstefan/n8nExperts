import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { serviceApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { Service } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppPageHeader, ContextAside, EmptyState, StatStrip } from "@/components/layout/PagePrimitives";

const defaultForm = {
  title: "",
  desc: "",
  shortTitle: "",
  shortDesc: "",
  serviceType: "Fixed Price" as "Fixed Price" | "Consultation",
  price: "",
  deliveryTime: "7",
  cover: "https://placehold.co/600x400/png",
};

export default function ExpertServices() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadServices = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const response = await serviceApi.getExpertServices(user._id);
      setServices(response.data);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to load services.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      title: form.title.trim(),
      desc: form.desc.trim(),
      shortTitle: form.shortTitle.trim(),
      shortDesc: form.shortDesc.trim(),
      serviceType: form.serviceType,
      price: Number(form.price),
      deliveryTime: Number(form.deliveryTime),
      cover: form.cover.trim(),
      revisionNumber: 2,
    };

    try {
      if (editingId) {
        await serviceApi.updateService(editingId, payload);
      } else {
        await serviceApi.createService(payload);
      }
      resetForm();
      await loadServices();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to save service.");
    } finally {
      setSaving(false);
    }
  };

  const editService = (service: Service) => {
    setEditingId(service._id);
    setForm({
      title: service.title,
      desc: service.desc,
      shortTitle: service.shortTitle,
      shortDesc: service.shortDesc,
      serviceType: service.serviceType,
      price: String(service.price),
      deliveryTime: String(service.deliveryTime),
      cover: service.cover,
    });
  };

  const removeService = async (serviceId: string) => {
    setError("");
    try {
      await serviceApi.deleteService(serviceId);
      setServices((prev) => prev.filter((service) => service._id !== serviceId));
      if (editingId === serviceId) {
        resetForm();
      }
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Failed to delete service.");
    }
  };

  return (
    <div className="px-4 py-8">
      <div className="container space-y-6">
        <AppPageHeader
          eyebrow="Expert services"
          title="Create and publish your offers"
          description="Services should explain what you deliver quickly, price the work clearly, and support better invite and shortlist decisions."
        >
          <StatStrip
            items={[
              { label: "Published", value: services.length },
              { label: "Editing", value: editingId ? "Yes" : "No" },
              { label: "Goal", value: "Clarity", hint: "Make services easy to compare at a glance." },
            ]}
          />
        </AppPageHeader>

        {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>{editingId ? "Edit Service" : "New Service"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={submit}>
                <div className="space-y-2">
                  <Label htmlFor="service-title">Title</Label>
                  <Input id="service-title" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service-description">Description</Label>
                  <Textarea id="service-description" className="min-h-[120px]" value={form.desc} onChange={(e) => setForm((prev) => ({ ...prev, desc: e.target.value }))} required />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="service-short-title">Short Title</Label>
                    <Input id="service-short-title" value={form.shortTitle} onChange={(e) => setForm((prev) => ({ ...prev, shortTitle: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service-short-description">Short Description</Label>
                    <Input id="service-short-description" value={form.shortDesc} onChange={(e) => setForm((prev) => ({ ...prev, shortDesc: e.target.value }))} required />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="service-type">Type</Label>
                    <select
                      id="service-type"
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-white"
                      value={form.serviceType}
                      onChange={(e) => setForm((prev) => ({ ...prev, serviceType: e.target.value as "Fixed Price" | "Consultation" }))}
                    >
                      <option value="Fixed Price">Fixed Price</option>
                      <option value="Consultation">Consultation</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service-price">Price</Label>
                    <Input id="service-price" type="number" min="1" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service-delivery-days">Delivery Days</Label>
                    <Input
                      id="service-delivery-days"
                      type="number"
                      min="1"
                      value={form.deliveryTime}
                      onChange={(e) => setForm((prev) => ({ ...prev, deliveryTime: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service-cover-url">Cover URL</Label>
                  <Input id="service-cover-url" value={form.cover} onChange={(e) => setForm((prev) => ({ ...prev, cover: e.target.value }))} required />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={saving} className="inline-flex items-center gap-2">
                    {editingId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {saving ? "Saving..." : editingId ? "Update Service" : "Publish Service"}
                  </Button>
                  {editingId && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Published Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading && <p className="text-sm text-[var(--color-text-muted)]">Loading services...</p>}
              {!loading && services.length === 0 && <EmptyState title="No services published yet." className="py-4" />}
              {services.map((service) => (
                <article key={service._id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{service.title}</p>
                      <p className="mt-1 text-xs text-slate-400">${service.price}</p>
                    </div>
                    <Badge variant={service.isActive ? "success" : "outline"}>{service.isActive ? "Active" : "Inactive"}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-slate-300">{service.shortDesc}</p>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => editService(service)} className="inline-flex items-center gap-1.5">
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => removeService(service._id)} className="inline-flex items-center gap-1.5">
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </article>
              ))}
            </CardContent>
          </Card>

          <ContextAside
            eyebrow="Service guidance"
            title="Keep the offer easy to judge."
            description="A strong service makes the scope, outcome, delivery time, and price understandable before the client opens a conversation."
          >
            <div className="space-y-3 text-sm text-[var(--color-text-secondary)]">
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <p className="font-semibold text-white">Title + short description</p>
                <p className="mt-2">These should communicate the main job to be done faster than the full description.</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <p className="font-semibold text-white">Price + delivery</p>
                <p className="mt-2">Set clear expectations so clients can compare your service without contacting you first.</p>
              </div>
            </div>
          </ContextAside>
        </div>
      </div>
    </div>
  );
}
