import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Download, Upload, Filter } from "lucide-react"
import Link from "next/link"
import { RatesList } from "@/components/rates/rates-list"

export default function RatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#122857] to-[#1e3a80] text-transparent bg-clip-text">
          Rates
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" asChild>
            <Link href="/rates/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Rate
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">320</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.5%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Retail Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€12.75</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Rates</CardTitle>
          <CardDescription>View and manage all shipping rates</CardDescription>
        </CardHeader>
        <CardContent>
          <RatesList />
        </CardContent>
      </Card>
    </div>
  )
}

