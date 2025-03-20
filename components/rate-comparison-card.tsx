"use client"

import React, { useState, useEffect, useCallback } from "react"
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
import { Filter, RefreshCw, Download, Lightbulb, Info, MoreVertical, X, Columns, ChevronRight, ChevronUp, ChevronDown, ShoppingCart } from "lucide-react"
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
  displayBasePrice?: number; // Aggiungi questa proprietà
  service?: {
    _id?: string;
    name?: string;
  };
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

  const router = useRouter()
  const { addToCart, isInCart, cartItems } = useCart()
  const { toast } = useToast()

  // Modifica della funzione loadServiceWeightRanges per aggiungere un fallback con dati simulati
  const loadServiceWeightRanges = useCallback(async (serviceId: string) => {
    if (!serviceId) {
      console.error('ERRORE: ServiceID mancante, impossibile caricare le fasce di peso');
      return;
    }
    
    try {
      // Verifichiamo se abbiamo già caricato le fasce di peso per questo servizio
      if (serviceWeightRanges[serviceId]) {
        console.log(`Fasce di peso già caricate per il servizio ${serviceId}`);
        return;
      }
      
      console.log(`Richiesta fasce di peso per il servizio: ${serviceId}`);
      const weightRangesData = await api.getWeightRangesByService(serviceId);
      console.log('Dati fasce di peso ricevuti:', JSON.stringify(weightRangesData));
      
      // Controlliamo che i dati siano un array e non vuoto
      if (Array.isArray(weightRangesData) && weightRangesData.length > 0) {
        // Aggiorniamo lo stato con type assertion per assicurarci che i dati abbiano il tipo corretto
        setServiceWeightRanges(prev => ({
          ...prev,
          [serviceId]: weightRangesData as WeightRange[]
        }));
        
        console.log(`Caricate ${weightRangesData.length} fasce di peso per il servizio ${serviceId}`);
      } else {
        console.warn(`Nessuna fascia di peso trovata per il servizio ${serviceId}, generando fasce simulate`);
        
        // MODIFICA: Invece di un array vuoto, generiamo fasce di peso simulate
        const simulatedWeightRanges = generateSimulatedWeightRanges(serviceId);
        setServiceWeightRanges(prev => ({
          ...prev,
          [serviceId]: simulatedWeightRanges
        }));
      }
    } catch (error) {
      console.error('Errore nel caricamento delle fasce di peso:', error);
      
      // MODIFICA: In caso di errore, generiamo comunque fasce di peso simulate
      const simulatedWeightRanges = generateSimulatedWeightRanges(serviceId);
      setServiceWeightRanges(prev => ({
        ...prev,
        [serviceId]: simulatedWeightRanges
      }));
    }
  }, [serviceWeightRanges]);

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
                _id: service._id || rate.service?._id || '',
                name: service.name || rate.serviceName || 'Standard'
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
              _id: service._id || rate.service?._id || '',
              name: service.name || rate.serviceName || 'Standard'
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

  // Get margin color based on monetary value
  const getMarginColor = (margin: number) => {
    if (margin >= 0.8) return "success" // verde
    if (margin >= 0.2) return "secondary" // neutro/medio
    return "destructive" // rosso
  }

  // Get margin label based on monetary value
  const getMarginLabel = (margin: number) => {
    if (margin >= 0.8) return "High"
    if (margin >= 0.2) return "Medium"
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

  // Load rates when filters or tab changes
  const loadRates = useCallback(async () => {
    setLoading(true)
    setSelectedRows({}) // Reset selected rows when refreshing data

    try {
      // Carichiamo i corrieri se non sono già stati caricati
      if (carriers.length === 0) {
        const carriersData = await api.getCarriers();
        setCarriers(carriersData);
      }

      // Se non abbiamo servizi, li carichiamo
      if (services.length === 0) {
        const servicesData = await api.getServices(filters.carrierId || undefined);
        setServices(servicesData);
      }
      
      // Confrontiamo le tariffe dal backend
      const ratesData = await api.compareRates({
        weight: filters.weight,
        destinationType: activeTab,
        destinationCountry: filters.country,
        carrierId: filters.carrierId,
        service: filters.service,
        volume: filters.volume,
        sourceCountry: filters.sourceCountry // Aggiungi il market/sourceCountry alla richiesta
      });
      
      console.log(`Richiesta tariffe per tab ${activeTab} con paese ${filters.country || 'tutti'}. Risultati: ${ratesData.length}`);
      
      // Trasforma i dati dell'API nel formato atteso dal componente
      const formattedRates = ratesData.map((rate: any) => {
        // Log per debug
        console.log('Rate ricevuta dal backend:', rate);
        console.log('Rate.service:', rate.service);
        console.log('Rate.carrier:', rate.carrier);
        
        // Trova tutte le fasce di peso per il servizio corrente
        // Il problema è che rate.weightRanges non contiene tutte le fasce di peso, ma solo quella corrispondente al peso selezionato
        
        // Utilizzo l'ID del servizio per ottenere TUTTE le fasce di peso dal backend
        const serviceId = rate.service?._id;
        console.log('ServiceId per cercare tutte le fasce di peso:', serviceId);
        
        // Utilizziamo solo le fasce di peso reali dal modello Mongoose se disponibili
        const weightRanges = rate.weightRanges?.length > 0 
          ? rate.weightRanges.map((range: any) => {
              const basePrice = range.retailPrice;
              let finalPrice = basePrice;
              let displayBasePrice = basePrice;
              
              // Calcola il finalPrice e displayBasePrice considerando il fuel surcharge se il toggle è attivo
              if (includeFuelSurcharge && carrier.fuelSurcharge > 0) {
                finalPrice = basePrice * (1 + (carrier.fuelSurcharge / 100));
                displayBasePrice = finalPrice;
              }
              
              return {
                id: `${rate._id}-${range.weightMin}-${range.weightMax}`,
                label: `${range.weightMin}-${range.weightMax} kg`,
                min: range.weightMin,
                max: range.weightMax,
                basePrice: basePrice,
                userDiscount: 0,
                finalPrice: finalPrice,
                actualMargin: range.margin || (range.retailPrice - range.purchasePrice),
                volumeDiscount: range.volumeDiscount || 0,
                promotionDiscount: range.promotionDiscount || 0,
                displayBasePrice: displayBasePrice
              };
            })
          // Non generiamo più fasce simulative
          : [];
        
        // Trova l'intervallo di peso corrente in base al filtro del peso
        const weightValue = parseFloat(filters.weight);
        const currentWeightRange = weightRanges.find(
          (range) => weightValue >= range.min && weightValue <= range.max
        ) || weightRanges[0];
        
        // Estrai i dati del servizio e del corriere con gestione null/undefined
        const service = rate.service || {};
        const carrier = rate.carrier || (service?.carrier || {});
        
        // Formatta la lista dei paesi se c'è una lista di codici paesi
        let countryName = '';
        if (service.destinationCountry) {
          // Se contiene virgole, è una lista di codici paese - mostriamo solo il primo
          if (service.destinationCountry.includes(',')) {
            const countries = service.destinationCountry.split(/,\s*/);
            countryName = countries[0].trim(); // Prendiamo il primo paese
          } else {
            countryName = service.destinationCountry;
          }
        }
        
        // Usa la funzione per calcolare il prezzo finale considerando il fuel surcharge
        const finalPrice = calculateFinalPrice(rate.retailPrice || 0, carrier.fuelSurcharge || 0, {
          actualMargin: rate.margin || (rate.retailPrice - (rate.purchasePrice || 0)),
          userDiscount: 0
        });
        
        // Calcola il displayBasePrice considerando il fuel surcharge se il toggle è attivo
        let displayBasePrice = rate.retailPrice || 0;
        if (includeFuelSurcharge && carrier.fuelSurcharge > 0) {
          displayBasePrice = displayBasePrice * (1 + (carrier.fuelSurcharge / 100));
        }
        
        // Crea l'oggetto Rate con tutti i campi richiesti dall'interfaccia
        const formattedRate: Rate = {
          id: rate._id || uuidv4(),
          carrierId: carrier._id || '',
          carrierName: carrier.name || 'Unknown',
          carrierLogo: carrier.logoUrl || '',
          serviceCode: service.code || service.name || rate.serviceCode || 'Standard',
          serviceName: service.name || rate.serviceName || 'Standard',
          serviceDescription: service.description || rate.description || '',
          countryName: countryName,
          basePrice: rate.retailPrice || 0,
          userDiscount: 0,
          finalPrice: finalPrice,
          actualMargin: rate.margin || (rate.retailPrice - (rate.purchasePrice || 0)),
          marginPercentage: rate.marginPercentage || (rate.retailPrice ? ((rate.retailPrice - (rate.purchasePrice || 0)) / rate.retailPrice) * 100 : 0) || 0,
          deliveryTimeMin: service.deliveryTimeMin || rate.deliveryTimeMin,
          deliveryTimeMax: service.deliveryTimeMax || rate.deliveryTimeMax,
          fuelSurcharge: carrier.fuelSurcharge || rate.fuelSurcharge || 0,
          volumeDiscount: rate.volumeDiscount || 0,
          promotionDiscount: rate.promotionDiscount || 0,
          totalBasePrice: rate.totalBasePrice || rate.retailPrice || 0,
          weightRanges,
          currentWeightRange,
          retailPrice: rate.retailPrice || 0,
          purchasePrice: rate.purchasePrice || 0,
          margin: rate.margin || 0,
          weightMin: rate.weightMin || 0,
          weightMax: rate.weightMax || 0,
          displayBasePrice: displayBasePrice, // Usa il valore calcolato
          service: {
            _id: service._id || rate.service?._id || '',
            name: service.name || rate.serviceName || 'Standard'
          }
        };
        
        return formattedRate;
      });
      
      // Applica il filtro del prezzo massimo
      const filteredRates = applyMaxPriceFilter(formattedRates);
      setRates(filteredRates);
      
      // Per ora continuiamo a usare suggerimenti simulati
      const newSuggestions = generateMockSuggestions(activeTab, filters);
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Errore durante il caricamento delle tariffe:', error);
      // In caso di errore, mostriamo tariffe simulate
      const newRates = generateMockRates(activeTab, filters);
      const filteredRates = applyMaxPriceFilter(newRates);
      setRates(filteredRates);
      
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

  // Correggi la funzione per applicare lo sconto al margine e aggiornare il prezzo finale
  const handleDiscountChange = (rateId: string, serviceId: string, newDiscount: number) => {
    setRates(prevRates => prevRates.map(rate => {
      if (rate.id === rateId) {
        // Limita lo sconto tra 0 e 90%
        const clampedDiscount = Math.max(0, Math.min(90, newDiscount));
        
        // Ottieni il prezzo base corretto (con fuel surcharge se abilitato)
        const currentBasePrice = rate.displayBasePrice || rate.basePrice;
        
        // Calcola il prezzo finale applicando lo sconto sul margine
        const discountAmount = rate.actualMargin * (clampedDiscount / 100);
        const finalPrice = currentBasePrice - discountAmount;
        
        // Aggiorna anche le fasce di peso
        if (serviceId && rate.weightRanges) {
          // Carica le fasce di peso se non ancora caricate
          if (!serviceWeightRanges[serviceId] && serviceId) {
            loadServiceWeightRanges(serviceId);
          }
          
          const updatedWeightRanges = rate.weightRanges.map(range => {
            // Ottieni il prezzo base corretto per la fascia (con fuel surcharge se abilitato)
            const currentRangeBasePrice = range.displayBasePrice || range.basePrice;
            
            // Calcola lo sconto sul margine per la fascia
            const rangeDiscountAmount = range.actualMargin * (clampedDiscount / 100);
            
            // Calcola il prezzo finale per la fascia
            const rangeFinalPrice = currentRangeBasePrice - rangeDiscountAmount;
            
            return {
              ...range,
              userDiscount: clampedDiscount,
              finalPrice: rangeFinalPrice,
              adjustedMargin: range.actualMargin - rangeDiscountAmount
            };
          });
          
          return {
            ...rate,
            userDiscount: clampedDiscount,
            finalPrice,
            adjustedMargin: rate.actualMargin - discountAmount,
            weightRanges: updatedWeightRanges
          };
        }
        
        return {
          ...rate,
          userDiscount: clampedDiscount,
          finalPrice,
          adjustedMargin: rate.actualMargin - discountAmount
        };
      }
      return rate;
    }));
  };

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
    
    return rates.map(rate => {
      // Calcola il prezzo base considerando il fuel surcharge
      const basePriceWithFuel = includeFuelSurcharge 
        ? rate.basePrice + (rate.basePrice * (rate.fuelSurcharge / 100))
        : rate.basePrice;
      
      // Se il prezzo base è già inferiore al prezzo massimo, non serve applicare sconti
      if (basePriceWithFuel <= maxPrice) {
        return rate;
      }
      
      // Calcola lo sconto necessario per raggiungere il prezzo massimo
      const requiredDiscount = Math.min(90, Math.max(0, 
        Math.round(((basePriceWithFuel - maxPrice) / rate.actualMargin) * 100 * 100) / 100
      ));
      
      // Se anche applicando lo sconto massimo non si raggiunge il prezzo desiderato,
      // conserviamo lo sconto massimo del 90%
      const achievablePrice = basePriceWithFuel - (rate.actualMargin * (requiredDiscount / 100));
      
      // Aggiorna la tariffa con lo sconto calcolato
      const discountedRate = {
        ...rate,
        userDiscount: requiredDiscount,
        finalPrice: achievablePrice,
        adjustedMargin: rate.actualMargin - (rate.actualMargin * (requiredDiscount / 100))
      };
      
      // Aggiorna anche tutte le fasce di peso
      if (discountedRate.weightRanges && discountedRate.weightRanges.length > 0) {
        discountedRate.weightRanges = rate.weightRanges.map(weightRange => {
          // MODIFICA: Arrotonda a massimo 2 decimali
          const rangeDiscount = Math.min(90, Math.max(0, 
            Math.round(((weightRange.basePrice - maxPrice) / weightRange.actualMargin) * 100 * 100) / 100
          ));
          const rangeAchievablePrice = weightRange.basePrice - (weightRange.actualMargin * (rangeDiscount / 100));
          
          return {
            ...weightRange,
            userDiscount: rangeDiscount,
            finalPrice: rangeAchievablePrice,
            adjustedMargin: weightRange.actualMargin - (weightRange.actualMargin * (rangeDiscount / 100))
          };
        });
      }
      
      return discountedRate;
    }).filter(rate => {
      // Filtra le tariffe: mostra solo quelle che possono effettivamente raggiungere il prezzo massimo
      return rate.finalPrice <= maxPrice || Math.abs(rate.finalPrice - maxPrice) < 0.01;
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
              // Calcola il prezzo finale SENZA fuel surcharge
              const priceWithoutFuel = weightRange.basePrice - 
                (weightRange.actualMargin * (weightRange.userDiscount / 100));
              
              ratesToAdd.push({
                ...parentRate,
                id: rangeId,
                currentWeightRange: {
                  min: weightRange.min,
                  max: weightRange.max,
                  label: weightRange.label
                },
                basePrice: weightRange.basePrice,
                finalPrice: priceWithoutFuel,
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
          // Calcola il prezzo finale SENZA fuel surcharge
          const priceWithoutFuel = rate.basePrice - 
            (rate.actualMargin * (rate.userDiscount / 100));
          
          ratesToAdd.push({
            ...rate,
            finalPrice: priceWithoutFuel
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
  
  // Controlla se ci sono elementi selezionati
  const hasSelectedItems = Object.values(selectedRows).some(isSelected => isSelected);

  // Aggiungi una funzione per calcolare il prezzo finale considerando il fuel surcharge
  const calculateFinalPrice = (basePrice: number, fuelSurcharge: number, discounts: any) => {
    let finalPrice = basePrice;
    
    // Applica il fuel surcharge solo se attivato
    if (includeFuelSurcharge && fuelSurcharge > 0) {
      finalPrice += basePrice * (fuelSurcharge / 100);
    }
    
    // Applica gli sconti
    if (discounts.userDiscount) {
      finalPrice -= discounts.actualMargin * (discounts.userDiscount / 100);
    }
    
    return finalPrice;
  };

  // Aggiungi questa funzione di utilità
  const getFuelSurchargeText = (rate: Rate) => {
    if (!includeFuelSurcharge || !rate.fuelSurcharge || rate.fuelSurcharge <= 0) {
      return null;
    }
    
    return (
      <div className="text-sm text-muted-foreground">
        Fuel Surcharge: {rate.fuelSurcharge}% 
        ({formatCurrency(rate.basePrice * (rate.fuelSurcharge / 100))})
      </div>
    );
  };

  // Aggiungi un effect per ricalcolare i prezzi quando il toggle cambia
  useEffect(() => {
    if (rates.length > 0) {
      // Ricrea le tariffe con il nuovo calcolo del fuel surcharge
      setRates(prevRates => {
        const updatedRates = prevRates.map(rate => {
          // Calcola il prezzo base con fuel surcharge se richiesto
          const displayBasePrice = includeFuelSurcharge && rate.fuelSurcharge > 0
            ? rate.basePrice * (1 + (rate.fuelSurcharge / 100))
            : rate.basePrice;
          
          // Calcola il prezzo finale basato sul displayBasePrice meno lo sconto sul margine
          const discountAmount = rate.actualMargin * (rate.userDiscount / 100);
          const finalPrice = displayBasePrice - discountAmount;
          
          // Aggiorna le fasce di peso con lo stesso calcolo
          const updatedWeightRanges = rate.weightRanges?.map(range => {
            // Calcola il prezzo base della fascia con fuel surcharge se richiesto
            const rangeDisplayBasePrice = includeFuelSurcharge && rate.fuelSurcharge > 0
              ? range.basePrice * (1 + (rate.fuelSurcharge / 100))
              : range.basePrice;
            
            // Calcola il prezzo finale della fascia basato sul displayBasePrice meno lo sconto sul margine
            const rangeDiscountAmount = range.actualMargin * (rate.userDiscount / 100);
            const rangeFinalPrice = rangeDisplayBasePrice - rangeDiscountAmount;
            
            return {
              ...range,
              finalPrice: rangeFinalPrice,
              displayBasePrice: rangeDisplayBasePrice
            };
          });
          
          return {
            ...rate,
            finalPrice,
            displayBasePrice,
            weightRanges: updatedWeightRanges || rate.weightRanges
          };
        });
        
        return updatedRates;
      });
    }
  }, [includeFuelSurcharge]);

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

  // Modify the formatCountryList function to handle different data types
  const formatCountryList = (countryStr: string | string[] | any): JSX.Element => {
    // If it's undefined or null
    if (!countryStr) return <span>-</span>;
    
    // If it's already an array of country codes
    if (Array.isArray(countryStr)) {
      const countries = countryStr;
      
      if (countries.length === 0) return <span>-</span>;
      
      if (countries.length <= 3) {
        return <span>{countries.join(', ')}</span>;
      }
      
      return (
        <div className="flex items-center">
          <span>{countries.slice(0, 2).join(', ')}</span>
          <span className="text-muted-foreground">
            {" "}+{countries.length - 2} more
          </span>
          <div className="relative group ml-1">
            <span className="cursor-help text-xs">ℹ️</span>
            <div className="absolute z-50 hidden group-hover:block bg-secondary p-2 rounded shadow-lg text-sm w-80 max-h-60 overflow-y-auto left-0 top-full">
              <p className="font-medium mb-1">All countries ({countries.length}):</p>
              <p className="flex flex-wrap gap-1">
                {countries.map((country) => (
                  <span key={country} className="px-1.5 py-0.5 bg-primary/10 rounded text-xs">
                    {country}
                  </span>
                ))}
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    // If it's a string, try to extract country codes
    if (typeof countryStr === 'string') {
      const countries = countryStr.match(/[A-Z]{2}/g) || [];
      
      if (countries.length === 0) return <span>{countryStr}</span>;
      
      if (countries.length <= 3) {
        return <span>{countries.join(', ')}</span>;
      }
      
      return (
        <div className="flex items-center">
          <span>{countries.slice(0, 2).join(', ')}</span>
          <span className="text-muted-foreground">
            {" "}+{countries.length - 2} more
          </span>
          <div className="relative group ml-1">
            <span className="cursor-help text-xs">ℹ️</span>
            <div className="absolute z-50 hidden group-hover:block bg-secondary p-2 rounded shadow-lg text-sm w-80 max-h-60 overflow-y-auto left-0 top-full">
              <p className="font-medium mb-1">All countries ({countries.length}):</p>
              <p className="flex flex-wrap gap-1">
                {countries.map((country) => (
                  <span key={country} className="px-1.5 py-0.5 bg-primary/10 rounded text-xs">
                    {country}
                  </span>
                ))}
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    // For any other type, just return a string representation
    return <span>{String(countryStr)}</span>;
  };

  // Modifico la funzione per calcolare il margine sul fuel surcharge tenendo conto dello sconto
  const calculateFuelSurchargeMargin = (rate: Rate): number => {
    if (!includeFuelSurcharge || !rate.fuelSurcharge || rate.fuelSurcharge <= 0) {
      return 0;
    }
    
    // Calcola la differenza tra ciò che Sendcloud addebita e ciò che paga per il fuel surcharge
    // Sendcloud paga fuel surcharge sul costo di acquisto, ma addebita fuel surcharge sul prezzo di vendita
    const purchasePrice = rate.purchasePrice || (rate.basePrice - rate.actualMargin);
    
    // Calcolo lo sconto applicato al margine base
    const discountPercentage = rate.userDiscount || 0;
    const discountAmount = rate.actualMargin * (discountPercentage / 100);
    
    // Il prezzo di vendita dopo lo sconto
    const discountedRetailPrice = rate.basePrice - discountAmount;
    
    // Calcolo il fuel surcharge sul prezzo di vendita scontato
    const fuelSurchargeOnRetail = discountedRetailPrice * (rate.fuelSurcharge / 100);
    const fuelSurchargeOnPurchase = purchasePrice * (rate.fuelSurcharge / 100);
    
    return fuelSurchargeOnRetail - fuelSurchargeOnPurchase;
  };

  // Ripristino la funzione per calcolare il margine totale (incluso fuel surcharge)
  const getTotalMargin = (rate: Rate): number => {
    const baseMargin = rate.actualMargin;
    const fuelMargin = calculateFuelSurchargeMargin(rate);
    return baseMargin + fuelMargin;
  };

  // Aggiorno anche la funzione per le fasce di peso
  const getWeightRangeTotalMargin = (weightRange: WeightRange, rate: Rate): number => {
    const baseMargin = weightRange.actualMargin || 0;
    
    if (!includeFuelSurcharge || !rate.fuelSurcharge || rate.fuelSurcharge <= 0) {
      return baseMargin;
    }
    
    // Per le fasce di peso non abbiamo il purchase price, quindi dobbiamo calcolarlo indirettamente
    const purchasePrice = weightRange.basePrice - baseMargin;
    
    // Calcolo lo sconto applicato al margine base
    const discountPercentage = rate.userDiscount || 0;
    const discountAmount = baseMargin * (discountPercentage / 100);
    
    // Il prezzo di vendita dopo lo sconto
    const discountedRetailPrice = weightRange.basePrice - discountAmount;
    
    // Calcolo il fuel surcharge sul prezzo di vendita scontato
    const fuelSurchargeOnRetail = discountedRetailPrice * (rate.fuelSurcharge / 100);
    const fuelSurchargeOnPurchase = purchasePrice * (rate.fuelSurcharge / 100);
    
    return baseMargin + (fuelSurchargeOnRetail - fuelSurchargeOnPurchase);
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="pb-3 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image 
              src="/sendcloud_logo.png" 
              alt="Sendcloud Logo" 
              width={40} 
              height={40} 
              className="rounded-md p-1"
            />
            <CardTitle className="bg-gradient-to-r from-[#122857] to-[#1e3a80] text-transparent bg-clip-text">
              SendQuote
            </CardTitle>
          </div>
          
          {/* Cart Icon with Item Count */}
          <Button 
            variant="outline"
            size="icon" 
            className="relative"
            onClick={() => router.push("/cart")}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartItems.length > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {cartItems.length}
              </Badge>
            )}
          </Button>
        </div>
        <CardDescription>
          Compare shipping rates across different carriers
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Filters Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Filter className="mr-2 h-5 w-5" />
                <h3 className="font-medium">Filters</h3>
              </div>
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

            <Separator className="mb-4" />

            {/* Sostituisci il grid con un flex layout */}
            <div className="flex flex-wrap items-start gap-3">
              {/* Market - larghezza ridotta */}
              <div className="space-y-2 w-[120px]">
                <label htmlFor="market" className="text-sm font-medium">
                  Market
                </label>
                <Select value={filters.sourceCountry} onValueChange={(value) => handleFilterChange("sourceCountry", value)}>
                  <SelectTrigger id="market">
                    <SelectValue placeholder="All markets" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All markets</SelectItem>
                    {MARKETS.map((market) => (
                      <SelectItem key={market.id} value={market.id}>
                        {market.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Carrier - larghezza ridotta */}
              <div className="space-y-2 w-[140px]">
                <label htmlFor="carrier" className="text-sm font-medium">
                  Carrier
                </label>
                <Select value={filters.carrierId} onValueChange={(value) => handleFilterChange("carrierId", value)}>
                  <SelectTrigger id="carrier">
                    <SelectValue placeholder="All carriers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti i corrieri</SelectItem>
                    {carriers.map((carrier) => (
                      <SelectItem key={carrier._id} value={carrier._id}>
                        {carrier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Service Type - larghezza ridotta */}
              <div className="space-y-2 w-[150px]">
                <label htmlFor="service" className="text-sm font-medium">
                  Service
                </label>
                <Select value={filters.service} onValueChange={(value) => handleFilterChange("service", value)}>
                  <SelectTrigger id="service">
                    <SelectValue placeholder="All services" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All services</SelectItem>
                    {services.map((service) => (
                      <SelectItem key={service._id} value={service._id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Country filter - solo per EU e Extra EU */}
              {(activeTab === "eu" || activeTab === "extra_eu") && (
                <div className="space-y-2 w-[150px]">
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

              {/* Weight - più stretto */}
              <div className="space-y-2 w-[100px]">
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
                    className="w-full"
                  />
                </div>
              </div>

              {/* Monthly Volume - più stretto */}
              <div className="space-y-2 w-[120px]">
                <label htmlFor="volume" className="text-sm font-medium">
                  Volume
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="volume"
                    type="number"
                    value={filters.volume}
                    onChange={(e) => handleFilterChange("volume", e.target.value)}
                    min="1"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Max Price - più stretto */}
              <div className="space-y-2 w-[120px]">
                <label htmlFor="maxPrice" className="text-sm font-medium">
                  Max Price
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="maxPrice"
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                    min="0.1"
                    step="0.1"
                    placeholder="Any"
                    className="w-full"
                  />
                </div>
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
                <Table className="table-fixed">
                  <TableHeader className="bg-muted">
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={areAllRowsSelected}
                          onCheckedChange={handleSelectAllRows}
                          aria-label="Select all rows"
                        />
                      </TableHead>
                      {/* Aggiungi una colonna per l'espansione */}
                      <TableHead className="w-[50px]"></TableHead>
                      {visibleColumns.find((col) => col.id === "carrier")?.isVisible && <TableHead className="w-[150px]">Carrier</TableHead>}
                      {visibleColumns.find((col) => col.id === "service")?.isVisible && <TableHead className="w-[150px]">Service</TableHead>}
                      {(activeTab === "eu" || activeTab === "extra_eu") &&
                        visibleColumns.find((col) => col.id === "country")?.isVisible && <TableHead className="w-[120px]">Country</TableHead>}
                      {visibleColumns.find((col) => col.id === "weightRange")?.isVisible && (
                        <TableHead className="w-[120px]">Weight Range</TableHead>
                      )}
                      {visibleColumns.find((col) => col.id === "baseRate")?.isVisible && (
                        <TableHead className="text-right w-[100px]">
                          {includeFuelSurcharge ? (
                            <div className="whitespace-normal text-xs">
                              Base Rate
                              <br />
                              <span className="text-xs text-muted-foreground">
                                (+Fuel {Math.round((rates[0]?.fuelSurcharge || 0) * 10) / 10}%)
                              </span>
                            </div>
                          ) : (
                            "Base Rate"
                          )}
                        </TableHead>
                      )}
                      {visibleColumns.find((col) => col.id === "discount")?.isVisible && (
                        <TableHead className="text-right w-[120px]">Discount (%)</TableHead>
                      )}
                      {visibleColumns.find((col) => col.id === "finalPrice")?.isVisible && (
                        <TableHead className="text-right w-[100px]">Final Price</TableHead>
                      )}
                      {visibleColumns.find((col) => col.id === "margin")?.isVisible && (
                        <TableHead className="text-center w-[120px]">Margin</TableHead>
                      )}
                      {visibleColumns.find((col) => col.id === "totalMargin")?.isVisible && (
                        <TableHead className="text-center w-[130px]">Total Margin ({filters.volume})</TableHead>
                      )}
                      {visibleColumns.find((col) => col.id === "delivery")?.isVisible && (
                        <TableHead className="text-center w-[100px]">Delivery</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedRates.map((rate, index) => (
                      <>
                        <TableRow key={rate.id} className="even:bg-muted/20 hover:bg-muted/40">
                          <TableCell>
                            <Checkbox
                              checked={!!selectedRows[rate.id]}
                              onCheckedChange={(checked) => handleRowSelect(rate.id, !!checked)}
                              aria-label={`Select row ${index + 1}`}
                            />
                          </TableCell>
                          {/* Aggiungi una cella con il pulsante di espansione */}
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRowExpansion(rate.service?._id || '');
                              }}
                              className="h-8 w-8 p-0"
                            >
                              {expandedRows[rate.service?._id || ''] ? 
                                <ChevronDown className="h-4 w-4" /> : 
                                <ChevronRight className="h-4 w-4" />}
                            </Button>
                          </TableCell>
                          {visibleColumns.find((col) => col.id === "carrier")?.isVisible && (
                            <TableCell>{rate.carrierName}</TableCell>
                          )}
                          {visibleColumns.find((col) => col.id === "service")?.isVisible && (
                            <TableCell>
                              <span className="font-medium">{rate.serviceName}</span>
                            </TableCell>
                          )}
                          {(activeTab === "eu" || activeTab === "extra_eu") &&
                            visibleColumns.find((col) => col.id === "country")?.isVisible && (
                              <TableCell className="max-w-[250px] truncate">
                                {formatCountryList(rate.countryName)}
                              </TableCell>
                            )}
                          {visibleColumns.find((col) => col.id === "weightRange")?.isVisible && (
                            <TableCell className="font-medium">
                              {rate.weightMin !== undefined && rate.weightMax !== undefined 
                                ? `${rate.weightMin}-${rate.weightMax} kg` 
                                : (rate.currentWeightRange ? `${rate.currentWeightRange.min}-${rate.currentWeightRange.max} kg` : "N/A")}
                            </TableCell>
                          )}
                          {visibleColumns.find((col) => col.id === "baseRate")?.isVisible && (
                            <TableCell className="text-right relative group">
                              <div className="flex justify-end">
                                <span className="cursor-help">
                                  {formatCurrency(rate.displayBasePrice || rate.basePrice)}
                                </span>
                                <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">ℹ️</span>
                                <div className="absolute z-50 hidden group-hover:block bg-secondary p-2 rounded shadow-lg text-sm w-64 top-0 right-full mr-2">
                                  <p className="font-medium mb-1 border-b pb-1">Base Rate Calculation:</p>
                                  <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                      <span>Base Price:</span>
                                      <span>{formatCurrency(rate.basePrice)}</span>
                                    </div>
                                    {includeFuelSurcharge && rate.fuelSurcharge > 0 && (
                                      <>
                                        <div className="flex justify-between text-muted-foreground">
                                          <span>+ Fuel Surcharge ({rate.fuelSurcharge}%):</span>
                                          <span>{formatCurrency(rate.basePrice * (rate.fuelSurcharge / 100))}</span>
                                        </div>
                                        <div className="flex justify-between font-medium pt-1 border-t">
                                          <span>Total:</span>
                                          <span>{formatCurrency(rate.displayBasePrice || rate.basePrice)}</span>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          )}
                          {visibleColumns.find((col) => col.id === "discount")?.isVisible && (
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                min="0"
                                max="90"
                                step="0.01"
                                value={rate.userDiscount || 0}
                                onChange={e => handleDiscountChange(
                                  rate.id,
                                  rate.service?._id || '',
                                  parseFloat(e.target.value) || 0
                                )}
                                className="w-24 h-8 text-right"
                              />
                            </TableCell>
                          )}
                          {visibleColumns.find((col) => col.id === "finalPrice")?.isVisible && (
                            <TableCell className="text-right font-medium relative group">
                              <div className="flex justify-end">
                                <span className="cursor-help">
                                  {formatCurrency(rate.finalPrice)}
                                </span>
                                <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">ℹ️</span>
                                <div className="absolute z-50 hidden group-hover:block bg-secondary p-2 rounded shadow-lg text-sm w-80 right-full mr-2 top-1/2 -translate-y-1/2">
                                  <p className="font-medium mb-1 border-b pb-1">Final Price Calculation:</p>
                                  <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                      <span>Base Price:</span>
                                      <span>{formatCurrency(rate.basePrice)}</span>
                                    </div>
                                    {includeFuelSurcharge && rate.fuelSurcharge > 0 && (
                                      <div className="flex justify-between text-muted-foreground">
                                        <span>+ Fuel Surcharge ({rate.fuelSurcharge}%):</span>
                                        <span>{formatCurrency(rate.basePrice * (rate.fuelSurcharge / 100))}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between font-medium">
                                      <span>Base Rate:</span>
                                      <span>{formatCurrency(rate.displayBasePrice || rate.basePrice)}</span>
                                    </div>
                                    
                                    {/* Dettaglio del margine e calcolo dello sconto */}
                                    <div className="pt-1 border-t">
                                      <div className="flex justify-between">
                                        <span>Base Margin:</span>
                                        <span>{formatCurrency(rate.actualMargin)}</span>
                                      </div>
                                      {includeFuelSurcharge && rate.fuelSurcharge > 0 && (
                                        <div className="flex justify-between text-amber-600">
                                          <span>+ Extra Margin on Fuel:</span>
                                          <span>{formatCurrency(calculateFuelSurchargeMargin(rate))}</span>
                                        </div>
                                      )}
                                      <div className="flex justify-between font-medium">
                                        <span>Total Margin:</span>
                                        <span>{formatCurrency(getTotalMargin(rate))}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Discount Percentage:</span>
                                        <span>{rate.userDiscount || 0}%</span>
                                      </div>
                                      <div className="flex justify-between text-primary">
                                        <span>- Applied to Base Margin:</span>
                                        <span>-{formatCurrency(rate.actualMargin * ((rate.userDiscount || 0) / 100))}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="flex justify-between font-medium pt-1 border-t">
                                      <span>Final Price = Base Rate - Discount:</span>
                                      <span>{formatCurrency(rate.finalPrice)}</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground text-[10px] italic pt-1">
                                      <span>= {formatCurrency(rate.displayBasePrice || rate.basePrice)} - {formatCurrency(rate.actualMargin * ((rate.userDiscount || 0) / 100))}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          )}
                          {visibleColumns.find((col) => col.id === "margin")?.isVisible && (
                            <TableCell className="text-center relative group">
                              <div className="flex items-center justify-center">
                                <Badge
                                  variant={getMarginColor(
                                    getTotalMargin(rate) - rate.actualMargin * ((rate.userDiscount || 0) / 100),
                                  )}
                                  className="cursor-help"
                                >
                                  {formatCurrency(
                                    getTotalMargin(rate) - rate.actualMargin * ((rate.userDiscount || 0) / 100),
                                  )}{" "}
                                  (
                                  {getMarginLabel(
                                    getTotalMargin(rate) - rate.actualMargin * ((rate.userDiscount || 0) / 100),
                                  )}
                                  )
                                </Badge>
                                <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">ℹ️</span>
                                <div className="absolute z-50 hidden group-hover:block bg-secondary p-2 rounded shadow-lg text-sm w-80 right-full mr-2 top-1/2 -translate-y-1/2">
                                  <p className="font-medium mb-1 border-b pb-1">Margin Calculation:</p>
                                  <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                      <span>Base Price:</span>
                                      <span>{formatCurrency(rate.basePrice)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Purchase Price (cost):</span>
                                      <span>{formatCurrency(rate.purchasePrice || (rate.basePrice - rate.actualMargin))}</span>
                                    </div>
                                    <div className="flex justify-between font-medium">
                                      <span>Base Margin:</span>
                                      <span>{formatCurrency(rate.actualMargin)}</span>
                                    </div>
                                    
                                    <div className="pt-1 border-t">
                                      <div className="flex justify-between">
                                        <span>Discount Percentage:</span>
                                        <span>{rate.userDiscount || 0}%</span>
                                      </div>
                                      <div className="flex justify-between text-primary">
                                        <span>- Applied to Base Margin:</span>
                                        <span>-{formatCurrency(rate.actualMargin * ((rate.userDiscount || 0) / 100))}</span>
                                      </div>
                                    </div>
                                    
                                    {includeFuelSurcharge && rate.fuelSurcharge > 0 && (
                                      <>
                                        <div className="pt-1 border-t">
                                          <div className="flex justify-between text-sm font-medium">
                                            <span>Fuel Margin Calculation:</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Original Retail Price:</span>
                                            <span>{formatCurrency(rate.basePrice)}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Discounted Retail Price:</span>
                                            <span>{formatCurrency(rate.basePrice - rate.actualMargin * ((rate.userDiscount || 0) / 100))}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Fuel on Discounted Retail ({rate.fuelSurcharge}%):</span>
                                            <span>{formatCurrency((rate.basePrice - rate.actualMargin * ((rate.userDiscount || 0) / 100)) * (rate.fuelSurcharge / 100))}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Purchase Price:</span>
                                            <span>{formatCurrency(rate.purchasePrice || (rate.basePrice - rate.actualMargin))}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Fuel on Purchase ({rate.fuelSurcharge}%):</span>
                                            <span>{formatCurrency((rate.purchasePrice || (rate.basePrice - rate.actualMargin)) * (rate.fuelSurcharge / 100))}</span>
                                          </div>
                                          <div className="flex justify-between text-amber-600 font-medium">
                                            <span>Extra Margin on Fuel:</span>
                                            <span>{formatCurrency(calculateFuelSurchargeMargin(rate))}</span>
                                          </div>
                                        </div>
                                      </>
                                    )}
                                    
                                    <div className="flex justify-between font-medium pt-1 border-t">
                                      <span>Total Margin:</span>
                                      <span>{formatCurrency(getTotalMargin(rate))}</span>
                                    </div>
                                    
                                    <div className="flex justify-between font-medium pt-1 border-t">
                                      <span>Final Margin:</span>
                                      <span>{formatCurrency(getTotalMargin(rate) - rate.actualMargin * ((rate.userDiscount || 0) / 100))}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          )}
                          {visibleColumns.find((col) => col.id === "totalMargin")?.isVisible && (
                            <TableCell className="text-center">
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                                {formatCurrency(
                                  (getTotalMargin(rate) - getTotalMargin(rate) * ((rate.userDiscount || 0) / 100)) * 
                                  parseInt(filters.volume || "0", 10)
                                )}
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
                        </TableRow>
                        
                        {/* Riga espansa con tutte le fasce di peso */}
                        {expandedRows[rate.service?._id || ''] && (
                          <TableRow>
                            <TableCell colSpan={visibleColumns.filter(col => col.isVisible).length + 2}>
                              <div className="bg-muted/20 p-4 rounded-md">
                                <h4 className="font-medium mb-3">Weight ranges for {rate.serviceName}</h4>
                                
                                {/* Mostra un indicatore di caricamento se le fasce di peso non sono ancora state caricate */}
                                {!serviceWeightRanges[rate.service?._id || ''] ? (
                                  <div className="flex justify-center py-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                  </div>
                                ) : serviceWeightRanges[rate.service?._id || ''].length === 0 ? (
                                  <p className="text-sm text-muted-foreground">Nessuna fascia di peso disponibile per questo servizio</p>
                                ) : (
                                  <Table className="table-fixed">
                                    <TableHeader className="bg-muted">
                                      <TableRow>
                                        <TableHead className="w-[60px]">Select</TableHead>
                                        {/* Rimuovi colonne duplicate e mostra solo le informazioni essenziali */}
                                        <TableHead className="w-[120px]">Weight Range</TableHead>
                                        <TableHead className="w-[100px] text-right">
                                          {includeFuelSurcharge ? (
                                            <div className="whitespace-normal text-xs">
                                              Base Rate
                                              <br />
                                              <span className="text-xs text-muted-foreground">
                                                (+Fuel {Math.round((rates[0]?.fuelSurcharge || 0) * 10) / 10}%)
                                              </span>
                                            </div>
                                          ) : (
                                            "Base Rate"
                                          )}
                                        </TableHead>
                                        <TableHead className="w-[120px] text-right">Discount (%)</TableHead>
                                        <TableHead className="w-[100px] text-right">Final Price</TableHead>
                                        <TableHead className="w-[120px] text-center">Margin</TableHead>
                                        <TableHead className="w-[130px] text-center">Total Margin</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {serviceWeightRanges[rate.service?._id || ''].map((weightRange) => (
                                        <TableRow key={weightRange.id} className="even:bg-muted/20 hover:bg-muted/40">
                                          {/* Checkbox per la fascia di peso */}
                                          <TableCell>
                                            <Checkbox
                                              checked={!!selectedRows[`${rate.id}-${weightRange.id}`]}
                                              onCheckedChange={(checked) => 
                                                handleRowSelect(`${rate.id}-${weightRange.id}`, !!checked, true, rate.id)
                                              }
                                              aria-label={`Select weight range ${weightRange.label}`}
                                            />
                                          </TableCell>
                                          
                                          {/* Weight Range */}
                                          <TableCell className="font-medium">{weightRange.label}</TableCell>
                                          
                                          {/* Base Rate */}
                                          <TableCell className="text-right relative group">
                                            <div className="flex justify-end">
                                              <span className="cursor-help">
                                                {formatCurrency(weightRange.displayBasePrice || weightRange.basePrice || 0)}
                                              </span>
                                              <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">ℹ️</span>
                                              <div className="absolute z-50 hidden group-hover:block bg-secondary p-2 rounded shadow-lg text-sm w-64 top-0 right-full mr-2">
                                                <p className="font-medium mb-1 border-b pb-1">Base Rate Calculation:</p>
                                                <div className="space-y-1 text-xs">
                                                  <div className="flex justify-between">
                                                    <span>Base Price:</span>
                                                    <span>{formatCurrency(weightRange.basePrice || 0)}</span>
                                                  </div>
                                                  {includeFuelSurcharge && rate.fuelSurcharge > 0 && (
                                                    <>
                                                      <div className="flex justify-between text-muted-foreground">
                                                        <span>+ Fuel Surcharge ({rate.fuelSurcharge}%):</span>
                                                        <span>{formatCurrency((weightRange.basePrice || 0) * (rate.fuelSurcharge / 100))}</span>
                                                      </div>
                                                      <div className="flex justify-between font-medium pt-1 border-t">
                                                        <span>Total:</span>
                                                        <span>{formatCurrency(weightRange.displayBasePrice || weightRange.basePrice || 0)}</span>
                                                      </div>
                                                    </>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          </TableCell>
                                          
                                          {/* Discount - mostra lo stesso sconto della riga principale (solo lettura) */}
                                          <TableCell className="text-right">
                                            <div className="flex items-center justify-end">
                                              <span className="text-center min-w-[60px]">{rate.userDiscount || 0}%</span>
                                            </div>
                                          </TableCell>
                                          
                                          {/* Final Price */}
                                          <TableCell className="text-right font-medium relative group">
                                            <div className="flex justify-end">
                                              <span className="cursor-help">
                                                {formatCurrency(weightRange.finalPrice || 0)}
                                              </span>
                                              <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">ℹ️</span>
                                              <div className="absolute z-50 hidden group-hover:block bg-secondary p-2 rounded shadow-lg text-sm w-80 right-full mr-2 top-1/2 -translate-y-1/2">
                                                <p className="font-medium mb-1 border-b pb-1">Final Price Calculation:</p>
                                                <div className="space-y-1 text-xs">
                                                  <div className="flex justify-between">
                                                    <span>Base Price:</span>
                                                    <span>{formatCurrency(weightRange.basePrice || 0)}</span>
                                                  </div>
                                                  {includeFuelSurcharge && rate.fuelSurcharge > 0 && (
                                                    <div className="flex justify-between text-muted-foreground">
                                                      <span>+ Fuel Surcharge ({rate.fuelSurcharge}%):</span>
                                                      <span>{formatCurrency((weightRange.basePrice || 0) * (rate.fuelSurcharge / 100))}</span>
                                                    </div>
                                                  )}
                                                  <div className="flex justify-between font-medium">
                                                    <span>Base Rate:</span>
                                                    <span>{formatCurrency(weightRange.displayBasePrice || weightRange.basePrice || 0)}</span>
                                                  </div>
                                                  
                                                  {/* Dettaglio del margine e calcolo dello sconto */}
                                                  <div className="pt-1 border-t">
                                                    <div className="flex justify-between">
                                                      <span>Base Margin:</span>
                                                      <span>{formatCurrency(weightRange.actualMargin || 0)}</span>
                                                    </div>
                                                    {includeFuelSurcharge && rate.fuelSurcharge > 0 && (
                                                      <div className="flex justify-between text-amber-600">
                                                        <span>+ Extra Margin on Fuel:</span>
                                                        <span>{formatCurrency(getWeightRangeTotalMargin(weightRange, rate) - (weightRange.actualMargin || 0))}</span>
                                                      </div>
                                                    )}
                                                    <div className="flex justify-between font-medium">
                                                      <span>Total Margin:</span>
                                                      <span>{formatCurrency(getWeightRangeTotalMargin(weightRange, rate))}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                      <span>Discount Percentage:</span>
                                                      <span>{rate.userDiscount || 0}%</span>
                                                    </div>
                                                    <div className="flex justify-between text-primary">
                                                      <span>- Applied to Base Margin:</span>
                                                      <span>-{formatCurrency((weightRange.actualMargin || 0) * ((rate.userDiscount || 0) / 100))}</span>
                                                    </div>
                                                  </div>
                                                  
                                                  <div className="flex justify-between font-medium pt-1 border-t">
                                                    <span>Final Price = Base Rate - Discount:</span>
                                                    <span>{formatCurrency(weightRange.finalPrice || 0)}</span>
                                                  </div>
                                                  <div className="flex justify-between text-muted-foreground text-[10px] italic pt-1">
                                                    <span>= {formatCurrency(weightRange.displayBasePrice || weightRange.basePrice || 0)} - {formatCurrency((weightRange.actualMargin || 0) * ((rate.userDiscount || 0) / 100))}</span>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </TableCell>
                                          
                                          {/* Margin */}
                                          <TableCell className="text-center relative group">
                                            {weightRange.actualMargin !== undefined ? (
                                              <div className="flex items-center justify-center">
                                                <Badge
                                                  variant={getMarginColor(
                                                    getWeightRangeTotalMargin(weightRange, rate) - (weightRange.actualMargin || 0) * ((rate.userDiscount || 0) / 100)
                                                  )}
                                                  className="cursor-help"
                                                >
                                                  {formatCurrency(
                                                    getWeightRangeTotalMargin(weightRange, rate) - (weightRange.actualMargin || 0) * ((rate.userDiscount || 0) / 100)
                                                  )}{" "}
                                                  ({getMarginLabel(
                                                    getWeightRangeTotalMargin(weightRange, rate) - (weightRange.actualMargin || 0) * ((rate.userDiscount || 0) / 100)
                                                  )})
                                                </Badge>
                                                <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">ℹ️</span>
                                                <div className="absolute z-50 hidden group-hover:block bg-secondary p-2 rounded shadow-lg text-sm w-80 right-full mr-2 top-1/2 -translate-y-1/2">
                                                  <p className="font-medium mb-1 border-b pb-1">Margin Calculation:</p>
                                                  <div className="space-y-1 text-xs">
                                                    <div className="flex justify-between">
                                                      <span>Base Price:</span>
                                                      <span>{formatCurrency(weightRange.basePrice || 0)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                      <span>Purchase Price (cost):</span>
                                                      <span>{formatCurrency((weightRange.basePrice || 0) - (weightRange.actualMargin || 0))}</span>
                                                    </div>
                                                    <div className="flex justify-between font-medium">
                                                      <span>Base Margin:</span>
                                                      <span>{formatCurrency(weightRange.actualMargin || 0)}</span>
                                                    </div>
                                                    
                                                    <div className="pt-1 border-t">
                                                      <div className="flex justify-between">
                                                        <span>Discount Percentage:</span>
                                                        <span>{rate.userDiscount || 0}%</span>
                                                      </div>
                                                      <div className="flex justify-between text-primary">
                                                        <span>- Applied to Base Margin:</span>
                                                        <span>-{formatCurrency((weightRange.actualMargin || 0) * ((rate.userDiscount || 0) / 100))}</span>
                                                      </div>
                                                    </div>
                                                    
                                                    {includeFuelSurcharge && rate.fuelSurcharge > 0 && (
                                                      <>
                                                        <div className="pt-1 border-t">
                                                          <div className="flex justify-between text-sm font-medium">
                                                            <span>Fuel Margin Calculation:</span>
                                                          </div>
                                                          <div className="flex justify-between">
                                                            <span>Original Retail Price:</span>
                                                            <span>{formatCurrency(weightRange.basePrice || 0)}</span>
                                                          </div>
                                                          <div className="flex justify-between">
                                                            <span>Discounted Retail Price:</span>
                                                            <span>{formatCurrency((weightRange.basePrice || 0) - (weightRange.actualMargin || 0) * ((rate.userDiscount || 0) / 100))}</span>
                                                          </div>
                                                          <div className="flex justify-between">
                                                            <span>Fuel on Discounted Retail ({rate.fuelSurcharge}%):</span>
                                                            <span>{formatCurrency(((weightRange.basePrice || 0) - (weightRange.actualMargin || 0) * ((rate.userDiscount || 0) / 100)) * (rate.fuelSurcharge / 100))}</span>
                                                          </div>
                                                          <div className="flex justify-between">
                                                            <span>Purchase Price:</span>
                                                            <span>{formatCurrency((weightRange.basePrice || 0) - (weightRange.actualMargin || 0))}</span>
                                                          </div>
                                                          <div className="flex justify-between">
                                                            <span>Fuel on Purchase ({rate.fuelSurcharge}%):</span>
                                                            <span>{formatCurrency(((weightRange.basePrice || 0) - (weightRange.actualMargin || 0)) * (rate.fuelSurcharge / 100))}</span>
                                                          </div>
                                                          <div className="flex justify-between text-amber-600 font-medium">
                                                            <span>Extra Margin on Fuel:</span>
                                                            <span>{formatCurrency(getWeightRangeTotalMargin(weightRange, rate) - (weightRange.actualMargin || 0))}</span>
                                                          </div>
                                                        </div>
                                                      </>
                                                    )}
                                                    
                                                    <div className="flex justify-between font-medium pt-1 border-t">
                                                      <span>Total Margin:</span>
                                                      <span>{formatCurrency(getWeightRangeTotalMargin(weightRange, rate))}</span>
                                                    </div>
                                                    
                                                    <div className="flex justify-between font-medium pt-1 border-t">
                                                      <span>Final Margin:</span>
                                                      <span>{formatCurrency(getWeightRangeTotalMargin(weightRange, rate) - (weightRange.actualMargin || 0) * ((rate.userDiscount || 0) / 100))}</span>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            ) : (
                                              "N/D"
                                            )}
                                          </TableCell>
                                          
                                          {/* Aggiungi la cella per il margine totale */}
                                          <TableCell className="text-center">
                                            {weightRange.actualMargin !== undefined ? (
                                              <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                                                {formatCurrency(
                                                  (getWeightRangeTotalMargin(weightRange, rate) - getWeightRangeTotalMargin(weightRange, rate) * ((rate.userDiscount || 0) / 100)) * 
                                                  parseInt(filters.volume || "0", 10)
                                                )}
                                              </Badge>
                                            ) : (
                                              "N/D"
                                            )}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                )}
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

                    {getVisiblePageNumbers(currentPage, totalPages).map((item, i) => (
                      <UPaginationItem key={i}>
                        {item === 'ellipsis' ? (
                          <span className="px-3 py-2">...</span>
                        ) : (
                          <PaginationLink 
                            isActive={currentPage === item} 
                            onClick={() => setCurrentPage(item as number)}
                          >
                            {item}
                          </PaginationLink>
                        )}
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
          <div className="flex items-center space-x-2">
            {/* Aggiungi il toggle per il fuel surcharge qui, accanto al pulsante columns */}
            <div className="flex items-center space-x-2 mr-4">
              <Switch
                checked={includeFuelSurcharge}
                onCheckedChange={setIncludeFuelSurcharge}
                id="fuel-surcharge-toggle"
              />
              <Label htmlFor="fuel-surcharge-toggle" className="text-sm whitespace-nowrap">
                Include Fuel
              </Label>
            </div>
            
            <Button variant="outline" onClick={() => setColumnsDialogOpen(true)}>
              <Columns className="mr-2 h-4 w-4" />
              Columns
            </Button>
          </div>
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
                  id={`${column.id}-visible`}
                  checked={column.isVisible}
                  onCheckedChange={(checked) => toggleColumnVisibility(column.id, checked)}
                />
                <label htmlFor={`${column.id}-visible`}>{column.name}</label>
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

      {/* Modify the "Add to Cart" banner to show counts correctly and make it more transparent */}
      {hasSelectedItems && (
        <div className="fixed bottom-0 left-0 right-0 bg-primary bg-opacity-70 backdrop-blur-sm text-white p-4 shadow-lg z-50">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5" />
              <span>
                {selectedItemsCount} service(s) selected
                {getSelectedWeightRangesCount() > 0 && 
                  ` (with ${getSelectedWeightRangesCount()} weight ranges)`}
              </span>
            </div>
            <Button 
              variant="secondary" 
              onClick={addSelectedToCart}
              className="bg-white text-primary hover:bg-gray-100"
            >
              Add to Cart
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}