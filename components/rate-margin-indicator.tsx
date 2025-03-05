import React from 'react';
import { Badge } from "@/components/ui/badge";

interface RateMarginIndicatorProps {
  marginValue: number;
}

/**
 * Componente per visualizzare l'indicatore di margine
 */
export function RateMarginIndicator({ marginValue }: RateMarginIndicatorProps) {
  // Determina il colore del badge in base al valore del margine
  const getMarginColor = (margin: number) => {
    if (margin >= 10) return "default";
    if (margin >= 5) return "secondary";
    return "destructive";
  };

  // Determina l'etichetta del margine in base al valore monetario
  const getMarginLabel = (margin: number) => {
    if (margin >= 10) return "Alto";
    if (margin >= 5) return "Medio";
    return "Basso";
  };

  return (
    <Badge variant={getMarginColor(marginValue)}>
      {`${marginValue.toFixed(2)}€ (${getMarginLabel(marginValue)})`}
    </Badge>
  );
} 