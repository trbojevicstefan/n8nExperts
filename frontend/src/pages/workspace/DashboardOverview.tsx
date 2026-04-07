import { dashboardData } from "@/data/mockData";
import { Link } from "react-router-dom";

export interface DashboardOverviewProps {}

export default function DashboardOverview(_props: Readonly<DashboardOverviewProps>) {
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen bg-grid overflow-x-hidden">
            <main className="flex-1 px-6 lg:px-20 py-8 max-w-[1400px] mx-auto w-full space-y-12">
                {/* Greeting Section */}
                <section className="space-y-2">
                    <p className="font-body text-sm uppercase tracking-[0.2em] text-primary/80 font-bold">Dashboard</p>
                    <h1 className="font-headline text-4xl md:text-5xl font-black text-white tracking-tight">Good morning, <span className="text-primary">{dashboardData.user.name}</span></h1>
                </section>

                {/* Quick Actions Row */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link to="/post-project" className="glass-card flex flex-col items-center justify-center p-6 rounded-2xl hover:bg-white/10 active:scale-95 transition-all cursor-pointer border border-white/10 bg-[#1e1316]/70 backdrop-blur-md group">
                        <span className="material-symbols-outlined text-primary mb-3 text-3xl group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(244,37,89,0.5)] bg-primary/20 rounded-full p-2">add_circle</span>
                        <span className="font-body text-xs font-bold text-white/90 uppercase tracking-widest text-center leading-tight">Post Project</span>
                    </Link>
                    <Link to="/find-talent" className="glass-card flex flex-col items-center justify-center p-6 rounded-2xl hover:bg-white/10 active:scale-95 transition-all cursor-pointer border border-white/10 bg-[#1e1316]/70 backdrop-blur-md group">
                        <span className="material-symbols-outlined text-emerald-500 mb-3 text-3xl group-hover:scale-110 transition-transform bg-emerald-500/10 rounded-full p-2">search</span>
                        <span className="font-body text-xs font-bold text-white/90 uppercase tracking-widest text-center leading-tight">Find Talent</span>
                    </Link>
                    <button className="glass-card flex flex-col items-center justify-center p-6 rounded-2xl hover:bg-white/10 active:scale-95 transition-all cursor-pointer border border-white/10 bg-[#1e1316]/70 backdrop-blur-md group">
                        <span className="material-symbols-outlined text-white mb-3 text-3xl group-hover:scale-110 transition-transform bg-white/5 rounded-full p-2">payments</span>
                        <span className="font-body text-xs font-bold text-white/90 uppercase tracking-widest text-center leading-tight">Withdraw</span>
                    </button>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column (Metrics + Projects) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Key Metrics Bento */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="glass-card md:col-span-2 p-8 rounded-3xl relative overflow-hidden border border-white/10 bg-[#1e1316]/70 backdrop-blur-md">
                                <div className="absolute -right-10 -top-10 w-48 h-48 bg-primary/20 rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>
                                <div className="flex justify-between items-start relative z-10">
                                    <div className="space-y-1">
                                        <p className="text-white/50 text-sm font-bold uppercase tracking-widest">Monthly Earnings</p>
                                        <h2 className="text-4xl md:text-5xl font-black text-white font-headline tracking-tighter">{dashboardData.metrics.monthlyEarnings}</h2>
                                    </div>
                                    <div className="p-3 bg-primary/20 rounded-2xl shadow-[0_0_15px_rgba(244,37,89,0.3)]">
                                        <span className="material-symbols-outlined text-primary text-2xl">trending_up</span>
                                    </div>
                                </div>
                                <div className="mt-6 flex items-center gap-2 relative z-10">
                                    <span className="material-symbols-outlined text-emerald-500 text-sm">arrow_upward</span>
                                    <span className="text-emerald-500 text-sm font-bold">{dashboardData.metrics.growth}</span>
                                </div>
                            </div>
                            <div className="glass-card p-6 rounded-3xl space-y-4 border border-white/10 bg-[#1e1316]/70 backdrop-blur-md">
                                <p className="text-white/50 text-xs font-bold uppercase tracking-widest">Projects</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-white">{dashboardData.metrics.activeProjects}</span>
                                    <span className="text-sm font-bold text-white/40 uppercase tracking-wider">Active</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-2/3 shadow-[0_0_10px_rgba(244,37,89,0.8)]"></div>
                                </div>
                            </div>
                            <div className="glass-card p-6 rounded-3xl space-y-4 border border-white/10 bg-[#1e1316]/70 backdrop-blur-md">
                                <p className="text-white/50 text-xs font-bold uppercase tracking-widest">Job Success Score</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">{dashboardData.metrics.successRate}</span>
                                </div>
                                <div className="flex -space-x-3 mt-2">
                                    <div className="w-8 h-8 rounded-full border-2 border-background-dark bg-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]">1st</div>
                                    <div className="w-8 h-8 rounded-full border-2 border-background-dark bg-white/5"></div>
                                    <div className="w-8 h-8 rounded-full border-2 border-background-dark bg-white/5"></div>
                                </div>
                            </div>
                        </section>

                        {/* Active Projects List */}
                        <section className="space-y-6">
                            <div className="flex justify-between items-end border-b border-white/10 pb-4">
                                <h3 className="font-headline text-2xl font-black text-white">Active Projects</h3>
                                <Link to="/my-jobs" className="text-primary text-xs font-bold uppercase tracking-widest cursor-pointer hover:text-white transition-colors">View All</Link>
                            </div>
                            <div className="space-y-4">
                                {dashboardData.activeProjects.map(project => (
                                    <Link to={`/workspace/jobs/${project.id}`} key={project.id} className="block glass-card p-6 rounded-2xl group hover:bg-white/10 transition-colors border border-white/10 bg-[#1e1316]/70 backdrop-blur-md cursor-pointer">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="text-white font-bold text-lg mb-1 group-hover:text-primary transition-colors">{project.title}</h4>
                                                <p className="text-slate-400 text-sm font-medium">Client: {project.client}</p>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${project.statusColor === 'primary' ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_10px_rgba(244,37,89,0.2)]' : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]'}`}>
                                                {project.status}
                                            </span>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-xs font-bold text-slate-400">
                                                <span className="uppercase tracking-wider">Next Milestone: <span className="text-white">{project.nextMilestone}</span></span>
                                                <span className="text-white">{project.progress}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-1000 ${project.statusColor === 'primary' ? 'bg-primary shadow-[0_0_10px_rgba(244,37,89,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`} 
                                                    style={{ width: `${project.progress}%` }}>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column (Messages) */}
                    <div className="space-y-8 lg:col-span-1">
                        <section className="glass-card rounded-3xl border border-white/10 bg-[#1e1316]/70 backdrop-blur-md overflow-hidden flex flex-col h-full min-h-[500px]">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <h3 className="font-headline text-xl font-black text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">forum</span> Recent Messages
                                </h3>
                                <Link to="/inbox" className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors">Inbox</Link>
                            </div>
                            <div className="p-6 space-y-5 flex-1 overflow-y-auto">
                                {dashboardData.recentMessages.map(msg => (
                                    <Link to="/inbox" key={msg.id} className="flex gap-4 items-start active:scale-[0.98] transition-transform cursor-pointer group p-3 hover:bg-white/5 rounded-xl -mx-3">
                                        <div className="relative shrink-0 mt-1">
                                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-background-dark shadow-lg">
                                                <img alt={msg.sender} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={msg.avatar} />
                                            </div>
                                            {msg.online && (
                                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-[3px] border-background-dark shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h5 className="text-white font-bold text-sm truncate group-hover:text-primary transition-colors">{msg.sender}</h5>
                                                <span className="text-[10px] text-slate-500 font-bold uppercase">{msg.time}</span>
                                            </div>
                                            <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">{msg.preview}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            <div className="p-4 border-t border-white/10 bg-white/5">
                                <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white uppercase tracking-widest transition-all shadow-sm">
                                    View All Conversations
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
