import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { serviceApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useRouteFlash } from "@/hooks/useRouteFlash";
import {
  buildServiceDescription,
  deriveServiceShortTitle,
  getServiceFormValues,
  resolveServiceShortDesc,
  resolveServiceShortTitle,
  serviceTemplates,
  splitServiceLines,
} from "@/lib/servicePresentation";
import type { Service } from "@/types";
import type { FormFeedbackState } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { errorFieldClassName, FieldErrorText, FormBanner } from "@/components/forms/FormFeedback";
import { AppPageHeader, ContextAside, EmptyState, StatStrip } from "@/components/layout/PagePrimitives";
import { ServiceVisual } from "@/components/services/ServiceVisual";
import { createLocalFormFeedback, getFieldFeedback, getFormFeedback } from "@/lib/form-feedback";
import { cn } from "@/lib/utils";

const defaultForm = {
  title: "",
  included: "",
  bestFor: "",
  serviceType: "Fixed Price" as Service["serviceType"],
  price: "",
  deliveryTime: "7",
  revisionNumber: "2",
  cover: "",
};

export default function ExpertServices() {
  const { user } = useAuth();
  const flash = useRouteFlash();
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [formFeedback, setFormFeedback] = useState<FormFeedbackState | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const loadServices = async () => {
    if (!user) return;
    setLoading(true);
    setPageError("");
    try {
      const response = await serviceApi.getExpertServices(user._id);
      setServices(response.data);
    } catch (err: unknown) {
      setPageError(getFormFeedback(err, "We could not load your services right now.")?.summary || "We could not load your services right now.");
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
    setSelectedTemplate(null);
    setFormFeedback(null);
  };

  const applyTemplate = (templateKey: string) => {
    const template = serviceTemplates.find((item) => item.key === templateKey);
    if (!template) return;

    setSelectedTemplate(template.key);
    setEditingId(null);
    setForm({
      title: template.title,
      included: template.included,
      bestFor: template.bestFor,
      serviceType: template.serviceType,
      price: template.price,
      deliveryTime: template.deliveryTime,
      revisionNumber: template.revisionNumber,
      cover: "",
    });
    setFormFeedback(null);
    setSuccessMessage("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const includedItems = splitServiceLines(form.included);

    if (includedItems.length === 0) {
      setFormFeedback(
        createLocalFormFeedback("Add at least one included deliverable or step so clients can understand the scope.", [
          { field: "included", message: "Add at least one included deliverable or step so clients can understand the scope." },
        ])
      );
      return;
    }

    setSaving(true);
    setPageError("");
    setFormFeedback(null);
    setSuccessMessage("");

    const payload = {
      title: form.title.trim(),
      desc: buildServiceDescription(includedItems, form.bestFor),
      bestFor: form.bestFor.trim() || undefined,
      features: includedItems,
      serviceType: form.serviceType,
      price: Number(form.price),
      deliveryTime: Number(form.deliveryTime),
      revisionNumber: Number(form.revisionNumber || 0),
      cover: form.cover.trim() || undefined,
    };

    try {
      if (editingId) {
        await serviceApi.updateService(editingId, payload);
        setSuccessMessage("Service updated. Your public card and editor preview are now aligned.");
      } else {
        await serviceApi.createService(payload);
        setSuccessMessage("Service published. Clients can now compare this offer without needing a first message.");
      }
      resetForm();
      await loadServices();
    } catch (err: unknown) {
      setFormFeedback(getFormFeedback(err, "We could not save this service. Please review the highlighted fields and try again."));
    } finally {
      setSaving(false);
    }
  };

  const editService = (service: Service) => {
    setEditingId(service._id);
    setSelectedTemplate(null);
    setForm(getServiceFormValues(service));
    setPageError("");
    setFormFeedback(null);
    setSuccessMessage("");
  };

  const removeService = async (serviceId: string) => {
    setPageError("");
    setFormFeedback(null);
    setSuccessMessage("");
    try {
      await serviceApi.deleteService(serviceId);
      setServices((prev) => prev.filter((service) => service._id !== serviceId));
      if (editingId === serviceId) {
        resetForm();
      }
      setSuccessMessage("Service deleted. It no longer appears in your public offers.");
    } catch (err: unknown) {
      setPageError(getFormFeedback(err, "We could not delete this service right now.")?.summary || "We could not delete this service right now.");
    }
  };

  const includedItems = useMemo(() => splitServiceLines(form.included), [form.included]);
  const previewDescription = useMemo(() => buildServiceDescription(includedItems, form.bestFor), [includedItems, form.bestFor]);
  const previewShortTitle = useMemo(() => deriveServiceShortTitle(form.title), [form.title]);
  const previewShortDesc = useMemo(
    () =>
      resolveServiceShortDesc({
        bestFor: form.bestFor,
        desc: previewDescription,
        features: includedItems,
      }),
    [form.bestFor, includedItems, previewDescription]
  );

  const fieldError = (field: string, aliases: string[] = []) => getFieldFeedback(formFeedback, field, aliases);
  const updateFormField = <K extends keyof typeof defaultForm>(field: K, value: (typeof defaultForm)[K]) => {
    if (formFeedback) {
      setFormFeedback(null);
    }
    if (successMessage) {
      setSuccessMessage("");
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="px-4 py-8">
      <div className="container space-y-6">
        <AppPageHeader
          eyebrow="Expert services"
          title="Shape offers clients can judge fast"
          description="Keep the scope, best-fit buyer, delivery time, and price obvious enough that the client can decide whether to shortlist you before they start a chat."
        >
          <StatStrip
            items={[
              { label: "Published", value: services.length },
              { label: "Current type", value: form.serviceType },
              { label: "Cover", value: form.cover.trim() ? "Custom" : "Generated", hint: "No image required. A branded fallback card fills in automatically." },
            ]}
          />
        </AppPageHeader>

        {flash && (
          <div
            className={`rounded-lg px-3 py-2 text-sm ${
              flash.tone === "success"
                ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                : flash.tone === "error"
                  ? "border border-red-500/20 bg-red-500/10 text-red-200"
                  : "border border-sky-500/20 bg-sky-500/10 text-sky-200"
            }`}
          >
            {flash.text}
          </div>
        )}

        <FormBanner message={pageError} />
        <FormBanner tone="success" message={successMessage} />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.9fr)_320px]">
          <Card className="rounded-2xl">
            <CardHeader className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>{editingId ? "Edit service" : "Create a service"}</CardTitle>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    Start from a template or write your own. Short title and short description are generated automatically from what you enter here.
                  </p>
                </div>
                {selectedTemplate && <Badge variant="outline">Template: {selectedTemplate}</Badge>}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {serviceTemplates.map((template) => {
                  const isActive = selectedTemplate === template.key;
                  return (
                    <button
                      key={template.key}
                      type="button"
                      onClick={() => applyTemplate(template.key)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        isActive
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-white">{template.label}</p>
                        <Badge variant="secondary">{template.serviceType}</Badge>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{template.summary}</p>
                    </button>
                  );
                })}
              </div>
            </CardHeader>

            <CardContent>
              <form className="space-y-5" onSubmit={submit}>
                <FormBanner message={formFeedback?.summary} />
                <div className="space-y-2">
                  <Label htmlFor="service-title">Title</Label>
                  <Input
                    id="service-title"
                    className={fieldError("title") ? errorFieldClassName : undefined}
                    value={form.title}
                    onChange={(e) => updateFormField("title", e.target.value)}
                    placeholder="Build a production-ready n8n workflow for lead routing and alerts"
                    aria-invalid={Boolean(fieldError("title"))}
                    required
                  />
                  <FieldErrorText message={fieldError("title")} />
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Strong example: "Rescue a failing n8n workflow and add clear alerting and handoff notes."
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service-included">What is included</Label>
                  <Textarea
                    id="service-included"
                    className={cn("min-h-[150px]", fieldError("included", ["features", "desc"]) && errorFieldClassName)}
                    value={form.included}
                    onChange={(e) => updateFormField("included", e.target.value)}
                    placeholder={"One item per line\nWorkflow implementation\nRetries and alerting\nTesting pass\nLaunch notes or runbook"}
                    aria-invalid={Boolean(fieldError("included", ["features", "desc"]))}
                    required
                  />
                  <FieldErrorText message={fieldError("included", ["features", "desc"])} />
                  <p className="text-xs text-[var(--color-text-muted)]">Write one deliverable or step per line so the offer reads like a scoped package.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service-best-for">Best for</Label>
                  <Textarea
                    id="service-best-for"
                    className={cn("min-h-[110px]", fieldError("bestFor", ["desc"]) && errorFieldClassName)}
                    value={form.bestFor}
                    onChange={(e) => updateFormField("bestFor", e.target.value)}
                    placeholder="Best for teams that already know the workflow outcome they need and want a builder to deliver the first strong version end to end."
                    aria-invalid={Boolean(fieldError("bestFor", ["desc"]))}
                    required
                  />
                  <FieldErrorText message={fieldError("bestFor", ["desc"])} />
                  <p className="text-xs text-[var(--color-text-muted)]">This becomes the short client-facing summary when the service card is rendered.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="service-price">Price</Label>
                    <Input
                      id="service-price"
                      type="number"
                      min="1"
                      className={fieldError("price") ? errorFieldClassName : undefined}
                      value={form.price}
                      onChange={(e) => updateFormField("price", e.target.value)}
                      aria-invalid={Boolean(fieldError("price"))}
                      required
                    />
                    <FieldErrorText message={fieldError("price")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service-delivery-days">Delivery days</Label>
                    <Input
                      id="service-delivery-days"
                      type="number"
                      min="1"
                      className={fieldError("deliveryTime") ? errorFieldClassName : undefined}
                      value={form.deliveryTime}
                      onChange={(e) => updateFormField("deliveryTime", e.target.value)}
                      aria-invalid={Boolean(fieldError("deliveryTime"))}
                      required
                    />
                    <FieldErrorText message={fieldError("deliveryTime")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service-revisions">Revisions</Label>
                    <Input
                      id="service-revisions"
                      type="number"
                      min="0"
                      className={fieldError("revisionNumber") ? errorFieldClassName : undefined}
                      value={form.revisionNumber}
                      onChange={(e) => updateFormField("revisionNumber", e.target.value)}
                      aria-invalid={Boolean(fieldError("revisionNumber"))}
                      required
                    />
                    <FieldErrorText message={fieldError("revisionNumber")} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service-cover-url">Cover URL (optional)</Label>
                  <Input
                    id="service-cover-url"
                    className={fieldError("cover") ? errorFieldClassName : undefined}
                    value={form.cover}
                    onChange={(e) => updateFormField("cover", e.target.value)}
                    placeholder="https://..."
                    aria-invalid={Boolean(fieldError("cover"))}
                  />
                  <FieldErrorText message={fieldError("cover")} />
                  <p className="text-xs text-[var(--color-text-muted)]">Leave this blank to use the generated n8nExperts fallback visual.</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-[var(--color-text-secondary)]">
                  <p className="font-semibold text-white">Client reading check</p>
                  <p className="mt-2">
                    A client should understand the job to be done, who the offer is best for, the price, and the delivery window within a few seconds.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={saving} className="inline-flex items-center gap-2">
                    {editingId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {saving ? "Saving..." : editingId ? "Update service" : "Publish service"}
                  </Button>
                  {(editingId || selectedTemplate) && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Clear form
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="inline-flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Live card preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ServiceVisual
                  title={resolveServiceShortTitle({ title: form.title, shortTitle: previewShortTitle })}
                  shortDesc={previewShortDesc}
                  cover={form.cover.trim() || undefined}
                  price={form.price}
                  deliveryTime={form.deliveryTime}
                  serviceType={form.serviceType}
                  className="h-[260px]"
                />
                <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">Short title</p>
                    <p className="mt-2 font-semibold text-white">{previewShortTitle || "Add a service title"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">Short description</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                      {previewShortDesc || "Add a best-fit note or a few included items to generate a client-facing summary."}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">Included</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {includedItems.length === 0 && <span className="text-sm text-[var(--color-text-secondary)]">No items yet.</span>}
                      {includedItems.map((item) => (
                        <Badge key={item} variant="secondary">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Published services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading && <p className="text-sm text-[var(--color-text-muted)]">Loading services...</p>}
                {!loading && services.length === 0 && (
                  <EmptyState
                    title="No services published yet."
                    description="Start with one offer that clients can compare quickly. You do not need a full menu."
                    action={
                      <Button type="button" variant="outline" onClick={() => applyTemplate("build")}>
                        Load build template
                      </Button>
                    }
                    className="py-4"
                  />
                )}
                {services.map((service) => (
                  <article key={service._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="grid gap-4">
                      <ServiceVisual
                        title={resolveServiceShortTitle(service)}
                        shortDesc={resolveServiceShortDesc(service)}
                        cover={service.cover}
                        price={service.price}
                        deliveryTime={service.deliveryTime}
                        serviceType={service.serviceType}
                        className="h-[180px]"
                      />
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-white">{service.title}</p>
                            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{resolveServiceShortDesc(service)}</p>
                          </div>
                          <Badge variant={service.isActive ? "success" : "outline"}>{service.isActive ? "Active" : "Inactive"}</Badge>
                        </div>
                        {service.features && service.features.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {service.features.slice(0, 4).map((item) => (
                              <Badge key={item} variant="secondary">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm text-[var(--color-text-secondary)]">
                          <span>${service.price}</span>
                          <span>{service.deliveryTime} days</span>
                          <span>{service.revisionNumber} revisions</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => editService(service)} className="inline-flex items-center gap-1.5">
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => removeService(service._id)} className="inline-flex items-center gap-1.5">
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </CardContent>
            </Card>
          </div>

          <ContextAside
            eyebrow="Service guidance"
            title="Write for the client's skim pass."
            description="Clients usually read the card before they open a conversation. Help them decide whether the offer fits the job they have in mind."
          >
            <div className="space-y-3 text-sm text-[var(--color-text-secondary)]">
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <p className="font-semibold text-white">Templates get you moving</p>
                <p className="mt-2">Audit, build, rescue, and consulting templates are starting points. Replace the generic language with your actual process.</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <p className="font-semibold text-white">Cover images are optional</p>
                <p className="mt-2">The generated fallback card keeps the listing branded and readable even if you skip custom artwork.</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <p className="font-semibold text-white">One strong service is enough</p>
                <p className="mt-2">If your profile is still early, publish one clear offer and connect it to a work sample in your setup flow.</p>
              </div>
              <Link to="/expert/setup" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:underline">
                <Sparkles className="h-4 w-4" />
                Continue expert setup
              </Link>
            </div>
          </ContextAside>
        </div>
      </div>
    </div>
  );
}
