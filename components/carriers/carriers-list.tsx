"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit, MoreHorizontal, Trash2, Package, ExternalLink, Loader2 } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import * as api from "@/services/api"
import { Carrier } from "@/services/api"

export function CarriersList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCarriers, setSelectedCarriers] = useState<Record<string, boolean>>({})
  const [bulkFuelSurchargeDialogOpen, setBulkFuelSurchargeDialogOpen] = useState(false)
  const [bulkToggleStatusDialogOpen, setBulkToggleStatusDialogOpen] = useState(false)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [newFuelSurcharge, setNewFuelSurcharge] = useState("")
  
  // Aggiungi stati per gestire i dati dal backend
  const [carriers, setCarriers] = useState<Carrier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [servicesCounts, setServicesCounts] = useState<Record<string, number>>({})

  // Carica i dati al mount del componente
  useEffect(() => {
    const loadCarriers = async () => {
      try {
        setLoading(true)
        // Carica tutti i carriers dal backend
        const carriersData = await api.getCarriers()
        setCarriers(carriersData)
        
        // Carica il numero di servizi per ogni carrier
        const services = await api.getServices()
        const counts: Record<string, number> = {}
        
        services.forEach((service: any) => {
          const carrierId = typeof service.carrier === 'object' ? service.carrier._id : service.carrier
          counts[carrierId] = (counts[carrierId] || 0) + 1
        })
        
        setServicesCounts(counts)
        setError(null)
      } catch (err) {
        console.error('Errore nel caricamento dei corrieri:', err)
        setError('Impossibile caricare i corrieri. Si prega di riprovare.')
        toast.error('Errore nel caricamento dei corrieri')
      } finally {
        setLoading(false)
      }
    }
    
    loadCarriers()
  }, [])

  const filteredCarriers = carriers.filter((carrier) => 
    carrier.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedCount = Object.values(selectedCarriers).filter(Boolean).length

  const handleSelectAll = (checked: boolean) => {
    const newSelected: Record<string, boolean> = {}
    if (checked) {
      filteredCarriers.forEach((carrier) => {
        newSelected[carrier._id] = true
      })
    }
    setSelectedCarriers(newSelected)
  }

  const handleSelectCarrier = (id: string, checked: boolean) => {
    setSelectedCarriers((prev) => ({
      ...prev,
      [id]: checked,
    }))
  }

  const handleBulkFuelSurchargeUpdate = async () => {
    try {
      setLoading(true)
      const selectedIds = Object.keys(selectedCarriers).filter(id => selectedCarriers[id])
      const fuelSurcharge = parseFloat(newFuelSurcharge)
      
      if (isNaN(fuelSurcharge)) {
        toast.error('Il valore del fuel surcharge non è valido')
        return
      }
      
      await api.updateBulkFuelSurcharge(selectedIds, fuelSurcharge)
      
      // Aggiorna i dati
      setCarriers(prevCarriers => 
        prevCarriers.map(carrier => 
          selectedCarriers[carrier._id] 
            ? { ...carrier, fuelSurcharge } 
            : carrier
        )
      )
      
      toast.success('Fuel surcharge aggiornato con successo')
      
      // Reset selection and close dialog
      setSelectedCarriers({})
      setBulkFuelSurchargeDialogOpen(false)
      setNewFuelSurcharge("")
    } catch (err) {
      console.error('Errore nell\'aggiornamento del fuel surcharge:', err)
      toast.error('Errore nell\'aggiornamento del fuel surcharge')
    } finally {
      setLoading(false)
    }
  }

  const handleBulkToggleStatus = async () => {
    try {
      setLoading(true)
      const selectedIds = Object.keys(selectedCarriers).filter(id => selectedCarriers[id])
      
      // Determina lo stato da impostare (opposto alla maggioranza)
      const selectedCarriersData = carriers.filter(c => selectedCarriers[c._id])
      const activeCount = selectedCarriersData.filter(c => c.isActive).length
      const newStatus = activeCount < selectedCarriersData.length / 2
      
      await api.toggleBulkCarrierStatus(selectedIds, newStatus)
      
      // Aggiorna i dati
      setCarriers(prevCarriers => 
        prevCarriers.map(carrier => 
          selectedCarriers[carrier._id] 
            ? { ...carrier, isActive: newStatus } 
            : carrier
        )
      )
      
      toast.success(`Stato dei corrieri aggiornato a ${newStatus ? 'attivo' : 'inattivo'}`)
      
      // Reset selection and close dialog
      setSelectedCarriers({})
      setBulkToggleStatusDialogOpen(false)
    } catch (err) {
      console.error('Errore nell\'aggiornamento dello stato dei corrieri:', err)
      toast.error('Errore nell\'aggiornamento dello stato dei corrieri')
    } finally {
      setLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    try {
      setLoading(true)
      const selectedIds = Object.keys(selectedCarriers).filter(id => selectedCarriers[id])
      
      // Esegue una soft delete per tutti i carrier selezionati
      const deletePromises = selectedIds.map(id => api.deleteCarrier(id))
      await Promise.all(deletePromises)
      
      // Aggiorna i carriers con eliminazione logica
      setCarriers(prevCarriers => 
        prevCarriers.map(carrier => 
          selectedCarriers[carrier._id] 
            ? { ...carrier, isActive: false } 
            : carrier
        )
      )
      
      toast.success('Corrieri disattivati con successo')
      
      // Reset selection and close dialog
      setSelectedCarriers({})
      setBulkDeleteDialogOpen(false)
    } catch (err) {
      console.error('Errore nella disattivazione dei corrieri:', err)
      toast.error('Errore nella disattivazione dei corrieri')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleCarrierStatus = async (carrier: Carrier) => {
    try {
      setLoading(true)
      await api.updateCarrier(carrier._id, { isActive: !carrier.isActive })
      
      // Aggiorna i dati localmente
      setCarriers(prevCarriers => 
        prevCarriers.map(c => 
          c._id === carrier._id 
            ? { ...c, isActive: !c.isActive } 
            : c
        )
      )
      
      toast.success(`Corriere ${carrier.name} ${!carrier.isActive ? 'attivato' : 'disattivato'} con successo`)
    } catch (err) {
      console.error(`Errore nel cambio di stato per ${carrier.name}:`, err)
      toast.error(`Errore nel cambio di stato per ${carrier.name}`)
    } finally {
      setLoading(false)
    }
  }

  // Mostra un messaggio di caricamento
  if (loading && carriers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Caricamento corrieri...</p>
      </div>
    )
  }

  // Mostra un messaggio di errore
  if (error && carriers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-destructive">
        <p>{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Riprova
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder="Cerca corrieri..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />

        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{selectedCount} selezionati</span>
            <Button variant="outline" size="sm" onClick={() => setBulkFuelSurchargeDialogOpen(true)}>
              Aggiorna Fuel Surcharge
            </Button>
            <Button variant="outline" size="sm" onClick={() => setBulkToggleStatusDialogOpen(true)}>
              Cambia Stato
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setBulkDeleteDialogOpen(true)}>
              Disattiva
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={
                    filteredCarriers.length > 0 && filteredCarriers.every((carrier) => selectedCarriers[carrier._id])
                  }
                  onCheckedChange={handleSelectAll}
                  aria-label="Seleziona tutti i corrieri"
                />
              </TableHead>
              <TableHead className="w-[80px]">Logo</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead>Fuel Surcharge</TableHead>
              <TableHead>Volumetrico</TableHead>
              <TableHead>Servizi</TableHead>
              <TableHead>Knowledge Base</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCarriers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  Nessun risultato trovato.
                </TableCell>
              </TableRow>
            ) : (
              filteredCarriers.map((carrier) => (
                <TableRow key={carrier._id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedCarriers[carrier._id] || false}
                      onCheckedChange={(checked) => handleSelectCarrier(carrier._id, !!checked)}
                      aria-label={`Seleziona ${carrier.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="h-10 w-10 relative">
                      <Image
                        src={carrier.logoUrl || "/placeholder.svg"}
                        alt={carrier.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{carrier.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={carrier.isActive} 
                        onCheckedChange={() => handleToggleCarrierStatus(carrier)}
                      />
                      <span className={carrier.isActive ? "text-green-600" : "text-gray-500"}>
                        {carrier.isActive ? "Attivo" : "Inattivo"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{carrier.fuelSurcharge}%</TableCell>
                  <TableCell>
                    {carrier.isVolumetric ? <Badge variant="default">Sì</Badge> : <Badge variant="outline">No</Badge>}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span>{servicesCounts[carrier._id] || 0}</span>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/services?carrier=${carrier._id}`}>
                          <Package className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{carrier.knowledgeBase?.length || 0} elementi</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Apri menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Azioni</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/carriers/${carrier._id}`}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            <span>Visualizza Dettagli</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/carriers/${carrier._id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Modifica</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/services?carrier=${carrier._id}`}>
                            <Package className="mr-2 h-4 w-4" />
                            <span>Visualizza Servizi</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleToggleCarrierStatus(carrier)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>{carrier.isActive ? 'Disattiva' : 'Attiva'}</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialogo di conferma per l'aggiornamento del fuel surcharge di massa */}
      <Dialog open={bulkFuelSurchargeDialogOpen} onOpenChange={setBulkFuelSurchargeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiorna Fuel Surcharge</DialogTitle>
            <DialogDescription>
              Imposta un nuovo valore di fuel surcharge per tutti i {selectedCount} corrieri selezionati.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fuelSurcharge">Nuovo Fuel Surcharge (%)</Label>
              <Input
                id="fuelSurcharge"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={newFuelSurcharge}
                onChange={(e) => setNewFuelSurcharge(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkFuelSurchargeDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleBulkFuelSurchargeUpdate} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Aggiorna
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogo di conferma per il cambio di stato di massa */}
      <AlertDialog open={bulkToggleStatusDialogOpen} onOpenChange={setBulkToggleStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma cambio di stato</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler cambiare lo stato di {selectedCount} corrieri? Questa azione cambierà lo stato da attivo a inattivo o viceversa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkToggleStatus} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Conferma
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialogo di conferma per la disattivazione di massa */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma disattivazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler disattivare {selectedCount} corrieri? I corrieri disattivati non saranno più visibili ai clienti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} disabled={loading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Disattiva
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

