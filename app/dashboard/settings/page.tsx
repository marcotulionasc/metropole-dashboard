import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { ProductSettings } from "@/components/product-settings"

export default function SettingsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Configurações" text="Gerencie as configurações do dashboard." />
      <div className="grid gap-4">
        <ProductSettings />
      </div>
    </DashboardShell>
  )
}
