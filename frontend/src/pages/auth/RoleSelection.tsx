import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { usePageMeta } from "@/hooks/usePageMeta";
import { buildLoginPath, buildRegisterPath, readAuthIntent } from "@/lib/auth-intent";

type Role = "client" | "expert" | null;

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const intent = readAuthIntent(searchParams);

  usePageMeta({
    title: "Choose Your Role | n8nExperts",
    description: "Choose whether you are joining n8nExperts as a client hiring automation talent or as an expert publishing proof and services.",
    canonicalPath: "/auth/role-select",
    noIndex: true,
  });

  return (
    <div className="min-h-screen flex flex-col font-display text-white relative" style={{
      background: `radial-gradient(circle at top right, rgba(244, 37, 89, 0.15), transparent 40%),
                   radial-gradient(circle at bottom left, rgba(244, 37, 89, 0.1), transparent 40%)`,
    }}>
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Header */}
        <div className="max-w-[800px] w-full text-center mb-12">
          <h1 className="text-white tracking-tight text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            Join n8nExperts
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-medium max-w-xl mx-auto">
            Select how you would like to use the platform to start building or hiring.
          </p>
        </div>

        {/* Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[960px] w-full px-4 mb-12">
          {/* Client Card */}
          <button
            type="button"
            onClick={() => setSelectedRole("client")}
            className={cn(
              "relative overflow-hidden flex flex-col p-8 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] text-left",
              "backdrop-blur-xl border",
              selectedRole === "client"
                ? "border-primary shadow-[0_0_20px_rgba(244,37,89,0.2)]"
                : "border-[rgba(244,37,89,0.1)] opacity-80 hover:opacity-100 hover:border-primary/40"
            )}
            style={{ background: 'rgba(22, 17, 18, 0.7)' }}
          >
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(244, 37, 89, 0.05) 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}></div>

            {/* Selection Indicator */}
            {selectedRole === "client" && (
              <div className="absolute top-4 right-4 h-6 w-6 bg-primary rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(244,37,89,0.5)]">
                <span className="material-symbols-outlined text-white text-sm font-bold">check</span>
              </div>
            )}

            {/* Icon */}
            <div className={cn(
              "relative z-10 size-16 mb-8 rounded-xl flex items-center justify-center",
              selectedRole === "client"
                ? "bg-primary/20 shadow-[0_0_30px_rgba(244,37,89,0.2)] border border-primary/30"
                : "bg-white/5 border border-white/10"
            )}>
              <span className={cn(
                "material-symbols-outlined text-4xl",
                selectedRole === "client" ? "text-primary" : "text-gray-400"
              )}>group</span>
            </div>

            <div className="relative z-10 flex-1">
              <h3 className="text-2xl font-bold text-white mb-2">I am a Client</h3>
              <p className="text-gray-400 mb-8 text-base">Looking to automate my business workflows with expert help.</p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-300 font-medium">
                  <span className={cn("material-symbols-outlined text-xl", selectedRole === "client" ? "text-primary" : "text-gray-600")}>check_circle</span>
                  Hire top automation talent
                </li>
                <li className="flex items-center gap-3 text-gray-300 font-medium">
                  <span className={cn("material-symbols-outlined text-xl", selectedRole === "client" ? "text-primary" : "text-gray-600")}>check_circle</span>
                  Secure Escrow payments
                </li>
                <li className="flex items-center gap-3 text-gray-300 font-medium">
                  <span className={cn("material-symbols-outlined text-xl", selectedRole === "client" ? "text-primary" : "text-gray-600")}>check_circle</span>
                  Fast delivery &amp; support
                </li>
              </ul>
            </div>
          </button>

          {/* Expert Card */}
          <button
            type="button"
            onClick={() => setSelectedRole("expert")}
            className={cn(
              "relative overflow-hidden flex flex-col p-8 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] text-left",
              "backdrop-blur-xl border",
              selectedRole === "expert"
                ? "border-primary shadow-[0_0_20px_rgba(244,37,89,0.2)]"
                : "border-[rgba(244,37,89,0.1)] opacity-80 hover:opacity-100 hover:border-primary/40"
            )}
            style={{ background: 'rgba(22, 17, 18, 0.7)' }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(244, 37, 89, 0.05) 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}></div>

            {selectedRole === "expert" && (
              <div className="absolute top-4 right-4 h-6 w-6 bg-primary rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(244,37,89,0.5)]">
                <span className="material-symbols-outlined text-white text-sm font-bold">check</span>
              </div>
            )}

            <div className={cn(
              "relative z-10 size-16 mb-8 rounded-xl flex items-center justify-center",
              selectedRole === "expert"
                ? "bg-primary/20 shadow-[0_0_30px_rgba(244,37,89,0.2)] border border-primary/30"
                : "bg-white/5 border border-white/10"
            )}>
              <span className={cn(
                "material-symbols-outlined text-4xl",
                selectedRole === "expert" ? "text-primary" : "text-gray-400"
              )}>work</span>
            </div>

            <div className="relative z-10 flex-1">
              <h3 className="text-2xl font-bold text-white mb-2">I am an Expert</h3>
              <p className="text-gray-400 mb-8 text-base">Looking to provide professional n8n automation services.</p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-300 font-medium">
                  <span className={cn("material-symbols-outlined text-xl", selectedRole === "expert" ? "text-primary" : "text-gray-600")}>check_circle</span>
                  Find high-paying gigs
                </li>
                <li className="flex items-center gap-3 text-gray-300 font-medium">
                  <span className={cn("material-symbols-outlined text-xl", selectedRole === "expert" ? "text-primary" : "text-gray-600")}>check_circle</span>
                  Work on your own terms
                </li>
                <li className="flex items-center gap-3 text-gray-300 font-medium">
                  <span className={cn("material-symbols-outlined text-xl", selectedRole === "expert" ? "text-primary" : "text-gray-600")}>check_circle</span>
                  Showcase your portfolio
                </li>
              </ul>
            </div>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-[440px] px-4 space-y-4">
          <button
            type="button"
            disabled={!selectedRole}
            onClick={() => selectedRole && navigate(buildRegisterPath(selectedRole, intent))}
            className={cn(
              "w-full flex items-center justify-center rounded-xl h-14 px-6 text-lg font-bold transition-all",
              selectedRole
                ? "bg-primary text-white shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95"
                : "bg-white/10 text-slate-400 cursor-not-allowed"
            )}
          >
            {selectedRole ? `Continue as ${selectedRole === "client" ? "Client" : "Expert"}` : "Choose a role to continue"}
          </button>
          <button className="w-full flex items-center justify-center rounded-xl h-14 px-6 bg-transparent border-2 border-primary/40 text-white text-lg font-bold hover:bg-primary/5 active:scale-95 transition-all">
            <svg className="size-5 mr-3" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-gray-500 text-base">
            Already have an account?
            <Link to={buildLoginPath(intent)} className="text-primary font-bold hover:underline ml-1">Log in</Link>
          </p>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
    </div>
  );
}
