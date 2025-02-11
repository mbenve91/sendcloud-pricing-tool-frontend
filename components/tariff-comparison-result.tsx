"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingDown, TrendingUp, ChevronDown, EuroIcon, PiggyBank } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"

interface TariffRange {
  range: string
  retailPrice: number
  purchasePrice: number
  margin: number
}

interface CarrierData {
  id: string
  name: string
  services: {
    range: string
    retailPrice: number
    purchasePrice: number
    margin: number
    weightRange: {
      min: number
      max: number
    }
  }[]
  fuelSurcharge: number
  isVolumetric: boolean
}

interface TariffComparisonResultProps {
  suggestedCourier: string
  weightRange: string
  retailPrice: number
  suggestedPrice: number
  purchasePrice: number
  margin: number
  monthlyProfit: number
  monthlySavings: number
  explanation: string
  fuelSurcharge: number
  isVolumetric: boolean
  onGenerateProposal: () => void
  availableCarriers: { id: string; name: string }[]
  monthlyShipments: number
  maxDiscount: number
  carriersData: CarrierData[]
  recommendation: {
    carrierName: string
    serviceName: string
    basePrice: number
    suggestedPrice: number
    explanation: string
  }
  averageWeight: number
}

export function TariffComparisonResult({
  suggestedCourier,
  weightRange,
  retailPrice,
  suggestedPrice,
  purchasePrice,
  margin,
  monthlyProfit,
  monthlySavings,
  explanation,
  fuelSurcharge,
  isVolumetric,
  onGenerateProposal,
  availableCarriers = [],
  monthlyShipments,
  maxDiscount,
  carriersData,
  recommendation,
  averageWeight,
}: TariffComparisonResultProps) {
  const [selectedCourier, setSelectedCourier] = useState(recommendation.carrierName)
  const [currentPrice, setCurrentPrice] = useState(suggestedPrice)
  const [currentMonthlyProfit, setCurrentMonthlyProfit] = useState(monthlyProfit)
  const [currentMonthlySavings, setCurrentMonthlySavings] = useState(monthlySavings)
  const [currentMargin, setCurrentMargin] = useState(margin)
  const [isExpanded, setIsExpanded] = useState(false)
  const [includeFuelSurcharge, setIncludeFuelSurcharge] = useState(true)
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)

  const minPrice = purchasePrice + (margin * 0.1)

  const calculatePriceWithSurcharge = (basePrice: number, carrierFuelSurcharge: number = fuelSurcharge) => {
    return includeFuelSurcharge ? basePrice * (1 + carrierFuelSurcharge/100) : basePrice
  }

  const handleCourierChange = (value: string) => {
    setSelectedCourier(value)
    const carrier = carriersData.find(c => c.name === value)
    if (carrier) {
      const appropriateService = carrier.services.find(s => 
        s.weightRange && averageWeight >= s.weightRange.min && averageWeight <= s.weightRange.max
      )
      
      if (appropriateService) {
        const priceWithSurcharge = calculatePriceWithSurcharge(appropriateService.retailPrice, carrier.fuelSurcharge)
        setCurrentPrice(priceWithSurcharge)
        setCurrentMargin(appropriateService.margin)
        updateCalculations(priceWithSurcharge, appropriateService.purchasePrice)
      }
    }
  }

  const handleSliderChange = (values: number[]) => {
    const newPrice = values[0]
    setCurrentPrice(newPrice)
    
    const currentCarrier = carriersData.find(c => c.name === selectedCourier)
    if (currentCarrier) {
      const appropriateService = currentCarrier.services.find(s => 
        s.weightRange && averageWeight >= s.weightRange.min && averageWeight <= s.weightRange.max
      )
      
      if (appropriateService) {
        updateCalculations(newPrice, appropriateService.purchasePrice)
      }
    }
  }

  const handleFuelSurchargeToggle = (checked: boolean) => {
    setIncludeFuelSurcharge(checked)
    const currentCarrier = carriersData.find(c => c.name === selectedCourier)
    if (currentCarrier) {
      const appropriateService = currentCarrier.services.find(s => 
        s.weightRange && averageWeight >= s.weightRange.min && averageWeight <= s.weightRange.max
      )
      
      if (appropriateService) {
        const newPrice = calculatePriceWithSurcharge(appropriateService.retailPrice)
        setCurrentPrice(newPrice)
        updateCalculations(newPrice, appropriateService.purchasePrice)
      }
    }
  }

  const updateCalculations = (newPrice: number, purchasePrice: number) => {
    const newMargin = newPrice - purchasePrice
    setCurrentMargin(newMargin)
    
    const newMonthlyProfit = newMargin * monthlyShipments
    setCurrentMonthlyProfit(newMonthlyProfit)
    
    const savingsPerShipment = retailPrice - newPrice
    const newMonthlySavings = savingsPerShipment * monthlyShipments
    setCurrentMonthlySavings(newMonthlySavings)
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(isExpanded ? contentRef.current.scrollHeight : 0)
    }
  }, [isExpanded])

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">Analysis</CardTitle>
          <div className="flex gap-2">
            <Badge variant="secondary">{weightRange}</Badge>
            {isVolumetric && <Badge variant="outline">Volumetric</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Selected Courier</label>
          <Select value={selectedCourier} onValueChange={handleCourierChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a courier" />
            </SelectTrigger>
            <SelectContent>
              {availableCarriers.map(carrier => (
                <SelectItem key={carrier.id} value={carrier.name}>
                  {carrier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Suggested Rate</label>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">€{currentPrice.toFixed(2)}</span>
            <div className="flex flex-col items-end gap-1">
              <Badge variant="outline" className="text-sm">
                Base Price: €{retailPrice.toFixed(2)}
              </Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Fuel Surcharge ({fuelSurcharge}%)</span>
                <Switch
                  checked={includeFuelSurcharge}
                  onCheckedChange={handleFuelSurchargeToggle}
                />
              </div>
            </div>
          </div>
          <Slider
            min={minPrice}
            max={retailPrice}
            step={0.01}
            value={[currentPrice]}
            onValueChange={handleSliderChange}
            defaultValue={[suggestedPrice]}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Min: €{minPrice.toFixed(2)}</span>
            <span>Max: €{retailPrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Customer Monthly Savings</span>
            <div className="flex items-center">
              <PiggyBank className="w-4 h-4 mr-2 text-green-500" />
              <span className="text-2xl font-bold">€{currentMonthlySavings.toFixed(2)}</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Sendcloud Monthly Margin</span>
            <div className="flex items-center">
              <EuroIcon className="w-4 h-4 mr-2 text-blue-500" />
              <span className="text-2xl font-bold">€{currentMonthlyProfit.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div>
          <Button variant="outline" onClick={toggleExpand} className="w-full flex items-center justify-between">
            <span>View All Weight Ranges</span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
          </Button>
          <motion.div
            style={{ height: contentHeight }}
            animate={{ height: contentHeight }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div ref={contentRef}>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    className="pt-4"
                  >
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Weight Range</TableHead>
                          <TableHead>List Price</TableHead>
                          <TableHead>Discounted Price</TableHead>
                          <TableHead>Margin</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {carriersData.find(c => c.name === selectedCourier)?.services.map((service, index) => {
                          if (!service.weightRange) return null;
                          
                          const discountPercentage = (retailPrice - currentPrice) / (retailPrice - purchasePrice)
                          const discountedPrice = service.retailPrice - (discountPercentage * (service.retailPrice - service.purchasePrice))
                          
                          return (
                            <TableRow key={index}>
                              <TableCell>{service.range}</TableCell>
                              <TableCell>€{service.retailPrice.toFixed(2)}</TableCell>
                              <TableCell>€{discountedPrice.toFixed(2)}</TableCell>
                              <TableCell>€{(discountedPrice - service.purchasePrice).toFixed(2)}</TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        <div className="bg-muted p-3 rounded-lg text-sm">
          <p>{explanation}</p>
        </div>

        <Button className="w-full" onClick={onGenerateProposal}>
          Generate Proposal
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </CardContent>
    </Card>
  )
}

