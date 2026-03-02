import * as React from "react"
import { cn } from "@/lib/utils"

type DropdownMenuProps = {
    children: React.ReactNode
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
    const [open, setOpen] = React.useState(false)

    return (
        <DropdownContext.Provider value={{ open, setOpen }}>
            <div className="relative inline-block text-left">{children}</div>
        </DropdownContext.Provider>
    )
}

interface DropdownContextType {
    open: boolean
    setOpen: (open: boolean) => void
}

const DropdownContext = React.createContext<DropdownContextType | undefined>(undefined)

const DropdownMenuTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
    const context = React.useContext(DropdownContext)
    if (!context) throw new Error("DropdownMenuTrigger must be used within DropdownMenu")

    return (
        <button
            ref={ref}
            className={cn("inline-flex items-center justify-center", className)}
            onClick={() => context.setOpen(!context.open)}
            {...props}
        >
            {children}
        </button>
    )
})
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "center" | "end" }
>(({ className, align = "end", children, ...props }, ref) => {
    const context = React.useContext(DropdownContext)
    if (!context) throw new Error("DropdownMenuContent must be used within DropdownMenu")

    if (!context.open) return null

    const alignmentClasses = {
        start: "left-0",
        center: "left-1/2 -translate-x-1/2",
        end: "right-0",
    }

    return (
        <>
            <div className="fixed inset-0 z-40" onClick={() => context.setOpen(false)} />
            <div
                ref={ref}
                className={cn(
                    "absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 text-slate-900 shadow-lg",
                    alignmentClasses[align],
                    className
                )}
                {...props}
            >
                {children}
            </div>
        </>
    )
})
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => {
    const context = React.useContext(DropdownContext)

    return (
        <div
            ref={ref}
            className={cn(
                "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100",
                inset && "pl-8",
                className
            )}
            onClick={() => context?.setOpen(false)}
            {...props}
        />
    )
})
DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuSeparator = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("-mx-1 my-1 h-px bg-slate-100", className)}
        {...props}
    />
))
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

const DropdownMenuLabel = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)}
        {...props}
    />
))
DropdownMenuLabel.displayName = "DropdownMenuLabel"

export {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
}
