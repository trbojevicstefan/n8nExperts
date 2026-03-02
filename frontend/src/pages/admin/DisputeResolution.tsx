import { useState } from "react"
import { AlertTriangle, MessageSquare, DollarSign, CheckCircle, Clock, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

// Mock data
const disputes = [
    {
        id: "1",
        type: "milestone_dispute",
        title: "Milestone not completed as agreed",
        projectTitle: "E-commerce Automation Project",
        clientName: "Sarah Chen",
        expertName: "Alex Thompson",
        amount: 250,
        status: "open",
        createdAt: "2024-01-18T10:00:00Z",
        description: "The expert claims the milestone is complete, but several key deliverables are missing from the requirements document.",
        messages: [
            { sender: "client", content: "The workflow doesn't handle error cases as specified.", time: "2 days ago" },
            { sender: "expert", content: "I've implemented error handling according to the initial requirements.", time: "1 day ago" },
        ],
    },
    {
        id: "2",
        type: "payment_issue",
        title: "Payment not received",
        projectTitle: "CRM Integration Project",
        clientName: "Marcus Johnson",
        expertName: "Maria Garcia",
        amount: 500,
        status: "pending",
        createdAt: "2024-01-15T14:30:00Z",
        description: "Expert completed all milestones but payment has been stuck for over a week.",
        messages: [],
    },
]

const statusColors: Record<string, "destructive" | "warning" | "success"> = {
    open: "destructive",
    pending: "warning",
    resolved: "success",
}

export default function DisputeResolution() {
    const [selectedDispute, setSelectedDispute] = useState<typeof disputes[0] | null>(null)
    const [showResolveDialog, setShowResolveDialog] = useState(false)
    const [resolution, setResolution] = useState({
        decision: "",
        clientAmount: "",
        expertAmount: "",
        notes: "",
    })

    const handleResolve = () => {
        // Handle resolution
        console.log("Resolving dispute:", resolution)
        setShowResolveDialog(false)
        setSelectedDispute(null)
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Dispute Resolution Center</h1>
                <p className="text-slate-600 mt-1">Review and resolve disputes between clients and experts</p>
            </div>

            <Tabs defaultValue="open">
                <TabsList>
                    <TabsTrigger value="open">Open ({disputes.filter(d => d.status === "open").length})</TabsTrigger>
                    <TabsTrigger value="pending">Pending ({disputes.filter(d => d.status === "pending").length})</TabsTrigger>
                    <TabsTrigger value="resolved">Resolved</TabsTrigger>
                </TabsList>

                <TabsContent value="open" className="mt-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Dispute List */}
                        <div className="lg:col-span-2 space-y-4">
                            {disputes
                                .filter((d) => d.status === "open")
                                .map((dispute) => (
                                    <Card
                                        key={dispute.id}
                                        className={cn(
                                            "cursor-pointer transition-all hover:shadow-md",
                                            selectedDispute?.id === dispute.id && "ring-2 ring-primary"
                                        )}
                                        onClick={() => setSelectedDispute(dispute)}
                                    >
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                                                        <AlertTriangle className="h-5 w-5 text-red-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-slate-900">{dispute.title}</h3>
                                                        <p className="text-sm text-slate-600 mt-1">{dispute.projectTitle}</p>
                                                    </div>
                                                </div>
                                                <Badge variant={statusColors[dispute.status]}>
                                                    {dispute.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-6 mt-4 text-sm">
                                                <span className="text-slate-500">
                                                    {dispute.clientName} vs {dispute.expertName}
                                                </span>
                                                <span className="flex items-center gap-1 font-semibold text-primary">
                                                    <DollarSign className="h-4 w-4" />
                                                    ${dispute.amount} disputed
                                                </span>
                                                <span className="flex items-center gap-1 text-slate-400">
                                                    <Clock className="h-4 w-4" />
                                                    {new Date(dispute.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                        </div>

                        {/* Detail Panel */}
                        <div>
                            {selectedDispute ? (
                                <Card className="sticky top-20">
                                    <CardHeader>
                                        <CardTitle>Dispute Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Parties */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Avatar fallback={selectedDispute.clientName} size="sm" />
                                                <div>
                                                    <p className="text-sm font-medium">{selectedDispute.clientName}</p>
                                                    <p className="text-xs text-slate-500">Client</p>
                                                </div>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-slate-400" />
                                            <div className="flex items-center gap-2">
                                                <div className="text-right">
                                                    <p className="text-sm font-medium">{selectedDispute.expertName}</p>
                                                    <p className="text-xs text-slate-500">Expert</p>
                                                </div>
                                                <Avatar fallback={selectedDispute.expertName} size="sm" />
                                            </div>
                                        </div>

                                        {/* Amount */}
                                        <div className="p-4 bg-slate-50 rounded-lg text-center">
                                            <p className="text-sm text-slate-500">Disputed Amount</p>
                                            <p className="text-2xl font-bold text-primary">${selectedDispute.amount}</p>
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <h4 className="font-medium text-sm text-slate-700 mb-2">Issue Description</h4>
                                            <p className="text-sm text-slate-600">{selectedDispute.description}</p>
                                        </div>

                                        {/* Messages */}
                                        {selectedDispute.messages.length > 0 && (
                                            <div>
                                                <h4 className="font-medium text-sm text-slate-700 mb-2">
                                                    <MessageSquare className="h-4 w-4 inline mr-1" />
                                                    Discussion
                                                </h4>
                                                <div className="space-y-2">
                                                    {selectedDispute.messages.map((msg, index) => (
                                                        <div key={index} className="p-3 rounded-lg bg-slate-50">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-xs font-medium capitalize">{msg.sender}</span>
                                                                <span className="text-xs text-slate-400">{msg.time}</span>
                                                            </div>
                                                            <p className="text-sm text-slate-600">{msg.content}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <Button variant="outline" className="flex-1">
                                                <MessageSquare className="h-4 w-4 mr-2" />
                                                Contact
                                            </Button>
                                            <Button className="flex-1" onClick={() => setShowResolveDialog(true)}>
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Resolve
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card>
                                    <CardContent className="p-8 text-center text-slate-500">
                                        <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                                        <p>Select a dispute to review</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="pending" className="mt-6">
                    <Card>
                        <CardContent className="p-8 text-center text-slate-500">
                            <Clock className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                            <p>Pending disputes require additional information</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="resolved" className="mt-6">
                    <Card>
                        <CardContent className="p-8 text-center text-slate-500">
                            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                            <p>View resolved dispute history</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Resolve Dialog */}
            <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Resolve Dispute</DialogTitle>
                        <DialogDescription>
                            Determine how the disputed funds should be distributed.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Amount to Client</Label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={resolution.clientAmount}
                                    onChange={(e) => setResolution((prev) => ({ ...prev, clientAmount: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Amount to Expert</Label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={resolution.expertAmount}
                                    onChange={(e) => setResolution((prev) => ({ ...prev, expertAmount: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Resolution Notes</Label>
                            <Textarea
                                placeholder="Explain the reasoning behind this decision..."
                                value={resolution.notes}
                                onChange={(e) => setResolution((prev) => ({ ...prev, notes: e.target.value }))}
                                className="min-h-[100px]"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowResolveDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleResolve}>
                            Confirm Resolution
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
