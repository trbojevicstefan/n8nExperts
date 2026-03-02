import * as React from "react"
import { cn } from "@/lib/utils"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    src?: string | null
    alt?: string
    fallback?: string
    size?: "sm" | "default" | "lg"
}

function Avatar({ src, alt, fallback, size = "default", className, ...props }: AvatarProps) {
    const [imageError, setImageError] = React.useState(false)

    const sizeStyles = {
        sm: "h-8 w-8 text-xs",
        default: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
    }

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <div
            className={cn(
                "relative flex shrink-0 overflow-hidden rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)]",
                sizeStyles[size],
                className
            )}
            {...props}
        >
            {src && !imageError ? (
                <img
                    src={src}
                    alt={alt || fallback}
                    className="aspect-square h-full w-full object-cover"
                    onError={() => setImageError(true)}
                />
            ) : (
                <span className="flex h-full w-full items-center justify-center bg-[var(--color-primary)]/20 font-medium text-[var(--color-primary)]">
                    {fallback ? getInitials(fallback) : alt?.charAt(0).toUpperCase()}
                </span>
            )}
        </div>
    )
}

export { Avatar }
