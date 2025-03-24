import React from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, ChevronRight, Info } from "lucide-react";
import { calculateTotalMargin, formatCurrency, getMarginColor, getMarginLabel } from '@/utils/price-calculations';
import Image from 'next/image';

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
  getFuelSurchargeText
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
  );
});

// Aggiungi il displayName per debugging
RateTableRow.displayName = 'RateTableRow';

export default RateTableRow; 