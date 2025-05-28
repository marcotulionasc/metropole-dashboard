import type React from "react"

interface DashboardHeaderProps {
  heading: string
  text?: string
  children?: React.ReactNode
}

export function DashboardHeader({ heading, text, children }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1 w-full overflow-hidden">
      <div className="grid gap-1 min-w-0">
        <h1 className="font-bold text-2xl md:text-3xl text-gray-900 truncate">{heading}</h1>
        {text && <p className="text-base text-gray-600 truncate">{text}</p>}
      </div>
      {children && <div className="flex-shrink-0">{children}</div>}
    </div>
  )
}
