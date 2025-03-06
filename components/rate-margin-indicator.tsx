import React from 'react';
import { Badge } from "@/components/ui/badge";

interface RateMarginIndicatorProps {
  margin: number | undefined;
  showLabel?: boolean;
}

/**
 * Componente per visualizzare l'indicatore di margine
 */
export function RateMarginIndicator({ margin, showLabel = true }: RateMarginIndicatorProps) {
  // Verifico se il margine è undefined o non è un numero valido
  if (margin === undefined || isNaN(margin)) {
    return <span className="text-muted-foreground">N/D</span>;
  }
  
  // Formatto il margine solo se è un numero valido
  const formattedMargin = margin.toFixed(2);
  const marginValue = parseFloat(formattedMargin);
  
  // Determino il colore in base al valore del margine
  let color;
  if (marginValue <= 0) {
    color = "destructive";
  } else if (marginValue < 1) {
    color = "warning";
  } else if (marginValue < 3) {
    color = "default";
  } else {
    color = "success";
  }
  
  // Restituisco un badge con il margine formattato
  return (
    <Badge variant={color as "default" | "destructive" | "warning" | "success"}>
      {formattedMargin}{showLabel ? "€" : ""}
    </Badge>
  );
} 