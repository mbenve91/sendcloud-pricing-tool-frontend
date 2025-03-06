"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { X, FileText, ArrowLeft, Download } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCart } from "@/hooks/use-cart"
import { downloadQuotePDF } from "@/services/pdf-service"
import Image from "next/image"

interface Rate {
  id: string;
  carrierId: string;
  carrierName: string;
  carrierLogo: string;
  serviceCode: string;
  serviceName: string;
  serviceDescription: string;
  countryName?: string;
  basePrice: number;
  userDiscount: number;
  finalPrice: number;
  actualMargin: number;
  marginPercentage: number;
  adjustedMargin?: number;
  deliveryTimeMin?: number;
  deliveryTimeMax?: number;
  fuelSurcharge: number;
  volumeDiscount: number;
  promotionDiscount: number;
  totalBasePrice: number;
  weightRanges?: any[];
  currentWeightRange?: any;
  retailPrice?: number;
  purchasePrice?: number;
  margin?: number;
  weightMin?: number;
  weightMax?: number;
  service?: {
    _id?: string;
    name?: string;
  };
  isWeightRange?: boolean;
  parentRateId?: string;
}

export default function CartPage() {
  const router = useRouter()
  const { cartItems, removeFromCart, clearCart } = useCart()
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false)
  const [language, setLanguage] = useState("english")
  const [accountExecutive, setAccountExecutive] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [pdfGenerated, setPdfGenerated] = useState(false)
  
  // Se non ci sono elementi nel carrello, mostra messaggio e bottone per tornare alla pagina principale
  if (cartItems.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 lg:p-12 bg-gradient-to-br from-slate-100 to-slate-200">
        <Card className="w-full max-w-2xl">
          <CardHeader className="pb-3 relative">
            <div className="flex items-center gap-2">
              <Image 
                src="/sendcloud_logo.png" 
                alt="Sendcloud Logo" 
                width={40} 
                height={40} 
                className="rounded-md p-1"
              />
              <CardTitle className="bg-gradient-to-r from-[#122857] to-[#1e3a80] text-transparent bg-clip-text">
                Your Shopping Cart
              </CardTitle>
            </div>
            <CardDescription>Your cart is empty</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4 py-8">
            <p>Add shipping rates to your cart to continue</p>
            <Button onClick={() => router.push("/")} className="bg-primary text-white hover:bg-primary/90">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Rates
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  const handleGenerateQuote = () => {
    setIsGenerating(true);
    
    // Utilizziamo una funzione asincrona interna
    const generatePDF = async () => {
      try {
        // Genera il PDF (ora è asincrona)
        await downloadQuotePDF(cartItems as Rate[], {
          language,
          accountExecutive
        });
        
        setPdfGenerated(true);
        setIsGenerating(false);
        
        // Chiudi il dialog dopo 1 secondo
        setTimeout(() => {
          setQuoteDialogOpen(false);
          setPdfGenerated(false);
        }, 1000);
      } catch (error) {
        console.error("Error generating PDF:", error);
        setIsGenerating(false);
        
        // Mostra un messaggio di errore più dettagliato
        if (error instanceof Error) {
          alert(`An error occurred while generating the quote: ${error.message}`);
        } else {
          alert("An error occurred while generating the quote. Please try again.");
        }
      }
    };
    
    // Esegui la funzione asincrona
    generatePDF();
  };

  // Funzione per formattare i valori monetari
  const formatCurrency = (value: number | undefined): string => {
    if (value === undefined) return "€0.00";
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-12 bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="w-full max-w-6xl">
        <Card className="w-full shadow-md">
          <CardHeader className="pb-3 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image 
                  src="/sendcloud_logo.png" 
                  alt="Sendcloud Logo" 
                  width={40} 
                  height={40} 
                  className="rounded-md p-1"
                />
                <CardTitle className="bg-gradient-to-r from-[#122857] to-[#1e3a80] text-transparent bg-clip-text">
                  Your Shopping Cart
                </CardTitle>
              </div>
              <Button variant="outline" onClick={() => router.push("/")} className="relative">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Rates
              </Button>
            </div>
            <CardDescription>
              Selected shipping rates ready for quote generation
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Carrier</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Weight Range</TableHead>
                  {cartItems[0]?.countryName && <TableHead>Country</TableHead>}
                  <TableHead>Delivery Time</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cartItems.map((item) => (
                  <TableRow key={item.id} className={item.isWeightRange ? "bg-muted/20" : ""}>
                    <TableCell>
                      <div className="font-medium">
                        {item.isWeightRange && <span className="text-muted-foreground ml-4">└ </span>}
                        {item.carrierName}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.isWeightRange && <span className="text-muted-foreground">Range: </span>}
                      {item.serviceName}
                    </TableCell>
                    <TableCell>
                      {item.currentWeightRange ? 
                        `${item.currentWeightRange.min}-${item.currentWeightRange.max} kg` : 
                        (item.weightMin !== undefined && item.weightMax !== undefined ? 
                          `${item.weightMin}-${item.weightMax} kg` : "N/A")}
                    </TableCell>
                    {item.countryName && <TableCell>{item.countryName}</TableCell>}
                    <TableCell>
                      {item.deliveryTimeMin && item.deliveryTimeMax
                        ? `${item.deliveryTimeMin}-${item.deliveryTimeMax} days`
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.finalPrice)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <div className="flex justify-between items-center pt-4">
              <Button variant="destructive" onClick={clearCart}>
                Clear Cart
              </Button>
              <Button onClick={() => setQuoteDialogOpen(true)}>
                <FileText className="mr-2 h-4 w-4" />
                Generate Quote
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Dialog for quote generation */}
      <Dialog open={quoteDialogOpen} onOpenChange={setQuoteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Generate Quote</DialogTitle>
            <DialogDescription>
              Create a professional PDF quote to share with your prospect
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="language" className="text-right">
                Language
              </Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="italian">Italian</SelectItem>
                  <SelectItem value="german">German</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="executive" className="text-right">
                Account Executive
              </Label>
              <Input
                id="executive"
                value={accountExecutive}
                onChange={(e) => setAccountExecutive(e.target.value)}
                className="col-span-3"
                placeholder="Your name"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateQuote} 
              disabled={isGenerating || !accountExecutive || pdfGenerated}
              className={pdfGenerated ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {isGenerating ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Generating...
                </>
              ) : pdfGenerated ? (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Downloaded!
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Quote
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
} 