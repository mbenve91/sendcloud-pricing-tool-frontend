"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ChevronLeft, Plus, Trash2, Save, Edit } from "lucide-react"
import { toast } from "react-hot-toast"
import { ScrollArea } from "@/components/ui/scroll-area"

// Types
interface WeightRange {
  min: number
  max: number
  retailPrice: number
  purchasePrice: number
  margin: number
}

interface Pricing {
  destinationType: "national" | "eu" | "extra_eu"
  countryCode: string | null
  weightRanges: WeightRange[]
}

interface Service {
  name: string
  code: string
  description: string
  deliveryTimeMin: number
  deliveryTimeMax: number
  destinationTypes: ("national" | "eu" | "extra_eu")[]
  pricing: Pricing[]
}

interface VolumeDiscount {
  minVolume: number
  maxVolume: number | null
  discountPercentage: number
  applicableServices: string[]
}

interface AdditionalFee {
  name: string
  description: string
  fee: number
  applicableServices: string[]
}

interface Promotion {
  name: string
  description: string
  discountPercentage: number
  startDate: Date
  endDate: Date
  applicableServices: string[]
}

interface Carrier {
  name: string
  logoUrl: string
  isVolumetric: boolean
  fuelSurcharge: number
  services: Service[]
  volumeDiscounts: VolumeDiscount[]
  additionalFees: AdditionalFee[]
  promotions: Promotion[]
  isActive: boolean
}

// Country lists for EU and Extra EU
const euCountries = [
  { id: "de", name: "Germany" },
  { id: "fr", name: "France" },
  { id: "es", name: "Spain" },
  { id: "pt", name: "Portugal" },
  { id: "be", name: "Belgium" },
  { id: "nl", name: "Netherlands" },
  { id: "lu", name: "Luxembourg" },
  { id: "at", name: "Austria" },
  { id: "ie", name: "Ireland" },
  { id: "fi", name: "Finland" },
  { id: "se", name: "Sweden" },
  { id: "dk", name: "Denmark" },
  { id: "gr", name: "Greece" },
  { id: "pl", name: "Poland" },
  { id: "cz", name: "Czech Republic" },
  { id: "sk", name: "Slovakia" },
  { id: "hu", name: "Hungary" },
  { id: "ro", name: "Romania" },
  { id: "bg", name: "Bulgaria" },
  { id: "hr", name: "Croatia" },
  { id: "si", name: "Slovenia" },
  { id: "ee", name: "Estonia" },
  { id: "lv", name: "Latvia" },
  { id: "lt", name: "Lithuania" },
  { id: "cy", name: "Cyprus" },
  { id: "mt", name: "Malta" },
]

const extraEuCountries = [
  { id: "us", name: "United States" },
  { id: "ca", name: "Canada" },
  { id: "uk", name: "United Kingdom" },
  { id: "ch", name: "Switzerland" },
  { id: "no", name: "Norway" },
  { id: "au", name: "Australia" },
  { id: "nz", name: "New Zealand" },
  { id: "jp", name: "Japan" },
  { id: "cn", name: "China" },
  { id: "in", name: "India" },
  { id: "br", name: "Brazil" },
  { id: "za", name: "South Africa" },
  { id: "ru", name: "Russia" },
  { id: "tr", name: "Turkey" },
  { id: "ae", name: "United Arab Emirates" },
  { id: "sa", name: "Saudi Arabia" },
  { id: "sg", name: "Singapore" },
  { id: "hk", name: "Hong Kong" },
  { id: "kr", name: "South Korea" },
  { id: "mx", name: "Mexico" },
]

// Definisci i passi del wizard
const steps = [
  "Informazioni di Base",
  "Servizi",
  "Prezzi e Fasce di Peso",
  "Sconti e Promozioni",
  "Revisione Finale"
];

export default function NewCarrierPage() {
  const router = useRouter();
  
  // Aggiungo uno stato per gestire il wizard
  const [activeStep, setActiveStep] = useState(0);
  
  // Initial carrier state
  const [carrier, setCarrier] = useState<Carrier>({
    name: "",
    logoUrl: "",
    isVolumetric: false,
    fuelSurcharge: 0,
    services: [],
    volumeDiscounts: [],
    additionalFees: [],
    promotions: [],
    isActive: true
  });

  // Stato corrente del servizio attivo
  const [activeServiceIndex, setActiveServiceIndex] = useState<number | null>(null);
  
  // States for pricing operations
  const [tempWeightRanges, setTempWeightRanges] = useState<WeightRange[]>([]);
  
  // Stato per tenere traccia della validità dei dati in ogni step
  const [stepsValidity, setStepsValidity] = useState<Record<number, boolean>>({
    0: false, // Informazioni di base
    1: false, // Servizi
    2: false, // Prezzi
    3: true,  // Sconti (opzionali)
    4: true   // Revisione
  });

  // Funzione per aggiornare le informazioni di base del corriere
  const handleCarrierChange = (field: keyof Carrier, value: any) => {
    const updatedCarrier = {
      ...carrier,
      [field]: value
    };
    setCarrier(updatedCarrier);
    
    // Aggiorna la validità del primo step
    setStepsValidity({
      ...stepsValidity,
      0: !!updatedCarrier.name
    });
  };

  // Funzione per aggiungere o aggiornare un servizio
  const handleServiceChange = (service: Service, index: number | null) => {
    const updatedServices = [...carrier.services];
    
    if (index !== null) {
      // Aggiorna servizio esistente
      updatedServices[index] = service;
    } else {
      // Aggiungi nuovo servizio
      updatedServices.push(service);
    }
    
    setCarrier({
      ...carrier,
      services: updatedServices
    });
    
    // Aggiorna la validità del secondo step
    setStepsValidity({
      ...stepsValidity,
      1: updatedServices.length > 0
    });
  };

  // Funzione per aggiungere o aggiornare i prezzi per un servizio
  const handlePricingChange = (serviceIndex: number, pricing: Pricing[]) => {
    const updatedServices = [...carrier.services];
    updatedServices[serviceIndex].pricing = pricing;
    
    setCarrier({
      ...carrier,
      services: updatedServices
    });
    
    // Aggiorna la validità del terzo step
    const allServicesHavePricing = carrier.services.every(service => 
      service.pricing.length > 0 && 
      service.pricing.every(p => p.weightRanges.length > 0)
    );
    
    setStepsValidity({
      ...stepsValidity,
      2: allServicesHavePricing
    });
  };

  // Funzione per aggiungere o aggiornare uno sconto volume
  const handleVolumeDiscountChange = (volumeDiscount: VolumeDiscount, index: number | null) => {
    let updatedVolumeDiscounts = [...carrier.volumeDiscounts];
    
    if (index !== null) {
      updatedVolumeDiscounts[index] = volumeDiscount;
    } else {
      updatedVolumeDiscounts.push(volumeDiscount);
    }
    
    setCarrier({
      ...carrier,
      volumeDiscounts: updatedVolumeDiscounts
    });
  };

  // Funzione per aggiungere o aggiornare un costo aggiuntivo
  const handleAdditionalFeeChange = (additionalFee: AdditionalFee, index: number | null) => {
    let updatedAdditionalFees = [...carrier.additionalFees];
    
    if (index !== null) {
      updatedAdditionalFees[index] = additionalFee;
    } else {
      updatedAdditionalFees.push(additionalFee);
    }
    
    setCarrier({
      ...carrier,
      additionalFees: updatedAdditionalFees
    });
  };

  // Funzione per aggiungere o aggiornare una promozione
  const handlePromotionChange = (promotion: Promotion, index: number | null) => {
    let updatedPromotions = [...carrier.promotions];
    
    if (index !== null) {
      updatedPromotions[index] = promotion;
    } else {
      updatedPromotions.push(promotion);
    }
    
    setCarrier({
      ...carrier,
      promotions: updatedPromotions
    });
  };

  // Funzione per calcolare il margine
  const calculateMargin = (retailPrice: number, purchasePrice: number) => {
    if (retailPrice <= 0 || purchasePrice <= 0) return 0;
    return ((retailPrice - purchasePrice) / retailPrice) * 100;
  };

  // Verifica se è possibile procedere al prossimo step
  const canProceedToNextStep = () => {
    return stepsValidity[activeStep];
  };

  // Naviga al prossimo step
  const goToNextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  // Naviga al precedente step
  const goToPrevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  // Salva il corriere
  const handleSaveCarrier = async () => {
    try {
      const loadingToast = toast.loading("Salvataggio corriere in corso...");
      
      // Implementazione dell'API call per salvare il corriere
      // ...

      toast.dismiss(loadingToast);
      toast.success("Corriere salvato con successo!");
      
      // Redirect alla lista corrieri
      setTimeout(() => {
        router.push("/carriers");
      }, 1000);
    } catch (error) {
      console.error("Errore nella creazione del corriere:", error);
      toast.error(`Impossibile creare il corriere: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2"
            onClick={() => router.push("/carriers")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-primary">Nuovo Corriere</h1>
        </div>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold 
                ${activeStep === index ? 'bg-primary text-white' : 
                activeStep > index ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {index + 1}
              </div>
              <span className={`mt-2 text-sm ${activeStep === index ? 'text-primary font-semibold' : 'text-gray-500'}`}>
                {step}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 h-1 bg-gray-200 relative">
          <div className="absolute top-0 left-0 h-1 bg-primary transition-all" style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}></div>
        </div>
      </div>

      {/* Step content */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          {/* Step 1: Informazioni di Base */}
          {activeStep === 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Corriere *</Label>
                  <Input 
                    id="name" 
                    value={carrier.name}
                    onChange={(e) => handleCarrierChange("name", e.target.value)}
                    placeholder="Es. BRT, GLS, DHL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">URL del Logo</Label>
                  <Input 
                    id="logoUrl" 
                    value={carrier.logoUrl}
                    onChange={(e) => handleCarrierChange("logoUrl", e.target.value)}
                    placeholder="https://esempio.com/logo.png"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="isVolumetric"
                      checked={carrier.isVolumetric}
                      onCheckedChange={(checked) => handleCarrierChange("isVolumetric", checked)}
                    />
                    <Label htmlFor="isVolumetric">Calcolo Volumetrico</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fuelSurcharge">Supplemento Carburante (%)</Label>
                  <Input 
                    id="fuelSurcharge" 
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={carrier.fuelSurcharge}
                    onChange={(e) => handleCarrierChange("fuelSurcharge", parseFloat(e.target.value))}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="isActive"
                  checked={carrier.isActive}
                  onCheckedChange={(checked) => handleCarrierChange("isActive", checked)}
                />
                <Label htmlFor="isActive">Corriere Attivo</Label>
              </div>
            </div>
          )}

          {/* Step 2: Servizi */}
          {activeStep === 1 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Servizi</h3>
                <Button onClick={() => {
                  setActiveServiceIndex(null);
                  // Apri dialog per nuovo servizio
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi Servizio
                </Button>
              </div>
              
              {carrier.services.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Nessun servizio aggiunto. Aggiungi almeno un servizio per continuare.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {carrier.services.map((service, index) => (
                    <Card key={index} className="overflow-hidden">
                      <div className="p-4 flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold">{service.name}</h4>
                          <p className="text-sm text-gray-500">Codice: {service.code} • Tempi di consegna: {service.deliveryTimeMin}-{service.deliveryTimeMax}h</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {service.destinationTypes.map((type) => (
                              <span key={type} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                                {type === "national" ? "Nazionale" : type === "eu" ? "UE" : "Extra UE"}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => {
                            setActiveServiceIndex(index);
                            // Apri dialog per modifica
                          }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => {
                            // Dialog di conferma rimozione
                            const updatedServices = carrier.services.filter((_, i) => i !== index);
                            setCarrier({
                              ...carrier,
                              services: updatedServices
                            });
                            setStepsValidity({
                              ...stepsValidity,
                              1: updatedServices.length > 0
                            });
                          }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Prezzi e Fasce di Peso */}
          {activeStep === 2 && (
            <div className="space-y-6">
              <div className="mb-4">
                <Select onValueChange={(value) => setActiveServiceIndex(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un servizio" />
                  </SelectTrigger>
                  <SelectContent>
                    {carrier.services.map((service, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {activeServiceIndex !== null && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Prezzi per {carrier.services[activeServiceIndex].name}</h3>
                    <Button onClick={() => {
                      // Apri dialog per aggiungere prezzo
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Aggiungi Destinazione
                    </Button>
                  </div>
                  
                  {carrier.services[activeServiceIndex].pricing.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">Nessun prezzo definito. Aggiungi almeno una destinazione.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {carrier.services[activeServiceIndex].pricing.map((price, priceIndex) => (
                        <Card key={priceIndex} className="overflow-hidden">
                          <div className="p-4">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="font-semibold">
                                {price.destinationType === "national" ? "Nazionale" : 
                                 price.destinationType === "eu" ? `UE - ${price.countryCode ? euCountries.find(c => c.id === price.countryCode)?.name : "Tutti"}` : 
                                 `Extra UE - ${price.countryCode ? extraEuCountries.find(c => c.id === price.countryCode)?.name : "Tutti"}`}
                              </h4>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" onClick={() => {
                                  // Apri dialog per modifica
                                }}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => {
                                  // Dialog di conferma rimozione
                                }}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="mb-2 flex justify-between items-center">
                              <h5 className="text-sm font-medium">Fasce di Peso</h5>
                              <Button variant="outline" size="sm" onClick={() => {
                                // Apri dialog per aggiungere fascia peso
                              }}>
                                <Plus className="h-4 w-4 mr-1" />
                                Aggiungi Fascia
                              </Button>
                            </div>
                            
                            {price.weightRanges.length === 0 ? (
                              <div className="text-center py-6 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-500">Nessuna fascia di peso. Aggiungine almeno una.</p>
                              </div>
                            ) : (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Peso Min (kg)</TableHead>
                                    <TableHead>Peso Max (kg)</TableHead>
                                    <TableHead>Prezzo Cliente (€)</TableHead>
                                    <TableHead>Prezzo Acquisto (€)</TableHead>
                                    <TableHead>Margine (%)</TableHead>
                                    <TableHead className="w-[100px]">Azioni</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {price.weightRanges.map((range, rangeIndex) => (
                                    <TableRow key={rangeIndex}>
                                      <TableCell>{range.min}</TableCell>
                                      <TableCell>{range.max}</TableCell>
                                      <TableCell>{range.retailPrice.toFixed(2)}</TableCell>
                                      <TableCell>{range.purchasePrice.toFixed(2)}</TableCell>
                                      <TableCell>{range.margin.toFixed(2)}%</TableCell>
                                      <TableCell>
                                        <div className="flex space-x-1">
                                          <Button variant="ghost" size="sm" onClick={() => {
                                            // Modifica fascia
                                          }}>
                                            <Edit className="h-3 w-3" />
                                          </Button>
                                          <Button variant="ghost" size="sm" onClick={() => {
                                            // Rimuovi fascia
                                          }}>
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Sconti e Promozioni */}
          {activeStep === 3 && (
            <div className="space-y-8">
              {/* Sconti Volume */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Sconti Volume</h3>
                  <Button onClick={() => {
                    // Apri dialog per aggiungere sconto volume
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi Sconto Volume
                  </Button>
                </div>
                
                {carrier.volumeDiscounts.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Nessuno sconto volume.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Volume Min</TableHead>
                        <TableHead>Volume Max</TableHead>
                        <TableHead>Sconto (%)</TableHead>
                        <TableHead>Servizi Applicabili</TableHead>
                        <TableHead className="w-[100px]">Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {carrier.volumeDiscounts.map((discount, index) => (
                        <TableRow key={index}>
                          <TableCell>{discount.minVolume}</TableCell>
                          <TableCell>{discount.maxVolume ?? "∞"}</TableCell>
                          <TableCell>{discount.discountPercentage}%</TableCell>
                          <TableCell>
                            {discount.applicableServices.map(code => 
                              carrier.services.find(s => s.code === code)?.name
                            ).join(", ")}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
              
              {/* Costi Aggiuntivi */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Costi Aggiuntivi</h3>
                  <Button onClick={() => {
                    // Apri dialog per aggiungere costo aggiuntivo
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi Costo
                  </Button>
                </div>
                
                {carrier.additionalFees.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Nessun costo aggiuntivo.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Descrizione</TableHead>
                        <TableHead>Costo (€)</TableHead>
                        <TableHead>Servizi Applicabili</TableHead>
                        <TableHead className="w-[100px]">Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {carrier.additionalFees.map((fee, index) => (
                        <TableRow key={index}>
                          <TableCell>{fee.name}</TableCell>
                          <TableCell>{fee.description}</TableCell>
                          <TableCell>{fee.fee.toFixed(2)}</TableCell>
                          <TableCell>
                            {fee.applicableServices.map(code => 
                              carrier.services.find(s => s.code === code)?.name
                            ).join(", ")}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
              
              {/* Promozioni */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Promozioni</h3>
                  <Button onClick={() => {
                    // Apri dialog per aggiungere promozione
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi Promozione
                  </Button>
                </div>
                
                {carrier.promotions.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Nessuna promozione.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Descrizione</TableHead>
                        <TableHead>Sconto (%)</TableHead>
                        <TableHead>Data Inizio</TableHead>
                        <TableHead>Data Fine</TableHead>
                        <TableHead>Servizi Applicabili</TableHead>
                        <TableHead className="w-[100px]">Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {carrier.promotions.map((promo, index) => (
                        <TableRow key={index}>
                          <TableCell>{promo.name}</TableCell>
                          <TableCell>{promo.description}</TableCell>
                          <TableCell>{promo.discountPercentage}%</TableCell>
                          <TableCell>{new Date(promo.startDate).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(promo.endDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {promo.applicableServices.map(code => 
                              carrier.services.find(s => s.code === code)?.name
                            ).join(", ")}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Revisione */}
          {activeStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Riepilogo Corriere</h3>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Informazioni di Base</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <dt className="text-sm font-medium">Nome:</dt>
                      <dd>{carrier.name}</dd>
                      
                      <dt className="text-sm font-medium">Logo:</dt>
                      <dd>{carrier.logoUrl || "Non specificato"}</dd>
                      
                      <dt className="text-sm font-medium">Calcolo Volumetrico:</dt>
                      <dd>{carrier.isVolumetric ? "Sì" : "No"}</dd>
                      
                      <dt className="text-sm font-medium">Supplemento Carburante:</dt>
                      <dd>{carrier.fuelSurcharge}%</dd>
                      
                      <dt className="text-sm font-medium">Stato:</dt>
                      <dd>{carrier.isActive ? "Attivo" : "Non attivo"}</dd>
                    </dl>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Servizi ({carrier.services.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {carrier.services.length === 0 ? (
                      <p className="text-gray-500">Nessun servizio definito.</p>
                    ) : (
                      <div className="space-y-4">
                        {carrier.services.map((service, index) => (
                          <div key={index} className="border-b pb-3 last:border-b-0 last:pb-0">
                            <h4 className="font-semibold">{service.name} ({service.code})</h4>
                            <p className="text-sm text-gray-500">{service.description}</p>
                            <p className="text-sm">Tempi di consegna: {service.deliveryTimeMin}-{service.deliveryTimeMax}h</p>
                            <div className="mt-2">
                              <h5 className="text-sm font-medium">Prezzi:</h5>
                              <ul className="text-sm list-disc pl-5 mt-1">
                                {service.pricing.map((price, priceIndex) => (
                                  <li key={priceIndex}>
                                    {price.destinationType === "national" ? "Nazionale" : 
                                     price.destinationType === "eu" ? `UE ${price.countryCode ? `- ${euCountries.find(c => c.id === price.countryCode)?.name}` : ""}` : 
                                     `Extra UE ${price.countryCode ? `- ${extraEuCountries.find(c => c.id === price.countryCode)?.name}` : ""}`}
                                    : {price.weightRanges.length} fasce di peso
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Sconti Volume ({carrier.volumeDiscounts.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {carrier.volumeDiscounts.length === 0 ? (
                        <p className="text-gray-500">Nessuno sconto volume.</p>
                      ) : (
                        <ul className="text-sm list-disc pl-5">
                          {carrier.volumeDiscounts.map((discount, index) => (
                            <li key={index}>
                              {discount.minVolume}-{discount.maxVolume ?? "∞"}: {discount.discountPercentage}% di sconto
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Costi Aggiuntivi ({carrier.additionalFees.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {carrier.additionalFees.length === 0 ? (
                        <p className="text-gray-500">Nessun costo aggiuntivo.</p>
                      ) : (
                        <ul className="text-sm list-disc pl-5">
                          {carrier.additionalFees.map((fee, index) => (
                            <li key={index}>
                              {fee.name}: {fee.fee.toFixed(2)}€
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Promozioni ({carrier.promotions.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {carrier.promotions.length === 0 ? (
                        <p className="text-gray-500">Nessuna promozione.</p>
                      ) : (
                        <ul className="text-sm list-disc pl-5">
                          {carrier.promotions.map((promo, index) => (
                            <li key={index}>
                              {promo.name}: {promo.discountPercentage}% di sconto
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={goToPrevStep}
          disabled={activeStep === 0}
        >
          Indietro
        </Button>
        
        {activeStep < steps.length - 1 ? (
          <Button 
            onClick={goToNextStep}
            disabled={!canProceedToNextStep()}
          >
            Avanti
          </Button>
        ) : (
          <Button 
            onClick={handleSaveCarrier}
            disabled={!carrier.name || carrier.services.length === 0}
          >
            <Save className="mr-2 h-4 w-4" />
            Salva Corriere
          </Button>
        )}
      </div>
    </div>
  );
}

