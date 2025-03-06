import { format } from 'date-fns';
import { it, de, es, enUS } from 'date-fns/locale';

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
}

interface QuoteOptions {
  language: string;
  accountExecutive: string;
}

// Helper per formattare i valori monetari
const formatCurrency = (value: number, language: string): string => {
  const locales: Record<string, string> = {
    'english': 'en-US',
    'italian': 'it-IT',
    'german': 'de-DE',
    'spanish': 'es-ES'
  };
  
  return new Intl.NumberFormat(locales[language] || 'en-US', {
    style: "currency",
    currency: "EUR",
  }).format(value);
};

// Helper per gestire la traduzione
const getTranslation = (key: string, language: string): string => {
  const translations: Record<string, Record<string, string>> = {
    'quote_title': {
      'english': 'Shipping Rate Quote',
      'italian': 'Preventivo Tariffe di Spedizione',
      'german': 'Versandkosten-Angebot',
      'spanish': 'Presupuesto de Tarifas de Envío'
    },
    'prepared_for': {
      'english': 'Prepared for:',
      'italian': 'Preparato per:',
      'german': 'Erstellt für:',
      'spanish': 'Preparado para:'
    },
    'prepared_by': {
      'english': 'Prepared by:',
      'italian': 'Preparato da:',
      'german': 'Erstellt von:',
      'spanish': 'Preparado por:'
    },
    'date': {
      'english': 'Date:',
      'italian': 'Data:',
      'german': 'Datum:',
      'spanish': 'Fecha:'
    },
    'quote_number': {
      'english': 'Quote #:',
      'italian': 'Preventivo #:',
      'german': 'Angebot-Nr.:',
      'spanish': 'Presupuesto #:'
    },
    'carrier': {
      'english': 'Carrier',
      'italian': 'Corriere',
      'german': 'Transporteur',
      'spanish': 'Transportista'
    },
    'service': {
      'english': 'Service',
      'italian': 'Servizio',
      'german': 'Service',
      'spanish': 'Servicio'
    },
    'destination': {
      'english': 'Destination',
      'italian': 'Destinazione',
      'german': 'Ziel',
      'spanish': 'Destino'
    },
    'weight': {
      'english': 'Weight',
      'italian': 'Peso',
      'german': 'Gewicht',
      'spanish': 'Peso'
    },
    'delivery_time': {
      'english': 'Delivery Time',
      'italian': 'Tempo di Consegna',
      'german': 'Lieferzeit',
      'spanish': 'Tiempo de Entrega'
    },
    'price': {
      'english': 'Price',
      'italian': 'Prezzo',
      'german': 'Preis',
      'spanish': 'Precio'
    },
    'days': {
      'english': 'days',
      'italian': 'giorni',
      'german': 'Tage',
      'spanish': 'días'
    },
    'thank_you': {
      'english': 'Thank you for choosing SendCloud!',
      'italian': 'Grazie per aver scelto SendCloud!',
      'german': 'Vielen Dank, dass Sie sich für SendCloud entschieden haben!',
      'spanish': '¡Gracias por elegir SendCloud!'
    },
    'footer_text': {
      'english': 'This quote is valid for 30 days from the date above. Prices may vary based on actual parcel dimensions and weight.',
      'italian': 'Questo preventivo è valido per 30 giorni dalla data sopra indicata. I prezzi possono variare in base alle dimensioni e al peso effettivi del pacco.',
      'german': 'Dieses Angebot ist 30 Tage ab dem obigen Datum gültig. Die Preise können je nach tatsächlichen Paketabmessungen und Gewicht variieren.',
      'spanish': 'Este presupuesto es válido por 30 días a partir de la fecha indicada. Los precios pueden variar según las dimensiones reales del paquete y el peso.'
    }
  };
  
  return translations[key]?.[language] || translations[key]?.['english'] || '';
};

// Helper per ottenere il locale corretto per date-fns
const getLocale = (language: string) => {
  switch (language) {
    case 'italian': return it;
    case 'german': return de;
    case 'spanish': return es;
    case 'english':
    default: return enUS;
  }
};

// Funzione alternativa per generare il PDF senza autoTable
const generateSimplePDF = async (
  rates: Rate[],
  options: QuoteOptions
): Promise<any> => {
  try {
    const { language, accountExecutive } = options;
    
    // Importiamo dinamicamente jsPDF
    const jsPDFModule = await import('jspdf');
    // In base alla struttura del modulo, prendiamo jsPDF dal default o direttamente
    const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
    
    // Creiamo un'istanza di jsPDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Configurazione colori
    const primaryColor = [0, 123, 255]; // RGB per #007bff
    const secondaryColor = [33, 37, 41]; // RGB per #212529
    
    // Aggiungi logo SendCloud (placeholder)
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(14, 15, 50, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('SendCloud', 20, 25);
    
    // Titolo del preventivo
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(getTranslation('quote_title', language), 14, 45);
    
    // Data e numero preventivo
    const today = format(new Date(), 'PPP', { locale: getLocale(language) });
    const quoteNumber = `SC-${Math.floor(Math.random() * 10000)}-${new Date().getFullYear()}`;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${getTranslation('date', language)} ${today}`, 14, 55);
    doc.text(`${getTranslation('quote_number', language)} ${quoteNumber}`, 14, 60);
    
    // Account Executive
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(getTranslation('prepared_by', language), 14, 70);
    doc.setFont('helvetica', 'normal');
    doc.text(`${accountExecutive} - SendCloud`, 14, 75);
    
    // Preparato per
    doc.setFont('helvetica', 'bold');
    doc.text(getTranslation('prepared_for', language), 120, 70);
    doc.setFont('helvetica', 'normal');
    doc.text('Your Customer', 120, 75);
    
    // Poiché autoTable non funziona, creiamo una tabella semplice
    // Intestazioni
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    // Definizione delle colonne
    const startY = 85;
    const rowHeight = 10;
    const margin = 14;
    const cols = rates.some(r => r.countryName) ? 6 : 5;
    const colWidth = (210 - (margin * 2)) / cols;
    
    // Riga di intestazione
    doc.rect(margin, startY, 210 - (margin * 2), rowHeight, 'F');
    
    // Testi delle intestazioni
    let currentX = margin + 3;
    
    // Carrier
    doc.text(getTranslation('carrier', language), currentX, startY + 6);
    currentX += colWidth;
    
    // Service
    doc.text(getTranslation('service', language), currentX, startY + 6);
    currentX += colWidth;
    
    // Country (opzionale)
    if (rates.some(r => r.countryName)) {
      doc.text(getTranslation('destination', language), currentX, startY + 6);
      currentX += colWidth;
    }
    
    // Weight
    doc.text(getTranslation('weight', language), currentX, startY + 6);
    currentX += colWidth;
    
    // Delivery Time
    doc.text(getTranslation('delivery_time', language), currentX, startY + 6);
    currentX += colWidth;
    
    // Price
    doc.text(getTranslation('price', language), currentX, startY + 6);
    
    // Dati delle righe
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont('helvetica', 'normal');
    
    let currentY = startY + rowHeight;
    let isAlternateRow = false;
    
    rates.forEach((rate, index) => {
      if (isAlternateRow) {
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, currentY, 210 - (margin * 2), rowHeight, 'F');
      }
      
      currentX = margin + 3;
      
      // Carrier
      doc.text(rate.carrierName.substring(0, 16), currentX, currentY + 6);
      currentX += colWidth;
      
      // Service
      doc.text(rate.serviceName.substring(0, 16), currentX, currentY + 6);
      currentX += colWidth;
      
      // Country (opzionale)
      if (rates.some(r => r.countryName)) {
        doc.text(rate.countryName?.substring(0, 16) || "", currentX, currentY + 6);
        currentX += colWidth;
      }
      
      // Weight
      const weightText = rate.currentWeightRange ? 
        `${rate.currentWeightRange.min}-${rate.currentWeightRange.max} kg` : 
        (rate.weightMin !== undefined && rate.weightMax !== undefined ? 
          `${rate.weightMin}-${rate.weightMax} kg` : "");
      doc.text(weightText, currentX, currentY + 6);
      currentX += colWidth;
      
      // Delivery Time
      const deliveryText = rate.deliveryTimeMin && rate.deliveryTimeMax
        ? `${rate.deliveryTimeMin}-${rate.deliveryTimeMax} ${getTranslation('days', language)}`
        : "";
      doc.text(deliveryText, currentX, currentY + 6);
      currentX += colWidth;
      
      // Price
      const priceText = formatCurrency(rate.finalPrice, language);
      doc.text(priceText, currentX, currentY + 6);
      
      currentY += rowHeight;
      isAlternateRow = !isAlternateRow;
    });
    
    // Nota finale e ringraziamento
    const finalY = currentY + 20;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(getTranslation('thank_you', language), 14, finalY);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    
    // Split del testo a piè di pagina
    const footerText = getTranslation('footer_text', language);
    const splitFooter = doc.splitTextToSize(footerText, 180);
    doc.text(splitFooter, 14, finalY + 10);
    
    // Footer con informazioni aziendali
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('SendCloud B.V. | www.sendcloud.com', 14, pageHeight - 10);
    
    return doc;
  } catch (error) {
    console.error('Error generating simple PDF:', error);
    throw error;
  }
};

// Funzione di utilità per scaricare il PDF
export const downloadQuotePDF = async (rates: Rate[], options: QuoteOptions): Promise<void> => {
  try {
    const doc = await generateSimplePDF(rates, options);
    doc.save(`SendCloud_Quote_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
};

// Esportiamo la funzione di generazione per completezza
export const generateQuotePDF = generateSimplePDF; 