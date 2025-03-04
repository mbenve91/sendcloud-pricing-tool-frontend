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

export default function NewCarrierPage() {
  const router = useRouter();
  
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

  // States for service form
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [currentService, setCurrentService] = useState<Service>({
    name: "",
    code: "",
    description: "",
    deliveryTimeMin: 24,
    deliveryTimeMax: 48,
    destinationTypes: ["national"],
    pricing: []
  });
  const [isEditingService, setIsEditingService] = useState(false);
  const [serviceIndex, setServiceIndex] = useState(-1);

  // States for pricing form
  const [isPricingDialogOpen, setIsPricingDialogOpen] = useState(false);
  const [currentPricing, setCurrentPricing] = useState<Pricing>({
    destinationType: "national",
    countryCode: null,
    weightRanges: []
  });
  const [selectedServiceForPricing, setSelectedServiceForPricing] = useState<Service | null>(null);
  const [isEditingPricing, setIsEditingPricing] = useState(false);
  const [pricingIndex, setPricingIndex] = useState(-1);

  // States for weight range form
  const [isWeightRangeDialogOpen, setIsWeightRangeDialogOpen] = useState(false);
  const [currentWeightRange, setCurrentWeightRange] = useState<WeightRange>({
    min: 0,
    max: 1,
    retailPrice: 0,
    purchasePrice: 0,
    margin: 0
  });
  const [isEditingWeightRange, setIsEditingWeightRange] = useState(false);
  const [weightRangeIndex, setWeightRangeIndex] = useState(-1);

  // States for volume discount form
  const [isVolumeDiscountDialogOpen, setIsVolumeDiscountDialogOpen] = useState(false);
  const [currentVolumeDiscount, setCurrentVolumeDiscount] = useState<VolumeDiscount>({
    minVolume: 0,
    maxVolume: null,
    discountPercentage: 0,
    applicableServices: []
  });
  const [isEditingVolumeDiscount, setIsEditingVolumeDiscount] = useState(false);
  const [volumeDiscountIndex, setVolumeDiscountIndex] = useState(-1);

  // States for additional fee form
  const [isAdditionalFeeDialogOpen, setIsAdditionalFeeDialogOpen] = useState(false);
  const [currentAdditionalFee, setCurrentAdditionalFee] = useState<AdditionalFee>({
    name: "",
    description: "",
    fee: 0,
    applicableServices: []
  });
  const [isEditingAdditionalFee, setIsEditingAdditionalFee] = useState(false);
  const [additionalFeeIndex, setAdditionalFeeIndex] = useState(-1);

  // States for promotion form
  const [isPromotionDialogOpen, setIsPromotionDialogOpen] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState<Promotion>({
    name: "",
    description: "",
    discountPercentage: 0,
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    applicableServices: []
  });
  const [isEditingPromotion, setIsEditingPromotion] = useState(false);
  const [promotionIndex, setPromotionIndex] = useState(-1);

  // State for discard changes dialog
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);

  // Handle basic carrier info changes
  const handleCarrierChange = (field: keyof Carrier, value: any) => {
    setCarrier({
      ...carrier,
      [field]: value
    });
  };

  // Handle service form submission
  const handleServiceSubmit = () => {
    if (isEditingService) {
      // Update existing service
      const updatedServices = [...carrier.services];
      updatedServices[serviceIndex] = currentService;
      setCarrier({
        ...carrier,
        services: updatedServices
      });
    } else {
      // Add new service
      setCarrier({
        ...carrier,
        services: [...carrier.services, currentService]
      });
    }
    
    setIsServiceDialogOpen(false);
    resetServiceForm();
  };

  // Handle pricing form submission
  const handlePricingSubmit = () => {
    if (!selectedServiceForPricing) return;
    
    const updatedServices = [...carrier.services];
    const serviceIdx = carrier.services.findIndex(s => s.code === selectedServiceForPricing.code);
    
    if (serviceIdx === -1) return;
    
    if (isEditingPricing) {
      // Update existing pricing
      updatedServices[serviceIdx].pricing[pricingIndex] = currentPricing;
    } else {
      // Add new pricing
      updatedServices[serviceIdx].pricing.push(currentPricing);
    }
    
    setCarrier({
      ...carrier,
      services: updatedServices
    });
    
    setIsPricingDialogOpen(false);
    resetPricingForm();
  };

  // Handle weight range form submission
  const handleWeightRangeSubmit = () => {
    if (!selectedServiceForPricing) return;
    
    // Calculate margin if not provided
    if (currentWeightRange.margin === 0 && currentWeightRange.retailPrice > 0 && currentWeightRange.purchasePrice > 0) {
      const margin = ((currentWeightRange.retailPrice - currentWeightRange.purchasePrice) / currentWeightRange.retailPrice) * 100;
      currentWeightRange.margin = Number.parseFloat(margin.toFixed(2));
    }
    
    const updatedPricing = { ...currentPricing };
    
    if (isEditingWeightRange) {
      // Update existing weight range
      updatedPricing.weightRanges[weightRangeIndex] = currentWeightRange;
    } else {
      // Add new weight range
      updatedPricing.weightRanges.push(currentWeightRange);
      
      // Sort weight ranges by min weight
      updatedPricing.weightRanges.sort((a, b) => a.min - b.min);
    }
    
    setCurrentPricing(updatedPricing);
    setIsWeightRangeDialogOpen(false);
    resetWeightRangeForm();
  };

  // Handle volume discount form submission
  const handleVolumeDiscountSubmit = () => {
    if (isEditingVolumeDiscount) {
      // Update existing volume discount
      const updatedVolumeDiscounts = [...carrier.volumeDiscounts];
      updatedVolumeDiscounts[volumeDiscountIndex] = currentVolumeDiscount;
      setCarrier({
        ...carrier,
        volumeDiscounts: updatedVolumeDiscounts
      });
    } else {
      // Add new volume discount
      setCarrier({
        ...carrier,
        volumeDiscounts: [...carrier.volumeDiscounts, currentVolumeDiscount]
      });
    }
    
    setIsVolumeDiscountDialogOpen(false);
    resetVolumeDiscountForm();
  };

  // Handle additional fee form submission
  const handleAdditionalFeeSubmit = () => {
    if (isEditingAdditionalFee) {
      // Update existing additional fee
      const updatedAdditionalFees = [...carrier.additionalFees];
      updatedAdditionalFees[additionalFeeIndex] = currentAdditionalFee;
      setCarrier({
        ...carrier,
        additionalFees: updatedAdditionalFees
      });
    } else {
      // Add new additional fee
      setCarrier({
        ...carrier,
        additionalFees: [...carrier.additionalFees, currentAdditionalFee]
      });
    }
    
    setIsAdditionalFeeDialogOpen(false);
    resetAdditionalFeeForm();
  };

  // Handle promotion form submission
  const handlePromotionSubmit = () => {
    if (isEditingPromotion) {
      // Update existing promotion
      const updatedPromotions = [...carrier.promotions];
      updatedPromotions[promotionIndex] = currentPromotion;
      setCarrier({
        ...carrier,
        promotions: updatedPromotions
      });
    } else {
      // Add new promotion
      setCarrier({
        ...carrier,
        promotions: [...carrier.promotions, currentPromotion]
      });
    }
    
    setIsPromotionDialogOpen(false);
    resetPromotionForm();
  };

  // Reset service form
  const resetServiceForm = () => {
    setCurrentService({
      name: "",
      code: "",
      description: "",
      deliveryTimeMin: 24,
      deliveryTimeMax: 48,
      destinationTypes: ["national"],
      pricing: []
    });
    setIsEditingService(false);
    setServiceIndex(-1);
  };

  // Reset pricing form
  const resetPricingForm = () => {
    setCurrentPricing({
      destinationType: "national",
      countryCode: null,
      weightRanges: []
    });
    setIsEditingPricing(false);
    setPricingIndex(-1);
  };

  // Reset weight range form
  const resetWeightRangeForm = () => {
    setCurrentWeightRange({
      min: 0,
      max: 1,
      retailPrice: 0,
      purchasePrice: 0,
      margin: 0
    });
    setIsEditingWeightRange(false);
    setWeightRangeIndex(-1);
  };

  // Reset volume discount form
  const resetVolumeDiscountForm = () => {
    setCurrentVolumeDiscount({
      minVolume: 0,
      maxVolume: null,
      discountPercentage: 0,
      applicableServices: []
    });
    setIsEditingVolumeDiscount(false);
    setVolumeDiscountIndex(-1);
  };

  // Reset additional fee form
  const resetAdditionalFeeForm = () => {
    setCurrentAdditionalFee({
      name: "",
      description: "",
      fee: 0,
      applicableServices: []
    });
    setIsEditingAdditionalFee(false);
    setAdditionalFeeIndex(-1);
  };

  // Reset promotion form
  const resetPromotionForm = () => {
    setCurrentPromotion({
      name: "",
      description: "",
      discountPercentage: 0,
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      applicableServices: []
    });
    setIsEditingPromotion(false);
    setPromotionIndex(-1);
  };

  // Handle service deletion
  const handleDeleteService = (index: number) => {
    const updatedServices = [...carrier.services];
    updatedServices.splice(index, 1);
    setCarrier({
      ...carrier,
      services: updatedServices
    });
  };

  // Handle pricing deletion
  const handleDeletePricing = (serviceIndex: number, pricingIndex: number) => {
    const updatedServices = [...carrier.services];
    updatedServices[serviceIndex].pricing.splice(pricingIndex, 1);
    setCarrier({
      ...carrier,
      services: updatedServices
    });
  };

  // Handle weight range deletion
  const handleDeleteWeightRange = (index: number) => {
    const updatedWeightRanges = [...currentPricing.weightRanges];
    updatedWeightRanges.splice(index, 1);
    setCurrentPricing({
      ...currentPricing,
      weightRanges: updatedWeightRanges
    });
  };

  // Handle volume discount deletion
  const handleDeleteVolumeDiscount = (index: number) => {
    const updatedVolumeDiscounts = [...carrier.volumeDiscounts];
    updatedVolumeDiscounts.splice(index, 1);
    setCarrier({
      ...carrier,
      volumeDiscounts: updatedVolumeDiscounts
    });
  };

  // Handle additional fee deletion
  const handleDeleteAdditionalFee = (index: number) => {
    const updatedAdditionalFees = [...carrier.additionalFees];
    updatedAdditionalFees.splice(index, 1);
    setCarrier({
      ...carrier,
      additionalFees: updatedAdditionalFees
    });
  };

  // Handle promotion deletion
  const handleDeletePromotion = (index: number) => {
    const updatedPromotions = [...carrier.promotions];
    updatedPromotions.splice(index, 1);
    setCarrier({
      ...carrier,
      promotions: updatedPromotions
    });
  };

  // Handle carrier save
  const handleSaveCarrier = async () => {
    // Mostra stato di caricamento
    const loadingToast = toast.loading("Salvataggio del corriere in corso...");
    
    try {
      // Invia i dati al server tramite l'API route
      const response = await fetch('/api/carriers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(carrier),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Errore nella creazione del corriere: ${response.status}`);
      }
      
      // Ottieni i dati dalla risposta
      const data = await response.json();
      console.log("Carrier creato con successo:", data);
      
      // Aggiorna il toast e mostra messaggio di successo
      toast.dismiss(loadingToast);
      toast.success("Corriere aggiunto con successo");
      
      // Torna alla lista dei corrieri dopo un breve ritardo
      setTimeout(() => {
        router.push("/carriers");
      }, 1000);
    } catch (error) {
      console.error("Errore nella creazione del corriere:", error);
      toast.dismiss(loadingToast);
      toast.error(`Impossibile creare il corriere: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
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

  // Calculate margin based on retail and purchase price
  const calculateMargin = (retailPrice: number, purchasePrice: number) => {
    if (retailPrice <= 0 || purchasePrice <= 0) return 0;
    return ((retailPrice - purchasePrice) / retailPrice) * 100;
  };

  // Update margin when retail or purchase price changes
  const handlePriceChange = (field: 'retailPrice' | 'purchasePrice', value: number) => {
    const updatedWeightRange = { ...currentWeightRange, [field]: value };
    const margin = calculateMargin(updatedWeightRange.retailPrice, updatedWeightRange.purchasePrice);
    
    setCurrentWeightRange({
      ...updatedWeightRange,
      margin: Number.parseFloat(margin.toFixed(2))
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2"
            onClick={() => {
              // Check if there are changes before navigating away
              if (
                carrier.name !== "" || 
                carrier.services.length > 0 || 
                carrier.volumeDiscounts.length > 0 || 
                carrier.additionalFees.length > 0 || 
                carrier.promotions.length > 0
              ) {
                setIsDiscardDialogOpen(true);
              } else {
                router.push("/carriers");
              }
            }}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-primary">New Carrier</h1>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setIsDiscardDialogOpen(true)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveCarrier}
            disabled={!carrier.name || carrier.services.length === 0}
          >
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Basic carrier info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Enter the basic information for the carrier
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Carrier Name *</Label>
                <Input 
                  id="name" 
                  value={carrier.name}
                  onChange={(e) => handleCarrierChange("name", e.target.value)}
                  placeholder="E.g. BRT, GLS, DHL"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input 
                  id="logoUrl" 
                  value={carrier.logoUrl}
                  onChange={(e) => handleCarrierChange("logoUrl", e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fuelSurcharge">Fuel Surcharge (%)</Label>
                <Input 
                  id="fuelSurcharge" 
                  type="number"
                  value={carrier.fuelSurcharge}
                  onChange={(e) => handleCarrierChange("fuelSurcharge", Number.parseFloat(e.target.value))}
                  placeholder="E.g. 5.5"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isVolumetric">Volumetric Calculation</Label>
                  <Switch 
                    id="isVolumetric"
                    checked={carrier.isVolumetric}
                    onCheckedChange={(checked) => handleCarrierChange("isVolumetric", checked)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Enable if the carrier uses volumetric weight calculation
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Status</Label>
                <Switch 
                  id="isActive"
                  checked={carrier.isActive}
                  onCheckedChange={(checked) => handleCarrierChange("isActive", checked)}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Enable to make the carrier available in the system
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Services</CardTitle>
              <CardDescription>
                Manage the services offered by the carrier
              </CardDescription>
            </div>
            <Button 
              onClick={() => {
                resetServiceForm();
                setIsServiceDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </CardHeader>
          <CardContent>
            {carrier.services.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <p>No services configured</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    resetServiceForm();
                    setIsServiceDialogOpen(true);
                  }}
                >
                  Add first service
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {carrier.services.map((service, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-medium">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">Code: {service.code}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setCurrentService({ ...service });
                            setIsEditingService(true);
                            setServiceIndex(index);
                            setIsServiceDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteService(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium">Description</p>
                        <p className="text-sm text-muted-foreground">{service.description || "No description"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Delivery Time</p>
                        <p className="text-sm text-muted-foreground">
                          {service.deliveryTimeMin === service.deliveryTimeMax
                            ? `${service.deliveryTimeMin} hours`
                            : `${service.deliveryTimeMin}-${service.deliveryTimeMax} hours`}
                        </p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-medium">Destinations</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {service.destinationTypes.map((type, i) => (
                          <span 
                            key={i} 
                            className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                          >
                            {type === "national" ? "National" : type === "eu" ? "European Union" : "Extra EU"}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium">Pricing</h4>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            resetPricingForm();
                            setSelectedServiceForPricing(service);
                            setIsPricingDialogOpen(true);
                          }}
                        >
                          <Plus className="mr-2 h-3 w-3" />
                          Add Pricing
                        </Button>
                      </div>
                      {service.pricing.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No pricing configured</p>
                      ) : (
                        <div className="space-y-4">
                          {service.pricing.map((pricing, pIndex) => (
                            <div key={pIndex} className="border rounded-lg p-3">
                              <div className="flex justify-between items-center mb-2">
                                <div>
                                  <h5 className="text-sm font-medium">
                                    {pricing.destinationType === "national" 
                                      ? "National" 
                                      : pricing.destinationType === "eu" 
                                        ? "European Union" 
                                        : "Extra EU"}
                                    {pricing.countryCode && (
                                      <span className="ml-1">
                                        - {pricing.destinationType === "eu" 
                                          ? euCountries.find(c => c.id === pricing.countryCode)?.name 
                                          : extraEuCountries.find(c => c.id === pricing.countryCode)?.name}
                                      </span>
                                    )}
                                  </h5>
                                </div>
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => {
                                      setCurrentPricing({ ...pricing });
                                      setSelectedServiceForPricing(service);
                                      setIsEditingPricing(true);
                                      setPricingIndex(pIndex);
                                      setIsPricingDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => handleDeletePricing(index, pIndex)}
                                  >
                                    <Trash2 className="h-3 w-3 text-destructive" />
                                  </Button>
                                </div>
                              </div>
                              <div className="mt-2">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Min Weight (kg)</TableHead>
                                      <TableHead>Max Weight (kg)</TableHead>
                                      <TableHead>Retail Price</TableHead>
                                      <TableHead>Purchase Price</TableHead>
                                      <TableHead>Margin (%)</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {pricing.weightRanges.length === 0 ? (
                                      <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                                          No weight ranges configured
                                        </TableCell>
                                      </TableRow>
                                    ) : (
                                      pricing.weightRanges.map((range, rIndex) => (
                                        <TableRow key={rIndex}>
                                          <TableCell>{range.min}</TableCell>
                                          <TableCell>{range.max}</TableCell>
                                          <TableCell>{range.retailPrice.toFixed(2)} €</TableCell>
                                          <TableCell>{range.purchasePrice.toFixed(2)} €</TableCell>
                                          <TableCell>{range.margin.toFixed(2)}%</TableCell>
                                        </TableRow>
                                      ))
                                    )}
                                  </TableBody>
                                </Table>
                                <div className="flex justify-end mt-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      resetWeightRangeForm();
                                      setCurrentPricing(pricing);
                                      setSelectedServiceForPricing(service);
                                      setIsWeightRangeDialogOpen(true);
                                    }}
                                  >
                                    <Plus className="mr-2 h-3 w-3" />
                                    Add Weight Range
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Volume Discounts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Volume Discounts</CardTitle>
              <CardDescription>
                Configure discounts based on monthly shipping volume
              </CardDescription>
            </div>
            <Button 
              onClick={() => {
                resetVolumeDiscountForm();
                setIsVolumeDiscountDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Discount
            </Button>
          </CardHeader>
          <CardContent>
            {carrier.volumeDiscounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <p>No volume discounts configured</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    resetVolumeDiscountForm();
                    setIsVolumeDiscountDialogOpen(true);
                  }}
                >
                  Add first volume discount
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Min Volume</TableHead>
                    <TableHead>Max Volume</TableHead>
                    <TableHead>Discount (%)</TableHead>
                    <TableHead>Applicable Services</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {carrier.volumeDiscounts.map((discount, index) => (
                    <TableRow key={index}>
                      <TableCell>{discount.minVolume}</TableCell>
                      <TableCell>{discount.maxVolume || "∞"}</TableCell>
                      <TableCell>{discount.discountPercentage}%</TableCell>
                      <TableCell>
                        {discount.applicableServices.length === 0 
                          ? "All services" 
                          : discount.applicableServices.join(", ")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setCurrentVolumeDiscount({ ...discount });
                              setIsEditingVolumeDiscount(true);
                              setVolumeDiscountIndex(index);
                              setIsVolumeDiscountDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteVolumeDiscount(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Additional Fees */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Additional Fees</CardTitle>
              <CardDescription>
                Configure optional additional fees
              </CardDescription>
            </div>
            <Button 
              onClick={() => {
                resetAdditionalFeeForm();
                setIsAdditionalFeeDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Fee
            </Button>
          </CardHeader>
          <CardContent>
            {carrier.additionalFees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <p>No additional fees configured</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    resetAdditionalFeeForm();
                    setIsAdditionalFeeDialogOpen(true);
                  }}
                >
                  Add first additional fee
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Fee (€)</TableHead>
                    <TableHead>Applicable Services</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {carrier.additionalFees.map((fee, index) => (
                    <TableRow key={index}>
                      <TableCell>{fee.name}</TableCell>
                      <TableCell>{fee.description || "-"}</TableCell>
                      <TableCell>{fee.fee.toFixed(2)} €</TableCell>
                      <TableCell>
                        {fee.applicableServices.length === 0 
                          ? "All services" 
                          : fee.applicableServices.join(", ")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setCurrentAdditionalFee({ ...fee });
                              setIsEditingAdditionalFee(true);
                              setAdditionalFeeIndex(index);
                              setIsAdditionalFeeDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteAdditionalFee(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Promotions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Promotions</CardTitle>
              <CardDescription>
                Configure temporary promotions
              </CardDescription>
            </div>
            <Button 
              onClick={() => {
                resetPromotionForm();
                setIsPromotionDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Promotion
            </Button>
          </CardHeader>
          <CardContent>
            {carrier.promotions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <p>No promotions configured</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    resetPromotionForm();
                    setIsPromotionDialogOpen(true);
                  }}
                >
                  Add first promotion
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Discount (%)</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Applicable Services</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {carrier.promotions.map((promotion, index) => (
                    <TableRow key={index}>
                      <TableCell>{promotion.name}</TableCell>
                      <TableCell>{promotion.description || "-"}</TableCell>
                      <TableCell>{promotion.discountPercentage}%</TableCell>
                      <TableCell>
                        {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                      </TableCell>
                      <TableCell>
                        {promotion.applicableServices.length === 0 
                          ? "All services" 
                          : promotion.applicableServices.join(", ")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setCurrentPromotion({ ...promotion });
                              setIsEditingPromotion(true);
                              setPromotionIndex(index);
                              setIsPromotionDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeletePromotion(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Service Dialog */}
      <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditingService ? "Edit Service" : "Add Service"}</DialogTitle>
            <DialogDescription>
              {isEditingService 
                ? "Edit the service information" 
                : "Enter the information for the new service"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serviceName">Service Name *</Label>
                <Input 
                  id="serviceName" 
                  value={currentService.name}
                  onChange={(e) => setCurrentService({ ...currentService, name: e.target.value })}
                  placeholder="E.g. Standard, Express"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceCode">Service Code *</Label>
                <Input 
                  id="serviceCode" 
                  value={currentService.code}
                  onChange={(e) => setCurrentService({ ...currentService, code: e.target.value })}
                  placeholder="E.g. STD, EXP"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="serviceDescription">Description</Label>
              <Textarea 
                id="serviceDescription" 
                value={currentService.description}
                onChange={(e) => setCurrentService({ ...currentService, description: e.target.value })}
                placeholder="Service description"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deliveryTimeMin">Minimum Delivery Time (hours)</Label>
                <Input 
                  id="deliveryTimeMin" 
                  type="number"
                  value={currentService.deliveryTimeMin}
                  onChange={(e) => setCurrentService({ 
                    ...currentService, 
                    deliveryTimeMin: Number.parseInt(e.target.value) 
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryTimeMax">Maximum Delivery Time (hours)</Label>
                <Input 
                  id="deliveryTimeMax" 
                  type="number"
                  value={currentService.deliveryTimeMax}
                  onChange={(e) => setCurrentService({ 
                    ...currentService, 
                    deliveryTimeMax: Number.parseInt(e.target.value) 
                  })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Destinations</Label>
              <div className="flex flex-wrap gap-2">
                {["national", "eu", "extra_eu"].map((type) => (
                  <label 
                    key={type} 
                    className="flex items-center space-x-2 border rounded-md p-2 cursor-pointer hover:bg-muted/30"
                  >
                    <input 
                      type="checkbox" 
                      checked={currentService.destinationTypes.includes(type as any)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCurrentService({
                            ...currentService,
                            destinationTypes: [...currentService.destinationTypes, type as any]
                          });
                        } else {
                          setCurrentService({
                            ...currentService,
                            destinationTypes: currentService.destinationTypes.filter(t => t !== type)
                          });
                        }
                      }}
                      className="h-4 w-4"
                    />
                    <span>
                      {type === "national" ? "National" : type === "eu" ? "European Union" : "Extra EU"}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsServiceDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleServiceSubmit}
              disabled={!currentService.name || !currentService.code || currentService.destinationTypes.length === 0}
            >
              {isEditingService ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pricing Dialog */}
      <Dialog open={isPricingDialogOpen} onOpenChange={setIsPricingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditingPricing ? "Edit Pricing" : "Add Pricing"}</DialogTitle>
            <DialogDescription>
              {isEditingPricing 
                ? "Edit the pricing information" 
                : "Enter the information for the new pricing"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="destinationType">Destination Type *</Label>
              <Select 
                value={currentPricing.destinationType}
                onValueChange={(value) => setCurrentPricing({ 
                  ...currentPricing, 
                  destinationType: value as any,
                  countryCode: null // Reset country code when destination type changes
                })}
              >
                <SelectTrigger id="destinationType">
                  <SelectValue placeholder="Select destination type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="national">National</SelectItem>
                  <SelectItem value="eu">European Union</SelectItem>
                  <SelectItem value="extra_eu">Extra EU</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {currentPricing.destinationType !== "national" && (
              <div className="space-y-2">
                <Label htmlFor="countryCode">Country (optional)</Label>
                <Select 
                  value={currentPricing.countryCode || "all"}
                  onValueChange={(value) => setCurrentPricing({ 
                    ...currentPricing, 
                    countryCode: value === "all" ? null : value
                  })}
                >
                  <SelectTrigger id="countryCode">
                    <SelectValue placeholder="All countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All countries</SelectItem>
                    {(currentPricing.destinationType === "eu" ? euCountries : extraEuCountries).map((country) => (
                      <SelectItem key={country.id} value={country.id}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  If you don't select a specific country, this pricing will apply to all countries of the selected destination type.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPricingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePricingSubmit}>
              {isEditingPricing ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Weight Range Dialog */}
      <Dialog open={isWeightRangeDialogOpen} onOpenChange={setIsWeightRangeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditingWeightRange ? "Edit Weight Range" : "Add Weight Range"}</DialogTitle>
            <DialogDescription>
              {isEditingWeightRange 
                ? "Edit the weight range information" 
                : "Enter the information for the new weight range"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weightMin">Minimum Weight (kg) *</Label>
                <Input 
                  id="weightMin" 
                  type="number"
                  step="0.01"
                  value={currentWeightRange.min}
                  onChange={(e) => setCurrentWeightRange({ 
                    ...currentWeightRange, 
                    min: Number.parseFloat(e.target.value) 
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weightMax">Maximum Weight (kg) *</Label>
                <Input 
                  id="weightMax" 
                  type="number"
                  step="0.01"
                  value={currentWeightRange.max}
                  onChange={(e) => setCurrentWeightRange({ 
                    ...currentWeightRange, 
                    max: Number.parseFloat(e.target.value) 
                  })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="retailPrice">Retail Price (€) *</Label>
                <Input 
                  id="retailPrice" 
                  type="number"
                  step="0.01"
                  value={currentWeightRange.retailPrice}
                  onChange={(e) => handlePriceChange('retailPrice', Number.parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Purchase Price (€) *</Label>
                <Input 
                  id="purchasePrice" 
                  type="number"
                  step="0.01"
                  value={currentWeightRange.purchasePrice}
                  onChange={(e) => handlePriceChange('purchasePrice', Number.parseFloat(e.target.value))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="margin">Margin (%)</Label>
              <Input 
                id="margin" 
                type="number"
                step="0.01"
                value={currentWeightRange.margin}
                readOnly
                className="bg-muted/30"
              />
              <p className="text-xs text-muted-foreground">
                The margin is automatically calculated based on retail and purchase prices.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWeightRangeDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleWeightRangeSubmit}
              disabled={
                currentWeightRange.min < 0 || 
                currentWeightRange.max <= currentWeightRange.min || 
                currentWeightRange.retailPrice <= 0 || 
                currentWeightRange.purchasePrice <= 0
              }
            >
              {isEditingWeightRange ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Volume Discount Dialog */}
      <Dialog open={isVolumeDiscountDialogOpen} onOpenChange={setIsVolumeDiscountDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditingVolumeDiscount ? "Edit Volume Discount" : "Add Volume Discount"}</DialogTitle>
            <DialogDescription>
              {isEditingVolumeDiscount 
                ? "Edit the volume discount information" 
                : "Enter the information for the new volume discount"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minVolume">Minimum Volume *</Label>
                <Input 
                  id="minVolume" 
                  type="number"
                  value={currentVolumeDiscount.minVolume}
                  onChange={(e) => setCurrentVolumeDiscount({ 
                    ...currentVolumeDiscount, 
                    minVolume: Number.parseInt(e.target.value) 
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxVolume">Maximum Volume (optional)</Label>
                <Input 
                  id="maxVolume" 
                  type="number"
                  value={currentVolumeDiscount.maxVolume || ""}
                  onChange={(e) => setCurrentVolumeDiscount({ 
                    ...currentVolumeDiscount, 
                    maxVolume: e.target.value ? Number.parseInt(e.target.value) : null
                  })}
                  placeholder="Unlimited"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="discountPercentage">Discount Percentage (%) *</Label>
              <Input 
                id="discountPercentage" 
                type="number"
                step="0.01"
                value={currentVolumeDiscount.discountPercentage}
                onChange={(e) => setCurrentVolumeDiscount({ 
                  ...currentVolumeDiscount, 
                  discountPercentage: Number.parseFloat(e.target.value) 
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Applicable Services</Label>
              <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                {carrier.services.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No services available</p>
                ) : (
                  <div className="space-y-2">
                    {carrier.services.map((service, index) => (
                      <label key={index} className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          checked={currentVolumeDiscount.applicableServices.includes(service.code)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCurrentVolumeDiscount({
                                ...currentVolumeDiscount,
                                applicableServices: [...currentVolumeDiscount.applicableServices, service.code]
                              });
                            } else {
                              setCurrentVolumeDiscount({
                                ...currentVolumeDiscount,
                                applicableServices: currentVolumeDiscount.applicableServices.filter(s => s !== service.code)
                              });
                            }
                          }}
                          className="h-4 w-4"
                        />
                        <span>{service.name} ({service.code})</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                If you don't select any services, the discount will apply to all services.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVolumeDiscountDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleVolumeDiscountSubmit}
              disabled={
                currentVolumeDiscount.minVolume < 0 || 
                (currentVolumeDiscount.maxVolume !== null && currentVolumeDiscount.maxVolume <= currentVolumeDiscount.minVolume) || 
                currentVolumeDiscount.discountPercentage <= 0
              }
            >
              {isEditingVolumeDiscount ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Additional Fee Dialog */}
      <Dialog open={isAdditionalFeeDialogOpen} onOpenChange={setIsAdditionalFeeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditingAdditionalFee ? "Edit Additional Fee" : "Add Additional Fee"}</DialogTitle>
            <DialogDescription>
              {isEditingAdditionalFee 
                ? "Edit the additional fee information" 
                : "Enter the information for the new additional fee"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="feeName">Fee Name *</Label>
              <Input 
                id="feeName" 
                value={currentAdditionalFee.name}
                onChange={(e) => setCurrentAdditionalFee({ 
                  ...currentAdditionalFee, 
                  name: e.target.value 
                })}
                placeholder="E.g. Floor delivery, Insurance"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feeDescription">Description</Label>
              <Textarea 
                id="feeDescription" 
                value={currentAdditionalFee.description}
                onChange={(e) => setCurrentAdditionalFee({ 
                  ...currentAdditionalFee, 
                  description: e.target.value 
                })}
                placeholder="Fee description"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fee">Fee (€) *</Label>
              <Input 
                id="fee" 
                type="number"
                step="0.01"
                value={currentAdditionalFee.fee}
                onChange={(e) => setCurrentAdditionalFee({ 
                  ...currentAdditionalFee, 
                  fee: Number.parseFloat(e.target.value) 
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Applicable Services</Label>
              <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                {carrier.services.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No services available</p>
                ) : (
                  <div className="space-y-2">
                    {carrier.services.map((service, index) => (
                      <label key={index} className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          checked={currentAdditionalFee.applicableServices.includes(service.code)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCurrentAdditionalFee({
                                ...currentAdditionalFee,
                                applicableServices: [...currentAdditionalFee.applicableServices, service.code]
                              });
                            } else {
                              setCurrentAdditionalFee({
                                ...currentAdditionalFee,
                                applicableServices: currentAdditionalFee.applicableServices.filter(s => s !== service.code)
                              });
                            }
                          }}
                          className="h-4 w-4"
                        />
                        <span>{service.name} ({service.code})</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                If you don't select any services, the fee will apply to all services.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdditionalFeeDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAdditionalFeeSubmit}
              disabled={!currentAdditionalFee.name || currentAdditionalFee.fee <= 0}
            >
              {isEditingAdditionalFee ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Promotion Dialog */}
      <Dialog open={isPromotionDialogOpen} onOpenChange={setIsPromotionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditingPromotion ? "Edit Promotion" : "Add Promotion"}</DialogTitle>
            <DialogDescription>
              {isEditingPromotion 
                ? "Edit the promotion information" 
                : "Enter the information for the new promotion"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="promotionName">Promotion Name *</Label>
              <Input 
                id="promotionName" 
                value={currentPromotion.name}
                onChange={(e) => setCurrentPromotion({ ...currentPromotion, name: e.target.value })}
                placeholder="E.g. Summer Sale, 20% Discount"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="promotionDescription">Description</Label>
              <Textarea 
                id="promotionDescription" 
                value={currentPromotion.description}
                onChange={(e) => setCurrentPromotion({ ...currentPromotion, description: e.target.value })}
                placeholder="Promotion description"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discountPercentage">Discount Percentage *</Label>
              <Input 
                id="discountPercentage" 
                type="number"
                step="0.01"
                value={currentPromotion.discountPercentage}
                onChange={(e) => setCurrentPromotion({ 
                  ...currentPromotion, 
                  discountPercentage: Number.parseFloat(e.target.value) 
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input 
                id="startDate" 
                type="date"
                value={currentPromotion.startDate.toISOString().split('T')[0]}
                onChange={(e) => setCurrentPromotion({ 
                  ...currentPromotion, 
                  startDate: new Date(e.target.value) 
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input 
                id="endDate" 
                type="date"
                value={currentPromotion.endDate.toISOString().split('T')[0]}
                onChange={(e) => setCurrentPromotion({ 
                  ...currentPromotion, 
                  endDate: new Date(e.target.value) 
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Applicable Services</Label>
              <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                {carrier.services.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No services available</p>
                ) : (
                  <div className="space-y-2">
                    {carrier.services.map((service, index) => (
                      <label key={index} className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          checked={currentPromotion.applicableServices.includes(service.code)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCurrentPromotion({
                                ...currentPromotion,
                                applicableServices: [...currentPromotion.applicableServices, service.code]
                              });
                            } else {
                              setCurrentPromotion({
                                ...currentPromotion,
                                applicableServices: currentPromotion.applicableServices.filter(s => s !== service.code)
                              });
                            }
                          }}
                          className="h-4 w-4"
                        />
                        <span>{service.name} ({service.code})</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                If you don't select any services, the promotion will apply to all services.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPromotionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePromotionSubmit}
              disabled={!currentPromotion.name || currentPromotion.discountPercentage <= 0}
            >
              {isEditingPromotion ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

