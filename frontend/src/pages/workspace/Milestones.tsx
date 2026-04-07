import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, DollarSign, Check, Clock, AlertTriangle, Upload, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
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

export default function Milestones() {
    const { id } = useParams()
    const [selectedMilestone, setSelectedMilestone] = useState<typeof milestonesData[0] | null>(null)
    const [showSubmitDialog, setShowSubmitDialog] = useState(false)
    const [deliveryNote, setDeliveryNote] = useState("")

    const totalBudget = milestonesData.reduce((sum, m) => sum + m.amount, 0)
    const releasedAmount = milestonesData.filter((m) => m.status === "completed").reduce((sum, m) => sum + m.amount, 0)
    const escrowAmount = totalBudget - releasedAmount

    const handleSubmitMilestone = () => {
        setShowSubmitDialog(false)
        setDeliveryNote("")
    }

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-100 min-h-screen bg-grid overflow-x-hidden">
            <main className="px-6 lg:px-20 py-12 lg:py-16 max-w-[1400px] mx-auto w-full">
                {/* Header */}
                <div className="mb-12">
                    <Link
                        to={`/workspace/${id}`}
                        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-primary transition-colors mb-6 font-medium group"
                    >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Workspace
                    </Link>
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/80 mb-2">Job Control Center</p>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Milestones & Payments</h1>
                            <p className="text-slate-400 mt-3 text-base font-medium">Track project progress and manage escrow payments</p>
                        </div>
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-400">
                            <span className="size-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                            Escrow Active
                        </div>
                    </div>
                </div>

                <div className="grid gap-10 lg:grid-cols-3">
                    {/* Milestones List */}
                    <div className="lg:col-span-2 space-y-6">
                        {milestonesData.map((milestone, index) => {
                            const isCompleted = milestone.status === "completed"
                            const isInProgress = milestone.status === "in_progress"
                            const isPending = milestone.status === "pending"
                            const isSelected = selectedMilestone?.id === milestone.id

                            return (
                                <div
                                    key={milestone.id}
                                    className={cn(
                                        "glass-card rounded-3xl p-8 border transition-all cursor-pointer group bg-[#1e1316]/70 backdrop-blur-md",
                                        isSelected
                                            ? "border-primary/60 shadow-[0_0_30px_rgba(244,37,89,0.2)]"
                                            : "border-white/10 hover:border-white/20 hover:bg-white/5"
                                    )}
                                    onClick={() => setSelectedMilestone(milestone)}
                                >
                                    <div className="flex items-start gap-6">
                                        {/* Step Indicator */}
                                        <div
                                            className={cn(
                                                "flex size-12 items-center justify-center rounded-2xl shrink-0 border",
                                                isCompleted
                                                    ? "bg-emerald-500/20 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                                    : isInProgress
                                                        ? "bg-primary/20 border-primary/50 shadow-[0_0_15px_rgba(244,37,89,0.3)]"
                                                        : "bg-white/5 border-white/10"
                                            )}
                                        >
                                            {isCompleted && <Check className="h-5 w-5 text-emerald-500" />}
                                            {isInProgress && <div className="size-3 bg-primary rounded-full animate-pulse" />}
                                            {isPending && <span className="text-xs font-black text-slate-500">{index + 1}</span>}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            {/* Title row */}
                                            <div className="flex items-center justify-between gap-4 mb-2">
                                                <h3 className={cn(
                                                    "font-bold text-lg",
                                                    isPending ? "text-slate-400" : "text-white"
                                                )}>
                                                    Milestone {index + 1}: {milestone.title}
                                                </h3>
                                                <span className={cn(
                                                    "text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider border shrink-0",
                                                    isCompleted
                                                        ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/30"
                                                        : isInProgress
                                                            ? "bg-primary/20 text-primary border-primary/30 shadow-[0_0_10px_rgba(244,37,89,0.2)]"
                                                            : "bg-white/5 text-slate-500 border-white/10"
                                                )}>
                                                    {milestone.status.replace("_", " ")}
                                                </span>
                                            </div>

                                            <p className={cn("text-sm leading-relaxed mb-4", isPending ? "text-slate-600" : "text-slate-400")}>
                                                {milestone.description}
                                            </p>

                                            {/* Meta row */}
                                            <div className="flex items-center gap-5 text-sm mb-5">
                                                <span className={cn(
                                                    "flex items-center gap-1.5 font-black text-base",
                                                    isCompleted ? "text-emerald-500" : isInProgress ? "text-primary" : "text-slate-500"
                                                )}>
                                                    <DollarSign className="h-4 w-4" />
                                                    {milestone.amount}
                                                </span>
                                                <span className="text-slate-500 flex items-center gap-1.5">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    Due: {new Date(milestone.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                </span>
                                                {milestone.completedDate && (
                                                    <span className="flex items-center gap-1.5 text-emerald-500 font-medium">
                                                        <Check className="h-3.5 w-3.5" />
                                                        Completed: {new Date(milestone.completedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Deliverables */}
                                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Deliverables</p>
                                                <ul className="space-y-2">
                                                    {milestone.deliverables.map((item, i) => (
                                                        <li key={i} className="flex items-center gap-3 text-sm">
                                                            <div className={cn(
                                                                "size-1.5 rounded-full shrink-0",
                                                                isCompleted ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" : "bg-white/20"
                                                            )} />
                                                            <span className={isCompleted ? "text-slate-300" : "text-slate-500"}>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Action Buttons */}
                                            {isInProgress && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setShowSubmitDialog(true); }}
                                                    className="flex items-center gap-2 px-5 py-3 bg-primary hover:brightness-110 text-white font-bold rounded-xl text-sm shadow-[0_0_20px_rgba(244,37,89,0.4)] transition-all"
                                                >
                                                    <Upload className="h-4 w-4" />
                                                    Submit for Review
                                                </button>
                                            )}
                                            {isCompleted && (
                                                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-bold rounded-xl text-sm w-fit">
                                                    <FileText className="h-4 w-4" />
                                                    Funds Released
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Sidebar - Payment Summary */}
                    <div className="space-y-6">
                        <div className="glass-card sticky top-24 rounded-3xl border border-white/10 bg-[#1e1316]/70 backdrop-blur-md overflow-hidden">
                            {/* Header */}
                            <div className="p-6 border-b border-white/10 bg-white/5 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                                <h2 className="font-bold text-white text-lg">Payment Summary</h2>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Amounts */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                                        <span className="text-slate-400 font-medium text-sm">Total Budget</span>
                                        <span className="font-black text-white text-lg">${totalBudget}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                                        <span className="text-slate-400 font-medium text-sm">Released</span>
                                        <span className="font-black text-emerald-500 text-lg">${releasedAmount}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3">
                                        <span className="text-slate-400 font-medium text-sm">In Escrow</span>
                                        <span className="font-black text-primary text-lg">${escrowAmount}</span>
                                    </div>
                                </div>

                                {/* Next Payment highlight */}
                                <div className="relative p-5 rounded-2xl overflow-hidden text-center border border-primary/30">
                                    <div className="absolute inset-0 bg-primary/10 pointer-events-none"></div>
                                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/20 rounded-full blur-2xl pointer-events-none"></div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-1">Next Payment</p>
                                    <p className="text-4xl font-black text-white tracking-tighter mb-1">$250</p>
                                    <p className="text-sm text-slate-400">on milestone completion</p>
                                </div>

                                {/* Escrow notice */}
                                <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-sm">
                                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-amber-400/90 leading-relaxed">
                                        Funds are held in escrow until the client approves milestone delivery.
                                    </p>
                                </div>

                                {/* Progress visual */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                                        <span>Progress</span>
                                        <span>{Math.round((releasedAmount / totalBudget) * 100)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full shadow-[0_0_10px_rgba(244,37,89,0.5)] transition-all duration-1000"
                                            style={{ width: `${(releasedAmount / totalBudget) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Submit Milestone Dialog */}
            <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                <DialogContent className="bg-[#131c28] border border-white/10 text-white rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.8)]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-white">Submit Milestone for Review</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Describe what you've completed and upload any deliverables.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-5 py-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-300 uppercase tracking-widest">Delivery Note</Label>
                            <Textarea
                                placeholder="Describe what you've completed and how it meets the requirements..."
                                value={deliveryNote}
                                onChange={(e) => setDeliveryNote(e.target.value)}
                                className="min-h-[120px] bg-[#0b141f] border-white/20 text-white placeholder-slate-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <div className="border-2 border-dashed border-white/20 hover:border-primary/50 rounded-2xl p-8 text-center transition-colors cursor-pointer group">
                            <Upload className="h-8 w-8 text-slate-500 group-hover:text-primary mx-auto mb-3 transition-colors" />
                            <p className="text-sm text-slate-400 font-medium">Drag & drop files or click to upload</p>
                            <p className="text-xs text-slate-600 mt-1">Deliverables, screenshots, documentation</p>
                        </div>
                    </div>
                    <DialogFooter className="gap-3">
                        <button
                            onClick={() => setShowSubmitDialog(false)}
                            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl text-sm transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmitMilestone}
                            className="px-5 py-2.5 bg-primary hover:brightness-110 text-white font-bold rounded-xl text-sm shadow-[0_0_15px_rgba(244,37,89,0.4)] transition-all"
                        >
                            Submit for Review
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
