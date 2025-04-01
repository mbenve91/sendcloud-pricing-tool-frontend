"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react"
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
import { Filter, RefreshCw, Download, Lightbulb, Info, MoreVertical, X, Columns, ChevronRight, ChevronUp, ChevronDown, ShoppingCart, AlertTriangle, AlertCircle, Users, Building, Package, Ship, ArrowDown, ArrowUp } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import * as api from "@/services/api"
import { RateFilters as ApiRateFilters } from '@/services/api'
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
  getMarginLabel,
  hasTollFee,
  getTollFeeText
} from "@/utils/price-calculations";
import RateTableRow from './rate-table-row';
import RateFilters from './rate-filters'; // Aggiungi l'import del nuovo componente
import AdvancedRateFilters, { FilterValue } from '@/components/advanced-rate-filters';
import useFilterPersistence from '@/hooks/useFilterPersistence';
import useRateFilters from '@/hooks/use-persistent-filters';
import { debounce } from "lodash"

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
  tollFee?: number;
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

// Interface for country object
interface CountryObject {
  id: string;
  name: string;
}

// Funzione per formattare i nomi dei paesi
const formatCountryName = (countryCode: string): string => {
  // Mappa dei codici paese ai nomi completi
  const countryNames: Record<string, string> = {
    'fr': 'Francia',
    'de': 'Germania',
    'it': 'Italia',
    'es': 'Spagna',
    'nl': 'Paesi Bassi',
    'be': 'Belgio',
    'at': 'Austria',
    'pt': 'Portogallo',
    'pl': 'Polonia',
    'se': 'Svezia',
    'us': 'Stati Uniti',
    'ca': 'Canada',
    'uk': 'Regno Unito',
    'ch': 'Svizzera',
    'au': 'Australia',
    'jp': 'Giappone',
    'cn': 'Cina',
    'sg': 'Singapore',
    'ae': 'Emirati Arabi Uniti',
    'br': 'Brasile'
  };
  
  // Restituisci il nome del paese se disponibile, altrimenti il codice in maiuscolo
  return countryNames[countryCode.toLowerCase()] || countryCode.toUpperCase();
};

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
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const rowsPerPageOptions = [5, 10, 25, 50, 100]

  // Add state for selected rows
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({})

  // Add state for column customization
  const [columnsDialogOpen, setColumnsDialogOpen] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_VISIBLE_COLUMNS)
  const [loadingStage, setLoadingStage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [includeFuelSurcharge, setIncludeFuelSurcharge] = useState(true)
  const [weightRangesOpen, setWeightRangesOpen] = useState<Record<string, boolean>>({})
  const [expandedServiceRates, setExpandedServiceRates] = useState<Record<string, any[]>>({})
  const [savedFilterSets, setSavedFilterSets] = useState<any[]>([])
  
  // Sostituisci la gestione dei filtri con l'hook persistente
  const [filters, setFilters] = useRateFilters();

  // Stato per memorizzare le fasce di peso complete per servizio
  const [serviceWeightRanges, setServiceWeightRanges] = useState<{ [serviceId: string]: WeightRange[] }>({});

  // Aggiungi uno stato per tenere traccia delle righe espanse
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})

  // Sostituisco lo stato requestToken con un ref
  // const [requestToken, setRequestToken] = useState<string>(Date.now().toString());
  const latestRequestRef = useRef<string>(Date.now().toString());

  // Referenza per AbortController
  const abortControllerRef = useRef<AbortController | null>(null);

  // Flag per rilevare il montaggio iniziale
  const isInitialMountRef = useRef(true);
  
  // Ref per verificare se una richiesta con gli stessi parametri è già stata inviata
  const lastRequestParamsRef = useRef("");
  
  // Referenza per tenere traccia se una richiesta è in corso
  const isLoadingRef = useRef(false);

  const router = useRouter()
  const { toast } = useToast()
  const { addToCart, cartItems, isInCart } = useCart()

  // Modifichiamo la funzione loadServiceWeightRanges
  const loadServiceWeightRanges = useCallback(async (serviceId: string) => {
    if (!serviceId) {
      console.error('ERRORE: ServiceID mancante, impossibile caricare le fasce di peso');
      return [];
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
        const correspondingRate = rates.find(r => r.service?._id === serviceId);
        const fuelSurchargePercentage = correspondingRate?.fuelSurcharge || 0;
        const tollFee = correspondingRate?.tollFee || 0;
        
        const processedWeightRanges = weightRangesData.map((weightRange: WeightRange) => {
          const basePrice = weightRange.basePrice;
          const displayBasePrice = calculateBasePrice(basePrice, fuelSurchargePercentage, includeFuelSurcharge);
          const finalPrice = calculateFinalPrice(
            basePrice, 
            weightRange.actualMargin, 
            weightRange.userDiscount || 0, 
            fuelSurchargePercentage, 
            includeFuelSurcharge,
            tollFee
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
        console.warn(`Nessuna fascia di peso trovata per il servizio ${serviceId}`);
        
        // Ritorniamo un array vuoto invece di generare fasce simulate
        setServiceWeightRanges(prev => ({
          ...prev,
          [serviceId]: []
        }));
        
        return [];
      }
    } catch (error) {
      console.error('Errore nel caricamento delle fasce di peso:', error);
      
      // Ritorniamo un array vuoto invece di generare fasce simulate
      setServiceWeightRanges(prev => ({
        ...prev,
        [serviceId]: []
      }));
      
      return [];
    }
  }, [serviceWeightRanges, rates, includeFuelSurcharge]);

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
    if (activeTab === "international") {
      // Per spedizioni internazionali, ritorniamo una lista manuale di paesi comuni
      return [
        "fr", "de", "it", "es", "nl", "be", "at", "pt", "pl", "se", // EU
        "us", "ca", "uk", "ch", "au", "jp", "cn", "sg", "ae", "br"  // Extra EU
      ];
    }
    
    // Per la tab nazionale, ritorna una lista vuota
    return [];
  }

  // Update the handleTabChange function to reset the country filter when changing tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setCurrentPage(1)
    
    // Reset filters to default
    resetFilters();
    
    // Reset selected rows when changing tabs
    setSelectedRows({})
  }
  
  // Funzione per resettare i filtri
  const resetFilters = () => {
    setFilters({
      sourceCountry: "all",
      carriers: [],
      services: [],
      countries: [],
      weight: "1",
      volume: "100",
      maxPrice: "",
      minMargin: "",
      euType: "all",
      serviceType: "all",
    });
  }

  // Load services when carrier filter changes
  useEffect(() => {
    const loadServices = async () => {
      try {
        // Se abbiamo selezionato un carrier specifico, carichiamo solo i suoi servizi
        if (filters.carriers.length > 0) {
          const servicesData = await api.getServices(filters.carriers[0]);
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
  }, [filters.carriers.length, carriers.length]);

  // Modifica alla funzione loadRatesImpl per prevenire richieste duplicate
  const loadRatesImpl = useCallback(async () => {
    // Ottieni una stringa che rappresenta i parametri della richiesta
    const apiFilters: ApiRateFilters = {
      destinationType: activeTab,
      weight: filters.weight?.toString() || "1",
      volume: filters.volume?.toString() || "100",
    };
    
    if (typeof filters.sourceCountry === 'string' && filters.sourceCountry !== "all") {
      apiFilters.sourceCountry = filters.sourceCountry;
    }
    
    if (Array.isArray(filters.carriers) && filters.carriers.length > 0) {
      apiFilters.carriers = filters.carriers.map(c => c.toString());
    }
    
    if (Array.isArray(filters.services) && filters.services.length > 0) {
      apiFilters.services = filters.services.map(s => s.toString());
    }
    
    if (Array.isArray(filters.countries) && filters.countries.length > 0) {
      apiFilters.countries = filters.countries.map(c => c.toString());
    }
    
    if (typeof filters.euType === 'string' && filters.euType !== "all") {
      apiFilters.euType = filters.euType;
    }
    
    if (filters.minMargin) apiFilters.minMargin = filters.minMargin.toString();
    if (filters.maxPrice) apiFilters.maxPrice = filters.maxPrice.toString();
    if (typeof filters.serviceType === 'string' && filters.serviceType !== "all") {
      apiFilters.serviceType = filters.serviceType;
    }
    
    // Crea una stringa che rappresenta i parametri della richiesta
    const requestParamsString = JSON.stringify(apiFilters);
    
    // Se la richiesta con gli stessi parametri è già stata inviata, non fare nulla
    if (lastRequestParamsRef.current === requestParamsString && !isInitialMountRef.current) {
      console.log('Richiesta con stessi parametri già inviata, salto la chiamata API');
      return;
    }
    
    // Se c'è già una richiesta in corso, non fare nulla
    if (isLoadingRef.current && !isInitialMountRef.current) {
      console.log('Richiesta già in corso, salto la chiamata API');
      return;
    }
    
    // Aggiorna lo stato di caricamento
    isLoadingRef.current = true;
    setLoading(true);
    
    // Salva i parametri della richiesta
    lastRequestParamsRef.current = requestParamsString;
    
    // Genera un nuovo token
    const currentRequestToken = Date.now().toString();
    latestRequestRef.current = currentRequestToken;
    
    // Annulla le richieste precedenti
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Crea un nuovo controller
    abortControllerRef.current = new AbortController();
    
    setError(null);
    setLoadingStage("Caricamento tariffe...");
    
    try {
      // Carica corrieri se necessario
      if (carriers.length === 0) {
        setLoadingStage("Caricamento corrieri...");
        const carriersData = await api.getCarriers();
        setCarriers(carriersData);
      }
      
      // Carica servizi se necessario
      if (services.length === 0) {
        setLoadingStage("Caricamento servizi...");
        const servicesData = await api.getServices();
        setServices(servicesData);
      }
      
      // Effettua la chiamata API
      setLoadingStage("Ricerca tariffe in corso...");
      
      console.log('API call con parametri:', requestParamsString);
      
      // @ts-ignore - Ignoriamo temporaneamente l'errore di typescript per il signal
      const ratesData = await api.compareRates(apiFilters, abortControllerRef.current.signal);
      
      // Verifica se il token è ancora valido
      if (currentRequestToken !== latestRequestRef.current) {
        console.log('Richiesta obsoleta ignorata, token non corrispondente');
        return;
      }
      
      // Formatta i dati e aggiorna lo stato
      // ... existing code che formatta i dati ...
      const formattedRates = ratesData.map((rate: any) => {
        // Find service details
        const service = rate.service || services.find(s => s._id === rate.service) || {};
        
        // Find carrier details
        const carrierId = typeof service.carrier === 'object' ? service.carrier._id : service.carrier;
        const carrier = carriers.find(c => c._id === carrierId);
        
        // Calculate fuel surcharge amount (when enabled)
        const fuelSurchargePercentage = carrier?.fuelSurcharge || 0;
        const tollFee = carrier?.tollFee || 0;
        
        // Base price without fuel surcharge
        const basePrice = rate.retailPrice || 0;
        const purchasePrice = rate.purchasePrice || 0;
        
        // Calculate margins
        const margin = rate.margin || (basePrice - purchasePrice);
        
        // Calculate display price (with or without fuel surcharge)
        const displayBasePrice = includeFuelSurcharge ? 
          basePrice * (1 + fuelSurchargePercentage / 100) : 
          basePrice;
          
        // Calcola prezzo finale
        const finalPrice = calculateFinalPrice(
          basePrice,
          rate.marginPercentage || 0,
          rate.userDiscount || 0,
          fuelSurchargePercentage,
          includeFuelSurcharge,
          tollFee
        );
        
        // Country name
        let countryCode = '';
        if (service.destinationCountry) {
          if (Array.isArray(service.destinationCountry) && service.destinationCountry.length > 0) {
            countryCode = service.destinationCountry[0];
          } else if (typeof service.destinationCountry === 'string') {
            countryCode = service.destinationCountry;
          }
        }
        
        return {
          id: rate._id || `rate-${Math.random().toString(36).substring(2, 11)}`,
          carrierId: carrierId || 'unknown',
          carrierName: carrier?.name || 'Sconosciuto',
          carrierLogo: carrier?.logoUrl || '',
          serviceCode: service.code || 'N/A',
          serviceName: service.name || 'Standard',
          serviceDescription: service.description || '',
          deliveryTimeMin: service.deliveryTimeMin || null,
          deliveryTimeMax: service.deliveryTimeMax || null,
          countryName: countryCode ? formatCountryName(countryCode) : '',
          basePrice: rate.retailPrice || 0,
          userDiscount: rate.userDiscount || 0,
          finalPrice: finalPrice,
          actualMargin: margin,
          marginPercentage: rate.marginPercentage || 0,
          fuelSurcharge: fuelSurchargePercentage,
          volumeDiscount: rate.volumeDiscount || 0,
          promotionDiscount: rate.promotionDiscount || 0,
          totalBasePrice: rate.totalBasePrice || rate.retailPrice || 0,
          weightRanges: [],
          currentWeightRange: undefined,
          retailPrice: basePrice,
          purchasePrice: purchasePrice,
          margin: margin,
          weightMin: rate.weightMin || 0,
          weightMax: rate.weightMax || 0,
          displayBasePrice: displayBasePrice,
          service: {
            _id: service._id || rate.service?._id || '',
            name: service.name || rate.serviceName || 'Standard'
          },
          tollFee: rate.tollFee || 0
        };
      });
      
      // Applica il filtro per prezzo massimo se necessario
      const filteredWithMaxPrice = filters.maxPrice ? applyMaxPriceFilter(formattedRates) : formattedRates;
      
      setRates(filteredWithMaxPrice);
      
      // Per le suggestioni, per ora lasciamo quelle simulate (potrebbero essere gestite separatamente)
      const newSuggestions = generateMockSuggestions(activeTab, filters);
      setSuggestions(newSuggestions);
    } catch (error: unknown) {
      // Ignora errori causati dall'abort
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Richiesta annullata intenzionalmente');
        return;
      }
      
      // Gestione degli errori come prima
      if (currentRequestToken !== latestRequestRef.current) {
        console.log('Errore da richiesta obsoleta ignorato');
        return;
      }
      
      console.error('Errore durante il caricamento delle tariffe:', error);
      setError(error instanceof Error ? error.message : "Si è verificato un errore sconosciuto");
      
      setRates([]);
      setSuggestions([]);
    } finally {
      // Fine del caricamento
      if (currentRequestToken === latestRequestRef.current) {
        setLoading(false);
      }
      isLoadingRef.current = false;
      setLoadingStage("");
    }
  }, [activeTab, filters, carriers, services, includeFuelSurcharge, generateMockSuggestions]);

  // Versione debounced della funzione loadRates con tempo aumentato
  const loadRates = useMemo(() => 
    debounce(() => {
      console.log('Chiamata API debounced in esecuzione');
      loadRatesImpl();
    }, 800), // Aumentato a 800ms per maggiore stabilità
    [loadRatesImpl]
  );

  // Effetto per il caricamento iniziale - solo al primo montaggio
  useEffect(() => {
    // Carica i filtri salvati se presenti
    try {
      if (typeof window !== 'undefined') {
        const savedFilterSetsJson = localStorage.getItem('saved-filter-sets');
        if (savedFilterSetsJson) {
          const parsedSets = JSON.parse(savedFilterSetsJson);
          setSavedFilterSets(parsedSets);
        }
      }
    } catch (error) {
      console.error('Errore nel caricamento dei filtri salvati:', error);
    }
    
    // Carica le tariffe solo al primo montaggio - usando direttamente loadRatesImpl
    if (isInitialMountRef.current) {
      console.log('Caricamento iniziale dei dati - chiamata diretta');
      loadRatesImpl(); // Chiamata diretta bypassando il debounce
      isInitialMountRef.current = false;
    }
  }, []); // Nessuna dipendenza, eseguito solo al montaggio

  // Effetto per gestire le modifiche ai filtri - molto più semplice ora
  useEffect(() => {
    if (!isInitialMountRef.current) {
      // Usa la versione debounced per gli aggiornamenti
      loadRates();
    }
  }, [activeTab, filters]); // Rimosso loadRates dalle dipendenze

  // Aggiorna la funzione di gestione dei cambiamenti nei filtri
  const handleFilterChange = (name: string, value: any) => {
    // Aggiorna lo stato dei filtri
    setFilters({ [name]: value });
    
    // Reset to page 1 when filters change
    setCurrentPage(1);
    
    // Filtri che richiedono richieste al server
    const serverSideFilters = [
      'carriers', 'services', 'countries', 'sourceCountry',
      'weight', 'euType', 'serviceType', 'minMargin'
    ];
    
    // Se è cambiato un filtro che richiede una nuova richiesta al server
    if (serverSideFilters.includes(name)) {
      // Ricarica le tariffe dal server
      loadRates();
    } 
    // Se è cambiato maxPrice, applica il filtro lato client
    else if (name === 'maxPrice' && rates.length > 0) {
      // Creiamo un nuovo oggetto filtri con il valore aggiornato
      const updatedFilters = { ...filters, [name]: value };
      
      // Applica i filtri client-side
      if (value && parseFloat(value) > 0) {
        // Utilizziamo la funzione applyMaxPriceFilter
        setRates(prev => applyMaxPriceFilter([...prev]));
      } else if (name === 'maxPrice') {
        // Se maxPrice è stato rimosso o impostato a 0, ricarica i dati
        loadRates();
      }
    }
  };

  // Funzione per gestire il salvataggio di un set di filtri
  const handleSaveFilterSet = (name: string, filterData: any) => {
    // Create a new filter set object
    const newFilterSet = {
      id: `filter-${Date.now()}`,
      name,
      filters: { ...filterData },
      isDefault: false,
      dateCreated: new Date().toISOString()
    };
    
    // Add to saved filter sets
    setSavedFilterSets(prev => [newFilterSet, ...prev]);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        const savedSets = localStorage.getItem('saved-filter-sets');
        const parsedSets = savedSets ? JSON.parse(savedSets) : [];
        localStorage.setItem('saved-filter-sets', JSON.stringify([newFilterSet, ...parsedSets]));
      } catch (error) {
        console.error('Errore nel salvataggio del set di filtri:', error);
      }
    }
  };
  
  // Funzione per caricare un set di filtri salvato
  const handleLoadFilterSet = (filterSet: any) => {
    if (filterSet && filterSet.filters) {
      setFilters(filterSet.filters);
    }
  };

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
  
  // Assicuriamoci che currentPage sia valido dopo un cambio di rowsPerPage
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(rates.length / rowsPerPage));
    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [rowsPerPage, rates.length, currentPage]);

  // Funzione per gestire il cambio del numero di risultati per pagina
  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(Number(value));
    setCurrentPage(1); // Torna alla prima pagina quando cambia il numero di righe
  };

  // Check if all displayed rows are selected
  const areAllRowsSelected = displayedRates.length > 0 && displayedRates.every((rate) => selectedRows[rate.id])

  // Funzione per gestire l'espansione/collasso di una riga
  const toggleRowExpansion = useCallback(async (rateId: string) => {
    setExpandedRows(prev => {
      const newState = { ...prev };
      
      // Inverti lo stato di espansione
      newState[rateId] = !newState[rateId];
      
      // Se la riga viene espansa, carica le fasce di peso
      if (newState[rateId]) {
        // Trova la tariffa corrispondente
        const rate = rates.find(r => r.id === rateId);
        
        if (rate && rate.service && rate.service._id) {
          console.log(`Espansione tariffa ID: ${rateId}, Service ID: ${rate.service._id}`);
          // Carica le fasce di peso per questo servizio
          loadServiceWeightRanges(rate.service._id);
        } else {
          console.error(`ERRORE: Impossibile caricare le fasce di peso. Rate.service._id mancante per la tariffa ${rateId}`);
          console.log('Dettagli tariffa:', rate);
        }
      }
      
      return newState;
    });
  }, [rates, loadServiceWeightRanges]);

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
      const basePrice = rate.basePrice;
      const purchasePrice = rate.purchasePrice || (basePrice - rate.actualMargin);
      const margin = basePrice - purchasePrice;
      
      // Calcola il prezzo base visualizzato (con fuel surcharge se abilitato)
      const displayedBasePrice = rate.displayBasePrice || basePrice;
      
      // Calcola il prezzo più basso possibile con lo sconto massimo del 90%
      // Considerando che lo sconto si applica solo al margine
      const maxDiscount = margin * 0.9; // 90% del margine
      const minPossiblePrice = displayedBasePrice - maxDiscount;
      
      // Mantieni la tariffa solo se può raggiungere il prezzo massimo con uno sconto ≤ 90%
      return minPossiblePrice <= maxPrice;
    });
    
    // Ora per ogni tariffa filtrata, calcoliamo lo sconto percentuale necessario
    return filteredRates.map(rate => {
      const basePrice = rate.basePrice;
      const purchasePrice = rate.purchasePrice || (basePrice - rate.actualMargin);
      const margin = basePrice - purchasePrice;
      const displayedBasePrice = rate.displayBasePrice || basePrice;
      
      // Se il prezzo base (con fuel) è già <= al prezzo massimo, mantieni lo sconto a 0
      if (displayedBasePrice <= maxPrice) {
        return {
          ...rate,
          userDiscount: 0,
          finalPrice: displayedBasePrice
        };
      }
      
      // Calcola lo sconto necessario per raggiungere esattamente il prezzo massimo
      // Formula: displayedBasePrice - (margin * discountPercentage/100) = maxPrice
      // Risolviamo per discountPercentage: discountPercentage = (displayedBasePrice - maxPrice) / margin * 100
      const priceDifference = displayedBasePrice - maxPrice;
      
      // Calcola la percentuale di sconto necessaria (arrotondata all'intero)
      let discountPercentage = Math.min(90, Math.round((priceDifference / margin) * 100));
      
      // Assicurati che sia almeno 0
      discountPercentage = Math.max(0, discountPercentage);
      
      // Calcola il nuovo prezzo finale con lo sconto determinato
      const discountAmount = margin * (discountPercentage / 100);
      const finalPrice = displayedBasePrice - discountAmount;
      
      // Aggiorna solo lo sconto e il prezzo finale, non modificare altri valori
      return {
        ...rate,
        userDiscount: discountPercentage,
        finalPrice: finalPrice
      };
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

  // Funzione per gestire l'aggiunta delle tariffe selezionate al carrello
  const handleAddToCart = () => {
    // Trova le tariffe selezionate
    const selectedRateIds = Object.entries(selectedRows)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => id);
    
    if (selectedRateIds.length === 0) return;
    
    // Per ogni tariffa selezionata
    selectedRateIds.forEach(id => {
      // Controllo se è una fascia di peso (formato: 'rateId-weightRangeId')
      const isWeightRange = id.includes('-');
      
      if (isWeightRange) {
        const [parentId, weightRangeId] = id.split('-');
        const parentRate = rates.find(r => r.id === parentId);
        const serviceId = parentRate?.service?._id;
        
        if (parentRate && serviceId && serviceWeightRanges[serviceId]) {
          const weightRange = serviceWeightRanges[serviceId].find(wr => wr.id === weightRangeId);
          
          if (weightRange) {
            // Ottieni la percentuale del fuel surcharge dal carrier
            const fuelSurchargePercentage = parentRate.fuelSurcharge !== undefined 
              ? parentRate.fuelSurcharge 
              : 8; // default 8% se non specificato
              
            // Prezzo d'acquisto (dal weight range)
            const purchasePrice = (weightRange.basePrice || 0) - weightRange.actualMargin;
            
            // Calcola il margine
            const baseMargin = weightRange.actualMargin || 0;
            const discountOnMargin = baseMargin * (parentRate.userDiscount || 0) / 100;
            
            // Prezzo scontato = prezzo d'acquisto + margine scontato
            const discountedPrice = purchasePrice + (baseMargin - discountOnMargin);
            
            // Prezzo finale prima del supplemento pedaggio
            let finalPrice = discountedPrice;
            
            // Aggiungi il fuel surcharge se abilitato
            if (includeFuelSurcharge && fuelSurchargePercentage > 0) {
              finalPrice += discountedPrice * fuelSurchargePercentage / 100;
            }
            
            // Ottieni il supplemento pedaggio (tollFee)
            const tollFee = parentRate.tollFee || 0;
            
            // Aggiungi il supplemento pedaggio per GLS o altri vettori
            if (parentRate.carrierName === 'GLS') {
              // Per GLS aggiungiamo sempre il supplemento fisso di 0.05€
              finalPrice += 0.05;
            } else if (tollFee > 0) {
              // Per altri vettori usiamo il tollFee se presente
              finalPrice += tollFee;
            }
            
            // Crea un oggetto tariffa specifico per questa fascia di peso
            const weightRangeRate = {
              ...parentRate,
              id: id, // Usa l'ID composto
              weightMin: weightRange.min,
              weightMax: weightRange.max,
              basePrice: weightRange.basePrice,
              userDiscount: parentRate.userDiscount || 0, // Usa lo sconto del genitore
              finalPrice: finalPrice, // Usa il prezzo finale calcolato
              actualMargin: weightRange.actualMargin,
              isWeightRange: true,
              parentRateId: parentId
            };
            
            // Debug - verifica che il supplemento pedaggio GLS sia applicato
            if (parentRate.carrierName === 'GLS') {
              console.log(`GLS Weight Range: Prezzo finale con supplemento pedaggio: ${finalPrice.toFixed(2)}€ (Include 0.05€ di pedaggio)`);
            }
            
            // Aggiungi al carrello se non è già presente
            if (!isInCart(id)) {
              addToCart(weightRangeRate);
            }
          }
        }
      } else {
        // È una tariffa normale
        const rate = rates.find(r => r.id === id);
        if (rate && !isInCart(id)) {
          addToCart(rate);
        }
      }
    });
    
    // Mostra la notifica
    toast({
      title: "Tariffe aggiunte al carrello!",
      description: (
        <div>
          Le tariffe selezionate sono state aggiunte al carrello.{" "}
          <span
            className="underline cursor-pointer text-primary"
            onClick={() => router.push("/cart")}
          >
            Clicca qui per visualizzare il carrello
          </span>
        </div>
      ),
      variant: "default"
    });
    
    // Deseleziona tutte le righe
    setSelectedRows({});
  };

  // Calcola il numero di righe selezionate
  const getSelectedRowsCount = () => {
    return Object.values(selectedRows).filter(Boolean).length;
  };

  // Manteniamo solo questa definizione di hasSelectedItems
  const hasSelectedItems = Object.values(selectedRows).some(isSelected => isSelected);

  // Aggiungi un effect per ricalcolare i prezzi quando il toggle cambia
  useEffect(() => {
    if (rates.length === 0) return;
    
    // Aggiorna le tariffe principali usando una funzione callback
    // che non ha bisogno di accedere al valore attuale di rates
    setRates(prevRates => 
      prevRates.map(rate => {
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
      })
    );
    
    // Aggiorna anche le fasce di peso in modo similare
    // Qui usiamo tutte funzioni callback per evitare dipendenze circolari
    setServiceWeightRanges(prevWeightRanges => {
      const updatedWeightRanges = { ...prevWeightRanges };
      
      Object.keys(prevWeightRanges).forEach(serviceId => {
        // Troviamo la tariffa corrispondente a questo serviceId
        const matchingRate = rates.find(r => r.service?._id === serviceId);
        if (!matchingRate) return;
        
        // Aggiorniamo tutte le fasce di peso per questo servizio
        updatedWeightRanges[serviceId] = prevWeightRanges[serviceId].map(weightRange => {
          const displayBasePrice = calculateBasePrice(
            weightRange.basePrice, 
            matchingRate.fuelSurcharge, 
            includeFuelSurcharge
          );
          
          const finalPrice = calculateFinalPrice(
            weightRange.basePrice,
            weightRange.actualMargin,
            matchingRate.userDiscount || 0,
            matchingRate.fuelSurcharge,
            includeFuelSurcharge
          );
          
          return {
            ...weightRange,
            finalPrice,
            displayBasePrice
          };
        });
      });
      
      return updatedWeightRanges;
    });
  }, [includeFuelSurcharge]); // Rimuoviamo rates e serviceWeightRanges dalle dipendenze

  // Add this function to generate page numbers with ellipsis
  const getVisiblePageNumbers = (currentPage: number, totalPages: number) => {
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
  };

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
    let elements = [];

    // Aggiungi il testo del fuel surcharge se presente
    if (includeFuelSurcharge && rate.fuelSurcharge && rate.fuelSurcharge > 0) {
      // Calcolo lo sconto applicato al margine
      const discountPercentage = rate.userDiscount || 0;
      const discountAmount = calculateDiscountAmount(rate.actualMargin, discountPercentage);
      
      // Il prezzo di vendita dopo lo sconto
      const discountedRetailPrice = rate.basePrice - discountAmount;
      
      // Calcolo il fuel surcharge sul prezzo di vendita scontato
      const fuelSurchargeAmount = discountedRetailPrice * (rate.fuelSurcharge / 100);
      
      elements.push(
        <div key="fuel" className="text-sm text-muted-foreground">
          Fuel Surcharge: {rate.fuelSurcharge}% 
          ({formatCurrency(fuelSurchargeAmount)})
        </div>
      );
    }
    
    // Aggiungi il testo del supplemento pedaggio se presente
    if (rate.tollFee && rate.tollFee > 0) {
      elements.push(
        <div key="toll" className="text-sm text-muted-foreground">
          Supplemento pedaggio: {formatCurrency(rate.tollFee)}
        </div>
      );
    }
    
    // Se non ci sono elementi, restituisci null
    if (elements.length === 0) {
      return null;
    }
    
    // Altrimenti, restituisci gli elementi
    return <>{elements}</>;
  };

  // Funzione per cambiare l'ordinamento
  const requestSort = (key: string) => {
    setFilters((prev) => ({
      ...prev,
      sort: {
        key,
        direction: prev.sort?.direction === 'ascending' ? 'descending' : 'ascending'
      }
    }));
  };

  // Icona per indicare l'ordinamento
  const getSortIcon = (key: string) => {
    if (filters.sort?.key !== key) {
      return null;
    }
    return filters.sort?.direction === 'ascending' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };

  // Rate ordinate in base al sortConfig
  const sortedRates = useMemo(() => {
    // Utilizziamo solo le tariffe già filtrate per la pagina corrente
    const ratesToSort = displayedRates;
    
    if (!filters.sort?.key || !filters.sort?.direction) {
      return ratesToSort;
    }

    return [...ratesToSort].sort((a, b) => {
      // Gestire i casi specifici come prezzo e margine in modo numerico
      if (filters.sort?.key === 'finalPrice' || filters.sort?.key === 'basePrice' || 
          filters.sort?.key === 'actualMargin' || filters.sort?.key === 'marginPercentage') {
        return filters.sort?.direction === 'ascending'
          ? (a[filters.sort?.key] as number) - (b[filters.sort?.key] as number)
          : (b[filters.sort?.key] as number) - (a[filters.sort?.key] as number);
      }
      
      // Per campi di testo, confronto di stringhe
      const aValue = String(a[filters.sort?.key as keyof typeof a] || '');
      const bValue = String(b[filters.sort?.key as keyof typeof b] || '');
      
      if (filters.sort?.direction === 'ascending') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }, [displayedRates, filters.sort?.key, filters.sort?.direction]);

  // Funzione per aprire il dialog delle colonne
  const openColumnsDialog = () => {
    setColumnsDialogOpen(true);
  };

  return (
    <div className="w-full">
      <Card className="w-full shadow-md">
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
                Sendquote
              </CardTitle>
            </div>
            
            {/* Aggiungi icona del carrello */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/cart")}
              className="relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Button>
          </div>
          
          <CardDescription>
            {sortedRates.length} shipping rates from {CARRIERS.length} carriers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="national" value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-4">
              <TabsTrigger value="national">National</TabsTrigger>
              <TabsTrigger value="international">International</TabsTrigger>
            </TabsList>

            {/* Tab contenuto per spedizioni nazionali e internazionali */}
            <TabsContent value={activeTab} className="space-y-4">
              {/* Componente Advanced Rate Filters */}
              <div className="mb-5 mt-2">
                <AdvancedRateFilters
                  filters={filters as any}
                  onFilterChange={handleFilterChange}
                  onFilterReset={resetFilters}
                  carriers={carriers}
                  services={services}
                  activeTab={activeTab}
                  countryList={getCountryList()}
                  onColumnsDialogOpen={() => setColumnsDialogOpen(true)}
                  includeFuelSurcharge={includeFuelSurcharge}
                  onFuelSurchargeChange={setIncludeFuelSurcharge}
                  onSaveFilterSet={handleSaveFilterSet}
                  onLoadFilterSet={handleLoadFilterSet}
                  savedFilterSets={savedFilterSets}
                />
              </div>
              
              {/* Visualizzazione condizionale basata sullo stato */}
              {loading ? (
                <LoadingIndicator stage={loadingStage} />
              ) : error ? (
                <ErrorDisplay message={error} onRetry={loadRates} />
              ) : rates.length === 0 ? (
                <Card className="flex flex-col items-center justify-center p-8 border-dashed border-2">
                  <div className="flex flex-col items-center text-center mb-4">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold">No rates found</h3>
                    <p className="text-muted-foreground mt-1">
                      Try changing your filters or contact support to check availability.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={resetFilters}>
                      Reset filters
                    </Button>
                    <Button onClick={loadRates}>
                      Try again
                    </Button>
                  </div>
                </Card>
              ) : (
                // Tabella dei risultati
                <div className="rounded-md border overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader className="bg-gradient-to-b from-slate-700/95 to-slate-600/90">
                      <TableRow className="border-b-0 hover:bg-transparent">
                        <TableHead className="w-10 text-white text-center"></TableHead>
                        <TableHead className="w-10 text-white text-center"></TableHead>
                        
                        {/* Intestazioni colonne con ordinamento */}
                        {visibleColumns.find((col) => col.id === "carrier")?.isVisible && (
                          <TableHead 
                            className="w-[150px] cursor-pointer hover:bg-slate-600 text-white"
                            onClick={() => requestSort('carrierName')}
                          >
                            <div className="flex items-center justify-between">
                              <span>Carrier</span>
                              {getSortIcon('carrierName')}
                            </div>
                          </TableHead>
                        )}
                        
                        {visibleColumns.find((col) => col.id === "service")?.isVisible && (
                          <TableHead 
                            className="w-[200px] cursor-pointer hover:bg-slate-600 text-white"
                            onClick={() => requestSort('serviceName')}
                          >
                            <div className="flex items-center justify-between">
                              <span>Service</span>
                              {getSortIcon('serviceName')}
                            </div>
                          </TableHead>
                        )}
                        
                        {visibleColumns.find((col) => col.id === "country")?.isVisible && (
                          <TableHead
                            className="cursor-pointer hover:bg-slate-600 text-white"
                            onClick={() => requestSort('countryName')}
                          >
                            <div className="flex items-center justify-between">
                              <span>Country</span>
                              {getSortIcon('countryName')}
                            </div>
                          </TableHead>
                        )}
                        
                        {visibleColumns.find((col) => col.id === "baseRate")?.isVisible && (
                          <TableHead 
                            className="text-center cursor-pointer hover:bg-slate-600 text-white"
                            onClick={() => requestSort('basePrice')}
                          >
                            <div className="flex items-center justify-center">
                              <span>Base Price</span>
                              {getSortIcon('basePrice')}
                            </div>
                          </TableHead>
                        )}
                        
                        {visibleColumns.find((col) => col.id === "discount")?.isVisible && (
                          <TableHead 
                            className="w-24 text-right text-white cursor-pointer hover:bg-slate-600"
                            onClick={() => requestSort('userDiscount')}
                          >
                            <div className="flex items-center justify-end">
                              <span>Discount</span>
                              {getSortIcon('userDiscount')}
                            </div>
                          </TableHead>
                        )}
                        
                        {visibleColumns.find((col) => col.id === "finalPrice")?.isVisible && (
                          <TableHead 
                            className="text-center cursor-pointer hover:bg-slate-600 text-white"
                            onClick={() => requestSort('finalPrice')}
                          >
                            <div className="flex items-center justify-center">
                              <span>Final Price</span>
                              {getSortIcon('finalPrice')}
                            </div>
                          </TableHead>
                        )}
                        
                        {visibleColumns.find((col) => col.id === "margin")?.isVisible && (
                          <TableHead 
                            className="text-center cursor-pointer hover:bg-slate-600 text-white"
                            onClick={() => requestSort('actualMargin')}
                          >
                            <div className="flex items-center justify-center">
                              <span>Margin</span>
                              {getSortIcon('actualMargin')}
                            </div>
                          </TableHead>
                        )}
                        
                        {visibleColumns.find((col) => col.id === "delivery")?.isVisible && (
                          <TableHead className="text-center text-white">
                            <div className="flex items-center justify-center">
                              <span>Delivery</span>
                            </div>
                          </TableHead>
                        )}
                        
                        {visibleColumns.find((col) => col.id === "details")?.isVisible && (
                          <TableHead className="text-center text-white">
                            <div className="flex items-center justify-center">
                              <span>Details</span>
                            </div>
                          </TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100">
                      {loading && rates.length === 0 ? (
                        <TableRow>
                          <TableCell 
                            colSpan={Object.values(visibleColumns).filter(col => col.isVisible).length + 2}
                            className="h-24 text-center"
                          >
                            <LoadingIndicator stage={loadingStage} />
                          </TableCell>
                        </TableRow>
                      ) : error ? (
                        <TableRow>
                          <TableCell 
                            colSpan={Object.values(visibleColumns).filter(col => col.isVisible).length + 2}
                            className="h-24 text-center"
                          >
                            <ErrorDisplay message={error} onRetry={loadRates} />
                          </TableCell>
                        </TableRow>
                      ) : sortedRates.length === 0 ? (
                        <TableRow>
                          <TableCell 
                            colSpan={Object.values(visibleColumns).filter(col => col.isVisible).length + 2}
                            className="h-24 text-center text-muted-foreground"
                          >
                            No results found. Try changing your filters.
                          </TableCell>
                        </TableRow>
                      ) : (
                        sortedRates.map((rate) => (
                          <RateTableRow
                            key={rate.id}
                            rate={rate}
                            selectedRows={selectedRows}
                            expandedRows={expandedRows}
                            visibleColumns={visibleColumns}
                            handleRowSelect={handleRowSelect}
                            toggleRowExpansion={toggleRowExpansion}
                            handleDiscountChange={handleDiscountChange}
                            includeFuelSurcharge={includeFuelSurcharge}
                            filters={filters}
                            getFuelSurchargeText={getFuelSurchargeText}
                            serviceWeightRanges={serviceWeightRanges}
                          />
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              {/* UI per la paginazione */}
              {rates.length > 0 && (
                <div className="flex flex-col gap-4 mt-4 pb-2">
                  <div className="flex justify-center items-center gap-4">
                    <Select 
                      value={String(rowsPerPage)} 
                      onValueChange={handleRowsPerPageChange}
                    >
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue>{rowsPerPage}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {rowsPerPageOptions.map(option => (
                          <SelectItem key={option} value={String(option)}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  
                    {totalPages > 1 && (
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              aria-disabled={currentPage === 1}
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>
                          
                          {getVisiblePageNumbers(currentPage, totalPages).map((pageNum, idx) => (
                            <PaginationItem key={idx}>
                              {pageNum === 'ellipsis' ? (
                                <span className="px-4 py-2">...</span>
                              ) : (
                                <PaginationLink
                                  onClick={() => setCurrentPage(pageNum as number)}
                                  isActive={currentPage === pageNum}
                                >
                                  {pageNum}
                                </PaginationLink>
                              )}
                            </PaginationItem>
                          ))}
                          
                          <PaginationItem>
                            <PaginationNext
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                              aria-disabled={currentPage === totalPages}
                              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {/* Banner per aggiungere al carrello */}
          {getSelectedRowsCount() > 0 && (
            <div className="fixed bottom-0 left-0 right-0 p-4 z-50 flex justify-center">
              <div className="bg-primary text-white rounded-lg shadow-lg p-4 flex items-center justify-between w-full max-w-4xl animate-slideUp">
                <div className="flex items-center">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  <span>
                    {getSelectedRowsCount()} {getSelectedRowsCount() === 1 ? 'rate selected' : 'rates selected'}
                  </span>
                </div>
                <Button
                  onClick={handleAddToCart}
                  variant="secondary"
                  size="sm"
                  className="bg-white text-primary hover:bg-white/90"
                >
                  Add rates to cart
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}