import { useState } from "react"
import { CheckCircle, XCircle, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

// Mock data
const pendingExperts = [
    {
        id: "1",
        name: "John Smith",
        email: "john@example.com",
        bio: "5+ years experience with n8n and workflow automation. Previously at Acme Corp as a senior developer. Specialized in API integrations and data processing.",
        hourlyRate: 65,
        portfolio: [
            { title: "E-commerce Automation", description: "Built complete order processing system" },
            { title: "CRM Integration", description: "Connected HubSpot with Slack and email" },
        ],
        submittedAt: "2024-01-18T10:00:00Z",
        country: "United States",
    },
    {
        id: "2",
        name: "Lisa Chen",
        email: "lisa@example.com",
        bio: "Automation specialist with focus on AI-powered workflows. Expert in n8n, Make, and Zapier. Helped 20+ businesses streamline their operations.",
        hourlyRate: 85,
        portfolio: [
            { title: "AI Content Pipeline", description: "Automated content generation workflow" },
        ],
        submittedAt: "2024-01-17T14:30:00Z",
        country: "Canada",
    },
]

// const recentlyReviewed = [
//     { id: "1", name: "Mike Johnson", status: "approved", reviewedAt: "2024-01-16" },
//     { id: "2", name: "Sarah Lee", status: "rejected", reviewedAt: "2024-01-15" },
// ]

export default function VerificationQueue() {
    const [selectedExpert, setSelectedExpert] = useState<typeof pendingExperts[0] | null>(null)
    const [showRejectDialog, setShowRejectDialog] = useState(false)
    const [rejectReason, setRejectReason] = useState("")

    const handleApprove = (expertId: string) => {
        // Handle approval
        console.log("Approving", expertId)
        setSelectedExpert(null)
    }

    const handleReject = () => {
        // Handle rejection
        console.log("Rejecting with reason:", rejectReason)
        setShowRejectDialog(false)
        setSelectedExpert(null)
        setRejectReason("")
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Expert Verification Queue</h1>
                <p className="text-slate-600 mt-1">Review and approve pending expert applications</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Queue List */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Pending ({pendingExperts.length})</CardTitle>
                                <Badge variant="warning">{pendingExperts.length} awaiting review</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {pendingExperts.map((expert) => (
                                <div
                                    key={expert.id}
                                    className={cn(
                                        "p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                                        selectedExpert?.id === expert.id && "ring-2 ring-primary"
                                    )}
                                    onClick={() => setSelectedExpert(expert)}
                                >
                                    <div className="flex items-start gap-4">
                                        <Avatar fallback={expert.name} />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-slate-900">{expert.name}</h3>
                                                <span className="text-sm text-slate-500">
                                                    {new Date(expert.submittedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600 mt-1 line-clamp-2">{expert.bio}</p>
                                            <div className="flex items-center gap-4 mt-2 text-sm">
                                                <span className="text-primary font-semibold">${expert.hourlyRate}/hr</span>
                                                <span className="text-slate-500">{expert.country}</span>
                                                <span className="text-slate-500">{expert.portfolio.length} portfolio items</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {pendingExperts.length === 0 && (
                                <div className="text-center py-8 text-slate-500">
                                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                                    <p>All caught up! No pending applications.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Detail Panel */}
                <div>
                    {selectedExpert ? (
                        <Card className="sticky top-20">
                            <CardHeader>
                                <CardTitle>Review Application</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <Avatar fallback={selectedExpert.name} className="w-16 h-16" />
                                    <div>
                                        <h3 className="font-semibold text-lg">{selectedExpert.name}</h3>
                                        <p className="text-sm text-slate-500">{selectedExpert.email}</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium text-sm text-slate-700 mb-2">Bio</h4>
                                    <p className="text-sm text-slate-600">{selectedExpert.bio}</p>
                                </div>

                                <div>
                                    <h4 className="font-medium text-sm text-slate-700 mb-2">Details</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Hourly Rate</span>
                                            <span className="font-medium">${selectedExpert.hourlyRate}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Country</span>
                                            <span>{selectedExpert.country}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Portfolio Items</span>
                                            <span>{selectedExpert.portfolio.length}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium text-sm text-slate-700 mb-2">Portfolio</h4>
                                    <div className="space-y-2">
                                        {selectedExpert.portfolio.map((item, index) => (
                                            <div key={index} className="p-3 rounded-lg bg-slate-50">
                                                <p className="font-medium text-sm">{item.title}</p>
                                                <p className="text-xs text-slate-500">{item.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1 text-red-600 hover:text-red-700"
                                        onClick={() => setShowRejectDialog(true)}
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject
                                    </Button>
                                    <Button
                                        className="flex-1"
                                        onClick={() => handleApprove(selectedExpert.id)}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="p-8 text-center text-slate-500">
                                <Eye className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                                <p>Select an application to review</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Reject Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Application</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejection. This will be sent to the applicant.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="reason">Reason</Label>
                        <Textarea
                            id="reason"
                            placeholder="Explain why this application is being rejected..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="mt-2 min-h-[100px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleReject}>
                            Reject Application
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
