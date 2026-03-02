import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, AlertTriangle, Send, Upload, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
// import { Badge } from "@/components/ui/badge"

const issueTypes = [
    { value: "milestone_dispute", label: "Milestone Dispute" },
    { value: "payment_issue", label: "Payment Issue" },
    { value: "quality_concern", label: "Quality Concern" },
    { value: "communication", label: "Communication Problem" },
    { value: "other", label: "Other" },
]

export default function DisputeCenter() {
    const { id } = useParams()
    const [formData, setFormData] = useState({
        issueType: "",
        title: "",
        description: "",
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [ticketId, setTicketId] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        await new Promise((resolve) => setTimeout(resolve, 1500))
        setIsSubmitting(false)
        setTicketId(`DSP-${Date.now().toString().slice(-6)}`)
        setSubmitted(true)
    }

    if (submitted) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Link to={`/workspace/${id}`} className="text-sm text-slate-600 hover:text-primary flex items-center gap-1 mb-8">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Workspace
                </Link>
                <Card className="max-w-xl mx-auto">
                    <CardContent className="p-8 text-center">
                        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-amber-100 mb-4">
                            <MessageSquare className="h-8 w-8 text-amber-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Issue Submitted</h2>
                        <p className="text-slate-600 mt-2">
                            Our support team has received your issue and will respond within 24-48 hours.
                        </p>
                        <div className="mt-6 p-4 bg-slate-50 rounded-lg text-left">
                            <p className="text-sm font-medium text-slate-700">Ticket ID: #{ticketId}</p>
                            <p className="text-sm text-slate-500 mt-1">You'll receive updates via email and in your messages.</p>
                        </div>
                        <Link to={`/workspace/${id}`}>
                            <Button className="mt-6">Return to Workspace</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Link to={`/workspace/${id}`} className="text-sm text-slate-600 hover:text-primary flex items-center gap-1 mb-8">
                <ArrowLeft className="h-4 w-4" />
                Back to Workspace
            </Link>

            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                        <AlertTriangle className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Report an Issue</h1>
                        <p className="text-slate-600">Tell us what went wrong and we'll help resolve it</p>
                    </div>
                </div>

                {/* Warning */}
                <Card className="border-amber-200 bg-amber-50 mb-6">
                    <CardContent className="p-4 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-amber-800">Before filing a dispute</p>
                            <p className="text-sm text-amber-700 mt-1">
                                We recommend first trying to resolve the issue directly with the other party through chat.
                                Our support team may ask if you've attempted direct communication.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Issue Details</CardTitle>
                            <CardDescription>Provide as much detail as possible to help us resolve this quickly</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Issue Type */}
                            <div className="space-y-2">
                                <Label>Issue Type</Label>
                                <Select
                                    value={formData.issueType}
                                    onValueChange={(v) => setFormData((prev) => ({ ...prev, issueType: v }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select issue type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {issueTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title">Subject</Label>
                                <Input
                                    id="title"
                                    placeholder="Brief summary of the issue"
                                    value={formData.title}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Describe the issue in detail. Include:&#10;• What happened&#10;• What you expected&#10;• Any relevant dates or amounts"
                                    value={formData.description}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                    className="min-h-[150px]"
                                    required
                                />
                            </div>

                            {/* Evidence Upload */}
                            <div className="space-y-2">
                                <Label>Supporting Evidence (Optional)</Label>
                                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                                    <p className="text-sm text-slate-600">Upload screenshots, documents, or other evidence</p>
                                    <p className="text-xs text-slate-400 mt-1">Max 5 files, 5MB each</p>
                                </div>
                            </div>

                            {/* Submit */}
                            <Button type="submit" size="lg" className="w-full gap-2" disabled={isSubmitting}>
                                <Send className="h-4 w-4" />
                                {isSubmitting ? "Submitting..." : "Submit Issue"}
                            </Button>

                            <p className="text-xs text-center text-slate-500">
                                By submitting, you agree to our{" "}
                                <Link to="/terms" className="text-primary hover:underline">
                                    Dispute Resolution Policy
                                </Link>
                            </p>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </div>
    )
}
