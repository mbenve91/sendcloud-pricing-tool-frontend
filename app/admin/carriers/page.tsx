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
import ChatWidget from "@/components/chat/ChatWidget"

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
  knowledgeBase?: KnowledgeItem[]
}

// Tipo per l'elemento della knowledge base
interface KnowledgeItem {
  _id?: string
  title: string
  content: string
  category: 'general' | 'shipping' | 'tracking' | 'returns' | 'pricing' | 'other'
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

// Schema di validazione per il form dell'elemento della knowledge base
const knowledgeItemFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  content: z.string().min(10, {
    message: "Content must be at least 10 characters.",
  }),
  category: z.enum(['general', 'shipping', 'tracking', 'returns', 'pricing', 'other']),
  isActive: z.boolean().default(true),
})

type KnowledgeItemFormValues = z.infer<typeof knowledgeItemFormSchema>

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
  
  // Nuovi stati per la knowledge base
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null)
  const [knowledgeDialogOpen, setKnowledgeDialogOpen] = useState(false)
  const [editingKnowledgeItem, setEditingKnowledgeItem] = useState<KnowledgeItem | null>(null)
  const [deleteKnowledgeDialogOpen, setDeleteKnowledgeDialogOpen] = useState(false)
  const [knowledgeItemToDelete, setKnowledgeItemToDelete] = useState<KnowledgeItem | null>(null)

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

  // Form per la knowledge base
  const knowledgeItemForm = useForm<KnowledgeItemFormValues>({
    resolver: zodResolver(knowledgeItemFormSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "general",
      isActive: true,
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

  // Gestisce l'apertura del dialog per la gestione della knowledge base
  const handleKnowledgeBase = (carrier: Carrier) => {
    setSelectedCarrier(carrier)
  }

  // Gestisce l'apertura del dialog per la creazione di un elemento della knowledge base
  const handleCreateKnowledgeItem = () => {
    knowledgeItemForm.reset({
      title: "",
      content: "",
      category: "general",
      isActive: true,
    })
    setEditingKnowledgeItem(null)
    setKnowledgeDialogOpen(true)
  }

  // Gestisce l'apertura del dialog per la modifica di un elemento della knowledge base
  const handleEditKnowledgeItem = (item: KnowledgeItem) => {
    knowledgeItemForm.reset({
      id: item._id,
      title: item.title,
      content: item.content,
      category: item.category,
      isActive: item.isActive,
    })
    setEditingKnowledgeItem(item)
    setKnowledgeDialogOpen(true)
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

  // Gestisce l'invio del form per la knowledge base
  const onSubmitKnowledgeItem = async (data: KnowledgeItemFormValues) => {
    if (!selectedCarrier) return

    setIsLoading(true)
    try {
      // Ottieni la base URL del backend dalle variabili d'ambiente
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';
      
      // Rimuovi '/api' alla fine se presente per costruire l'URL in modo consistente
      const baseUrl = backendUrl.endsWith('/api') ? backendUrl : `${backendUrl}/api`;
      
      let response;
      
      if (editingKnowledgeItem && data.id) {
        // Aggiornamento di un elemento esistente
        console.log(`Sending PUT request to: ${baseUrl}/carriers/${selectedCarrier._id}/knowledge/${data.id}`);
        response = await fetch(`${baseUrl}/carriers/${selectedCarrier._id}/knowledge/${data.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: data.title,
            content: data.content,
            category: data.category,
            isActive: data.isActive,
          }),
        })
      } else {
        // Creazione di un nuovo elemento
        console.log(`Sending POST request to: ${baseUrl}/carriers/${selectedCarrier._id}/knowledge`);
        response = await fetch(`${baseUrl}/carriers/${selectedCarrier._id}/knowledge`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: data.title,
            content: data.content,
            category: data.category,
            isActive: data.isActive,
          }),
        })
      }

      if (!response.ok) {
        const text = await response.text();
        console.error('Server response:', text);
        throw new Error(`Server responded with status: ${response.status}, body: ${text}`);
      }

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: editingKnowledgeItem ? "Knowledge item updated" : "Knowledge item created",
          description: `Successfully ${editingKnowledgeItem ? 'updated' : 'created'} knowledge item.`,
        })
        
        setKnowledgeDialogOpen(false)
        // Aggiorna i dati del corriere per riflettere le modifiche
        loadCarriers()
      } else {
        toast({
          title: "Error",
          description: result.message || `Failed to ${editingKnowledgeItem ? 'update' : 'create'} knowledge item.`,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error saving knowledge item:', error)
      toast({
        title: "Error",
        description: `Failed to ${editingKnowledgeItem ? 'update' : 'create'} knowledge item.`,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
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

  // Gestisce la conferma dell'eliminazione di un elemento della knowledge base
  const confirmDeleteKnowledgeItem = (item: KnowledgeItem) => {
    setKnowledgeItemToDelete(item)
    setDeleteKnowledgeDialogOpen(true)
  }

  // Gestisce l'eliminazione di un elemento della knowledge base
  const handleDeleteKnowledgeItem = async () => {
    if (!selectedCarrier || !knowledgeItemToDelete || !knowledgeItemToDelete._id) return

    setIsLoading(true)
    try {
      // Ottieni la base URL del backend dalle variabili d'ambiente
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';
      
      // Rimuovi '/api' alla fine se presente per costruire l'URL in modo consistente
      const baseUrl = backendUrl.endsWith('/api') ? backendUrl : `${backendUrl}/api`;
      
      console.log(`Sending DELETE request to: ${baseUrl}/carriers/${selectedCarrier._id}/knowledge/${knowledgeItemToDelete._id}`);
      
      const response = await fetch(
        `${baseUrl}/carriers/${selectedCarrier._id}/knowledge/${knowledgeItemToDelete._id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        const text = await response.text();
        console.error('Server response:', text);
        throw new Error(`Server responded with status: ${response.status}, body: ${text}`);
      }

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Knowledge item deleted",
          description: "Successfully deleted knowledge item.",
        })
        
        setDeleteKnowledgeDialogOpen(false)
        // Aggiorna i dati del corriere per riflettere le modifiche
        loadCarriers()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete knowledge item.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting knowledge item:', error)
      toast({
        title: "Error",
        description: "Failed to delete knowledge item.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
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
                              <Button variant="outline" size="sm" onClick={() => handleKnowledgeBase(carrier)}>
                                Knowledge Base
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

      {/* Knowledge base management dialog */}
      {selectedCarrier && (
        <Dialog open={!!selectedCarrier} onOpenChange={(open) => !open && setSelectedCarrier(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Knowledge Base for {selectedCarrier.name}</DialogTitle>
              <DialogDescription>
                Manage knowledge base items for this carrier. These will be used to train AI assistants to answer questions about this carrier.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex justify-end mb-4">
              <Button onClick={handleCreateKnowledgeItem}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Knowledge Item
              </Button>
            </div>
            
            <div className="overflow-y-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedCarrier.knowledgeBase && selectedCarrier.knowledgeBase.length > 0 ? (
                    selectedCarrier.knowledgeBase.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell className="capitalize">{item.category}</TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {item.isActive ? "Active" : "Inactive"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditKnowledgeItem(item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => confirmDeleteKnowledgeItem(item)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        No knowledge items yet. Add some to help train the AI assistant.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Knowledge item form dialog */}
      <Dialog open={knowledgeDialogOpen} onOpenChange={setKnowledgeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingKnowledgeItem ? "Edit Knowledge Item" : "Add Knowledge Item"}
            </DialogTitle>
            <DialogDescription>
              {editingKnowledgeItem
                ? "Update the knowledge item details below."
                : "Fill in the details to add a new knowledge item."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...knowledgeItemForm}>
            <form onSubmit={knowledgeItemForm.handleSubmit(onSubmitKnowledgeItem)} className="space-y-4">
              <FormField
                control={knowledgeItemForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter knowledge item title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={knowledgeItemForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Enter knowledge item content"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={knowledgeItemForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="general">General</option>
                        <option value="shipping">Shipping</option>
                        <option value="tracking">Tracking</option>
                        <option value="returns">Returns</option>
                        <option value="pricing">Pricing</option>
                        <option value="other">Other</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={knowledgeItemForm.control}
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
                <Button type="button" variant="outline" onClick={() => setKnowledgeDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingKnowledgeItem ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete knowledge item confirmation dialog */}
      <Dialog open={deleteKnowledgeDialogOpen} onOpenChange={setDeleteKnowledgeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this knowledge item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteKnowledgeDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteKnowledgeItem}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ChatWidget - mostrato quando un corriere è selezionato */}
      {selectedCarrier && (
        <div className="fixed bottom-4 right-4 z-50">
          <ChatWidget
            carrier={{
              _id: selectedCarrier._id,
              name: selectedCarrier.name,
              logoUrl: selectedCarrier.logoUrl
            }}
          />
        </div>
      )}
    </main>
  )
} 