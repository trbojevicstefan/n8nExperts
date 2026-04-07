import { useState } from "react"
import { CheckCircle, XCircle, Eye, Info, Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { usePageMeta } from "@/hooks/usePageMeta"

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

export default function VerificationQueue() {
  usePageMeta({
    title: "Verification Queue | Admin",
    description: "Review and approve expert profiles awaiting verification.",
  });

  const [selectedExpert, setSelectedExpert] = useState<typeof pendingExperts[0] | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  const handleApprove = (expertId: string) => {
    console.log("Approving", expertId)
    setSelectedExpert(null)
  }

  const handleReject = () => {
    console.log("Rejecting with reason:", rejectReason)
    setShowRejectDialog(false)
    setSelectedExpert(null)
    setRejectReason("")
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0a0a0b] text-white pt-10 pb-20 relative px-4 md:px-8">
      {/* Background Decor */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 z-0"
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }}
      ></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-10 border-b border-white/10 pb-6 flex items-center justify-between">
          <div>
             <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
               <span className="material-symbols-outlined text-emerald-400 text-3xl">how_to_reg</span>
               Verification Queue
             </h1>
             <p className="text-slate-400 mt-2 text-lg">Review and approve pending expert applications</p>
          </div>
          <div className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-full flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-primary font-bold">{pendingExperts.length} Pending</span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Queue List (Left panel) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            {pendingExperts.map((expert) => (
              <div
                key={expert.id}
                className={cn(
                  "p-5 rounded-2xl border transition-all cursor-pointer group hover:bg-white/[0.04] bg-[#1e1e1e]",
                  selectedExpert?.id === expert.id ? "border-emerald-500/50" : "border-white/10 hover:border-white/20"
                )}
                onClick={() => setSelectedExpert(expert)}
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <Avatar fallback={expert.name} className="w-14 h-14 border border-white/10" />
                    <div className="absolute -bottom-1 -right-1 size-5 bg-amber-400 rounded-full border-2 border-[#1e1e1e] flex items-center justify-center">
                       <AlertCircle className="w-3 h-3 text-black" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-white text-lg group-hover:text-emerald-400 transition-colors">{expert.name}</h3>
                      <span className="text-xs font-medium text-slate-500 bg-black/40 px-2 py-1 rounded-full border border-white/5">
                        {new Date(expert.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed mb-3">{expert.bio}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                      <span className="bg-white/5 border border-white/10 text-emerald-300 px-2.5 py-1 rounded-full">
                         ${expert.hourlyRate}/hr
                      </span>
                      <span className="bg-white/5 border border-white/10 text-slate-300 px-2.5 py-1 rounded-full">
                         {expert.country}
                      </span>
                      <span className="bg-white/5 border border-white/10 text-slate-300 px-2.5 py-1 rounded-full flex items-center gap-1">
                         <span className="material-symbols-outlined text-[14px]">folder</span>
                         {expert.portfolio.length} items
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {pendingExperts.length === 0 && (
              <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-emerald-500/50" />
                <h3 className="text-xl font-bold text-white">All caught up!</h3>
                <p className="text-slate-400 mt-2">There are no pending applications.</p>
              </div>
            )}
          </div>

          {/* Detail Panel (Right panel) */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-24 rounded-3xl border border-white/10 bg-white/[0.02] shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col max-h-[calc(100vh-8rem)]">
              {selectedExpert ? (
                <>
                  <div className="p-6 border-b border-white/10 bg-white/[0.02]">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                       <Info className="w-5 h-5 text-emerald-400" /> Review Application
                    </h2>
                  </div>
                  
                  <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                    <div className="flex items-center gap-4">
                      <Avatar fallback={selectedExpert.name} className="w-20 h-20 border-2 border-emerald-500/20" />
                      <div>
                        <h3 className="font-extrabold text-2xl text-white tracking-tight">{selectedExpert.name}</h3>
                        <p className="text-sm font-medium text-slate-400">{selectedExpert.email}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-widest text-slate-500 mb-3">Bio & Experience</h4>
                      <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                        <p className="text-sm text-slate-300 leading-relaxed">{selectedExpert.bio}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-widest text-slate-500 mb-3">Profile Data</h4>
                      <div className="space-y-3 bg-black/30 p-4 rounded-xl border border-white/5">
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                          <span className="text-slate-400 text-sm">Hourly Rate</span>
                          <span className="font-bold text-emerald-400">${selectedExpert.hourlyRate}/hr</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                          <span className="text-slate-400 text-sm">Location</span>
                          <span className="font-bold text-white">{selectedExpert.country}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-sm">Portfolio Size</span>
                          <span className="font-bold text-white">{selectedExpert.portfolio.length} Projects</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-widest text-slate-500 mb-3">Portfolio Submission</h4>
                      <div className="space-y-3">
                        {selectedExpert.portfolio.map((item, index) => (
                          <div key={index} className="p-4 rounded-xl bg-[#1e1e1e] border border-white/5 hover:border-white/10 transition-colors">
                            <p className="font-bold text-white text-sm mb-1">{item.title}</p>
                            <p className="text-xs text-slate-400">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border-t border-white/10 bg-black/40 flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 bg-white/5 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 h-12 font-bold"
                      onClick={() => setShowRejectDialog(true)}
                    >
                      <XCircle className="h-4 w-4 mr-2" /> Reject
                    </Button>
                    <Button
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] h-12 font-bold"
                      onClick={() => handleApprove(selectedExpert.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" /> Approve
                    </Button>
                  </div>
                </>
              ) : (
                <div className="h-[400px] flex flex-col items-center justify-center text-slate-500 p-8">
                  <Eye className="h-16 w-16 mb-4 text-white/10" />
                  <p className="text-lg font-bold text-white">Select Application</p>
                  <p className="text-sm text-center mt-2 text-slate-400">Click on an expert from the queue to review their details.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reject Dialog - Styled Dark */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent className="bg-[#1e1e1e] border-white/10 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-400 flex items-center gap-2">
                 <XCircle className="h-5 w-5" /> Reject Application
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Please provide a reason for rejection. This will be sent directly to the applicant.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="reason" className="text-slate-300 font-bold uppercase text-xs tracking-wider">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="Explain why this profile does not meet the standards..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mt-2 min-h-[120px] bg-black/40 border-white/10 text-white focus:ring-red-500 focus:border-transparent placeholder:text-slate-600"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectDialog(false)} className="bg-transparent border-white/20 text-white hover:bg-white/5">
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject} className="bg-red-500 hover:bg-red-600 font-bold">
                Confirm Rejection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
