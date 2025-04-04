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
import { Edit, MoreHorizontal, Trash2, ExternalLink, Package, Truck, Loader2 } from "lucide-react"
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
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"
import * as api from "@/services/api"
import { Rate, Service, Carrier } from "@/services/api"

export function RatesList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [carrierFilter, setCarrierFilter] = useState("all")
  const [serviceFilter, setServiceFilter] = useState("all")
  const [weightFilter, setWeightFilter] = useState("all")
  const [selectedRates, setSelectedRates] = useState<Record<string, boolean>>({})
  const [bulkUpdatePriceDialogOpen, setBulkUpdatePriceDialogOpen] = useState(false)
  const [bulkToggleStatusDialogOpen, setBulkToggleStatusDialogOpen] = useState(false)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [priceChangePercentage, setPriceChangePercentage] = useState(0)
  const [priceChangeType, setPriceChangeType] = useState<"increase" | "decrease">("increase")
  
  // Stati per dati dal backend
  const [rates, setRates] = useState<Rate[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [carriers, setCarriers] = useState<Carrier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Carica i dati quando il componente viene montato
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        console.log('Inizio caricamento dati...');
        setLoading(true);
        setError(null);
        
        // Carica tutti i carriers
        console.log('Caricamento carriers...');
        const carriersData = await api.getCarriers();
        console.log('Carriers caricati:', carriersData);
        if (!carriersData || !Array.isArray(carriersData)) {
          throw new Error('Dati carriers non validi');
        }
        if (isMounted) setCarriers(carriersData);
        
        // Carica tutti i servizi
        console.log('Caricamento servizi...');
        const servicesData = await api.getServices();
        console.log('Servizi caricati:', servicesData);
        if (!servicesData || !Array.isArray(servicesData)) {
          throw new Error('Dati servizi non validi');
        }
        if (isMounted) setServices(servicesData);
        
        // Carica tutti i rates
        console.log('Caricamento tariffe...');
        const ratesData = await api.getRates();
        console.log('Tariffe caricate:', ratesData);
        if (!ratesData || !Array.isArray(ratesData)) {
          throw new Error('Dati tariffe non validi');
        }
        if (isMounted) setRates(ratesData);
        
        console.log('Caricamento completato con successo');
      } catch (err) {
        console.error('Errore nel caricamento dei dati:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Impossibile caricare i dati. Si prega di riprovare.');
          toast.error('Errore nel caricamento delle tariffe');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Funzione per ottenere i dettagli di un servizio
  const getServiceDetails = (serviceId: string) => {
    const service = services.find(s => s._id === serviceId)
    if (!service) return { id: serviceId, name: 'Sconosciuto', code: 'N/A', carrier: { id: 'unknown', name: 'Sconosciuto' } }
    
    const carrierId = typeof service.carrier === 'object' ? service.carrier._id : service.carrier
    const carrier = carriers.find(c => c._id === carrierId)
    
    return {
      id: service._id,
      name: service.name,
      code: service.code,
      carrier: {
        id: carrierId,
        name: carrier?.name || 'Sconosciuto'
      }
    }
  }

  const filteredRates = rates.filter((rate) => {
    // Verifica che rate e service esistano
    if (!rate || !rate.service) return false;
    
    // Ottenere i dettagli del servizio per il rate corrente
    const serviceId = typeof rate.service === 'object' ? rate.service._id : rate.service;
    if (!serviceId) return false;
    
    const serviceDetails = getServiceDetails(serviceId);
    
    // Applica filtro ricerca
    const matchesSearch =
      serviceDetails.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serviceDetails.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serviceDetails.carrier.name.toLowerCase().includes(searchTerm.toLowerCase());

    // Applica filtro carrier
    const matchesCarrier = carrierFilter === "all" || serviceDetails.carrier.id === carrierFilter;

    // Applica filtro service
    const matchesService = serviceFilter === "all" || serviceDetails.id === serviceFilter;

    // Applica filtro peso
    const matchesWeight =
      weightFilter === "all" ||
      (weightFilter === "0-1" && rate.weightMin >= 0 && rate.weightMax <= 1) ||
      (weightFilter === "1-3" && rate.weightMin >= 1 && rate.weightMax <= 3) ||
      (weightFilter === "3-5" && rate.weightMin >= 3 && rate.weightMax <= 5) ||
      (weightFilter === "5-10" && rate.weightMin >= 5 && rate.weightMax <= 10);

    return matchesSearch && matchesCarrier && matchesService && matchesWeight;
  })

  const selectedCount = Object.values(selectedRates).filter(Boolean).length

  const handleSelectAll = (checked: boolean) => {
    const newSelected: Record<string, boolean> = {}
    if (checked) {
      filteredRates.forEach((rate) => {
        if (rate && rate._id) {
          newSelected[rate._id] = true
        }
      })
    }
    setSelectedRates(newSelected)
  }

  const handleSelectRate = (id: string, checked: boolean) => {
    setSelectedRates((prev) => ({
      ...prev,
      [id]: checked,
    }))
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(value)
  }

  const handleBulkUpdatePrice = async () => {
    try {
      setLoading(true)
      const selectedIds = Object.keys(selectedRates).filter(id => selectedRates[id])
      
      // Calcola il fattore di modifica del prezzo
      const priceFactor = priceChangeType === "increase" 
        ? 1 + (priceChangePercentage / 100) 
        : 1 - (priceChangePercentage / 100)
      
      // Esegui gli aggiornamenti in parallelo
      const updatePromises = selectedIds.map(async id => {
        const rate = rates.find(r => r._id === id)
        if (!rate) return
        
        const updatedRetailPrice = rate.retailPrice * priceFactor
        const updatedMargin = updatedRetailPrice - rate.purchasePrice
        const updatedMarginPercentage = (updatedMargin / rate.purchasePrice) * 100
        
        return await api.updateRate(id, { 
          retailPrice: updatedRetailPrice,
          margin: updatedMargin,
          marginPercentage: updatedMarginPercentage
        })
      })
      
      await Promise.all(updatePromises)
      
      // Aggiorna i dati localmente
      setRates(prevRates => 
        prevRates.map(rate => {
          if (!selectedRates[rate._id]) return rate
          
          const updatedRetailPrice = rate.retailPrice * priceFactor
          const updatedMargin = updatedRetailPrice - rate.purchasePrice
          const updatedMarginPercentage = (updatedMargin / rate.purchasePrice) * 100
          
          return {
            ...rate,
            retailPrice: updatedRetailPrice,
            margin: updatedMargin,
            marginPercentage: updatedMarginPercentage
          }
        })
      )
      
      toast.success(`Prezzi ${priceChangeType === "increase" ? "aumentati" : "diminuiti"} del ${priceChangePercentage}% per ${selectedCount} tariffe`)
      
      // Resetta la selezione e chiudi il dialogo
      setSelectedRates({})
      setBulkUpdatePriceDialogOpen(false)
      setPriceChangePercentage(0)
    } catch (err) {
      console.error('Errore nell\'aggiornamento dei prezzi:', err)
      toast.error('Errore nell\'aggiornamento dei prezzi')
    } finally {
      setLoading(false)
    }
  }

  const handleBulkToggleStatus = async () => {
    try {
      setLoading(true)
      const selectedIds = Object.keys(selectedRates).filter(id => selectedRates[id])
      
      // Determina lo stato da impostare (opposto alla maggioranza)
      const selectedRatesData = rates.filter(r => selectedRates[r._id])
      const activeCount = selectedRatesData.filter(r => r.isActive).length
      const newStatus = activeCount < selectedRatesData.length / 2
      
      // Esegui gli aggiornamenti in parallelo
      const updatePromises = selectedIds.map(id => 
        api.updateRate(id, { isActive: newStatus })
      )
      
      await Promise.all(updatePromises)
      
      // Aggiorna i dati localmente
      setRates(prevRates => 
        prevRates.map(rate => {
          if (!selectedRates[rate._id]) return rate
          
          return {
            ...rate,
            isActive: newStatus
          }
        })
      )
      
      toast.success(`Stato aggiornato a ${newStatus ? 'attivo' : 'inattivo'} per ${selectedCount} tariffe`)
      
      // Resetta la selezione e chiudi il dialogo
      setSelectedRates({})
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
      const selectedIds = Object.keys(selectedRates).filter(id => selectedRates[id])
      
      // Esegui le eliminazioni in parallelo
      const deletePromises = selectedIds.map(id => api.deleteRate(id))
      await Promise.all(deletePromises)
      
      // Rimuovi le tariffe eliminate dai dati locali
      setRates(prevRates => 
        prevRates.filter(rate => !selectedRates[rate._id])
      )
      
      toast.success(`${selectedCount} tariffe eliminate con successo`)
      
      // Resetta la selezione e chiudi il dialogo
      setSelectedRates({})
      setBulkDeleteDialogOpen(false)
    } catch (err) {
      console.error('Errore nell\'eliminazione delle tariffe:', err)
      toast.error('Errore nell\'eliminazione delle tariffe')
    } finally {
      setLoading(false)
    }
  }
  
  const handleToggleRateStatus = async (rate: Rate) => {
    try {
      setLoading(true)
      
      await api.updateRate(rate._id, { isActive: !rate.isActive })
      
      // Aggiorna i dati localmente
      setRates(prevRates => 
        prevRates.map(r => 
          r._id === rate._id 
            ? { ...r, isActive: !r.isActive } 
            : r
        )
      )
      
      const serviceId = typeof rate.service === 'object' ? rate.service._id : rate.service
      const serviceDetails = getServiceDetails(serviceId)
      
      toast.success(`Tariffa ${serviceDetails.name} (${rate.weightMin}-${rate.weightMax}kg) ${!rate.isActive ? 'attivata' : 'disattivata'} con successo`)
    } catch (err) {
      console.error(`Errore nel cambio di stato per la tariffa:`, err)
      toast.error(`Errore nel cambio di stato per la tariffa`)
    } finally {
      setLoading(false)
    }
  }
  
  // Mostra un messaggio di caricamento
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Caricamento tariffe...</p>
      </div>
    )
  }
  
  // Mostra un messaggio di errore
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-destructive">
        <p>{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Riprova
        </Button>
      </div>
    )
  }

  // Se non ci sono dati da mostrare
  if (!rates.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Nessuna tariffa disponibile</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <Input
          placeholder="Cerca tariffe..."
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

          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtra per servizio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i Servizi</SelectItem>
              {services.map(service => (
                <SelectItem key={service._id} value={service._id}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={weightFilter} onValueChange={setWeightFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtra per peso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i Pesi</SelectItem>
              <SelectItem value="0-1">0 - 1 kg</SelectItem>
              <SelectItem value="1-3">1 - 3 kg</SelectItem>
              <SelectItem value="3-5">3 - 5 kg</SelectItem>
              <SelectItem value="5-10">5 - 10 kg</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{selectedCount} selezionati</span>
          <Button variant="outline" size="sm" onClick={() => setBulkUpdatePriceDialogOpen(true)}>
            Aggiorna Prezzi
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
                    filteredRates.length > 0 && filteredRates.every((rate) => selectedRates[rate._id])
                  }
                  onCheckedChange={handleSelectAll}
                  aria-label="Seleziona tutte le tariffe"
                />
              </TableHead>
              <TableHead>Servizio</TableHead>
              <TableHead>Corriere</TableHead>
              <TableHead>Range Peso</TableHead>
              <TableHead>Prezzo Acquisto</TableHead>
              <TableHead>Prezzo Vendita</TableHead>
              <TableHead>Margine</TableHead>
              <TableHead>Margine %</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  Nessun risultato trovato.
                </TableCell>
              </TableRow>
            ) : (
              filteredRates.map((rate) => {
                if (!rate || !rate._id) return null;
                
                const serviceId = typeof rate.service === 'object' ? rate.service._id : rate.service;
                if (!serviceId) return null;
                
                const serviceDetails = getServiceDetails(serviceId);
                
                return (
                  <TableRow key={rate._id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedRates[rate._id] || false}
                        onCheckedChange={(checked) => handleSelectRate(rate._id, !!checked)}
                        aria-label={`Seleziona tariffa ${serviceDetails.name} ${rate.weightMin}-${rate.weightMax}kg`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span>{serviceDetails.name}</span>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/services/${serviceDetails.id}`}>
                            <Package className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span>{serviceDetails.carrier.name}</span>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/carriers/${serviceDetails.carrier.id}`}>
                            <Truck className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {rate.weightMin} - {rate.weightMax} kg
                    </TableCell>
                    <TableCell>{formatCurrency(rate.purchasePrice || 0)}</TableCell>
                    <TableCell>{formatCurrency(rate.retailPrice || 0)}</TableCell>
                    <TableCell>{formatCurrency(rate.margin || 0)}</TableCell>
                    <TableCell>{(rate.marginPercentage || 0).toFixed(2)}%</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={rate.isActive} 
                          onCheckedChange={() => handleToggleRateStatus(rate)}
                        />
                        <span className={rate.isActive ? "text-green-600" : "text-gray-500"}>
                          {rate.isActive ? "Attiva" : "Inattiva"}
                        </span>
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
                            <Link href={`/rates/${rate._id}`}>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              <span>Visualizza Dettagli</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/rates/${rate._id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Modifica</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleToggleRateStatus(rate)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>{rate.isActive ? 'Disattiva' : 'Attiva'}</span>
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

      {/* Dialogo per l'aggiornamento dei prezzi in blocco */}
      <Dialog open={bulkUpdatePriceDialogOpen} onOpenChange={setBulkUpdatePriceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiorna Prezzi</DialogTitle>
            <DialogDescription>
              Modifica i prezzi di vendita per tutte le {selectedCount} tariffe selezionate.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo di Modifica</Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="increase"
                    value="increase"
                    checked={priceChangeType === "increase"}
                    onChange={() => setPriceChangeType("increase")}
                  />
                  <Label htmlFor="increase">Aumento</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="decrease"
                    value="decrease"
                    checked={priceChangeType === "decrease"}
                    onChange={() => setPriceChangeType("decrease")}
                  />
                  <Label htmlFor="decrease">Diminuzione</Label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="price-percentage">Percentuale ({priceChangePercentage}%)</Label>
                <span>{priceChangePercentage}%</span>
              </div>
              <Slider
                id="price-percentage"
                min={0}
                max={30}
                step={1}
                value={[priceChangePercentage]}
                onValueChange={(value) => setPriceChangePercentage(value[0])}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkUpdatePriceDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleBulkUpdatePrice} disabled={loading}>
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
              Sei sicuro di voler cambiare lo stato di {selectedCount} tariffe? Questa azione cambierà lo stato da attivo a inattivo o viceversa.
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
              Sei sicuro di voler eliminare {selectedCount} tariffe? Questa azione non può essere annullata.
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

