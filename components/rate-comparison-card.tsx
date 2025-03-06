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
import { Filter, RefreshCw, Download, Lightbulb, Info, MoreVertical, X, Columns, ChevronRight, ChevronUp, ChevronDown } from "lucide-react"
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

// Modifica alle colonne visibili per aggiungere la fascia di peso
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
  { id: "delivery", name: "Delivery", isVisible: true },
  { id: "details", name: "Details", isVisible: true },
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
  service?: {
    _id?: string;
    name?: string;
  };
}

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

  // Update the filters state to include country
  const [filters, setFilters] = useState({
    carrierId: "",
    serviceType: "",
    weight: "1",
    volume: "100",
    country: "",
  })

  // Stato per memorizzare le fasce di peso complete per servizio
  const [serviceWeightRanges, setServiceWeightRanges] = useState<{ [serviceId: string]: WeightRange[] }>({});

  // Aggiungi uno stato per tenere traccia delle righe espanse
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})

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
    // Usa le stesse fasce di peso definite in WEIGHT_RANGES
    return WEIGHT_RANGES.map(range => {
      // Base price increases with weight
      const basePrice = 5 + Math.random() * 20 + range.max * 0.5;
      const margin = basePrice * (Math.random() * 0.35); // Random margin up to 35% of base price
      
      return {
        id: `${serviceId}-${range.min}-${range.max}`,
        label: range.label,
        min: range.min,
        max: range.max,
        basePrice: basePrice,
        userDiscount: 0,
        finalPrice: basePrice,
        actualMargin: margin,
        volumeDiscount: Math.round(Math.random() * 15),
        promotionDiscount: Math.round(Math.random() * 10)
      };
    });
  };

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
              weightMin: defaultRange.weightRange.min,
              weightMax: defaultRange.weightRange.max,
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

  // Get margin color based on monetary value
  const getMarginColor = (margin: number) => {
    if (margin >= 10) return "default"
    if (margin >= 5) return "secondary"
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

              return {
                ...weightRange,
                // Aggiorniamo solo userDiscount, non modifichiamo altri parametri di sconto
                userDiscount: clampedDiscount,
                // Recalculate final price come basePrice meno lo sconto sul margine
                finalPrice: weightRange.basePrice - discountAmount,
                // Adjust the margin based on the discount
                adjustedMargin: weightRange.actualMargin - discountAmount,
              };
            })
            : [];

          // Calculate the discount amount for the main rate - applica lo sconto sul margine
          const discountAmount = rate.actualMargin * (clampedDiscount / 100)

          return {
            ...rate,
            userDiscount: clampedDiscount,
            // Recalculate final price come basePrice meno lo sconto sul margine
            finalPrice: rate.basePrice - discountAmount,
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
        serviceType: filters.serviceType,
        volume: filters.volume
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
              return {
                id: `${rate._id}-${range.weightMin}-${range.weightMax}`,
                label: `${range.weightMin}-${range.weightMax} kg`,
                min: range.weightMin,
                max: range.weightMax,
                basePrice: range.retailPrice,
                userDiscount: 0,
                finalPrice: range.retailPrice,
                actualMargin: range.margin || (range.retailPrice - range.purchasePrice),
                volumeDiscount: range.volumeDiscount || 0,
                promotionDiscount: range.promotionDiscount || 0
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
          finalPrice: rate.retailPrice || 0,
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
          service: {
            _id: service._id || rate.service?._id || '',
            name: service.name || rate.serviceName || 'Standard'
          }
        };
        
        return formattedRate;
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
    // Convert 'all' to empty string for API compatibility
    const apiValue = value === 'all' ? '' : value;
    
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
  const handleDiscountChange = useCallback((rateId: string, serviceId: string, newDiscount: number) => {
    // Aggiorna lo sconto per la riga principale
    setRates(prevRates => {
      return prevRates.map(rate => {
        if (rate.id === rateId) {
          // Ensure discount is between 0 and 90%
          const clampedDiscount = Math.max(0, Math.min(90, newDiscount));
          
          // Base rate = prezzo di vendita pieno
          // Margine = valore già calcolato (vendita - acquisto)
          // Lo sconto si applica al margine
          // Final price = base rate - (margine * percentuale sconto / 100)
          
          const baseRate = rate.basePrice; // Prezzo di vendita pieno
          const margin = rate.actualMargin; // Margine originale
          
          // Calcola la riduzione del prezzo dovuta allo sconto sul margine
          const marginDiscount = margin * (clampedDiscount / 100);
          
          // Calcola il nuovo prezzo finale
          const newFinalPrice = baseRate - marginDiscount;
          
          // Calcola il nuovo margine dopo lo sconto
          const newMargin = margin - marginDiscount;
          
          return {
            ...rate,
            userDiscount: clampedDiscount,
            finalPrice: newFinalPrice,
            adjustedMargin: newMargin
          };
        }
        return rate;
      });
    });
    
    // Aggiorna lo sconto per tutte le fasce di peso associate
    if (serviceId) {
      setServiceWeightRanges(prevRanges => {
        // Se non ci sono fasce di peso per questo servizio, non fare nulla
        if (!prevRanges[serviceId]) return prevRanges;
        
        // Ensure discount is between 0 and 90%
        const clampedDiscount = Math.max(0, Math.min(90, newDiscount));
        
        // Crea una nuova copia delle fasce di peso con lo sconto aggiornato
        const updatedRanges = prevRanges[serviceId].map(weightRange => {
          const baseRate = weightRange.basePrice; // Prezzo di vendita pieno
          const margin = weightRange.actualMargin; // Margine originale
          
          // Calcola la riduzione del prezzo dovuta allo sconto sul margine
          const marginDiscount = margin * (clampedDiscount / 100);
          
          // Calcola il nuovo prezzo finale
          const newFinalPrice = baseRate - marginDiscount;
          
          return {
            ...weightRange,
            userDiscount: clampedDiscount,
            finalPrice: newFinalPrice,
            adjustedMargin: margin - marginDiscount
          };
        });
        
        // Restituisci l'oggetto aggiornato
        return {
          ...prevRanges,
          [serviceId]: updatedRanges
        };
      });
    }
  }, []);

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
                    <SelectItem value="all">Tutti i corrieri</SelectItem>
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
                    <SelectItem value="all">Tutti i servizi</SelectItem>
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
                      {/* Aggiungi una colonna per l'espansione */}
                      <TableHead className="w-[50px]"></TableHead>
                      {visibleColumns.find((col) => col.id === "carrier")?.isVisible && <TableHead>Carrier</TableHead>}
                      {visibleColumns.find((col) => col.id === "service")?.isVisible && <TableHead>Service</TableHead>}
                      {(activeTab === "eu" || activeTab === "extra_eu") &&
                        visibleColumns.find((col) => col.id === "country")?.isVisible && <TableHead>Country</TableHead>}
                      {visibleColumns.find((col) => col.id === "weightRange")?.isVisible && (
                        <TableHead>Weight Range</TableHead>
                      )}
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
                        <TableRow key={rate.id} className="hover:bg-muted/50">
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
                              <TableCell>{rate.countryName}</TableCell>
                            )}
                          {visibleColumns.find((col) => col.id === "weightRange")?.isVisible && (
                            <TableCell className="font-medium">
                              {rate.weightMin !== undefined && rate.weightMax !== undefined 
                                ? `${rate.weightMin}-${rate.weightMax} kg` 
                                : (rate.currentWeightRange ? `${rate.currentWeightRange.min}-${rate.currentWeightRange.max} kg` : "N/A")}
                            </TableCell>
                          )}
                          {visibleColumns.find((col) => col.id === "baseRate")?.isVisible && (
                            <TableCell className="text-right">{formatCurrency(rate.basePrice)}</TableCell>
                          )}
                          {visibleColumns.find((col) => col.id === "discount")?.isVisible && (
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={rate.userDiscount || 0}
                                onChange={e => handleDiscountChange(
                                  rate.id,
                                  rate.service?._id || '',
                                  parseFloat(e.target.value) || 0
                                )}
                                className="w-16 h-8"
                              />
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
                            <TableCell className="text-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDetail(rate)}
                              >
                                <Info className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                        
                        {/* Riga espansa con tutte le fasce di peso */}
                        {expandedRows[rate.service?._id || ''] && (
                          <TableRow>
                            <TableCell colSpan={visibleColumns.filter(col => col.isVisible).length + 2}>
                              <div className="bg-muted/20 p-4 rounded-md">
                                <h4 className="font-medium mb-3">Fasce di peso per {rate.serviceName}</h4>
                                
                                {/* Mostra un indicatore di caricamento se le fasce di peso non sono ancora state caricate */}
                                {!serviceWeightRanges[rate.service?._id || ''] ? (
                                  <div className="flex justify-center py-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                  </div>
                                ) : serviceWeightRanges[rate.service?._id || ''].length === 0 ? (
                                  <p className="text-sm text-muted-foreground">Nessuna fascia di peso disponibile per questo servizio</p>
                                ) : (
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Carrier</TableHead>
                                        <TableHead>Service</TableHead>
                                        <TableHead>Weight Range</TableHead>
                                        <TableHead>Base Rate</TableHead>
                                        <TableHead>Discount (%)</TableHead>
                                        <TableHead>Final Price</TableHead>
                                        <TableHead>Margin</TableHead>
                                        <TableHead>Delivery</TableHead>
                                        <TableHead>Details</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {serviceWeightRanges[rate.service?._id || ''].map((weightRange) => (
                                        <TableRow key={weightRange.id}>
                                          {/* Carrier - mostra stesso carrier del servizio principale */}
                                          <TableCell>
                                            <div className="flex items-center gap-2">
                                              <img
                                                src={rate.carrierLogo || '/placeholder.svg'}
                                                alt={rate.carrierName}
                                                className="w-8 h-8 object-contain"
                                              />
                                              <span>{rate.carrierName}</span>
                                            </div>
                                          </TableCell>
                                          
                                          {/* Service - mostra stesso service del servizio principale */}
                                          <TableCell>
                                            <div className="flex flex-col">
                                              <span className="font-medium">{rate.serviceName}</span>
                                              <span className="text-xs text-muted-foreground">{rate.serviceCode}</span>
                                            </div>
                                          </TableCell>
                                          
                                          {/* Weight Range */}
                                          <TableCell className="font-medium">{weightRange.label}</TableCell>
                                          
                                          {/* Base Rate */}
                                          <TableCell>{formatCurrency(weightRange.basePrice || 0)}</TableCell>
                                          
                                          {/* Discount - mostra lo stesso sconto della riga principale (solo lettura) */}
                                          <TableCell>
                                            <div className="flex items-center">
                                              <span className="text-center min-w-16">{rate.userDiscount || 0}%</span>
                                            </div>
                                          </TableCell>
                                          
                                          {/* Final Price */}
                                          <TableCell>{formatCurrency(weightRange.finalPrice || 0)}</TableCell>
                                          
                                          {/* Margin */}
                                          <TableCell>
                                            {weightRange.actualMargin !== undefined ? (
                                              <Badge
                                                variant={getMarginColor(
                                                  weightRange.adjustedMargin !== undefined 
                                                    ? weightRange.adjustedMargin 
                                                    : weightRange.actualMargin - weightRange.actualMargin * ((rate.userDiscount || 0) / 100)
                                                )}
                                              >
                                                {formatCurrency(
                                                  weightRange.adjustedMargin !== undefined 
                                                    ? weightRange.adjustedMargin 
                                                    : weightRange.actualMargin - weightRange.actualMargin * ((rate.userDiscount || 0) / 100)
                                                )}{" "}
                                                ({getMarginLabel(
                                                  weightRange.adjustedMargin !== undefined 
                                                    ? weightRange.adjustedMargin 
                                                    : weightRange.actualMargin - weightRange.actualMargin * ((rate.userDiscount || 0) / 100)
                                                )})
                                              </Badge>
                                            ) : (
                                              "N/D"
                                            )}
                                          </TableCell>
                                          
                                          {/* Delivery - stessi tempi di consegna del servizio principale */}
                                          <TableCell>
                                            {rate.deliveryTimeMin && rate.deliveryTimeMax ? (
                                              `${rate.deliveryTimeMin}-${rate.deliveryTimeMax} giorni`
                                            ) : (
                                              "N/D"
                                            )}
                                          </TableCell>
                                          
                                          {/* Details - pulsante dettagli come nella riga principale */}
                                          <TableCell>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-8 w-8"
                                              onClick={() => {
                                                setSelectedRate({
                                                  ...rate,
                                                  currentWeightRange: weightRange
                                                });
                                                setDetailOpen(true);
                                              }}
                                            >
                                              <Info className="h-4 w-4" />
                                            </Button>
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
    </Card>
  )
}