"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Loader2, Plus, Trash2, ChevronLeft, Edit } from "lucide-react"
import { toast } from "react-hot-toast"
import { cn } from "@/lib/utils"

// Interfacce dei tipi di dati
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
  _id?: string
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

export default function EditCarrierPage() {
  const router = useRouter()
  const params = useParams()
  const carrierId = params.id as string

  // Stato per il caricamento
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Stato del carrier
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
  })

  // Stato per il form di servizio
  const [service, setService] = useState<Omit<Service, "pricing">>({
    name: "",
    code: "",
    description: "",
    deliveryTimeMin: 24,
    deliveryTimeMax: 48,
    destinationTypes: ["national"]
  })

  // Stato per la gestione dei prezzi
  const [selectedServiceIndexForPricing, setSelectedServiceIndexForPricing] = useState<number | null>(null)
  const [selectedPricingIndex, setSelectedPricingIndex] = useState<number | null>(null)
  const [pricing, setPricing] = useState<Omit<Pricing, 'weightRanges'>>({
    destinationType: "national",
    countryCode: null
  })
  const [weightRange, setWeightRange] = useState<WeightRange>({
    min: 0,
    max: 1,
    purchasePrice: 0,
    retailPrice: 0,
    margin: 0
  })

  // Stato per il form di volume discount
  const [volumeDiscount, setVolumeDiscount] = useState<VolumeDiscount>({
    minVolume: 0,
    maxVolume: null,
    discountPercentage: 0,
    applicableServices: []
  })

  // Stato per il form di additional fee
  const [additionalFee, setAdditionalFee] = useState<AdditionalFee>({
    name: "",
    description: "",
    fee: 0,
    applicableServices: []
  })

  // Stato per il form di promotion
  const [promotion, setPromotion] = useState<Promotion>({
    name: "",
    description: "",
    discountPercentage: 0,
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    applicableServices: []
  })

  // Carica i dati del carrier
  useEffect(() => {
    const fetchCarrierDetails = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/carriers/${carrierId}`)
        
        if (!response.ok) {
          throw new Error(`Errore nel caricamento del corriere: ${response.status}`)
        }
        
        const data = await response.json()
        
        // Converte le date in oggetti Date
        if (data.promotions) {
          data.promotions = data.promotions.map((promo: any) => ({
            ...promo,
            startDate: new Date(promo.startDate),
            endDate: new Date(promo.endDate)
          }))
        }
        
        setCarrier(data)
        toast.success("Dettagli del corriere caricati con successo")
      } catch (error) {
        console.error("Errore nel caricamento del corriere:", error)
        toast.error("Impossibile caricare i dettagli del corriere")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchCarrierDetails()
  }, [carrierId])

  // Handler per le modifiche ai campi del carrier
  const handleCarrierChange = (field: keyof Carrier, value: any) => {
    setCarrier({
      ...carrier,
      [field]: value
    })
  }

  // Handler per l'aggiunta di un servizio
  const handleServiceSubmit = () => {
    const newService: Service = {
      ...service,
      pricing: []
    }
    
    setCarrier({
      ...carrier,
      services: [...carrier.services, newService]
    })
    
    resetServiceForm()
  }

  // Handler per l'aggiunta di pricing a un servizio
  const handlePricingSubmit = () => {
    if (selectedServiceIndexForPricing === null) return
    
    const newPricing: Pricing = {
      ...pricing,
      weightRanges: []
    }
    
    const updatedServices = [...carrier.services]
    updatedServices[selectedServiceIndexForPricing].pricing.push(newPricing)
    
    setCarrier({
      ...carrier,
      services: updatedServices
    })
    
    resetPricingForm()
  }

  // Handler per l'aggiunta di weight range a un pricing
  const handleWeightRangeSubmit = () => {
    if (selectedServiceIndexForPricing === null || selectedPricingIndex === null) return
    
    const updatedServices = [...carrier.services]
    updatedServices[selectedServiceIndexForPricing].pricing[selectedPricingIndex].weightRanges.push(weightRange)
    
    setCarrier({
      ...carrier,
      services: updatedServices
    })
    
    resetWeightRangeForm()
  }

  // Handler per l'aggiunta di volume discount
  const handleVolumeDiscountSubmit = () => {
    const newVolumeDiscount: VolumeDiscount = {
      ...volumeDiscount
    }
    
    setCarrier({
      ...carrier,
      volumeDiscounts: [...carrier.volumeDiscounts, newVolumeDiscount]
    })
    
    resetVolumeDiscountForm()
  }

  // Handler per l'aggiunta di additional fee
  const handleAdditionalFeeSubmit = () => {
    const newAdditionalFee: AdditionalFee = {
      ...additionalFee
    }
    
    setCarrier({
      ...carrier,
      additionalFees: [...carrier.additionalFees, newAdditionalFee]
    })
    
    resetAdditionalFeeForm()
  }

  // Handler per l'aggiunta di promotion
  const handlePromotionSubmit = () => {
    const newPromotion: Promotion = {
      ...promotion
    }
    
    setCarrier({
      ...carrier,
      promotions: [...carrier.promotions, newPromotion]
    })
    
    resetPromotionForm()
  }

  // Reset dei form
  const resetServiceForm = () => {
    setService({
      name: "",
      code: "",
      description: "",
      deliveryTimeMin: 24,
      deliveryTimeMax: 48,
      destinationTypes: ["national"]
    })
  }

  const resetPricingForm = () => {
    setPricing({
      destinationType: "national",
      countryCode: null,
    })
    setSelectedServiceIndexForPricing(null)
  }

  const resetWeightRangeForm = () => {
    setWeightRange({
      min: 0,
      max: 1,
      purchasePrice: 0,
      retailPrice: 0,
      margin: 0
    })
    setSelectedPricingIndex(null)
  }

  const resetVolumeDiscountForm = () => {
    setVolumeDiscount({
      minVolume: 0,
      maxVolume: null,
      discountPercentage: 0,
      applicableServices: []
    })
  }

  const resetAdditionalFeeForm = () => {
    setAdditionalFee({
      name: "",
      description: "",
      fee: 0,
      applicableServices: []
    })
  }

  const resetPromotionForm = () => {
    setPromotion({
      name: "",
      description: "",
      discountPercentage: 0,
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      applicableServices: []
    })
  }

  // Handler per eliminare un servizio
  const handleDeleteService = (index: number) => {
    const updatedServices = [...carrier.services]
    updatedServices.splice(index, 1)
    setCarrier({
      ...carrier,
      services: updatedServices
    })
  }

  // Handler per eliminare un pricing
  const handleDeletePricing = (serviceIndex: number, pricingIndex: number) => {
    const updatedServices = [...carrier.services]
    updatedServices[serviceIndex].pricing.splice(pricingIndex, 1)
    setCarrier({
      ...carrier,
      services: updatedServices
    })

    if (selectedPricingIndex === pricingIndex) {
      setSelectedPricingIndex(null)
    }
  }

  // Handler per eliminare un weight range
  const handleDeleteWeightRange = (serviceIndex: number, pricingIndex: number, rangeIndex: number) => {
    const updatedServices = [...carrier.services]
    updatedServices[serviceIndex].pricing[pricingIndex].weightRanges.splice(rangeIndex, 1)
    setCarrier({
      ...carrier,
      services: updatedServices
    })
  }

  // Handler per eliminare un volume discount
  const handleDeleteVolumeDiscount = (index: number) => {
    const updatedVolumeDiscounts = [...carrier.volumeDiscounts]
    updatedVolumeDiscounts.splice(index, 1)
    setCarrier({
      ...carrier,
      volumeDiscounts: updatedVolumeDiscounts
    })
  }

  // Handler per eliminare un additional fee
  const handleDeleteAdditionalFee = (index: number) => {
    const updatedAdditionalFees = [...carrier.additionalFees]
    updatedAdditionalFees.splice(index, 1)
    setCarrier({
      ...carrier,
      additionalFees: updatedAdditionalFees
    })
  }

  // Handler per eliminare una promotion
  const handleDeletePromotion = (index: number) => {
    const updatedPromotions = [...carrier.promotions]
    updatedPromotions.splice(index, 1)
    setCarrier({
      ...carrier,
      promotions: updatedPromotions
    })
  }

  // Handler per salvare il carrier
  const handleSaveCarrier = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/carriers/${carrierId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(carrier),
      });
      
      if (!response.ok) {
        throw new Error(`Errore nell'aggiornamento del corriere: ${response.status}`);
      }
      
      toast.success("Corriere aggiornato con successo");
      
      // Navigate back to carriers list after short delay
      setTimeout(() => {
        router.push("/carriers");
      }, 1000);
    } catch (error) {
      console.error("Errore nell'aggiornamento del corriere:", error);
      toast.error("Impossibile aggiornare il corriere");
    } finally {
      setIsSaving(false);
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Calculate margin
  const calculateMargin = (retailPrice: number, purchasePrice: number) => {
    if (retailPrice === 0) return 0;
    return ((retailPrice - purchasePrice) / retailPrice) * 100;
  };

  // Handle price change
  const handlePriceChange = (type: 'purchasePrice' | 'retailPrice', value: number) => {
    if (type === 'purchasePrice') {
      const newPurchasePrice = value;
      const margin = newPurchasePrice > 0 
        ? ((weightRange.retailPrice - newPurchasePrice) / newPurchasePrice) * 100 
        : 0;
      setWeightRange({
        ...weightRange,
        purchasePrice: newPurchasePrice,
        margin: margin
      });
    } else {
      const newRetailPrice = value;
      const margin = weightRange.purchasePrice > 0 
        ? ((newRetailPrice - weightRange.purchasePrice) / weightRange.purchasePrice) * 100 
        : 0;
      setWeightRange({
        ...weightRange,
        retailPrice: newRetailPrice,
        margin: margin
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Caricamento...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.push("/carriers")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Modifica Corriere: {carrier.name}</h1>
        </div>
        <Button onClick={handleSaveCarrier} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Salva Modifiche
        </Button>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="details">Dettagli</TabsTrigger>
          <TabsTrigger value="services">Servizi</TabsTrigger>
          <TabsTrigger value="pricing">Prezzi</TabsTrigger>
          <TabsTrigger value="discounts">Sconti</TabsTrigger>
          <TabsTrigger value="fees">Costi Aggiuntivi</TabsTrigger>
          <TabsTrigger value="promotions">Promozioni</TabsTrigger>
        </TabsList>

        {/* Tab Dettagli */}
        <div className="space-y-4" data-value="details">
          <Card>
            <CardHeader>
              <CardTitle>Informazioni di Base</CardTitle>
              <CardDescription>Inserisci le informazioni principali del corriere</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Corriere</Label>
                  <Input 
                    id="name" 
                    placeholder="es. DHL" 
                    value={carrier.name}
                    onChange={(e) => handleCarrierChange('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">URL Logo</Label>
                  <Input 
                    id="logoUrl" 
                    placeholder="es. /images/carriers/dhl.png" 
                    value={carrier.logoUrl}
                    onChange={(e) => handleCarrierChange('logoUrl', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="isVolumetric" 
                    checked={carrier.isVolumetric}
                    onCheckedChange={(checked) => handleCarrierChange('isVolumetric', checked)}
                  />
                  <Label htmlFor="isVolumetric">Calcolo Volumetrico</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fuelSurcharge">Supplemento Carburante (%)</Label>
                  <Input 
                    id="fuelSurcharge" 
                    type="number" 
                    placeholder="es. 5.5" 
                    value={carrier.fuelSurcharge}
                    onChange={(e) => handleCarrierChange('fuelSurcharge', parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="isActive" 
                  checked={carrier.isActive}
                  onCheckedChange={(checked) => handleCarrierChange('isActive', checked)}
                />
                <Label htmlFor="isActive">Corriere Attivo</Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Services */}
        <div className="space-y-4" data-value="services">
          <Card>
            <CardHeader>
              <CardTitle>Aggiungi Servizio</CardTitle>
              <CardDescription>Inserisci i dettagli del servizio offerto dal corriere</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serviceName">Nome Servizio</Label>
                  <Input 
                    id="serviceName" 
                    placeholder="es. Express" 
                    value={service.name}
                    onChange={(e) => setService({...service, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serviceCode">Codice Servizio</Label>
                  <Input 
                    id="serviceCode" 
                    placeholder="es. EXP" 
                    value={service.code}
                    onChange={(e) => setService({...service, code: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceDescription">Descrizione</Label>
                <Textarea 
                  id="serviceDescription" 
                  placeholder="Descrivi il servizio..."
                  value={service.description}
                  onChange={(e) => setService({...service, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryTimeMin">Tempo Consegna Minimo (ore)</Label>
                  <Input 
                    id="deliveryTimeMin" 
                    type="number" 
                    placeholder="es. 24" 
                    value={service.deliveryTimeMin}
                    onChange={(e) => setService({...service, deliveryTimeMin: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryTimeMax">Tempo Consegna Massimo (ore)</Label>
                  <Input 
                    id="deliveryTimeMax" 
                    type="number" 
                    placeholder="es. 48" 
                    value={service.deliveryTimeMax}
                    onChange={(e) => setService({...service, deliveryTimeMax: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tipi di Destinazione</Label>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="destNational" 
                      checked={service.destinationTypes.includes("national")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setService({...service, destinationTypes: [...service.destinationTypes, "national"]})
                        } else {
                          setService({...service, destinationTypes: service.destinationTypes.filter(t => t !== "national")})
                        }
                      }}
                    />
                    <Label htmlFor="destNational">Nazionale</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="destEU" 
                      checked={service.destinationTypes.includes("eu")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setService({...service, destinationTypes: [...service.destinationTypes, "eu"]})
                        } else {
                          setService({...service, destinationTypes: service.destinationTypes.filter(t => t !== "eu")})
                        }
                      }}
                    />
                    <Label htmlFor="destEU">UE</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="destExtraEU" 
                      checked={service.destinationTypes.includes("extra_eu")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setService({...service, destinationTypes: [...service.destinationTypes, "extra_eu"]})
                        } else {
                          setService({...service, destinationTypes: service.destinationTypes.filter(t => t !== "extra_eu")})
                        }
                      }}
                    />
                    <Label htmlFor="destExtraEU">Extra UE</Label>
                  </div>
                </div>
              </div>

              <Button onClick={handleServiceSubmit}>Aggiungi Servizio</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Servizi</CardTitle>
              <CardDescription>Servizi offerti dal corriere</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {carrier.services.map((svc, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{svc.name} ({svc.code})</h3>
                          <p className="text-sm text-muted-foreground">{svc.description}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteService(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Tempo di consegna: {svc.deliveryTimeMin}-{svc.deliveryTimeMax} ore</div>
                        <div>
                          Destinazioni: {svc.destinationTypes.map(t => 
                            t === "national" ? "Nazionale" : t === "eu" ? "UE" : "Extra UE"
                          ).join(", ")}
                        </div>
                      </div>
                    </div>
                  ))}
                  {carrier.services.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Nessun servizio aggiunto</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Tab Pricing */}
        <div className="space-y-4" data-value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Aggiungi Prezzi</CardTitle>
              <CardDescription>Configura i prezzi per i servizi del corriere</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="serviceForPricing">Seleziona Servizio</Label>
                <Select 
                  value={selectedServiceIndexForPricing !== null ? selectedServiceIndexForPricing.toString() : ""} 
                  onValueChange={(value) => setSelectedServiceIndexForPricing(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un servizio" />
                  </SelectTrigger>
                  <SelectContent>
                    {carrier.services.map((svc, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {svc.name} ({svc.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedServiceIndexForPricing !== null && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="destinationType">Tipo di Destinazione</Label>
                    <Select 
                      value={pricing.destinationType} 
                      onValueChange={(value: "national" | "eu" | "extra_eu") => setPricing({...pricing, destinationType: value, countryCode: null})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona tipo di destinazione" />
                      </SelectTrigger>
                      <SelectContent>
                        {carrier.services[selectedServiceIndexForPricing].destinationTypes.includes("national") && (
                          <SelectItem value="national">Nazionale</SelectItem>
                        )}
                        {carrier.services[selectedServiceIndexForPricing].destinationTypes.includes("eu") && (
                          <SelectItem value="eu">UE</SelectItem>
                        )}
                        {carrier.services[selectedServiceIndexForPricing].destinationTypes.includes("extra_eu") && (
                          <SelectItem value="extra_eu">Extra UE</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {(pricing.destinationType === "eu" || pricing.destinationType === "extra_eu") && (
                    <div className="space-y-2">
                      <Label htmlFor="countryCode">Codice Paese (es. DE, FR)</Label>
                      <Input 
                        id="countryCode" 
                        placeholder="es. DE" 
                        value={pricing.countryCode || ""}
                        onChange={(e) => setPricing({...pricing, countryCode: e.target.value})}
                      />
                      <p className="text-sm text-muted-foreground">
                        Inserisci il codice ISO del paese (2 lettere). Lascia vuoto per applicare a tutti i paesi.
                      </p>
                    </div>
                  )}

                  <Button 
                    onClick={handlePricingSubmit}
                    disabled={selectedServiceIndexForPricing === null}
                  >
                    Aggiungi Destinazione
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {selectedServiceIndexForPricing !== null && (
            <Card>
              <CardHeader>
                <CardTitle>Destinazioni per {carrier.services[selectedServiceIndexForPricing].name}</CardTitle>
                <CardDescription>Destinazioni configurate per questo servizio</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-4">
                    {carrier.services[selectedServiceIndexForPricing].pricing.map((p, pIndex) => (
                      <div key={pIndex} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">
                              {p.destinationType === "national" 
                                ? "Nazionale" 
                                : p.destinationType === "eu" 
                                  ? `UE ${p.countryCode ? `(${p.countryCode})` : '(Tutti)'}`
                                  : `Extra UE ${p.countryCode ? `(${p.countryCode})` : '(Tutti)'}`}
                            </h3>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedPricingIndex(pIndex);
                              }}
                            >
                              Aggiungi Prezzo
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeletePricing(selectedServiceIndexForPricing, pIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {p.weightRanges.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Peso Min (kg)</TableHead>
                                <TableHead>Peso Max (kg)</TableHead>
                                <TableHead>Prezzo Acquisto (€)</TableHead>
                                <TableHead>Prezzo Vendita (€)</TableHead>
                                <TableHead>Margine (%)</TableHead>
                                <TableHead></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {p.weightRanges.map((wr, wrIndex) => (
                                <TableRow key={wrIndex}>
                                  <TableCell>{wr.min}</TableCell>
                                  <TableCell>{wr.max}</TableCell>
                                  <TableCell>{wr.purchasePrice.toFixed(2)}</TableCell>
                                  <TableCell>{wr.retailPrice.toFixed(2)}</TableCell>
                                  <TableCell>{wr.margin.toFixed(1)}%</TableCell>
                                  <TableCell>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => handleDeleteWeightRange(selectedServiceIndexForPricing, pIndex, wrIndex)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">
                            <p>Nessun prezzo configurato</p>
                          </div>
                        )}
                      </div>
                    ))}
                    {carrier.services[selectedServiceIndexForPricing].pricing.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Nessuna destinazione configurata</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {selectedServiceIndexForPricing !== null && selectedPricingIndex !== null && (
            <Card>
              <CardHeader>
                <CardTitle>Aggiungi Fascia di Peso</CardTitle>
                <CardDescription>Aggiungi una fascia di peso con relativi prezzi</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weightMin">Peso Minimo (kg)</Label>
                    <Input 
                      id="weightMin" 
                      type="number" 
                      step="0.01"
                      placeholder="es. 0" 
                      value={weightRange.min}
                      onChange={(e) => setWeightRange({...weightRange, min: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weightMax">Peso Massimo (kg)</Label>
                    <Input 
                      id="weightMax" 
                      type="number" 
                      step="0.01"
                      placeholder="es. 1" 
                      value={weightRange.max}
                      onChange={(e) => setWeightRange({...weightRange, max: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="purchasePrice">Prezzo di Acquisto (€)</Label>
                    <Input 
                      id="purchasePrice" 
                      type="number" 
                      step="0.01"
                      placeholder="es. 5.5" 
                      value={weightRange.purchasePrice}
                      onChange={(e) => handlePriceChange('purchasePrice', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="retailPrice">Prezzo di Vendita (€)</Label>
                    <Input 
                      id="retailPrice" 
                      type="number" 
                      step="0.01"
                      placeholder="es. 7.9" 
                      value={weightRange.retailPrice}
                      onChange={(e) => handlePriceChange('retailPrice', parseFloat(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="margin">Margine (%)</Label>
                  <div className="h-10 px-3 py-2 rounded-md border bg-muted">
                    {weightRange.margin.toFixed(1)}%
                  </div>
                </div>

                <Button 
                  onClick={handleWeightRangeSubmit}
                  disabled={selectedServiceIndexForPricing === null || selectedPricingIndex === null}
                >
                  Aggiungi Fascia di Peso
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Altri tabs omessi per brevità */}
      </Tabs>
    </div>
  )
} 