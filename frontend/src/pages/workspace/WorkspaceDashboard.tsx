import { useState } from "react"

// Mock data based on the source HTML
const workspaceData = {
    id: "1",
    projectTitle: "Automate Customer Onboarding",
    status: "in_progress",
    budget: 500,
    budgetType: "Fixed",
    startDate: "Oct 12, 2023",
    estCompletion: "Nov 5, 2023",
    progress: 33,
    milestones: [
        {
            id: "1",
            title: "Initial Discovery",
            status: "completed",
            description: "Requirements gathering, API documentation review, and mapping of customer journey.",
            date: "Finished on Oct 14, 2023",
        },
        {
            id: "2",
            title: "Workflow Design & Development",
            status: "in_progress",
            description: "Building the n8n core automation nodes and error handling logic.",
            progress: { nodeSetup: 80, authTesting: 40 },
        },
        {
            id: "3",
            title: "Final Testing & Handover",
            status: "pending",
            description: "QA testing with live data and recorded loom walkthrough for the client.",
        },
    ],
    messages: [
        {
            id: "1",
            sender: "Alex Rivera",
            role: "expert",
            content: "Hi Sarah! I've just finished the mapping for the Salesforce integration. Should we trigger the onboarding email immediately or add a 10-minute delay?",
            time: "10:45 AM",
            avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAuTmlaca3ohpO0ca4aPSFqlzmgy_H3XcGk72yBiL8g0lMvDmPWZi5ONnBzIPQM9rrlGfKxZFmUe4MDLDRnGXY_mA7MWadeZTjbzfGqR4mthJ4MbAWXeO58oJpC_PFVHo8kLuuWSZ7UkzbPyQjU0ZzL4_FF3SpdG2eDY22sRFueUsqa7yv9V3Ro5FS26n0j4bcTjutpaURUDQOrMeUZnERrmkQj8mqpS8c8y__9EFnIRMLSol6b44BunCh_txPO88egF0V6n6nhAsVP",
        },
        {
            id: "2",
            sender: "Sarah Jenkins",
            role: "client",
            content: "Great work, Alex! Let's go with a 5-minute delay. Also, can we make sure the CRM update happens *before* the email is sent?",
            time: "11:02 AM",
            avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBMKGUoBShNujwWdJlTwu63DN6xErN0pGtpBd9DTam_VJC9btwAOtqMFm1Gcr6aW9F-6qqHqiHtkMif8Clsq9EiFizm8JImZbez1qhRRBFbkZ44SZ_v1GFA_ULywHfjGij2Nz_bved2YAs0q4juTma297NSp2mpU-vfPlXpUmrybCx-syjh8uS72sZBxTf8K8TayClwzLQEEHe-kUBbY6LLi-ZWvBOiMax-_ta40BA9QxF0qlHXDEgo43A22-eX-Z4G1oVB_Hknab_q",
        },
    ],
    participants: [
        {
            name: "Alex Rivera",
            role: "Expert (You)",
            avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBF8JU0GB9Dg5Z3tCbFMT02VXagFlhiXPndRCt8eZ-Dn7UOQ0PA4BUuQKeERZI3Ds4rnY2dORvY4yZ1IoRiSmlP4J35tkoJAMcZLuoEjOos-bhfH2HsunspX4mblh2lElbj6XzdnBhsE3L5I4FKlnle7Q5TKY5Yidt0t4ytAG0F-UfIR-cUNVFqDokGNx92EAABmlItVDfJSCOpnahf-aXkaFN3eSWORAwFEt8UxDt_RcKbM2PlX_ALtfREfTKH8bcrZYwceyTLDTbJ",
            status: "online",
        },
        {
            name: "Sarah Jenkins",
            role: "Client • Product Lead",
            avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCmneNVnqvmW33w1T91orBq2vigICRqi1KH4GjfxYfYIlgo6zR79gZCW106Hu95nYqqAuS2lmI-zB_Bw3KPBOEqNiRuegQs9h2y5Hsgcl89l8g46dvchbZZaama_yxx-JRWTWN1tQyVfxVc8P4wl_Mzn0AKPHFiQgKrrB-eZfDOG9BhlWcVqRljqWyFwGBJKriQichFRPFfF67lFhlZacgSVssKu2J2ANfTCIepC3_Xv4OwNDIGuDyu3HBIaL5P7htycrgwCPK0iuZ1",
            status: "offline",
        }
    ]
}

export default function WorkspaceDashboard() {
    const [newMessage, setNewMessage] = useState("")

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen bg-grid overflow-x-hidden">
            <main className="flex-1 px-6 lg:px-20 py-8 max-w-[1400px] mx-auto w-full">
                {/* Project Header Section */}
                <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">{workspaceData.projectTitle}</h1>
                            <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded tracking-widest uppercase">In Progress</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-400 text-sm">
                            <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm">payments</span>
                                <span>Budget: <span className="text-white font-medium">${workspaceData.budget} {workspaceData.budgetType}</span></span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm">calendar_today</span>
                                <span>Started: <span className="text-white font-medium">{workspaceData.startDate}</span></span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm">timer</span>
                                <span>Est. Completion: <span className="text-white font-medium">{workspaceData.estCompletion}</span></span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-bold transition-all">
                            <span className="material-symbols-outlined text-sm">share</span> Share
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/20 transition-all">
                            <span className="material-symbols-outlined text-sm">rocket_launch</span> Launch Workflow
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Milestone Tracker Card */}
                        <div className="glass-card rounded-xl p-6 border border-white/10 bg-[#1e1316]/70 backdrop-blur-md">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-lg font-bold text-white">Project Progress</h3>
                                    <p className="text-sm text-slate-400">1 of 3 milestones successfully delivered</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl font-black text-primary">{workspaceData.progress}%</span>
                                </div>
                            </div>
                            {/* Progress Bar */}
                            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mb-10">
                                <div className="h-full bg-primary shadow-[0_0_15px_rgba(244,37,89,0.5)] rounded-full" style={{ width: `${workspaceData.progress}%` }}></div>
                            </div>
                            {/* Milestone List */}
                            <div className="space-y-0 relative">
                                {/* Timeline Connector */}
                                <div className="absolute left-[11px] top-2 bottom-8 w-[2px] bg-white/5"></div>

                                {workspaceData.milestones.map((milestone) => (
                                    <div key={milestone.id} className="relative flex gap-6 pb-10 last:pb-0">
                                        <div className={`relative z-10 flex items-center justify-center size-6 rounded-full border shadow-sm
                                            ${milestone.status === 'completed' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]' :
                                                milestone.status === 'in_progress' ? 'bg-primary shadow-[0_0_15px_rgba(244,37,89,0.6)] border-transparent' :
                                                    'bg-slate-800 border-white/10 text-slate-500'}`}>
                                            {milestone.status === 'completed' && <span className="material-symbols-outlined text-xs font-bold">check</span>}
                                            {milestone.status === 'in_progress' && <div className="size-2 bg-white rounded-full animate-pulse"></div>}
                                            {milestone.status === 'pending' && <span className="material-symbols-outlined text-xs">pending</span>}
                                        </div>
                                        <div className={`flex-1 ${milestone.status === 'pending' ? 'opacity-50' : ''}`}>
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-white">{milestone.title}</h4>
                                                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded
                                                    ${milestone.status === 'completed' ? 'text-emerald-500 bg-emerald-500/10' :
                                                        milestone.status === 'in_progress' ? 'text-primary bg-primary/10' :
                                                            'text-slate-400 bg-white/5'}`}>
                                                    {milestone.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <p className={`text-sm mt-1 ${milestone.status === 'in_progress' ? 'text-slate-300' : 'text-slate-400'}`}>
                                                {milestone.description}
                                            </p>
                                            {milestone.date && <div className="mt-2 text-xs text-slate-500 italic">{milestone.date}</div>}
                                            {milestone.progress && (
                                                <div className="mt-3 flex gap-2">
                                                    {Object.entries(milestone.progress).map(([key, val]) => (
                                                        <div key={key} className="px-2 py-1 bg-white/5 rounded border border-white/10 text-[10px] text-slate-400">
                                                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: {val}%
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Messages Card */}
                        <div className="glass-card rounded-xl overflow-hidden border border-white/10 bg-[#1e1316]/70 backdrop-blur-md">
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">chat</span> Messages
                                </h3>
                                <button className="text-xs text-primary font-bold hover:underline">View All History</button>
                            </div>
                            <div className="p-6 h-80 overflow-y-auto space-y-6">
                                {workspaceData.messages.map((msg) => (
                                    <div key={msg.id} className={`flex gap-4 ${msg.role === 'client' ? 'flex-row-reverse' : ''}`}>
                                        <img className="size-8 rounded-full" src={msg.avatar} alt={msg.sender} />
                                        <div className={`flex-1 ${msg.role === 'client' ? 'text-right' : ''}`}>
                                            <div className={`flex items-center gap-2 mb-1 ${msg.role === 'client' ? 'justify-end' : ''}`}>
                                                {msg.role === 'expert' && <span className="text-xs font-bold text-white">{msg.sender}</span>}
                                                <span className="text-[10px] text-slate-500">{msg.time}</span>
                                                {msg.role === 'client' && <span className="text-xs font-bold text-white">{msg.sender}</span>}
                                            </div>
                                            <div className={`inline-block p-3 rounded-lg text-sm max-w-md ${msg.role === 'client'
                                                ? 'bg-primary/20 border border-primary/30 rounded-tr-none text-slate-100 text-left'
                                                : 'bg-white/5 border border-white/10 rounded-tl-none text-slate-300'
                                                }`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {/* Typing Indicator Mock */}
                                <div className="flex gap-4">
                                    <img className="size-8 rounded-full" src={workspaceData.participants[0].avatar} alt="Typing" />
                                    <div className="flex gap-1.5 p-3 items-center bg-white/5 rounded-lg">
                                        <div className="size-1.5 bg-slate-500 rounded-full animate-bounce"></div>
                                        <div className="size-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="size-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 border-t border-white/5 bg-white/5">
                                <div className="relative">
                                    <input
                                        className="w-full bg-background-dark/50 border border-white/10 rounded-lg py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white placeholder-slate-500"
                                        placeholder="Type your reply..."
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />
                                    <button className="absolute right-2 top-1/2 -translate-y-1/2 size-8 bg-primary rounded-md flex items-center justify-center text-white hover:bg-primary-hover transition-colors">
                                        <span className="material-symbols-outlined text-sm">send</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-8">
                        {/* Participants Section */}
                        <div className="glass-card rounded-xl p-6 border border-white/10 bg-[#1e1316]/70 backdrop-blur-md">
                            <h3 className="text-md font-bold text-white mb-5 flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-400">group</span> Participants
                            </h3>
                            <div className="space-y-4">
                                {workspaceData.participants.map((participant, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                                        <div className="relative">
                                            <img className="size-10 rounded-full object-cover" src={participant.avatar} alt={participant.name} />
                                            <span className={`absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-background-dark ${participant.status === 'online' ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-white">{participant.name}</p>
                                            <p className={`text-[11px] font-medium ${participant.role.includes('Expert') ? 'text-primary' : 'text-slate-400'}`}>{participant.role}</p>
                                        </div>
                                        <button className="p-1.5 hover:bg-white/10 rounded text-slate-400">
                                            <span className="material-symbols-outlined text-lg">more_vert</span>
                                        </button>
                                    </div>
                                ))}
                                <button className="w-full mt-4 py-2 border border-dashed border-white/20 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:border-white/40 transition-all">
                                    + Invite Collaborator
                                </button>
                            </div>
                        </div>

                        {/* Quick Actions Section */}
                        <div className="glass-card rounded-xl p-6 border border-white/10 bg-[#1e1316]/70 backdrop-blur-md">
                            <h3 className="text-md font-bold text-white mb-5">Quick Actions</h3>
                            <div className="flex flex-col gap-3">
                                <button className="flex items-center justify-between w-full px-4 py-3 bg-primary text-white font-bold rounded-lg text-sm hover:brightness-110 transition-all shadow-lg shadow-primary/20">
                                    <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">account_balance_wallet</span> Release Payment</span>
                                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                                </button>
                                <button className="flex items-center gap-2 w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-lg text-sm transition-all">
                                    <span className="material-symbols-outlined text-sm text-slate-400">description</span> View Contract
                                </button>
                                <button className="flex items-center gap-2 w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-lg text-sm transition-all">
                                    <span className="material-symbols-outlined text-sm text-slate-400">folder_open</span> Project Files (12)
                                </button>
                                <button className="flex items-center gap-2 w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-lg text-sm transition-all">
                                    <span className="material-symbols-outlined text-sm text-slate-400">add_task</span> Submit Deliverable
                                </button>
                                <div className="pt-4 mt-2 border-t border-white/5">
                                    <button className="flex items-center gap-2 text-rose-400/80 hover:text-rose-400 text-xs font-bold transition-all px-2">
                                        <span className="material-symbols-outlined text-xs">report</span> Report an Issue
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Workflow Preview Section */}
                        <div className="glass-card rounded-xl p-1 bg-gradient-to-br from-primary/20 to-transparent">
                            <div className="bg-background-dark/80 rounded-[calc(0.75rem-4px)] p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Live Workflow</h4>
                                    <span className="size-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                                </div>
                                <div className="rounded-lg bg-black/40 border border-white/5 p-4 flex flex-col items-center justify-center gap-3 relative overflow-hidden group min-h-[140px]">
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <span className="material-symbols-outlined text-4xl text-white/20 group-hover:text-primary/40 transition-all">schema</span>
                                    <p className="text-[10px] text-slate-500 font-medium text-center">Interactive n8n canvas preview currently syncing...</p>
                                    <button className="mt-2 text-[10px] font-black text-white px-3 py-1 bg-white/10 rounded-full hover:bg-white/20 uppercase tracking-tighter">View Schema</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
