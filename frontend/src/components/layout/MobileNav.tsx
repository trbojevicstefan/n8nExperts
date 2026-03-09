import { Link, useLocation } from "react-router-dom";
import { Bell, Briefcase, FolderOpen, Home, MessageSquare, PlusSquare, Search, Sparkles, UserRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { mobileClientNav, mobileExpertNav, mobilePublicNav } from "@/content/site";

const iconMap = {
  Home,
  How: Sparkles,
  Experts: Search,
  Jobs: Briefcase,
  Post: PlusSquare,
  Work: Search,
  Apps: Sparkles,
  "My Apps": FolderOpen,
  Invites: Bell,
  Pipeline: Sparkles,
  Inbox: MessageSquare,
  Messages: MessageSquare,
  Profile: UserRound,
} as const;

export function MobileNav() {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = !user ? mobilePublicNav : user.role === "expert" ? mobileExpertNav : mobileClientNav;

  return (
    <nav className="mobile-bottom-nav md:hidden">
      <div className="grid h-full grid-cols-4">
        {navItems.map((item) => {
          const Icon = iconMap[item.label as keyof typeof iconMap] || Sparkles;
          const isActive = location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              to={item.href}
              className={isActive ? "mobile-bottom-link mobile-bottom-link-active" : "mobile-bottom-link"}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
