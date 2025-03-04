"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  Plus,
  Trash2,
  Edit,
  Upload,
  Download,
  FileText,
  Search,
  AlertCircle,
  FileUp,
  FilePlus,
  FileQuestion,
  FileCheck,
  File,
  Trash,
} from "lucide-react"
import { Toaster, toast } from "react-hot-toast"

// Types based on the Mongoose schema
interface WeightRange {
  min: number
  max: number
  retailPrice: number
  purchasePrice: number
  margin: number
}

interface Pricing {
  destinationType: "national" | "eu" | "extra_eu"
  countryCode: string | null
  weightRanges: WeightRange[]
}

interface Service {
  name: string
  code: string
  description: string
  deliveryTimeMin: number
  deliveryTimeMax: number
  destinationTypes: ("national" | "eu" | "extra_eu")[]
  pricing: Pricing[]
}

interface VolumeDiscount {
  minVolume: number
  maxVolume: number | null
  discountPercentage: number
  applicableServices: string[]
}

interface AdditionalFee {
  name: string
  description: string
  fee: number
  applicableServices: string[]
}

interface Promotion {
  name: string
  description: string
  discountPercentage: number
  startDate: Date
  endDate: Date
  applicableServices: string[]
}

interface Carrier {
  _id: string
  name: string
  logoUrl: string
  isVolumetric: boolean
  fuelSurcharge: number
  services: Service[]
  volumeDiscounts: VolumeDiscount[]
  additionalFees: AdditionalFee[]
  promotions: Promotion[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface Document {
  _id: string
  carrierId: string
  title: string
  type: 'contract' | 'agreement' | 'other' | 'faq' | 'guide'
  uploadedAt?: string
  fileUrl?: string
}

export default function CarriersPage() {
  const [carriers, setCarriers] = useState<Carrier[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAddDocumentDialogOpen, setIsAddDocumentDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const documentFileInputRef = useRef<HTMLInputElement>(null)
  const [documentTitle, setDocumentTitle] = useState("")
  const [documentType, setDocumentType] = useState<"faq" | "guide" | "contract" | "other">("faq")
  const [selectedCarrierId, setSelectedCarrierId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ title: string; description: string; type: "success" | "error" } | null>(null)
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false)

  const router = useRouter()

  // Filter carriers based on search term and active tab
  const filteredCarriers = carriers.filter((carrier) => {
    const matchesSearch = carrier.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && carrier.isActive) ||
      (activeTab === "inactive" && !carrier.isActive)
    return matchesSearch && matchesTab
  })

  // Fetch documents for a carrier
  const getCarrierDocuments = (carrierId: string): Document[] => {
    // In un'applicazione reale, questa funzione recupererebbe i documenti dal backend
    // Per ora, restituiamo un array vuoto perché i dati reali non hanno documenti
    return [];
  };

  // Handle carrier deletion
  const handleDeleteCarrier = () => {
    if (selectedCarrier) {
      setCarriers(carriers.filter((c) => c._id !== selectedCarrier._id))
      setIsDeleteDialogOpen(false)
      setSelectedCarrier(null)
    }
  }

  // Handle document upload
  const handleDocumentUpload = () => {
    if (selectedCarrierId && documentTitle && documentType) {
      const newDocument: Document = {
        _id: Math.random().toString(36).substring(7),
        carrierId: selectedCarrierId,
        title: documentTitle,
        type: documentType,
        fileUrl: "/documents/new-document.pdf", // In a real app, this would be the uploaded file URL
        uploadedAt: new Date().toISOString(),
      }

      setDocuments([...documents, newDocument])
      setIsAddDocumentDialogOpen(false)
      setDocumentTitle("")
      setDocumentType("faq")
      setSelectedCarrierId(null)
    }
  }

  // Handle document deletion
  const handleDocumentDelete = (documentId: string) => {
    // In un'applicazione reale, questa funzione invierebbe una richiesta al backend per eliminare il documento
    toast.success('Documento eliminato con successo');
  };

  // Handle CSV import
  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        // Crea un FormData per inviare il file
        const formData = new FormData();
        formData.append('file', file);

        // Mostra stato di caricamento
        setIsLoading(true);
        
        // Invia il file al server
        const apiUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
                        ? 'http://localhost:5050/api/carriers/import'
                        : '/api/carriers/import'; // Usa la route API interna
        
        console.log("Importing CSV to:", apiUrl);
        const response = await fetch(apiUrl, {
          method: 'POST',
          body: formData,
          // Non settare Content-Type, viene impostato automaticamente con il boundary
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.message || 'Errore durante l\'importazione');
        }
        
        // Mostra un messaggio di successo
        setToastMessage({
          title: "Importazione completata",
          description: result.message,
          type: "success"
        });
        
        // Ricarica i carriers
        fetchCarriers();
        
        // Chiudi il dialog
        setIsImportDialogOpen(false);
      } catch (error) {
        console.error('Error importing CSV:', error);
        setToastMessage({
          title: "Errore di importazione",
          description: error instanceof Error ? error.message : "Si è verificato un errore durante l'importazione",
          type: "error"
        });
      } finally {
        setIsLoading(false);
        
        // Reset input file
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Funzione per caricare i corrieri dal backend
  const fetchCarriers = async () => {
    try {
      setIsLoading(true);
      
      // Usa sempre l'URL completo in produzione per evitare problemi di routing
      // Usa il percorso locale solo in sviluppo
      const apiUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
                      ? 'http://localhost:5050/api/carriers'
                      : '/api/carriers'; // Usa la route API interna di Next.js
      
      console.log("Fetching carriers from:", apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response details:', errorText.substring(0, 200));
        throw new Error(`Errore nel caricamento dei corrieri: ${response.status} ${response.statusText}`);
      }
      
      // Verifica che la risposta sia in formato JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Non-JSON response:', textResponse.substring(0, 200));
        throw new Error('Il server non ha restituito dati JSON validi');
      }
      
      const data = await response.json();
      console.log('Carriers data received:', data.length ? `${data.length} carriers` : 'empty data');
      setCarriers(data);
    } catch (error) {
      console.error('Error fetching carriers:', error);
      setToastMessage({
        title: "Errore",
        description: error instanceof Error ? error.message : "Impossibile caricare i corrieri",
        type: "error"
      });
      // Fallback ai dati mock
      console.log('Using mock data as fallback');
      setCarriers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Carica i corrieri all'avvio
  useEffect(() => {
    fetchCarriers();
  }, []);

  // Effect per gestire i messaggi toast
  useEffect(() => {
    if (toastMessage) {
      if (toastMessage.type === "success") {
        toast.success(toastMessage.description);
      } else {
        toast.error(toastMessage.description);
      }
      setToastMessage(null);
    }
  }, [toastMessage]);

  // Handle document creation
  const handleDocumentCreate = () => {
    if (selectedCarrier && documentTitle.trim() && documentType) {
      // In a real app, this would send a POST request to create a new document
      const newDocument: Document = {
        _id: `doc${Math.random().toString(36).substring(7)}`,
        carrierId: selectedCarrier._id,
        title: documentTitle,
        type: documentType as 'contract' | 'agreement' | 'other' | 'faq' | 'guide',
        uploadedAt: new Date().toISOString(),
        fileUrl: "/documents/new-document.pdf", // In a real app, this would be the uploaded file URL
      }
      
      // Reset form
      setDocumentTitle("")
      setDocumentType("contract")
      setIsDocumentModalOpen(false)
      toast.success("Documento creato con successo")
    }
  }

  return (
    <div className="container mx-auto py-8">
      {/* Toaster per le notifiche */}
      <Toaster position="top-right" />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Carrier Management</h1>
        <div className="flex space-x-2">
          <Button onClick={() => router.push("/carriers/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Carrier
          </Button>
          <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Filters and search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="relative w-full md:w-1/3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search carrier..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="inactive">Inactive</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Carriers list */}
        <Card>
          <CardHeader>
            <CardTitle>Carriers ({filteredCarriers.length})</CardTitle>
            <CardDescription>List of carriers available in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Logo</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Services</TableHead>
                    <TableHead>Fuel Surcharge</TableHead>
                    <TableHead>Volumetric</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCarriers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No carriers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCarriers.map((carrier) => (
                      <TableRow key={carrier._id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="w-10 h-10 rounded-md overflow-hidden bg-white flex items-center justify-center">
                            <img
                              src={carrier.logoUrl || "/placeholder.svg"}
                              alt={carrier.name}
                              className="w-8 h-8 object-contain"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{carrier.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {carrier.services && carrier.services.length > 0 ? (
                              carrier.services.map((service, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {service.name}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">No services</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{carrier.fuelSurcharge}%</TableCell>
                        <TableCell>
                          {carrier.isVolumetric ? (
                            <Badge variant="secondary">Yes</Badge>
                          ) : (
                            <Badge variant="outline">No</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {carrier.isActive !== undefined ? (
                            carrier.isActive ? (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                                Inactive
                              </Badge>
                            )
                          ) : (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Active
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{carrier.updatedAt ? formatDate(carrier.updatedAt) : "N/A"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => router.push(`/carriers/${carrier._id}`)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedCarrier(carrier)
                                setIsDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => {}}>
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                  <DialogTitle>{carrier.name} Documents</DialogTitle>
                                </DialogHeader>
                                <div className="py-4">
                                  <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium">Available Documents</h3>
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        setSelectedCarrierId(carrier._id)
                                        setIsAddDocumentDialogOpen(true)
                                      }}
                                    >
                                      <FilePlus className="mr-2 h-4 w-4" />
                                      Add Document
                                    </Button>
                                  </div>
                                  <Separator className="my-4" />
                                  <ScrollArea className="h-[300px]">
                                    {getCarrierDocuments(carrier._id).length === 0 ? (
                                      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                        <FileQuestion className="h-12 w-12 mb-2" />
                                        <p>No documents available</p>
                                        <Button
                                          variant="outline"
                                          className="mt-4"
                                          onClick={() => {
                                            setSelectedCarrierId(carrier._id)
                                            setIsAddDocumentDialogOpen(true)
                                          }}
                                        >
                                          Add first document
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="space-y-4">
                                        {getCarrierDocuments(carrier._id).map((doc) => (
                                          <div
                                            key={doc._id}
                                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30"
                                          >
                                            <div className="flex items-center">
                                              <div className="p-2 bg-primary/10 rounded-md mr-3">
                                                <FileText className="h-5 w-5 text-primary" />
                                              </div>
                                              <div>
                                                <h4 className="font-medium">{doc.title}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                  {doc.type === "faq"
                                                    ? "FAQ"
                                                    : doc.type === "guide"
                                                      ? "Guide"
                                                      : doc.type === "contract"
                                                        ? "Contract"
                                                        : "Other"}
                                                </p>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm text-muted-foreground">
                                                {doc.uploadedAt ? formatDate(new Date(doc.uploadedAt)) : "N/A"}
                                              </span>
                                              <Button variant="ghost" size="icon">
                                                <Download className="h-4 w-4" />
                                              </Button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </ScrollArea>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Carrier Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this carrier?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All data related to {selectedCarrier?.name} will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCarrier}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import CSV Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Carriers from CSV</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
              <FileUp className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-2">Drag and drop your CSV file here or click to browse</p>
              <p className="text-xs text-muted-foreground mb-4">Supports CSV files up to 10MB</p>
              <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImportCSV} className="hidden" />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                Select File
              </Button>
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">Required CSV format:</h4>
              <p className="text-sm text-muted-foreground mb-2">The CSV file must contain the following columns:</p>
              <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
                <li>name (required): Carrier name</li>
                <li>logoUrl: Logo URL</li>
                <li>isVolumetric (required): true/false</li>
                <li>fuelSurcharge: Fuel surcharge percentage</li>
                <li>isActive: true/false</li>
              </ul>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  Services, volume discounts, additional fees, and promotions will need to be configured manually after
                  import.
                </p>
              </div>
              <div className="mt-4">
                <a
                  href="/api/templates/carriers"
                  download
                  className="text-sm text-primary hover:underline flex items-center"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download CSV template
                </a>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => fileInputRef.current?.click()}>Select and Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Document Dialog */}
      <Dialog open={isAddDocumentDialogOpen} onOpenChange={setIsAddDocumentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Document</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="documentTitle">Document Title</Label>
              <Input
                id="documentTitle"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="E.g. FAQ, Integration Guide, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="documentType">Document Type</Label>
              <select
                id="documentType"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as "faq" | "guide" | "contract" | "other")}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="faq">FAQ</option>
                <option value="guide">Guide</option>
                <option value="contract">Contract</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="documentFile">File</Label>
              <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center">
                <FileUp className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">Drag and drop your file here or click to browse</p>
                <input
                  type="file"
                  id="documentFile"
                  ref={documentFileInputRef}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                />
                <Button variant="outline" size="sm" onClick={() => documentFileInputRef.current?.click()}>
                  Select File
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDocumentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDocumentUpload}>Upload Document</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Management */}
      {selectedCarrier ? (
        <div className="mt-6">
          <h3 className="text-xl font-bold mb-4">Gestione Documenti</h3>
          <div className="bg-white rounded-lg shadow p-4">
            {getCarrierDocuments(selectedCarrier._id).length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-2">Nessun documento disponibile per questo corriere</p>
                <Button 
                  onClick={() => setIsDocumentModalOpen(true)} 
                  variant="outline"
                >
                  Aggiungi il primo documento
                </Button>
              </div>
            ) : (
              <>
                <div className="flex justify-between mb-4">
                  <h4 className="font-medium">Documenti del corriere</h4>
                  <Button 
                    onClick={() => setIsDocumentModalOpen(true)} 
                    variant="outline" 
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Aggiungi Documento
                  </Button>
                </div>
                <div className="space-y-2">
                  {getCarrierDocuments(selectedCarrier._id).map((doc: Document) => (
                    <div key={doc._id} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center">
                        <div className="mr-3">
                          {doc.type === 'contract' && <FileText className="h-5 w-5 text-blue-500" />}
                          {doc.type === 'agreement' && <FileCheck className="h-5 w-5 text-green-500" />}
                          {doc.type === 'faq' && <FileQuestion className="h-5 w-5 text-purple-500" />}
                          {doc.type === 'guide' && <FilePlus className="h-5 w-5 text-yellow-500" />}
                          {doc.type === 'other' && <File className="h-5 w-5 text-gray-500" />}
                        </div>
                        <div>
                          <p className="font-medium">{doc.title}</p>
                          <p className="text-xs text-gray-500">
                            Caricato il: {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDocumentDelete(doc._id)}>
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

