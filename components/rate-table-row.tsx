import React, { Fragment } from 'react';
import { TableRow, TableCell, Table, TableBody, TableHead, TableHeader } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, ChevronRight, Info } from "lucide-react";
import { calculateTotalMargin, formatCurrency, getMarginColor, getMarginLabel } from '@/utils/price-calculations';
import Image from 'next/image';

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
            <div className="flex items-center justify-center">
              <span>{formatCurrency(rate.displayBasePrice || rate.basePrice)}</span>
              <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">ℹ️</span>
              {/* Tooltip con dettagli sul prezzo base */}
            </div>
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
            <div className="space-y-1">
              <div className="font-medium">
                {formatCurrency(rate.finalPrice)}
              </div>
              {getFuelSurchargeText(rate)}
            </div>
          </TableCell>
        )}
        
        {/* Colonna Margin */}
        {visibleColumns.find((col) => col.id === "margin")?.isVisible && (
          <TableCell className="text-center relative group">
            <div className="flex items-center justify-center">
              <Badge
                variant={getMarginColor(finalMargin) as any}
                className="cursor-help"
              >
                {formatCurrency(finalMargin)} ({getMarginLabel(finalMargin)})
              </Badge>
              <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Info className="h-4 w-4" />
              </span>
              {/* Tooltip con dettagli sul margine */}
            </div>
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
                          {formatCurrency(weightRange.displayBasePrice || weightRange.basePrice || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end">
                            <span className="text-center min-w-[60px]">{rate.userDiscount || 0}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(weightRange.finalPrice || 0)}
                        </TableCell>
                        <TableCell className="text-center">
                          {weightRange.actualMargin !== undefined ? (
                            <Badge
                              variant={getMarginColor(
                                weightRange.actualMargin - (weightRange.actualMargin * ((rate.userDiscount || 0) / 100))
                              ) as any}
                            >
                              {formatCurrency(
                                weightRange.actualMargin - (weightRange.actualMargin * ((rate.userDiscount || 0) / 100))
                              )}
                            </Badge>
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