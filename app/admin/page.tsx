import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Admin Dashboard - Sendcloud Pricing Tool",
  description: "Admin dashboard for managing carriers, services and rates",
}

export default function AdminDashboard() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8 lg:p-12 bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="w-full max-w-7xl">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your carriers, services and rates in one place
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Carriers</CardTitle>
                <CardDescription>Manage your shipping carriers</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Add, edit or remove shipping carriers</p>
                <Button asChild className="w-full">
                  <Link href="/admin/carriers">Manage Carriers</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Services</CardTitle>
                <CardDescription>Manage shipping services</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Add, edit or remove shipping services for carriers</p>
                <Button asChild className="w-full">
                  <Link href="/admin/services">Manage Services</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Rates</CardTitle>
                <CardDescription>Manage shipping rates</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Add, edit or remove shipping rates for services</p>
                <Button asChild className="w-full">
                  <Link href="/admin/rates">Manage Rates</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
} 