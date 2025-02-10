"use client"

import { useState, useEffect } from "react"
import { ChatMessageListDemo } from "@/components/ui/code.demo"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface ChatInterfaceProps {
  formData: {
    ecommerceUrl: string
    verticalMarket: string
    monthlyShipments: string
    averageWeight: string
    currentCourier: string
    email: string
  }
}

export function ChatInterface({ formData }: ChatInterfaceProps) {
  const [initialMessage, setInitialMessage] = useState("")

  useEffect(() => {
    const message = `Hello! I'm here to help you create an email proposal for ${formData.ecommerceUrl}. 
    Based on the information you provided:
    - Vertical Market: ${formData.verticalMarket}
    - Monthly Shipments: ${formData.monthlyShipments}
    - Average Package Weight: ${formData.averageWeight} kg
    - Current Courier: ${formData.currentCourier}
    
    I'll draft an email highlighting the benefits of switching to Sendcloud. How would you like me to proceed?`

    setInitialMessage(message)
  }, [formData])

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>AI Email Assistant</CardTitle>
      </CardHeader>
      <CardContent>
        <ChatMessageListDemo initialMessage={initialMessage} />
      </CardContent>
    </Card>
  )
}

