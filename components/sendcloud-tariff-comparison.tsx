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

export default function SendcloudTariffComparison() {
  const [formData, setFormData] = useState({
    ecommerceUrl: "",
    verticalMarket: "",
    monthlyShipments: "",
    averageWeight: "",
    currentCourier: "",
    email: "",
  })
  const [showResults, setShowResults] = useState(false)
  const [showChat, setShowChat] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    setShowResults(true)
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
          />
          <Input
            type="text"
            name="verticalMarket"
            placeholder="Vertical Market"
            value={formData.verticalMarket}
            onChange={handleInputChange}
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
          />
          <Input
            type="number"
            name="averageWeight"
            placeholder="Average package weight (kg)"
            value={formData.averageWeight}
            onChange={handleInputChange}
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
                  <Button type="submit" size="lg" className="w-full">
                    Submit
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <TariffComparisonResult
              suggestedCourier="sendcloud"
              weightRange="0-2kg"
              retailPrice={5.5}
              purchasePrice={4.49}
              margin={1.01}
              monthlySavings={100}
              monthlyMargin={50}
              allTariffs={allTariffs}
              onGenerateProposal={handleGenerateProposal}
            />
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

