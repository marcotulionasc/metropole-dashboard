"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Phone, Eye, ChevronLeft, ChevronRight, Search, Filter, Plus, HelpCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import type { Metropole } from "@/types/metropole"
import { useProductConfig } from "@/hooks/use-product-config"

const LEAD_STATUS = [
  { value: "NOVO", label: "Novo", color: "bg-blue-500" },
  { value: "CONTATO_FEITO", label: "Contato Feito", color: "bg-yellow-500" },
  { value: "QUALIFICADO", label: "Qualificado", color: "bg-green-500" },
  { value: "NÃO_QUALIFICADO", label: "Não Qualificado", color: "border-red-400 text-red-400" },
  { value: "QUALIFICADO_OP", label: "Qualificado OP", color: "bg-purple-500" },
  { value: "PROPOSTA", label: "Proposta", color: "bg-orange-500" },
  { value: "FECHADO", label: "Fechado", color: "bg-teal-500" },
]

interface MetropoleListProps {
  onProductChange?: (product: string) => void
  onStatusUpdate?: () => void
}

export function MetropoleList({ onProductChange, onStatusUpdate }: MetropoleListProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [metropoles, setMetropoles] = useState<Metropole[]>([])
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const tenantId = "2"
  const [product, setProduct] = useState<string>("citygalleria") // Alterado para citygalleria
  const [searchTerm, setSearchTerm] = useState("")
  const { products } = useProductConfig()
  const [sourceFilter, setSourceFilter] = useState<string>("all")

  // Paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchMetropoles()
    if (onProductChange) {
      onProductChange(product)
    }
  }, [product])

  const fetchMetropoles = async () => {
    setLoading(true)
    try {
      const response = await fetch(`https://backend-ingressar.onrender.com/metropole/v1/data/${tenantId}/${product}`)
      if (!response.ok) {
        throw new Error("Falha ao buscar dados")
      }
      const data = await response.json()
      setMetropoles(data)
      setTotalPages(Math.ceil(data.length / itemsPerPage))
      setCurrentPage(1)
    } catch (error) {
      console.error("Erro ao buscar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleWhatsAppClick = (phone: string, name: string) => {
    const formattedPhone = phone.replace(/\D/g, "")
    const message = encodeURIComponent(
      `Olá ${name}, estamos entrando em contato sobre seu interesse em nossos produtos.`,
    )
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, "_blank")
  }

  const handleUpdateStatus = async (id: number, status: string) => {
    setUpdatingId(id)
    try {
      const response = await fetch(`https://backend-ingressar.onrender.com/metropole/v1/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          field03: status,
        }),
      })

      if (!response.ok) {
        throw new Error("Falha ao atualizar lead")
      }

      toast({
        title: "Sucesso!",
        description: `Status do lead atualizado para ${status}.`,
      })

      // Atualizar o lead na lista local
      setMetropoles(metropoles.map((lead) => (lead.id === id ? { ...lead, field03: status } : lead)))

      // Notificar o componente pai para atualizar as estatísticas
      if (onStatusUpdate) {
        onStatusUpdate()
      }
    } catch (error) {
      console.error("Erro ao atualizar status do lead:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o lead.",
        variant: "destructive",
      })
    } finally {
      setUpdatingId(null)
    }
  }

  // Determinar a origem do lead
  const getLeadSource = (lead: Metropole): "quiz" | "premium" => {
    // Verificar se é um lead do Quiz
    if (
      lead.field01 === "yes" ||
      lead.field01 === "no" ||
      lead.field02 === "yes" ||
      lead.field02 === "no" ||
      lead.field06 === "live" ||
      lead.field06 === "invest" ||
      lead.field04 === "yes" ||
      lead.field04 === "no" ||
      lead.field05 === "yes" ||
      lead.field05 === "no"
    ) {
      return "quiz"
    } else {
      // Se não for Quiz, é Premium (Lançamento)
      return "premium"
    }
  }

  // Filtrar leads por termo de busca e origem
  const filteredMetropoles = metropoles.filter((lead) => {
    // Filtro de busca
    const matchesSearch =
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.cellPhone?.includes(searchTerm)

    // Filtro de origem
    const leadSource = getLeadSource(lead)
    const matchesSource =
      sourceFilter === "all" ||
      (sourceFilter === "quiz" && leadSource === "quiz") ||
      (sourceFilter === "premium" && leadSource === "premium")

    return matchesSearch && matchesSource
  })

  // Obter os leads da página atual
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredMetropoles.slice(startIndex, endIndex)
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleRefresh = () => {
    fetchMetropoles()
    if (onStatusUpdate) {
      onStatusUpdate()
    }
  }

  return (
    <div className="w-full overflow-hidden">
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="bg-white text-gray-900 border-b border-gray-200 p-3 sm:p-4">
          <CardTitle className="text-xl font-bold text-gray-900">Leads CRM</CardTitle>
          <CardDescription className="text-gray-600">
            Gerencie seus leads e entre em contato facilmente.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-3 space-y-3">
          {/* Filtros e Busca */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Nome, email ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-primary focus-ring"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Produto</label>
              <Select value={product} onValueChange={setProduct}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-primary focus-ring">
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  {products.map((prod) => (
                    <SelectItem key={prod.id} value={prod.id} className="text-gray-900">
                      {prod.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Origem</label>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-primary focus-ring">
                  <SelectValue placeholder="Todas as origens" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  <SelectItem value="all" className="text-gray-900">
                    Todas as origens
                  </SelectItem>
                  <SelectItem value="quiz" className="text-gray-900">
                    Quiz
                  </SelectItem>
                  <SelectItem value="premium" className="text-gray-900">
                    Premium (Lançamento)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={fetchMetropoles}
                className="w-full bg-primary text-white font-medium hover:bg-primary/90"
              >
                <Filter className="w-4 h-4 mr-2" />
                Buscar
              </Button>
            </div>
          </div>

          {/* Tabela */}
          <div className="rounded border border-gray-200 overflow-hidden bg-white">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
              </div>
            ) : (
              <div className="w-full overflow-x-auto scrollbar-thin">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b border-gray-200">
                      <TableHead className="text-gray-700 font-semibold">Nome</TableHead>
                      <TableHead className="text-gray-700 font-semibold hidden md:table-cell">Email</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Telefone</TableHead>
                      <TableHead className="text-gray-700 font-semibold hidden md:table-cell">Produto</TableHead>
                      <TableHead className="text-gray-700 font-semibold hidden lg:table-cell">Interesse</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Status</TableHead>
                      <TableHead className="text-gray-700 font-semibold hidden lg:table-cell">Origem</TableHead>
                      <TableHead className="text-right text-gray-700 font-semibold">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMetropoles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center h-24 text-gray-500">
                          Nenhum lead encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      getCurrentPageItems().map((item) => {
                        const leadSource = getLeadSource(item)
                        return (
                          <TableRow key={item.id} className="border-b border-gray-100">
                            <TableCell className="font-medium text-gray-900">
                              <div className="truncate max-w-[100px] md:max-w-[150px]">{item.name || "N/A"}</div>
                            </TableCell>
                            <TableCell className="text-gray-600 hidden md:table-cell">
                              <div className="truncate max-w-[100px] lg:max-w-[180px]">{item.email || "N/A"}</div>
                            </TableCell>
                            <TableCell className="text-gray-600">
                              <div className="truncate max-w-[90px]">{item.cellPhone || "N/A"}</div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {item.product && (
                                <Badge variant="outline" className="border-gray-300 text-gray-700 bg-gray-50">
                                  {item.product}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-primary font-medium hidden lg:table-cell">
                              <div className="truncate max-w-[100px]">
                                {leadSource === "quiz" && item.field06 === "live" && "Morar"}
                                {leadSource === "quiz" && item.field06 === "invest" && "Investir"}
                                {leadSource === "premium" && item.interessePrincipal}
                              </div>
                            </TableCell>
                            <TableCell>
                              {updatingId === item.id ? (
                                <Loader2 className="h-4 w-4 animate-spin text-gray-600 mx-auto" />
                              ) : (
                                <Select
                                  value={item.field03 || "NOVO"}
                                  onValueChange={(value) => handleUpdateStatus(item.id, value)}
                                >
                                  <SelectTrigger className="h-8 w-full min-w-[100px] max-w-[120px] bg-white border-gray-300 text-gray-900">
                                    <SelectValue placeholder="Status" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white border-gray-300">
                                    {LEAD_STATUS.map((status) => (
                                      <SelectItem key={status.value} value={status.value} className="text-gray-900">
                                        <div className="flex items-center">
                                          <div
                                            className={`w-2 h-2 rounded-full mr-2 ${status.color.includes("border") ? "bg-transparent border border-red-400" : status.color}`}
                                          ></div>
                                          {status.label}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {leadSource === "quiz" && (
                                <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                                  <HelpCircle className="h-3 w-3 mr-1" />
                                  Quiz
                                </Badge>
                              )}
                              {leadSource === "premium" && (
                                <Badge className="bg-blue-100 text-blue-800 border-blue-300">Premium</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right p-0 pr-2">
                              <div className="flex justify-end gap-1">
                                {updatingId === item.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                                ) : (
                                  <>
                                    {item.cellPhone && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleWhatsAppClick(item.cellPhone, item.name)}
                                        title="Enviar WhatsApp"
                                        className="text-green-600 hover:bg-green-50 h-8 w-8"
                                      >
                                        <Phone className="h-4 w-4" />
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => router.push(`/dashboard/detail/${item.id}`)}
                                      title="Ver detalhes"
                                      className="text-gray-600 hover:bg-gray-100 h-8 w-8"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Paginação */}
          {filteredMetropoles.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="text-xs sm:text-sm text-gray-500">
                <span className="hidden sm:inline">Mostrando página </span>
                {currentPage}
                <span className="hidden sm:inline"> de </span>/{Math.ceil(filteredMetropoles.length / itemsPerPage)}
                <span className="hidden sm:inline">({filteredMetropoles.length} leads)</span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1 || loading}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 h-8 px-2"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Anterior</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === Math.ceil(filteredMetropoles.length / itemsPerPage) || loading}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 h-8 px-2"
                >
                  <span className="hidden sm:inline">Próxima</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 bg-gray-50 border-t border-gray-200 p-3">
          <Button variant="outline" onClick={handleRefresh} className="border-gray-300 text-gray-700 hover:bg-gray-100">
            Atualizar
          </Button>
          <Button
            onClick={() => router.push("/dashboard/create")}
            className="bg-primary text-white font-medium hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Lead
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
