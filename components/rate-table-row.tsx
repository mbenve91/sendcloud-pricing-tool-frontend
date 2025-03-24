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
  
  // Calcola il margine finale considerando lo sconto
  const finalMargin = calculateTotalMargin(
    rate.basePrice,
    rate.purchasePrice || (rate.basePrice - rate.actualMargin),
    rate.fuelSurcharge || 0,
    rate.userDiscount || 0,
    includeFuelSurcharge
  ) - rate.actualMargin * ((rate.userDiscount || 0) / 100);
  
  return (
    <Fragment>
      <TableRow key={rate.id} className="even:bg-muted/20 hover:bg-muted/40">
        {/* Colonna di selezione */}
        <TableCell className="w-10">
          <Checkbox
            id={`select-${rate.id}`}
            checked={isSelected}
            onCheckedChange={(checked) => handleRowSelect(rate.id, !!checked)}
          />
        </TableCell>
        
        {/* Pulsante espansione */}
        <TableCell className="w-10">
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
                    <span>{formatCurrency(rate.displayBasePrice || rate.basePrice)}</span>
                    <Info className="ml-1 h-4 w-4 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="w-80 p-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Calcolo Prezzo Base</h4>
                    <div className="bg-muted/30 p-2 rounded-md text-sm space-y-1">
                      {includeFuelSurcharge ? (
                        <>
                          <div className="flex justify-between">
                            <span>Prezzo Retail:</span>
                            <span>{formatCurrency(rate.basePrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>+ Supplemento Carburante ({rate.fuelSurchargePercentage || 0}%):</span>
                            <span>{formatCurrency(rate.fuelSurcharge || 0)}</span>
                          </div>
                          <div className="border-t pt-1 flex justify-between font-medium">
                            <span>= Prezzo Base Totale:</span>
                            <span>{formatCurrency((rate.displayBasePrice || rate.basePrice))}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span>Prezzo Retail:</span>
                            <span>{formatCurrency(rate.basePrice)}</span>
                          </div>
                          <div className="text-muted-foreground text-xs mt-1">
                            <em>Supplemento carburante non incluso ({rate.fuelSurchargePercentage || 0}% = {formatCurrency(rate.fuelSurcharge || 0)})</em>
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
          <TableCell className="w-24">
            <div className="flex items-center space-x-1">
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
                  <div className="space-y-1 cursor-help">
                    <div className="font-medium flex items-center justify-center">
                      {formatCurrency(rate.finalPrice)}
                      <Info className="ml-1 h-4 w-4 text-muted-foreground" />
                    </div>
                    {getFuelSurchargeText(rate)}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="w-80 p-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Calcolo Prezzo Finale</h4>
                    <div className="bg-muted/30 p-2 rounded-md text-sm space-y-1">
                      {includeFuelSurcharge ? (
                        <>
                          <div className="flex justify-between">
                            <span>Prezzo Retail:</span>
                            <span>{formatCurrency(rate.basePrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>- Sconto ({rate.userDiscount || 0}%):</span>
                            <span className="text-destructive">-{formatCurrency((rate.basePrice * (rate.userDiscount || 0) / 100))}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>+ Supplemento Carburante ({rate.fuelSurchargePercentage || 0}%):</span>
                            <span>{formatCurrency(rate.fuelSurcharge || 0)}</span>
                          </div>
                          <div className="border-t pt-1 flex justify-between font-medium">
                            <span>= Prezzo Finale:</span>
                            <span>{formatCurrency(rate.finalPrice)}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span>Prezzo Retail:</span>
                            <span>{formatCurrency(rate.basePrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>- Sconto ({rate.userDiscount || 0}%):</span>
                            <span className="text-destructive">-{formatCurrency((rate.basePrice * (rate.userDiscount || 0) / 100))}</span>
                          </div>
                          <div className="border-t pt-1 flex justify-between font-medium">
                            <span>= Prezzo Finale:</span>
                            <span>{formatCurrency(rate.finalPrice)}</span>
                          </div>
                          <div className="text-muted-foreground text-xs mt-1">
                            <em>Supplemento carburante non incluso ({rate.fuelSurchargePercentage || 0}% = {formatCurrency(rate.fuelSurcharge || 0)})</em>
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
                    <h4 className="font-medium text-sm">Calcolo Margine</h4>
                    <div className="bg-muted/30 p-2 rounded-md text-sm space-y-1">
                      {includeFuelSurcharge ? (
                        <>
                          <div className="flex justify-between">
                            <span>Prezzo Retail + Fuel:</span>
                            <span>{formatCurrency(rate.basePrice + (rate.fuelSurcharge || 0))}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>- Sconto ({rate.userDiscount || 0}%):</span>
                            <span className="text-destructive">-{formatCurrency((rate.basePrice * (rate.userDiscount || 0) / 100))}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>- Prezzo d'Acquisto:</span>
                            <span className="text-destructive">-{formatCurrency(rate.purchasePrice || (rate.basePrice - rate.actualMargin))}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>- Fuel Surcharge Pagato ({rate.fuelSurchargePercentage || 0}%):</span>
                            <span className="text-destructive">-{formatCurrency(rate.fuelSurcharge || 0)}</span>
                          </div>
                          <div className="border-t pt-1 flex justify-between font-medium">
                            <span>= Margine Totale:</span>
                            <span>{formatCurrency(finalMargin)}</span>
                          </div>
                          {rate.fuelSurchargeMargin !== undefined ? (
                            <div className="text-xs mt-1">
                              <em>Di cui Margine sul Fuel: {formatCurrency(rate.fuelSurchargeMargin || 0)}</em>
                            </div>
                          ) : (
                            <div className="text-xs mt-1">
                              <em>Di cui Margine sul Fuel: {formatCurrency(0)}</em>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span>Prezzo Retail:</span>
                            <span>{formatCurrency(rate.basePrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>- Sconto ({rate.userDiscount || 0}%):</span>
                            <span className="text-destructive">-{formatCurrency((rate.basePrice * (rate.userDiscount || 0) / 100))}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>- Prezzo d'Acquisto:</span>
                            <span className="text-destructive">-{formatCurrency(rate.purchasePrice || (rate.basePrice - rate.actualMargin))}</span>
                          </div>
                          <div className="border-t pt-1 flex justify-between font-medium">
                            <span>= Margine Totale:</span>
                            <span>{formatCurrency(finalMargin)}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            <em>Calcolo senza supplemento carburante ({rate.fuelSurchargePercentage || 0}% = {formatCurrency(rate.fuelSurcharge || 0)})</em>
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
            {rate.deliveryTimeMin && rate.deliveryTimeMax ? (
              <span>
                {rate.deliveryTimeMin}-{rate.deliveryTimeMax} ore
              </span>
            ) : (
              <span>-</span>
            )}
          </TableCell>
        )}
        
        {/* Colonna Details */}
        {visibleColumns.find((col) => col.id === "details")?.isVisible && (
          <TableCell className="text-center">
            <Button variant="outline" size="sm">
              Dettagli
            </Button>
          </TableCell>
        )}
      </TableRow>

      {/* Riga espansa con fasce di peso */}
      {isExpanded && rate.service?._id && (
        <TableRow>
          <TableCell colSpan={Object.values(visibleColumns).filter(col => col.isVisible).length + 2}>
            <div className="bg-muted/20 p-4 rounded-md">
              <h4 className="font-medium mb-3">Fasce di peso per {rate.serviceName}</h4>
              
              {!serviceWeightRanges[rate.service._id] ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : serviceWeightRanges[rate.service._id].length === 0 ? (
                <p className="text-sm text-muted-foreground">Nessuna fascia di peso disponibile per questo servizio</p>
              ) : (
                <Table className="table-fixed">
                  <TableHeader className="bg-muted">
                    <TableRow>
                      <TableHead className="w-[60px]">Seleziona</TableHead>
                      <TableHead className="w-[120px]">Fascia Peso</TableHead>
                      <TableHead className="w-[100px] text-right">Prezzo Base</TableHead>
                      <TableHead className="w-[120px] text-right">Sconto (%)</TableHead>
                      <TableHead className="w-[100px] text-right">Prezzo Finale</TableHead>
                      <TableHead className="w-[120px] text-center">Margine</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serviceWeightRanges[rate.service._id].map((weightRange) => (
                      <TableRow key={weightRange.id} className="even:bg-muted/20 hover:bg-muted/40">
                        <TableCell>
                          <Checkbox
                            checked={!!selectedRows[`${rate.id}-${weightRange.id}`]}
                            onCheckedChange={(checked) => 
                              handleRowSelect(`${rate.id}-${weightRange.id}`, !!checked, true, rate.id)
                            }
                            aria-label={`Seleziona fascia di peso ${weightRange.label}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{weightRange.label}</TableCell>
                        <TableCell className="text-right">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center justify-end cursor-help">
                                  <span>{formatCurrency(weightRange.displayBasePrice || weightRange.basePrice || 0)}</span>
                                  <Info className="ml-1 h-4 w-4 text-muted-foreground" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="w-80 p-4">
                                <div className="space-y-2">
                                  <h4 className="font-medium text-sm">Calcolo Prezzo Base - {weightRange.label}</h4>
                                  <div className="bg-muted/30 p-2 rounded-md text-sm space-y-1">
                                    {includeFuelSurcharge ? (
                                      <>
                                        <div className="flex justify-between">
                                          <span>Prezzo Retail:</span>
                                          <span>{formatCurrency(weightRange.basePrice || 0)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>+ Supplemento Carburante ({rate.fuelSurchargePercentage || 0}%):</span>
                                          <span>{formatCurrency(rate.fuelSurcharge || 0)}</span>
                                        </div>
                                        <div className="border-t pt-1 flex justify-between font-medium">
                                          <span>= Prezzo Base Totale:</span>
                                          <span>{formatCurrency(weightRange.displayBasePrice || weightRange.basePrice || 0)}</span>
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <div className="flex justify-between">
                                          <span>Prezzo Retail:</span>
                                          <span>{formatCurrency(weightRange.basePrice || 0)}</span>
                                        </div>
                                        <div className="text-muted-foreground text-xs mt-1">
                                          <em>Supplemento carburante non incluso ({rate.fuelSurchargePercentage || 0}% = {formatCurrency(rate.fuelSurcharge || 0)})</em>
                                        </div>
                                      </>
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
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center justify-end cursor-help">
                                  <span>{formatCurrency(weightRange.finalPrice || 0)}</span>
                                  <Info className="ml-1 h-4 w-4 text-muted-foreground" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="w-80 p-4">
                                <div className="space-y-2">
                                  <h4 className="font-medium text-sm">Calcolo Prezzo Finale - {weightRange.label}</h4>
                                  <div className="bg-muted/30 p-2 rounded-md text-sm space-y-1">
                                    {includeFuelSurcharge ? (
                                      <>
                                        <div className="flex justify-between">
                                          <span>Prezzo Retail:</span>
                                          <span>{formatCurrency(weightRange.basePrice || 0)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>- Sconto ({rate.userDiscount || 0}%):</span>
                                          <span className="text-destructive">-{formatCurrency((weightRange.basePrice || 0) * (rate.userDiscount || 0) / 100)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>+ Supplemento Carburante ({rate.fuelSurchargePercentage || 0}%):</span>
                                          <span>{formatCurrency(rate.fuelSurcharge || 0)}</span>
                                        </div>
                                        <div className="border-t pt-1 flex justify-between font-medium">
                                          <span>= Prezzo Finale:</span>
                                          <span>{formatCurrency(weightRange.finalPrice || 0)}</span>
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <div className="flex justify-between">
                                          <span>Prezzo Retail:</span>
                                          <span>{formatCurrency(weightRange.basePrice || 0)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>- Sconto ({rate.userDiscount || 0}%):</span>
                                          <span className="text-destructive">-{formatCurrency((weightRange.basePrice || 0) * (rate.userDiscount || 0) / 100)}</span>
                                        </div>
                                        <div className="border-t pt-1 flex justify-between font-medium">
                                          <span>= Prezzo Finale:</span>
                                          <span>{formatCurrency(weightRange.finalPrice || 0)}</span>
                                        </div>
                                        <div className="text-muted-foreground text-xs mt-1">
                                          <em>Supplemento carburante non incluso ({rate.fuelSurchargePercentage || 0}% = {formatCurrency(rate.fuelSurcharge || 0)})</em>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="text-center">
                          {weightRange.actualMargin !== undefined ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center justify-center cursor-help">
                                    <Badge
                                      variant={getMarginColor(
                                        weightRange.actualMargin - (weightRange.actualMargin * ((rate.userDiscount || 0) / 100))
                                      ) as any}
                                    >
                                      {formatCurrency(
                                        weightRange.actualMargin - (weightRange.actualMargin * ((rate.userDiscount || 0) / 100))
                                      )}
                                    </Badge>
                                    <Info className="ml-1 h-4 w-4 text-muted-foreground" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="w-80 p-4">
                                  <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Calcolo Margine - {weightRange.label}</h4>
                                    <div className="bg-muted/30 p-2 rounded-md text-sm space-y-1">
                                      {includeFuelSurcharge ? (
                                        <>
                                          <div className="flex justify-between">
                                            <span>Prezzo Retail + Fuel:</span>
                                            <span>{formatCurrency((weightRange.basePrice || 0) + (rate.fuelSurcharge || 0))}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>- Sconto ({rate.userDiscount || 0}%):</span>
                                            <span className="text-destructive">-{formatCurrency((weightRange.basePrice || 0) * (rate.userDiscount || 0) / 100)}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>- Prezzo d'Acquisto:</span>
                                            <span className="text-destructive">-{formatCurrency((weightRange.basePrice || 0) - weightRange.actualMargin)}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>- Fuel Surcharge Pagato ({rate.fuelSurchargePercentage || 0}%):</span>
                                            <span className="text-destructive">-{formatCurrency(rate.fuelSurcharge || 0)}</span>
                                          </div>
                                          <div className="border-t pt-1 flex justify-between font-medium">
                                            <span>= Margine Totale:</span>
                                            <span>{formatCurrency(
                                              weightRange.actualMargin - (weightRange.actualMargin * ((rate.userDiscount || 0) / 100))
                                            )}</span>
                                          </div>
                                          {rate.fuelSurchargeMargin !== undefined ? (
                                            <div className="text-xs mt-1">
                                              <em>Di cui Margine sul Fuel: {formatCurrency(rate.fuelSurchargeMargin || 0)}</em>
                                            </div>
                                          ) : (
                                            <div className="text-xs mt-1">
                                              <em>Di cui Margine sul Fuel: {formatCurrency(0)}</em>
                                            </div>
                                          )}
                                        </>
                                      ) : (
                                        <>
                                          <div className="flex justify-between">
                                            <span>Prezzo Retail:</span>
                                            <span>{formatCurrency(weightRange.basePrice || 0)}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>- Sconto ({rate.userDiscount || 0}%):</span>
                                            <span className="text-destructive">-{formatCurrency((weightRange.basePrice || 0) * (rate.userDiscount || 0) / 100)}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>- Prezzo d'Acquisto:</span>
                                            <span className="text-destructive">-{formatCurrency((weightRange.basePrice || 0) - weightRange.actualMargin)}</span>
                                          </div>
                                          <div className="border-t pt-1 flex justify-between font-medium">
                                            <span>= Margine Totale:</span>
                                            <span>{formatCurrency(
                                              weightRange.actualMargin - (weightRange.actualMargin * ((rate.userDiscount || 0) / 100))
                                            )}</span>
                                          </div>
                                          <div className="text-xs text-muted-foreground mt-1">
                                            <em>Calcolo senza supplemento carburante ({rate.fuelSurchargePercentage || 0}% = {formatCurrency(rate.fuelSurcharge || 0)})</em>
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