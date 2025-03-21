import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { RateForm } from "@/components/rates/rate-form"

export default function EditRatePage({ params }: { params: { id: string } }) {
  // In a real app, you would fetch the rate data based on the ID
  const rate = {
    id: params.id,
    service: {
      id: "1",
      name: "Express",
      code: "BRT-EXP",
      carrier: {
        id: "1",
        name: "BRT",
      },
    },
    weightMin: 0,
    weightMax: 1,
    purchasePrice: 5.5,
    retailPrice: 7.99,
    margin: 2.49,
    marginPercentage: 31.16,
    volumeDiscount: 0,
    promotionalDiscount: 0,
    minimumVolume: 0,
    isActive: true,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/rates/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#122857] to-[#1e3a80] text-transparent bg-clip-text">
          Edit Rate
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rate Information</CardTitle>
          <CardDescription>Update rate details and pricing</CardDescription>
        </CardHeader>
        <CardContent>
          <RateForm initialData={rate} />
        </CardContent>
      </Card>
    </div>
  )
}

