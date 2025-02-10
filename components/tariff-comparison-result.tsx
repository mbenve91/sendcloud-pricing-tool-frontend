"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingDown, TrendingUp, ChevronDown } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface TariffRange {
  range: string
  retailPrice: number
  purchasePrice: number
  margin: number
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
  clientData,
}: TariffComparisonResultProps & {
  clientData: {
    verticalMarket: string
    monthlyShipments: number
    averageWeight: number
    currentCourier: string
    ecommerceUrl?: string
  }
}) {
  const [selectedCourier, setSelectedCourier] = useState(suggestedCourier)
  const [currentPrice, setCurrentPrice] = useState(suggestedPrice)
  const [currentMonthlyProfit, setCurrentMonthlyProfit] = useState(monthlyProfit)
  const [currentMonthlySavings, setCurrentMonthlySavings] = useState(monthlySavings)
  const [currentMargin, setCurrentMargin] = useState(margin)
  const [isExpanded, setIsExpanded] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)

  const minPrice = purchasePrice + (margin * 0.1)

  const handleCourierChange = (value: string) => {
    setSelectedCourier(value)
    // In a real scenario, you would fetch new prices for the selected courier
  }

  const handlePriceChange = (value: number[]) => {
    const newPrice = value[0]
    setCurrentPrice(newPrice)
    
    // Calcola il nuovo margine
    const newMargin = newPrice - purchasePrice
    setCurrentMargin(newMargin)
    
    // Ricalcola il profitto mensile
    const newMonthlyProfit = newMargin * monthlyShipments
    setCurrentMonthlyProfit(newMonthlyProfit)
    
    // Ricalcola i risparmi mensili
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Customer Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vertical Market:</span>
                <span className="font-medium">{clientData.verticalMarket}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly Volume:</span>
                <span className="font-medium">{clientData.monthlyShipments} shipments</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Average Weight:</span>
                <span className="font-medium">{clientData.averageWeight} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Courier:</span>
                <span className="font-medium">{clientData.currentCourier}</span>
              </div>
            </div>
            {clientData.ecommerceUrl && (
              <div className="col-span-2">
                <span className="text-muted-foreground">E-commerce URL:</span>
                <a href={clientData.ecommerceUrl} target="_blank" rel="noopener noreferrer" 
                   className="ml-2 text-blue-600 hover:underline">
                  {clientData.ecommerceUrl}
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Rate Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <label className="text-sm font-medium">Selected Courier</label>
            <Select value={selectedCourier} onValueChange={handleCourierChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a courier" />
              </SelectTrigger>
              <SelectContent>
                {(availableCarriers || []).map(carrier => (
                  <SelectItem key={carrier.id} value={carrier.name}>
                    {carrier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-6 mt-4">
            <div>
              <label className="text-sm text-muted-foreground">Suggested Price</label>
              <Slider
                min={minPrice}
                max={retailPrice}
                step={0.01}
                value={[currentPrice]}
                onValueChange={handlePriceChange}
                defaultValue={[suggestedPrice]}
              />
              <div className="flex justify-between text-sm">
                <span>Min: €{minPrice.toFixed(2)}</span>
                <span>Max: €{retailPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium">Monthly Savings</h4>
                <p className="text-2xl font-bold text-green-600">
                  €{currentMonthlySavings.toFixed(2)}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Monthly Profit</h4>
                <p className="text-2xl font-bold text-blue-600">
                  €{currentMonthlyProfit.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">AI Recommendation</h4>
              <p className="text-sm text-muted-foreground">{explanation}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={onGenerateProposal} className="w-full">
        Generate Proposal
      </Button>
    </div>
  )
}

