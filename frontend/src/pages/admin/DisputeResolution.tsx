import { useState } from "react"
import { AlertTriangle, MessageSquare, DollarSign, CheckCircle, Clock, ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { usePageMeta } from "@/hooks/usePageMeta"

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

const statusColors: Record<string, "destructive" | "warning" | "success" | "outline"> = {
  open: "destructive",
  pending: "warning",
  resolved: "success",
}

export default function DisputeResolution() {
  usePageMeta({
    title: "Dispute Center | Admin",
    description: "Review and resolve active disputes securely.",
  });

  const [selectedDispute, setSelectedDispute] = useState<typeof disputes[0] | null>(null)
  const [showResolveDialog, setShowResolveDialog] = useState(false)
  const [resolution, setResolution] = useState({
    decision: "",
    clientAmount: "",
    expertAmount: "",
    notes: "",
  })

  const handleResolve = () => {
    console.log("Resolving dispute:", resolution)
    setShowResolveDialog(false)
    setSelectedDispute(null)
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
               <span className="material-symbols-outlined text-primary text-3xl">gavel</span>
               Dispute Resolution Center
             </h1>
             <p className="text-slate-400 mt-2 text-lg">Platform arbitration for active conflicts</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-full flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 font-bold">{disputes.filter(d => d.status === "open").length} Action Required</span>
          </div>
        </div>

        <Tabs defaultValue="open" className="w-full">
          <TabsList className="bg-white/5 border border-white/10 p-1 mb-8">
            <TabsTrigger value="open" className="data-[state=active]:bg-primary data-[state=active]:text-white text-slate-400 font-bold">
              Open ({disputes.filter(d => d.status === "open").length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400 font-bold">
              Pending ({disputes.filter(d => d.status === "pending").length})
            </TabsTrigger>
            <TabsTrigger value="resolved" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400 font-bold">
              Resolved
            </TabsTrigger>
          </TabsList>

          <TabsContent value="open" className="w-full">
            <div className="grid gap-8 lg:grid-cols-12">
              {/* Dispute List (Left Panel) */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                {disputes
                  .filter((d) => d.status === "open")
                  .map((dispute) => (
                    <div
                      key={dispute.id}
                      className={cn(
                        "p-6 rounded-2xl border transition-all cursor-pointer group bg-[#1e1e1e]",
                        selectedDispute?.id === dispute.id ? "border-primary shadow-[0_0_15px_rgba(244,37,89,0.2)]" : "border-white/10 hover:border-white/20 hover:bg-white/[0.04]"
                      )}
                      onClick={() => setSelectedDispute(dispute)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 group-hover:scale-105 transition-transform">
                            <AlertTriangle className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-lg leading-tight group-hover:text-primary transition-colors">{dispute.title}</h3>
                            <p className="text-sm font-medium text-slate-400 mt-1">{dispute.projectTitle}</p>
                          </div>
                        </div>
                        <Badge variant={statusColors[dispute.status] || "outline"} className="shrink-0 uppercase tracking-widest text-[10px]">
                          {dispute.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/5 mt-4">
                        <div className="flex items-center gap-2">
                           <span className="material-symbols-outlined text-slate-500 text-[18px]">group</span>
                           <span className="text-xs font-semibold text-slate-300 truncate" title={`${dispute.clientName} vs ${dispute.expertName}`}>
                             {dispute.clientName.split(" ")[0]} vs {dispute.expertName.split(" ")[0]}
                           </span>
                        </div>
                        <div className="flex items-center gap-2">
                           <DollarSign className="w-4 h-4 text-emerald-400" />
                           <span className="text-xs font-bold text-emerald-400">${dispute.amount} Disputed</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <Clock className="w-4 h-4 text-slate-500" />
                           <span className="text-xs font-semibold text-slate-400">
                             {new Date(dispute.createdAt).toLocaleDateString()}
                           </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {disputes.filter(d => d.status === "open").length === 0 && (
                     <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
                       <CheckCircle className="h-16 w-16 mx-auto mb-4 text-emerald-500/50" />
                       <h3 className="text-xl font-bold text-white">No Open Disputes</h3>
                       <p className="text-slate-400 mt-2">All conflicts have been arbitrated.</p>
                     </div>
                  )}
              </div>

              {/* Detail Panel (Right Panel) */}
              <div className="lg:col-span-5 xl:col-span-4">
                <div className="sticky top-24 rounded-3xl border border-white/10 bg-[#121212]/80 shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col max-h-[calc(100vh-8rem)]">
                  {selectedDispute ? (
                    <>
                      <div className="p-6 border-b border-white/10 bg-white/[0.02]">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                          <ShieldAlert className="w-5 h-5 text-primary" /> Dispute Details
                        </h2>
                      </div>
                      
                      <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                        {/* Parties */}
                        <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5 relative overflow-hidden">
                           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-600 font-black italic opacity-20 text-3xl pointer-events-none">VS</div>
                           
                           <div className="flex flex-col items-center gap-2 z-10 w-1/2">
                             <Avatar fallback={selectedDispute.clientName} className="border-2 border-white/10 w-12 h-12" />
                             <div className="text-center">
                               <p className="text-xs font-bold text-white truncate max-w-[100px]">{selectedDispute.clientName}</p>
                               <p className="text-[10px] uppercase tracking-widest text-primary">Client</p>
                             </div>
                           </div>
                           
                           <div className="w-px h-16 bg-white/10 z-10 leading-none"></div>
                           
                           <div className="flex flex-col items-center gap-2 z-10 w-1/2">
                             <Avatar fallback={selectedDispute.expertName} className="border-2 border-white/10 w-12 h-12" />
                             <div className="text-center">
                               <p className="text-xs font-bold text-white truncate max-w-[100px]">{selectedDispute.expertName}</p>
                               <p className="text-[10px] uppercase tracking-widest text-emerald-400">Expert</p>
                             </div>
                           </div>
                        </div>

                        {/* Amount Hero */}
                        <div className="p-6 border border-red-500/20 bg-red-500/5 rounded-2xl text-center">
                          <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-1">Funds in Escrow</p>
                          <p className="text-4xl font-black text-white">${selectedDispute.amount}<span className="text-xl text-slate-500 font-bold">.00</span></p>
                        </div>

                        {/* Description */}
                        <div>
                          <h4 className="font-bold text-xs uppercase tracking-widest text-slate-500 mb-3">Core Issue</h4>
                          <div className="p-4 bg-[#1e1e1e] rounded-xl border border-white/5">
                            <p className="text-sm text-slate-300 leading-relaxed">{selectedDispute.description}</p>
                          </div>
                        </div>

                        {/* Messages Thread */}
                        {selectedDispute.messages.length > 0 && (
                          <div>
                            <h4 className="font-bold text-xs uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                               <MessageSquare className="h-4 w-4" /> Discussion Thread
                            </h4>
                            <div className="space-y-4">
                              {selectedDispute.messages.map((msg, index) => (
                                <div key={index} className={`p-4 rounded-xl border ${msg.sender === 'client' ? 'bg-primary/5 border-primary/20 mr-6' : 'bg-emerald-500/5 border-emerald-500/20 ml-6'}`}>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className={`text-xs font-bold uppercase tracking-wider ${msg.sender === 'client' ? 'text-primary' : 'text-emerald-400'}`}>
                                      {msg.sender === 'client' ? selectedDispute.clientName : selectedDispute.expertName}
                                    </span>
                                    <span className="text-[10px] font-semibold text-slate-500">{msg.time}</span>
                                  </div>
                                  <p className="text-sm text-slate-300">{msg.content}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-6 border-t border-white/10 bg-black/40 flex gap-3">
                        <Button variant="outline" className="flex-1 bg-white/5 border-white/20 text-white hover:bg-white/10 h-14 font-bold">
                          <MessageSquare className="h-4 w-4 mr-2" /> Message Parties
                        </Button>
                        <Button className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(244,37,89,0.3)] h-14 font-bold" onClick={() => setShowResolveDialog(true)}>
                          <CheckCircle className="h-4 w-4 mr-2" /> Arbitrate Match
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="h-[400px] flex flex-col items-center justify-center text-slate-500 p-8">
                      <ShieldAlert className="h-16 w-16 mb-4 text-white/10" />
                      <p className="text-lg font-bold text-white">Select a Dispute</p>
                      <p className="text-sm text-center mt-2 text-slate-400">Click on a dispute ticket from the queue to view evidence.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pending" className="mt-2">
             <div className="w-full text-center py-24 bg-white/5 border border-white/10 rounded-3xl">
               <Clock className="h-16 w-16 mx-auto mb-4 text-amber-500/50" />
               <h3 className="text-xl font-bold text-white">Awaiting Information</h3>
               <p className="text-slate-400 mt-2">These disputes are waiting on client or expert evidence.</p>
             </div>
          </TabsContent>

          <TabsContent value="resolved" className="mt-2">
            <div className="w-full text-center py-24 bg-white/5 border border-white/10 rounded-3xl">
               <CheckCircle className="h-16 w-16 mx-auto mb-4 text-emerald-500/50" />
               <h3 className="text-xl font-bold text-white">History Cleared</h3>
               <p className="text-slate-400 mt-2">View closed arbitration cases here.</p>
             </div>
          </TabsContent>
        </Tabs>

        {/* Resolve Dialog - Dark Theme */}
        <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
          <DialogContent className="bg-[#1e1e1e] border-white/10 text-white sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-white text-xl flex items-center gap-2">
                 <ShieldAlert className="h-5 w-5 text-primary" /> Final Resolution
              </DialogTitle>
              <DialogDescription className="text-slate-400 mt-2">
                Determine the final distribution of the <span className="text-white font-bold">${selectedDispute?.amount}</span> escrow funds. This action cannot be reversed.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 space-y-6">
              <div className="grid grid-cols-2 gap-6 p-4 rounded-xl border border-white/5 bg-black/30">
                <div className="space-y-2">
                  <Label className="text-primary font-bold uppercase text-xs tracking-wider">To Client</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="bg-black/60 border-white/10 text-white pl-8 focus:ring-primary h-12"
                      value={resolution.clientAmount}
                      onChange={(e) => setResolution((prev) => ({ ...prev, clientAmount: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-emerald-400 font-bold uppercase text-xs tracking-wider">To Expert</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="bg-black/60 border-white/10 text-white pl-8 focus:ring-emerald-500 h-12"
                      value={resolution.expertAmount}
                      onChange={(e) => setResolution((prev) => ({ ...prev, expertAmount: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 font-bold uppercase text-xs tracking-wider">Official Ruling Notes</Label>
                <Textarea
                  placeholder="Explain the reasoning behind this decision for both parties..."
                  value={resolution.notes}
                  onChange={(e) => setResolution((prev) => ({ ...prev, notes: e.target.value }))}
                  className="min-h-[100px] bg-black/40 border-white/10 text-white focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowResolveDialog(false)} className="bg-transparent border-white/20 text-white hover:bg-white/5">
                Cancel
              </Button>
              <Button onClick={handleResolve} className="bg-primary hover:bg-primary/90 text-white font-bold">
                Confirm Ruling
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
