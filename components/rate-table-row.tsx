import React, { Fragment } from 'react';
import { TableRow, TableCell, Table, TableBody, TableHead, TableHeader } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, ChevronRight, Info } from "lucide-react";
import { calculateTotalMargin, formatCurrency, getMarginColor, getMarginLabel } from '@/utils/price-calculations';
import Image from 'next/image';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Definisci l'interfaccia WeightRange
interface WeightRange {
  id: string;
  label: string;
  min: number;
  max: number;
  basePrice: number;
  userDiscount: number;
  finalPrice: number;
  actualMargin: number;
  adjustedMargin?: number;
  volumeDiscount: number;
  promotionDiscount: number;
  displayBasePrice?: number;
}

// Definisci le props del componente
interface RateTableRowProps {
  rate: any; // idealmente dovrebbe essere tipizzato correttamente come Rate
  selectedRows: Record<string, boolean>;
  expandedRows: Record<string, boolean>;
  visibleColumns: { id: string, name: string, isVisible: boolean }[];
  handleRowSelect: (id: string, checked: boolean, isWeightRange?: boolean, parentId?: string) => void;
  toggleRowExpansion: (id: string) => void;
  handleDiscountChange: (rateId: string, serviceId: string, newDiscount: number) => void;
  includeFuelSurcharge: boolean;
  filters: any; // idealmente dovrebbe essere tipizzato correttamente
  getFuelSurchargeText: (rate: any) => React.ReactNode;
  serviceWeightRanges: { [serviceId: string]: WeightRange[] }; // Aggiunto questo prop
}

const calculateFinalPrice = (
  basePrice: number,
  userDiscount: number,
  fuelSurchargePercentage: number,
  includeFuelSurcharge: boolean,
  purchasePrice: number = 0,
  tollFee: number = 0,
  carrierName: string = ''
): number => {
  // Calcola il margine (differenza tra prezzo retail e prezzo d'acquisto)
  const margin = basePrice - purchasePrice;
  
  // Calcola l'importo dello sconto come percentuale del margine
  const discountAmount = margin * userDiscount / 100;
  
  // Prezzo scontato = prezzo d'acquisto + margine scontato
  const discountedPrice = purchasePrice + (margin - discountAmount);
  
  let finalPrice = discountedPrice;
  
  if (includeFuelSurcharge && fuelSurchargePercentage > 0) {
    // Applica il fuel surcharge sul prezzo già scontato, non sul prezzo retail originale
    finalPrice += discountedPrice * fuelSurchargePercentage / 100;
  }
  
  // Forza il supplemento pedaggio per GLS
  if (carrierName === 'GLS') {
    finalPrice += 0.05;
  }
  // Altrimenti aggiungi il supplemento pedaggio se presente
  else if (tollFee > 0) {
    finalPrice += tollFee;
  }
  
  return finalPrice;
};

// Funzione per calcolare il prezzo base con il pedaggio GLS incluso
const getBasePrice = (basePrice: number, carrierName: string, tollFee: number = 0): number => {
  // Se è GLS, aggiungi il supplemento pedaggio al prezzo base
  if (carrierName === 'GLS') {
    return basePrice + 0.05;
  }
  // Altrimenti aggiungi il tollFee se presente
  else if (tollFee > 0) {
    return basePrice + tollFee;
  }
  
  return basePrice;
};

const RateTableRow = React.memo(({
  rate,
  selectedRows,
  expandedRows,
  visibleColumns,
  handleRowSelect,
  toggleRowExpansion,
  handleDiscountChange,
  includeFuelSurcharge,
  filters,
  getFuelSurchargeText,
  serviceWeightRanges
}: RateTableRowProps) => {
  
  const isExpanded = expandedRows[rate.id] || false;
  const isSelected = selectedRows[rate.id] || false;
  
  // Ottieni la percentuale del fuel surcharge dal carrier
  const fuelSurchargePercentage = rate.fuelSurcharge !== undefined 
    ? rate.fuelSurcharge 
    : 8; // default 8% se non specificato
    
  // Ottieni il supplemento pedaggio
  const tollFee = rate.tollFee || 0;
  
  // Forza visualizzazione debug
  console.log("GLS tollFee:", tollFee, "Carrier:", rate.carrierName);
    
  // Prezzo d'acquisto (dal rate o calcolato dall'actualMargin)
  const purchasePrice = rate.purchasePrice || (rate.basePrice - rate.actualMargin);
  
  // Calcola l'importo del fuel surcharge come percentuale del prezzo retail
  const fuelSurchargeRetail = rate.basePrice * fuelSurchargePercentage / 100;
  
  // Calcola l'importo del fuel surcharge come percentuale del prezzo d'acquisto
  const fuelSurchargePurchase = purchasePrice * fuelSurchargePercentage / 100;
  
  // Calcola il margine sui prezzi base senza considerare il fuel
  const baseMargin = rate.basePrice - purchasePrice;
  
  // Calcola lo sconto sul margine
  const discountOnMargin = baseMargin * (rate.userDiscount || 0) / 100;
  
  // Margine base dopo lo sconto
  const discountedBaseMargin = baseMargin - discountOnMargin;
  
  // Prezzo retail scontato (dopo applicazione dello sconto sul margine)
  const discountedRetailPrice = purchasePrice + discountedBaseMargin;
  
  // Calcola l'importo del fuel surcharge come percentuale del prezzo base
  const fuelSurchargeAmount = rate.basePrice * fuelSurchargePercentage / 100;
  
  // Calcola l'importo del fuel surcharge come percentuale del prezzo scontato (per il cliente)
  const fuelSurchargeDiscountedRetail = discountedRetailPrice * fuelSurchargePercentage / 100;
  
  // Calcola il margine sul fuel (usando il prezzo scontato per il cliente)
  const fuelSurchargeMargin = fuelSurchargeDiscountedRetail - fuelSurchargePurchase;
  
  // Calcola il margine finale (base + fuel se abilitato)
  const finalMargin = includeFuelSurcharge 
    ? discountedBaseMargin + fuelSurchargeMargin + (tollFee || 0)
    : discountedBaseMargin + (tollFee || 0);
  
  // Aggiungi questa funzione per visualizzare il supplemento pedaggio nel tooltip
  const renderTollFeeInfo = () => {
    // Se è GLS, mostra sempre il supplemento pedaggio anche se il valore non è presente nell'oggetto rate
    if (rate.carrierName === 'GLS') {
      return (
        <div className="flex justify-between">
          <span>+ Supplemento pedaggio:</span>
          <span>{formatCurrency(0.05)}</span>
        </div>
      );
    }
    
    if (!tollFee || tollFee <= 0) return null;
    
    console.log("renderTollFeeInfo chiamato con tollFee:", tollFee);
    
    return (
      <div className="flex justify-between">
        <span>+ Supplemento pedaggio:</span>
        <span>{formatCurrency(tollFee)}</span>
      </div>
    );
  };

  return (
    <Fragment>
      <TableRow key={rate.id} className="even:bg-muted/20 hover:bg-muted/40">
        {/* Colonna di selezione */}
        <TableCell className="w-10 text-center">
          <Checkbox
            id={`select-${rate.id}`}
            checked={isSelected}
            onCheckedChange={(checked) => handleRowSelect(rate.id, !!checked)}
          />
        </TableCell>
        
        {/* Pulsante espansione */}
        <TableCell className="w-10 text-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleRowExpansion(rate.id)}
            className="h-8 w-8"
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </TableCell>
        
        {/* Colonna Carrier */}
        {visibleColumns.find((col) => col.id === "carrier")?.isVisible && (
          <TableCell>
            <div className="flex items-center space-x-2">
              {rate.carrierLogo && (
                <div className="h-8 w-8 overflow-hidden">
                  <Image 
                    src={rate.carrierLogo} 
                    alt={rate.carrierName} 
                    width={32} 
                    height={32} 
                    className="object-contain"
                  />
                </div>
              )}
              <span>{rate.carrierName}</span>
            </div>
          </TableCell>
        )}
        
        {/* Colonna Service */}
        {visibleColumns.find((col) => col.id === "service")?.isVisible && (
          <TableCell>
            <div className="space-y-1">
              <div className="font-medium">{rate.serviceName}</div>
              <div className="text-xs text-muted-foreground">{rate.serviceDescription}</div>
            </div>
          </TableCell>
        )}
        
        {/* Colonna Country */}
        {visibleColumns.find((col) => col.id === "country")?.isVisible && (
          <TableCell>{rate.countryName}</TableCell>
        )}
        
        {/* Colonna Base Rate */}
        {visibleColumns.find((col) => col.id === "baseRate")?.isVisible && (
          <TableCell className="text-center relative group">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center cursor-help">
                    <span>{formatCurrency(getBasePrice(rate.displayBasePrice || rate.basePrice, rate.carrierName, tollFee))}</span>
                    <Info className="ml-1 h-4 w-4 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="w-80 p-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Base Price Calculation</h4>
                    <div className="bg-muted/30 p-2 rounded-md text-sm space-y-1">
                      {includeFuelSurcharge ? (
                        <>
                          <div className="flex justify-between">
                            <span>Retail Price:</span>
                            <span>{formatCurrency(rate.basePrice)}</span>
                          </div>
                          {renderTollFeeInfo()}
                          <div className="flex justify-between">
                            <span>+ Customer Fuel ({fuelSurchargePercentage}%):</span>
                            <span>{formatCurrency(fuelSurchargeAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>- Discount ({rate.userDiscount || 0}%):</span>
                            <span className="text-destructive">-{formatCurrency((rate.basePrice * (rate.userDiscount || 0) / 100))}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>- Purchase Price:</span>
                            <span className="text-destructive">-{formatCurrency(rate.purchasePrice || (rate.basePrice - rate.actualMargin))}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>- Supplier Fuel ({fuelSurchargePercentage}%):</span>
                            <span className="text-destructive">-{formatCurrency(fuelSurchargeAmount)}</span>
                          </div>
                          <div className="border-t pt-1 flex justify-between font-medium">
                            <span>= Total Base Price:</span>
                            <span>{formatCurrency(getBasePrice(rate.displayBasePrice || rate.basePrice, rate.carrierName, tollFee))}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span>Retail Price:</span>
                            <span>{formatCurrency(rate.basePrice)}</span>
                          </div>
                          {renderTollFeeInfo()}
                          <div className="border-t pt-1 flex justify-between font-medium">
                            <span>= Total Base Price:</span>
                            <span>{formatCurrency(getBasePrice(rate.basePrice, rate.carrierName, tollFee))}</span>
                          </div>
                          <div className="text-muted-foreground text-xs mt-1">
                            <em>Fuel not included ({fuelSurchargePercentage}% = {formatCurrency(fuelSurchargeAmount)})</em>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </TableCell>
        )}
        
        {/* Colonna Discount */}
        {visibleColumns.find((col) => col.id === "discount")?.isVisible && (
          <TableCell className="w-24 text-right">
            <div className="flex items-center justify-end space-x-1">
              <Input
                type="number"
                min="0"
                max="90"
                value={rate.userDiscount || 0}
                onChange={(e) => handleDiscountChange(
                  rate.id, 
                  rate.service?._id || '', 
                  parseFloat(e.target.value)
                )}
                className="h-8 w-16 text-right"
              />
              <span>%</span>
            </div>
          </TableCell>
        )}
        
        {/* Colonna Final Price */}
        {visibleColumns.find((col) => col.id === "finalPrice")?.isVisible && (
          <TableCell className="text-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="space-y-1 cursor-help text-center">
                    <div className="font-medium flex items-center justify-center">
                      {formatCurrency(rate.finalPrice)}
                      <Info className="ml-1 h-4 w-4 text-muted-foreground" />
                    </div>
                    {getFuelSurchargeText(rate)}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="w-80 p-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Final Price Calculation</h4>
                    <div className="bg-muted/30 p-2 rounded-md text-sm space-y-1">
                      {includeFuelSurcharge ? (
                        <>
                          <div className="flex justify-between">
                            <span>Retail Price:</span>
                            <span>{formatCurrency(rate.basePrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>- Purchase Price:</span>
                            <span className="text-destructive">-{formatCurrency(purchasePrice)}</span>
                          </div>
                          <div className="border-t border-dashed pt-1 flex justify-between">
                            <span>= Rate Margin:</span>
                            <span>{formatCurrency(baseMargin)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>- Discount ({rate.userDiscount || 0}% on margin):</span>
                            <span className="text-destructive">-{formatCurrency((baseMargin * (rate.userDiscount || 0) / 100))}</span>
                          </div>
                          <div className="border-t border-dashed pt-1 flex justify-between">
                            <span>= Discounted Price:</span>
                            <span>{formatCurrency(
                              purchasePrice + (baseMargin - (baseMargin * (rate.userDiscount || 0) / 100))
                            )}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>+ Customer Fuel ({fuelSurchargePercentage}% on discounted price):</span>
                            <span>{formatCurrency(
                              (purchasePrice + (baseMargin - (baseMargin * (rate.userDiscount || 0) / 100))) * fuelSurchargePercentage / 100
                            )}</span>
                          </div>
                          {renderTollFeeInfo()}
                          <div className="border-t pt-1 flex justify-between font-medium">
                            <span>= Final Price:</span>
                            <span>{formatCurrency(
                              purchasePrice + 
                              (baseMargin - (baseMargin * (rate.userDiscount || 0) / 100)) + 
                              ((purchasePrice + (baseMargin - (baseMargin * (rate.userDiscount || 0) / 100))) * fuelSurchargePercentage / 100) +
                              (tollFee || 0)
                            )}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span>Retail Price:</span>
                            <span>{formatCurrency(rate.basePrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>- Discount ({rate.userDiscount || 0}%):</span>
                            <span className="text-destructive">-{formatCurrency((rate.basePrice * (rate.userDiscount || 0) / 100))}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>- Purchase Price:</span>
                            <span className="text-destructive">-{formatCurrency(rate.purchasePrice || (rate.basePrice - rate.actualMargin))}</span>
                          </div>
                          {renderTollFeeInfo()}
                          <div className="border-t pt-1 flex justify-between font-medium">
                            <span>= Final Price:</span>
                            <span>{formatCurrency(rate.finalPrice)}</span>
                          </div>
                          <div className="text-muted-foreground text-xs mt-1">
                            <em>Fuel not included ({fuelSurchargePercentage}% = {formatCurrency(fuelSurchargeAmount)})</em>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </TableCell>
        )}
        
        {/* Colonna Margin */}
        {visibleColumns.find((col) => col.id === "margin")?.isVisible && (
          <TableCell className="text-center relative group">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center cursor-help">
                    <Badge
                      variant={getMarginColor(finalMargin) as any}
                    >
                      {formatCurrency(finalMargin)} ({getMarginLabel(finalMargin)})
                    </Badge>
                    <Info className="ml-1 h-4 w-4 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="w-80 p-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Margin Calculation</h4>
                    <div className="bg-muted/30 p-2 rounded-md text-sm space-y-1">
                      {includeFuelSurcharge ? (
                        <>
                          <div className="flex justify-between">
                            <span>Retail Price:</span>
                            <span>{formatCurrency(rate.basePrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>- Purchase Price:</span>
                            <span className="text-destructive">-{formatCurrency(purchasePrice)}</span>
                          </div>
                          <div className="border-t border-dashed pt-1 flex justify-between">
                            <span>= Rate Margin:</span>
                            <span>{formatCurrency(baseMargin)}</span>
                          </div>
                          
                          <div className="mt-2 flex justify-between">
                            <span>Customer Fuel ({fuelSurchargePercentage}% on {formatCurrency(discountedRetailPrice)}):</span>
                            <span>{formatCurrency(fuelSurchargeDiscountedRetail)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>- Supplier Fuel ({fuelSurchargePercentage}% on {formatCurrency(purchasePrice)}):</span>
                            <span className="text-destructive">-{formatCurrency(fuelSurchargePurchase)}</span>
                          </div>
                          <div className="border-t border-dashed pt-1 flex justify-between">
                            <span>= Fuel Margin:</span>
                            <span>{formatCurrency(fuelSurchargeMargin)}</span>
                          </div>
                          
                          <div className="border-t mt-2 pt-1 flex justify-between font-medium">
                            <span>= Total Margin:</span>
                            <span>{formatCurrency(finalMargin)}</span>
                          </div>
                          <div className="text-xs mt-1 text-muted-foreground">
                            <em>The fuel margin is calculated by applying {fuelSurchargePercentage}% to both the discounted customer price and the supplier price.</em>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span>Retail Price:</span>
                            <span>{formatCurrency(rate.basePrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>- Discount ({rate.userDiscount || 0}%):</span>
                            <span className="text-destructive">-{formatCurrency((rate.basePrice * (rate.userDiscount || 0) / 100))}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>- Purchase Price:</span>
                            <span className="text-destructive">-{formatCurrency(rate.purchasePrice || (rate.basePrice - rate.actualMargin))}</span>
                          </div>
                          {renderTollFeeInfo()}
                          <div className="border-t pt-1 flex justify-between font-medium">
                            <span>= Total Margin:</span>
                            <span>{formatCurrency(finalMargin)}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            <em>Fuel not included ({fuelSurchargePercentage}% = {formatCurrency(fuelSurchargeAmount)})</em>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </TableCell>
        )}
        
        {/* Colonna Delivery */}
        {visibleColumns.find((col) => col.id === "delivery")?.isVisible && (
          <TableCell className="text-center">
            <div className="flex items-center justify-center">
              {rate.deliveryTimeMin && rate.deliveryTimeMax ? (
                <span>
                  {rate.deliveryTimeMin}-{rate.deliveryTimeMax} ore
                </span>
              ) : (
                <span>-</span>
              )}
            </div>
          </TableCell>
        )}
        
        {/* Colonna Details */}
        {visibleColumns.find((col) => col.id === "details")?.isVisible && (
          <TableCell className="text-center">
            <div className="flex items-center justify-center">
              <Button variant="outline" size="sm">
                Dettagli
              </Button>
            </div>
          </TableCell>
        )}
      </TableRow>

      {/* Riga espansa con fasce di peso */}
      {isExpanded && rate.service?._id && (
        <TableRow className="bg-slate-50 hover:bg-slate-50">
          <TableCell colSpan={Object.values(visibleColumns).filter(col => col.isVisible).length + 2}>
            <div className="p-4 rounded-md">
              <h4 className="font-medium mb-3 text-slate-700 flex items-center">
                <ChevronDown className="h-4 w-4 mr-1 text-primary" />
                Weight ranges for {rate.serviceName}
              </h4>
              
              {!serviceWeightRanges[rate.service._id] ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : serviceWeightRanges[rate.service._id].length === 0 ? (
                <p className="text-sm text-muted-foreground">No weight ranges available for this service</p>
              ) : (
                <div className="rounded-md overflow-hidden border shadow-sm">
                  <Table className="table-fixed">
                    <TableHeader className="bg-slate-600/60">
                      <TableRow className="hover:bg-transparent border-b-0">
                        <TableHead className="w-[60px] text-white text-center">Select</TableHead>
                        <TableHead className="w-[120px] text-white">Weight Range</TableHead>
                        <TableHead className="w-[100px] text-white text-right">Base Price</TableHead>
                        <TableHead className="w-[120px] text-white text-right">Discount (%)</TableHead>
                        <TableHead className="w-[100px] text-white text-right">Final Price</TableHead>
                        <TableHead className="w-[120px] text-white text-center">Margin</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100">
                      {serviceWeightRanges[rate.service._id].map((weightRange) => (
                        <TableRow key={weightRange.id} className="even:bg-muted/20 hover:bg-muted/40">
                          <TableCell className="text-center">
                            <Checkbox
                              checked={!!selectedRows[`${rate.id}-${weightRange.id}`]}
                              onCheckedChange={(checked) => 
                                handleRowSelect(`${rate.id}-${weightRange.id}`, !!checked, true, rate.id)
                              }
                              aria-label={`Select weight range ${weightRange.label}`}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{weightRange.label}</TableCell>
                          <TableCell className="text-right">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center justify-end space-x-1 cursor-help">
                                    <span>
                                      {formatCurrency(
                                        includeFuelSurcharge
                                          ? getBasePrice(weightRange.basePrice || 0, rate.carrierName, tollFee) + 
                                            ((weightRange.basePrice || 0) * fuelSurchargePercentage / 100)
                                          : getBasePrice(weightRange.basePrice || 0, rate.carrierName, tollFee)
                                      )}
                                    </span>
                                    <Info className="w-3.5 h-3.5 text-muted-foreground" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="w-fit max-w-[400px]">
                                  <div className="space-y-1">
                                    <div className="font-semibold">Base Price</div>
                                    <div className="space-y-1">
                                      <div className="flex justify-between">
                                        <span>Retail Price:</span>
                                        <span>{formatCurrency(weightRange.basePrice || 0)}</span>
                                      </div>
                                      {renderTollFeeInfo()}
                                      {includeFuelSurcharge && (
                                        <div className="flex justify-between">
                                          <span>+ Customer Fuel ({fuelSurchargePercentage}%):</span>
                                          <span>{formatCurrency((weightRange.basePrice || 0) * fuelSurchargePercentage / 100)}</span>
                                        </div>
                                      )}
                                      <div className="border-t pt-1 flex justify-between font-medium">
                                        <span>= Total Base Price:</span>
                                        <span>{formatCurrency(
                                          includeFuelSurcharge
                                            ? getBasePrice(weightRange.basePrice || 0, rate.carrierName, tollFee) + 
                                              ((weightRange.basePrice || 0) * fuelSurchargePercentage / 100)
                                            : getBasePrice(weightRange.basePrice || 0, rate.carrierName, tollFee)
                                        )}</span>
                                      </div>
                                      {!includeFuelSurcharge && (
                                        <div className="text-xs mt-1 text-muted-foreground">
                                          <em>Fuel not included ({fuelSurchargePercentage}% = {formatCurrency((weightRange.basePrice || 0) * fuelSurchargePercentage / 100)})</em>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end">
                              <span className="text-center min-w-[60px]">{rate.userDiscount || 0}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            <div className="flex items-center justify-end">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center space-x-1">
                                      <span>
                                        {formatCurrency(
                                          calculateFinalPrice(
                                            weightRange.basePrice || 0,
                                            rate.userDiscount || 0,
                                            fuelSurchargePercentage,
                                            includeFuelSurcharge,
                                            (weightRange.basePrice || 0) - weightRange.actualMargin,
                                            tollFee,
                                            rate.carrierName
                                          )
                                        )}
                                      </span>
                                      <Info className="w-3.5 h-3.5 text-muted-foreground" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="w-fit max-w-[400px]">
                                    <div className="space-y-1">
                                      <div className="font-semibold">Final Price</div>
                                      <div className="space-y-1">
                                        {includeFuelSurcharge ? (
                                          <>
                                            <div className="flex justify-between">
                                              <span>Retail Price:</span>
                                              <span>{formatCurrency(weightRange.basePrice || 0)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span>- Purchase Price:</span>
                                              <span className="text-destructive">-{formatCurrency((weightRange.basePrice || 0) - weightRange.actualMargin)}</span>
                                            </div>
                                            <div className="border-t border-dashed pt-1 flex justify-between">
                                              <span>= Rate Margin:</span>
                                              <span>{formatCurrency(weightRange.actualMargin || 0)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span>- Discount ({rate.userDiscount || 0}% on margin):</span>
                                              <span className="text-destructive">-{formatCurrency((weightRange.actualMargin || 0) * (rate.userDiscount || 0) / 100)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span>+ Customer Fuel ({fuelSurchargePercentage}% on {formatCurrency(
                                                ((weightRange.basePrice || 0) - weightRange.actualMargin) + // prezzo d'acquisto
                                                (weightRange.actualMargin - (weightRange.actualMargin * (rate.userDiscount || 0) / 100)) // margine scontato
                                              )}):</span>
                                              <span>{formatCurrency(
                                                (((weightRange.basePrice || 0) - weightRange.actualMargin) + // prezzo d'acquisto
                                                (weightRange.actualMargin - (weightRange.actualMargin * (rate.userDiscount || 0) / 100))) * // margine scontato
                                                fuelSurchargePercentage / 100
                                              )}</span>
                                            </div>
                                            {renderTollFeeInfo()}
                                            <div className="border-t pt-1 flex justify-between font-medium">
                                              <span>= Final Price:</span>
                                              <span>{formatCurrency(
                                                ((weightRange.basePrice || 0) - weightRange.actualMargin) + // prezzo d'acquisto
                                                (weightRange.actualMargin - (weightRange.actualMargin * (rate.userDiscount || 0) / 100)) + // margine scontato
                                                ((rate.carrierName === 'GLS') ? 0.05 : (tollFee || 0)) // supplemento pedaggio
                                              )}</span>
                                            </div>
                                          </>
                                        ) : (
                                          <>
                                            <div className="flex justify-between">
                                              <span>Retail Price:</span>
                                              <span>{formatCurrency(weightRange.basePrice || 0)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span>- Purchase Price:</span>
                                              <span className="text-destructive">-{formatCurrency((weightRange.basePrice || 0) - weightRange.actualMargin)}</span>
                                            </div>
                                            <div className="border-t border-dashed pt-1 flex justify-between">
                                              <span>= Rate Margin:</span>
                                              <span>{formatCurrency(weightRange.actualMargin || 0)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span>- Discount ({rate.userDiscount || 0}% on margin):</span>
                                              <span className="text-destructive">-{formatCurrency((weightRange.actualMargin || 0) * (rate.userDiscount || 0) / 100)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span>+ Customer Fuel ({fuelSurchargePercentage}% on {formatCurrency(
                                                ((weightRange.basePrice || 0) - weightRange.actualMargin) + // prezzo d'acquisto
                                                (weightRange.actualMargin - (weightRange.actualMargin * (rate.userDiscount || 0) / 100)) // margine scontato
                                              )}):</span>
                                              <span>{formatCurrency(
                                                (((weightRange.basePrice || 0) - weightRange.actualMargin) + // prezzo d'acquisto
                                                (weightRange.actualMargin - (weightRange.actualMargin * (rate.userDiscount || 0) / 100))) * // margine scontato
                                                fuelSurchargePercentage / 100
                                              )}</span>
                                            </div>
                                            {renderTollFeeInfo()}
                                            <div className="border-t pt-1 flex justify-between font-medium">
                                              <span>= Final Price:</span>
                                              <span>{formatCurrency(
                                                ((weightRange.basePrice || 0) - weightRange.actualMargin) + // prezzo d'acquisto
                                                (weightRange.actualMargin - (weightRange.actualMargin * (rate.userDiscount || 0) / 100)) + // margine scontato
                                                ((rate.carrierName === 'GLS') ? 0.05 : (tollFee || 0)) // supplemento pedaggio
                                              )}</span>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {weightRange.actualMargin !== undefined ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center justify-center cursor-help">
                                      <Badge
                                        variant={getMarginColor(
                                          includeFuelSurcharge 
                                            ? (weightRange.actualMargin - (weightRange.actualMargin * (rate.userDiscount || 0) / 100)) + (
                                                (((weightRange.basePrice || 0) - weightRange.actualMargin) + // prezzo d'acquisto
                                                (weightRange.actualMargin - (weightRange.actualMargin * (rate.userDiscount || 0) / 100))) * // margine scontato
                                                fuelSurchargePercentage / 100 - 
                                                (((weightRange.basePrice || 0) - weightRange.actualMargin) * fuelSurchargePercentage / 100)
                                              ) + ((rate.carrierName === 'GLS') ? 0.05 : (tollFee || 0))
                                            : (weightRange.actualMargin - (weightRange.actualMargin * (rate.userDiscount || 0) / 100)) + ((rate.carrierName === 'GLS') ? 0.05 : (tollFee || 0))
                                        ) as any}
                                      >
                                        {formatCurrency(
                                          includeFuelSurcharge 
                                            ? (weightRange.actualMargin - (weightRange.actualMargin * (rate.userDiscount || 0) / 100)) + (
                                                (((weightRange.basePrice || 0) - weightRange.actualMargin) + // prezzo d'acquisto
                                                (weightRange.actualMargin - (weightRange.actualMargin * (rate.userDiscount || 0) / 100))) * // margine scontato
                                                fuelSurchargePercentage / 100 - 
                                                (((weightRange.basePrice || 0) - weightRange.actualMargin) * fuelSurchargePercentage / 100)
                                              ) + ((rate.carrierName === 'GLS') ? 0.05 : (tollFee || 0))
                                            : (weightRange.actualMargin - (weightRange.actualMargin * (rate.userDiscount || 0) / 100)) + ((rate.carrierName === 'GLS') ? 0.05 : (tollFee || 0))
                                        )}
                                      </Badge>
                                      <Info className="ml-1 h-4 w-4 text-muted-foreground" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="w-fit max-w-[400px]">
                                    <div className="space-y-1">
                                      <div className="font-semibold">Margin</div>
                                      <div className="space-y-1">
                                        {includeFuelSurcharge ? (
                                          <>
                                            <div className="flex justify-between">
                                              <span>Retail Price:</span>
                                              <span>{formatCurrency(weightRange.basePrice || 0)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span>- Purchase Price:</span>
                                              <span className="text-destructive">-{formatCurrency((weightRange.basePrice || 0) - weightRange.actualMargin)}</span>
                                            </div>
                                            <div className="border-t border-dashed pt-1 flex justify-between">
                                              <span>= Rate Margin:</span>
                                              <span>{formatCurrency(weightRange.actualMargin || 0)}</span>
                                            </div>
                                            
                                            <div className="mt-2 flex justify-between">
                                              <span>Customer Fuel ({fuelSurchargePercentage}% on {formatCurrency(
                                                ((weightRange.basePrice || 0) - weightRange.actualMargin) + // prezzo d'acquisto
                                                (weightRange.actualMargin - (weightRange.actualMargin * (rate.userDiscount || 0) / 100)) // margine scontato
                                              )}):</span>
                                              <span>{formatCurrency(
                                                (((weightRange.basePrice || 0) - weightRange.actualMargin) + // prezzo d'acquisto
                                                (weightRange.actualMargin - (weightRange.actualMargin * (rate.userDiscount || 0) / 100))) * // margine scontato
                                                fuelSurchargePercentage / 100
                                              )}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span>- Supplier Fuel ({fuelSurchargePercentage}% on {formatCurrency((weightRange.basePrice || 0) - weightRange.actualMargin)}):</span>
                                              <span className="text-destructive">-{formatCurrency(((weightRange.basePrice || 0) - weightRange.actualMargin) * fuelSurchargePercentage / 100)}</span>
                                            </div>
                                            <div className="border-t border-dashed pt-1 flex justify-between">
                                              <span>= Fuel Margin:</span>
                                              <span>{formatCurrency(
                                                (((weightRange.basePrice || 0) - weightRange.actualMargin) + // prezzo d'acquisto
                                                (weightRange.actualMargin - (weightRange.actualMargin * (rate.userDiscount || 0) / 100))) * // margine scontato
                                                fuelSurchargePercentage / 100 - 
                                                (((weightRange.basePrice || 0) - weightRange.actualMargin) * fuelSurchargePercentage / 100)
                                              )}</span>
                                            </div>
                                            
                                            {renderTollFeeInfo()}
                                            
                                            <div className="border-t mt-2 pt-1 flex justify-between font-medium">
                                              <span>= Total Margin:</span>
                                              <span>{formatCurrency(finalMargin)}</span>
                                            </div>
                                            <div className="text-xs mt-1 text-muted-foreground">
                                              <em>The fuel margin is calculated by applying {fuelSurchargePercentage}% to both the discounted customer price and the supplier price.</em>
                                            </div>
                                          </>
                                        ) : (
                                          <>
                                            <div className="flex justify-between">
                                              <span>Retail Price:</span>
                                              <span>{formatCurrency(weightRange.basePrice || 0)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span>- Purchase Price:</span>
                                              <span className="text-destructive">-{formatCurrency((weightRange.basePrice || 0) - weightRange.actualMargin)}</span>
                                            </div>
                                            <div className="border-t border-dashed pt-1 flex justify-between">
                                              <span>= Rate Margin:</span>
                                              <span>{formatCurrency(weightRange.actualMargin || 0)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span>- Discount ({rate.userDiscount || 0}% on margin):</span>
                                              <span className="text-destructive">-{formatCurrency((weightRange.actualMargin || 0) * (rate.userDiscount || 0) / 100)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span>+ Customer Fuel ({fuelSurchargePercentage}% on {formatCurrency(
                                                ((weightRange.basePrice || 0) - weightRange.actualMargin) + // prezzo d'acquisto
                                                (weightRange.actualMargin - (weightRange.actualMargin * (rate.userDiscount || 0) / 100)) // margine scontato
                                              )}):</span>
                                              <span>{formatCurrency(
                                                (((weightRange.basePrice || 0) - weightRange.actualMargin) + // prezzo d'acquisto
                                                (weightRange.actualMargin - (weightRange.actualMargin * (rate.userDiscount || 0) / 100))) * // margine scontato
                                                fuelSurchargePercentage / 100
                                              )}</span>
                                            </div>
                                            {renderTollFeeInfo()}
                                            <div className="border-t pt-1 flex justify-between font-medium">
                                              <span>= Final Price:</span>
                                              <span>{formatCurrency(
                                                ((weightRange.basePrice || 0) - weightRange.actualMargin) + // prezzo d'acquisto
                                                (weightRange.actualMargin - (weightRange.actualMargin * (rate.userDiscount || 0) / 100)) + // margine scontato
                                                ((rate.carrierName === 'GLS') ? 0.05 : (tollFee || 0)) // supplemento pedaggio
                                              )}</span>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : "N/D"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  );
});

// Aggiungi il displayName per debugging
RateTableRow.displayName = 'RateTableRow';

export default RateTableRow; 