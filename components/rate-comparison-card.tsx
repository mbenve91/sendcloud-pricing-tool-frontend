"use client"

import { useState, useEffect, useCallback } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Filter, RefreshCw, MoreVertical, Download, Lightbulb, Info, X, Columns } from "lucide-react"

// Types
interface Carrier {
  id: string
  name: string
  logoUrl: string
}

// Table column type
interface TableColumn {
  id: string
  label: string
  visible: boolean
  align: "left" | "right" | "center"
}

// Modifica l'interfaccia FilterState per includere il paese
interface FilterState {
  carrierId: string
  serviceType: string
  weight: string
  destinationType: string
  volume: string
  country: string
}

// Modifica l'interfaccia Rate per includere il paese di destinazione
interface Rate {
  id: string
  carrierId: string
  carrierName: string
  carrierLogo: string
  serviceCode: string
  serviceName: string
  basePrice: number
  fuelSurcharge: number
  totalBasePrice: number
  volumeDiscount: number
  promotionDiscount: number
  totalDiscountPercentage: number
  finalPrice: number
  actualMargin: number
  weight: number
  destinationType: string
  destinationCountry?: string
  deliveryTimeMin: number
  deliveryTimeMax: number
  purchasePrice: number // Prezzo di acquisto
  sellingPrice: number // Prezzo di vendita originale
  marginDiscount: number // Sconto applicato sul margine (0-90%)
  customSellingPrice: number // Prezzo di vendita dopo lo sconto sul margine
  remainingMargin: number // Margine rimanente dopo lo sconto
}

interface Suggestion {
  id: string
  type: string
  carrierId: string
  carrierName: string
  message: string
}

// Mock data
const mockCarriers: Carrier[] = [
  { id: "1", name: "BRT", logoUrl: "/brt.svg" },
  { id: "2", name: "GLS", logoUrl: "/gls.svg" },
  { id: "3", name: "DHL", logoUrl: "/dhl.svg" },
]

// Aggiungi liste di paesi per UE e Extra UE
const euCountries = [
  { id: "de", name: "Germania" },
  { id: "fr", name: "Francia" },
  { id: "es", name: "Spagna" },
  { id: "pt", name: "Portogallo" },
  { id: "be", name: "Belgio" },
  { id: "nl", name: "Paesi Bassi" },
  { id: "lu", name: "Lussemburgo" },
  { id: "at", name: "Austria" },
  { id: "ie", name: "Irlanda" },
  { id: "fi", name: "Finlandia" },
  { id: "se", name: "Svezia" },
  { id: "dk", name: "Danimarca" },
  { id: "gr", name: "Grecia" },
  { id: "pl", name: "Polonia" },
  { id: "cz", name: "Repubblica Ceca" },
  { id: "sk", name: "Slovacchia" },
  { id: "hu", name: "Ungheria" },
  { id: "ro", name: "Romania" },
  { id: "bg", name: "Bulgaria" },
  { id: "hr", name: "Croazia" },
  { id: "si", name: "Slovenia" },
  { id: "ee", name: "Estonia" },
  { id: "lv", name: "Lettonia" },
  { id: "lt", name: "Lituania" },
  { id: "cy", name: "Cipro" },
  { id: "mt", name: "Malta" },
]

const extraEuCountries = [
  { id: "us", name: "Stati Uniti" },
  { id: "ca", name: "Canada" },
  { id: "uk", name: "Regno Unito" },
  { id: "ch", name: "Svizzera" },
  { id: "no", name: "Norvegia" },
  { id: "au", name: "Australia" },
  { id: "nz", name: "Nuova Zelanda" },
  { id: "jp", name: "Giappone" },
  { id: "cn", name: "Cina" },
  { id: "in", name: "India" },
  { id: "br", name: "Brasile" },
  { id: "za", name: "Sudafrica" },
  { id: "ru", name: "Russia" },
  { id: "tr", name: "Turchia" },
  { id: "ae", name: "Emirati Arabi Uniti" },
  { id: "sa", name: "Arabia Saudita" },
  { id: "sg", name: "Singapore" },
  { id: "hk", name: "Hong Kong" },
  { id: "kr", name: "Corea del Sud" },
  { id: "mx", name: "Messico" },
]

// Modifica la funzione generateMockRates per includere il paese di destinazione
const generateMockRates = (destinationType: string): Rate[] => {
  const rates: Rate[] = []

  // Determina i paesi disponibili in base al tipo di destinazione
  let countries: { id: string; name: string }[] = []
  if (destinationType === "eu") {
    countries = euCountries
  } else if (destinationType === "extra_eu") {
    countries = extraEuCountries
  }

  mockCarriers.forEach((carrier) => {
    // Per destinazioni nazionali, non assegniamo un paese
    if (destinationType === "national") {
      // Generate Standard service
      const standardPurchasePrice = 5 + Math.random() * 3
      const standardSellingPrice = standardPurchasePrice * (1 + (10 + Math.random() * 20) / 100)

      rates.push({
        id: `${carrier.id}-standard-${destinationType}`,
        carrierId: carrier.id,
        carrierName: carrier.name,
        carrierLogo: carrier.logoUrl,
        serviceCode: "STD",
        serviceName: "Standard",
        basePrice: 5 + Math.random() * 5,
        fuelSurcharge: 2 + Math.random() * 3,
        totalBasePrice: 0, // Will be calculated
        volumeDiscount: Math.random() * 10,
        promotionDiscount: Math.random() * 5,
        totalDiscountPercentage: 0, // Will be calculated
        finalPrice: 0, // Will be calculated
        actualMargin: 10 + Math.random() * 25,
        weight: 1,
        destinationType,
        deliveryTimeMin: 24,
        deliveryTimeMax: 48,
        purchasePrice: standardPurchasePrice,
        sellingPrice: standardSellingPrice,
        marginDiscount: 0,
        customSellingPrice: standardSellingPrice,
        remainingMargin: ((standardSellingPrice - standardPurchasePrice) / standardSellingPrice) * 100,
      })

      // Generate Express service
      const expressPurchasePrice = 8 + Math.random() * 4
      const expressSellingPrice = expressPurchasePrice * (1 + (15 + Math.random() * 25) / 100)

      rates.push({
        id: `${carrier.id}-express-${destinationType}`,
        carrierId: carrier.id,
        carrierName: carrier.name,
        carrierLogo: carrier.logoUrl,
        serviceCode: "EXP",
        serviceName: "Express",
        basePrice: 8 + Math.random() * 7,
        fuelSurcharge: 2 + Math.random() * 3,
        totalBasePrice: 0, // Will be calculated
        volumeDiscount: Math.random() * 8,
        promotionDiscount: Math.random() * 5,
        totalDiscountPercentage: 0, // Will be calculated
        finalPrice: 0, // Will be calculated
        actualMargin: 15 + Math.random() * 20,
        weight: 1,
        destinationType,
        deliveryTimeMin: 12,
        deliveryTimeMax: 24,
        purchasePrice: expressPurchasePrice,
        sellingPrice: expressSellingPrice,
        marginDiscount: 0,
        customSellingPrice: expressSellingPrice,
        remainingMargin: ((expressSellingPrice - expressPurchasePrice) / expressSellingPrice) * 100,
      })
    } else {
      // Per destinazioni UE o Extra UE, generiamo tariffe per ogni paese
      countries.forEach((country) => {
        // Aggiungiamo un fattore di variazione in base al paese
        const countryFactor = 0.8 + (country.id.charCodeAt(0) % 10) / 10 // Varia tra 0.8 e 1.7

        // Generate Standard service
        const standardPurchasePrice = (5 + Math.random() * 3) * countryFactor
        const standardSellingPrice = standardPurchasePrice * (1 + (10 + Math.random() * 20) / 100)

        rates.push({
          id: `${carrier.id}-standard-${destinationType}-${country.id}`,
          carrierId: carrier.id,
          carrierName: carrier.name,
          carrierLogo: carrier.logoUrl,
          serviceCode: "STD",
          serviceName: "Standard",
          basePrice: (5 + Math.random() * 5) * countryFactor,
          fuelSurcharge: 2 + Math.random() * 3,
          totalBasePrice: 0, // Will be calculated
          volumeDiscount: Math.random() * 10,
          promotionDiscount: Math.random() * 5,
          totalDiscountPercentage: 0, // Will be calculated
          finalPrice: 0, // Will be calculated
          actualMargin: 10 + Math.random() * 25,
          weight: 1,
          destinationType,
          destinationCountry: country.id,
          deliveryTimeMin: 24 * countryFactor,
          deliveryTimeMax: 48 * countryFactor,
          purchasePrice: standardPurchasePrice,
          sellingPrice: standardSellingPrice,
          marginDiscount: 0,
          customSellingPrice: standardSellingPrice,
          remainingMargin: ((standardSellingPrice - standardPurchasePrice) / standardSellingPrice) * 100,
        })

        // Generate Express service
        const expressPurchasePrice = (8 + Math.random() * 4) * countryFactor
        const expressSellingPrice = expressPurchasePrice * (1 + (15 + Math.random() * 25) / 100)

        rates.push({
          id: `${carrier.id}-express-${destinationType}-${country.id}`,
          carrierId: carrier.id,
          carrierName: carrier.name,
          carrierLogo: carrier.logoUrl,
          serviceCode: "EXP",
          serviceName: "Express",
          basePrice: (8 + Math.random() * 7) * countryFactor,
          fuelSurcharge: 2 + Math.random() * 3,
          totalBasePrice: 0, // Will be calculated
          volumeDiscount: Math.random() * 8,
          promotionDiscount: Math.random() * 5,
          totalDiscountPercentage: 0, // Will be calculated
          finalPrice: 0, // Will be calculated
          actualMargin: 15 + Math.random() * 20,
          weight: 1,
          destinationType,
          destinationCountry: country.id,
          deliveryTimeMin: 12 * countryFactor,
          deliveryTimeMax: 24 * countryFactor,
          purchasePrice: expressPurchasePrice,
          sellingPrice: expressSellingPrice,
          marginDiscount: 0,
          customSellingPrice: expressSellingPrice,
          remainingMargin: ((expressSellingPrice - expressPurchasePrice) / expressSellingPrice) * 100,
        })
      })
    }
  })

  // Calculate derived values
  return rates.map((rate) => {
    const totalBasePrice = rate.basePrice * (1 + rate.fuelSurcharge / 100)
    const totalDiscountPercentage = rate.volumeDiscount + rate.promotionDiscount
    const finalPrice = totalBasePrice * (1 - totalDiscountPercentage / 100)

    return {
      ...rate,
      totalBasePrice,
      totalDiscountPercentage,
      finalPrice,
    }
  })
}

const generateMockSuggestions = (): Suggestion[] => {
  return [
    {
      id: "1",
      type: "margin_warning",
      carrierId: "1",
      carrierName: "BRT",
      message:
        "Il margine per il servizio Standard di BRT è inferiore al 15%. Considera di aumentare il prezzo o negoziare una tariffa migliore.",
    },
    {
      id: "2",
      type: "active_promotion",
      carrierId: "3",
      carrierName: "DHL",
      message:
        "C'è una promozione attiva per DHL Express con uno sconto aggiuntivo del 5% per volumi superiori a 100 spedizioni mensili.",
    },
    {
      id: "3",
      type: "volume_opportunity",
      carrierId: "2",
      carrierName: "GLS",
      message:
        "Aumentando il volume mensile a 150 spedizioni, potresti ottenere uno sconto volume del 12% invece dell'attuale 8%.",
    },
  ]
}

// Helper functions
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(amount)
}

const getMarginColor = (margin: number): "default" | "secondary" | "destructive" | "success" => {
  if (margin >= 25) return "success"
  if (margin >= 15) return "secondary"
  return "destructive"
}

const getMarginLabel = (margin: number): string => {
  if (margin >= 25) return "Alto"
  if (margin >= 15) return "Medio"
  return "Basso"
}

// Aggiungi una colonna per il paese nella tabella
// Trova la definizione di defaultTableColumns e aggiungi la colonna per il paese dopo la colonna del servizio
const defaultTableColumns: TableColumn[] = [
  { id: "carrier", label: "Corriere", visible: true, align: "left" },
  { id: "service", label: "Servizio", visible: true, align: "left" },
  { id: "country", label: "Paese", visible: true, align: "left" },
  { id: "purchasePrice", label: "Prezzo Acquisto", visible: true, align: "right" },
  { id: "sellingPrice", label: "Prezzo Vendita", visible: true, align: "right" },
  { id: "marginDiscount", label: "Sconto Margine", visible: true, align: "center" },
  { id: "finalPrice", label: "Prezzo Finale", visible: true, align: "right" },
  { id: "margin", label: "Margine", visible: true, align: "center" },
  { id: "delivery", label: "Consegna", visible: true, align: "center" },
  { id: "details", label: "Dettagli", visible: true, align: "center" },
]

export default function RateComparisonCard() {
  // States
  const [carriers, setCarriers] = useState<Carrier[]>(mockCarriers)
  const [rates, setRates] = useState<Rate[]>([])
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [destinationType, setDestinationType] = useState<string>("national")
  // Modifica lo stato filters per includere il paese
  const [filters, setFilters] = useState<FilterState>({
    carrierId: "",
    serviceType: "",
    weight: "1",
    destinationType: "national",
    volume: "100",
    country: "",
  })
  const [detailOpen, setDetailOpen] = useState<boolean>(false)
  const [selectedRate, setSelectedRate] = useState<Rate | null>(null)
  const [suggestionsOpen, setSuggestionsOpen] = useState<boolean>(false)
  const [page, setPage] = useState<number>(1)
  const [hasSuggestions, setHasSuggestions] = useState<boolean>(false)
  const [customDiscounts, setCustomDiscounts] = useState<Record<string, number>>({})
  const [tableColumns, setTableColumns] = useState<TableColumn[]>(defaultTableColumns)
  const rowsPerPage = 5

  // Load rates when filters or destination type changes
  // Modifica la funzione loadRates per filtrare per paese
  const loadRates = useCallback(async () => {
    setLoading(true)

    // In a real application, this would be an API call
    setTimeout(() => {
      const mockRates = generateMockRates(filters.destinationType)

      // Apply filters
      let filteredRates = [...mockRates]

      if (filters.carrierId) {
        filteredRates = filteredRates.filter((rate) => rate.carrierId === filters.carrierId)
      }

      if (filters.serviceType) {
        filteredRates = filteredRates.filter((rate) => rate.serviceName === filters.serviceType)
      }

      // Filtra per paese se è selezionato un paese e siamo in modalità UE o Extra UE
      if (filters.country && (filters.destinationType === "eu" || filters.destinationType === "extra_eu")) {
        filteredRates = filteredRates.filter((rate) => rate.destinationCountry === filters.country)
      }

      // Weight and volume would affect pricing in a real application

      // Apply any existing custom discounts to the new rates
      filteredRates = filteredRates.map((rate) => {
        const existingDiscount = customDiscounts[rate.id]
        if (existingDiscount !== undefined) {
          const originalMargin = rate.sellingPrice - rate.purchasePrice
          const discountAmount = (originalMargin * existingDiscount) / 100
          const customSellingPrice = rate.sellingPrice - discountAmount
          const remainingMargin = ((customSellingPrice - rate.purchasePrice) / customSellingPrice) * 100

          return {
            ...rate,
            marginDiscount: existingDiscount,
            customSellingPrice,
            remainingMargin: remainingMargin > 0 ? remainingMargin : 0,
          }
        }
        return rate
      })

      setRates(filteredRates)
      setLoading(false)

      // Load suggestions
      loadSuggestions()
    }, 500)
  }, [filters, customDiscounts])

  useEffect(() => {
    loadRates()
  }, [loadRates])

  // Handle destination type change
  // Modifica la funzione handleDestinationChange per resettare il paese quando cambia la destinazione
  const handleDestinationChange = (value: string) => {
    setDestinationType(value)
    setFilters({
      ...filters,
      destinationType: value,
      country: "", // Reset country when destination type changes
    })
  }

  // Handle filter change
  const handleFilterChange = (name: string, value: string) => {
    setFilters({
      ...filters,
      [name]: value,
    })
  }

  // Handle margin discount change
  const handleMarginDiscountChange = (rateId: string, discountPercentage: number) => {
    // Ensure discount is within valid range
    const validDiscount = Math.max(0, Math.min(90, discountPercentage))

    // Update the custom discounts state
    setCustomDiscounts((prev) => ({
      ...prev,
      [rateId]: validDiscount,
    }))

    // Update the rates with the new discount
    setRates((prevRates) =>
      prevRates.map((rate) => {
        if (rate.id === rateId) {
          const originalMargin = rate.sellingPrice - rate.purchasePrice
          const discountAmount = (originalMargin * validDiscount) / 100
          const customSellingPrice = rate.sellingPrice - discountAmount
          const remainingMargin = ((customSellingPrice - rate.purchasePrice) / customSellingPrice) * 100

          return {
            ...rate,
            marginDiscount: validDiscount,
            customSellingPrice,
            remainingMargin: remainingMargin > 0 ? remainingMargin : 0,
          }
        }
        return rate
      }),
    )

    // If the selected rate is being modified, update it as well
    if (selectedRate && selectedRate.id === rateId) {
      const originalMargin = selectedRate.sellingPrice - selectedRate.purchasePrice
      const discountAmount = (originalMargin * validDiscount) / 100
      const customSellingPrice = selectedRate.sellingPrice - discountAmount
      const remainingMargin = ((customSellingPrice - selectedRate.purchasePrice) / customSellingPrice) * 100

      setSelectedRate({
        ...selectedRate,
        marginDiscount: validDiscount,
        customSellingPrice,
        remainingMargin: remainingMargin > 0 ? remainingMargin : 0,
      })
    }
  }

  // Handle column visibility change
  const handleColumnVisibilityChange = (columnId: string, checked: boolean) => {
    setTableColumns((prevColumns) =>
      prevColumns.map((column) => {
        if (column.id === columnId) {
          return { ...column, visible: checked }
        }
        return column
      }),
    )
  }

  // Reset columns to default
  const resetColumnsToDefault = () => {
    setTableColumns(defaultTableColumns)
  }

  // Load suggestions
  const loadSuggestions = () => {
    const mockSuggestions = generateMockSuggestions()
    setSuggestions(mockSuggestions)
    setHasSuggestions(mockSuggestions.length > 0)
  }

  // Open rate detail
  const handleOpenDetail = (rate: Rate) => {
    setSelectedRate(rate)
    setDetailOpen(true)
  }

  // Close rate detail
  const handleCloseDetail = () => {
    setDetailOpen(false)
  }

  // Open suggestions
  const handleOpenSuggestions = () => {
    setSuggestionsOpen(true)
  }

  // Close suggestions
  const handleCloseSuggestions = () => {
    setSuggestionsOpen(false)
  }

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  // Calculate displayed rates
  const displayedRates = rates.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  // Calculate total pages
  const totalPages = Math.ceil(rates.length / rowsPerPage)

  // Get visible columns
  const visibleColumns = tableColumns.filter((column) => column.visible)

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-bold text-primary">SendQuote - Confronto Tariffe Spedizioni</CardTitle>
            <CardDescription>Confronta le tariffe dei corrieri e ottieni suggerimenti personalizzati</CardDescription>
          </div>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filters section */}
        <div className="bg-card border rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex items-center mb-3">
            <Filter className="mr-2 h-5 w-5" />
            <h3 className="text-lg font-medium">Filtri</h3>
          </div>
          <Separator className="mb-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="carrier">Corriere</Label>
              <Select value={filters.carrierId} onValueChange={(value) => handleFilterChange("carrierId", value)}>
                <SelectTrigger id="carrier">
                  <SelectValue placeholder="Tutti i corrieri" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i corrieri</SelectItem>
                  {carriers.map((carrier) => (
                    <SelectItem key={carrier.id} value={carrier.id}>
                      {carrier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="service">Tipo Servizio</Label>
              <Select value={filters.serviceType} onValueChange={(value) => handleFilterChange("serviceType", value)}>
                <SelectTrigger id="service">
                  <SelectValue placeholder="Tutti i servizi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i servizi</SelectItem>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Express">Express</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="weight">Peso (kg)</Label>
              <div className="flex items-center">
                <Input
                  id="weight"
                  type="number"
                  value={filters.weight}
                  onChange={(e) => handleFilterChange("weight", e.target.value)}
                  className="w-full"
                />
                <span className="ml-2">kg</span>
              </div>
            </div>
            {(filters.destinationType === "eu" || filters.destinationType === "extra_eu") && (
              <div>
                <Label htmlFor="country">Paese</Label>
                <Select value={filters.country} onValueChange={(value) => handleFilterChange("country", value)}>
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Tutti i paesi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti i paesi</SelectItem>
                    {filters.destinationType === "eu"
                      ? euCountries.map((country) => (
                          <SelectItem key={country.id} value={country.id}>
                            {country.name}
                          </SelectItem>
                        ))
                      : extraEuCountries.map((country) => (
                          <SelectItem key={country.id} value={country.id}>
                            {country.name}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="volume">Volume mensile</Label>
              <div className="flex items-center">
                <Input
                  id="volume"
                  type="number"
                  value={filters.volume}
                  onChange={(e) => handleFilterChange("volume", e.target.value)}
                  className="w-full"
                />
                <span className="ml-2">pz</span>
              </div>
            </div>

            <div className="flex items-end">
              <Button className="w-full" onClick={loadRates}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Aggiorna
              </Button>
            </div>
          </div>
        </div>

        {/* AI Suggestions banner */}
        {hasSuggestions && (
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <Lightbulb className="h-4 w-4 text-blue-500" />
            <AlertTitle>Suggerimenti disponibili</AlertTitle>
            <AlertDescription className="flex justify-between items-center">
              <span>Abbiamo {suggestions.length} suggerimenti per ottimizzare le tue tariffe!</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenSuggestions}
                className="text-blue-600 border-blue-200 hover:bg-blue-100"
              >
                Vedi suggerimenti
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Destination tabs */}
        <Tabs defaultValue="national" value={destinationType} onValueChange={handleDestinationChange} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="national">Nazionale</TabsTrigger>
            <TabsTrigger value="eu">Unione Europea</TabsTrigger>
            <TabsTrigger value="extra_eu">Extra UE</TabsTrigger>
          </TabsList>

          <TabsContent value="national" className="mt-4">
            {/* Rates table - content is the same for all tabs, controlled by state */}
            {renderRatesTable()}
          </TabsContent>

          <TabsContent value="eu" className="mt-4">
            {renderRatesTable()}
          </TabsContent>

          <TabsContent value="extra_eu" className="mt-4">
            {renderRatesTable()}
          </TabsContent>
        </Tabs>

        {/* Action buttons */}
        <div className="flex justify-end mt-6 space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Esporta CSV
          </Button>
          <Button variant="outline" onClick={handleOpenSuggestions} disabled={!hasSuggestions}>
            <Lightbulb className="mr-2 h-4 w-4" />
            Suggerimenti AI
          </Button>
        </div>
      </CardContent>

      {/* Rate detail dialog */}
      <Dialog open={detailOpen} onClose={handleCloseDetail}>
        {selectedRate && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>
                  Dettaglio Tariffa: {selectedRate.carrierName} - {selectedRate.serviceName}
                </span>
                <Button variant="ghost" size="icon" onClick={handleCloseDetail} className="h-6 w-6 rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            <DialogContent className="max-w-3xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Informazioni Base</h4>
                  <Separator className="mb-3" />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Corriere:</span>
                      <span className="text-sm font-medium">{selectedRate.carrierName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Servizio:</span>
                      <span className="text-sm font-medium">{selectedRate.serviceName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Peso:</span>
                      <span className="text-sm font-medium">{selectedRate.weight} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Destinazione:</span>
                      <span className="text-sm font-medium">
                        {selectedRate.destinationType === "national"
                          ? "Nazionale"
                          : selectedRate.destinationType === "eu"
                            ? "Unione Europea"
                            : "Extra UE"}
                      </span>
                    </div>
                    {selectedRate.destinationCountry && (
                      <div className="flex justify-between">
                        <span className="text-sm">Paese di destinazione:</span>
                        <span className="text-sm font-medium">
                          {(selectedRate.destinationType === "eu"
                            ? euCountries.find((c) => c.id === selectedRate.destinationCountry)?.name
                            : extraEuCountries.find((c) => c.id === selectedRate.destinationCountry)?.name) ||
                            "Sconosciuto"}
                        </span>
                      </div>
                    )}
                    {selectedRate.destinationCountry && (
                      <div className="flex justify-between">
                        <span className="text-sm">Paese:</span>
                        <span className="text-sm font-medium">
                          {selectedRate.destinationType === "eu"
                            ? euCountries.find((c) => c.id === selectedRate.destinationCountry)?.name
                            : extraEuCountries.find((c) => c.id === selectedRate.destinationCountry)?.name}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm">Tempo di consegna:</span>
                      <span className="text-sm font-medium">
                        {selectedRate.deliveryTimeMin === selectedRate.deliveryTimeMax
                          ? `${selectedRate.deliveryTimeMin} ore`
                          : `${selectedRate.deliveryTimeMin}-${selectedRate.deliveryTimeMax} ore`}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Dettagli Prezzo</h4>
                  <Separator className="mb-3" />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Prezzo di acquisto:</span>
                      <span className="text-sm font-medium">{formatCurrency(selectedRate.purchasePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Prezzo di vendita originale:</span>
                      <span className="text-sm font-medium">{formatCurrency(selectedRate.sellingPrice)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Sconto sul margine:</span>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="90"
                          value={selectedRate.marginDiscount}
                          onChange={(e) => handleMarginDiscountChange(selectedRate.id, Number(e.target.value))}
                          className="w-20 text-center"
                        />
                        <span className="text-sm">%</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Prezzo di vendita scontato:</span>
                      <span className="text-sm font-medium text-primary">
                        {formatCurrency(selectedRate.customSellingPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Tariffa base:</span>
                      <span className="text-sm font-medium">{formatCurrency(selectedRate.basePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Sovrapprezzo carburante ({selectedRate.fuelSurcharge}%):</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(selectedRate.basePrice * (selectedRate.fuelSurcharge / 100))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Prezzo base totale:</span>
                      <span className="text-sm font-medium">{formatCurrency(selectedRate.totalBasePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Sconto volume ({selectedRate.volumeDiscount}%):</span>
                      <span className="text-sm font-medium text-primary">
                        {formatCurrency(-(selectedRate.totalBasePrice * (selectedRate.volumeDiscount / 100)))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Sconto promozione ({selectedRate.promotionDiscount}%):</span>
                      <span className="text-sm font-medium text-primary">
                        {formatCurrency(-(selectedRate.totalBasePrice * (selectedRate.promotionDiscount / 100)))}
                      </span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between">
                      <span className="font-medium">Prezzo finale:</span>
                      <span className="font-medium">{formatCurrency(selectedRate.customSellingPrice)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Margine totale mensile:</span>
                      <Badge variant={getMarginColor(selectedRate.remainingMargin)}>
                        {formatCurrency(
                          (selectedRate.customSellingPrice - selectedRate.purchasePrice) * Number(filters.volume),
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
            <DialogFooter>
              <Button onClick={handleCloseDetail}>Chiudi</Button>
            </DialogFooter>
          </>
        )}
      </Dialog>

      {/* AI Suggestions dialog */}
      <Dialog open={suggestionsOpen} onClose={handleCloseSuggestions}>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Lightbulb className="mr-2 h-5 w-5 text-primary" />
            <span>Suggerimenti AI per ottimizzare le tariffe</span>
          </DialogTitle>
          <DialogDescription>
            Consigli personalizzati per migliorare i tuoi margini e sfruttare le promozioni
          </DialogDescription>
        </DialogHeader>
        <DialogContent className="max-w-3xl">
          <ScrollArea className="max-h-[60vh]">
            {suggestions.length === 0 ? (
              <Alert>
                <AlertTitle>Nessun suggerimento disponibile</AlertTitle>
                <AlertDescription>Non ci sono suggerimenti disponibili per i parametri selezionati.</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className={`p-4 border rounded-lg ${
                      suggestion.type === "margin_warning"
                        ? "border-l-4 border-l-destructive"
                        : suggestion.type === "active_promotion"
                          ? "border-l-4 border-l-success"
                          : "border-l-4 border-l-primary"
                    }`}
                  >
                    <h4 className="font-medium mb-1">
                      {suggestion.type === "margin_warning"
                        ? "Attenzione Margine"
                        : suggestion.type === "active_promotion"
                          ? "Promozione Attiva"
                          : "Opportunità di Sconto Volume"}
                    </h4>
                    <p>{suggestion.message}</p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
        <DialogFooter>
          <Button onClick={handleCloseSuggestions}>Chiudi</Button>
        </DialogFooter>
      </Dialog>
    </Card>
  )

  // Helper function to render rates table
  function renderRatesTable() {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )
    }

    if (rates.length === 0) {
      return (
        <Alert>
          <AlertTitle>Nessuna tariffa trovata</AlertTitle>
          <AlertDescription>Non sono state trovate tariffe con i filtri selezionati.</AlertDescription>
        </Alert>
      )
    }

    return (
      <>
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-muted-foreground">{rates.length} tariffe trovate</div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto">
                <Columns className="h-4 w-4 mr-2" />
                Personalizza colonne
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Seleziona le colonne da visualizzare</h4>
                <Separator />
                <div className="space-y-2">
                  {tableColumns.map((column) => (
                    <div key={column.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`column-${column.id}`}
                        checked={column.visible}
                        onCheckedChange={(checked) => handleColumnVisibilityChange(column.id, checked === true)}
                      />
                      <Label htmlFor={`column-${column.id}`}>{column.label}</Label>
                    </div>
                  ))}
                </div>
                <Separator />
                <Button size="sm" variant="outline" onClick={resetColumnsToDefault} className="w-full">
                  Ripristina predefinite
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                {visibleColumns.map((column) => (
                  <TableHead key={column.id} className={`text-${column.align}`}>
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedRates.map((rate) => (
                <TableRow key={rate.id} className="hover:bg-muted/30">
                  {visibleColumns.map((column) => {
                    switch (column.id) {
                      case "carrier":
                        return (
                          <TableCell key={column.id}>
                            <div className="flex items-center">
                              <img
                                src={rate.carrierLogo || "/placeholder.svg"}
                                alt={rate.carrierName}
                                className="w-8 h-8 mr-2 object-contain"
                              />
                              <span>{rate.carrierName}</span>
                            </div>
                          </TableCell>
                        )
                      case "service":
                        return <TableCell key={column.id}>{rate.serviceName}</TableCell>
                      // Aggiungi il rendering della colonna del paese nella funzione renderRatesTable
                      // Trova il blocco switch-case nella funzione renderRatesTable e aggiungi un nuovo case per la colonna del paese
                      // Dopo il case "service":
                      case "country":
                        return (
                          <TableCell key={column.id}>
                            {rate.destinationCountry
                              ? destinationType === "eu"
                                ? euCountries.find((c) => c.id === rate.destinationCountry)?.name
                                : extraEuCountries.find((c) => c.id === rate.destinationCountry)?.name
                              : destinationType === "national"
                                ? "Italia"
                                : ""}
                          </TableCell>
                        )
                      case "purchasePrice":
                        return (
                          <TableCell key={column.id} className="text-right">
                            {formatCurrency(rate.purchasePrice)}
                          </TableCell>
                        )
                      case "sellingPrice":
                        return (
                          <TableCell key={column.id} className="text-right">
                            {formatCurrency(rate.sellingPrice)}
                          </TableCell>
                        )
                      case "marginDiscount":
                        return (
                          <TableCell key={column.id} className="text-center">
                            <div className="flex flex-col items-center gap-2">
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min="0"
                                  max="90"
                                  value={rate.marginDiscount}
                                  onChange={(e) => handleMarginDiscountChange(rate.id, Number(e.target.value))}
                                  className="w-16 text-center"
                                />
                                <span>%</span>
                              </div>
                            </div>
                          </TableCell>
                        )
                      case "finalPrice":
                        return (
                          <TableCell key={column.id} className="text-right font-medium">
                            {formatCurrency(rate.customSellingPrice)}
                          </TableCell>
                        )
                      case "margin":
                        return (
                          <TableCell key={column.id} className="text-center">
                            <Badge variant={getMarginColor(rate.remainingMargin)}>
                              {formatCurrency((rate.customSellingPrice - rate.purchasePrice) * Number(filters.volume))}
                            </Badge>
                          </TableCell>
                        )
                      case "delivery":
                        return (
                          <TableCell key={column.id} className="text-center">
                            {rate.deliveryTimeMin === rate.deliveryTimeMax
                              ? `${rate.deliveryTimeMin}h`
                              : `${rate.deliveryTimeMin}-${rate.deliveryTimeMax}h`}
                          </TableCell>
                        )
                      case "details":
                        return (
                          <TableCell key={column.id} className="text-center">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenDetail(rate)}>
                              <Info className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )
                      default:
                        return <TableCell key={column.id}></TableCell>
                    }
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(Math.max(1, page - 1))}
                    className={page === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }).map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink isActive={page === index + 1} onClick={() => handlePageChange(index + 1)}>
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                    className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </>
    )
  }
}

