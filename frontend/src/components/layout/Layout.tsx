import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { MobileNav } from "./MobileNav";

export type ShellMode = "public" | "auth" | "app";

function ensureRobotsMeta(content: string) {
  let element = document.head.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", "robots");
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function ShellLayout({
  mode,
  showMobileNav = true,
  footerVariant = "full",
}: {
  mode: ShellMode;
  showMobileNav?: boolean;
  footerVariant?: "full" | "compact" | "none";
}) {
  const { user } = useAuth();
  const location = useLocation();
  const chromeMode: ShellMode = user && mode === "public" ? "app" : mode;
  const resolvedFooterVariant = user && mode === "public" ? "compact" : footerVariant;

  useEffect(() => {
    if (chromeMode === "app" || chromeMode === "auth") {
      ensureRobotsMeta("noindex,nofollow");
    }
  }, [chromeMode, location.pathname]);

  return (
    <div className={cn("app-shell", `shell-${mode}`)}>
      <div className="shell-orb shell-orb-left" />
      <div className="shell-orb shell-orb-right" />
      <Navbar mode={chromeMode} />
      <main
        className={cn(
          "shell-main flex-1",
          chromeMode === "public" && "pt-8 pb-22 md:pt-10 md:pb-10",
          chromeMode === "auth" && "pt-8 pb-10 md:pt-10",
          chromeMode === "app" && "pt-8 pb-22 md:pt-10 md:pb-10"
        )}
      >
        <Outlet />
      </main>
      {resolvedFooterVariant !== "none" && <Footer tone={resolvedFooterVariant} />}
      {showMobileNav && chromeMode !== "auth" && <MobileNav />}
    </div>
  );
}

export function Layout({ showMobileNav = true }: { showMobileNav?: boolean }) {
  return <ShellLayout mode="public" showMobileNav={showMobileNav} footerVariant="full" />;
}

export function PublicLayout() {
  return <ShellLayout mode="public" showMobileNav footerVariant="full" />;
}

export function AppLayout() {
  return <ShellLayout mode="app" showMobileNav footerVariant="compact" />;
}

export function CleanLayout() {
  return <ShellLayout mode="auth" showMobileNav={false} footerVariant="compact" />;
}

export function MinimalLayout() {
  return (
    <div className="app-shell">
      <Outlet />
    </div>
  );
}
