"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Filter, RefreshCw, Download, Lightbulb, Info, MoreVertical, X, Columns, ChevronRight } from "lucide-react"
import {
  Pagination,
  PaginationContent as UPaginationContent,
  PaginationItem as UPaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination"
import { getCarriers, compareRates, getServices } from "../services/api"

// Mock data for carriers
const CARRIERS = [
  {
    id: "1",
    name: "BRT",
    logoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/brt.svg-P9qauJfDY2jf3ssHnMivYtBnNz8wSn.png",
  },
  {
    id: "2",
    name: "GLS",
    logoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gls-RAOsrs0wCzdXlD2OvgPbVa7qqFDgOo.webp",
  },
  {
    id: "3",
    name: "DHL",
    logoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dhl-19ZkH6nuiU7ABE42HthHDOQWjmOWqU.webp",
  },
  { id: "4", name: "Poste Italiane", logoUrl: "/placeholder.svg?height=40&width=40" },
  { id: "5", name: "InPost", logoUrl: "/placeholder.svg?height=40&width=40" },
]

// Add country lists after the CARRIERS constant
const EU_COUNTRIES = [
  { id: "fr", name: "France" },
  { id: "de", name: "Germany" },
  { id: "it", name: "Italy" },
  { id: "es", name: "Spain" },
  { id: "nl", name: "Netherlands" },
  { id: "be", name: "Belgium" },
  { id: "pt", name: "Portugal" },
  { id: "at", name: "Austria" },
  { id: "pl", name: "Poland" },
  { id: "se", name: "Sweden" },
]

const EXTRA_EU_COUNTRIES = [
  { id: "us", name: "United States" },
  { id: "ca", name: "Canada" },
  { id: "uk", name: "United Kingdom" },
  { id: "ch", name: "Switzerland" },
  { id: "au", name: "Australia" },
  { id: "jp", name: "Japan" },
  { id: "cn", name: "China" },
  { id: "sg", name: "Singapore" },
  { id: "ae", name: "United Arab Emirates" },
  { id: "br", name: "Brazil" },
]

// Define weight ranges
const WEIGHT_RANGES = [
  { min: 0, max: 1, label: "0-1 kg" },
  { min: 1, max: 3, label: "1-3 kg" },
  { min: 3, max: 5, label: "3-5 kg" },
  { min: 5, max: 10, label: "5-10 kg" },
  { min: 10, max: 20, label: "10-20 kg" },
  { min: 20, max: 30, label: "20-30 kg" },
]

// Define column configuration
const ALL_COLUMNS = [
  { id: "carrier", name: "Carrier", isVisible: true },
  { id: "service", name: "Service", isVisible: true },
  { id: "country", name: "Country", isVisible: true },
  { id: "baseRate", name: "Base Rate", isVisible: true },
  { id: "discount", name: "Discount (%)", isVisible: true },
  { id: "finalPrice", name: "Final Price", isVisible: true },
  { id: "margin", name: "Margin", isVisible: true },
  { id: "delivery", name: "Delivery", isVisible: true },
  { id: "details", name: "Details", isVisible: true },
]

export default function RateComparisonCard() {
  // States
  const [activeTab, setActiveTab] = useState("national")
  const [loading, setLoading] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedRate, setSelectedRate] = useState<any>(null)
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [rates, setRates] = useState<any[]>([])
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [carriers, setCarriers] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const rowsPerPage = 5

  // Add state for selected rows
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({})

  // Add state for expanded rows
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})

  // Add state for column customization
  const [columnsDialogOpen, setColumnsDialogOpen] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState(ALL_COLUMNS)

  // Update the filters state to include country
  const [filters, setFilters] = useState({
    carrierId: "",
    serviceType: "",
    weight: "1",
    volume: "100",
    country: "",
  })

  // Update the generateMockRates function to include weight ranges
  const generateMockRates = useCallback((destinationType: string, filters: any) => {
    const services = ["Standard", "Express", "Premium"]
    const mockRates = []

    // Get the appropriate country list based on destination type
    const countryList =
      destinationType === "eu" ? EU_COUNTRIES : destinationType === "extra_eu" ? EXTRA_EU_COUNTRIES : []

    for (let i = 0; i < CARRIERS.length; i++) {
      for (let j = 0; j < services.length; j++) {
        // For international shipments, create rates for each country or a subset
        if (destinationType !== "national") {
          // Create rates for a subset of countries to make data more realistic
          const countries = filters.country
            ? [countryList.find((c) => c.id === filters.country)]
            : countryList.filter(() => Math.random() > 0.5)

          for (const country of countries) {
            if (!country) continue

            // Skip some combinations to make data more realistic
            if (Math.random() > 0.7) continue

            // Generate a unique service ID
            const serviceId = `${CARRIERS[i].id}-${services[j].toLowerCase()}-${country.id}-${Math.random().toString(36).substring(2, 7)}`

            // Generate weight ranges for this service
            const weightRanges = WEIGHT_RANGES.map((range) => {
              // Base price increases with weight
              const basePrice = 5 + Math.random() * 20 + (destinationType === "extra_eu" ? 15 : 5) + range.max * 0.5
              const fuelSurcharge = Math.round(Math.random() * 10)
              const totalBasePrice = basePrice * (1 + fuelSurcharge / 100)

              const volumeDiscount = Math.round(Math.random() * 15)
              const promotionDiscount = Math.round(Math.random() * 10)
              const totalDiscountPercentage = volumeDiscount + promotionDiscount

              // Change from percentage to monetary value
              const finalPrice = totalBasePrice * (1 - totalDiscountPercentage / 100)
              // Calculate margin as a monetary value in euros
              const actualMargin = finalPrice * (Math.random() * 0.35) // Random margin up to 35% of final price

              return {
                rangeId: `${serviceId}-${range.min}-${range.max}`,
                weightRange: range,
                basePrice,
                fuelSurcharge,
                totalBasePrice,
                volumeDiscount,
                promotionDiscount,
                totalDiscountPercentage,
                finalPrice,
                actualMargin,
              }
            })

            // Use the first weight range as the default display
            const defaultRange =
              weightRanges.find(
                (range) =>
                  Number.parseFloat(filters.weight) >= range.weightRange.min &&
                  Number.parseFloat(filters.weight) < range.weightRange.max,
              ) || weightRanges[0]

            const deliveryTimeMin = 24 + Math.round(Math.random() * 48) + (destinationType === "extra_eu" ? 48 : 24) // Extra EU takes longer
            const deliveryTimeMax = deliveryTimeMin + Math.round(Math.random() * 24)

            mockRates.push({
              id: serviceId,
              carrierId: CARRIERS[i].id,
              carrierName: CARRIERS[i].name,
              carrierLogo: CARRIERS[i].logoUrl,
              serviceCode: services[j].toLowerCase(),
              serviceName: services[j],
              basePrice: defaultRange.basePrice,
              fuelSurcharge: defaultRange.fuelSurcharge,
              totalBasePrice: defaultRange.totalBasePrice,
              volumeDiscount: defaultRange.volumeDiscount,
              promotionDiscount: defaultRange.promotionDiscount,
              totalDiscountPercentage: defaultRange.totalDiscountPercentage,
              finalPrice: defaultRange.finalPrice,
              actualMargin: defaultRange.actualMargin,
              userDiscount: 0, // Add user discount field
              weight: Number.parseFloat(filters.weight),
              destinationType,
              countryId: country.id,
              countryName: country.name,
              deliveryTimeMin,
              deliveryTimeMax,
              weightRanges, // Add all weight ranges
              currentWeightRange: defaultRange.weightRange, // Add current weight range
            })
          }
        } else {
          // For national shipments, keep the original logic
          // Skip some combinations to make data more realistic
          if (Math.random() > 0.7) continue

          // Generate a unique service ID
          const serviceId = `${CARRIERS[i].id}-${services[j].toLowerCase()}-it-${Math.random().toString(36).substring(2, 7)}`

          // Generate weight ranges for this service
          const weightRanges = WEIGHT_RANGES.map((range) => {
            // Base price increases with weight
            const basePrice = 5 + Math.random() * 20 + range.max * 0.5
            const fuelSurcharge = Math.round(Math.random() * 10)
            const totalBasePrice = basePrice * (1 + fuelSurcharge / 100)

            const volumeDiscount = Math.round(Math.random() * 15)
            const promotionDiscount = Math.round(Math.random() * 10)
            const totalDiscountPercentage = volumeDiscount + promotionDiscount

            // Change from percentage to monetary value
            const finalPrice = totalBasePrice * (1 - totalDiscountPercentage / 100)
            // Calculate margin as a monetary value in euros
            const actualMargin = finalPrice * (Math.random() * 0.35) // Random margin up to 35% of final price

            return {
              rangeId: `${serviceId}-${range.min}-${range.max}`,
              weightRange: range,
              basePrice,
              fuelSurcharge,
              totalBasePrice,
              volumeDiscount,
              promotionDiscount,
              totalDiscountPercentage,
              finalPrice,
              actualMargin,
            }
          })

          // Use the first weight range as the default display
          const defaultRange =
            weightRanges.find(
              (range) =>
                Number.parseFloat(filters.weight) >= range.weightRange.min &&
                Number.parseFloat(filters.weight) < range.weightRange.max,
            ) || weightRanges[0]

          const deliveryTimeMin = 24 + Math.round(Math.random() * 48)
          const deliveryTimeMax = deliveryTimeMin + Math.round(Math.random() * 24)

          mockRates.push({
            id: serviceId,
            carrierId: CARRIERS[i].id,
            carrierName: CARRIERS[i].name,
            carrierLogo: CARRIERS[i].logoUrl,
            serviceCode: services[j].toLowerCase(),
            serviceName: services[j],
            basePrice: defaultRange.basePrice,
            fuelSurcharge: defaultRange.fuelSurcharge,
            totalBasePrice: defaultRange.totalBasePrice,
            volumeDiscount: defaultRange.volumeDiscount,
            promotionDiscount: defaultRange.promotionDiscount,
            totalDiscountPercentage: defaultRange.totalDiscountPercentage,
            finalPrice: defaultRange.finalPrice,
            actualMargin: defaultRange.actualMargin,
            userDiscount: 0, // Add user discount field
            weight: Number.parseFloat(filters.weight),
            destinationType,
            countryId: "it", // Default to Italy for national
            countryName: "Italy",
            deliveryTimeMin,
            deliveryTimeMax,
            weightRanges, // Add all weight ranges
            currentWeightRange: defaultRange.weightRange, // Add current weight range
          })
        }
      }
    }

    // Apply filters
    let filteredRates = mockRates

    if (filters.carrierId && filters.carrierId !== "all") {
      filteredRates = filteredRates.filter((rate) => rate.carrierId === filters.carrierId)
    }

    if (filters.serviceType && filters.serviceType !== "all") {
      filteredRates = filteredRates.filter((rate) => rate.serviceName === filters.serviceType)
    }

    if (filters.country && (destinationType === "eu" || destinationType === "extra_eu")) {
      filteredRates = filteredRates.filter((rate) => rate.countryId === filters.country)
    }

    return filteredRates
  }, [])

  // Mock data for AI suggestions
  const generateMockSuggestions = useCallback((destinationType: string, filters: any) => {
    const suggestions = [
      {
        type: "margin_warning",
        carrierId: "1",
        carrierName: "BRT",
        message:
          "BRT Standard service has a low margin (10.5%). Consider negotiating better rates or increasing your selling price.",
      },
      {
        type: "active_promotion",
        carrierId: "3",
        carrierName: "DHL",
        message:
          "DHL is currently offering a 15% discount on Express shipments for volumes over 100 packages per month.",
      },
      {
        type: "volume_opportunity",
        carrierId: "2",
        carrierName: "GLS",
        message:
          "Increasing your monthly volume with GLS from 100 to 150 packages would unlock an additional 5% discount.",
      },
    ]

    // Return a subset of suggestions based on random selection
    return suggestions.filter(() => Math.random() > 0.3)
  }, [])

  // Add a function to get the appropriate country list
  const getCountryList = () => {
    if (activeTab === "eu") return EU_COUNTRIES
    if (activeTab === "extra_eu") return EXTRA_EU_COUNTRIES
    return []
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  // Get margin color based on monetary value
  const getMarginColor = (margin: number) => {
    if (margin >= 10) return "success"
    if (margin >= 5) return "warning"
    return "destructive"
  }

  // Get margin label based on monetary value
  const getMarginLabel = (margin: number) => {
    if (margin >= 10) return "High"
    if (margin >= 5) return "Medium"
    return "Low"
  }

  // Update the handleTabChange function to reset the country filter when changing tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setCurrentPage(1)
    // Reset country filter when changing tabs
    setFilters((prev) => ({
      ...prev,
      country: "",
    }))
    // Reset selected rows when changing tabs
    setSelectedRows({})
    // Reset expanded rows when changing tabs
    setExpandedRows({})
  }

  // Add a function to update the user discount
  const updateUserDiscount = (rateId: string, newDiscount: number) => {
    setRates((prevRates) =>
      prevRates.map((rate) => {
        if (rate.id === rateId) {
          // Ensure discount is between 0 and 90%
          const clampedDiscount = Math.max(0, Math.min(90, newDiscount))

          // Update the discount for all weight ranges
          const updatedWeightRanges = rate.weightRanges.map((weightRange) => {
            // Calculate the discount amount
            const discountAmount = weightRange.actualMargin * (clampedDiscount / 100)

            return {
              ...weightRange,
              // Aggiorniamo solo userDiscount, non modifichiamo altri parametri di sconto
              userDiscount: clampedDiscount,
              // Recalculate final price with the user discount applied to the margin
              finalPrice: weightRange.finalPrice - discountAmount,
              // Adjust the margin based on the discount
              adjustedMargin: weightRange.actualMargin - discountAmount,
            }
          })

          // Calculate the discount amount for the main rate
          const discountAmount = rate.actualMargin * (clampedDiscount / 100)

          return {
            ...rate,
            userDiscount: clampedDiscount,
            // Recalculate final price with the user discount applied to the margin
            finalPrice: rate.finalPrice - discountAmount,
            // Adjust the margin based on the discount
            adjustedMargin: rate.actualMargin - discountAmount,
            weightRanges: updatedWeightRanges,
          }
        }
        return rate
      }),
    )
  }

  // Toggle row expansion
  const toggleRowExpansion = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Load services when carrier filter changes
  useEffect(() => {
    const loadServices = async () => {
      try {
        // Se abbiamo selezionato un carrier specifico, carichiamo solo i suoi servizi
        if (filters.carrierId) {
          const servicesData = await getServices(filters.carrierId);
          setServices(servicesData);
        } else if (carriers.length > 0) {
          // Altrimenti carichiamo tutti i servizi disponibili
          const servicesData = await getServices();
          setServices(servicesData);
        }
      } catch (error) {
        console.error('Errore durante il caricamento dei servizi:', error);
        setServices([]);
      }
    };

    loadServices();
  }, [filters.carrierId, carriers.length]);

  // Load rates when filters or tab changes
  const loadRates = useCallback(async () => {
    setLoading(true)
    setSelectedRows({}) // Reset selected rows when refreshing data
    setExpandedRows({}) // Reset expanded rows when refreshing data

    try {
      // Carichiamo i corrieri se non sono già stati caricati
      if (carriers.length === 0) {
        const carriersData = await getCarriers();
        setCarriers(carriersData);
      }

      // Se non abbiamo servizi, li carichiamo
      if (services.length === 0) {
        const servicesData = await getServices(filters.carrierId || undefined);
        setServices(servicesData);
      }
      
      // Confrontiamo le tariffe dal backend
      const ratesData = await compareRates({
        weight: filters.weight,
        destinationType: activeTab,
        destinationCountry: filters.country,
        carrierId: filters.carrierId,
        serviceType: filters.serviceType,
        volume: filters.volume
      });
      
      // Trasforma i dati dell'API nel formato atteso dal componente
      const formattedRates = ratesData.map((rate: any) => {
        // Crea gli intervalli di peso simulati (da sostituire con dati reali quando disponibili)
        const weightRanges = WEIGHT_RANGES.map((range) => {
          return {
            id: `${rate._id}-${range.min}-${range.max}`,
            label: `${range.min}-${range.max} kg`,
            min: range.min,
            max: range.max,
            basePrice: rate.basePrice || rate.retailPrice,
            userDiscount: 0,
            finalPrice: rate.finalPrice || rate.retailPrice,
            actualMargin: ((rate.retailPrice - rate.purchasePrice) / rate.retailPrice) * 100 || 15,
            volumeDiscount: rate.volumeDiscount || 0,
            promotionDiscount: rate.promotionDiscount || 0
          };
        });
        
        // Trova l'intervallo di peso corrente in base al filtro del peso
        const weightValue = parseFloat(filters.weight);
        const currentWeightRange = weightRanges.find(
          (range) => weightValue >= range.min && weightValue <= range.max
        ) || weightRanges[0];
        
        return {
          id: rate._id,
          carrierName: rate.carrier?.name || 'Unknown',
          carrierId: rate.carrier?._id || '',
          serviceName: rate.serviceCode || rate.name || 'Standard',
          serviceDescription: rate.description || '',
          countryName: rate.destinationCountry || '',
          destinationType: rate.destinationType || activeTab,
          basePrice: rate.basePrice || rate.retailPrice,
          userDiscount: 0,
          finalPrice: rate.finalPrice || rate.retailPrice,
          actualMargin: ((rate.retailPrice - rate.purchasePrice) / rate.retailPrice) * 100 || 15,
          deliveryTimeMin: rate.deliveryTimeMin || 24,
          deliveryTimeMax: rate.deliveryTimeMax || 48,
          fuelSurcharge: rate.fuelSurcharge || 5,
          volumeDiscount: rate.volumeDiscount || 0,
          promotionDiscount: rate.promotionDiscount || 0,
          totalBasePrice: rate.totalBasePrice || rate.retailPrice,
          weightRanges,
          currentWeightRange
        };
      });
      
      setRates(formattedRates);
      
      // Per ora continuiamo a usare suggerimenti simulati
      const newSuggestions = generateMockSuggestions(activeTab, filters);
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Errore durante il caricamento delle tariffe:', error);
      // In caso di errore, mostriamo tariffe simulate
      const newRates = generateMockRates(activeTab, filters);
      setRates(newRates);
      
      const newSuggestions = generateMockSuggestions(activeTab, filters);
      setSuggestions(newSuggestions);
    } finally {
      setLoading(false);
    }
  }, [activeTab, filters, generateMockRates, generateMockSuggestions, carriers.length, services.length]);

  useEffect(() => {
    loadRates()
  }, [loadRates])

  // Handle filter change
  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Open rate detail
  const handleOpenDetail = (rate: any) => {
    setSelectedRate(rate)
    setDetailOpen(true)
  }

  // Handle row selection
  const handleRowSelect = (id: string, checked: boolean) => {
    setSelectedRows((prev) => ({
      ...prev,
      [id]: checked,
    }))
  }

  // Handle select all rows
  const handleSelectAllRows = (checked: boolean) => {
    if (checked) {
      const newSelectedRows: Record<string, boolean> = {}
      displayedRates.forEach((rate) => {
        newSelectedRows[rate.id] = true
      })
      setSelectedRows(newSelectedRows)
    } else {
      setSelectedRows({})
    }
  }

  // Toggle column visibility
  const toggleColumnVisibility = (columnId: string, isVisible: boolean) => {
    setVisibleColumns((prev) => prev.map((col) => (col.id === columnId ? { ...col, isVisible } : col)))
  }

  // Calculate pagination
  const totalPages = Math.ceil(rates.length / rowsPerPage)
  const displayedRates = rates.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  // Check if all displayed rows are selected
  const areAllRowsSelected = displayedRates.length > 0 && displayedRates.every((rate) => selectedRows[rate.id])

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">SendQuote - Shipping Rate Comparison</CardTitle>
            <CardDescription>Compare carrier rates and get personalized suggestions</CardDescription>
          </div>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Filters Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center mb-4">
              <Filter className="mr-2 h-5 w-5" />
              <h3 className="font-medium">Filters</h3>
            </div>

            <Separator className="mb-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label htmlFor="carrier" className="text-sm font-medium">
                  Carrier
                </label>
                <Select value={filters.carrierId} onValueChange={(value) => handleFilterChange("carrierId", value)}>
                  <SelectTrigger id="carrier">
                    <SelectValue placeholder="All carriers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tutti i corrieri</SelectItem>
                    {carriers.map((carrier) => (
                      <SelectItem key={carrier._id} value={carrier._id}>
                        {carrier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="service" className="text-sm font-medium">
                  Service Type
                </label>
                <Select value={filters.serviceType} onValueChange={(value) => handleFilterChange("serviceType", value)}>
                  <SelectTrigger id="service">
                    <SelectValue placeholder="Tutti i servizi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tutti i servizi</SelectItem>
                    {services.map((service) => (
                      <SelectItem key={service._id} value={service._id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Country filter - only show for EU and Extra EU tabs */}
              {(activeTab === "eu" || activeTab === "extra_eu") && (
                <div className="space-y-2">
                  <label htmlFor="country" className="text-sm font-medium">
                    Country
                  </label>
                  <Select value={filters.country} onValueChange={(value) => handleFilterChange("country", value)}>
                    <SelectTrigger id="country">
                      <SelectValue placeholder="All countries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All countries</SelectItem>
                      {getCountryList().map((country) => (
                        <SelectItem key={country.id} value={country.id}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="weight" className="text-sm font-medium">
                  Weight (kg)
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="weight"
                    type="number"
                    value={filters.weight}
                    onChange={(e) => handleFilterChange("weight", e.target.value)}
                    min="0.1"
                    step="0.1"
                  />
                  <span className="text-sm text-muted-foreground">kg</span>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="volume" className="text-sm font-medium">
                  Monthly Volume
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="volume"
                    type="number"
                    value={filters.volume}
                    onChange={(e) => handleFilterChange("volume", e.target.value)}
                    min="1"
                  />
                  <span className="text-sm text-muted-foreground">pcs</span>
                </div>
              </div>

              <div className="flex items-end">
                <Button className="w-full" onClick={loadRates}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Destination Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="national">National</TabsTrigger>
            <TabsTrigger value="eu">European Union</TabsTrigger>
            <TabsTrigger value="extra_eu">Extra EU</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : rates.length === 0 ? (
              <Alert>
                <AlertTitle>No rates found</AlertTitle>
                <AlertDescription>No shipping rates match your current filter criteria.</AlertDescription>
              </Alert>
            ) : (
              <div className="rounded-md border">
                <div className="flex justify-end p-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setColumnsDialogOpen(true)}
                    className="flex items-center gap-1"
                  >
                    <Columns className="h-4 w-4" />
                    <span>Columns</span>
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={areAllRowsSelected}
                          onCheckedChange={handleSelectAllRows}
                          aria-label="Select all rows"
                        />
                      </TableHead>
                      <TableHead className="w-[30px]"></TableHead>
                      {visibleColumns.find((col) => col.id === "carrier")?.isVisible && <TableHead>Carrier</TableHead>}
                      {visibleColumns.find((col) => col.id === "service")?.isVisible && <TableHead>Service</TableHead>}
                      {(activeTab === "eu" || activeTab === "extra_eu") &&
                        visibleColumns.find((col) => col.id === "country")?.isVisible && <TableHead>Country</TableHead>}
                      {visibleColumns.find((col) => col.id === "baseRate")?.isVisible && (
                        <TableHead className="text-right">Base Rate</TableHead>
                      )}
                      {visibleColumns.find((col) => col.id === "discount")?.isVisible && (
                        <TableHead className="text-right">Discount (%)</TableHead>
                      )}
                      {visibleColumns.find((col) => col.id === "finalPrice")?.isVisible && (
                        <TableHead className="text-right">Final Price</TableHead>
                      )}
                      {visibleColumns.find((col) => col.id === "margin")?.isVisible && (
                        <TableHead className="text-center">Margin</TableHead>
                      )}
                      {visibleColumns.find((col) => col.id === "delivery")?.isVisible && (
                        <TableHead className="text-center">Delivery</TableHead>
                      )}
                      {visibleColumns.find((col) => col.id === "details")?.isVisible && (
                        <TableHead className="text-center">Details</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedRates.map((rate, index) => (
                      <>
                        <TableRow
                          key={rate.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleRowExpansion(rate.id)}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={!!selectedRows[rate.id]}
                              onCheckedChange={(checked) => handleRowSelect(rate.id, !!checked)}
                              aria-label={`Select row ${index + 1}`}
                            />
                          </TableCell>
                          <TableCell>
                            <ChevronRight
                              className={`h-4 w-4 transition-transform ${expandedRows[rate.id] ? "rotate-90" : ""}`}
                            />
                          </TableCell>
                          {visibleColumns.find((col) => col.id === "carrier")?.isVisible && (
                            <TableCell>{rate.carrierName}</TableCell>
                          )}
                          {visibleColumns.find((col) => col.id === "service")?.isVisible && (
                            <TableCell>{rate.serviceName}</TableCell>
                          )}
                          {(activeTab === "eu" || activeTab === "extra_eu") &&
                            visibleColumns.find((col) => col.id === "country")?.isVisible && (
                              <TableCell>{rate.countryName}</TableCell>
                            )}
                          {visibleColumns.find((col) => col.id === "baseRate")?.isVisible && (
                            <TableCell className="text-right">{formatCurrency(rate.basePrice)}</TableCell>
                          )}
                          {visibleColumns.find((col) => col.id === "discount")?.isVisible && (
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end">
                                <Input
                                  type="number"
                                  value={rate.userDiscount || 0}
                                  onChange={(e) => {
                                    e.stopPropagation()
                                    const value = Number.parseInt(e.target.value, 10)
                                    if (!isNaN(value)) {
                                      updateUserDiscount(rate.id, value)
                                    }
                                  }}
                                  className="h-8 w-16 text-right"
                                  min="0"
                                  max="90"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <span className="ml-1">%</span>
                              </div>
                            </TableCell>
                          )}
                          {visibleColumns.find((col) => col.id === "finalPrice")?.isVisible && (
                            <TableCell className="text-right font-medium">{formatCurrency(rate.finalPrice)}</TableCell>
                          )}
                          {visibleColumns.find((col) => col.id === "margin")?.isVisible && (
                            <TableCell className="text-center">
                              <Badge
                                variant={getMarginColor(
                                  rate.actualMargin - rate.actualMargin * ((rate.userDiscount || 0) / 100),
                                )}
                              >
                                {formatCurrency(
                                  rate.actualMargin - rate.actualMargin * ((rate.userDiscount || 0) / 100),
                                )}{" "}
                                (
                                {getMarginLabel(
                                  rate.actualMargin - rate.actualMargin * ((rate.userDiscount || 0) / 100),
                                )}
                                )
                              </Badge>
                            </TableCell>
                          )}
                          {visibleColumns.find((col) => col.id === "delivery")?.isVisible && (
                            <TableCell className="text-center">
                              {rate.deliveryTimeMin === rate.deliveryTimeMax
                                ? `${rate.deliveryTimeMin}h`
                                : `${rate.deliveryTimeMin}-${rate.deliveryTimeMax}h`}
                            </TableCell>
                          )}
                          {visibleColumns.find((col) => col.id === "details")?.isVisible && (
                            <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleOpenDetail(rate)
                                }}
                              >
                                <Info className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>

                        {/* Expanded weight ranges */}
                        {expandedRows[rate.id] && (
                          <TableRow className="bg-muted/30">
                            <TableCell colSpan={12} className="p-0">
                              <div className="p-4">
                                <h4 className="text-sm font-medium mb-2">Weight Ranges</h4>
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-muted/50">
                                      <TableHead className="text-xs">Weight Range</TableHead>
                                      <TableHead className="text-xs text-right">Base Rate</TableHead>
                                      <TableHead className="text-xs text-right">Discount</TableHead>
                                      <TableHead className="text-xs text-right">Final Price</TableHead>
                                      <TableHead className="text-xs text-center">Margin</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {rate.weightRanges.map((weightRange: any) => (
                                      <TableRow key={weightRange.rangeId} className="text-sm">
                                        <TableCell className="font-medium py-2">
                                          {weightRange.weightRange.label}
                                        </TableCell>
                                        <TableCell className="text-right py-2">
                                          {formatCurrency(weightRange.basePrice)}
                                        </TableCell>
                                        <TableCell className="text-right py-2">
                                          {rate.userDiscount > 0 ? (
                                            <Badge
                                              variant="secondary"
                                              className="bg-primary/20 text-primary hover:bg-primary/30"
                                            >
                                              -{rate.userDiscount}%
                                            </Badge>
                                          ) : (
                                            "-"
                                          )}
                                        </TableCell>
                                        <TableCell className="text-right py-2 font-medium">
                                          {formatCurrency(
                                            weightRange.finalPrice -
                                              weightRange.actualMargin * ((rate.userDiscount || 0) / 100),
                                          )}
                                        </TableCell>
                                        <TableCell className="text-center py-2">
                                          <Badge
                                            variant={getMarginColor(
                                              weightRange.actualMargin -
                                                weightRange.actualMargin * ((rate.userDiscount || 0) / 100),
                                            )}
                                          >
                                            {formatCurrency(
                                              weightRange.actualMargin -
                                                weightRange.actualMargin * ((rate.userDiscount || 0) / 100),
                                            )}{" "}
                                            (
                                            {getMarginLabel(
                                              weightRange.actualMargin -
                                                weightRange.actualMargin * ((rate.userDiscount || 0) / 100),
                                            )}
                                            )
                                          </Badge>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {rates.length > rowsPerPage && (
              <div className="flex justify-center mt-4">
                <Pagination>
                  <UPaginationContent>
                    <UPaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </UPaginationItem>

                    {Array.from({ length: totalPages }).map((_, i) => (
                      <UPaginationItem key={i}>
                        <PaginationLink isActive={currentPage === i + 1} onClick={() => setCurrentPage(i + 1)}>
                          {i + 1}
                        </PaginationLink>
                      </UPaginationItem>
                    ))}

                    <UPaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </UPaginationItem>
                  </UPaginationContent>
                </Pagination>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-between space-x-2">
          <div>
            {Object.values(selectedRows).some(Boolean) && (
              <Button variant="outline">{Object.values(selectedRows).filter(Boolean).length} rows selected</Button>
            )}
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardContent>

      {/* Rate Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                Rate Details: {selectedRate?.carrierName} - {selectedRate?.serviceName}
              </span>
              <Button variant="ghost" size="icon" onClick={() => setDetailOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          {selectedRate && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Basic Information</h4>
                <Separator className="mb-3" />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Carrier:</span>
                    <span className="text-sm font-medium">{selectedRate.carrierName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Service:</span>
                    <span className="text-sm font-medium">{selectedRate.serviceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Weight Range:</span>
                    <span className="text-sm font-medium">{selectedRate.currentWeightRange.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Destination:</span>
                    <span className="text-sm font-medium">
                      {selectedRate.destinationType === "national"
                        ? "National"
                        : selectedRate.destinationType === "eu"
                          ? "European Union"
                          : "Extra EU"}
                    </span>
                  </div>
                  {(selectedRate.destinationType === "eu" || selectedRate.destinationType === "extra_eu") && (
                    <div className="flex justify-between">
                      <span className="text-sm">Country:</span>
                      <span className="text-sm font-medium">{selectedRate.countryName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm">Delivery Time:</span>
                    <span className="text-sm font-medium">
                      {selectedRate.deliveryTimeMin === selectedRate.deliveryTimeMax
                        ? `${selectedRate.deliveryTimeMin} hours`
                        : `${selectedRate.deliveryTimeMin}-${selectedRate.deliveryTimeMax} hours`}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Price Details</h4>
                <Separator className="mb-3" />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Base Rate:</span>
                    <span className="text-sm font-medium">{formatCurrency(selectedRate.basePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Fuel Surcharge ({selectedRate.fuelSurcharge}%):</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(selectedRate.basePrice * (selectedRate.fuelSurcharge / 100))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Base Price:</span>
                    <span className="text-sm font-medium">{formatCurrency(selectedRate.totalBasePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Volume Discount ({selectedRate.volumeDiscount}%):</span>
                    <span className="text-sm font-medium text-primary">
                      -{formatCurrency(selectedRate.totalBasePrice * (selectedRate.volumeDiscount / 100))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Promotion Discount ({selectedRate.promotionDiscount}%):</span>
                    <span className="text-sm font-medium text-primary">
                      -{formatCurrency(selectedRate.totalBasePrice * (selectedRate.promotionDiscount / 100))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">User Discount ({selectedRate.userDiscount || 0}%):</span>
                    <span className="text-sm font-medium text-primary">
                      -{formatCurrency(selectedRate.actualMargin * ((selectedRate.userDiscount || 0) / 100))}
                    </span>
                  </div>

                  <Separator className="my-2" />

                  <div className="flex justify-between">
                    <span className="font-medium">Final Price:</span>
                    <span className="font-medium">{formatCurrency(selectedRate.finalPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Margin:</span>
                    <Badge
                      variant={getMarginColor(
                        selectedRate.actualMargin -
                          selectedRate.actualMargin * ((selectedRate.userDiscount || 0) / 100),
                      )}
                    >
                      {formatCurrency(
                        selectedRate.actualMargin -
                          selectedRate.actualMargin * ((selectedRate.userDiscount || 0) / 100),
                      )}{" "}
                      (
                      {getMarginLabel(
                        selectedRate.actualMargin -
                          selectedRate.actualMargin * ((selectedRate.userDiscount || 0) / 100),
                      )}
                      )
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Suggestions Dialog */}
      <Dialog open={suggestionsOpen} onOpenChange={setSuggestionsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Lightbulb className="mr-2 h-5 w-5 text-primary" />
              AI Suggestions to Optimize Your Rates
            </DialogTitle>
            <DialogDescription>
              Smart recommendations based on your shipping patterns and carrier rates
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 p-1">
              {suggestions.length === 0 ? (
                <Alert>
                  <AlertTitle>No suggestions available</AlertTitle>
                  <AlertDescription>No suggestions are available for your current filter criteria.</AlertDescription>
                </Alert>
              ) : (
                suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      suggestion.type === "margin_warning"
                        ? "border-l-destructive bg-destructive/10"
                        : suggestion.type === "active_promotion"
                          ? "border-l-success bg-success/10"
                          : "border-l-primary bg-primary/10"
                    }`}
                  >
                    <h4 className="font-medium mb-1">
                      {suggestion.type === "margin_warning"
                        ? "Margin Warning"
                        : suggestion.type === "active_promotion"
                          ? "Active Promotion"
                          : "Volume Opportunity"}
                    </h4>
                    <p className="text-sm">{suggestion.message}</p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSuggestionsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Column Customization Dialog */}
      <Dialog open={columnsDialogOpen} onOpenChange={setColumnsDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Columns className="mr-2 h-5 w-5" />
              Customize Columns
            </DialogTitle>
            <DialogDescription>Select which columns to display in the table</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {visibleColumns.map((column) => (
              <div key={column.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`column-${column.id}`}
                  checked={column.isVisible}
                  onCheckedChange={(checked) => toggleColumnVisibility(column.id, !!checked)}
                  disabled={column.id === "carrier"} // Make carrier column always visible
                />
                <label
                  htmlFor={`column-${column.id}`}
                  className={`text-sm font-medium ${column.id === "carrier" ? "opacity-50" : ""}`}
                >
                  {column.name}
                  {column.id === "carrier" && " (required)"}
                </label>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setColumnsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

