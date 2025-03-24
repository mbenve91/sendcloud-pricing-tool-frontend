/**
 * File contenente dati di fallback per l'applicazione
 * Da utilizzare quando le API non sono disponibili o c'è un errore nella richiesta
 */

// Dati di fallback per i corrieri
export const FALLBACK_CARRIERS = [
  {
    _id: "fallback-brt-1",
    name: "BRT",
    logoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/brt.svg-P9qauJfDY2jf3ssHnMivYtBnNz8wSn.png",
    isActive: true,
    fuelSurcharge: 0,
    isVolumetric: false
  },
  {
    _id: "fallback-gls-2",
    name: "GLS",
    logoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gls-RAOsrs0wCzdXlD2OvgPbVa7qqFDgOo.webp",
    isActive: true,
    fuelSurcharge: 0,
    isVolumetric: false
  },
  {
    _id: "fallback-dhl-3",
    name: "DHL",
    logoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dhl-19ZkH6nuiU7ABE42HthHDOQWjmOWqU.webp",
    isActive: true,
    fuelSurcharge: 0,
    isVolumetric: false
  },
  {
    _id: "fallback-poste-4",
    name: "Poste Italiane",
    logoUrl: "/placeholder.svg?height=40&width=40",
    isActive: true,
    fuelSurcharge: 0,
    isVolumetric: false
  },
  {
    _id: "fallback-inpost-5",
    name: "InPost",
    logoUrl: "/placeholder.svg?height=40&width=40",
    isActive: true,
    fuelSurcharge: 0,
    isVolumetric: false
  },
  {
    _id: "fallback-fedex-6",
    name: "FedEx",
    logoUrl: "/placeholder.svg?height=40&width=40",
    isActive: true,
    fuelSurcharge: 0,
    isVolumetric: false
  }
];

// Dati di fallback per i servizi di BRT
export const FALLBACK_BRT_SERVICES = [
  {
    _id: "fallback-brt-service-1",
    name: "BRT Express",
    code: "brt_express",
    description: "Servizio espresso BRT per consegna in 24/48h",
    deliveryTimeMin: 24,
    deliveryTimeMax: 48,
    destinationType: "national",
    destinationCountry: "IT",
    isActive: true,
    carrier: "fallback-brt-1"
  },
  {
    _id: "fallback-brt-service-2",
    name: "BRT Express 12:00",
    code: "brt_express_12",
    description: "Servizio espresso BRT per consegna entro le 12:00",
    deliveryTimeMin: 12,
    deliveryTimeMax: 24,
    destinationType: "national",
    destinationCountry: "IT",
    isActive: true,
    carrier: "fallback-brt-1"
  }
];

// Dati di fallback per le tariffe
export const FALLBACK_RATES = [
  {
    _id: "fallback-rate-1",
    service: "fallback-brt-service-1",
    weightMin: 0,
    weightMax: 2,
    purchasePrice: 5.60,
    retailPrice: 7.00
  },
  {
    _id: "fallback-rate-2",
    service: "fallback-brt-service-1",
    weightMin: 2,
    weightMax: 5,
    purchasePrice: 7.20,
    retailPrice: 9.00
  },
  {
    _id: "fallback-rate-3",
    service: "fallback-brt-service-1",
    weightMin: 5,
    weightMax: 10,
    purchasePrice: 10.80,
    retailPrice: 13.50
  },
  {
    _id: "fallback-rate-4",
    service: "fallback-brt-service-2",
    weightMin: 0,
    weightMax: 2,
    purchasePrice: 6.73,
    retailPrice: 8.42
  },
  {
    _id: "fallback-rate-5",
    service: "fallback-brt-service-2",
    weightMin: 2,
    weightMax: 5,
    purchasePrice: 7.19,
    retailPrice: 8.99
  }
];

// Funzione di utilità per verificare il timeout di una richiesta fetch
export const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 8000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}; 