import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectContextValue {
    value: string
    onValueChange: (value: string) => void
    open: boolean
    setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined)

interface SelectProps {
    value?: string
    defaultValue?: string
    onValueChange?: (value: string) => void
    children: React.ReactNode
}

function Select({ value: controlledValue, defaultValue = "", onValueChange, children }: SelectProps) {
    const [internalValue, setInternalValue] = React.useState(defaultValue)
    const [open, setOpen] = React.useState(false)

    const value = controlledValue !== undefined ? controlledValue : internalValue
    const handleValueChange = (newValue: string) => {
        if (controlledValue === undefined) {
            setInternalValue(newValue)
        }
        onValueChange?.(newValue)
        setOpen(false)
    }

    return (
        <SelectContext.Provider value={{ value, onValueChange: handleValueChange, open, setOpen }}>
            <div className="relative">{children}</div>
        </SelectContext.Provider>
    )
}

function SelectTrigger({ className, children }: { className?: string; children: React.ReactNode }) {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error("SelectTrigger must be used within Select")

    return (
        <button
            type="button"
            onClick={() => context.setOpen(!context.open)}
            className={cn(
                "flex h-12 w-full items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50 transition-all",
                className
            )}
        >
            {children}
            <ChevronDown className={cn("h-4 w-4 text-[var(--color-text-muted)] transition-transform", context.open && "rotate-180")} />
        </button>
    )
}

function SelectValue({ placeholder }: { placeholder?: string }) {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error("SelectValue must be used within Select")

    return <span className={!context.value ? "text-[var(--color-text-dim)]" : ""}>{context.value || placeholder}</span>
}

function SelectContent({ className, children }: { className?: string; children: React.ReactNode }) {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error("SelectContent must be used within Select")

    if (!context.open) return null

    return (
        <>
            <div className="fixed inset-0 z-40" onClick={() => context.setOpen(false)} />
            <div className={cn("absolute z-50 mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-1 shadow-2xl animate-fade-in max-h-60 overflow-auto", className)}>
                {children}
            </div>
        </>
    )
}

interface SelectItemProps {
    value: string
    className?: string
    children: React.ReactNode
}

function SelectItem({ value, className, children }: SelectItemProps) {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error("SelectItem must be used within Select")

    const isSelected = context.value === value

    return (
        <div
            onClick={() => context.onValueChange(value)}
            className={cn(
                "relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm outline-none transition-colors",
                isSelected
                    ? "bg-[var(--color-primary)] text-white"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-white",
                className
            )}
        >
            {children}
        </div>
    )
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
