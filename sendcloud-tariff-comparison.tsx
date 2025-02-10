"use client"

import type React from "react"
import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Globe, Package, Truck, Mail, ChevronRight } from "lucide-react"

interface FormSection {
  id: string
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  isComplete?: boolean
}

const verticalMarkets = [
  "Fashion",
  "Electronics",
  "Home & Garden",
  "Beauty & Personal Care",
  "Sports & Outdoors",
  "Toys & Games",
  "Food & Beverage",
  "Health & Wellness",
  "Automotive",
  "Books & Media",
]

const courierOptions = ["DHL", "FedEx", "UPS", "USPS", "DPD", "GLS", "TNT", "Hermes", "PostNL", "Royal Mail"]

export default function SendcloudTariffComparison() {
  const [formData, setFormData] = useState({
    ecommerceUrl: "",
    verticalMarket: "",
    monthlyShipments: 0,
    averageWeight: 0,
    currentCourier: "",
    excludedCouriers: [],
    weightType: "real",
    email: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSliderChange = (value: number[]) => {
    setFormData((prev) => ({ ...prev, monthlyShipments: value[0] }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, weightType: checked ? "volume" : "real" }))
  }

  const handleMultiSelectChange = (selectedOptions: string[]) => {
    setFormData((prev) => ({ ...prev, excludedCouriers: selectedOptions }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    // Here you would typically send the data to your backend or process it further
  }

  const sections: FormSection[] = [
    {
      id: "1",
      icon: <Globe className="size-4 stroke-2 text-muted-foreground" />,
      title: "E-commerce Information",
      children: (
        <div className="flex flex-col gap-2">
          <Input
            type="url"
            name="ecommerceUrl"
            placeholder="E-commerce URL"
            value={formData.ecommerceUrl}
            onChange={handleInputChange}
          />
          <Select
            name="verticalMarket"
            placeholder="Select vertical market"
            options={verticalMarkets}
            value={formData.verticalMarket}
            onChange={handleInputChange}
          />
        </div>
      ),
    },
    {
      id: "2",
      icon: <Package className="size-4 stroke-2 text-muted-foreground" />,
      title: "Shipping Details",
      children: (
        <div className="flex flex-col gap-2">
          <label>Monthly Shipments</label>
          <Slider
            min={0}
            max={10000}
            step={100}
            value={[formData.monthlyShipments]}
            onValueChange={handleSliderChange}
          />
          <Input
            type="number"
            name="averageWeight"
            placeholder="Average package weight (kg)"
            value={formData.averageWeight}
            onChange={handleInputChange}
          />
          <div className="flex items-center gap-2">
            <Switch checked={formData.weightType === "volume"} onCheckedChange={handleSwitchChange} />
            <span>Use volumetric weight</span>
          </div>
        </div>
      ),
    },
    {
      id: "3",
      icon: <Truck className="size-4 stroke-2 text-muted-foreground" />,
      title: "Courier Information",
      children: (
        <div className="flex flex-col gap-2">
          <Select
            name="currentCourier"
            placeholder="Select current courier"
            options={courierOptions}
            value={formData.currentCourier}
            onChange={handleInputChange}
          />
          <Select
            name="excludedCouriers"
            placeholder="Select couriers to exclude"
            options={courierOptions}
            value={formData.excludedCouriers}
            onChange={handleMultiSelectChange}
            multiple
          />
        </div>
      ),
    },
    {
      id: "4",
      icon: <Mail className="size-4 stroke-2 text-muted-foreground" />,
      title: "Contact Information",
      children: (
        <div className="flex flex-col gap-2">
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
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Sendcloud Tariff Comparison Tool</h1>
      <form onSubmit={handleSubmit}>
        <Accordion type="single" collapsible className="w-full mb-6">
          {sections.map((section) => (
            <AccordionItem key={section.id} value={section.id}>
              <AccordionTrigger className="group">
                <div className="flex items-center gap-2">
                  {section.icon}
                  <span>{section.title}</span>
                  {section.isComplete && <span className="ml-2 text-sm text-green-500">✓</span>}
                </div>
              </AccordionTrigger>
              <AccordionContent>{section.children}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <Button type="submit" className="w-full">
          Generate Proposal
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}

