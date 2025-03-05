"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Truck, Edit, Trash } from "lucide-react"
import { apiService, Carrier } from "@/services/api"

export default function CarriersPage() {
  const [carriers, setCarriers] = useState<Carrier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchCarriers = async () => {
      try {
        const data = await apiService.getCarriers()
        setCarriers(data)
      } catch (err) {
        console.error("Error fetching carriers:", err)
        setError("Failed to load carriers")
      } finally {
        setLoading(false)
      }
    }
    
    fetchCarriers()
  }, [])

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Carriers</h1>
        <Link href="/carriers/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Carrier
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Carriers</CardTitle>
          <CardDescription>
            View and manage all shipping carriers in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-md mb-4">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : carriers.length === 0 ? (
            <div className="text-center py-8">
              <Truck className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <h3 className="text-lg font-medium">No carriers found</h3>
              <p className="text-gray-500 mt-1">Add your first carrier to get started</p>
              <Link href="/carriers/new">
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Carrier
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Carrier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fuel Surcharge</TableHead>
                  <TableHead>Volumetric</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carriers.map((carrier) => (
                  <TableRow key={carrier._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        {carrier.logoUrl ? (
                          <img src={carrier.logoUrl} alt={carrier.name} className="h-6 w-auto" />
                        ) : (
                          <Truck className="h-5 w-5 text-gray-400" />
                        )}
                        <span>{carrier.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={carrier.isActive ? "success" : "secondary"}>
                        {carrier.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{carrier.fuelSurcharge}%</TableCell>
                    <TableCell>
                      {carrier.isVolumetric ? (
                        <Badge variant="outline" className="bg-blue-50">Yes</Badge>
                      ) : (
                        <span className="text-gray-500">No</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link href={`/carriers/${carrier._id}/edit`}>
                          <Button variant="outline" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="outline" size="icon" className="text-red-500">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
