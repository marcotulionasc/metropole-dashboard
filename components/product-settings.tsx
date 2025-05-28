"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { useProductConfig } from "@/hooks/use-product-config"
import { Trash2 } from "lucide-react"

export function ProductSettings() {
  const { products, addProduct, updateProduct, removeProduct } = useProductConfig()
  const [newProductId, setNewProductId] = useState("")
  const [newProductName, setNewProductName] = useState("")

  const handleAddProduct = () => {
    if (!newProductId.trim()) {
      toast({
        title: "Erro",
        description: "O ID do produto é obrigatório.",
        variant: "destructive",
      })
      return
    }

    // Verificar se já existe um produto com o mesmo ID
    if (products.some((p) => p.id === newProductId)) {
      toast({
        title: "Erro",
        description: "Já existe um produto com este ID.",
        variant: "destructive",
      })
      return
    }

    addProduct({
      id: newProductId,
      name: newProductName.trim() || newProductId,
      active: true,
    })

    toast({
      title: "Sucesso",
      description: "Produto adicionado com sucesso.",
    })

    // Limpar campos
    setNewProductId("")
    setNewProductName("")
  }

  const handleToggleActive = (id: string, currentActive: boolean) => {
    updateProduct(id, { active: !currentActive })
    toast({
      title: "Sucesso",
      description: `Produto ${!currentActive ? "ativado" : "desativado"} com sucesso.`,
    })
  }

  const handleRemoveProduct = (id: string) => {
    removeProduct(id)
    toast({
      title: "Sucesso",
      description: "Produto removido com sucesso.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração de Produtos</CardTitle>
        <CardDescription>Gerencie os produtos disponíveis no sistema.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Adicionar Novo Produto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productId">ID do Produto*</Label>
              <Input
                id="productId"
                value={newProductId}
                onChange={(e) => setNewProductId(e.target.value)}
                placeholder="Ex: avenida105"
              />
              <p className="text-xs text-muted-foreground">
                Este é o valor exato que será usado nas consultas ao banco de dados.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="productName">Nome de Exibição</Label>
              <Input
                id="productName"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                placeholder="Ex: Avenida 105"
              />
              <p className="text-xs text-muted-foreground">Nome amigável para exibição (opcional).</p>
            </div>
          </div>
          <Button onClick={handleAddProduct}>Adicionar Produto</Button>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Produtos Existentes</h3>
          {products.length === 0 ? (
            <p className="text-muted-foreground">Nenhum produto configurado.</p>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 border rounded-md">
                  <div>
                    <p className="font-medium">{product.id}</p>
                    <p className="text-sm text-muted-foreground">{product.name}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={product.active}
                        onCheckedChange={() => handleToggleActive(product.id, product.active)}
                        id={`active-${product.id}`}
                      />
                      <Label htmlFor={`active-${product.id}`} className="cursor-pointer">
                        {product.active ? "Ativo" : "Inativo"}
                      </Label>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveProduct(product.id)}
                      className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          As configurações de produtos são salvas automaticamente no navegador.
        </p>
      </CardFooter>
    </Card>
  )
}
