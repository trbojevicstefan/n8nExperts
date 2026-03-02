import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "xl" | "icon"
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", children, ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:pointer-events-none disabled:opacity-50"

        const variants = {
            default: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] shadow-lg shadow-[var(--color-primary-glow)] hover:shadow-xl",
            destructive: "bg-[var(--color-error)] text-white hover:bg-red-600",
            outline: "border border-[var(--color-border)] bg-transparent text-white hover:bg-[var(--color-bg-elevated)] hover:border-[var(--color-border-hover)]",
            secondary: "bg-[var(--color-bg-elevated)] text-white border border-[var(--color-border)] hover:bg-[var(--color-bg-card)]",
            ghost: "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-white",
            link: "text-[var(--color-primary)] underline-offset-4 hover:underline",
        }

        const sizes = {
            default: "h-12 px-6 py-3 text-sm",
            sm: "h-9 px-4 py-2 text-xs",
            lg: "h-14 px-8 py-4 text-base",
            xl: "h-16 px-10 py-5 text-lg",
            icon: "h-10 w-10",
        }

        return (
            <button
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                ref={ref}
                {...props}
            >
                {children}
            </button>
        )
    }
)
Button.displayName = "Button"

export { Button }
