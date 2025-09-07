"use client"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface CustomToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  leftLabel?: string
  rightLabel?: string
  className?: string
}

export const CustomToggle = forwardRef<HTMLInputElement, CustomToggleProps>(
  ({ checked, onChange, leftLabel = "VIN", rightLabel = "Manuel", className }, ref) => {
    return (
      <div className={cn("flex flex-col items-center gap-4", className)}>
        {/* Labels */}
        <div className="flex items-center justify-between w-full max-w-xs">
          <span className={cn(
            "text-sm font-medium transition-colors duration-200",
            !checked ? "text-primary" : "text-muted-foreground"
          )}>
            {leftLabel}
          </span>
          <span className={cn(
            "text-sm font-medium transition-colors duration-200",
            checked ? "text-primary" : "text-muted-foreground"
          )}>
            {rightLabel}
          </span>
        </div>

        {/* Toggle Switch */}
        <div className="toggle-container">
          <input
            ref={ref}
            className="toggle-input"
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
          />
          <div className="toggle-handle-wrapper">
            <div className="toggle-handle">
              <div className="toggle-handle-knob"></div>
              <div className="toggle-handle-bar-wrapper">
                <div className="toggle-handle-bar"></div>
              </div>
            </div>
          </div>
          <div className="toggle-base">
            <div className="toggle-base-inside"></div>
          </div>
        </div>
      </div>
    )
  }
)

CustomToggle.displayName = "CustomToggle"
