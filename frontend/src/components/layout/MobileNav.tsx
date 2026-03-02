import { Link, useLocation } from "react-router-dom";
import { Bell, Home, MessageSquare, Search, Briefcase, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function MobileNav() {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = !user
    ? [
        { name: "Home", href: "/", icon: Home },
        { name: "Experts", href: "/find-experts", icon: Search },
        { name: "Jobs", href: "/jobs", icon: Briefcase },
        { name: "Login", href: "/auth/login", icon: User },
      ]
    : user.role === "expert"
      ? [
          { name: "Home", href: "/", icon: Home },
          { name: "Jobs", href: "/jobs", icon: Search },
          { name: "Inbox", href: "/inbox", icon: MessageSquare },
          { name: "Alerts", href: "/notifications", icon: Bell },
        ]
      : [
          { name: "Home", href: "/", icon: Home },
          { name: "Experts", href: "/find-experts", icon: Search },
          { name: "Inbox", href: "/inbox", icon: MessageSquare },
          { name: "Alerts", href: "/notifications", icon: Bell },
        ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-[var(--color-border)] md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                isActive ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)] hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
