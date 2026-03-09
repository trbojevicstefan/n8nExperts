import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Bell, ChevronRight, LogOut, Menu, Network, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/avatar";
import { invitationApi, notificationApi } from "@/lib/api";
import { brandCopy, clientNavGroups, expertNavGroups, publicNavGroups } from "@/content/site";
import type { NavItem } from "@/content/site";
import type { ShellMode } from "./Layout";

const pathAliases: Record<string, string[]> = {
  "/find-experts": ["/experts/", "/expert/"],
  "/jobs": ["/find-work"],
  "/trust": ["/why-us"],
};

export function Navbar({ mode = "public" }: { mode?: ShellMode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [pendingInvitations, setPendingInvitations] = useState(0);
  const { user, logout } = useAuth();
  const location = useLocation();

  const navGroups = user ? (user.role === "expert" ? expertNavGroups : clientNavGroups) : publicNavGroups;
  const userShortcuts: NavItem[] = user
    ? user.role === "expert"
      ? [
          { label: "Find Work", href: "/jobs", description: "Browse open jobs." },
          { label: "My Applications", href: "/my-applications", description: "See your application updates." },
          { label: "Messages", href: "/inbox", description: "Read and send messages." },
          { label: "My Profile", href: "/expert/setup", description: "Update your public expert profile." },
        ]
      : [
          { label: "Post a Job", href: "/post-project", description: "Create a job post." },
          { label: "My Jobs", href: "/my-jobs", description: "Manage jobs and applicants." },
          { label: "Messages", href: "/inbox", description: "Read and send messages." },
          { label: "Profile", href: "/client/profile", description: "Update your company profile." },
        ]
    : [];
  const authLinks: NavItem[] = [
    { label: "Browse Experts", href: "/find-experts", description: "See expert profiles and services." },
    { label: "Browse Jobs", href: "/jobs", description: "See open jobs on the platform." },
    { label: "How It Works", href: "/how-it-works", description: "See how hiring and applying works." },
  ];
  const publicPrimaryLinks: NavItem[] = [
    { label: "How It Works", href: "/how-it-works", description: "See how hiring and applying works." },
    { label: "For Clients", href: "/for-clients", description: "Hiring path and platform fit for clients." },
    { label: "For Experts", href: "/for-experts", description: "Profile, services, and application path for experts." },
    { label: "Browse Experts", href: "/find-experts", description: "See expert profiles and services." },
  ];
  const desktopLinks = mode === "app" ? userShortcuts : authLinks;
  const mobileMenuGroups = mode === "auth" ? [{ title: "Explore", items: authLinks }] : navGroups;
  const hasMobileMenu = mobileMenuGroups.some((group) => group.items.length > 0);

  const isLinkActive = (href: string) => {
    const path = location.pathname;
    if (path === href) return true;
    if (href !== "/" && path.startsWith(`${href}/`)) return true;
    return (pathAliases[href] || []).some((alias) => path === alias || path.startsWith(alias));
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
    <nav className="sticky top-0 z-50 px-3 py-3 md:px-4">
      <div className={`container nav-shell nav-shell-${mode}`}>
        <div className="flex items-center gap-4">
          <Link to="/" className="flex min-w-fit items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
            <div className="brand-mark">
              <Network className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-base font-black tracking-[-0.03em] text-white">{brandCopy.name}</p>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-text-muted)]">{brandCopy.label}</p>
            </div>
          </Link>

          {mode === "public" && (
            <div className="hidden min-w-0 flex-1 items-center justify-center gap-4 md:flex">
              <div className="public-nav-links">
                {publicPrimaryLinks.map((link) => {
                  const active = isLinkActive(link.href);

                  return (
                    <Link key={link.href} to={link.href} className={active ? "nav-link nav-link-active" : "nav-link"}>
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {(mode === "app" || mode === "auth") && (
            <div className="hidden min-w-0 flex-1 md:flex">
              <div className="workspace-shortcuts">
                <span className="workspace-shortcuts-label">
                  {mode === "app" ? "Start here" : "Explore"}
                </span>
                <div className="flex flex-wrap items-center gap-1">
                  {desktopLinks.map((link) => {
                    const active = isLinkActive(link.href);
                    const showBadge = user?.role === "expert" && link.badge === "invitations" && pendingInvitations > 0;

                    return (
                      <Link key={link.href} to={link.href} className={active ? "nav-link nav-link-active" : "nav-link"}>
                        <span>{link.label}</span>
                        {showBadge && <span className="nav-pill">{pendingInvitations}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="ml-auto flex items-center gap-2 md:gap-3">
            {user ? (
              <>
                <Link to="/notifications" className="icon-button relative" aria-label="Open notifications">
                  <Bell className="h-4 w-4" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -right-1 -top-1 rounded-full bg-[var(--color-primary)] px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {unreadNotifications > 99 ? "99+" : unreadNotifications}
                    </span>
                  )}
                </Link>
                <div className="relative">
                  <button type="button" onClick={() => setUserMenuOpen((prev) => !prev)} className="user-chip">
                    <Avatar src={user.img} fallback={user.username} size="sm" className="h-9 w-9 border border-white/10" />
                    <div className="hidden text-left lg:block">
                      <p className="text-sm font-semibold leading-none text-white">{user.username}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-muted)]">{user.role}</p>
                    </div>
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 z-20 mt-3 w-72 rounded-[26px] border border-white/10 bg-[rgba(11,15,26,0.96)] p-3 shadow-2xl backdrop-blur-xl">
                        <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                          <p className="text-sm font-semibold text-white">{user.username}</p>
                          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{user.email}</p>
                        </div>
                        <div className="mt-3 space-y-1">
                          {userShortcuts.map((item) => (
                            <Link
                              key={item.href}
                              to={item.href}
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center justify-between rounded-2xl px-3 py-3 text-sm text-[var(--color-text-secondary)] transition hover:bg-white/6 hover:text-white"
                            >
                              <span>{item.label}</span>
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={logout}
                          className="mt-2 flex w-full items-center gap-2 rounded-2xl px-3 py-3 text-sm text-rose-300 transition hover:bg-white/6"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Log out</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                {mode !== "auth" && (
                  <Link to="/auth/login" className="hidden text-sm font-semibold text-[var(--color-text-secondary)] transition hover:text-white md:block">
                    Log in
                  </Link>
                )}
                <Link
                  to={mode === "auth" ? "/" : "/auth/role-select"}
                  className="inline-flex items-center rounded-full bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_18px_45px_var(--color-primary-glow)] transition hover:bg-[var(--color-primary-hover)]"
                >
                  {mode === "auth" ? "Back to site" : "Get started"}
                </Link>
              </>
            )}

            {hasMobileMenu && (
              <button className="icon-button md:hidden" onClick={() => setMobileMenuOpen((prev) => !prev)} aria-label="Toggle navigation">
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            )}
          </div>
        </div>

        {hasMobileMenu && mobileMenuOpen && (
          <div className="mt-4 border-t border-white/10 pt-4 md:hidden">
            <div className="space-y-4">
              {mobileMenuGroups.map((group) => (
                <div key={group.title}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">{group.title}</p>
                  <div className="mt-2 grid gap-2">
                    {group.items.map((link) => {
                      const active = isLinkActive(link.href);
                      const showBadge = user?.role === "expert" && link.badge === "invitations" && pendingInvitations > 0;

                      return (
                        <Link
                          key={link.href}
                          to={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={active ? "mobile-nav-link mobile-nav-link-active" : "mobile-nav-link"}
                        >
                          <div>
                            <p className="text-sm font-semibold text-white">{link.label}</p>
                            {mode !== "app" && <p className="mt-1 text-xs text-[var(--color-text-muted)]">{link.description}</p>}
                          </div>
                          {showBadge && <span className="nav-pill">{pendingInvitations}</span>}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
