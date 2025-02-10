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
}: TariffComparisonResultProps) {
  const [selectedCourier, setSelectedCourier] = useState(suggestedCourier)
  const [currentPrice, setCurrentPrice] = useState(suggestedPrice)
  const [currentMonthlyProfit, setCurrentMonthlyProfit] = useState(monthlyProfit)
  const [currentMonthlySavings, setCurrentMonthlySavings] = useState(monthlySavings)
  const [currentMargin, setCurrentMargin] = useState(margin)
  const [isExpanded, setIsExpanded] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)

  const maxDiscount = margin * 0.9

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
    
    // Ricalcola il profitto mensile basato sul nuovo prezzo
    // Assumiamo che monthlyProfit sia basato su suggestedPrice
    const shipments = monthlyProfit / (suggestedPrice - purchasePrice)
    const newMonthlyProfit = newMargin * shipments
    setCurrentMonthlyProfit(newMonthlyProfit)
    
    // Ricalcola i risparmi mensili
    // Assumiamo che monthlySavings sia basato su retailPrice
    const originalSavingsPerUnit = retailPrice - suggestedPrice
    const newSavingsPerUnit = retailPrice - newPrice
    const newMonthlySavings = (newSavingsPerUnit / originalSavingsPerUnit) * monthlySavings
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
          <CardTitle className="text-xl font-bold">Analisi Tariffe</CardTitle>
          <div className="flex gap-2">
            <Badge variant="secondary">{weightRange}</Badge>
            {isVolumetric && <Badge variant="outline">Volumetrico</Badge>}
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
              <SelectItem value="sendcloud">Sendcloud</SelectItem>
              <SelectItem value="dhl">DHL</SelectItem>
              <SelectItem value="ups">UPS</SelectItem>
              {/* Add more courier options as needed */}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Tariffa Suggerita</label>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">€{currentPrice.toFixed(2)}</span>
            <div className="flex flex-col items-end gap-1">
              <Badge variant="outline" className="text-sm">
                Prezzo Base: €{retailPrice.toFixed(2)}
              </Badge>
              {fuelSurcharge > 0 && (
                <span className="text-xs text-muted-foreground">
                  +{fuelSurcharge}% carburante
                </span>
              )}
            </div>
          </div>
          <Slider
            min={purchasePrice}
            max={retailPrice}
            step={0.01}
            value={[currentPrice]}
            onValueChange={handlePriceChange}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Min: €{purchasePrice.toFixed(2)}</span>
            <span>Max: €{retailPrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Risparmio Mensile</span>
            <div className="flex items-center">
              <TrendingDown className="w-4 h-4 mr-2 text-green-500" />
              <span className="text-2xl font-bold">€{currentMonthlySavings.toFixed(2)}</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Profitto Mensile</span>
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
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
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Weight Range</TableHead>
                          <TableHead>Retail Price</TableHead>
                          <TableHead>Purchase Price</TableHead>
                          <TableHead>Margin</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allTariffs.map((tariff, index) => (
                          <TableRow key={index}>
                            <TableCell>{tariff.range}</TableCell>
                            <TableCell>€{tariff.retailPrice.toFixed(2)}</TableCell>
                            <TableCell>€{tariff.purchasePrice.toFixed(2)}</TableCell>
                            <TableCell>€{tariff.margin.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
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
          Genera Proposta
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </CardContent>
    </Card>
  )
}

