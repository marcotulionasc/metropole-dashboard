import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { LeadStats } from "@/components/lead-stats"

export default function StatsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Estatísticas" text="Métricas e análises dos seus leads." />
      <div className="grid gap-4">
        <LeadStats />
      </div>
    </DashboardShell>
  )
}
