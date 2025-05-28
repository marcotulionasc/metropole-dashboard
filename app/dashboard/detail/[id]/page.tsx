import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { LeadDetails } from "@/components/lead-details"

export default function DetailPage({ params }: { params: { id: string } }) {
  return (
    <DashboardShell>
      <DashboardHeader heading="Detalhes do Lead" text={`Visualizando lead #${params.id}`} />
      <div className="grid gap-4">
        <LeadDetails id={params.id} />
      </div>
    </DashboardShell>
  )
}
