import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { CarrierForm } from "@/components/carriers/carrier-form"

export default function EditCarrierPage({ params }: { params: { id: string } }) {
  // In a real app, you would fetch the carrier data based on the ID
  const carrier = {
    id: params.id,
    name: "BRT",
    logoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/brt.svg-P9qauJfDY2jf3ssHnMivYtBnNz8wSn.png",
    isActive: true,
    fuelSurcharge: 10,
    isVolumetric: true,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/carriers/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#122857] to-[#1e3a80] text-transparent bg-clip-text">
          Edit Carrier
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Carrier Information</CardTitle>
          <CardDescription>Update carrier details and configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <CarrierForm initialData={carrier} />
        </CardContent>
      </Card>
    </div>
  )
}

