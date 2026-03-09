import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { MobileNav } from "./MobileNav";

export type ShellMode = "public" | "auth" | "app";

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
  const chromeMode: ShellMode = user && mode === "public" ? "app" : mode;
  const resolvedFooterVariant = user && mode === "public" ? "compact" : footerVariant;

  return (
    <div className={cn("app-shell", `shell-${mode}`)}>
      <div className="shell-orb shell-orb-left" />
      <div className="shell-orb shell-orb-right" />
      <Navbar mode={chromeMode} />
      <main
        className={cn(
          "shell-main flex-1",
          chromeMode === "public" && "pt-6 pb-22 md:pt-8 md:pb-10",
          chromeMode === "auth" && "pt-6 pb-10 md:pt-8",
          chromeMode === "app" && "pt-6 pb-22 md:pt-8 md:pb-10"
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
