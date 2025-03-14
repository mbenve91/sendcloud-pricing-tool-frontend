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
    },
    'base_price': {
      'english': 'Base Price',
      'italian': 'Prezzo Base',
      'german': 'Grundpreis',
      'spanish': 'Precio Base'
    },
    'discount': {
      'english': 'Discount',
      'italian': 'Sconto',
      'german': 'Rabatt',
      'spanish': 'Descuento'
    },
    'fuel_surcharge': {
      'english': 'Fuel Surcharge',
      'italian': 'Sovrapprezzo Carburante',
      'german': 'Kraftstoffzuschlag',
      'spanish': 'Recargo por Combustible'
    },
    'vat_excluded': {
      'english': 'All prices exclude VAT',
      'italian': 'Tutti i prezzi sono IVA esclusa',
      'german': 'Alle Preise verstehen sich zuzüglich MwSt',
      'spanish': 'Todos los precios no incluyen IVA'
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

// Funzione per ottenere e aggiungere l'immagine con proporzioni corrette
const getDataUrl = (url: string) => {
  return new Promise<{dataUrl: string, aspectRatio: number}>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      // Calcola l'aspect ratio dell'immagine
      const aspectRatio = img.width / img.height;
      
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve({
          dataUrl: canvas.toDataURL('image/png'),
          aspectRatio: aspectRatio
        });
      } else {
        reject(new Error('Could not get canvas context'));
      }
    };
    img.onerror = (e) => reject(e);
    img.src = url;
  });
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
    
    // Creiamo un'istanza di jsPDF - CAMBIAMO IN LANDSCAPE
    const doc = new jsPDF({
      orientation: 'landscape', // Cambiato da 'portrait' a 'landscape'
      unit: 'mm',
      format: 'a4'
    });
    
    // Configurazione colori
    const primaryColor = [18, 40, 87]; // RGB per #122857
    const secondaryColor = [33, 37, 41]; // RGB per #212529
    
    // Aggiungiamo il logo SendCloud 
    // Importa dinamicamente il modulo per convertire immagine in data URL
    const logoUrl = '/sendcloud_logo.png';
    
    // Riserviamo uno spazio per il logo e lo aggiungeremo quando è caricato
    // Nel frattempo, aggiungiamo uno spazio vuoto
    const logoHeight = 15;  // mm
    const logoWidth = 50;   // mm
    const logoX = 14;
    const logoY = 15;
    
    // Creiamo un'immagine per caricare il logo
    const img = new Image();
    img.src = logoUrl;
    
    try {
      // Prova a caricare il logo se siamo in un ambiente browser
      if (typeof window !== 'undefined') {
        // Ottieni dataUrl e aspect ratio dell'immagine
        const {dataUrl, aspectRatio} = await getDataUrl('/sendcloud_logo.png');
        
        // Calcola la larghezza in base all'altezza per mantenere le proporzioni
        const logoHeight = 15;  // Altezza fissa in mm
        const logoWidth = logoHeight * aspectRatio;  // Larghezza proporzionata
        
        const logoX = 14;
        const logoY = 15;
        
        // Aggiungi l'immagine con le dimensioni corrette
        doc.addImage(dataUrl, 'PNG', logoX, logoY, logoWidth, logoHeight);
      }
    } catch (e) {
      console.warn("Could not load logo image, using placeholder text", e);
      // Se non riesce a caricare l'immagine, usa il placeholder
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(logoX, logoY, 50, 15, 'F');  // Dimensioni originali come fallback
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('SendCloud', logoX + 6, logoY + 10);
    }
    
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
    
    // MODIFICA: Riduciamo i margini laterali per avere più spazio orizzontale
    const margin = 10; // Ridotto da 14
    
    // Definizione delle colonne
    const startY = 85;
    const rowHeight = 10;
    const hasCountry = rates.some(r => r.countryName);
    const cols = hasCountry ? 8 : 7;
    
    // MODIFICA: Ottimizziamo le larghezze delle colonne
    let colWidths: number[] = [];
    const pageWidth = 210; // Larghezza A4 in mm
    const tableWidth = pageWidth - (margin * 2);
    
    if (hasCountry) {
      // Distribuzione ottimizzata con priorità al prezzo finale
      colWidths = [0.11, 0.12, 0.11, 0.09, 0.14, 0.12, 0.08, 0.1, 0.13].map(w => tableWidth * w);
    } else {
      colWidths = [0.13, 0.13, 0.10, 0.15, 0.13, 0.09, 0.11, 0.16].map(w => tableWidth * w);
    }
    
    // MODIFICA: Riduciamo la dimensione del font per i dati della tabella
    doc.setFontSize(8); // Ridotto per far entrare più testo
    
    // Riga di intestazione
    doc.rect(margin, startY, 210 - (margin * 2), rowHeight, 'F');
    
    // Testi delle intestazioni
    let currentX = margin + 3;
    
    // MODIFICA: Adatta la dimensione del font per le intestazioni lunghe
    const getHeaderFontSize = (text: string): number => {
      if (text.length > 15) return 8;
      return 10;
    };
    
    // Carrier
    const carrierText = getTranslation('carrier', language);
    doc.setFontSize(getHeaderFontSize(carrierText));
    doc.text(carrierText, currentX, startY + 6);
    currentX += colWidths[0];
    
    // Service
    const serviceText = getTranslation('service', language);
    doc.setFontSize(getHeaderFontSize(serviceText));
    doc.text(serviceText, currentX, startY + 6);
    currentX += colWidths[1];
    
    // Country (opzionale)
    if (hasCountry) {
      const destText = getTranslation('destination', language);
      doc.setFontSize(getHeaderFontSize(destText));
      doc.text(destText, currentX, startY + 6);
      currentX += colWidths[2];
    }
    
    // Weight
    const weightText = getTranslation('weight', language);
    doc.setFontSize(getHeaderFontSize(weightText));
    doc.text(weightText, currentX, startY + 6);
    currentX += colWidths[hasCountry ? 3 : 2];
    
    // Delivery Time
    const deliveryText = getTranslation('delivery_time', language);
    doc.setFontSize(getHeaderFontSize(deliveryText));
    doc.text(deliveryText, currentX, startY + 6);
    currentX += colWidths[hasCountry ? 4 : 3];
    
    // Base Price
    const basePriceText = getTranslation('base_price', language);
    doc.setFontSize(getHeaderFontSize(basePriceText));
    doc.text(basePriceText, currentX, startY + 6);
    currentX += colWidths[hasCountry ? 4 : 3];
    
    // Discount
    const discountText = getTranslation('discount', language);
    doc.setFontSize(getHeaderFontSize(discountText));
    doc.text(discountText, currentX, startY + 6);
    currentX += colWidths[hasCountry ? 5 : 4];
    
    // Fuel Surcharge
    const fuelText = getTranslation('fuel_surcharge', language);
    doc.setFontSize(getHeaderFontSize(fuelText));
    doc.text(fuelText, currentX, startY + 6);
    currentX += colWidths[hasCountry ? 6 : 5];
    
    // Final Price
    const priceText = getTranslation('price', language);
    doc.setFontSize(getHeaderFontSize(priceText));
    doc.text(priceText, currentX, startY + 6);
    
    // Dati delle righe
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8); // Ripristina dimensione font standard per i dati
    
    let currentY = startY + rowHeight;
    let isAlternateRow = false;
    
    // Abbreviare i nomi lunghi se necessario
    const truncateText = (text: string, maxLength: number): string => {
      return text.length > maxLength ? text.substring(0, maxLength-2) + '..' : text;
    };
    
    rates.forEach((rate, index) => {
      // Aggiungiamo un bordo sottile attorno alla cella
      doc.setDrawColor(220, 220, 220); // Colore grigio chiaro per i bordi
      
      if (isAlternateRow) {
        doc.setFillColor(240, 240, 240);
      } else {
        doc.setFillColor(255, 255, 255);
      }
      
      // Disegniamo il rettangolo di background con bordo
      doc.rect(margin, currentY, 210 - (margin * 2), rowHeight, 'FD'); // 'FD' significa fill e draw
      
      currentX = margin + 3;
      
      // Carrier - abbreviamo se troppo lungo
      doc.text(truncateText(rate.carrierName, 14), currentX, currentY + 6);
      currentX += colWidths[0];
      
      // Service - abbreviamo se troppo lungo
      doc.text(truncateText(rate.serviceName, 14), currentX, currentY + 6);
      currentX += colWidths[1];
      
      // Country (opzionale)
      if (hasCountry) {
        doc.text(rate.countryName?.substring(0, 16) || "", currentX, currentY + 6);
        currentX += colWidths[2];
      }
      
      // Weight
      const weightText = rate.currentWeightRange ? 
        `${rate.currentWeightRange.min}-${rate.currentWeightRange.max} kg` : 
        (rate.weightMin !== undefined && rate.weightMax !== undefined ? 
          `${rate.weightMin}-${rate.weightMax} kg` : "");
      doc.text(weightText, currentX, currentY + 6);
      currentX += colWidths[hasCountry ? 3 : 2];
      
      // Delivery Time
      const deliveryText = rate.deliveryTimeMin && rate.deliveryTimeMax
        ? `${rate.deliveryTimeMin}-${rate.deliveryTimeMax} ${getTranslation('days', language)}`
        : "";
      doc.text(deliveryText, currentX, currentY + 6);
      currentX += colWidths[hasCountry ? 4 : 3];
      
      // Base Price
      doc.text(formatCurrency(rate.basePrice, language), currentX, currentY + 6);
      currentX += colWidths[hasCountry ? 4 : 3];
      
      // Discount
      const discountValue = rate.userDiscount > 0 
        ? `${rate.userDiscount}%` 
        : "0%";
      doc.text(discountValue, currentX, currentY + 6);
      currentX += colWidths[hasCountry ? 5 : 4];
      
      // Fuel Surcharge
      const fuelValue = rate.fuelSurcharge > 0 
        ? `${rate.fuelSurcharge}%` 
        : "0%";
      doc.text(fuelValue, currentX, currentY + 6);
      currentX += colWidths[hasCountry ? 6 : 5];
      
      // Final Price - utilizziamo il grassetto per il prezzo finale
      const priceText = formatCurrency(rate.finalPrice, language);
      doc.setFont('helvetica', 'bold');
      doc.text(priceText, currentX, currentY + 6);
      doc.setFont('helvetica', 'normal'); // Ripristina il font normale per le righe successive
      
      currentY += rowHeight;
      isAlternateRow = !isAlternateRow;
    });
    
    // Aggiungiamo una linea di separazione alla fine della tabella
    doc.setDrawColor(0, 123, 255); // Colore blu primario
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, 210 - margin, currentY);
    
    // Nota finale e ringraziamento
    const finalY = currentY + 20;
    
    // Aggiungiamo un box colorato per il messaggio di ringraziamento
    doc.setFillColor(240, 248, 255); // Colore azzurro chiaro
    doc.setDrawColor(0, 123, 255);
    doc.setLineWidth(0.5);
    doc.roundedRect(14, finalY - 5, 210 - (margin * 2), 15, 3, 3, 'FD');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(getTranslation('thank_you', language), 20, finalY + 5);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    
    // Split del testo a piè di pagina
    const footerText = getTranslation('footer_text', language);
    const splitFooter = doc.splitTextToSize(footerText, 180);
    doc.text(splitFooter, 14, finalY + 20);
    
    // Aggiungiamo la nota sui prezzi IVA esclusa
    const vatNoteY = finalY + 30; // Posizionamento dopo il footer text
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text(`* ${getTranslation('vat_excluded', language)}`, 14, vatNoteY);
    
    // Footer con informazioni aziendali
    const pageHeight = doc.internal.pageSize.height;
    
    // Aggiungiamo una linea sopra il footer
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(14, pageHeight - 15, 210 - 14, pageHeight - 15);
    
    // Aggiungiamo il testo del footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('SendCloud B.V. | www.sendcloud.com | ' + new Date().getFullYear(), 14, pageHeight - 10);
    
    // Aggiungiamo il numero di pagina a destra
    doc.text('Page 1/1', 210 - 14 - 20, pageHeight - 10, { align: 'right' });
    
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