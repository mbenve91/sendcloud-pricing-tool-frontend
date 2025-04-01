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
  includeFuelSurcharge: boolean,
  tollFee: number = 0
): number {
  const baseMargin = basePrice - purchasePrice;
  const fuelMargin = calculateFuelSurchargeMargin(
    basePrice, 
    purchasePrice, 
    fuelSurchargePercentage, 
    discountPercentage,
    includeFuelSurcharge
  );
  
  // Il tollFee è un costo fisso che viene addebitato sia al cliente che al fornitore,
  // quindi non influisce sul margine
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
  includeFuelSurcharge: boolean,
  tollFee: number = 0
): number {
  const discountAmount = calculateDiscountAmount(margin, discountPercentage);
  const priceAfterDiscount = basePrice - discountAmount;
  
  let finalPrice = priceAfterDiscount;
  
  if (includeFuelSurcharge && fuelSurchargePercentage > 0) {
    finalPrice = finalPrice * (1 + (fuelSurchargePercentage / 100));
  }
  
  // Aggiungi il supplemento pedaggio se presente
  if (tollFee > 0) {
    finalPrice += tollFee;
  }
  
  return finalPrice;
}

/**
 * Verifica se un carrier ha un supplemento pedaggio
 */
export function hasTollFee(tollFee: number | undefined): boolean {
  return tollFee !== undefined && tollFee > 0;
}

/**
 * Ottiene il testo del supplemento pedaggio
 */
export function getTollFeeText(tollFee: number | undefined): string | null {
  if (!hasTollFee(tollFee)) {
    return null;
  }
  
  return `Supplemento pedaggio: ${formatCurrency(tollFee || 0)}`;
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