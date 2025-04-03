"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit, MoreHorizontal, Trash2, ExternalLink, Tag, Truck, Loader2 } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import * as api from "@/services/api"
import { Service, Carrier } from "@/services/api"

// Aggiungo un tipo per i valori enum di serviceType
type ServiceType = 'normal' | 'return' | 'pudo' | 'locker' | 'other';

export function ServicesList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [carrierFilter, setCarrierFilter] = useState("all")
  const [destinationFilter, setDestinationFilter] = useState("all")
  const [marketFilter, setMarketFilter] = useState("all")
  const [selectedServices, setSelectedServices] = useState<Record<string, boolean>>({})
  const [bulkUpdateNameDialogOpen, setBulkUpdateNameDialogOpen] = useState(false)
  const [bulkUpdateFullNameDialogOpen, setBulkUpdateFullNameDialogOpen] = useState(false)
  const [bulkUpdateDestinationDialogOpen, setBulkUpdateDestinationDialogOpen] = useState(false)
  const [bulkUpdateServiceTypeDialogOpen, setBulkUpdateServiceTypeDialogOpen] = useState(false)
  const [bulkToggleStatusDialogOpen, setBulkToggleStatusDialogOpen] = useState(false)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [newNamePrefix, setNewNamePrefix] = useState("")
  const [newFullName, setNewFullName] = useState("")
  const [newDestinationCountries, setNewDestinationCountries] = useState("")
  const [newServiceType, setNewServiceType] = useState<ServiceType>("normal")
  
  // Stati per dati dal backend
  const [services, setServices] = useState<Service[]>([])
  const [carriers, setCarriers] = useState<Carrier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ratesCounts, setRatesCounts] = useState<Record<string, number>>({})
  
  // Carica i dati quando il componente viene montato
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Carica tutti i carriers
        const carriersData = await api.getCarriers()
        setCarriers(carriersData)
        
        // Carica tutti i servizi
        const servicesData = await api.getServices()
        setServices(servicesData)
        
        // Carica i rates per determinare il conteggio per servizio
        const rates = await api.getRates()
        const counts: Record<string, number> = {}
        
        rates.forEach((rate: any) => {
          const serviceId = typeof rate.service === 'object' ? rate.service._id : rate.service
          counts[serviceId] = (counts[serviceId] || 0) + 1
        })
        
        setRatesCounts(counts)
        setError(null)
      } catch (err) {
        console.error('Errore nel caricamento dei dati:', err)
        setError('Impossibile caricare i dati. Si prega di riprovare.')
        toast.error('Errore nel caricamento dei servizi')
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  const filteredServices = services.filter((service) => {
    // Applica filtro ricerca
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof service.carrier === 'object' && service.carrier.name.toLowerCase().includes(searchTerm.toLowerCase()))

    // Applica filtro carrier
    const carrierId = typeof service.carrier === 'object' ? service.carrier._id : service.carrier
    const matchesCarrier = carrierFilter === "all" || carrierId === carrierFilter

    // Applica filtro tipo destinazione
    const matchesDestination = destinationFilter === "all" || service.destinationType === destinationFilter

    // Applica filtro mercato/paese origine
    const matchesMarket = marketFilter === "all" || service.sourceCountry === marketFilter

    return matchesSearch && matchesCarrier && matchesDestination && matchesMarket
  })

  const selectedCount = Object.values(selectedServices).filter(Boolean).length

  const handleSelectAll = (checked: boolean) => {
    const newSelected: Record<string, boolean> = {}
    if (checked) {
      filteredServices.forEach((service) => {
        newSelected[service._id] = true
      })
    }
    setSelectedServices(newSelected)
  }

  const handleSelectService = (id: string, checked: boolean) => {
    setSelectedServices((prev) => ({
      ...prev,
      [id]: checked,
    }))
  }

  const handleBulkUpdateName = async () => {
    try {
      setLoading(true)
      const selectedIds = Object.keys(selectedServices).filter(id => selectedServices[id])
      
      // Eseguire gli aggiornamenti in parallelo
      const updatePromises = selectedIds.map(async id => {
        const service = services.find(s => s._id === id)
        if (!service) return
        
        const newName = service.name.startsWith(newNamePrefix) ? service.name : `${newNamePrefix} ${service.name}`
        return await api.updateService(id, { name: newName })
      })
      
      await Promise.all(updatePromises)
      
      // Aggiorna i dati localmente
      setServices(prevServices => 
        prevServices.map(service => {
          if (!selectedServices[service._id]) return service
          
          return {
            ...service,
            name: service.name.startsWith(newNamePrefix) ? service.name : `${newNamePrefix} ${service.name}`
          }
        })
      )
      
      toast.success(`Prefisso nome aggiornato per ${selectedCount} servizi`)
      
      // Resetta la selezione e chiudi il dialogo
      setSelectedServices({})
      setBulkUpdateNameDialogOpen(false)
      setNewNamePrefix("")
    } catch (err) {
      console.error('Errore nell\'aggiornamento dei nomi:', err)
      toast.error('Errore nell\'aggiornamento dei nomi')
    } finally {
      setLoading(false)
    }
  }

  const handleBulkUpdateFullName = async () => {
    try {
      setLoading(true)
      const selectedIds = Object.keys(selectedServices).filter(id => selectedServices[id])
      
      if (!newFullName.trim()) {
        toast.error('Inserisci un nome valido')
        return
      }
      
      // Eseguire gli aggiornamenti in parallelo
      const updatePromises = selectedIds.map(id => 
        api.updateService(id, { name: newFullName })
      )
      
      await Promise.all(updatePromises)
      
      // Aggiorna i dati localmente
      setServices(prevServices => 
        prevServices.map(service => {
          if (!selectedServices[service._id]) return service
          
          return {
            ...service,
            name: newFullName
          }
        })
      )
      
      toast.success(`Nome aggiornato per ${selectedCount} servizi`)
      
      // Resetta la selezione e chiudi il dialogo
      setSelectedServices({})
      setBulkUpdateFullNameDialogOpen(false)
      setNewFullName("")
    } catch (err) {
      console.error('Errore nell\'aggiornamento dei nomi:', err)
      toast.error('Errore nell\'aggiornamento dei nomi')
    } finally {
      setLoading(false)
    }
  }

  const handleBulkUpdateServiceType = async () => {
    try {
      setLoading(true)
      const selectedIds = Object.keys(selectedServices).filter(id => selectedServices[id])
      
      // Eseguire gli aggiornamenti in parallelo
      const updatePromises = selectedIds.map(id => 
        api.updateService(id, { serviceType: newServiceType })
      )
      
      await Promise.all(updatePromises)
      
      // Aggiorna i dati localmente
      setServices(prevServices => 
        prevServices.map(service => {
          if (!selectedServices[service._id]) return service
          
          return {
            ...service,
            serviceType: newServiceType as any // cast temporaneo per risolvere l'errore di tipo
          }
        })
      )
      
      toast.success(`Tipo di servizio aggiornato per ${selectedCount} servizi`)
      
      // Resetta la selezione e chiudi il dialogo
      setSelectedServices({})
      setBulkUpdateServiceTypeDialogOpen(false)
    } catch (err) {
      console.error('Errore nell\'aggiornamento del tipo di servizio:', err)
      toast.error('Errore nell\'aggiornamento del tipo di servizio')
    } finally {
      setLoading(false)
    }
  }

  const handleBulkUpdateDestination = async () => {
    try {
      setLoading(true)
      const selectedIds = Object.keys(selectedServices).filter(id => selectedServices[id])
      
      // Valida i paesi di destinazione
      const destinationCountriesArray = newDestinationCountries.split(',').map(c => c.trim()).filter(Boolean)
      if (destinationCountriesArray.length === 0) {
        toast.error('Inserisci almeno un paese di destinazione valido')
        return
      }
      
      // Eseguire gli aggiornamenti in parallelo
      const updatePromises = selectedIds.map(id => 
        api.updateService(id, { destinationCountry: destinationCountriesArray })
      )
      
      await Promise.all(updatePromises)
      
      // Aggiorna i dati localmente
      setServices(prevServices => 
        prevServices.map(service => {
          if (!selectedServices[service._id]) return service
          
          return {
            ...service,
            destinationCountry: destinationCountriesArray
          }
        })
      )
      
      toast.success(`Paesi di destinazione aggiornati per ${selectedCount} servizi`)
      
      // Resetta la selezione e chiudi il dialogo
      setSelectedServices({})
      setBulkUpdateDestinationDialogOpen(false)
      setNewDestinationCountries("")
    } catch (err) {
      console.error('Errore nell\'aggiornamento dei paesi di destinazione:', err)
      toast.error('Errore nell\'aggiornamento dei paesi di destinazione')
    } finally {
      setLoading(false)
    }
  }

  const handleBulkToggleStatus = async () => {
    try {
      setLoading(true)
      const selectedIds = Object.keys(selectedServices).filter(id => selectedServices[id])
      
      // Determina lo stato da impostare (opposto alla maggioranza)
      const selectedServicesData = services.filter(s => selectedServices[s._id])
      const activeCount = selectedServicesData.filter(s => s.isActive).length
      const newStatus = activeCount < selectedServicesData.length / 2
      
      // Eseguire gli aggiornamenti in parallelo
      const updatePromises = selectedIds.map(id => 
        api.updateService(id, { isActive: newStatus })
      )
      
      await Promise.all(updatePromises)
      
      // Aggiorna i dati localmente
      setServices(prevServices => 
        prevServices.map(service => {
          if (!selectedServices[service._id]) return service
          
          return {
            ...service,
            isActive: newStatus
          }
        })
      )
      
      toast.success(`Stato aggiornato a ${newStatus ? 'attivo' : 'inattivo'} per ${selectedCount} servizi`)
      
      // Resetta la selezione e chiudi il dialogo
      setSelectedServices({})
      setBulkToggleStatusDialogOpen(false)
    } catch (err) {
      console.error('Errore nell\'aggiornamento dello stato:', err)
      toast.error('Errore nell\'aggiornamento dello stato')
    } finally {
      setLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    try {
      setLoading(true)
      const selectedIds = Object.keys(selectedServices).filter(id => selectedServices[id])
      
      // Eseguire le eliminazioni in parallelo
      const deletePromises = selectedIds.map(id => api.deleteService(id))
      await Promise.all(deletePromises)
      
      // Rimuovi i servizi eliminati dai dati locali
      setServices(prevServices => 
        prevServices.filter(service => !selectedServices[service._id])
      )
      
      toast.success(`${selectedCount} servizi eliminati con successo`)
      
      // Resetta la selezione e chiudi il dialogo
      setSelectedServices({})
      setBulkDeleteDialogOpen(false)
    } catch (err) {
      console.error('Errore nell\'eliminazione dei servizi:', err)
      toast.error('Errore nell\'eliminazione dei servizi')
    } finally {
      setLoading(false)
    }
  }
  
  const handleToggleServiceStatus = async (service: Service) => {
    try {
      setLoading(true)
      
      await api.updateService(service._id, { isActive: !service.isActive })
      
      // Aggiorna i dati localmente
      setServices(prevServices => 
        prevServices.map(s => 
          s._id === service._id 
            ? { ...s, isActive: !s.isActive } 
            : s
        )
      )
      
      toast.success(`Servizio ${service.name} ${!service.isActive ? 'attivato' : 'disattivato'} con successo`)
    } catch (err) {
      console.error(`Errore nel cambio di stato per ${service.name}:`, err)
      toast.error(`Errore nel cambio di stato per ${service.name}`)
    } finally {
      setLoading(false)
    }
  }
  
  // Mostra un messaggio di caricamento
  if (loading && services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Caricamento servizi...</p>
      </div>
    )
  }
  
  // Mostra un messaggio di errore
  if (error && services.length === 0) {
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <Input
          placeholder="Cerca servizi..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:w-[300px]"
        />

        <div className="flex flex-1 flex-wrap gap-2">
          <Select value={carrierFilter} onValueChange={setCarrierFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtra per corriere" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i Corrieri</SelectItem>
              {carriers.map(carrier => (
                <SelectItem key={carrier._id} value={carrier._id}>
                  {carrier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={destinationFilter} onValueChange={setDestinationFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtra per destinazione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutte le Destinazioni</SelectItem>
              <SelectItem value="national">Nazionale</SelectItem>
              <SelectItem value="international">Internazionale</SelectItem>
            </SelectContent>
          </Select>

          <Select value={marketFilter} onValueChange={setMarketFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtra per mercato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i Mercati</SelectItem>
              <SelectItem value="IT">Italia</SelectItem>
              <SelectItem value="FR">Francia</SelectItem>
              <SelectItem value="DE">Germania</SelectItem>
              <SelectItem value="ES">Spagna</SelectItem>
              <SelectItem value="UK">Regno Unito</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{selectedCount} selezionati</span>
          <Button variant="outline" size="sm" onClick={() => setBulkUpdateNameDialogOpen(true)}>
            Aggiorna Prefisso Nome
          </Button>
          <Button variant="outline" size="sm" onClick={() => setBulkUpdateFullNameDialogOpen(true)}>
            Aggiorna Nome Completo
          </Button>
          <Button variant="outline" size="sm" onClick={() => setBulkUpdateServiceTypeDialogOpen(true)}>
            Aggiorna Tipo Servizio
          </Button>
          <Button variant="outline" size="sm" onClick={() => setBulkUpdateDestinationDialogOpen(true)}>
            Aggiorna Destinazioni
          </Button>
          <Button variant="outline" size="sm" onClick={() => setBulkToggleStatusDialogOpen(true)}>
            Cambia Stato
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setBulkDeleteDialogOpen(true)}>
            Elimina
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={
                    filteredServices.length > 0 && filteredServices.every((service) => selectedServices[service._id])
                  }
                  onCheckedChange={handleSelectAll}
                  aria-label="Seleziona tutti i servizi"
                />
              </TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Codice</TableHead>
              <TableHead>Corriere</TableHead>
              <TableHead>Tipo Destinazione</TableHead>
              <TableHead>Paese Origine</TableHead>
              <TableHead>Tempi di Consegna</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead>Tariffe</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredServices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  Nessun risultato trovato.
                </TableCell>
              </TableRow>
            ) : (
              filteredServices.map((service) => {
                const carrierName = typeof service.carrier === 'object' ? service.carrier.name : 
                  carriers.find(c => c._id === service.carrier)?.name || 'Sconosciuto'
                  
                return (
                  <TableRow key={service._id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedServices[service._id] || false}
                        onCheckedChange={(checked) => handleSelectService(service._id, !!checked)}
                        aria-label={`Seleziona ${service.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>{service.code}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span>{carrierName}</span>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/carriers/${typeof service.carrier === 'object' ? service.carrier._id : service.carrier}`}>
                            <Truck className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={service.destinationType === "international" ? "default" : "outline"}>
                        {service.destinationType === "international" ? "Internazionale" : "Nazionale"}
                      </Badge>
                    </TableCell>
                    <TableCell>{service.sourceCountry}</TableCell>
                    <TableCell>
                      {service.deliveryTimeMin} - {service.deliveryTimeMax} ore
                    </TableCell>
                    <TableCell>
                      <Badge variant={service.isActive ? "success" : "secondary"}>
                        {service.isActive ? "Attivo" : "Inattivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span>{ratesCounts[service._id] || 0}</span>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/rates?service=${service._id}`}>
                            <Tag className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
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
                            <Link href={`/services/${service._id}`}>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              <span>Visualizza Dettagli</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/services/${service._id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Modifica</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/rates?service=${service._id}`}>
                              <Tag className="mr-2 h-4 w-4" />
                              <span>Visualizza Tariffe</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleToggleServiceStatus(service)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>{service.isActive ? 'Disattiva' : 'Attiva'}</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialogo per l'aggiornamento dei nomi in blocco */}
      <Dialog open={bulkUpdateNameDialogOpen} onOpenChange={setBulkUpdateNameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiorna Prefisso Nome</DialogTitle>
            <DialogDescription>
              Imposta un prefisso per i nomi di tutti i {selectedCount} servizi selezionati.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name-prefix">Prefisso Nome</Label>
              <Input
                id="name-prefix"
                value={newNamePrefix}
                onChange={(e) => setNewNamePrefix(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkUpdateNameDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleBulkUpdateName} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Aggiorna
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogo per l'aggiornamento del nome completo in blocco */}
      <Dialog open={bulkUpdateFullNameDialogOpen} onOpenChange={setBulkUpdateFullNameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiorna Nome Completo</DialogTitle>
            <DialogDescription>
              Imposta un nome completo per tutti i {selectedCount} servizi selezionati.
              Questo sostituirà completamente il nome attuale dei servizi.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="full-name">Nome Completo</Label>
              <Input
                id="full-name"
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkUpdateFullNameDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleBulkUpdateFullName} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Aggiorna
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogo per l'aggiornamento del tipo di servizio in blocco */}
      <Dialog open={bulkUpdateServiceTypeDialogOpen} onOpenChange={setBulkUpdateServiceTypeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiorna Tipo di Servizio</DialogTitle>
            <DialogDescription>
              Seleziona il tipo di servizio per tutti i {selectedCount} servizi selezionati.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="service-type">Tipo di Servizio</Label>
              <Select 
                value={newServiceType} 
                onValueChange={(value: ServiceType) => setNewServiceType(value)}
              >
                <SelectTrigger id="service-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normale</SelectItem>
                  <SelectItem value="return">Reso</SelectItem>
                  <SelectItem value="pudo">PUDO</SelectItem>
                  <SelectItem value="locker">Locker</SelectItem>
                  <SelectItem value="other">Altro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkUpdateServiceTypeDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleBulkUpdateServiceType} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Aggiorna
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogo per l'aggiornamento delle destinazioni in blocco */}
      <Dialog open={bulkUpdateDestinationDialogOpen} onOpenChange={setBulkUpdateDestinationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiorna Paesi di Destinazione</DialogTitle>
            <DialogDescription>
              Imposta i paesi di destinazione per tutti i {selectedCount} servizi selezionati.
              Inserisci i codici paese separati da virgole (es. IT, FR, DE).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="destination-countries">Paesi di Destinazione</Label>
              <Textarea
                id="destination-countries"
                value={newDestinationCountries}
                onChange={(e) => setNewDestinationCountries(e.target.value)}
                placeholder="IT, FR, DE, ES, UK"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkUpdateDestinationDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleBulkUpdateDestination} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Aggiorna
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogo per il cambio di stato in blocco */}
      <AlertDialog open={bulkToggleStatusDialogOpen} onOpenChange={setBulkToggleStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma cambio di stato</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler cambiare lo stato di {selectedCount} servizi? Questa azione cambierà lo stato da attivo a inattivo o viceversa.
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

      {/* Dialogo per l'eliminazione in blocco */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare {selectedCount} servizi? Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} disabled={loading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

