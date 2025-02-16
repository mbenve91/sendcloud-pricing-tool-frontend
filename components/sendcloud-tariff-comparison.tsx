"use client"

import type React from "react"
import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, Package, Truck, Mail, ArrowRight } from "lucide-react"
import { TariffComparisonResult } from "./tariff-comparison-result"
import { ChatInterface } from "./chat-interface"
import { motion, AnimatePresence } from "framer-motion"

interface FormSection {
  id: string
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}

interface TariffAnalysisResult {
  carrierName: string
  serviceName: string
  basePrice: number
  suggestedPrice: number
  purchasePrice: number
  margin: number
  monthlyProfit: number
  monthlySavings: number
  weightRange: {
    min: number
    max: number
  }
  fuelSurcharge: number
  isVolumetric: boolean
  explanation: string
  availableCarriers: { id: string; name: string }[]
  maxDiscount: number
  carriersData: {
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
  }[]
  recommendation?: {
    carrierName: string
    serviceName: string
    basePrice: number
    suggestedPrice: number
    explanation: string
  }
}

const allTariffs = [
  { range: "0-2kg", retailPrice: 5.5, purchasePrice: 4.49, margin: 1.01 },
  { range: "2-5kg", retailPrice: 5.8, purchasePrice: 4.79, margin: 1.01 },
  { range: "5-10kg", retailPrice: 8.19, purchasePrice: 7.18, margin: 1.01 },
  { range: "10-25kg", retailPrice: 11.36, purchasePrice: 10.35, margin: 1.01 },
  { range: "25-50kg", retailPrice: 18.18, purchasePrice: 16.16, margin: 2.02 },
]

const SendcloudLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 379.4 108.6" className="w-32 h-auto">
    <defs>
      <linearGradient
        id="linear-gradient"
        x1="0"
        y1="56.7"
        x2="108.6"
        y2="56.7"
        gradientTransform="translate(0 111) scale(1 -1)"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stopColor="#00d2f6" />
        <stop offset="1" stopColor="#1d96ff" />
      </linearGradient>
    </defs>
    <path
      fill="url(#linear-gradient)"
      fillRule="evenodd"
      d="m32.5,0h43.6c11.3,0,15.4,1.2,19.5,3.4,4.1,2.2,7.4,5.4,9.6,9.6,2.2,4.1,3.4,8.2,3.4,19.5v43.6c0,11.3-1.2,15.4-3.4,19.5s-5.4,7.4-9.6,9.6c-4.1,2.2-8.2,3.4-19.5,3.4h-43.6c-11.3,0-15.4-1.2-19.5-3.4s-7.4-5.4-9.6-9.6c-2.2-4.1-3.4-8.2-3.4-19.5v-43.6c0-11.3,1.2-15.4,3.4-19.5,2.2-4.1,5.4-7.4,9.6-9.6C17.1,1.2,21.2,0,32.5,0Z"
    />
    <path
      fill="#fff"
      d="m90.8,60.9c0-8.6-6.6-15.8-15-16.7-1.2-4.3-3.8-8.3-7.3-11.2-4-3.3-9.1-5.2-14.4-5.2s-10.3,1.8-14.4,5.2c-3.5,2.9-6,6.8-7.3,11.2-8.4.9-15,8-15,16.7h0c0,.8.1,6.7,4.5,11.3,3.4,3.5,8.2,5.2,14.5,5.2s11.9-1,17.6-3.1c1.8.6,3.6,1.2,5.4,1.6,4,1,8.1,1.5,12.1,1.5,6.3,0,11.1-1.8,14.5-5.2,4.7-4.6,4.8-10.4,4.8-11.3h0Zm-4.5,0h0s.1,4.7-3.3,8.1c-2.5,2.5-6.2,3.8-11.1,3.8-8.4,0-15.1-2.3-19.3-4.2-4-1.8-6.5-3.6-7.1-4.1-.1,0-.1-.1-.1-.2v-9.8c0-.2.1-.3.3-.4l8.6-4.4c.1-.1.3-.1.4,0l8.6,4.4c.2.1.3.2.3.4v9.6c0,.1-.1.3-.1.3-.4.3-1.9,1.4-4.2,2.7,1.9.6,4.1,1.1,6.4,1.4.5-.4.8-.6.8-.6h0c.8-.7,1.7-2,1.7-3.8v-9.6c0-1.9-1.1-3.6-2.7-4.5l-8.6-4.4c-1.4-.7-3.2-.7-4.6,0l-8.6,4.4c-1.7.9-2.7,2.6-2.7,4.5v9.6c0,1.7.9,3.1,1.7,3.8h0c.1.1,2,1.6,5.5,3.5-3.7.9-7.4,1.3-11.2,1.3-4.9,0-8.7-1.3-11.1-3.8-3.3-3.4-3.3-8-3.3-8.1h0v-.1c0-6.7,5.5-12.2,12.2-12.2h1.9l.4-1.9c.8-4,3-7.7,6.1-10.3,3.2-2.7,7.3-4.1,11.4-4.1s8.2,1.5,11.4,4.1,5.3,6.3,6.1,10.3l.4,1.9h1.9c6.4.2,11.9,5.6,11.9,12.4h0Z"
    />
  </svg>
)

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sendcloud-pricing-tool-backend.onrender.com';

export default function SendcloudTariffComparison() {
  const [formData, setFormData] = useState({
    ecommerceUrl: "",
    verticalMarket: "",
    monthlyShipments: "",
    averageWeight: "",
    currentCourier: "",
    email: "",
    weightType: "weight"
  })
  const [showResults, setShowResults] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<TariffAnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showChat, setShowChat] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      // Prima analizza l'e-commerce se è stato fornito un URL
      let ecommerceAnalysis = null;
      if (formData.ecommerceUrl) {
        console.log('🚀 Starting ecommerce analysis for:', formData.ecommerceUrl);
        
        const ecommerceResponse = await fetch(`${API_URL}/api/ecommerce/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ecommerceUrl: formData.ecommerceUrl
          })
        });
        
        console.log('📡 Ecommerce analysis response status:', ecommerceResponse.status);
        
        if (!ecommerceResponse.ok) {
          const errorData = await ecommerceResponse.json();
          console.error('❌ Ecommerce analysis error:', errorData);
          throw new Error(`Ecommerce analysis failed: ${errorData.error || 'Unknown error'}`);
        }
        
        ecommerceAnalysis = await ecommerceResponse.json();
        console.log('✅ Ecommerce analysis result:', ecommerceAnalysis);
      }

      // Log prima dell'analisi delle tariffe
      console.log('📦 Starting tariff analysis with data:', {
        monthlyShipments: formData.monthlyShipments,
        averageWeight: formData.averageWeight,
        isVolumetric: formData.weightType === "volume" || (ecommerceAnalysis?.isVolumetric ?? false),
        verticalMarket: formData.verticalMarket || ecommerceAnalysis?.verticalMarket,
        currentCourier: formData.currentCourier || ecommerceAnalysis?.currentCouriers?.[0]
      });

      // Poi procedi con l'analisi delle tariffe
      const response = await fetch(`${API_URL}/api/carriers/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          monthlyShipments: parseInt(formData.monthlyShipments),
          averageWeight: parseFloat(formData.averageWeight),
          isVolumetric: formData.weightType === "volume" || (ecommerceAnalysis?.isVolumetric ?? false),
          verticalMarket: formData.verticalMarket || ecommerceAnalysis?.verticalMarket,
          currentCourier: formData.currentCourier || ecommerceAnalysis?.currentCouriers?.[0],
          ecommerceAnalysis // Passa l'analisi completa per ulteriori considerazioni
        })
      });

      if (!response.ok) {
        throw new Error('Request failed')
      }

      const result = await response.json()
      setAnalysisResult({
        carrierName: result.recommendation.carrierName,
        serviceName: result.recommendation.serviceName,
        basePrice: result.recommendation.basePrice,
        suggestedPrice: result.recommendation.suggestedPrice,
        purchasePrice: result.recommendation.purchasePrice,
        margin: result.recommendation.margin,
        monthlyProfit: result.recommendation.monthlyProfit,
        monthlySavings: result.recommendation.monthlySavings,
        weightRange: result.recommendation.weightRange,
        fuelSurcharge: result.recommendation.fuelSurcharge,
        isVolumetric: result.recommendation.isVolumetric,
        explanation: result.recommendation.explanation,
        availableCarriers: result.availableCarriers,
        maxDiscount: result.maxDiscount,
        carriersData: result.carriersData
      })
      setShowResults(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateProposal = () => {
    setShowChat(true)
  }

  const sections: FormSection[] = [
    {
      id: "1",
      icon: <Globe className="h-4 w-4" />,
      title: "E-commerce Information",
      children: (
        <div className="space-y-2">
          <Input
            type="url"
            name="ecommerceUrl"
            placeholder="E-commerce URL"
            value={formData.ecommerceUrl}
            onChange={handleInputChange}
            className="focus:ring-0 focus:ring-offset-0"
          />
          <Input
            type="text"
            name="verticalMarket"
            placeholder="Vertical Market"
            value={formData.verticalMarket}
            onChange={handleInputChange}
            className="focus:ring-0 focus:ring-offset-0"
          />
        </div>
      ),
    },
    {
      id: "2",
      icon: <Package className="h-4 w-4" />,
      title: "Shipping Details",
      children: (
        <div className="space-y-2">
          <Input
            type="number"
            name="monthlyShipments"
            placeholder="Monthly Shipments"
            value={formData.monthlyShipments}
            onChange={handleInputChange}
            className="focus:ring-0 focus:ring-offset-0"
          />
          <Input
            type="number"
            name="averageWeight"
            placeholder="Average package weight (kg)"
            value={formData.averageWeight}
            onChange={handleInputChange}
            className="focus:ring-0 focus:ring-offset-0"
          />
        </div>
      ),
    },
    {
      id: "3",
      icon: <Truck className="h-4 w-4" />,
      title: "Courier Information",
      children: (
        <div className="space-y-2">
          <Input
            type="text"
            name="currentCourier"
            placeholder="Current Courier"
            value={formData.currentCourier}
            onChange={handleInputChange}
            className="focus:ring-0 focus:ring-offset-0"
          />
        </div>
      ),
    },
    {
      id: "4",
      icon: <Mail className="h-4 w-4" />,
      title: "Contact Information",
      children: (
        <div className="space-y-2">
          <Input
            type="email"
            name="email"
            placeholder="Email for proposal"
            value={formData.email}
            onChange={handleInputChange}
            className="focus:ring-0 focus:ring-offset-0"
          />
        </div>
      ),
    },
  ]

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="flex justify-center">
        <motion.div
          className={`transition-all duration-300 ease-in-out ${showChat ? "w-1/2 pr-4" : "w-full max-w-lg"}`}
          layout
        >
          {!showResults ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <SendcloudLogo />
                  <CardTitle>Enter Shipping Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <Accordion type="single" collapsible className="w-full mb-6">
                    {sections.map((section) => (
                      <AccordionItem key={section.id} value={section.id}>
                        <AccordionTrigger className="flex items-center gap-2">
                          {section.icon}
                          <span>{section.title}</span>
                        </AccordionTrigger>
                        <AccordionContent>{section.children}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                  <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                    Submit
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <>
              {isLoading && (
                <div className="text-center py-4">
                  <span className="loading loading-spinner loading-lg"></span>
                  <p>Analyzing data...</p>
                </div>
              )}

              {error && (
                <div className="alert alert-error my-4">
                  {error}
                </div>
              )}

              {analysisResult && (
                <TariffComparisonResult
                  suggestedCourier={analysisResult.carrierName}
                  weightRange={`${analysisResult.weightRange.min}-${analysisResult.weightRange.max}kg`}
                  retailPrice={analysisResult.basePrice}
                  suggestedPrice={analysisResult.suggestedPrice}
                  purchasePrice={analysisResult.purchasePrice}
                  margin={analysisResult.margin}
                  monthlyProfit={analysisResult.monthlyProfit}
                  monthlySavings={analysisResult.monthlySavings}
                  explanation={analysisResult.explanation}
                  fuelSurcharge={analysisResult.fuelSurcharge}
                  isVolumetric={analysisResult.isVolumetric}
                  availableCarriers={analysisResult.availableCarriers}
                  monthlyShipments={parseInt(formData.monthlyShipments)}
                  maxDiscount={analysisResult.maxDiscount}
                  carriersData={analysisResult.carriersData}
                  recommendation={analysisResult.recommendation || {
                    carrierName: analysisResult.carrierName,
                    serviceName: analysisResult.serviceName,
                    basePrice: analysisResult.basePrice,
                    suggestedPrice: analysisResult.suggestedPrice,
                    explanation: analysisResult.explanation
                  }}
                  averageWeight={parseFloat(formData.averageWeight)}
                  onGenerateProposal={handleGenerateProposal}
                  clientData={{
                    verticalMarket: formData.verticalMarket,
                    monthlyShipments: parseInt(formData.monthlyShipments),
                    averageWeight: parseFloat(formData.averageWeight),
                    currentCourier: formData.currentCourier,
                    ecommerceUrl: formData.ecommerceUrl || undefined
                  }}
                />
              )}
            </>
          )}
        </motion.div>
        <AnimatePresence>
          {showChat && (
            <motion.div
              className="w-1/2 pl-4"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <ChatInterface formData={formData} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

