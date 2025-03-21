"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit, MoreHorizontal, Trash2, Package, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

// Mock data for carriers
const carriers = [
  {
    id: "1",
    name: "BRT",
    logoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/brt.svg-P9qauJfDY2jf3ssHnMivYtBnNz8wSn.png",
    isActive: true,
    fuelSurcharge: 10,
    isVolumetric: true,
    servicesCount: 8,
    knowledgeBaseCount: 5,
  },
  {
    id: "2",
    name: "GLS",
    logoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gls-RAOsrs0wCzdXlD2OvgPbVa7qqFDgOo.webp",
    isActive: true,
    fuelSurcharge: 8.5,
    isVolumetric: false,
    servicesCount: 12,
    knowledgeBaseCount: 7,
  },
  {
    id: "3",
    name: "DHL",
    logoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dhl-19ZkH6nuiU7ABE42HthHDOQWjmOWqU.webp",
    isActive: true,
    fuelSurcharge: 9.2,
    isVolumetric: true,
    servicesCount: 10,
    knowledgeBaseCount: 8,
  },
  {
    id: "4",
    name: "Poste Italiane",
    logoUrl: "/placeholder.svg?height=40&width=40",
    isActive: false,
    fuelSurcharge: 7.5,
    isVolumetric: false,
    servicesCount: 6,
    knowledgeBaseCount: 3,
  },
  {
    id: "5",
    name: "InPost",
    logoUrl: "/placeholder.svg?height=40&width=40",
    isActive: true,
    fuelSurcharge: 8.0,
    isVolumetric: true,
    servicesCount: 4,
    knowledgeBaseCount: 2,
  },
]

export function CarriersList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCarriers, setSelectedCarriers] = useState<Record<string, boolean>>({})
  const [bulkFuelSurchargeDialogOpen, setBulkFuelSurchargeDialogOpen] = useState(false)
  const [bulkToggleStatusDialogOpen, setBulkToggleStatusDialogOpen] = useState(false)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [newFuelSurcharge, setNewFuelSurcharge] = useState("")

  const filteredCarriers = carriers.filter((carrier) => carrier.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const selectedCount = Object.values(selectedCarriers).filter(Boolean).length

  const handleSelectAll = (checked: boolean) => {
    const newSelected: Record<string, boolean> = {}
    if (checked) {
      filteredCarriers.forEach((carrier) => {
        newSelected[carrier.id] = true
      })
    }
    setSelectedCarriers(newSelected)
  }

  const handleSelectCarrier = (id: string, checked: boolean) => {
    setSelectedCarriers((prev) => ({
      ...prev,
      [id]: checked,
    }))
  }

  const handleBulkFuelSurchargeUpdate = () => {
    // In a real app, you would call your API to update the fuel surcharge
    console.log(`Updating fuel surcharge to ${newFuelSurcharge}% for ${selectedCount} carriers`)

    // Reset selection and close dialog
    setSelectedCarriers({})
    setBulkFuelSurchargeDialogOpen(false)
    setNewFuelSurcharge("")
  }

  const handleBulkToggleStatus = () => {
    // In a real app, you would call your API to toggle status
    console.log(`Toggling status for ${selectedCount} carriers`)

    // Reset selection and close dialog
    setSelectedCarriers({})
    setBulkToggleStatusDialogOpen(false)
  }

  const handleBulkDelete = () => {
    // In a real app, you would call your API to delete carriers
    console.log(`Deleting ${selectedCount} carriers`)

    // Reset selection and close dialog
    setSelectedCarriers({})
    setBulkDeleteDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder="Search carriers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />

        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{selectedCount} selected</span>
            <Button variant="outline" size="sm" onClick={() => setBulkFuelSurchargeDialogOpen(true)}>
              Update Fuel Surcharge
            </Button>
            <Button variant="outline" size="sm" onClick={() => setBulkToggleStatusDialogOpen(true)}>
              Toggle Status
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setBulkDeleteDialogOpen(true)}>
              Delete
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={
                    filteredCarriers.length > 0 && filteredCarriers.every((carrier) => selectedCarriers[carrier.id])
                  }
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all carriers"
                />
              </TableHead>
              <TableHead className="w-[80px]">Logo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Fuel Surcharge</TableHead>
              <TableHead>Volumetric</TableHead>
              <TableHead>Services</TableHead>
              <TableHead>Knowledge Base</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCarriers.map((carrier) => (
              <TableRow key={carrier.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedCarriers[carrier.id] || false}
                    onCheckedChange={(checked) => handleSelectCarrier(carrier.id, !!checked)}
                    aria-label={`Select ${carrier.name}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="h-10 w-10 relative">
                    <Image
                      src={carrier.logoUrl || "/placeholder.svg"}
                      alt={carrier.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium">{carrier.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch checked={carrier.isActive} />
                    <span className={carrier.isActive ? "text-green-600" : "text-gray-500"}>
                      {carrier.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{carrier.fuelSurcharge}%</TableCell>
                <TableCell>
                  {carrier.isVolumetric ? <Badge variant="default">Yes</Badge> : <Badge variant="outline">No</Badge>}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span>{carrier.servicesCount}</span>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/services?carrier=${carrier.id}`}>
                        <Package className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </TableCell>
                <TableCell>{carrier.knowledgeBaseCount} items</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/carriers/${carrier.id}`}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          <span>View Details</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/carriers/${carrier.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/services?carrier=${carrier.id}`}>
                          <Package className="mr-2 h-4 w-4" />
                          <span>View Services</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {/* Bulk Update Fuel Surcharge Dialog */}
      <Dialog open={bulkFuelSurchargeDialogOpen} onOpenChange={setBulkFuelSurchargeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Fuel Surcharge</DialogTitle>
            <DialogDescription>Update the fuel surcharge for {selectedCount} selected carriers.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fuel-surcharge">New Fuel Surcharge (%)</Label>
              <Input
                id="fuel-surcharge"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={newFuelSurcharge}
                onChange={(e) => setNewFuelSurcharge(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkFuelSurchargeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkFuelSurchargeUpdate}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Toggle Status Dialog */}
      <AlertDialog open={bulkToggleStatusDialogOpen} onOpenChange={setBulkToggleStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Toggle Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to toggle the status of {selectedCount} carriers?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkToggleStatus}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Carriers</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCount} carriers? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

