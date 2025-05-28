"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Phone, ArrowLeft, Mail, User, Building, Calendar, Hash } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { Metropole } from "@/types/metropole"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const LEAD_STATUS = [
  { value: "NOVO", label: "Novo", color: "bg-blue-500" },
  { value: "CONTATO_FEITO", label: "Contato Feito", color: "bg-yellow-500" },
  { value: "QUALIFICADO", label: "Qualificado", color: "bg-green-500" },
  { value: "NÃO_QUALIFICADO", label: "Não Qualificado", color: "bg-red-500" },
  { value: "QUALIFICADO_OP", label: "Qualificado OP", color: "bg-purple-500" },
  { value: "PROPOSTA", label: "Proposta", color: "bg-orange-500" },
  { value: "FECHADO", label: "Fechado", color: "bg-teal-500" },
]

interface LeadDetailsProps {
  id: string
}

export function LeadDetails({ id }: LeadDetailsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [lead, setLead] = useState<Metropole | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [leadSource, setLeadSource] = useState<string>("Desconhecido")

  useEffect(() => {
    const fetchLead = async () => {
      try {
        console.log("Buscando lead com ID:", id)

        // Primeiro, tenta buscar com o produto padrão
        let response = await fetch(`https://backend-ingressar.onrender.com/metropole/v1/data/2/avenida105`)

        if (!response.ok) {
          throw new Error("Falha ao buscar dados")
        }

        let data = await response.json()
        console.log("Dados recebidos (avenida105):", data.length, "leads")

        // Procura o lead pelo ID
        let foundLead = data.find((m: Metropole) => {
          // Converte ambos para string para comparação
          return String(m.id) === String(id)
        })

        // Se não encontrou, tenta buscar em citygalleria
        if (!foundLead) {
          console.log("Lead não encontrado em avenida105, tentando citygalleria...")
          response = await fetch(`https://backend-ingressar.onrender.com/metropole/v1/data/2/citygalleria`)

          if (response.ok) {
            data = await response.json()
            console.log("Dados recebidos (citygalleria):", data.length, "leads")
            foundLead = data.find((m: Metropole) => String(m.id) === String(id))
          }
        }

        // Se ainda não encontrou, tenta buscar em default
        if (!foundLead) {
          console.log("Lead não encontrado nos produtos, tentando default...")
          response = await fetch(`https://backend-ingressar.onrender.com/metropole/v1/data/2/default`)

          if (response.ok) {
            data = await response.json()
            console.log("Dados recebidos (default):", data.length, "leads")
            foundLead = data.find((m: Metropole) => String(m.id) === String(id))
          }
        }

        if (foundLead) {
          console.log("Lead encontrado:", foundLead)
          setLead(foundLead)

          // Determinar a origem do lead
          if (
            foundLead.field01 === "yes" ||
            foundLead.field01 === "no" ||
            foundLead.field02 === "yes" ||
            foundLead.field02 === "no" ||
            foundLead.field06 === "live" ||
            foundLead.field06 === "invest"
          ) {
            setLeadSource("Quiz")
          } else {
            setLeadSource("Premium (Lançamento)")
          }
        } else {
          console.error("Lead não encontrado em nenhuma fonte")
          toast({
            title: "Erro",
            description: "Lead não encontrado",
            variant: "destructive",
          })
          // Aguarda um pouco antes de redirecionar para o usuário ver a mensagem
          setTimeout(() => {
            router.push("/dashboard")
          }, 2000)
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao buscar o lead.",
          variant: "destructive",
        })
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } finally {
        setLoading(false)
      }
    }

    fetchLead()
  }, [id, router])

  const handleWhatsAppClick = () => {
    if (lead?.cellPhone) {
      const formattedPhone = lead.cellPhone.replace(/\D/g, "")
      const message = encodeURIComponent(
        `Olá ${lead.name || "cliente"}, estamos entrando em contato sobre seu interesse em nossos produtos.`,
      )
      window.open(`https://wa.me/${formattedPhone}?text=${message}`, "_blank")
    }
  }

  const handleEmailClick = () => {
    if (lead?.email) {
      const subject = encodeURIComponent("Contato sobre seu interesse em nossos produtos")
      const body = encodeURIComponent(
        `Olá ${lead.name || "cliente"},\n\nEstamos entrando em contato sobre seu interesse em nossos produtos.\n\nAtenciosamente,\nEquipe Metropole`,
      )
      window.open(`mailto:${lead.email}?subject=${subject}&body=${body}`, "_blank")
    }
  }

  const handleUpdateStatus = async (status: string) => {
    if (!lead) return

    setUpdatingStatus(true)
    try {
      const response = await fetch(`https://backend-ingressar.onrender.com/metropole/v1/update/${lead.id}`, {
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

      // Atualizar o lead localmente
      setLead({
        ...lead,
        field03: status,
      })
    } catch (error) {
      console.error("Erro ao atualizar status do lead:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o lead.",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (!lead) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-600">Lead não encontrado.</p>
        </CardContent>
      </Card>
    )
  }

  // Função para verificar se um campo está preenchido
  const isFieldFilled = (value: string | undefined | null) => {
    return value !== undefined && value !== null && value !== "" && String(value).trim() !== ""
  }

  // Função para formatar data de forma segura
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Não informado"
    try {
      return new Date(dateString).toLocaleDateString("pt-BR")
    } catch {
      return "Data inválida"
    }
  }

  // Coleta todos os campos personalizados
  const customFields = [
    { name: "Field 01", value: lead.field01, key: "field01" },
    { name: "Field 02", value: lead.field02, key: "field02" },
    { name: "Field 03", value: lead.field03, key: "field03" },
    { name: "Field 04", value: lead.field04, key: "field04" },
    { name: "Field 05", value: lead.field05, key: "field05" },
    { name: "Field 06", value: lead.field06, key: "field06" },
    { name: "Field 07", value: lead.field07, key: "field07" },
    { name: "Field 08", value: lead.field08, key: "field08" },
    { name: "Field 09", value: lead.field09, key: "field09" },
    { name: "Field 10", value: lead.field10, key: "field10" },
    { name: "Field 11", value: lead.field11, key: "field11" },
    { name: "Field 12", value: lead.field12, key: "field12" },
    { name: "Field 13", value: lead.field13, key: "field13" },
    { name: "Field 14", value: lead.field14, key: "field14" },
    { name: "Field 15", value: lead.field15, key: "field15" },
    { name: "Field 16", value: lead.field16, key: "field16" },
    { name: "Field 17", value: lead.field17, key: "field17" },
    { name: "Field 18", value: lead.field18, key: "field18" },
    { name: "Field 19", value: lead.field19, key: "field19" },
    { name: "Field 20", value: lead.field20, key: "field20" },
  ]

  const filledCustomFields = customFields.filter((field) => isFieldFilled(field.value))

  // Determinar o interesse (Morar ou Investir)
  let interesse = lead.interessePrincipal || "Não informado"

  // Para leads do quiz
  if (lead.field06 === "live") {
    interesse = "Morar"
  } else if (lead.field06 === "invest") {
    interesse = "Investir"
  }

  // Mapear as respostas do quiz para exibição amigável
  const getQuizAnswerLabel = (field: string, value: string | undefined) => {
    if (!value) return "Não respondido"

    // Se o leadSource não for Quiz, retornar o valor diretamente
    if (leadSource !== "Quiz") {
      return value
    }

    // Para leads do Quiz, converter os valores yes/no para textos completos
    if (field === "interest") {
      return value === "yes" ? "Sim, mas achei que fosse caro demais." : "Não, ainda não considerei."
    } else if (field === "awareness") {
      return value === "no" ? "Não sabia. Isso me interessou." : "Já sabia, e por isso quero ver mais."
    } else if (field === "purpose") {
      return value === "live"
        ? "Um imóvel pra morar com localização e padrão."
        : "Um investimento com alto potencial de valorização."
    } else if (field === "financing") {
      return value === "yes" ? "Sim, pretendo usar FGTS ou Financiamento." : "Não preciso."
    } else if (field === "consultant") {
      return value === "yes" ? "Sim, quero mais detalhes direto com alguém." : "Não, só estou olhando por curiosidade."
    }

    return value
  }

  // Obter status atual
  const currentStatus = LEAD_STATUS.find((s) => s.value === lead.field03) || LEAD_STATUS[0]

  return (
    <div className="space-y-6 w-full">
      {/* Header do Lead */}
      <Card className="bg-primary text-white">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-secondary" />
                <CardTitle className="text-2xl font-bold">Lead #{lead.id}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-secondary" />
                <h2 className="text-xl">{lead.name || "Nome não informado"}</h2>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Cadastrado em {formatDate(lead.createdAt)}</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 items-start sm:items-end">
              <Badge className={`${currentStatus.color} text-white border-0 px-3 py-1`}>{currentStatus.label}</Badge>
              {lead.product && (
                <Badge variant="secondary" className="bg-secondary text-primary">
                  <Building className="h-3 w-3 mr-1" />
                  {lead.product}
                </Badge>
              )}
              <Badge variant="outline" className="border-white/50 text-white">
                Origem: {leadSource}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Status Update Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Status do Lead</CardTitle>
          <CardDescription>Atualize o status deste lead no funil de vendas</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={lead.field03 || "NOVO"} onValueChange={handleUpdateStatus} disabled={updatingStatus}>
            <SelectTrigger className="w-full sm:w-80">
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              {LEAD_STATUS.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                    {status.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Informações Detalhadas */}
      <Tabs defaultValue="contato" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100">
          <TabsTrigger value="contato">Contato</TabsTrigger>
          <TabsTrigger value="negocio">Negócio</TabsTrigger>
          <TabsTrigger value="campos">Campos Adicionais</TabsTrigger>
        </TabsList>

        {/* Aba de Contato */}
        <TabsContent value="contato">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                Informações de Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <p className="text-gray-900 font-medium pl-6">{lead.email || "Não informado"}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm font-medium">Telefone/WhatsApp</span>
                  </div>
                  <p className="text-gray-900 font-medium pl-6">{lead.cellPhone || "Não informado"}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                {lead.cellPhone && (
                  <Button onClick={handleWhatsAppClick} className="bg-green-600 hover:bg-green-700 text-white">
                    <Phone className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                )}
                {lead.email && (
                  <Button onClick={handleEmailClick} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Negócio */}
        <TabsContent value="negocio">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                Informações do Negócio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-600">Produto de Interesse</span>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <p className="text-gray-900 font-medium">{lead.product || "Não informado"}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-600">Interesse Principal</span>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <p className="text-gray-900 font-medium">{interesse}</p>
                  </div>
                </div>
              </div>

              {/* Exibir campos específicos do Quiz */}
              {leadSource === "Quiz" && (
                <div className="space-y-4 pt-4">
                  {lead.field01 && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-gray-600">
                        Já pensou em morar ou investir perto do Galleria Shopping?
                      </span>
                      <div className="p-3 bg-gray-50 rounded-md border">
                        <p className="text-gray-700">{getQuizAnswerLabel("interest", lead.field01)}</p>
                      </div>
                    </div>
                  )}

                  {lead.field02 && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-gray-600">Sabia sobre a valorização da região?</span>
                      <div className="p-3 bg-gray-50 rounded-md border">
                        <p className="text-gray-700">{getQuizAnswerLabel("awareness", lead.field02)}</p>
                      </div>
                    </div>
                  )}

                  {lead.field04 && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-gray-600">Uso de FGTS ou financiamento</span>
                      <div className="p-3 bg-gray-50 rounded-md border">
                        <p className="text-gray-700">{getQuizAnswerLabel("financing", lead.field04)}</p>
                      </div>
                    </div>
                  )}

                  {lead.field05 && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-gray-600">Interesse em conversar com consultor</span>
                      <div className="p-3 bg-gray-50 rounded-md border">
                        <p className="text-gray-700">{getQuizAnswerLabel("consultant", lead.field05)}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Exibir campos específicos do Premium (Lançamento) */}
              {leadSource === "Premium (Lançamento)" && (
                <div className="space-y-4 pt-4">
                  {lead.field01 && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-gray-600">Situação financeira</span>
                      <div className="p-3 bg-gray-50 rounded-md border">
                        <p className="text-gray-700">{lead.field01}</p>
                      </div>
                    </div>
                  )}

                  {lead.field02 && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-gray-600">Tempo de busca</span>
                      <div className="p-3 bg-gray-50 rounded-md border">
                        <p className="text-gray-700">{lead.field02}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Campos Adicionais */}
        <TabsContent value="campos">
          <Card>
            <CardHeader>
              <CardTitle>Campos Adicionais</CardTitle>
              <CardDescription>
                {filledCustomFields.length > 0
                  ? `${filledCustomFields.length} campos preenchidos`
                  : "Nenhum campo adicional preenchido"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filledCustomFields.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filledCustomFields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <span className="text-sm font-medium text-gray-600">{field.name}</span>
                      <div className="p-3 bg-gray-50 rounded-md border">
                        <p className="text-gray-700 text-sm break-words">{String(field.value)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum campo adicional foi preenchido para este lead.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer Actions */}
      <Card>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
          <Button variant="outline" onClick={() => router.push("/dashboard")} className="w-full sm:w-auto">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Lista
          </Button>

          <div className="flex gap-3 w-full sm:w-auto">
            {lead.cellPhone && (
              <Button
                onClick={handleWhatsAppClick}
                className="flex-1 sm:flex-initial bg-green-600 hover:bg-green-700 text-white"
              >
                <Phone className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>
            )}

            {lead.email && (
              <Button
                onClick={handleEmailClick}
                className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Mail className="mr-2 h-4 w-4" />
                Email
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
