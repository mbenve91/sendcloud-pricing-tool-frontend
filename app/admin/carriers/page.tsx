"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Metadata } from "next"
import { PlusCircle, Edit, Trash2, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { toast } from "@/components/ui/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

// Schema di validazione per il form del corriere
const carrierFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  logoUrl: z.string().url({
    message: "Please enter a valid URL for the logo.",
  }).optional().or(z.literal('')),
  isActive: z.boolean().default(true),
  fuelSurcharge: z.number().min(0).max(100).default(0),
  isVolumetric: z.boolean().default(false)
})

type CarrierFormValues = z.infer<typeof carrierFormSchema>

// Tipo per il corriere
interface Carrier {
  _id: string
  name: string
  logoUrl: string | null
  isActive: boolean
  fuelSurcharge: number
  isVolumetric: boolean
}

// Componente per il form di creazione/modifica
const CarrierForm = ({
  form,
  onSubmit,
  editingCarrier,
  onCancel
}: {
  form: any,
  onSubmit: (data: CarrierFormValues) => void,
  editingCarrier: Carrier | null,
  onCancel: () => void
}) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter carrier name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="logoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/logo.png" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fuelSurcharge"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fuel Surcharge (%)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0" 
                  max="100" 
                  step="0.01" 
                  placeholder="0.00" 
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isVolumetric"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Volumetric</FormLabel>
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
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Active</FormLabel>
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
            {editingCarrier ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default function CarriersPage() {
  const [carriers, setCarriers] = useState<Carrier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingCarrier, setEditingCarrier] = useState<Carrier | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [carrierToDelete, setCarrierToDelete] = useState<Carrier | null>(null)

  // Form per la creazione/modifica del corriere
  const form = useForm<CarrierFormValues>({
    resolver: zodResolver(carrierFormSchema),
    defaultValues: {
      name: "",
      logoUrl: "",
      isActive: true,
      fuelSurcharge: 0,
      isVolumetric: false
    }
  })

  // Funzione per caricare i corrieri
  const loadCarriers = async () => {
    setIsLoading(true)
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
      setIsLoading(false)
    }
  }

  // Carica i corrieri all'avvio
  useEffect(() => {
    loadCarriers()
  }, [])

  // Gestisce l'apertura del dialog per la creazione
  const handleCreate = () => {
    form.reset({
      name: "",
      logoUrl: "",
      isActive: true,
      fuelSurcharge: 0,
      isVolumetric: false
    })
    setEditingCarrier(null)
    setIsOpen(true)
  }

  // Gestisce l'apertura del dialog per la modifica
  const handleEdit = (carrier: Carrier) => {
    form.reset({
      id: carrier._id,
      name: carrier.name,
      logoUrl: carrier.logoUrl || "",
      isActive: carrier.isActive,
      fuelSurcharge: carrier.fuelSurcharge,
      isVolumetric: carrier.isVolumetric
    })
    setEditingCarrier(carrier)
    setIsOpen(true)
  }

  // Gestisce la creazione/aggiornamento di un corriere
  const onSubmit = async (data: CarrierFormValues) => {
    try {
      const isEditing = !!editingCarrier
      const url = isEditing ? `/api/carriers/${data.id}` : '/api/carriers'
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
          title: isEditing ? "Carrier Updated" : "Carrier Created",
          description: `${data.name} has been successfully ${isEditing ? 'updated' : 'created'}.`
        })
        setIsOpen(false)
        loadCarriers()
      } else {
        toast({
          title: "Error",
          description: result.message || `Failed to ${isEditing ? 'update' : 'create'} carrier`,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error(`Error ${editingCarrier ? 'updating' : 'creating'} carrier:`, error)
      toast({
        title: "Error",
        description: `Failed to ${editingCarrier ? 'update' : 'create'} carrier`,
        variant: "destructive"
      })
    }
  }

  // Gestisce l'eliminazione di un corriere
  const handleDelete = async () => {
    if (!carrierToDelete) return

    try {
      const response = await fetch(`/api/carriers/${carrierToDelete._id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Carrier Deleted",
          description: `${carrierToDelete.name} has been successfully deleted.`
        })
        setDeleteDialogOpen(false)
        loadCarriers()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete carrier",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting carrier:', error)
      toast({
        title: "Error",
        description: "Failed to delete carrier",
        variant: "destructive"
      })
    }
  }

  // Conferma l'eliminazione di un corriere
  const confirmDelete = (carrier: Carrier) => {
    setCarrierToDelete(carrier)
    setDeleteDialogOpen(true)
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
              <PlusCircle className="h-4 w-4 mr-2" /> Add Carrier
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Carriers</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <p>Loading carriers...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Logo</TableHead>
                      <TableHead>Fuel Surcharge</TableHead>
                      <TableHead>Volumetric</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {carriers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          No carriers found. Create your first carrier by clicking the "Add Carrier" button.
                        </TableCell>
                      </TableRow>
                    ) : (
                      carriers.map((carrier) => (
                        <TableRow key={carrier._id}>
                          <TableCell>{carrier.name}</TableCell>
                          <TableCell>
                            {carrier.logoUrl ? (
                              <img 
                                src={carrier.logoUrl} 
                                alt={carrier.name} 
                                className="h-8 w-auto object-contain"
                              />
                            ) : (
                              "No logo"
                            )}
                          </TableCell>
                          <TableCell>{carrier.fuelSurcharge}%</TableCell>
                          <TableCell>{carrier.isVolumetric ? "Yes" : "No"}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              carrier.isActive 
                                ? "bg-green-100 text-green-800" 
                                : "bg-gray-100 text-gray-800"
                            }`}>
                              {carrier.isActive ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(carrier)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => confirmDelete(carrier)}
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingCarrier ? "Edit Carrier" : "Create Carrier"}
            </DialogTitle>
            <DialogDescription>
              {editingCarrier
                ? "Update the carrier details below."
                : "Fill in the carrier details below to create a new carrier."}
            </DialogDescription>
          </DialogHeader>
          <CarrierForm 
            form={form}
            onSubmit={onSubmit}
            editingCarrier={editingCarrier}
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
              Are you sure you want to delete the carrier "{carrierToDelete?.name}"? This action cannot be undone.
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