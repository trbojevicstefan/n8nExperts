import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsContextValue {
    activeTab: string
    setActiveTab: (tab: string) => void
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined)

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
    defaultValue?: string
    value?: string
    onValueChange?: (value: string) => void
}

function Tabs({ defaultValue, value, onValueChange, className, children, ...props }: TabsProps) {
    const [internalValue, setInternalValue] = React.useState(defaultValue || "")
    const activeTab = value !== undefined ? value : internalValue

    const setActiveTab = (tab: string) => {
        if (value === undefined) {
            setInternalValue(tab)
        }
        onValueChange?.(tab)
    }

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            <div className={cn("", className)} {...props}>
                {children}
            </div>
        </TabsContext.Provider>
    )
}

function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "inline-flex h-12 items-center justify-center rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] p-1 text-[var(--color-text-muted)]",
                className
            )}
            {...props}
        />
    )
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string
}

function TabsTrigger({ value, className, children, ...props }: TabsTriggerProps) {
    const context = React.useContext(TabsContext)
    if (!context) throw new Error("TabsTrigger must be used within Tabs")

    const isActive = context.activeTab === value

    return (
        <button
            type="button"
            onClick={() => context.setActiveTab(value)}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:pointer-events-none disabled:opacity-50",
                isActive
                    ? "bg-[var(--color-bg-card)] text-white shadow-sm"
                    : "text-[var(--color-text-muted)] hover:text-white",
                className
            )}
            {...props}
        >
            {children}
        </button>
    )
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string
}

function TabsContent({ value, className, children, ...props }: TabsContentProps) {
    const context = React.useContext(TabsContext)
    if (!context) throw new Error("TabsContent must be used within Tabs")

    if (context.activeTab !== value) return null

    return (
        <div
            className={cn("mt-4 animate-fade-in", className)}
            {...props}
        >
            {children}
        </div>
    )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
