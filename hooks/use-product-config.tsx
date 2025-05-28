"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"

// Definição do tipo de produto
export interface Product {
  id: string
  name: string
  active: boolean
}

// Produtos padrão
const defaultProducts: Product[] = [
  { id: "avenida105", name: "Avenida 105", active: true },
  { id: "citygalleria", name: "City Galleria", active: true },
]

// Contexto para compartilhar a configuração de produtos
interface ProductConfigContextType {
  products: Product[]
  addProduct: (product: Product) => void
  updateProduct: (id: string, updates: Partial<Product>) => void
  removeProduct: (id: string) => void
  isLoading: boolean
}

const ProductConfigContext = createContext<ProductConfigContextType | undefined>(undefined)

// Provider para o contexto
export function ProductConfigProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(defaultProducts)
  const [isLoading, setIsLoading] = useState(true)

  // Carregar produtos do localStorage na inicialização
  useEffect(() => {
    const loadProducts = () => {
      try {
        const savedProducts = localStorage.getItem("crm-products")
        if (savedProducts) {
          setProducts(JSON.parse(savedProducts))
        }
      } catch (error) {
        console.error("Erro ao carregar produtos:", error)
        // Em caso de erro, usar os produtos padrão
        setProducts(defaultProducts)
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [])

  // Salvar produtos no localStorage quando houver alterações
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("crm-products", JSON.stringify(products))
    }
  }, [products, isLoading])

  // Funções para gerenciar produtos
  const addProduct = (product: Product) => {
    setProducts((prev) => [...prev, product])
  }

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((product) => (product.id === id ? { ...product, ...updates } : product)))
  }

  const removeProduct = (id: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== id))
  }

  return (
    <ProductConfigContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        removeProduct,
        isLoading,
      }}
    >
      {children}
    </ProductConfigContext.Provider>
  )
}

// Hook para usar a configuração de produtos
export function useProductConfig() {
  const context = useContext(ProductConfigContext)
  if (context === undefined) {
    throw new Error("useProductConfig must be used within a ProductConfigProvider")
  }
  return context
}
