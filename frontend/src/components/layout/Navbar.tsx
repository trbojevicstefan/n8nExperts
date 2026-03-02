import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Bell, LogOut, Menu, Network, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/avatar";
import { invitationApi, notificationApi } from "@/lib/api";

const publicLinks = [
  { name: "Find Experts", href: "/find-experts" },
  { name: "Find Jobs", href: "/jobs" },
  { name: "Why Us", href: "/why-us" },
];

const clientLinks = [
  { name: "Experts", href: "/find-experts" },
  { name: "My Jobs", href: "/my-jobs" },
  { name: "Pipeline", href: "/my-jobs/pipeline" },
  { name: "Post Project", href: "/post-project" },
  { name: "Saved Experts", href: "/saved-experts" },
  { name: "Saved Searches", href: "/saved-searches" },
  { name: "Client Profile", href: "/client/profile" },
  { name: "Inbox", href: "/inbox" },
];

const expertLinks = [
  { name: "Jobs", href: "/jobs" },
  { name: "Saved Jobs", href: "/saved-jobs" },
  { name: "Saved Searches", href: "/saved-searches" },
  { name: "Invitations", href: "/invitations" },
  { name: "Applications", href: "/my-applications" },
  { name: "Inbox", href: "/inbox" },
  { name: "Services", href: "/expert/services" },
  { name: "Profile", href: "/expert/setup" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [pendingInvitations, setPendingInvitations] = useState(0);
  const { user, logout } = useAuth();
  const location = useLocation();

  const links = user ? (user.role === "expert" ? expertLinks : clientLinks) : publicLinks;

  const isLinkActive = (href: string) => {
    const path = location.pathname;
    if (href === "/my-jobs") {
      return path === "/my-jobs";
    }
    if (href === "/my-jobs/pipeline") {
      return path === "/my-jobs/pipeline";
    }
    if (path === href) return true;
    if (href !== "/" && path.startsWith(`${href}/`)) return true;

    if (href === "/find-experts") {
      return path.startsWith("/experts/") || path.startsWith("/expert/");
    }
    if (href === "/jobs") {
      return path.startsWith("/find-work");
    }

    return false;
  };

  useEffect(() => {
    let isMounted = true;

    const loadUnread = async () => {
      if (!user) {
        if (isMounted) {
          setUnreadNotifications(0);
          setPendingInvitations(0);
        }
        return;
      }
      try {
        if (user.role === "expert") {
          const [notificationsResponse, invitationsResponse] = await Promise.all([
            notificationApi.getUnreadCount(),
            invitationApi.getMine({ role: "expert", status: "sent", limit: 1 }),
          ]);
          if (isMounted) {
            setUnreadNotifications(notificationsResponse.data.unreadCount);
            setPendingInvitations(invitationsResponse.data.pagination?.total || invitationsResponse.data.invitations.length);
          }
          return;
        }

        const response = await notificationApi.getUnreadCount();
        if (isMounted) {
          setUnreadNotifications(response.data.unreadCount);
          setPendingInvitations(0);
        }
      } catch {
        if (isMounted) {
          setUnreadNotifications(0);
          setPendingInvitations(0);
        }
      }
    };

    loadUnread();
    const intervalId = window.setInterval(loadUnread, 15000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [user]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
      <div className="container glass rounded-2xl px-4 py-2.5">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-sky-400 to-primary flex items-center justify-center text-white">
              <Network className="h-5 w-5" />
            </div>
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-white">n8nExperts</span>
          </Link>

          <div className="hidden md:flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1">
            {links.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider transition ${
                    active
                      ? "bg-primary text-white ring-1 ring-white/25 shadow-[0_8px_22px_var(--color-primary-glow)]"
                      : "text-slate-200 hover:bg-white/10 hover:text-white"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>{link.name}</span>
                  {user?.role === "expert" && link.href === "/invitations" && pendingInvitations > 0 && (
                    <span className="ml-2 rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-200">
                      {pendingInvitations}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/notifications" className="relative rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 hover:text-white hover:bg-white/10">
                  <Bell className="h-4 w-4" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {unreadNotifications > 99 ? "99+" : unreadNotifications}
                    </span>
                  )}
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen((prev) => !prev)}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2 py-1.5 hover:bg-white/10"
                  >
                    <Avatar src={user.img} fallback={user.username} size="sm" className="h-8 w-8 border border-white/10" />
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-semibold text-white leading-none">{user.username}</p>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-1">{user.role}</p>
                    </div>
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-[var(--color-bg-elevated)] p-2 shadow-2xl z-20 animate-fade-in">
                        <p className="px-3 py-2 text-xs text-slate-400">{user.email}</p>
                        <button
                          onClick={logout}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-300 hover:bg-white/5"
                        >
                          <LogOut className="h-4 w-4" />
                          Log out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/auth/login" className="hidden sm:block text-sm font-bold text-slate-300 hover:text-white">
                  Log in
                </Link>
                <Link to="/auth/role-select" className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white hover:bg-primary-hover">
                  Get Started
                </Link>
              </>
            )}

            <button className="md:hidden text-white" onClick={() => setMobileMenuOpen((prev) => !prev)} aria-label="Toggle navigation">
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-3 border-t border-white/10 pt-3 animate-slide-up">
            <div className="flex flex-col gap-2">
              {links.map((link) => {
                const active = isLinkActive(link.href);
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      active
                        ? "bg-primary/20 border border-primary/40 text-white"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>{link.name}</span>
                    {user?.role === "expert" && link.href === "/invitations" && pendingInvitations > 0 && (
                      <span className="ml-2 rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-200">
                        {pendingInvitations}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
