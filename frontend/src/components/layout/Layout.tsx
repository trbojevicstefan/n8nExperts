import { Outlet } from "react-router-dom"
import { Navbar } from "./Navbar"
import { Footer } from "./Footer"
import { MobileNav } from "./MobileNav"

export function Layout({ showMobileNav = true }: { showMobileNav?: boolean }) {
    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] flex flex-col">
            <Navbar />
            <main className="flex-1 pt-20 pb-16 md:pb-0">
                <Outlet />
            </main>
            <Footer />
            {showMobileNav && <MobileNav />}
        </div>
    )
}

export function CleanLayout() {
    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] flex flex-col">
            <Navbar />
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    )
}

export function MinimalLayout() {
    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)]">
            <Outlet />
        </div>
    )
}
