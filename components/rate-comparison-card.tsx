"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
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
import { Filter, RefreshCw, Download, Lightbulb, Info, MoreVertical, X, Columns, ChevronRight, ChevronUp, ChevronDown, ShoppingCart, AlertTriangle } from "lucide-react"
import {
  Pagination,
  PaginationContent as UPaginationContent,
  PaginationItem as UPaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination"
import * as api from "@/services/api"
import { v4 as uuidv4 } from "uuid"
import { RateMarginIndicator } from "./rate-margin-indicator"
import { useCart, showCartNotification } from "@/hooks/use-cart"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import Image from 'next/image'
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  calculateBasePrice,
  calculateDiscountAmount,
  calculateFuelSurchargeMargin,
  calculateTotalMargin,
  calculateFinalPrice,
  formatCurrency,
  getMarginColor,
  getMarginLabel
} from "@/utils/price-calculations";
import RateTableRow from './rate-table-row';
import RateFilters from './rate-filters'; // Aggiungi l'import del nuovo componente

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

// Modifica alle colonne visibili - rimuovi details e aggiungi totalMargin
const DEFAULT_VISIBLE_COLUMNS = [
  { id: "select", name: "Select", isVisible: true },
  { id: "carrier", name: "Carrier", isVisible: true },
  { id: "service", name: "Service", isVisible: true },
  { id: "country", name: "Country", isVisible: true },
  { id: "weightRange", name: "Weight Range", isVisible: true },
  { id: "baseRate", name: "Base Rate", isVisible: true },
  { id: "discount", name: "Discount", isVisible: true },
  { id: "finalPrice", name: "Final Price", isVisible: true },
  { id: "margin", name: "Margin", isVisible: true },
  { id: "totalMargin", name: "Total Margin", isVisible: true },
  { id: "delivery", name: "Delivery", isVisible: false },
]

// Definizione delle interfacce per i tipi
interface WeightRange {
  id: string
  label: string
  min: number
  max: number
  basePrice: number
  userDiscount: number
  finalPrice: number
  actualMargin: number
  adjustedMargin?: number
  volumeDiscount: number
  promotionDiscount: number
  displayBasePrice?: number // Aggiungi questa proprietà
}

interface Rate {
  id: string;
  carrierId: string;
  carrierName: string;
  carrierLogo: string;
  serviceCode: string;
  serviceName: string;
  serviceDescription: string;
  countryName: string;
  basePrice: number;
  userDiscount: number;
  finalPrice: number;
  actualMargin: number;
  marginPercentage: number;
  adjustedMargin?: number;
  deliveryTimeMin?: number;
  deliveryTimeMax?: number;
  fuelSurcharge: number;
  volumeDiscount: number;
  promotionDiscount: number;
  totalBasePrice: number;
  weightRanges: WeightRange[];
  currentWeightRange?: WeightRange;
  retailPrice?: number;
  purchasePrice?: number;
  margin?: number;
  weightMin?: number;
  weightMax?: number;
  displayBasePrice?: number;
  service?: {
    _id?: string;
    name?: string;
  };
  isWeightRange?: boolean;
  parentRateId?: string;
}

// Aggiungi questa lista dopo le altre liste di costanti
const MARKETS = [
  { id: "it", name: "Italy" },
  { id: "fr", name: "France" },
  { id: "de", name: "Germany" },
  { id: "es", name: "Spain" },
  { id: "uk", name: "United Kingdom" },
  { id: "us", name: "United States" },
  { id: "nl", name: "Netherlands" },
  { id: "be", name: "Belgio" },
  { id: "ch", name: "Svizzera" },
  { id: "at", name: "Austria" },
]

// Componente UI per il caricamento con stato dettagliato
const LoadingIndicator = ({ stage }: { stage?: string }) => (
  <div className="flex flex-col items-center justify-center py-8 space-y-4">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    <div className="text-center">
      <p className="text-sm text-muted-foreground">Caricamento tariffe in corso...</p>
      {stage && <p className="text-xs text-muted-foreground mt-1">{stage}</p>}
    </div>
  </div>
);

// Componente per gestire gli errori
const ErrorDisplay = ({ message, onRetry }: { message: string, onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center py-8 space-y-4">
    <AlertTriangle className="h-12 w-12 text-destructive" />
    <p className="text-center text-destructive">{message}</p>
    <Button variant="outline" onClick={onRetry}>
      Riprova
    </Button>
  </div>
);

export default function RateComparisonCard() {
  // States
  const [activeTab, setActiveTab] = useState("national")
  const [loading, setLoading] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedRate, setSelectedRate] = useState<any>(null)
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [rates, setRates] = useState<Rate[]>([])
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [carriers, setCarriers] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const rowsPerPage = 5

  // Add state for selected rows
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({})

  // Add state for column customization
  const [columnsDialogOpen, setColumnsDialogOpen] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_VISIBLE_COLUMNS)

  // Update the filters state to include sourceCountry (market)
  const [filters, setFilters] = useState({
    sourceCountry: "", // Aggiungi questo campo per il market
    carrierId: "",
    service: "",
    weight: "1",
    volume: "100",
    country: "",
    maxPrice: "",
  })

  // Stato per memorizzare le fasce di peso complete per servizio
  const [serviceWeightRanges, setServiceWeightRanges] = useState<{ [serviceId: string]: WeightRange[] }>({});

  // Aggiungi uno stato per tenere traccia delle righe espanse
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})

  // Aggiungi uno stato per tracciare l'inclusione del fuel surcharge
  const [includeFuelSurcharge, setIncludeFuelSurcharge] = useState(true);

  // Stato per l'ordinamento
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: 'ascending' | 'descending' | null;
  }>({
    key: null,
    direction: null
  });

  const router = useRouter()
  const { addToCart, isInCart, cartItems } = useCart()
  const { toast } = useToast()
  const [error, setError] = useState<string | null>(null)

  // Aggiunto uno stato per tracciare lo stato di caricamento
  const [loadingStage, setLoadingStage] = useState<string>("");

  // Correggiamo il problema della dichiarazione di generateSimulatedWeightRanges
  // spostando la sua definizione prima che venga utilizzata
  // Funzione per generare fasce di peso simulate
  const generateSimulatedWeightRanges = (serviceId: string): WeightRange[] => {
    // Trova il servizio corrispondente per ottenere il fuel surcharge
    const serviceRate = rates.find(rate => rate.service?._id === serviceId);
    const fuelSurchargePercentage = serviceRate?.fuelSurcharge || 0;
    
    // Usa le stesse fasce di peso definite in WEIGHT_RANGES
    return WEIGHT_RANGES.map(range => {
      // Base price increases with weight
      const basePrice = 5 + Math.random() * 20 + range.max * 0.5;
      const margin = basePrice * (Math.random() * 0.35); // Random margin up to 35% of base price
      
      // Calcola il prezzo finale considerando il fuel surcharge quando il toggle è attivo
      let finalPrice = basePrice;
      let displayBasePrice = basePrice;
      
      if (includeFuelSurcharge && fuelSurchargePercentage > 0) {
        // Applica il fuel surcharge al prezzo base
        finalPrice = basePrice * (1 + (fuelSurchargePercentage / 100));
        displayBasePrice = finalPrice;
      }
      
      return {
        id: `${serviceId}-${range.min}-${range.max}`,
        label: range.label,
        min: range.min,
        max: range.max,
        basePrice: basePrice,
        userDiscount: 0,
        finalPrice: finalPrice,
        actualMargin: margin,
        volumeDiscount: Math.round(Math.random() * 15),
        promotionDiscount: Math.round(Math.random() * 10),
        displayBasePrice: displayBasePrice
      };
    });
  };

  // Ora definiamo loadServiceWeightRanges dopo generateSimulatedWeightRanges
  const loadServiceWeightRanges = useCallback(async (serviceId: string) => {
    if (!serviceId) {
      console.error('ERRORE: ServiceID mancante, impossibile caricare le fasce di peso');
      return;
    }
    
    // Verifichiamo se abbiamo già caricato le fasce di peso per questo servizio
    if (serviceWeightRanges[serviceId]) {
      console.log(`Fasce di peso già caricate per il servizio ${serviceId}`);
      return serviceWeightRanges[serviceId]; // Ritorna il valore esistente
    }
    
    try {
      console.log(`Richiesta fasce di peso per il servizio: ${serviceId}`);
      setServiceWeightRanges(prev => ({
        ...prev,
        [serviceId]: [] // Imposta un array vuoto mentre carica
      }));

      const weightRangesData = await api.getWeightRangesByService(serviceId);
      
      if (Array.isArray(weightRangesData) && weightRangesData.length > 0) {
        // Trova la tariffa corrispondente per ottenere il fuel surcharge
        const correspondingRate = rates.find(rate => rate.service?._id === serviceId);
        const fuelSurchargePercentage = correspondingRate?.fuelSurcharge || 0;
        
        const processedWeightRanges = weightRangesData.map((weightRange: WeightRange) => {
          const basePrice = weightRange.basePrice;
          const displayBasePrice = calculateBasePrice(basePrice, fuelSurchargePercentage, includeFuelSurcharge);
          const finalPrice = calculateFinalPrice(
            basePrice, 
            weightRange.actualMargin, 
            weightRange.userDiscount || 0, 
            fuelSurchargePercentage, 
            includeFuelSurcharge
          );
          
          return {
            ...weightRange,
            finalPrice,
            displayBasePrice
          };
        });
        
        setServiceWeightRanges(prev => ({
          ...prev,
          [serviceId]: processedWeightRanges
        }));
        
        return processedWeightRanges;
      } else {
        console.warn(`Nessuna fascia di peso trovata per il servizio ${serviceId}, generando fasce simulate`);
        const simulatedWeightRanges = generateSimulatedWeightRanges(serviceId);
        
        setServiceWeightRanges(prev => ({
          ...prev,
          [serviceId]: simulatedWeightRanges
        }));
        
        return simulatedWeightRanges;
      }
    } catch (error) {
      console.error('Errore nel caricamento delle fasce di peso:', error);
      const simulatedWeightRanges = generateSimulatedWeightRanges(serviceId);
      
      setServiceWeightRanges(prev => ({
        ...prev,
        [serviceId]: simulatedWeightRanges
      }));
      
      return simulatedWeightRanges;
    }
  }, [serviceWeightRanges, rates, includeFuelSurcharge, generateSimulatedWeightRanges]);

  // Update the generateMockRates function to include sourceCountry filter
  const generateMockRates = useCallback((destinationType: string, filters: any) => {
    const services = ["Standard", "Express", "Premium"]
    const mockRates = []

    // Get the appropriate country list based on destination type
    const countryList =
      destinationType === "eu" ? EU_COUNTRIES : destinationType === "extra_eu" ? EXTRA_EU_COUNTRIES : []

    for (let i = 0; i < CARRIERS.length; i++) {
      for (let j = 0; j < services.length; j++) {
        // Assegna un sourceCountry casuale a ogni servizio (simulando il database)
        // Se sourceCountry è specificato nei filtri, usa solo quello
        const serviceSourceCountry = MARKETS[Math.floor(Math.random() * MARKETS.length)].id;
        
        // Se è specificato un sourceCountry nei filtri, salta i servizi che non corrispondono
        if (filters.sourceCountry && serviceSourceCountry !== filters.sourceCountry.toLowerCase()) {
          continue;
        }
        
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
              weightMin: defaultRange.weightRange.min,
              weightMax: defaultRange.weightRange.max,
              displayBasePrice: defaultRange.basePrice, // Aggiungi questa proprietà
              service: {
                _id: serviceId, // Usa serviceId invece di service._id
                name: services[j] // Usa services[j] invece di service.name
              }
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
            weightMin: defaultRange.weightRange.min,
            weightMax: defaultRange.weightRange.max,
            displayBasePrice: defaultRange.basePrice, // Aggiungi questa proprietà
            service: {
              _id: serviceId, // Usa serviceId invece di service._id
              name: services[j] // Usa services[j] invece di service.name
            }
          })
        }
      }
    }

    // Apply filters
    let filteredRates = mockRates

    if (filters.carrierId && filters.carrierId !== "all") {
      filteredRates = filteredRates.filter((rate) => rate.carrierId === filters.carrierId)
    }

    if (filters.service && filters.service !== "all") {
      filteredRates = filteredRates.filter((rate) => rate.id === filters.service)
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
  }

  // Add a function to update the user discount
  const updateUserDiscount = (rateId: string, newDiscount: number) => {
    setRates((prevRates) =>
      prevRates.map((rate) => {
        if (rate.id === rateId) {
          // Ensure discount is between 0 and 90%
          const clampedDiscount = Math.max(0, Math.min(90, newDiscount));

          // Update the discount for all weight ranges
          const updatedWeightRanges = rate.weightRanges && rate.weightRanges.length > 0 
            ? rate.weightRanges.map((weightRange: WeightRange) => {
              // Calculate the discount amount - applica lo sconto sul margine
              const discountAmount = weightRange.actualMargin * (clampedDiscount / 100);
              
              // Calcola il prezzo finale considerando il fuel surcharge quando il toggle è attivo
              let finalPrice;
              if (includeFuelSurcharge && rate.fuelSurcharge > 0) {
                // Applica prima il fuel surcharge al prezzo base
                const baseWithFuel = weightRange.basePrice * (1 + (rate.fuelSurcharge / 100));
                // Poi sottrai lo sconto sul margine
                finalPrice = baseWithFuel - discountAmount;
              } else {
                // Senza fuel surcharge
                finalPrice = weightRange.basePrice - discountAmount;
              }

              return {
                ...weightRange,
                // Aggiorniamo solo userDiscount, non modifichiamo altri parametri di sconto
                userDiscount: clampedDiscount,
                // Recalculate final price considerando il fuel surcharge se attivo
                finalPrice: finalPrice,
                // Adjust the margin based on the discount
                adjustedMargin: weightRange.actualMargin - discountAmount,
              };
            })
            : [];

          // Calculate the discount amount for the main rate - applica lo sconto sul margine
          const discountAmount = rate.actualMargin * (clampedDiscount / 100);
          
          // Calcola il prezzo finale considerando il fuel surcharge quando il toggle è attivo
          let finalPrice;
          if (includeFuelSurcharge && rate.fuelSurcharge > 0) {
            // Applica prima il fuel surcharge al prezzo base
            const baseWithFuel = rate.basePrice * (1 + (rate.fuelSurcharge / 100));
            // Poi sottrai lo sconto sul margine
            finalPrice = baseWithFuel - discountAmount;
          } else {
            // Senza fuel surcharge
            finalPrice = rate.basePrice - discountAmount;
          }

          return {
            ...rate,
            userDiscount: clampedDiscount,
            // Recalculate final price considerando il fuel surcharge se attivo
            finalPrice: finalPrice,
            // Adjust the margin based on the discount
            adjustedMargin: rate.actualMargin - discountAmount,
            weightRanges: updatedWeightRanges,
          }
        }
        return rate
      }),
    )
  }

  // Load services when carrier filter changes
  useEffect(() => {
    const loadServices = async () => {
      try {
        // Se abbiamo selezionato un carrier specifico, carichiamo solo i suoi servizi
        if (filters.carrierId) {
          const servicesData = await api.getServices(filters.carrierId);
          setServices(servicesData);
        } else if (carriers.length > 0) {
          // Altrimenti carichiamo tutti i servizi disponibili
          const servicesData = await api.getServices();
          setServices(servicesData);
        }
      } catch (error) {
        console.error('Errore durante il caricamento dei servizi:', error);
        setServices([]);
      }
    };

    loadServices();
  }, [filters.carrierId, carriers.length]);

  // Correzione della funzione loadRates per gestire meglio gli errori e mostrare lo stato di caricamento
  const loadRates = useCallback(async () => {
    setLoading(true);
    setError(null); // Reset dello stato di errore
    setSelectedRows({}); // Reset selected rows when refreshing data

    try {
      // Carica i carriers se necessario
      if (carriers.length === 0) {
        setLoadingStage("Caricamento corrieri...");
        const carriersData = await api.getCarriers();
        setCarriers(carriersData);
      }

      // Carica i servizi se necessario
      if (services.length === 0) {
        setLoadingStage("Caricamento servizi...");
        const servicesData = await api.getServices(filters.carrierId || undefined);
        setServices(servicesData);
      }
      
      // Costruisci l'oggetto di filtri completo per l'API
      setLoadingStage("Caricamento tariffe...");
      const apiFilters = {
        weight: String(parseFloat(filters.weight)),
        destinationType: activeTab,
        destinationCountry: filters.country || undefined,
        carrierId: filters.carrierId || undefined,
        service: filters.service || undefined,
        volume: String(parseInt(filters.volume, 10)),
        sourceCountry: filters.sourceCountry || undefined,
        maxPrice: filters.maxPrice
      };
      
      // Ora passiamo tutti i filtri alla API, incluso maxPrice
      const ratesData = await api.compareRates(apiFilters);
      
      console.log(`Richiesta tariffe per tab ${activeTab} con paese ${filters.country || 'tutti'}. Risultati: ${ratesData.length}`);
      
      // Trasforma i dati dell'API nel formato atteso dal componente
      setLoadingStage("Elaborazione risultati...");
      const formattedRates = ratesData.map((rate: any) => {
        // Estrai i dati del servizio e del corriere con gestione null/undefined
        const service = rate.service || {};
        const carrier = rate.carrier || (service?.carrier || {});
        
        // Calcola i valori utilizzando le nuove funzioni di utility
        const basePrice = rate.retailPrice || 0;
        const purchasePrice = rate.purchasePrice || 0;
        const margin = rate.margin || (rate.retailPrice - rate.purchasePrice) || 0;
        const fuelSurchargePercentage = carrier.fuelSurcharge || 0;
        
        const displayBasePrice = calculateBasePrice(basePrice, fuelSurchargePercentage, includeFuelSurcharge);
        
        const finalPrice = calculateFinalPrice(
          basePrice,
          margin,
          rate.userDiscount || 0,
          fuelSurchargePercentage,
          includeFuelSurcharge
        );
        
        // Crea e ritorna l'oggetto Rate
        return {
          id: rate._id || uuidv4(),
          carrierId: carrier._id || '',
          carrierName: carrier.name || 'Unknown',
          carrierLogo: carrier.logoUrl || '',
          serviceCode: service.code || service.name || rate.serviceCode || 'Standard',
          serviceName: service.name || rate.serviceName || 'Standard',
          serviceDescription: service.description || rate.description || '',
          countryName: formatCountryList(service.destinationCountry),
          basePrice: basePrice,
          userDiscount: rate.userDiscount || 0,
          finalPrice: finalPrice,
          actualMargin: margin,
          marginPercentage: rate.marginPercentage || 0,
          deliveryTimeMin: service.deliveryTimeMin || rate.deliveryTimeMin,
          deliveryTimeMax: service.deliveryTimeMax || rate.deliveryTimeMax,
          fuelSurcharge: fuelSurchargePercentage,
          volumeDiscount: rate.volumeDiscount || 0,
          promotionDiscount: rate.promotionDiscount || 0,
          totalBasePrice: rate.totalBasePrice || rate.retailPrice || 0,
          weightRanges: [],
          currentWeightRange: null, // Inizializziamo come null
          retailPrice: basePrice,
          purchasePrice: purchasePrice,
          margin: margin,
          weightMin: rate.weightMin || 0,
          weightMax: rate.weightMax || 0,
          displayBasePrice: displayBasePrice,
          service: {
            _id: service._id || rate.service?._id || '',
            name: service.name || rate.serviceName || 'Standard'
          }
        };
      });
      
      setRates(formattedRates);
      
      // Per ora continuiamo a usare suggerimenti simulati
      const newSuggestions = generateMockSuggestions(activeTab, filters);
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Errore durante il caricamento delle tariffe:', error);
      setError(error instanceof Error ? error.message : "Si è verificato un errore sconosciuto");
      // In caso di errore, mostriamo tariffe simulate se siamo in modalità sviluppo
      if (process.env.NODE_ENV === 'development') {
        const newRates = generateMockRates(activeTab, filters);
        setRates(newRates as any);
        
        const newSuggestions = generateMockSuggestions(activeTab, filters);
        setSuggestions(newSuggestions);
      } else {
        // In produzione, meglio mostrare l'errore all'utente
        setRates([]);
        setSuggestions([]);
      }
    } finally {
      setLoading(false);
      setLoadingStage("");
    }
  }, [activeTab, filters, carriers.length, services.length, includeFuelSurcharge, generateMockRates, generateMockSuggestions]);

  useEffect(() => {
    loadRates()
  }, [loadRates])

  // Handle filter change
  const handleFilterChange = (name: string, value: string) => {
    // Convert 'all' to empty string for API compatibility
    let apiValue = value === 'all' ? '' : value; // Cambiato da const a let
    
    // Per sourceCountry, converti sempre in minuscolo per corrispondere al formato del database
    if (name === 'sourceCountry' && apiValue) {
      apiValue = apiValue.toLowerCase();
    }
    
    setFilters((prev) => ({
      ...prev,
      [name]: apiValue,
    }))
  }

  // Open rate detail
  const handleOpenDetail = (rate: any) => {
    setSelectedRate(rate)
    setDetailOpen(true)
  }

  // Handle row selection with child weight ranges
  const handleRowSelect = (id: string, checked: boolean, isWeightRange: boolean = false, parentId: string = "") => {
    setSelectedRows((prev) => {
      const newSelected = { ...prev };
      
      // Gestione della selezione della riga principale
      if (!isWeightRange) {
        // Aggiorna la riga principale
        newSelected[id] = checked;
        
        // Se è una riga principale, seleziona/deseleziona tutte le sue fasce di peso
        const serviceId = rates.find(r => r.id === id)?.service?._id;
        if (serviceId && serviceWeightRanges[serviceId]) {
          serviceWeightRanges[serviceId].forEach((weightRange) => {
            const weightRangeId = `${id}-${weightRange.id}`;
            newSelected[weightRangeId] = checked;
          });
        }
      } 
      // Gestione della selezione di una fascia di peso
      else {
        // Aggiorna solo la fascia di peso specifica
        newSelected[id] = checked;
        
        // Controlla se tutte le fasce di peso sono selezionate o deselezionate
        // per aggiornare lo stato della riga principale
        const serviceId = rates.find(r => r.id === parentId)?.service?._id;
        if (serviceId && serviceWeightRanges[serviceId]) {
          const allWeightRangeIds = serviceWeightRanges[serviceId].map(wr => `${parentId}-${wr.id}`);
          const allSelected = allWeightRangeIds.every(wrId => newSelected[wrId]);
          const noneSelected = allWeightRangeIds.every(wrId => !newSelected[wrId]);
          
          // Aggiorna la riga principale in base allo stato delle fasce di peso
          if (allSelected) {
            newSelected[parentId] = true;
          } else if (noneSelected) {
            newSelected[parentId] = false;
          }
          // Se sono selezionate solo alcune fasce, lasciamo lo stato della riga principale invariato
        }
      }
      
      return newSelected;
    });
  };

  // Handle select all rows (update to include weight ranges)
  const handleSelectAllRows = (checked: boolean) => {
    if (checked) {
      const newSelectedRows: Record<string, boolean> = {};
      
      // Seleziona tutte le righe principali visualizzate
      displayedRates.forEach((rate) => {
        newSelectedRows[rate.id] = true;
        
        // Seleziona anche tutte le fasce di peso per ogni riga
        const serviceId = rate.service?._id;
        if (serviceId && serviceWeightRanges[serviceId]) {
          serviceWeightRanges[serviceId].forEach((weightRange) => {
            const weightRangeId = `${rate.id}-${weightRange.id}`;
            newSelectedRows[weightRangeId] = true;
          });
        }
      });
      
      setSelectedRows(newSelectedRows);
    } else {
      setSelectedRows({});
    }
  };

  // Toggle column visibility
  const toggleColumnVisibility = (columnId: string, isVisible: boolean) => {
    setVisibleColumns((prev) => prev.map((col) => (col.id === columnId ? { ...col, isVisible } : col)))
  }

  // Calculate pagination
  const totalPages = Math.ceil(rates.length / rowsPerPage)
  const displayedRates = rates.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  // Check if all displayed rows are selected
  const areAllRowsSelected = displayedRates.length > 0 && displayedRates.every((rate) => selectedRows[rate.id])

  // Funzione per gestire l'espansione/collasso di una riga
  const toggleRowExpansion = useCallback(async (serviceId: string) => {
    setExpandedRows(prev => {
      const newState = { ...prev };
      
      // Se la riga non è già espansa, carica le fasce di peso
      if (!newState[serviceId]) {
        // Carica le fasce di peso per questo servizio se non sono già caricate
        loadServiceWeightRanges(serviceId);
      }
      
      // Inverti lo stato di espansione
      newState[serviceId] = !newState[serviceId];
      return newState;
    });
  }, [loadServiceWeightRanges]);

  // Trova e sostituisci la funzione handleDiscountChange attuale con questa versione ottimizzata
  const handleDiscountChange = useCallback((rateId: string, serviceId: string, newDiscount: number) => {
    // Limita lo sconto tra 0 e 90%
    const clampedDiscount = Math.max(0, Math.min(90, newDiscount));
    
    setRates(prevRates => prevRates.map(rate => {
      if (rate.id === rateId) {
        // Calcola il nuovo prezzo finale
        const finalPrice = calculateFinalPrice(
          rate.basePrice,
          rate.actualMargin,
          clampedDiscount,
          rate.fuelSurcharge,
          includeFuelSurcharge
        );
        
        // Calcola il margine finale dopo lo sconto
        const discountAmount = calculateDiscountAmount(rate.actualMargin, clampedDiscount);
        const adjustedMargin = rate.actualMargin - discountAmount;
        
        // Crea una versione aggiornata della tariffa
        const updatedRate = {
          ...rate,
          userDiscount: clampedDiscount,
          finalPrice,
          adjustedMargin
        };
        
        // Se ci sono fasce di peso, aggiornale
        if (serviceId && serviceWeightRanges[serviceId]) {
          updatedRate.weightRanges = serviceWeightRanges[serviceId].map(weightRange => {
            const weightRangeFinalPrice = calculateFinalPrice(
              weightRange.basePrice,
              weightRange.actualMargin,
              clampedDiscount,
              rate.fuelSurcharge,
              includeFuelSurcharge
            );
            
            const weightRangeDiscountAmount = calculateDiscountAmount(weightRange.actualMargin, clampedDiscount);
            
            return {
              ...weightRange,
              userDiscount: clampedDiscount,
              finalPrice: weightRangeFinalPrice,
              adjustedMargin: weightRange.actualMargin - weightRangeDiscountAmount
            };
          });
        }
        
        return updatedRate;
      }
      return rate;
    }));
  }, [serviceWeightRanges, includeFuelSurcharge]);

  // Aggiungi questa funzione di utilità direttamente nel componente
  const formatCurrency = (value: number | undefined): string => {
    if (value === undefined || isNaN(value)) {
      return "€0,00";
    }
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Nella funzione loadRates, dopo il caricamento delle tariffe originali
  // aggiungi questo codice per calcolare automaticamente gli sconti necessari
  const applyMaxPriceFilter = (rates: Rate[]): Rate[] => {
    if (!filters.maxPrice || parseFloat(filters.maxPrice) <= 0) {
      return rates; // Se non è specificato un prezzo massimo, restituisci tutte le tariffe
    }
    
    const maxPrice = parseFloat(filters.maxPrice);
    
    // Prima filtriamo le tariffe che possono potenzialmente raggiungere il prezzo massimo
    // anche con lo sconto massimo (90% del margine)
    const filteredRates = rates.filter(rate => {
      // Determina il prezzo base VISUALIZZATO (NON lo modifichiamo MAI)
      const displayedBasePrice = rate.displayBasePrice || rate.basePrice;
      
      // Determina il prezzo minimo raggiungibile applicando lo sconto massimo (90%)
      const maxDiscountAmount = rate.actualMargin * 0.9; // 90% del margine
      const lowestPossiblePrice = displayedBasePrice - maxDiscountAmount;
      
      // Mantieni solo le tariffe che possono raggiungere il prezzo massimo richiesto
      return lowestPossiblePrice <= maxPrice;
    });
    
    // Ora per ciascuna tariffa filtrata, calcoliamo lo sconto necessario
    return filteredRates.map(rate => {
      // Preserva sempre il prezzo base originale e il prezzo base visualizzato
      const originalBasePrice = rate.basePrice;
      const displayedBasePrice = rate.displayBasePrice || rate.basePrice;
      
      // Se il prezzo finale attuale è già inferiore al prezzo massimo, mantieni lo sconto attuale
      const currentDiscount = rate.userDiscount || 0;
      const currentDiscountAmount = rate.actualMargin * (currentDiscount / 100);
      const currentFinalPrice = displayedBasePrice - currentDiscountAmount;
      
      if (currentFinalPrice <= maxPrice) {
        return rate; // Mantieni lo sconto attuale
      }
      
      // Calcola lo sconto necessario per raggiungere il prezzo massimo
      // Formula: displayedBasePrice - (marginAmount * discountPercentage/100) = maxPrice
      // Quindi: discountPercentage = ((displayedBasePrice - maxPrice) / marginAmount) * 100
      const priceDifference = displayedBasePrice - maxPrice;
      const requiredDiscountPercentage = Math.min(90, Math.max(0, 
        Math.round((priceDifference / rate.actualMargin) * 100 * 100) / 100
      ));
      
      // Calcola il prezzo finale con il nuovo sconto
      const newDiscountAmount = rate.actualMargin * (requiredDiscountPercentage / 100);
      const finalPrice = displayedBasePrice - newDiscountAmount;
      
      // Aggiorna SOLO lo sconto e i valori correlati, preservando il prezzo base originale e quello visualizzato
      const discountedRate = {
        ...rate,
        basePrice: originalBasePrice, // Mantieni il prezzo base originale
        displayBasePrice: displayedBasePrice, // Mantieni il prezzo base visualizzato
        userDiscount: requiredDiscountPercentage,
        finalPrice: finalPrice,
        adjustedMargin: rate.actualMargin - newDiscountAmount
      };
      
      // Aggiorna anche tutte le fasce di peso con la stessa logica
      if (discountedRate.weightRanges && discountedRate.weightRanges.length > 0) {
        discountedRate.weightRanges = rate.weightRanges.map(weightRange => {
          // Preserva il prezzo base originale e quello visualizzato della fascia di peso
          const weightOriginalBasePrice = weightRange.basePrice;
          const weightDisplayedBasePrice = weightRange.displayBasePrice || weightRange.basePrice;
          
          // Verifica se il prezzo attuale è già sotto il massimo
          const weightCurrentDiscount = weightRange.userDiscount || currentDiscount;
          const weightCurrentDiscountAmount = weightRange.actualMargin * (weightCurrentDiscount / 100);
          const weightCurrentFinalPrice = weightDisplayedBasePrice - weightCurrentDiscountAmount;
          
          if (weightCurrentFinalPrice <= maxPrice) {
            return weightRange; // Mantieni lo sconto attuale
          }
          
          // Calcola lo sconto necessario per la fascia di peso
          const weightPriceDifference = weightDisplayedBasePrice - maxPrice;
          const weightRequiredDiscountPercentage = Math.min(90, Math.max(0, 
            Math.round((weightPriceDifference / weightRange.actualMargin) * 100 * 100) / 100
          ));
          
          // Calcola il nuovo prezzo finale
          const weightNewDiscountAmount = weightRange.actualMargin * (weightRequiredDiscountPercentage / 100);
          const weightFinalPrice = weightDisplayedBasePrice - weightNewDiscountAmount;
          
          // Aggiorna SOLO lo sconto e i valori correlati, preservando i prezzi base
          return {
            ...weightRange,
            basePrice: weightOriginalBasePrice, // Mantieni il prezzo base originale
            displayBasePrice: weightDisplayedBasePrice, // Mantieni il prezzo base visualizzato
            userDiscount: weightRequiredDiscountPercentage,
            finalPrice: weightFinalPrice,
            adjustedMargin: weightRange.actualMargin - weightNewDiscountAmount
          };
        });
      }
      
      return discountedRate;
    });
  };

  // Modifica la funzione di conteggio per distinguere tra servizi e fasce di peso
  const selectedItemsCount = Object.entries(selectedRows)
    .filter(([id, isSelected]) => {
      // Contiamo solo le righe principali che non sono fasce di peso
      return isSelected && !id.includes("-");
    })
    .length;

  // Aggiungi questa nuova funzione per ottenere il numero totale di fasce di peso selezionate
  const getSelectedWeightRangesCount = () => {
    return Object.entries(selectedRows)
      .filter(([id, isSelected]) => {
        // Contiamo solo le fasce di peso
        return isSelected && id.includes("-");
      })
      .length;
  };

  // Modifica la funzione addSelectedToCart per gestire anche le fasce di peso selezionate
  const addSelectedToCart = useCallback(() => {
    // Prima identifichiamo le tariffe principali e le loro fasce di peso selezionate
    const mainRatesSelected = new Set<string>();
    const weightRangesSelected = new Map<string, string[]>(); // mappa parentId -> [rangeIds]
    
    Object.entries(selectedRows)
      .filter(([_, isSelected]) => isSelected)
      .forEach(([id, _]) => {
        if (id.includes('-')) {
          // È una fascia di peso
          const [parentId, _] = id.split('-');
          if (!weightRangesSelected.has(parentId)) {
            weightRangesSelected.set(parentId, []);
          }
          weightRangesSelected.get(parentId)?.push(id);
        } else {
          // È una tariffa principale
          mainRatesSelected.add(id);
        }
      });
    
    // Array finale di tariffe da aggiungere
    const ratesToAdd: Rate[] = [];
    
    // Per ogni tariffa principale selezionata
    mainRatesSelected.forEach(parentId => {
      const rangeIds = weightRangesSelected.get(parentId) || [];
      
      if (rangeIds.length > 0) {
        // Se ci sono fasce di peso selezionate per questa tariffa principale,
        // aggiungiamo SOLO le fasce di peso e NON la tariffa principale
        rangeIds.forEach(rangeId => {
          const [parentRateId, weightRangeId] = rangeId.split('-');
          const parentRate = rates.find(rate => rate.id === parentRateId);
          
          if (parentRate) {
            const serviceId = parentRate.service?._id || '';
            const weightRanges = serviceWeightRanges[serviceId] || [];
            const weightRange = weightRanges.find(wr => wr.id === weightRangeId);
            
            if (weightRange) {
              // Calcola il prezzo finale considerando il fuel surcharge se il toggle è attivo
              let finalPrice;
              if (includeFuelSurcharge && parentRate.fuelSurcharge > 0) {
                // Applica prima il fuel surcharge al prezzo base
                const baseWithFuel = weightRange.basePrice * (1 + (parentRate.fuelSurcharge / 100));
                // Poi sottrai lo sconto sul margine
                finalPrice = baseWithFuel - (weightRange.actualMargin * (parentRate.userDiscount / 100));
              } else {
                // Senza fuel surcharge
                finalPrice = weightRange.basePrice - (weightRange.actualMargin * (parentRate.userDiscount / 100));
              }
              
              ratesToAdd.push({
                ...parentRate,
                id: rangeId,
                currentWeightRange: {
                  id: weightRange.id,
                  min: weightRange.min,
                  max: weightRange.max,
                  label: weightRange.label,
                  basePrice: weightRange.basePrice,
                  userDiscount: weightRange.userDiscount,
                  finalPrice: weightRange.finalPrice,
                  actualMargin: weightRange.actualMargin,
                  volumeDiscount: weightRange.volumeDiscount,
                  promotionDiscount: weightRange.promotionDiscount,
                  displayBasePrice: weightRange.displayBasePrice
                },
                basePrice: weightRange.basePrice,
                finalPrice: finalPrice,
                actualMargin: weightRange.actualMargin,
                isWeightRange: true,
                parentRateId: parentRateId
              });
            }
          }
        });
      } else {
        // Se non ci sono fasce di peso selezionate, aggiungiamo la tariffa principale
        const rate = rates.find(rate => rate.id === parentId);
        if (rate) {
          // Calcola il prezzo finale considerando il fuel surcharge se il toggle è attivo
          let finalPrice;
          if (includeFuelSurcharge && rate.fuelSurcharge > 0) {
            // Applica prima il fuel surcharge al prezzo base
            const baseWithFuel = rate.basePrice * (1 + (rate.fuelSurcharge / 100));
            // Poi sottrai lo sconto sul margine
            finalPrice = baseWithFuel - (rate.actualMargin * (rate.userDiscount / 100));
          } else {
            // Senza fuel surcharge
            finalPrice = rate.basePrice - (rate.actualMargin * (rate.userDiscount / 100));
          }
          
          ratesToAdd.push({
            ...rate,
            finalPrice: finalPrice
          });
        }
      }
    });
    
    // Aggiungi le tariffe al carrello
    ratesToAdd.forEach(rate => {
      addToCart(rate);
    });
    
    // Mostra la notifica solo se almeno un elemento è stato aggiunto
    if (ratesToAdd.length > 0) {
      showCartNotification(toast);
    }
    
    // Resetta la selezione
    setSelectedRows({});
    
  }, [selectedRows, rates, serviceWeightRanges, addToCart, toast]);
  
  // Manteniamo solo questa definizione di hasSelectedItems
  const hasSelectedItems = Object.values(selectedRows).some(isSelected => isSelected);

  // Aggiungi un effect per ricalcolare i prezzi quando il toggle cambia
  useEffect(() => {
    if (rates.length === 0) return;
    
    setRates(prevRates => {
      return prevRates.map(rate => {
        // Calcola il prezzo base con fuel surcharge se necessario
        const displayBasePrice = calculateBasePrice(
          rate.basePrice, 
          rate.fuelSurcharge, 
          includeFuelSurcharge
        );
        
        // Calcola il prezzo finale
        const finalPrice = calculateFinalPrice(
          rate.basePrice,
          rate.actualMargin,
          rate.userDiscount || 0,
          rate.fuelSurcharge,
          includeFuelSurcharge
        );
        
        return {
          ...rate,
          finalPrice,
          displayBasePrice,
        };
      });
    });
    
    // Aggiorna anche le fasce di peso
    Object.keys(serviceWeightRanges).forEach(serviceId => {
      const rate = rates.find(r => r.service?._id === serviceId);
      if (!rate) return;
      
      setServiceWeightRanges(prev => ({
        ...prev,
        [serviceId]: prev[serviceId].map(weightRange => {
          const displayBasePrice = calculateBasePrice(
            weightRange.basePrice, 
            rate.fuelSurcharge, 
            includeFuelSurcharge
          );
          
          const finalPrice = calculateFinalPrice(
            weightRange.basePrice,
            weightRange.actualMargin,
            rate.userDiscount || 0,
            rate.fuelSurcharge,
            includeFuelSurcharge
          );
          
          return {
            ...weightRange,
            finalPrice,
            displayBasePrice
          };
        })
      }));
    });
  }, [includeFuelSurcharge, rates, serviceWeightRanges]);

  // Add this function to generate page numbers with ellipsis
  const getVisiblePageNumbers = useCallback((currentPage: number, totalPages: number) => {
    // Always show maximum 7 page items (including ellipsis)
    if (totalPages <= 7) {
      // If we have 7 or fewer pages, show all of them
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // We have more than 7 pages, so we need to use ellipsis
    if (currentPage < 5) {
      // Current page is near the start: show 1, 2, 3, 4, 5, ..., totalPages
      return [1, 2, 3, 4, 5, 'ellipsis', totalPages];
    } else if (currentPage > totalPages - 4) {
      // Current page is near the end: show 1, ..., totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages
      return [1, 'ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    } else {
      // Current page is in the middle: show 1, ..., currentPage-1, currentPage, currentPage+1, ..., totalPages
      return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages];
    }
  }, []);

  // Assicuriamoci che la funzione formatCountryList sia definita correttamente
  const formatCountryList = (countryStr: string | string[] | any): string => {
    // Se non è definito, ritorniamo una stringa vuota
    if (!countryStr) return '';
    
    // Se è un array, uniamo i codici paese
    if (Array.isArray(countryStr)) {
      return countryStr.join(', ');
    }
    
    // Se è una stringa, controlliamo se contiene virgole
    if (typeof countryStr === 'string') {
      // Se contiene virgole, è una lista di codici paese
      if (countryStr.includes(',')) {
        const countries = countryStr.split(/,\s*/);
        // Ritorniamo i primi 3 seguiti da "...e altri X" se ce ne sono altri
        if (countries.length <= 3) {
          return countries.join(', ');
        } else {
          return `${countries.slice(0, 3).join(', ')} ...e altri ${countries.length - 3}`;
        }
      }
      // Altrimenti è un singolo paese
      return countryStr;
    }
    
    // Per qualsiasi altro tipo, ritorniamo una rappresentazione stringa
    return String(countryStr);
  };

  // Ripristino la funzione per calcolare il margine totale (incluso fuel surcharge)
  const getTotalMargin = (rate: Rate): number => {
    return calculateTotalMargin(
      rate.basePrice,
      rate.purchasePrice || (rate.basePrice - rate.actualMargin),
      rate.fuelSurcharge || 0,
      rate.userDiscount || 0,
      includeFuelSurcharge
    );
  };

  // Modifico la funzione getWeightRangeTotalMargin per utilizzare calculateTotalMargin
  const getWeightRangeTotalMargin = (weightRange: WeightRange, rate: Rate): number => {
    return calculateTotalMargin(
      weightRange.basePrice,
      (weightRange.basePrice - (weightRange.actualMargin || 0)),
      rate.fuelSurcharge || 0,
      rate.userDiscount || 0,
      includeFuelSurcharge
    );
  };

  // Funzione di supporto per assicurare la visualizzazione del prezzo base originale
  const getOriginalBasePrice = (rate: Rate): number => {
    // Ritorna sempre il basePrice originale per la visualizzazione
    return rate.basePrice;
  };

  // Funzione di supporto per ottenere il prezzo base originale delle fasce di peso
  const getOriginalWeightRangeBasePrice = (weightRange: WeightRange): number => {
    // Ritorna sempre il basePrice originale per la visualizzazione
    return weightRange.basePrice;
  };

  // Aggiungi questa funzione di utilità
  const getFuelSurchargeText = (rate: Rate) => {
    if (!includeFuelSurcharge || !rate.fuelSurcharge || rate.fuelSurcharge <= 0) {
      return null;
    }
    
    // Calcolo lo sconto applicato al margine
    const discountPercentage = rate.userDiscount || 0;
    const discountAmount = calculateDiscountAmount(rate.actualMargin, discountPercentage);
    
    // Il prezzo di vendita dopo lo sconto
    const discountedRetailPrice = rate.basePrice - discountAmount;
    
    // Calcolo il fuel surcharge sul prezzo di vendita scontato
    const fuelSurchargeAmount = discountedRetailPrice * (rate.fuelSurcharge / 100);
    
    return (
      <div className="text-sm text-muted-foreground">
        Fuel Surcharge: {rate.fuelSurcharge}% 
        ({formatCurrency(fuelSurchargeAmount)})
      </div>
    );
  };

  // Funzione per cambiare l'ordinamento
  const requestSort = (key: string) => {
    setSortConfig((prevSortConfig) => {
      if (prevSortConfig.key === key) {
        // Cambia direzione se è la stessa colonna
        if (prevSortConfig.direction === 'ascending') {
          return { key, direction: 'descending' };
        }
        // Reset se già descendente
        return { key: null, direction: null };
      }
      // Nuova colonna, sempre ascendente
      return { key, direction: 'ascending' };
    });
  };

  // Icona per indicare l'ordinamento
  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };

  // Rate ordinate in base al sortConfig
  const sortedRates = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return displayedRates;
    }

    return [...displayedRates].sort((a, b) => {
      // Gestire i casi specifici come prezzo e margine in modo numerico
      if (sortConfig.key === 'finalPrice' || sortConfig.key === 'basePrice' || 
          sortConfig.key === 'actualMargin' || sortConfig.key === 'marginPercentage') {
        return sortConfig.direction === 'ascending'
          ? (a[sortConfig.key] as number) - (b[sortConfig.key] as number)
          : (b[sortConfig.key] as number) - (a[sortConfig.key] as number);
      }
      
      // Per campi di testo, confronto di stringhe
      const aValue = String(a[sortConfig.key as keyof typeof a] || '');
      const bValue = String(b[sortConfig.key as keyof typeof b] || '');
      
      if (sortConfig.direction === 'ascending') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }, [displayedRates, sortConfig]);

  // Funzione per aprire il dialog delle colonne
  const openColumnsDialog = () => {
    setColumnsDialogOpen(true);
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="pb-3 relative">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Confronto Tariffe</CardTitle>
          <div className="flex items-center space-x-2">
            {/* Pulsanti esistenti */}
          </div>
        </div>
        <CardDescription>
          Confronta e gestisci le tariffe di spedizione per diverse destinazioni
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="national" value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="national">Nazionali</TabsTrigger>
            <TabsTrigger value="international">Internazionali</TabsTrigger>
          </TabsList>

          {/* Tab contenuto per spedizioni nazionali e internazionali */}
          <TabsContent value={activeTab} className="space-y-4">
            {/* Componente RateFilters */}
            <RateFilters 
              filters={filters}
              onFilterChange={handleFilterChange}
              carriers={carriers}
              services={services}
              activeTab={activeTab}
              countryList={getCountryList().map(country => country.id)}
              onColumnsDialogOpen={openColumnsDialog}
              includeFuelSurcharge={includeFuelSurcharge}
              onFuelSurchargeChange={(checked) => setIncludeFuelSurcharge(checked)}
            />
            
            {/* Visualizzazione condizionale basata sullo stato */}
            {loading ? (
              <LoadingIndicator stage={loadingStage} />
            ) : error ? (
              <ErrorDisplay 
                message={`Si è verificato un errore durante il caricamento delle tariffe: ${error}`} 
                onRetry={loadRates} 
              />
            ) : sortedRates.length === 0 ? (
              <Alert>
                <AlertTitle>Nessuna tariffa trovata</AlertTitle>
                <AlertDescription>Nessuna tariffa corrisponde ai criteri di filtro attuali.</AlertDescription>
              </Alert>
            ) : (
              // Tabella dei risultati
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead className="w-10"></TableHead>
                      
                      {/* Intestazioni colonne con ordinamento */}
                      {visibleColumns.find((col) => col.id === "carrier")?.isVisible && (
                        <TableHead 
                          className="w-[150px] cursor-pointer hover:bg-muted/30"
                          onClick={() => requestSort('carrierName')}
                        >
                          <div className="flex items-center justify-between">
                            <span>Corriere</span>
                            {getSortIcon('carrierName')}
                          </div>
                        </TableHead>
                      )}
                      
                      {visibleColumns.find((col) => col.id === "service")?.isVisible && (
                        <TableHead 
                          className="w-[200px] cursor-pointer hover:bg-muted/30"
                          onClick={() => requestSort('serviceName')}
                        >
                          <div className="flex items-center justify-between">
                            <span>Servizio</span>
                            {getSortIcon('serviceName')}
                          </div>
                        </TableHead>
                      )}
                      
                      {visibleColumns.find((col) => col.id === "country")?.isVisible && (
                        <TableHead
                          className="cursor-pointer hover:bg-muted/30"
                          onClick={() => requestSort('countryName')}
                        >
                          <div className="flex items-center justify-between">
                            <span>Paese</span>
                            {getSortIcon('countryName')}
                          </div>
                        </TableHead>
                      )}
                      
                      {visibleColumns.find((col) => col.id === "baseRate")?.isVisible && (
                        <TableHead 
                          className="text-center cursor-pointer hover:bg-muted/30"
                          onClick={() => requestSort('basePrice')}
                        >
                          <div className="flex items-center justify-between">
                            <span>Prezzo Base</span>
                            {getSortIcon('basePrice')}
                          </div>
                        </TableHead>
                      )}
                      
                      {visibleColumns.find((col) => col.id === "discount")?.isVisible && (
                        <TableHead className="w-24">Sconto</TableHead>
                      )}
                      
                      {visibleColumns.find((col) => col.id === "finalPrice")?.isVisible && (
                        <TableHead 
                          className="text-center cursor-pointer hover:bg-muted/30"
                          onClick={() => requestSort('finalPrice')}
                        >
                          <div className="flex items-center justify-between">
                            <span>Prezzo Finale</span>
                            {getSortIcon('finalPrice')}
                          </div>
                        </TableHead>
                      )}
                      
                      {visibleColumns.find((col) => col.id === "margin")?.isVisible && (
                        <TableHead 
                          className="text-center cursor-pointer hover:bg-muted/30"
                          onClick={() => requestSort('actualMargin')}
                        >
                          <div className="flex items-center justify-between">
                            <span>Margine</span>
                            {getSortIcon('actualMargin')}
                          </div>
                        </TableHead>
                      )}
                      
                      {visibleColumns.find((col) => col.id === "delivery")?.isVisible && (
                        <TableHead className="text-center">Consegna</TableHead>
                      )}
                      
                      {visibleColumns.find((col) => col.id === "details")?.isVisible && (
                        <TableHead className="text-center">Dettagli</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  
                  <TableBody>
                    {/* Usa sortedRates invece di displayedRates */}
                    {sortedRates.map((rate) => (
                      <RateTableRow
                        key={rate.id}
                        rate={rate}
                        selectedRows={selectedRows}
                        expandedRows={expandedRows}
                        visibleColumns={visibleColumns}
                        handleRowSelect={handleRowSelect}
                        toggleRowExpansion={() => toggleRowExpansion(rate.id)}
                        handleDiscountChange={handleDiscountChange}
                        includeFuelSurcharge={includeFuelSurcharge}
                        filters={filters}
                        getFuelSurchargeText={getFuelSurchargeText}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* ... existing code ... */}
      </CardContent>
    </Card>
  );
}