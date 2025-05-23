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

interface EditableCellProps {
  value: number;
  onChange: (value: number) => void;
  onBlur: () => void;
  isEditing: boolean;
  onStartEdit: () => void;
  formatValue: (value: number) => string;
}

const EditableCell: React.FC<EditableCellProps> = ({
  value,
  onChange,
  onBlur,
  isEditing,
  onStartEdit,
  formatValue
}) => {
  if (isEditing) {
    return (
      <Input
        type="number"
        step="0.01"
        min="0"
        defaultValue={value}
        onChange={(e) => {
          const newValue = e.target.value === '' ? 0 : parseFloat(e.target.value);
          if (!isNaN(newValue)) {
            onChange(newValue);
          }
        }}
        onBlur={onBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onBlur();
          }
        }}
        autoFocus
        className="w-24"
      />
    );
  }
  return (
    <div 
      onClick={onStartEdit}
      className="cursor-pointer hover:bg-muted/50 p-2 rounded"
    >
      {formatValue(value)}
    </div>
  );
};

interface EditableWeightRangeProps {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
  onBlur: () => void;
  isEditing: boolean;
  onStartEdit: () => void;
}

const EditableWeightRange: React.FC<EditableWeightRangeProps> = ({
  min,
  max,
  onChange,
  onBlur,
  isEditing,
  onStartEdit
}) => {
  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          type="number"
          step="0.1"
          min="0"
          defaultValue={min}
          onChange={(e) => {
            const newMin = e.target.value === '' ? 0 : parseFloat(e.target.value);
            if (!isNaN(newMin)) {
              onChange(newMin, max);
            }
          }}
          className="w-20"
        />
        <span>-</span>
        <Input
          type="number"
          step="0.1"
          min="0"
          defaultValue={max}
          onChange={(e) => {
            const newMax = e.target.value === '' ? 0 : parseFloat(e.target.value);
            if (!isNaN(newMax)) {
              onChange(min, newMax);
            }
          }}
          className="w-20"
        />
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onBlur}
          className="h-8 w-8 p-0"
        >
          ✓
        </Button>
      </div>
    );
  }
  return (
    <div 
      onClick={onStartEdit}
      className="cursor-pointer hover:bg-muted/50 p-2 rounded"
    >
      {min} - {max} kg
    </div>
  );
};

export function RatesList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [carrierFilter, setCarrierFilter] = useState("all")
  const [serviceFilter, setServiceFilter] = useState("all")
  const [destinationCountryFilter, setDestinationCountryFilter] = useState("all")
  const [weightFilter, setWeightFilter] = useState("all")
  const [selectedRates, setSelectedRates] = useState<Record<string, boolean>>({})
  const [bulkUpdatePriceDialogOpen, setBulkUpdatePriceDialogOpen] = useState(false)
  const [bulkToggleStatusDialogOpen, setBulkToggleStatusDialogOpen] = useState(false)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [priceChangePercentage, setPriceChangePercentage] = useState(0)
  const [priceChangeType, setPriceChangeType] = useState<"increase" | "decrease">("increase")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(50)
  
  // Stati per dati dal backend
  const [rates, setRates] = useState<Rate[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [carriers, setCarriers] = useState<Carrier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Uso un Set per tenere traccia dei paesi unici trovati nei servizi
  const [uniqueDestinationCountries, setUniqueDestinationCountries] = useState<string[]>([])
  
  interface EditingCell {
    rateId: string;
    field: 'purchasePrice' | 'retailPrice' | 'weightRange';
  }

  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editingValue, setEditingValue] = useState<number | { min: number; max: number } | null>(null);
  
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
        
        // Estrai paesi di destinazione unici dai servizi
        const countries = new Set<string>();
        servicesData.forEach(service => {
          if (service.destinationCountry && Array.isArray(service.destinationCountry)) {
            service.destinationCountry.forEach(country => {
              if (country) countries.add(country);
            });
          }
        });
        if (isMounted) setUniqueDestinationCountries(Array.from(countries).sort());
        
        // Carica tutti i rates
        console.log('Caricamento tariffe...');
        const ratesData = await api.getRates();
        console.log('Tariffe caricate:', ratesData);
        
        if (!ratesData) {
          throw new Error('Nessuna risposta dal server per le tariffe');
        }
        
        if (!Array.isArray(ratesData)) {
          console.error('Formato dati tariffe non valido:', ratesData);
          throw new Error('Formato dati tariffe non valido');
        }
        
        if (isMounted) {
          console.log('Impostazione tariffe nel state...');
          setRates(ratesData);
          console.log('Tariffe impostate con successo');
        }
        
        console.log('Caricamento completato con successo');
      } catch (err) {
        console.error('Errore nel caricamento dei dati:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Impossibile caricare i dati. Si prega di riprovare.');
          toast.error('Errore nel caricamento delle tariffe');
        }
      } finally {
        if (isMounted) {
          console.log('Impostazione loading a false');
          setLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      console.log('Cleanup: isMounted = false');
      isMounted = false;
    };
  }, []);

  // Funzione per ottenere i dettagli di un servizio
  const getServiceDetails = (serviceId: string) => {
    const service = services.find(s => s._id === serviceId)
    if (!service) return { id: serviceId, name: 'Sconosciuto', code: 'N/A', carrier: { id: 'unknown', name: 'Sconosciuto' }, destinationCountry: [] }
    
    const carrierId = typeof service.carrier === 'object' ? service.carrier._id : service.carrier
    const carrier = carriers.find(c => c._id === carrierId)
    
    return {
      id: service._id,
      name: service.name,
      code: service.code,
      carrier: {
        id: carrierId,
        name: carrier?.name || 'Sconosciuto'
      },
      destinationCountry: service.destinationCountry || [],
      destinationType: service.destinationType || 'national'
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
    
    // Applica filtro paese di destinazione
    const matchesDestinationCountry = 
      destinationCountryFilter === "all" || 
      (serviceDetails.destinationCountry && 
       serviceDetails.destinationCountry.includes(destinationCountryFilter));

    // Applica filtro peso
    const matchesWeight =
      weightFilter === "all" ||
      (weightFilter === "0-1" && rate.weightMin >= 0 && rate.weightMax <= 1) ||
      (weightFilter === "1-3" && rate.weightMin >= 1 && rate.weightMax <= 3) ||
      (weightFilter === "3-5" && rate.weightMin >= 3 && rate.weightMax <= 5) ||
      (weightFilter === "5-10" && rate.weightMin >= 5 && rate.weightMax <= 10);

    return matchesSearch && matchesCarrier && matchesService && matchesDestinationCountry && matchesWeight;
  })

  // Calcola gli indici per la paginazione
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentRates = filteredRates.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredRates.length / itemsPerPage)

  // Funzione per cambiare pagina
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo(0, 0)
  }

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
  
  // Funzione per gestire l'inizio dell'editing
  const handleStartEdit = (rate: Rate, field: 'purchasePrice' | 'retailPrice' | 'weightRange') => {
    setEditingCell({ rateId: rate._id, field });
    setEditingValue(rate[field]);
  };

  // Funzione per gestire il salvataggio delle modifiche
  const handleSaveEdit = async (rate: Rate) => {
    if (!editingCell || editingValue === null) return;

    try {
      setLoading(true);
      
      let updatedValues: Partial<Rate> = {};
      
      if (editingCell.field === 'weightRange' && typeof editingValue === 'object') {
        updatedValues = {
          weightMin: editingValue.min,
          weightMax: editingValue.max
        };
      } else if (typeof editingValue === 'number') {
        updatedValues = {
          [editingCell.field]: editingValue
        };
      }

      const updatedRate = await api.updateRate(rate._id, updatedValues);
      
      setRates(prevRates =>
        prevRates.map(r =>
          r._id === rate._id
            ? updatedRate
            : r
        )
      );

      toast.success('Dati aggiornati con successo');
    } catch (err) {
      console.error('Errore nell\'aggiornamento:', err);
      toast.error('Errore nell\'aggiornamento dei dati');
    } finally {
      setLoading(false);
      setEditingCell(null);
      setEditingValue(null);
    }
  };

  // Mostra un messaggio di caricamento
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Caricamento tariffe...</p>
      </div>
    );
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
    );
  }

  // Se non ci sono dati da mostrare
  if (!rates || !rates.length) {
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
          
          <Select value={destinationCountryFilter} onValueChange={setDestinationCountryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtra per paese di destinazione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i Paesi</SelectItem>
              {uniqueDestinationCountries.map(country => (
                <SelectItem key={country} value={country}>
                  {country}
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
              <TableHead>Paese Destinazione</TableHead>
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
            {currentRates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="h-24 text-center">
                  Nessun risultato trovato.
                </TableCell>
              </TableRow>
            ) : (
              currentRates.map((rate) => {
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
                      {serviceDetails.destinationType === 'international' ? (
                        serviceDetails.destinationCountry && serviceDetails.destinationCountry.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {serviceDetails.destinationCountry.map((country, idx) => (
                              <Badge key={idx} variant="outline">
                                {country}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/D</span>
                        )
                      ) : (
                        <span className="text-muted-foreground">Nazionale</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <EditableWeightRange
                        min={rate.weightMin}
                        max={rate.weightMax}
                        onChange={(newMin, newMax) => {
                          if (newMin >= newMax) {
                            toast.error('Il peso minimo deve essere inferiore al peso massimo');
                            return;
                          }
                          setEditingValue({ min: newMin, max: newMax });
                        }}
                        onBlur={() => handleSaveEdit(rate)}
                        isEditing={editingCell?.rateId === rate._id && editingCell?.field === 'weightRange'}
                        onStartEdit={() => handleStartEdit(rate, 'weightRange')}
                      />
                    </TableCell>
                    <TableCell>
                      <EditableCell
                        value={rate.purchasePrice}
                        onChange={setEditingValue}
                        onBlur={() => handleSaveEdit(rate)}
                        isEditing={editingCell?.rateId === rate._id && editingCell?.field === 'purchasePrice'}
                        onStartEdit={() => handleStartEdit(rate, 'purchasePrice')}
                        formatValue={formatCurrency}
                      />
                    </TableCell>
                    <TableCell>
                      <EditableCell
                        value={rate.retailPrice}
                        onChange={setEditingValue}
                        onBlur={() => handleSaveEdit(rate)}
                        isEditing={editingCell?.rateId === rate._id && editingCell?.field === 'retailPrice'}
                        onStartEdit={() => handleStartEdit(rate, 'retailPrice')}
                        formatValue={formatCurrency}
                      />
                    </TableCell>
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

      {/* Paginazione */}
      {filteredRates.length > 0 && (
        <div className="flex justify-center mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      onClick={() => handlePageChange(pageNumber)}
                      isActive={currentPage === pageNumber}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <div className="ml-4 text-sm text-muted-foreground">
            Pagina {currentPage} di {totalPages} ({filteredRates.length} risultati)
          </div>
        </div>
      )}

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

