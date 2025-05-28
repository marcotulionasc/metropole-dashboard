import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { DashboardNav } from "@/components/dashboard-nav"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ProductConfigProvider } from "@/hooks/use-product-config"
import { Toaster } from "@/components/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Metropole Dashboard",
  description: "Dashboard para gerenciamento de dados da Metropole",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <ProductConfigProvider>
            <SidebarProvider>
              <div className="flex min-h-screen bg-white overflow-hidden">
                <DashboardNav />
                <main className="flex-1 ml-0 md:ml-16 lg:ml-64 transition-all duration-200 ease-in-out w-full overflow-x-hidden">
                  <div className="container mx-auto p-2 md:p-4 lg:p-6 max-w-full">{children}</div>
                </main>
              </div>
              <Toaster />
            </SidebarProvider>
          </ProductConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
