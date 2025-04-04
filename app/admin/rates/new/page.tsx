'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import * as api from "@/services/api"

interface Service {
  _id: string
  name: string
}

export default function NewRatePage() {
  const [loading, setLoading] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [isLoadingServices, setIsLoadingServices] = useState(true)
  const [formData, setFormData] = useState({
    service: "",
    weightMin: "",
    weightMax: "",
    purchasePrice: "",
    retailPrice: "",
    isActive: true
  })

  useEffect(() => {
    const loadServices = async () => {
      try {
        const servicesData = await api.getServices()
        setServices(servicesData)
      } catch (error) {
        console.error("Errore nel caricamento dei servizi:", error)
        toast.error("Errore nel caricamento dei servizi")
      } finally {
        setIsLoadingServices(false)
      }
    }

    loadServices()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Converti i valori numerici
      const rateData = {
        ...formData,
        weightMin: parseFloat(formData.weightMin),
        weightMax: parseFloat(formData.weightMax),
        purchasePrice: parseFloat(formData.purchasePrice),
        retailPrice: parseFloat(formData.retailPrice)
      }

      await api.createRate(rateData)
      toast.success("Tariffa creata con successo")
      // Reindirizza alla lista delle tariffe
      window.location.href = "/admin/rates"
    } catch (error) {
      console.error("Errore nella creazione della tariffa:", error)
      toast.error("Errore nella creazione della tariffa")
    } finally {
      setLoading(false)
    }
  }

  if (isLoadingServices) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Caricamento servizi...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/rates">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Nuova Tariffa</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Crea Nuova Tariffa</CardTitle>
          <CardDescription>Inserisci i dettagli della nuova tariffa</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="service">Servizio</Label>
                <Select
                  value={formData.service}
                  onValueChange={(value) => setFormData({ ...formData, service: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un servizio" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service._id} value={service._id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weightMin">Peso Minimo (kg)</Label>
                <Input
                  id="weightMin"
                  type="number"
                  step="0.1"
                  value={formData.weightMin}
                  onChange={(e) => setFormData({ ...formData, weightMin: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weightMax">Peso Massimo (kg)</Label>
                <Input
                  id="weightMax"
                  type="number"
                  step="0.1"
                  value={formData.weightMax}
                  onChange={(e) => setFormData({ ...formData, weightMax: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Prezzo di Acquisto</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="retailPrice">Prezzo di Vendita</Label>
                <Input
                  id="retailPrice"
                  type="number"
                  step="0.01"
                  value={formData.retailPrice}
                  onChange={(e) => setFormData({ ...formData, retailPrice: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="outline" type="button" asChild>
                <Link href="/admin/rates">Annulla</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creazione in corso...
                  </>
                ) : (
                  "Crea Tariffa"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 