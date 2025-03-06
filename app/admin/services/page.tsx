"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { PlusCircle, Edit, Trash2, ChevronLeft } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

// Schema di validazione per il form del servizio
const serviceFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  code: z.string().optional(),
  description: z.string().optional(),
  carrier: z.string({
    required_error: "Please select a carrier.",
  }),
  destinationType: z.enum(["national", "international", "both"]),
  destinationCountry: z.string().optional(),
  isEU: z.boolean().default(false),
  deliveryTimeMin: z.coerce.number().int().min(0).optional().nullable(),
  deliveryTimeMax: z.coerce.number().int().min(0).optional().nullable(),
  isActive: z.boolean().default(true)
})

type ServiceFormValues = z.infer<typeof serviceFormSchema>

// Tipo per il servizio
interface Service {
  _id: string
  name: string
  code: string | null
  description: string | null
  carrier: {
    _id: string
    name: string
  }
  destinationType: "national" | "international" | "both"
  destinationCountry: string | null
  isEU: boolean
  deliveryTimeMin: number | null
  deliveryTimeMax: number | null
  isActive: boolean
}

// Tipo per il corriere
interface Carrier {
  _id: string
  name: string
}

// Componente per il form di creazione/modifica
const ServiceForm = ({
  form,
  carriers,
  isLoadingCarriers,
  onSubmit,
  editingService,
  onCancel
}: {
  form: any,
  carriers: Carrier[],
  isLoadingCarriers: boolean,
  onSubmit: (data: ServiceFormValues) => void,
  editingService: Service | null,
  onCancel: () => void
}) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter service name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code</FormLabel>
                <FormControl>
                  <Input placeholder="Service code (optional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter service description (optional)" 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="carrier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Carrier</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a carrier" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingCarriers ? (
                    <SelectItem value="loading" disabled>Loading carriers...</SelectItem>
                  ) : carriers.length === 0 ? (
                    <SelectItem value="none" disabled>No carriers available</SelectItem>
                  ) : (
                    carriers.map((carrier) => (
                      <SelectItem key={carrier._id} value={carrier._id}>
                        {carrier.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormDescription>
                The carrier that provides this service
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="destinationType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="national">National</SelectItem>
                    <SelectItem value="international">International</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="destinationCountry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination Country</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Country code or name (for international)" 
                    {...field} 
                    disabled={form.watch("destinationType") === "national"}
                  />
                </FormControl>
                <FormDescription>
                  Required for specific international destinations
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isEU"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>EU Destination</FormLabel>
                <FormDescription>
                  Check if the destination is in the European Union
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={form.watch("destinationType") === "national"}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="deliveryTimeMin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Delivery Time (days)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Min days"
                    {...field}
                    value={field.value === null ? "" : field.value}
                    onChange={(e) => {
                      const value = e.target.value === "" ? null : parseInt(e.target.value);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="deliveryTimeMax"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Delivery Time (days)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Max days"
                    {...field}
                    value={field.value === null ? "" : field.value}
                    onChange={(e) => {
                      const value = e.target.value === "" ? null : parseInt(e.target.value);
                      field.onChange(value);
                    }}
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
                  Inactive services will not be shown in rate comparisons
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
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {editingService ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [carriers, setCarriers] = useState<Carrier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingCarriers, setIsLoadingCarriers] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null)

  // Form per la creazione/modifica del servizio
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      destinationType: "national",
      destinationCountry: "",
      isEU: false,
      deliveryTimeMin: null,
      deliveryTimeMax: null,
      isActive: true
    }
  })

  // Carica i corrieri
  const loadCarriers = async () => {
    setIsLoadingCarriers(true)
    try {
      const response = await fetch('/api/carriers')
      const data = await response.json()
      if (data.success) {
        setCarriers(data.data)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to load carriers",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error loading carriers:', error)
      toast({
        title: "Error",
        description: "Failed to load carriers",
        variant: "destructive"
      })
    } finally {
      setIsLoadingCarriers(false)
    }
  }

  // Carica i servizi
  const loadServices = async () => {
    setIsLoading(true)
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
      setIsLoading(false)
    }
  }

  // Carica i dati all'avvio
  useEffect(() => {
    loadCarriers()
    loadServices()
  }, [])

  // Gestisce l'apertura del dialog per la creazione
  const handleCreate = () => {
    form.reset({
      name: "",
      code: "",
      description: "",
      carrier: "",
      destinationType: "national",
      destinationCountry: "",
      isEU: false,
      deliveryTimeMin: null,
      deliveryTimeMax: null,
      isActive: true
    })
    setEditingService(null)
    setIsOpen(true)
  }

  // Gestisce l'apertura del dialog per la modifica
  const handleEdit = (service: Service) => {
    form.reset({
      id: service._id,
      name: service.name,
      code: service.code || "",
      description: service.description || "",
      carrier: service.carrier._id,
      destinationType: service.destinationType,
      destinationCountry: service.destinationCountry || "",
      isEU: service.isEU,
      deliveryTimeMin: service.deliveryTimeMin,
      deliveryTimeMax: service.deliveryTimeMax,
      isActive: service.isActive
    })
    setEditingService(service)
    setIsOpen(true)
  }

  // Gestisce la creazione/aggiornamento di un servizio
  const onSubmit = async (data: ServiceFormValues) => {
    try {
      const isEditing = !!editingService
      const url = isEditing ? `/api/services/${data.id}` : '/api/services'
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
          title: isEditing ? "Service Updated" : "Service Created",
          description: `${data.name} has been successfully ${isEditing ? 'updated' : 'created'}.`
        })
        setIsOpen(false)
        loadServices()
      } else {
        toast({
          title: "Error",
          description: result.message || `Failed to ${isEditing ? 'update' : 'create'} service`,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error(`Error ${editingService ? 'updating' : 'creating'} service:`, error)
      toast({
        title: "Error",
        description: `Failed to ${editingService ? 'update' : 'create'} service`,
        variant: "destructive"
      })
    }
  }

  // Gestisce l'eliminazione di un servizio
  const handleDelete = async () => {
    if (!serviceToDelete) return

    try {
      const response = await fetch(`/api/services/${serviceToDelete._id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Service Deleted",
          description: `${serviceToDelete.name} has been successfully deleted.`
        })
        setDeleteDialogOpen(false)
        loadServices()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete service",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting service:', error)
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive"
      })
    }
  }

  // Conferma l'eliminazione di un servizio
  const confirmDelete = (service: Service) => {
    setServiceToDelete(service)
    setDeleteDialogOpen(true)
  }

  // Formatta il tempo di consegna
  const formatDeliveryTime = (min: number | null, max: number | null) => {
    if (min === null && max === null) return "Not specified";
    if (min === max) return `${min} days`;
    if (min === null) return `Up to ${max} days`;
    if (max === null) return `Min ${min} days`;
    return `${min}-${max} days`;
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
              <PlusCircle className="h-4 w-4 mr-2" /> Add Service
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Services</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <p>Loading services...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Carrier</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Delivery Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center">
                          No services found. Create your first service by clicking the "Add Service" button.
                        </TableCell>
                      </TableRow>
                    ) : (
                      services.map((service) => (
                        <TableRow key={service._id}>
                          <TableCell>{service.name}</TableCell>
                          <TableCell>{service.code || "—"}</TableCell>
                          <TableCell>{service.carrier.name}</TableCell>
                          <TableCell>
                            <span className="capitalize">{service.destinationType}</span>
                          </TableCell>
                          <TableCell>
                            {service.destinationType === "national" 
                              ? "Domestic" 
                              : service.destinationCountry || (service.destinationType === "both" ? "Multiple" : "All International")}
                            {service.isEU && service.destinationType !== "national" && " (EU)"}
                          </TableCell>
                          <TableCell>
                            {formatDeliveryTime(service.deliveryTimeMin, service.deliveryTimeMax)}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              service.isActive 
                                ? "bg-green-100 text-green-800" 
                                : "bg-gray-100 text-gray-800"
                            }`}>
                              {service.isActive ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(service)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => confirmDelete(service)}
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
              {editingService ? "Edit Service" : "Create Service"}
            </DialogTitle>
            <DialogDescription>
              {editingService
                ? "Update the service details below."
                : "Fill in the service details below to create a new service."}
            </DialogDescription>
          </DialogHeader>
          <ServiceForm 
            form={form}
            carriers={carriers}
            isLoadingCarriers={isLoadingCarriers}
            onSubmit={onSubmit}
            editingService={editingService}
            onCancel={() => setIsOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog di conferma eliminazione */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the service "{serviceToDelete?.name}"? This action cannot be undone and will also delete all associated rates.
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