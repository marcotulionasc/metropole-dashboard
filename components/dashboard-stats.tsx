"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Users, Building, Phone, HelpCircle } from "lucide-react"

interface DashboardStatsProps {
  selectedProduct: string
}

export function DashboardStats({ selectedProduct }: DashboardStatsProps) {
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeadsToday: 0,
    avenida105Leads: 0,
    cityGalleriaLeads: 0,
    quizLeads: 0,
    premiumLeads: 0,
    statusCounts: {
      NOVO: 0,
      CONTATO_FEITO: 0,
      QUALIFICADO: 0,
      NÃO_QUALIFICADO: 0,
      QUALIFICADO_OP: 0,
      PROPOSTA: 0,
      FECHADO: 0,
    },
    noStatusLeads: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)

        // Buscar leads de avenida105
        const avenida105Response = await fetch("https://backend-ingressar.onrender.com/metropole/v1/data/2/avenida105")
        const avenida105Data = avenida105Response.ok ? await avenida105Response.json() : []

        // Buscar leads de citygalleria
        const cityGalleriaResponse = await fetch(
          "https://backend-ingressar.onrender.com/metropole/v1/data/2/citygalleria",
        )
        const cityGalleriaData = cityGalleriaResponse.ok ? await cityGalleriaResponse.json() : []

        // Combinar todos os leads
        const allLeads = [...avenida105Data, ...cityGalleriaData]

        // Filtrar leads baseado no produto selecionado
        const filteredLeads =
          selectedProduct === "all" ? allLeads : allLeads.filter((lead) => lead.product === selectedProduct)

        // Calcular estatísticas
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const newLeadsToday = filteredLeads.filter((lead) => {
          const leadDate = new Date(lead.createdAt)
          return leadDate >= today
        }).length

        // Contar leads por status (usando leads filtrados)
        const statusCounts = {
          NOVO: filteredLeads.filter((lead) => lead.field03 === "NOVO").length,
          CONTATO_FEITO: filteredLeads.filter((lead) => lead.field03 === "CONTATO_FEITO").length,
          QUALIFICADO: filteredLeads.filter((lead) => lead.field03 === "QUALIFICADO").length,
          NÃO_QUALIFICADO: filteredLeads.filter((lead) => lead.field03 === "NÃO_QUALIFICADO").length,
          QUALIFICADO_OP: filteredLeads.filter((lead) => lead.field03 === "QUALIFICADO_OP").length,
          PROPOSTA: filteredLeads.filter((lead) => lead.field03 === "PROPOSTA").length,
          FECHADO: filteredLeads.filter((lead) => lead.field03 === "FECHADO").length,
        }

        // Contar leads sem status definido (usando leads filtrados)
        const noStatusLeads = filteredLeads.filter((lead) => !lead.field03 || lead.field03.trim() === "").length

        // Contar leads por origem
        const quizLeads = filteredLeads.filter(
          (lead) =>
            lead.field01 === "yes" ||
            lead.field01 === "no" ||
            lead.field02 === "yes" ||
            lead.field02 === "no" ||
            lead.field06 === "live" ||
            lead.field06 === "invest" ||
            lead.field04 === "yes" ||
            lead.field04 === "no" ||
            lead.field05 === "yes" ||
            lead.field05 === "no",
        ).length

        const premiumLeads = filteredLeads.length - quizLeads

        setStats({
          totalLeads: filteredLeads.length,
          newLeadsToday,
          avenida105Leads: avenida105Data.length,
          cityGalleriaLeads: cityGalleriaData.length,
          quizLeads,
          premiumLeads,
          statusCounts,
          noStatusLeads,
        })
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [selectedProduct])

  if (loading) {
    return (
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-primary border-white/20">
            <CardContent className="flex justify-center items-center h-24">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4 w-full overflow-hidden">
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <Card className="border-gray-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-2 sm:p-3 bg-primary">
            <CardTitle className="text-xs sm:text-sm font-medium text-white">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent className="p-2 sm:p-3">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalLeads}</div>
            <p className="text-xs text-gray-600 mt-1">{stats.newLeadsToday} novos hoje</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-2 sm:p-3 bg-blue-600">
            <CardTitle className="text-xs sm:text-sm font-medium text-white">Avenida 105</CardTitle>
            <Building className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent className="p-2 sm:p-3">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.avenida105Leads}</div>
            <p className="text-xs text-gray-600 mt-1">
              {Math.round((stats.avenida105Leads / (stats.avenida105Leads + stats.cityGalleriaLeads)) * 100) || 0}% do
              total
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-2 sm:p-3 bg-green-600">
            <CardTitle className="text-xs sm:text-sm font-medium text-white">City Galleria</CardTitle>
            <Building className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent className="p-2 sm:p-3">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.cityGalleriaLeads}</div>
            <p className="text-xs text-gray-600 mt-1">
              {Math.round((stats.cityGalleriaLeads / (stats.avenida105Leads + stats.cityGalleriaLeads)) * 100) || 0}% do
              total
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-2 sm:p-3 bg-orange-600">
            <CardTitle className="text-xs sm:text-sm font-medium text-white">Sem Status</CardTitle>
            <Phone className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent className="p-2 sm:p-3">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.noStatusLeads}</div>
            <p className="text-xs text-gray-600 mt-1">
              {Math.round((stats.noStatusLeads / stats.totalLeads) * 100) || 0}% do total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas por origem */}
      <div className="grid gap-2 grid-cols-1 md:grid-cols-2">
        <Card className="border-gray-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-2 sm:p-3 bg-purple-600">
            <CardTitle className="text-xs sm:text-sm font-medium text-white">Leads do Quiz</CardTitle>
            <HelpCircle className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent className="p-2 sm:p-3">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.quizLeads}</div>
            <p className="text-xs text-gray-600 mt-1">
              {Math.round((stats.quizLeads / stats.totalLeads) * 100) || 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-2 sm:p-3 bg-blue-600">
            <CardTitle className="text-xs sm:text-sm font-medium text-white">Leads Premium</CardTitle>
            <Building className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent className="p-2 sm:p-3">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.premiumLeads}</div>
            <p className="text-xs text-gray-600 mt-1">
              {Math.round((stats.premiumLeads / stats.totalLeads) * 100) || 0}% do total
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-primary border-white/20">
        <CardHeader className="p-3">
          <CardTitle className="text-base sm:text-lg text-white">
            Distribuição por Status
            {selectedProduct !== "all" && (
              <span className="text-xs sm:text-sm font-normal text-white/70 ml-2">
                ({selectedProduct === "avenida105" ? "Avenida 105" : "City Galleria"})
              </span>
            )}
          </CardTitle>
          <CardDescription className="text-white/80 text-xs sm:text-sm">
            Quantidade de leads em cada etapa do funil
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3">
          <div className="space-y-3">
            {Object.entries(stats.statusCounts).map(([status, count]) => {
              const percentage = stats.totalLeads > 0 ? Math.round((count / stats.totalLeads) * 100) : 0
              let statusColor = ""
              let statusLabel = ""

              switch (status) {
                case "NOVO":
                  statusColor = "bg-blue-500"
                  statusLabel = "Novo"
                  break
                case "CONTATO_FEITO":
                  statusColor = "bg-yellow-500"
                  statusLabel = "Contato Feito"
                  break
                case "QUALIFICADO":
                  statusColor = "bg-green-500"
                  statusLabel = "Qualificado"
                  break
                case "NÃO_QUALIFICADO":
                  statusColor = "bg-red-400"
                  statusLabel = "Não Qualificado"
                  break
                case "QUALIFICADO_OP":
                  statusColor = "bg-purple-500"
                  statusLabel = "Qualificado OP"
                  break
                case "PROPOSTA":
                  statusColor = "bg-orange-500"
                  statusLabel = "Proposta"
                  break
                case "FECHADO":
                  statusColor = "bg-teal-500"
                  statusLabel = "Fechado"
                  break
                default:
                  statusColor = "bg-gray-500"
                  statusLabel = status
              }

              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full ${statusColor} mr-2`}></div>
                      <span className="text-xs sm:text-sm font-medium text-white">{statusLabel}</span>
                    </div>
                    <span className="text-xs sm:text-sm text-white/70">
                      {count} <span className="hidden sm:inline">leads</span> ({percentage}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${statusColor}`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
