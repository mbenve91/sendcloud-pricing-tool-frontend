import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { KnowledgeBaseList } from "@/components/carriers/knowledge-base-list"
import { CarrierServicesList } from "@/components/carriers/carrier-services-list"

export default function CarrierDetailsPage({ params }: { params: { id: string } }) {
  // In a real app, you would fetch the carrier data based on the ID
  const carrier = {
    id: params.id,
    name: "BRT",
    logoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/brt.svg-P9qauJfDY2jf3ssHnMivYtBnNz8wSn.png",
    isActive: true,
    fuelSurcharge: 10,
    isVolumetric: true,
    createdAt: "2023-01-15T10:30:00Z",
    updatedAt: "2023-06-22T14:45:00Z",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/carriers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#122857] to-[#1e3a80] text-transparent bg-clip-text">
            Carrier Details
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/carriers/${params.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Carrier details and configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 relative">
                  <Image
                    src={carrier.logoUrl || "/placeholder.svg"}
                    alt={carrier.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{carrier.name}</h3>
                  <Badge variant={carrier.isActive ? "default" : "secondary"}>
                    {carrier.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Fuel Surcharge</p>
                  <p className="font-medium">{carrier.fuelSurcharge}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Volumetric</p>
                  <p className="font-medium">{carrier.isVolumetric ? "Yes" : "No"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created At</p>
                  <p className="font-medium">{new Date(carrier.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">{new Date(carrier.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
            <CardDescription>Overview of carrier usage and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-3">
                <p className="text-sm text-muted-foreground">Services</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-sm text-muted-foreground">Rates</p>
                <p className="text-2xl font-bold">64</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-sm text-muted-foreground">Knowledge Base</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-sm text-muted-foreground">Avg. Margin</p>
                <p className="text-2xl font-bold">24.5%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="knowledge-base">Knowledge Base</TabsTrigger>
        </TabsList>
        <TabsContent value="services">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Services</CardTitle>
                <CardDescription>All services offered by this carrier</CardDescription>
              </div>
              <Button size="sm" asChild>
                <Link href={`/services/new?carrier=${params.id}`}>Add Service</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <CarrierServicesList carrierId={params.id} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="knowledge-base">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Knowledge Base</CardTitle>
                <CardDescription>Information and documentation for this carrier</CardDescription>
              </div>
              <Button size="sm">Add Item</Button>
            </CardHeader>
            <CardContent>
              <KnowledgeBaseList carrierId={params.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

