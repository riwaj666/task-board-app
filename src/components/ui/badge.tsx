import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'todo' | 'in_progress' | 'in_review' | 'done' | 'low' | 'normal' | 'high';
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-primary text-primary-foreground": variant === "default",
          "border-transparent bg-[#4B5563]/20 text-[#9CA3AF]": variant === "todo",
          "border-transparent bg-[#F59E0B]/20 text-[#FBBF24]": variant === "in_progress",
          "border-transparent bg-[#3B82F6]/20 text-[#60A5FA]": variant === "in_review",
          "border-transparent bg-[#10B981]/20 text-[#34D399]": variant === "done",
          "border-transparent bg-gray-500/20 text-gray-400": variant === "low",
          "border-transparent bg-blue-500/20 text-blue-400": variant === "normal",
          "border-transparent bg-red-500/20 text-red-400": variant === "high",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
