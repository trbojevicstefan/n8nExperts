import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
    value?: number[]
    onValueChange?: (value: number[]) => void
    min?: number
    max?: number
    step?: number
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
    ({ className, value = [0], onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            onValueChange?.([parseInt(e.target.value, 10)])
        }

        const percentage = ((value[0] - min) / (max - min)) * 100

        return (
            <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                    <div
                        className="absolute h-full bg-[var(--color-primary)]"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <input
                    ref={ref}
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value[0]}
                    onChange={handleChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    {...props}
                />
                <div
                    className="absolute h-5 w-5 rounded-full border-2 border-[var(--color-primary)] bg-[var(--color-bg-card)] shadow-lg transform -translate-y-1/2 top-1/2 pointer-events-none"
                    style={{ left: `calc(${percentage}% - 10px)` }}
                />
            </div>
        )
    }
)
Slider.displayName = "Slider"

export { Slider }
