"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarContextType {
  isCollapsed: boolean
  toggle: () => void
  isMobile: boolean
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultCollapsed?: boolean
}

export function SidebarProvider({ children, defaultCollapsed = false }: SidebarProviderProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 768
      setIsMobile(isMobileView)
      // Auto-collapse on smaller screens
      if (isMobileView || window.innerWidth < 1024) {
        setIsCollapsed(true)
      }
    }

    // Initial check
    checkMobile()

    // Add resize listener
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const toggle = React.useCallback(() => {
    setIsCollapsed(!isCollapsed)
  }, [isCollapsed])

  return <SidebarContext.Provider value={{ isCollapsed, toggle, isMobile }}>{children}</SidebarContext.Provider>
}

interface SidebarProps {
  children: React.ReactNode
  className?: string
}

export function Sidebar({ children, className }: SidebarProps) {
  const { isCollapsed, isMobile } = useSidebar()

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isCollapsed ? (isMobile ? 0 : 64) : 256,
        opacity: isMobile && isCollapsed ? 0 : 1,
      }}
      transition={{
        duration: 0.2,
        ease: "easeInOut",
      }}
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 overflow-hidden shadow-sm",
        className,
      )}
    >
      <div className="flex flex-col h-full">{children}</div>
    </motion.aside>
  )
}

interface SidebarHeaderProps {
  children: React.ReactNode
  className?: string
}

export function SidebarHeader({ children, className }: SidebarHeaderProps) {
  return <div className={cn("p-3 border-b border-gray-200", className)}>{children}</div>
}

interface SidebarContentProps {
  children: React.ReactNode
  className?: string
}

export function SidebarContent({ children, className }: SidebarContentProps) {
  return <div className={cn("flex-1 overflow-y-auto py-2", className)}>{children}</div>
}

interface SidebarMenuProps {
  children: React.ReactNode
  className?: string
}

export function SidebarMenu({ children, className }: SidebarMenuProps) {
  return <nav className={cn("space-y-1 px-2", className)}>{children}</nav>
}

interface SidebarMenuItemProps {
  icon: React.ReactNode
  label: string
  href?: string
  isActive?: boolean
  onClick?: () => void
  className?: string
}

export function SidebarMenuItem({ icon, label, href, isActive = false, onClick, className }: SidebarMenuItemProps) {
  const { isCollapsed } = useSidebar()

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start h-10 px-3 text-gray-700 hover:bg-gray-100 hover:text-primary",
        isActive && "bg-primary text-white hover:bg-primary hover:text-white",
        isCollapsed && "px-2 justify-center",
        className,
      )}
      onClick={onClick}
    >
      <motion.div
        className="flex items-center gap-3 w-full"
        initial={false}
        animate={{
          justifyContent: isCollapsed ? "center" : "flex-start",
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex-shrink-0 w-5 h-5">{icon}</div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="font-medium text-sm whitespace-nowrap overflow-hidden"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </Button>
  )
}

interface SidebarToggleProps {
  className?: string
}

export function SidebarToggle({ className }: SidebarToggleProps) {
  const { toggle, isCollapsed } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className={cn("h-8 w-8 text-gray-700 border border-gray-300 hover:bg-gray-100 hover:text-primary", className)}
    >
      <motion.div animate={{ rotate: isCollapsed ? 0 : 180 }} transition={{ duration: 0.2 }}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </motion.div>
    </Button>
  )
}
