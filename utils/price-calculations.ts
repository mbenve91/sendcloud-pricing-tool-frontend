// utils/price-calculations.ts

/**
 * Calcola il prezzo base considerando il fuel surcharge
 */
export function calculateBasePrice(originalBasePrice: number, fuelSurchargePercentage: number, includeFuelSurcharge: boolean): number {
  if (!includeFuelSurcharge || fuelSurchargePercentage <= 0) {
    return originalBasePrice;
  }
  return originalBasePrice * (1 + (fuelSurchargePercentage / 100));
}

/**
 * Calcola lo sconto sul margine
 */
export function calculateDiscountAmount(margin: number, discountPercentage: number): number {
  return margin * (discountPercentage / 100);
}

/**
 * Calcola il margine extra sul fuel surcharge
 */
export function calculateFuelSurchargeMargin(
  basePrice: number, 
  purchasePrice: number, 
  fuelSurchargePercentage: number, 
  discountPercentage: number,
  includeFuelSurcharge: boolean
): number {
  if (!includeFuelSurcharge || fuelSurchargePercentage <= 0) {
    return 0;
  }
  
  const margin = basePrice - purchasePrice;
  const discountAmount = calculateDiscountAmount(margin, discountPercentage);
  const discountedRetailPrice = basePrice - discountAmount;
  
  const fuelSurchargeOnRetail = discountedRetailPrice * (fuelSurchargePercentage / 100);
  const fuelSurchargeOnPurchase = purchasePrice * (fuelSurchargePercentage / 100);
  
  return fuelSurchargeOnRetail - fuelSurchargeOnPurchase;
}

/**
 * Calcola il margine totale (base + fuel surcharge)
 */
export function calculateTotalMargin(
  basePrice: number, 
  purchasePrice: number, 
  fuelSurchargePercentage: number, 
  discountPercentage: number,
  includeFuelSurcharge: boolean
): number {
  const baseMargin = basePrice - purchasePrice;
  const fuelMargin = calculateFuelSurchargeMargin(
    basePrice, 
    purchasePrice, 
    fuelSurchargePercentage, 
    discountPercentage,
    includeFuelSurcharge
  );
  
  return baseMargin + fuelMargin;
}

/**
 * Calcola il prezzo finale dopo tutti gli sconti
 */
export function calculateFinalPrice(
  basePrice: number, 
  margin: number, 
  discountPercentage: number, 
  fuelSurchargePercentage: number, 
  includeFuelSurcharge: boolean
): number {
  const discountAmount = calculateDiscountAmount(margin, discountPercentage);
  const priceAfterDiscount = basePrice - discountAmount;
  
  if (includeFuelSurcharge && fuelSurchargePercentage > 0) {
    return priceAfterDiscount * (1 + (fuelSurchargePercentage / 100));
  }
  
  return priceAfterDiscount;
}

/**
 * Formatta un valore numerico come valuta EUR
 */
export function formatCurrency(value: number | undefined): string {
  if (value === undefined || isNaN(value)) {
    return "€0,00";
  }
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Ottiene il colore del badge per il margine
 */
export function getMarginColor(margin: number): string {
  if (margin >= 0.8) return "success"; // verde
  if (margin >= 0.2) return "secondary"; // neutro/medio
  return "destructive"; // rosso
}

/**
 * Ottiene l'etichetta per il margine
 */
export function getMarginLabel(margin: number): string {
  if (margin >= 0.8) return "High";
  if (margin >= 0.2) return "Medium";
  return "Low";
} 