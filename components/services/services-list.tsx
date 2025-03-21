"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit, MoreHorizontal, Trash2, ExternalLink, Tag, Truck } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
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
import { Textarea } from "@/components/ui/textarea"

// Mock data for services
const services = [
  {
    id: "1",
    name: "Express",
    code: "BRT-EXP",
    carrier: {
      id: "1",
      name: "BRT",
    },
    description: "Next day delivery service",
    destinationType: "national",
    deliveryTimeMin: 24,
    deliveryTimeMax: 48,
    sourceCountry: "IT",
    isActive: true,
    ratesCount: 12,
  },
  {
    id: "2",
    name: "Standard",
    code: "BRT-STD",
    carrier: {
      id: "1",
      name: "BRT",
    },
    description: "Standard delivery service",
    destinationType: "national",
    deliveryTimeMin: 48,
    deliveryTimeMax: 72,
    sourceCountry: "IT",
    isActive: true,
    ratesCount: 15,
  },
  {
    id: "3",
    name: "Economy",
    code: "GLS-ECO",
    carrier: {
      id: "2",
      name: "GLS",
    },
    description: "Budget-friendly delivery option",
    destinationType: "national",
    deliveryTimeMin: 72,
    deliveryTimeMax: 96,
    sourceCountry: "IT",
    isActive: true,
    ratesCount: 10,
  },
  {
    id: "4",
    name: "International Express",
    code: "DHL-INTL-EXP",
    carrier: {
      id: "3",
      name: "DHL",
    },
    description: "Fast international shipping",
    destinationType: "international",
    deliveryTimeMin: 48,
    deliveryTimeMax: 96,
    sourceCountry: "DE",
    isActive: true,
    ratesCount: 18,
  },
  {
    id: "5",
    name: "Return Service",
    code: "GLS-RET",
    carrier: {
      id: "2",
      name: "GLS",
    },
    description: "Service for handling returns",
    destinationType: "national",
    deliveryTimeMin: 48,
    deliveryTimeMax: 72,
    sourceCountry: "FR",
    isActive: false,
    ratesCount: 9,
  },
]

export function ServicesList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [carrierFilter, setCarrierFilter] = useState("all")
  const [destinationFilter, setDestinationFilter] = useState("all")
  const [marketFilter, setMarketFilter] = useState("all")
  const [selectedServices, setSelectedServices] = useState<Record<string, boolean>>({})
  const [bulkUpdateNameDialogOpen, setBulkUpdateNameDialogOpen] = useState(false)
  const [bulkUpdateDestinationDialogOpen, setBulkUpdateDestinationDialogOpen] = useState(false)
  const [bulkToggleStatusDialogOpen, setBulkToggleStatusDialogOpen] = useState(false)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [newNamePrefix, setNewNamePrefix] = useState("")
  const [newDestinationCountries, setNewDestinationCountries] = useState("")

  const filteredServices = services.filter((service) => {
    // Apply search filter
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.carrier.name.toLowerCase().includes(searchTerm.toLowerCase())

    // Apply carrier filter
    const matchesCarrier = carrierFilter === "all" || service.carrier.id === carrierFilter

    // Apply destination type filter
    const matchesDestination = destinationFilter === "all" || service.destinationType === destinationFilter

    // Apply market/source country filter
    const matchesMarket = marketFilter === "all" || service.sourceCountry === marketFilter

    return matchesSearch && matchesCarrier && matchesDestination && matchesMarket
  })

  const selectedCount = Object.values(selectedServices).filter(Boolean).length

  const handleSelectAll = (checked: boolean) => {
    const newSelected: Record<string, boolean> = {}
    if (checked) {
      filteredServices.forEach((service) => {
        newSelected[service.id] = true
      })
    }
    setSelectedServices(newSelected)
  }

  const handleSelectService = (id: string, checked: boolean) => {
    setSelectedServices((prev) => ({
      ...prev,
      [id]: checked,
    }))
  }

  const handleBulkUpdateName = () => {
    // In a real app, you would call your API to update the names
    console.log(`Updating name prefix to "${newNamePrefix}" for ${selectedCount} services`)

    // Reset selection and close dialog
    setSelectedServices({})
    setBulkUpdateNameDialogOpen(false)
    setNewNamePrefix("")
  }

  const handleBulkUpdateDestination = () => {
    // In a real app, you would call your API to update destination countries
    console.log(`Updating destination countries to "${newDestinationCountries}" for ${selectedCount} services`)

    // Reset selection and close dialog
    setSelectedServices({})
    setBulkUpdateDestinationDialogOpen(false)
    setNewDestinationCountries("")
  }

  const handleBulkToggleStatus = () => {
    // In a real app, you would call your API to toggle status
    console.log(`Toggling status for ${selectedCount} services`)

    // Reset selection and close dialog
    setSelectedServices({})
    setBulkToggleStatusDialogOpen(false)
  }

  const handleBulkDelete = () => {
    // In a real app, you would call your API to delete services
    console.log(`Deleting ${selectedCount} services`)

    // Reset selection and close dialog
    setSelectedServices({})
    setBulkDeleteDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <Input
          placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:w-[300px]"
        />

        <div className="flex flex-1 flex-wrap gap-2">
          <Select value={carrierFilter} onValueChange={setCarrierFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by carrier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Carriers</SelectItem>
              <SelectItem value="1">BRT</SelectItem>
              <SelectItem value="2">GLS</SelectItem>
              <SelectItem value="3">DHL</SelectItem>
            </SelectContent>
          </Select>

          <Select value={destinationFilter} onValueChange={setDestinationFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by destination" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Destinations</SelectItem>
              <SelectItem value="national">National</SelectItem>
              <SelectItem value="international">International</SelectItem>
            </SelectContent>
          </Select>

          <Select value={marketFilter} onValueChange={setMarketFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by market" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Markets</SelectItem>
              <SelectItem value="IT">Italy</SelectItem>
              <SelectItem value="FR">France</SelectItem>
              <SelectItem value="DE">Germany</SelectItem>
              <SelectItem value="ES">Spain</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedCount > 0 && (
        <div className="flex items-center gap-2 border rounded-md p-2 bg-muted/20">
          <span className="text-sm font-medium">{selectedCount} selected</span>
          <Button variant="outline" size="sm" onClick={() => setBulkUpdateNameDialogOpen(true)}>
            Update Names
          </Button>
          <Button variant="outline" size="sm" onClick={() => setBulkUpdateDestinationDialogOpen(true)}>
            Update Destinations
          </Button>
          <Button variant="outline" size="sm" onClick={() => setBulkToggleStatusDialogOpen(true)}>
            Toggle Status
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setBulkDeleteDialogOpen(true)}>
            Delete
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={
                    filteredServices.length > 0 && filteredServices.every((service) => selectedServices[service.id])
                  }
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all services"
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Carrier</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Market</TableHead>
              <TableHead>Delivery Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Rates</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredServices.map((service) => (
              <TableRow key={service.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedServices[service.id] || false}
                    onCheckedChange={(checked) => handleSelectService(service.id, !!checked)}
                    aria-label={`Select ${service.name}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell>{service.code}</TableCell>
                <TableCell>
                  <Link href={`/carriers/${service.carrier.id}`} className="flex items-center gap-1 hover:underline">
                    <Truck className="h-3 w-3" />
                    {service.carrier.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {service.destinationType}
                  </Badge>
                </TableCell>
                <TableCell>{service.sourceCountry}</TableCell>
                <TableCell>
                  {service.deliveryTimeMin}-{service.deliveryTimeMax} hours
                </TableCell>
                <TableCell>
                  <Badge variant={service.isActive ? "default" : "secondary"}>
                    {service.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span>{service.ratesCount}</span>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/rates?service=${service.id}`}>
                        <Tag className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </TableCell>
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
                        <Link href={`/services/${service.id}`}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          <span>View Details</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/services/${service.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/rates?service=${service.id}`}>
                          <Tag className="mr-2 h-4 w-4" />
                          <span>View Rates</span>
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

      {/* Bulk Update Name Dialog */}
      <Dialog open={bulkUpdateNameDialogOpen} onOpenChange={setBulkUpdateNameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Service Names</DialogTitle>
            <DialogDescription>
              Update the names for {selectedCount} selected services. The prefix will be added to the beginning of each
              service name.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name-prefix">Name Prefix</Label>
              <Input
                id="name-prefix"
                value={newNamePrefix}
                onChange={(e) => setNewNamePrefix(e.target.value)}
                placeholder="e.g., 'New -' will result in 'New - Service Name'"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkUpdateNameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkUpdateName}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Update Destination Dialog */}
      <Dialog open={bulkUpdateDestinationDialogOpen} onOpenChange={setBulkUpdateDestinationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Destination Countries</DialogTitle>
            <DialogDescription>
              Update the destination countries for {selectedCount} selected services. Enter country codes separated by
              commas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="destination-countries">Destination Countries</Label>
              <Textarea
                id="destination-countries"
                value={newDestinationCountries}
                onChange={(e) => setNewDestinationCountries(e.target.value)}
                placeholder="e.g., IT, FR, DE, ES"
                rows={4}
              />
              <p className="text-sm text-muted-foreground">
                Enter ISO country codes separated by commas (e.g., IT, FR, DE, ES)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkUpdateDestinationDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkUpdateDestination}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Toggle Status Dialog */}
      <AlertDialog open={bulkToggleStatusDialogOpen} onOpenChange={setBulkToggleStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Toggle Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to toggle the status of {selectedCount} services?
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
            <AlertDialogTitle>Delete Services</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCount} services? This action cannot be undone.
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

