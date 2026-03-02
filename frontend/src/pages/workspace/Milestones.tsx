import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, DollarSign, Check, Clock, AlertTriangle, Upload, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

// Mock data
const milestonesData = [
    {
        id: "1",
        title: "Project Setup & Requirements",
        description: "Set up the n8n instance, configure integrations, and document all API requirements.",
        amount: 100,
        status: "completed",
        dueDate: "2024-01-20",
        completedDate: "2024-01-18",
        deliverables: ["n8n instance configured", "API documentation reviewed", "Requirements document"],
    },
    {
        id: "2",
        title: "Workflow Development",
        description: "Build the main automation workflows according to the approved requirements.",
        amount: 250,
        status: "in_progress",
        dueDate: "2024-01-30",
        completedDate: null,
        deliverables: ["Main workflow completed", "Error handling implemented", "Logging configured"],
    },
    {
        id: "3",
        title: "Testing & Deployment",
        description: "Test all workflows thoroughly and deploy to production environment.",
        amount: 150,
        status: "pending",
        dueDate: "2024-02-05",
        completedDate: null,
        deliverables: ["Testing complete", "Deployed to production", "Handoff documentation"],
    },
]

const statusConfig: Record<string, { color: "success" | "warning" | "secondary"; icon: typeof Check }> = {
    completed: { color: "success", icon: Check },
    in_progress: { color: "warning", icon: Clock },
    pending: { color: "secondary", icon: Clock },
}

export default function Milestones() {
    const { id } = useParams()
    const [selectedMilestone, setSelectedMilestone] = useState<typeof milestonesData[0] | null>(null)
    const [showSubmitDialog, setShowSubmitDialog] = useState(false)
    const [deliveryNote, setDeliveryNote] = useState("")

    const totalBudget = milestonesData.reduce((sum, m) => sum + m.amount, 0)
    const releasedAmount = milestonesData.filter((m) => m.status === "completed").reduce((sum, m) => sum + m.amount, 0)
    const escrowAmount = totalBudget - releasedAmount

    const handleSubmitMilestone = () => {
        // Handle submission
        setShowSubmitDialog(false)
        setDeliveryNote("")
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <Link to={`/workspace/${id}`} className="text-sm text-slate-600 hover:text-primary flex items-center gap-1 mb-4">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Workspace
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">Milestones & Payments</h1>
                <p className="text-slate-600 mt-1">Track project progress and manage payments</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Milestones List */}
                <div className="lg:col-span-2 space-y-4">
                    {milestonesData.map((milestone, index) => {
                        const config = statusConfig[milestone.status]
                        const StatusIcon = config.icon
                        return (
                            <Card
                                key={milestone.id}
                                className={cn(
                                    "cursor-pointer transition-all hover:shadow-md",
                                    selectedMilestone?.id === milestone.id && "ring-2 ring-primary"
                                )}
                                onClick={() => setSelectedMilestone(milestone)}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div
                                            className={cn(
                                                "flex h-10 w-10 items-center justify-center rounded-full shrink-0",
                                                milestone.status === "completed"
                                                    ? "bg-green-100"
                                                    : milestone.status === "in_progress"
                                                        ? "bg-amber-100"
                                                        : "bg-slate-100"
                                            )}
                                        >
                                            <StatusIcon
                                                className={cn(
                                                    "h-5 w-5",
                                                    milestone.status === "completed"
                                                        ? "text-green-600"
                                                        : milestone.status === "in_progress"
                                                            ? "text-amber-600"
                                                            : "text-slate-400"
                                                )}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-slate-900">
                                                    Milestone {index + 1}: {milestone.title}
                                                </h3>
                                                <Badge variant={config.color}>
                                                    {milestone.status.replace("_", " ")}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-slate-600 mt-1">{milestone.description}</p>
                                            <div className="flex items-center gap-4 mt-3 text-sm">
                                                <span className="flex items-center gap-1 font-semibold text-primary">
                                                    <DollarSign className="h-4 w-4" />
                                                    ${milestone.amount}
                                                </span>
                                                <span className="text-slate-500">
                                                    Due: {new Date(milestone.dueDate).toLocaleDateString()}
                                                </span>
                                                {milestone.completedDate && (
                                                    <span className="text-green-600">
                                                        Completed: {new Date(milestone.completedDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Deliverables */}
                                    <div className="mt-4 pl-14">
                                        <p className="text-xs text-slate-500 mb-2">Deliverables:</p>
                                        <ul className="space-y-1">
                                            {milestone.deliverables.map((item, i) => (
                                                <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                                                    <div
                                                        className={cn(
                                                            "h-1.5 w-1.5 rounded-full",
                                                            milestone.status === "completed" ? "bg-green-500" : "bg-slate-300"
                                                        )}
                                                    />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Action Buttons */}
                                    {milestone.status === "in_progress" && (
                                        <div className="mt-4 pl-14">
                                            <Button onClick={() => setShowSubmitDialog(true)}>
                                                <Upload className="h-4 w-4 mr-2" />
                                                Submit for Review
                                            </Button>
                                        </div>
                                    )}
                                    {milestone.status === "completed" && (
                                        <div className="mt-4 pl-14">
                                            <Button variant="outline" disabled>
                                                <FileText className="h-4 w-4 mr-2" />
                                                Funds Released
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {/* Sidebar - Payment Summary */}
                <div className="space-y-4">
                    <Card className="sticky top-20">
                        <CardHeader>
                            <CardTitle>Payment Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Total Budget</span>
                                    <span className="font-semibold">${totalBudget}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Released</span>
                                    <span className="font-semibold text-green-600">${releasedAmount}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">In Escrow</span>
                                    <span className="font-semibold text-amber-600">${escrowAmount}</span>
                                </div>
                            </div>
                            <hr />
                            <div className="p-4 bg-slate-50 rounded-lg text-center">
                                <p className="text-xs text-slate-500 mb-1">Next Payment</p>
                                <p className="text-2xl font-bold text-primary">$250</p>
                                <p className="text-sm text-slate-600">on milestone completion</p>
                            </div>
                            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg text-sm">
                                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-amber-800">
                                    Funds are held in escrow until the client approves milestone delivery.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Submit Milestone Dialog */}
            <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Submit Milestone for Review</DialogTitle>
                        <DialogDescription>
                            Describe what you've completed and upload any deliverables.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Delivery Note</Label>
                            <Textarea
                                placeholder="Describe what you've completed and how it meets the requirements..."
                                value={deliveryNote}
                                onChange={(e) => setDeliveryNote(e.target.value)}
                                className="min-h-[100px]"
                            />
                        </div>
                        <div className="border-2 border-dashed rounded-lg p-6 text-center">
                            <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm text-slate-600">Drag & drop files or click to upload</p>
                            <p className="text-xs text-slate-400 mt-1">Deliverables, screenshots, documentation</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmitMilestone}>Submit for Review</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
