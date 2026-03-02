import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DialogContextValue {
    open: boolean
    setOpen: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextValue | undefined>(undefined)

interface DialogProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    children: React.ReactNode
}

function Dialog({ open: controlledOpen, onOpenChange, children }: DialogProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
    const open = controlledOpen ?? uncontrolledOpen
    const setOpen = onOpenChange ?? setUncontrolledOpen

    return (
        <DialogContext.Provider value={{ open, setOpen }}>
            {children}
        </DialogContext.Provider>
    )
}

function DialogTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
    const context = React.useContext(DialogContext)
    if (!context) throw new Error("DialogTrigger must be used within Dialog")

    const handleClick = () => context.setOpen(true)

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, { onClick: handleClick })
    }

    return <button onClick={handleClick}>{children}</button>
}

function DialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
    const context = React.useContext(DialogContext)
    if (!context) throw new Error("DialogContent must be used within Dialog")

    if (!context.open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => context.setOpen(false)}
            />
            <div
                className={cn(
                    "relative z-50 w-full max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 shadow-2xl animate-fade-in",
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

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("flex flex-col space-y-2 text-center sm:text-left mb-4", className)} {...props} />
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6", className)} {...props} />
}

function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h2 className={cn("text-xl font-semibold text-white", className)} {...props} />
}

function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return <p className={cn("text-sm text-[var(--color-text-muted)]", className)} {...props} />
}

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription }
