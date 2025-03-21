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
import { Edit, MoreHorizontal, Trash2, ExternalLink, Package, Truck } from "lucide-react"
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
import { Slider } from "@/components/ui/slider"

// Mock data for rates
const rates = [
  {
    id: "1",
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
    isActive: true,
  },
  {
    id: "2",
    service: {
      id: "1",
      name: "Express",
      code: "BRT-EXP",
      carrier: {
        id: "1",
        name: "BRT",
      },
    },
    weightMin: 1,
    weightMax: 3,
    purchasePrice: 7.2,
    retailPrice: 9.99,
    margin: 2.79,
    marginPercentage: 27.93,
    isActive: true,
  },
  {
    id: "3",
    service: {
      id: "2",
      name: "Standard",
      code: "BRT-STD",
      carrier: {
        id: "1",
        name: "BRT",
      },
    },
    weightMin: 0,
    weightMax: 1,
    purchasePrice: 4.3,
    retailPrice: 5.99,
    margin: 1.69,
    marginPercentage: 28.21,
    isActive: true,
  },
  {
    id: "4",
    service: {
      id: "3",
      name: "Economy",
      code: "GLS-ECO",
      carrier: {
        id: "2",
        name: "GLS",
      },
    },
    weightMin: 0,
    weightMax: 1,
    purchasePrice: 3.8,
    retailPrice: 4.99,
    margin: 1.19,
    marginPercentage: 23.85,
    isActive: true,
  },
  {
    id: "5",
    service: {
      id: "4",
      name: "International Express",
      code: "DHL-INTL-EXP",
      carrier: {
        id: "3",
        name: "DHL",
      },
    },
    weightMin: 0,
    weightMax: 1,
    purchasePrice: 12.5,
    retailPrice: 16.99,
    margin: 4.49,
    marginPercentage: 26.43,
    isActive: false,
  },
]

export function RatesList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [carrierFilter, setCarrierFilter] = useState("all")
  const [serviceFilter, setServiceFilter] = useState("all")
  const [weightFilter, setWeightFilter] = useState("all")
  const [selectedRates, setSelectedRates] = useState<Record<string, boolean>>({})
  const [bulkUpdatePriceDialogOpen, setBulkUpdatePriceDialogOpen] = useState(false)
  const [bulkToggleStatusDialogOpen, setBulkToggleStatusDialogOpen] = useState(false)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [priceChangePercentage, setPriceChangePercentage] = useState(0)
  const [priceChangeType, setPriceChangeType] = useState<"increase" | "decrease">("increase")

  const filteredRates = rates.filter((rate) => {
    // Apply search filter
    const matchesSearch =
      rate.service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rate.service.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rate.service.carrier.name.toLowerCase().includes(searchTerm.toLowerCase())

    // Apply carrier filter
    const matchesCarrier = carrierFilter === "all" || rate.service.carrier.id === carrierFilter

    // Apply service filter
    const matchesService = serviceFilter === "all" || rate.service.id === serviceFilter

    // Apply weight filter
    const matchesWeight =
      weightFilter === "all" ||
      (weightFilter === "0-1" && rate.weightMin === 0 && rate.weightMax === 1) ||
      (weightFilter === "1-3" && rate.weightMin === 1 && rate.weightMax === 3) ||
      (weightFilter === "3-5" && rate.weightMin === 3 && rate.weightMax === 5) ||
      (weightFilter === "5-10" && rate.weightMin === 5 && rate.weightMax === 10)

    return matchesSearch && matchesCarrier && matchesService && matchesWeight
  })

  const selectedCount = Object.values(selectedRates).filter(Boolean).length

  const handleSelectAll = (checked: boolean) => {
    const newSelected: Record<string, boolean> = {}
    if (checked) {
      filteredRates.forEach((rate) => {
        newSelected[rate.id] = true
      })
    }
    setSelectedRates(newSelected)
  }

  const handleSelectRate = (id: string, checked: boolean) => {
    setSelectedRates((prev) => ({
      ...prev,
      [id]: checked,
    }))
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(value)
  }

  const handleBulkUpdatePrice = () => {
    // In a real app, you would call your API to update prices
    console.log(
      `${priceChangeType === "increase" ? "Increasing" : "Decreasing"} prices by ${priceChangePercentage}% for ${selectedCount} rates`,
    )

    // Reset selection and close dialog
    setSelectedRates({})
    setBulkUpdatePriceDialogOpen(false)
    setPriceChangePercentage(0)
  }

  const handleBulkToggleStatus = () => {
    // In a real app, you would call your API to toggle status
    console.log(`Toggling status for ${selectedCount} rates`)

    // Reset selection and close dialog
    setSelectedRates({})
    setBulkToggleStatusDialogOpen(false)
  }

  const handleBulkDelete = () => {
    // In a real app, you would call your API to delete rates
    console.log(`Deleting ${selectedCount} rates`)

    // Reset selection and close dialog
    setSelectedRates({})
    setBulkDeleteDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <Input
          placeholder="Search rates..."
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

          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem value="1">Express (BRT)</SelectItem>
              <SelectItem value="2">Standard (BRT)</SelectItem>
              <SelectItem value="3">Economy (GLS)</SelectItem>
              <SelectItem value="4">International Express (DHL)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={weightFilter} onValueChange={setWeightFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by weight" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Weights</SelectItem>
              <SelectItem value="0-1">0-1 kg</SelectItem>
              <SelectItem value="1-3">1-3 kg</SelectItem>
              <SelectItem value="3-5">3-5 kg</SelectItem>
              <SelectItem value="5-10">5-10 kg</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedCount > 0 && (
        <div className="flex items-center gap-2 border rounded-md p-2 bg-muted/20">
          <span className="text-sm font-medium">{selectedCount} selected</span>
          <Button variant="outline" size="sm" onClick={() => setBulkUpdatePriceDialogOpen(true)}>
            Update Prices
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
                  checked={filteredRates.length > 0 && filteredRates.every((rate) => selectedRates[rate.id])}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all rates"
                />
              </TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Carrier</TableHead>
              <TableHead>Weight Range</TableHead>
              <TableHead>Purchase Price</TableHead>
              <TableHead>Retail Price</TableHead>
              <TableHead>Margin</TableHead>
              <TableHead>Margin %</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRates.map((rate) => (
              <TableRow key={rate.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedRates[rate.id] || false}
                    onCheckedChange={(checked) => handleSelectRate(rate.id, !!checked)}
                    aria-label={`Select rate for ${rate.service.name} (${rate.weightMin}-${rate.weightMax} kg)`}
                  />
                </TableCell>
                <TableCell>
                  <Link href={`/services/${rate.service.id}`} className="flex items-center gap-1 hover:underline">
                    <Package className="h-3 w-3" />
                    {rate.service.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/carriers/${rate.service.carrier.id}`}
                    className="flex items-center gap-1 hover:underline"
                  >
                    <Truck className="h-3 w-3" />
                    {rate.service.carrier.name}
                  </Link>
                </TableCell>
                <TableCell>
                  {rate.weightMin}-{rate.weightMax} kg
                </TableCell>
                <TableCell>{formatCurrency(rate.purchasePrice)}</TableCell>
                <TableCell>{formatCurrency(rate.retailPrice)}</TableCell>
                <TableCell>{formatCurrency(rate.margin)}</TableCell>
                <TableCell>
                  <Badge variant={rate.marginPercentage > 25 ? "default" : "secondary"}>
                    {rate.marginPercentage.toFixed(2)}%
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch checked={rate.isActive} />
                    <span className={rate.isActive ? "text-green-600" : "text-gray-500"}>
                      {rate.isActive ? "Active" : "Inactive"}
                    </span>
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
                        <Link href={`/rates/${rate.id}`}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          <span>View Details</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/rates/${rate.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
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

      {/* Bulk Update Price Dialog */}
      <Dialog open={bulkUpdatePriceDialogOpen} onOpenChange={setBulkUpdatePriceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Prices</DialogTitle>
            <DialogDescription>
              Apply a percentage change to prices for {selectedCount} selected rates.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Price Change Type</Label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="increase"
                      name="price-change-type"
                      checked={priceChangeType === "increase"}
                      onChange={() => setPriceChangeType("increase")}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="increase" className="font-normal">
                      Increase
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="decrease"
                      name="price-change-type"
                      checked={priceChangeType === "decrease"}
                      onChange={() => setPriceChangeType("decrease")}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="decrease" className="font-normal">
                      Decrease
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="price-change-percentage">Percentage Change</Label>
                <span className="text-sm font-medium">{priceChangePercentage}%</span>
              </div>
              <Slider
                id="price-change-percentage"
                min={0}
                max={50}
                step={1}
                value={[priceChangePercentage]}
                onValueChange={(value) => setPriceChangePercentage(value[0])}
              />
              <p className="text-sm text-muted-foreground">
                This will {priceChangeType === "increase" ? "increase" : "decrease"} the retail price by{" "}
                {priceChangePercentage}%.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkUpdatePriceDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkUpdatePrice}>Apply Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Toggle Status Dialog */}
      <AlertDialog open={bulkToggleStatusDialogOpen} onOpenChange={setBulkToggleStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Toggle Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to toggle the status of {selectedCount} rates?
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
            <AlertDialogTitle>Delete Rates</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCount} rates? This action cannot be undone.
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

