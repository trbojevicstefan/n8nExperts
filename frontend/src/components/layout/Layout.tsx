import { cn } from "@/lib/utils";
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
  return (
    <div className={cn("app-shell", `shell-${mode}`)}>
      <div className="shell-orb shell-orb-left" />
      <div className="shell-orb shell-orb-right" />
      <Navbar mode={mode} />
      <main
        className={cn(
          "shell-main flex-1",
          mode === "public" && "pt-24 pb-24 md:pb-10",
          mode === "auth" && "pt-22 pb-10",
          mode === "app" && "pt-20 pb-24 md:pb-10"
        )}
      >
        <Outlet />
      </main>
      {footerVariant !== "none" && <Footer tone={footerVariant} />}
      {showMobileNav && mode !== "auth" && <MobileNav />}
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
