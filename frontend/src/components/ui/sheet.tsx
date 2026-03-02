import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SheetContextValue {
    open: boolean
    setOpen: (open: boolean) => void
}

const SheetContext = React.createContext<SheetContextValue | undefined>(undefined)

interface SheetProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    children: React.ReactNode
}

function Sheet({ open: controlledOpen, onOpenChange, children }: SheetProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
    const open = controlledOpen ?? uncontrolledOpen
    const setOpen = onOpenChange ?? setUncontrolledOpen

    React.useEffect(() => {
        if (!open) return

        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = "hidden"

        return () => {
            document.body.style.overflow = previousOverflow
        }
    }, [open])

    return (
        <SheetContext.Provider value={{ open, setOpen }}>
            {children}
        </SheetContext.Provider>
    )
}

function SheetTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
    const context = React.useContext(SheetContext)
    if (!context) throw new Error("SheetTrigger must be used within Sheet")

    const handleClick = () => context.setOpen(true)

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, { onClick: handleClick })
    }

    return <button onClick={handleClick}>{children}</button>
}

interface SheetContentProps {
    children: React.ReactNode
    className?: string
    side?: "left" | "right" | "top" | "bottom"
}

function SheetContent({ children, className, side = "right" }: SheetContentProps) {
    const context = React.useContext(SheetContext)
    if (!context) throw new Error("SheetContent must be used within Sheet")

    if (!context.open) return null

    const sideStyles = {
        left: "inset-y-0 left-0 h-full w-3/4 max-w-sm border-r",
        right: "inset-y-0 right-0 h-full w-3/4 max-w-sm border-l",
        top: "inset-x-0 top-0 h-auto border-b",
        bottom: "inset-x-0 bottom-0 h-auto border-t",
    }

    return (
        <div className="fixed inset-0 z-50">
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => context.setOpen(false)}
            />
            <div
                className={cn(
                    "fixed bg-[var(--color-bg-card)] border-[var(--color-border)] p-6 shadow-2xl animate-slide-up",
                    sideStyles[side],
                    className
                )}
            >
                <button
                    onClick={() => context.setOpen(false)}
                    className="absolute right-4 top-4 rounded-lg p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-white transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
                {children}
            </div>
        </div>
    )
}

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("flex flex-col space-y-2 mb-4", className)} {...props} />
}

function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6", className)} {...props} />
}

function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h2 className={cn("text-xl font-semibold text-white", className)} {...props} />
}

function SheetDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return <p className={cn("text-sm text-[var(--color-text-muted)]", className)} {...props} />
}

export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription }
