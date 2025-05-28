"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts"
import { Loader2, Building } from "lucide-react"
import type { Metropole } from "@/types/metropole"
import { useProductConfig } from "@/hooks/use-product-config"

// Constante com os status oficiais
const LEAD_STATUS = [
  { value: "NOVO", label: "Novo", color: "#3B82F6" },
  { value: "CONTATO_FEITO", label: "Contato Feito", color: "#EAB308" },
  { value: "QUALIFICADO", label: "Qualificado", color: "#22C55E" },
  { value: "NÃO_QUALIFICADO", label: "Não Qualificado", color: "#EF4444" },
  { value: "QUALIFICADO_OP", label: "Qualificado OP", color: "#A855F7" },
  { value: "PROPOSTA", label: "Proposta", color: "#F97316" },
  { value: "FECHADO", label: "Fechado", color: "#14B8A6" },
]

export function LeadStats() {
  const [loading, setLoading] = useState(true)
  const [allLeads, setAllLeads] = useState<Metropole[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string>("citygalleria")
  const { products } = useProductConfig()
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200)

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar leads de todos os produtos
        const [avenida105Response, cityGalleriaResponse] = await Promise.all([
          fetch(`https://backend-ingressar.onrender.com/metropole/v1/data/2/avenida105`),
          fetch(`https://backend-ingressar.onrender.com/metropole/v1/data/2/citygalleria`),
        ])

        const avenida105Data = avenida105Response.ok ? await avenida105Response.json() : []
        const cityGalleriaData = cityGalleriaResponse.ok ? await cityGalleriaResponse.json() : []

        // Combinar todos os leads
        const combinedLeads = [...avenida105Data, ...cityGalleriaData]
        setAllLeads(combinedLeads)
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filtrar leads baseado no produto selecionado
  const leads = selectedProduct === "all" ? allLeads : allLeads.filter((lead) => lead.product === selectedProduct)

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-60">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </CardContent>
      </Card>
    )
  }

  // Processar dados para gráficos
  const COLORS = ["#2E0854", "#CAFF00", "#4B0082", "#9FCC00", "#1A0330", "#E5FF66"]

  const getProductStats = () => {
    const productCounts: Record<string, number> = {}
    leads.forEach((lead) => {
      if (lead.product) {
        productCounts[lead.product] = (productCounts[lead.product] || 0) + 1
      }
    })

    return Object.entries(productCounts).map(([name, value]) => ({ name, value }))
  }

  const getInterestStats = () => {
    const interestCounts: Record<string, number> = {}
    leads.forEach((lead) => {
      if (lead.interessePrincipal) {
        interestCounts[lead.interessePrincipal] = (interestCounts[lead.interessePrincipal] || 0) + 1
      }
    })

    return Object.entries(interestCounts).map(([name, value]) => ({ name, value }))
  }

  const getLeadsByDate = () => {
    const dateMap: Record<string, number> = {}
    leads.forEach((lead) => {
      const date = new Date(lead.createdAt).toLocaleDateString("pt-BR")
      dateMap[date] = (dateMap[date] || 0) + 1
    })

    // Determine how many days to show based on screen width
    const daysToShow = windowWidth < 768 ? 7 : 15

    return Object.entries(dateMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => {
        const [dayA, monthA, yearA] = a.date.split("/")
        const [dayB, monthB, yearB] = b.date.split("/")
        return new Date(`${yearA}-${monthA}-${dayA}`).getTime() - new Date(`${yearB}-${monthB}-${dayB}`).getTime()
      })
      .slice(-daysToShow) // Adaptativo baseado no tamanho da tela
  }

  // Processar dados de status
  const getStatusStats = () => {
    const statusCounts: Record<string, number> = {}

    // Inicializar todos os status com 0
    LEAD_STATUS.forEach((status) => {
      statusCounts[status.value] = 0
    })

    // Contar leads por status
    leads.forEach((lead) => {
      const status = lead.field03 || "NOVO"
      if (statusCounts[status] !== undefined) {
        statusCounts[status]++
      }
    })

    // Converter para formato do gráfico
    return LEAD_STATUS.map((status) => ({
      name: status.label,
      value: statusCounts[status.value],
      color: status.color,
    }))
  }

  const productData = getProductStats()
  const interestData = getInterestStats()
  const leadsByDate = getLeadsByDate()
  const statusData = getStatusStats()

  // Função para determinar a altura do gráfico baseado no tamanho da tela
  const getChartHeight = () => {
    if (windowWidth < 640) return 200
    if (windowWidth < 1024) return 250
    return 300
  }

  // Função para determinar o ângulo do texto do eixo X baseado no tamanho da tela
  const getXAxisAngle = () => {
    return windowWidth < 640 ? -90 : -45
  }

  // Função para determinar o tamanho da fonte baseado no tamanho da tela
  const getFontSize = () => {
    return windowWidth < 640 ? 8 : 10
  }

  return (
    <div className="space-y-4 w-full overflow-hidden">
      {/* Filtro de Produto */}
      <Card className="bg-primary border-white/20">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-secondary" />
              <label className="text-sm font-semibold text-white drop-shadow-md">Filtrar por Produto:</label>
            </div>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger className="w-full sm:w-64 bg-transparent border-white/60 text-white placeholder-white/70 focus:ring-2 focus:ring-secondary focus:border-secondary shadow-md">
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent className="bg-primary border-white/60">
                <SelectItem value="all" className="text-white hover:bg-secondary/20 focus:bg-secondary/30">
                  Todos os Produtos
                </SelectItem>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id} className="text-white hover:bg-secondary/20 focus:bg-secondary/30">
                    {product.name || product.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProduct !== "all" && (
              <div className="ml-auto text-sm text-white/70 hidden sm:block">
                Mostrando dados de: <span className="font-medium text-secondary">{selectedProduct}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="status">
        <div className="w-full overflow-x-auto scrollbar-thin">
          <TabsList className="mb-4 bg-gray-100 w-full flex-nowrap border border-gray-200">
            <TabsTrigger
              value="status"
              className="data-[state=active]:bg-primary data-[state=active]:text-white text-gray-700 hover:text-gray-900"
            >
              Status
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="data-[state=active]:bg-primary data-[state=active]:text-white text-gray-700 hover:text-gray-900"
            >
              Linha do Tempo
            </TabsTrigger>
            {selectedProduct === "all" && (
              <TabsTrigger
                value="products"
                className="data-[state=active]:bg-primary data-[state=active]:text-white text-gray-700 hover:text-gray-900"
              >
                Produtos
              </TabsTrigger>
            )}
            <TabsTrigger
              value="interests"
              className="data-[state=active]:bg-primary data-[state=active]:text-white text-gray-700 hover:text-gray-900"
            >
              Interesses
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="status">
          <div className="grid gap-4">
            {/* Cards de resumo */}
            <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
              <Card className="border-gray-200 bg-white">
                <CardHeader className="pb-2 bg-primary text-white p-2 sm:p-3">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total de Leads</CardTitle>
                </CardHeader>
                <CardContent className="pt-2 p-2 sm:p-3">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">{leads.length}</div>
                  {selectedProduct !== "all" && (
                    <p className="text-xs text-gray-600 mt-1">
                      {Math.round((leads.length / allLeads.length) * 100)}% do total
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-gray-200 bg-white">
                <CardHeader className="pb-2 bg-green-600 text-white p-2 sm:p-3">
                  <CardTitle className="text-xs sm:text-sm font-medium">Leads Qualificados</CardTitle>
                </CardHeader>
                <CardContent className="pt-2 p-2 sm:p-3">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">
                    {leads.filter((lead) => lead.field03 === "QUALIFICADO" || lead.field03 === "QUALIFICADO_OP").length}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {leads.length > 0
                      ? Math.round(
                          (leads.filter((lead) => lead.field03 === "QUALIFICADO" || lead.field03 === "QUALIFICADO_OP")
                            .length /
                            leads.length) *
                            100,
                        )
                      : 0}
                    % do total
                  </p>
                </CardContent>
              </Card>

              <Card className="border-gray-200 bg-white">
                <CardHeader className="pb-2 bg-orange-600 text-white p-2 sm:p-3">
                  <CardTitle className="text-xs sm:text-sm font-medium">Em Proposta</CardTitle>
                </CardHeader>
                <CardContent className="pt-2 p-2 sm:p-3">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">
                    {leads.filter((lead) => lead.field03 === "PROPOSTA").length}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {leads.length > 0
                      ? Math.round((leads.filter((lead) => lead.field03 === "PROPOSTA").length / leads.length) * 100)
                      : 0}
                    % do total
                  </p>
                </CardContent>
              </Card>

              <Card className="border-gray-200 bg-white">
                <CardHeader className="pb-2 bg-teal-600 text-white p-2 sm:p-3">
                  <CardTitle className="text-xs sm:text-sm font-medium">Fechados</CardTitle>
                </CardHeader>
                <CardContent className="pt-2 p-2 sm:p-3">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">
                    {leads.filter((lead) => lead.field03 === "FECHADO").length}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Taxa de conversão:{" "}
                    {leads.length > 0
                      ? Math.round((leads.filter((lead) => lead.field03 === "FECHADO").length / leads.length) * 100)
                      : 0}
                    %
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de distribuição de status */}
            <Card className="border-white/20">
              <CardHeader className="bg-primary text-white p-2 sm:p-3">
                <CardTitle className="text-base sm:text-lg">
                  Distribuição por Status
                  {selectedProduct !== "all" && (
                    <span className="text-xs sm:text-sm font-normal text-white/70 ml-2">
                      ({products.find((p) => p.id === selectedProduct)?.name || selectedProduct})
                    </span>
                  )}
                </CardTitle>
                <CardDescription className="text-white/80 text-xs sm:text-sm">
                  Visualização do funil de vendas
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 p-2 sm:p-4">
                <div style={{ height: getChartHeight(), width: "100%" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={statusData}
                      margin={{ top: 10, right: 10, left: 0, bottom: windowWidth < 640 ? 60 : 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="name"
                        angle={getXAxisAngle()}
                        textAnchor="end"
                        height={windowWidth < 640 ? 80 : 60}
                        tick={{ fill: "#374151", fontSize: getFontSize() }}
                        interval={0}
                      />
                      <YAxis tick={{ fill: "#374151", fontSize: getFontSize() }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          fontSize: "12px",
                          color: "#ffffff",
                        }}
                        labelStyle={{ color: "#ffffff" }}
                      />
                      <Bar dataKey="value" name="Leads">
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <Card className="border-white/20">
            <CardHeader className="bg-primary text-white p-2 sm:p-3">
              <CardTitle className="text-base sm:text-lg">
                Leads por Data
                {selectedProduct !== "all" && (
                  <span className="text-xs sm:text-sm font-normal text-white/70 ml-2">
                    ({products.find((p) => p.id === selectedProduct)?.name || selectedProduct})
                  </span>
                )}
              </CardTitle>
              <CardDescription className="text-white/80 text-xs sm:text-sm">
                Evolução de novos leads nos últimos {windowWidth < 768 ? 7 : 15} dias
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 p-2 sm:p-4">
              <div style={{ height: getChartHeight(), width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={leadsByDate}
                    margin={{ top: 10, right: 10, left: 0, bottom: windowWidth < 640 ? 60 : 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      angle={getXAxisAngle()}
                      textAnchor="end"
                      height={windowWidth < 640 ? 80 : 60}
                      tick={{ fill: "#374151", fontSize: getFontSize() }}
                      interval={0}
                    />
                    <YAxis tick={{ fill: "#374151", fontSize: getFontSize() }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#ffffff",
                      }}
                      labelStyle={{ color: "#ffffff" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#CAFF00"
                      strokeWidth={3}
                      dot={{ fill: "#CAFF00", r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Novos Leads"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {selectedProduct === "all" && (
          <TabsContent value="products">
            <Card className="border-white/20">
              <CardHeader className="bg-primary text-white p-2 sm:p-3">
                <CardTitle className="text-base sm:text-lg">Leads por Produto</CardTitle>
                <CardDescription className="text-white/80 text-xs sm:text-sm">
                  Distribuição de leads por produto de interesse
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 p-2 sm:p-4">
                <div style={{ height: getChartHeight(), width: "100%" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={productData}
                        cx="50%"
                        cy="50%"
                        labelLine={windowWidth > 640}
                        label={
                          windowWidth > 640
                            ? ({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`
                            : undefined
                        }
                        outerRadius={windowWidth < 640 ? 60 : 80}
                        fill="#CAFF00"
                        dataKey="value"
                      >
                        {productData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#2E0854",
                          border: "1px solid #CAFF00",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="interests">
          <Card className="border-white/20">
            <CardHeader className="bg-primary text-white p-2 sm:p-3">
              <CardTitle className="text-base sm:text-lg">
                Leads por Interesse
                {selectedProduct !== "all" && (
                  <span className="text-xs sm:text-sm font-normal text-white/70 ml-2">
                    ({products.find((p) => p.id === selectedProduct)?.name || selectedProduct})
                  </span>
                )}
              </CardTitle>
              <CardDescription className="text-white/80 text-xs sm:text-sm">
                Distribuição de leads por interesse principal
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 p-2 sm:p-4">
              <div style={{ height: getChartHeight(), width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={interestData}
                      cx="50%"
                      cy="50%"
                      labelLine={windowWidth > 640}
                      label={
                        windowWidth > 640 ? ({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%` : undefined
                      }
                      outerRadius={windowWidth < 640 ? 60 : 80}
                      fill="#CAFF00"
                      dataKey="value"
                    >
                      {interestData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#2E0854",
                        border: "1px solid #CAFF00",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
