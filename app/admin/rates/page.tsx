"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { PlusCircle, Edit, Trash2, ChevronLeft, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

// Schema di validazione per il form della tariffa
const rateFormSchema = z.object({
  id: z.string().optional(),
  service: z.string({
    required_error: "Please select a service.",
  }),
  weightMin: z.coerce.number().min(0, {
    message: "Minimum weight must be a positive number.",
  }),
  weightMax: z.coerce.number().min(0, {
    message: "Maximum weight must be a positive number.",
  }),
  purchasePrice: z.coerce.number().min(0, {
    message: "Purchase price must be a positive number.",
  }),
  retailPrice: z.coerce.number().min(0, {
    message: "Retail price must be a positive number.",
  }),
  margin: z.coerce.number().optional(),
  marginPercentage: z.coerce.number().optional(),
  volumeDiscount: z.coerce.number().min(0).default(0),
  promotionalDiscount: z.coerce.number().min(0).default(0),
  minimumVolume: z.coerce.number().min(0).default(0),
  isActive: z.boolean().default(true)
}).refine(data => data.weightMin < data.weightMax, {
  message: "Minimum weight must be less than maximum weight",
  path: ["weightMax"],
}).refine(data => data.purchasePrice <= data.retailPrice, {
  message: "Purchase price should not exceed retail price",
  path: ["purchasePrice"],
});

type RateFormValues = z.infer<typeof rateFormSchema>

// Tipo per la tariffa
interface Rate {
  _id: string
  service: {
    _id: string
    name: string
    carrier: {
      _id: string
      name: string
    }
  }
  weightMin: number
  weightMax: number
  purchasePrice: number
  retailPrice: number
  margin: number
  marginPercentage: number
  volumeDiscount: number
  promotionalDiscount: number
  minimumVolume: number
  isActive: boolean
}

// Tipo per il servizio
interface Service {
  _id: string
  name: string
  carrier: {
    _id: string
    name: string
  }
}

export default function RatesPage() {
  const [rates, setRates] = useState<Rate[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingServices, setIsLoadingServices] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingRate, setEditingRate] = useState<Rate | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [rateToDelete, setRateToDelete] = useState<Rate | null>(null)

  // Form per la creazione/modifica della tariffa
  const form = useForm<RateFormValues>({
    resolver: zodResolver(rateFormSchema),
    defaultValues: {
      service: "",
      weightMin: 0,
      weightMax: 0,
      purchasePrice: 0,
      retailPrice: 0,
      margin: 0,
      marginPercentage: 0,
      volumeDiscount: 0,
      promotionalDiscount: 0,
      minimumVolume: 0,
      isActive: true
    }
  })

  // Funzione per calcolare il margine a partire da prezzo d'acquisto e prezzo al dettaglio
  const calculateMargin = (purchasePrice: number, retailPrice: number) => {
    const margin = retailPrice - purchasePrice;
    const marginPercentage = retailPrice === 0 ? 0 : (margin / retailPrice) * 100;
    return { margin, marginPercentage };
  };

  // Osserva i cambiamenti nei campi di prezzo e aggiorna il margine
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'purchasePrice' || name === 'retailPrice') {
        const purchasePrice = parseFloat(value.purchasePrice as unknown as string) || 0;
        const retailPrice = parseFloat(value.retailPrice as unknown as string) || 0;
        const { margin, marginPercentage } = calculateMargin(purchasePrice, retailPrice);
        form.setValue('margin', margin);
        form.setValue('marginPercentage', marginPercentage);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Carica i servizi
  const loadServices = async () => {
    setIsLoadingServices(true)
    try {
      const response = await fetch('/api/services')
      const data = await response.json()
      if (data.success) {
        setServices(data.data)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to load services",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error loading services:', error)
      toast({
        title: "Error",
        description: "Failed to load services",
        variant: "destructive"
      })
    } finally {
      setIsLoadingServices(false)
    }
  }

  // Carica le tariffe
  const loadRates = async (serviceId?: string) => {
    setIsLoading(true)
    try {
      const url = serviceId ? `/api/rates?service=${serviceId}` : '/api/rates'
      const response = await fetch(url)
      const data = await response.json()
      if (data.success) {
        setRates(data.data)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to load rates",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error loading rates:', error)
      toast({
        title: "Error",
        description: "Failed to load rates",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Carica i dati all'avvio
  useEffect(() => {
    loadServices()
    loadRates()
  }, [])

  // Carica le tariffe quando cambia il servizio selezionato
  useEffect(() => {
    loadRates(selectedService || undefined)
  }, [selectedService])

  // Gestisce il cambio del servizio selezionato
  const handleServiceChange = (serviceId: string) => {
    setSelectedService(serviceId)
  }

  // Gestisce l'apertura del dialog per la creazione
  const handleCreate = () => {
    form.reset({
      service: selectedService || "",
      weightMin: 0,
      weightMax: 0,
      purchasePrice: 0,
      retailPrice: 0,
      margin: 0,
      marginPercentage: 0,
      volumeDiscount: 0,
      promotionalDiscount: 0,
      minimumVolume: 0,
      isActive: true
    })
    setEditingRate(null)
    setIsOpen(true)
  }

  // Gestisce l'apertura del dialog per la modifica
  const handleEdit = (rate: Rate) => {
    form.reset({
      id: rate._id,
      service: rate.service._id,
      weightMin: rate.weightMin,
      weightMax: rate.weightMax,
      purchasePrice: rate.purchasePrice,
      retailPrice: rate.retailPrice,
      margin: rate.margin,
      marginPercentage: rate.marginPercentage,
      volumeDiscount: rate.volumeDiscount,
      promotionalDiscount: rate.promotionalDiscount,
      minimumVolume: rate.minimumVolume,
      isActive: rate.isActive
    })
    setEditingRate(rate)
    setIsOpen(true)
  }

  // Gestisce la creazione/aggiornamento di una tariffa
  const onSubmit = async (data: RateFormValues) => {
    try {
      const isEditing = !!editingRate
      const url = isEditing ? `/api/rates/${data.id}` : '/api/rates'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: isEditing ? "Rate Updated" : "Rate Created",
          description: `Rate for weight range ${data.weightMin}-${data.weightMax}kg has been successfully ${isEditing ? 'updated' : 'created'}.`
        })
        setIsOpen(false)
        loadRates(selectedService || undefined)
      } else {
        toast({
          title: "Error",
          description: result.message || `Failed to ${isEditing ? 'update' : 'create'} rate`,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error(`Error ${editingRate ? 'updating' : 'creating'} rate:`, error)
      toast({
        title: "Error",
        description: `Failed to ${editingRate ? 'update' : 'create'} rate`,
        variant: "destructive"
      })
    }
  }

  // Gestisce l'eliminazione di una tariffa
  const handleDelete = async () => {
    if (!rateToDelete) return

    try {
      const response = await fetch(`/api/rates/${rateToDelete._id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Rate Deleted",
          description: `Rate for weight range ${rateToDelete.weightMin}-${rateToDelete.weightMax}kg has been successfully deleted.`
        })
        setDeleteDialogOpen(false)
        loadRates(selectedService || undefined)
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete rate",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting rate:', error)
      toast({
        title: "Error",
        description: "Failed to delete rate",
        variant: "destructive"
      })
    }
  }

  // Conferma l'eliminazione di una tariffa
  const confirmDelete = (rate: Rate) => {
    setRateToDelete(rate)
    setDeleteDialogOpen(true)
  }

  // Formatta il prezzo come valuta
  const formatCurrency = (value: number) => {
    return `€${value.toFixed(2)}`
  }

  // Formatta il margine con percentuale
  const formatMargin = (value: number, percentage: number) => {
    return `${formatCurrency(value)} (${percentage.toFixed(2)}%)`
  }

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8 lg:p-12 bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin"><ChevronLeft className="h-4 w-4" /> Back to Dashboard</Link>
              </Button>
            </div>
            <Button onClick={handleCreate}>
              <PlusCircle className="h-4 w-4 mr-2" /> Add Rate
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <FormField
                  control={form.control}
                  name="service"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Filter by Service</FormLabel>
                      <Select 
                        onValueChange={handleServiceChange}
                        value={selectedService}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="All Services" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">All Services</SelectItem>
                          {isLoadingServices ? (
                            <SelectItem value="loading" disabled>Loading services...</SelectItem>
                          ) : services.length === 0 ? (
                            <SelectItem value="none" disabled>No services available</SelectItem>
                          ) : (
                            services.map((service) => (
                              <SelectItem key={service._id} value={service._id}>
                                {service.carrier.name} - {service.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <p>Loading rates...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Carrier</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Weight Range (kg)</TableHead>
                      <TableHead>Purchase Price</TableHead>
                      <TableHead>Retail Price</TableHead>
                      <TableHead>Margin</TableHead>
                      <TableHead>Discounts</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center">
                          {selectedService 
                            ? "No rates found for this service. Add a rate by clicking the 'Add Rate' button." 
                            : "No rates found. Add your first rate by clicking the 'Add Rate' button."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      rates.map((rate) => (
                        <TableRow key={rate._id}>
                          <TableCell>{rate.service.carrier.name}</TableCell>
                          <TableCell>{rate.service.name}</TableCell>
                          <TableCell>{rate.weightMin} - {rate.weightMax}</TableCell>
                          <TableCell>{formatCurrency(rate.purchasePrice)}</TableCell>
                          <TableCell>{formatCurrency(rate.retailPrice)}</TableCell>
                          <TableCell>{formatMargin(rate.margin, rate.marginPercentage)}</TableCell>
                          <TableCell>
                            {(rate.volumeDiscount > 0 || rate.promotionalDiscount > 0) ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Info className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Volume Discount: {rate.volumeDiscount}%</p>
                                    <p>Promotional: {rate.promotionalDiscount}%</p>
                                    <p>Min. Volume: {rate.minimumVolume}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : "None"}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              rate.isActive 
                                ? "bg-green-100 text-green-800" 
                                : "bg-gray-100 text-gray-800"
                            }`}>
                              {rate.isActive ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(rate)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => confirmDelete(rate)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog per creazione/modifica */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingRate ? "Edit Rate" : "Create Rate"}
            </DialogTitle>
            <DialogDescription>
              {editingRate
                ? "Update the rate details below."
                : "Fill in the rate details below to create a new rate."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="service"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingServices ? (
                          <SelectItem value="loading" disabled>Loading services...</SelectItem>
                        ) : services.length === 0 ? (
                          <SelectItem value="none" disabled>No services available</SelectItem>
                        ) : (
                          services.map((service) => (
                            <SelectItem key={service._id} value={service._id}>
                              {service.carrier.name} - {service.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The shipping service for this rate
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="weightMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Weight (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weightMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Weight (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="purchasePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Price (€)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        What you pay to the carrier
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="retailPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Retail Price (€)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        What you charge your customers
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="margin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Margin (€)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          disabled
                        />
                      </FormControl>
                      <FormDescription>
                        Auto-calculated: Retail - Purchase
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="marginPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Margin (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          disabled
                        />
                      </FormControl>
                      <FormDescription>
                        Auto-calculated percentage
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="volumeDiscount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Volume Discount (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="promotionalDiscount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Promotional Discount (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minimumVolume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min. Volume (packages)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Inactive rates will not be shown in comparisons
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingRate ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog di conferma eliminazione */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the rate for weight range {rateToDelete?.weightMin}-{rateToDelete?.weightMax}kg? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
} 