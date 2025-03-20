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
      'english': 'Total Price',
      'italian': 'Prezzo Totale',
      'german': 'Gesamtpreis',
      'spanish': 'Precio Total'
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
      'italian': 'Sovr. Carburante',
      'german': 'Kraftstoffzuschlag',
      'spanish': 'Recargo Comb.'
    },
    'vat_excluded': {
      'english': 'All prices exclude VAT',
      'italian': 'Tutti i prezzi sono IVA esclusa',
      'german': 'Alle Preise verstehen sich zuzüglich MwSt',
      'spanish': 'Todos los precios no incluyen IVA'
    },
    'price_note': {
      'english': 'Total price does not include the fuel surcharge',
      'italian': 'Il prezzo totale non include il sovrapprezzo carburante',
      'german': 'Der Gesamtpreis enthält nicht den Kraftstoffzuschlag',
      'spanish': 'El precio total no incluye el recargo por combustible'
    },
    'continued': {
      'english': 'continued',
      'italian': 'continuato',
      'german': 'fortgesetzt',
      'spanish': 'continuado'
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
    
    // Creiamo un'istanza di jsPDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Configurazione colori
    const primaryColor = [18, 40, 87]; // RGB per #122857
    const secondaryColor = [33, 37, 41]; // RGB per #212529
    
    // SOLUZIONE MIGLIORATA: Ottimizziamo il layout per distribuire lo spazio in modo più efficiente
    const margin = 10; // Margine per il documento
    const pageWidth = 210;
    const pageHeight = 297; // Altezza A4
    const tableWidth = pageWidth - (margin * 2);
    const footerHeight = 40; // Spazio riservato per il footer

    // Ridistribuiamo lo spazio delle colonne in modo più equilibrato
    let colWidths: number[] = [];
    const hasCountry = rates.some(r => r.countryName);
    
    if (hasCountry) {
      // Con colonna paese - equilibriamo meglio le colonne
      colWidths = [0.11, 0.11, 0.10, 0.09, 0.12, 0.13, 0.12, 0.12, 0.10].map(w => tableWidth * w);
    } else {
      // Senza colonna paese - distribuiamo meglio le colonne
      colWidths = [0.13, 0.13, 0.11, 0.13, 0.14, 0.13, 0.12, 0.11].map(w => tableWidth * w);
    }
    
    // Utilizziamo un font size uniforme per le intestazioni
    const headerFontSize = 8;
    
    // Proprietà di pagina
    let pageCount = 1;
    const startY = 85; // Punto di inizio della tabella
    const rowHeight = 10;
    const maxY = pageHeight - footerHeight;
    
    // Funzione per creare intestazione tabella
    const addTableHeader = (yPosition: number) => {
      // Intestazioni - utilizziamo rettangoli per assicurarci che tutta la riga sia colorata
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(headerFontSize);
      doc.setFont('helvetica', 'bold');
      
      // Riga di intestazione
      doc.rect(margin, yPosition, tableWidth, rowHeight, 'F');
      
      // Testi delle intestazioni
      let currentX = margin + 3; // Aggiungiamo un piccolo padding iniziale
      
      // Carrier
      const carrierText = getTranslation('carrier', language);
      doc.text(carrierText, currentX, yPosition + 6);
      currentX += colWidths[0];
      
      // Service
      const serviceText = getTranslation('service', language);
      doc.text(serviceText, currentX, yPosition + 6);
      currentX += colWidths[1];
      
      // Country (opzionale)
      if (hasCountry) {
        const destText = getTranslation('destination', language);
        doc.text(destText, currentX, yPosition + 6);
        currentX += colWidths[2];
      }
      
      // Weight
      const weightText = getTranslation('weight', language);
      doc.text(weightText, currentX, yPosition + 6);
      currentX += colWidths[hasCountry ? 3 : 2];
      
      // Delivery Time
      const deliveryText = getTranslation('delivery_time', language);
      doc.text(deliveryText, currentX, yPosition + 6);
      currentX += colWidths[hasCountry ? 4 : 3];
      
      // Base Price
      const basePriceText = getTranslation('base_price', language);
      doc.text(basePriceText, currentX, yPosition + 6);
      currentX += colWidths[hasCountry ? 5 : 4];
      
      // Discount
      const discountText = getTranslation('discount', language);
      doc.text(discountText, currentX, yPosition + 6);
      currentX += colWidths[hasCountry ? 6 : 5];
      
      // Fuel Surcharge
      const fuelText = getTranslation('fuel_surcharge', language);
      doc.text(fuelText, currentX, yPosition + 6);
      currentX += colWidths[hasCountry ? 7 : 6];
      
      // Total Price - Assicuriamo che sia allineato correttamente
      const priceText = getTranslation('price', language);
      doc.text(priceText, currentX, yPosition + 6);
      
      return yPosition + rowHeight;
    };
    
    // Funzione per aggiungere il footer
    const addFooter = (pageNum: number, totalPages: number) => {
      // Footer con informazioni aziendali
      // Aggiungiamo una linea sopra il footer
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
      
      // Aggiungiamo il testo del footer
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('SendCloud B.V. | www.sendcloud.com | ' + new Date().getFullYear(), margin, pageHeight - 15);
      
      // Aggiungiamo il numero di pagina a destra
      doc.text(`Page ${pageNum}/${totalPages}`, pageWidth - margin - 20, pageHeight - 15, { align: 'right' });
    };
    
    // Funzione per creare una nuova pagina
    const addNewPage = () => {
      doc.addPage();
      pageCount++;
      
      // Aggiungiamo logo alla nuova pagina
      try {
        if (typeof window !== 'undefined') {
          // Ottieni dataUrl e aspect ratio dell'immagine
          getDataUrl('/sendcloud_logo.png').then(({dataUrl, aspectRatio}) => {
            const logoHeight = 15;
            const logoWidth = logoHeight * aspectRatio;
            doc.addImage(dataUrl, 'PNG', 14, 15, logoWidth, logoHeight);
          }).catch(() => {
            // Fallback per il logo
            doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.rect(14, 15, 50, 15, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('SendCloud', 14 + 6, 15 + 10);
          });
        }
      } catch (e) {
        // Fallback se getDataUrl non funziona
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(14, 15, 50, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('SendCloud', 14 + 6, 15 + 10);
      }
      
      // Titolo continuazione preventivo
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(getTranslation('quote_title', language) + ` (${getTranslation('continued', language)})`, 14, 45);
      
      // Aggiungiamo intestazione tabella
      return addTableHeader(55); // Iniziamo più in alto nelle pagine successive
    };
    
    // Aggiungiamo il logo SendCloud alla prima pagina
    const logoUrl = '/sendcloud_logo.png';
    const logoX = 14;
    const logoY = 15;
    
    try {
      // Prova a caricare il logo se siamo in un ambiente browser
      if (typeof window !== 'undefined') {
        // Ottieni dataUrl e aspect ratio dell'immagine
        const {dataUrl, aspectRatio} = await getDataUrl('/sendcloud_logo.png');
        
        // Calcola la larghezza in base all'altezza per mantenere le proporzioni
        const logoHeight = 15;  // Altezza fissa in mm
        const logoWidth = logoHeight * aspectRatio;  // Larghezza proporzionata
        
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
    
    // Intestazione tabella
    let currentY = addTableHeader(startY);
    let isAlternateRow = false;
    
    // Abbreviare i nomi lunghi se necessario
    const truncateText = (text: string | undefined, maxLength: number): string => {
      if (!text) return '';
      return text.length > maxLength ? text.substring(0, maxLength-2) + '..' : text;
    };
    
    // Disegniamo le righe della tabella
    rates.forEach((rate, index) => {
      // Controlla se abbiamo spazio per un'altra riga
      if (currentY + rowHeight > maxY) {
        // Aggiunge il footer alla pagina corrente
        addFooter(pageCount, Math.ceil(rates.length / Math.floor((maxY - startY) / rowHeight)) + 1);
        
        // Crea una nuova pagina
        currentY = addNewPage();
        isAlternateRow = false;
      }
      
      // Aggiungiamo un bordo sottile attorno alla cella
      doc.setDrawColor(220, 220, 220); // Colore grigio chiaro per i bordi
      
      if (isAlternateRow) {
        doc.setFillColor(240, 240, 240);
      } else {
        doc.setFillColor(255, 255, 255);
      }
      
      // Disegniamo il rettangolo di background con bordo
      doc.rect(margin, currentY, tableWidth, rowHeight, 'FD');
      
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      
      let currentX = margin + 3;
      
      // Carrier - abbreviamo se troppo lungo
      doc.text(truncateText(rate.carrierName, 14), currentX, currentY + 6);
      currentX += colWidths[0];
      
      // Service - abbreviamo se troppo lungo
      doc.text(truncateText(rate.serviceName, 14), currentX, currentY + 6);
      currentX += colWidths[1];
      
      // Country (opzionale)
      if (hasCountry) {
        doc.text(truncateText(rate.countryName, 14), currentX, currentY + 6);
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
      currentX += colWidths[hasCountry ? 5 : 4];
      
      // Discount
      const discountValue = rate.userDiscount > 0 
        ? `${rate.userDiscount}%` 
        : "0%";
      doc.text(discountValue, currentX, currentY + 6);
      currentX += colWidths[hasCountry ? 6 : 5];
      
      // Fuel Surcharge
      const fuelValue = rate.fuelSurcharge > 0 
        ? `${rate.fuelSurcharge}%` 
        : "0%";
      doc.text(fuelValue, currentX, currentY + 6);
      currentX += colWidths[hasCountry ? 7 : 6];
      
      // Total Price (Final Price) - impostiamo in grassetto
      const finalPriceText = formatCurrency(rate.finalPrice, language);
      doc.setFont('helvetica', 'bold');
      doc.text(finalPriceText, currentX, currentY + 6);
      doc.setFont('helvetica', 'normal');
      
      currentY += rowHeight;
      isAlternateRow = !isAlternateRow;
    });
    
    // Aggiungiamo una linea di separazione alla fine della tabella
    doc.setDrawColor(0, 123, 255); 
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, margin + tableWidth, currentY);
    
    // Verificare lo spazio rimanente prima di aggiungere il resto del contenuto
    const spaceNeeded = 65; // Spazio necessario per note, box ringraziamento e footer
    
    if (currentY + spaceNeeded > maxY) {
      // Aggiunge il footer alla pagina corrente
      addFooter(pageCount, pageCount + 1);
      
      // Crea una nuova pagina
      currentY = addNewPage() - rowHeight; // Aggiustiamo per compensare l'intestazione
    }
    
    // Nota sul prezzo totale
    currentY += 10;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(80, 80, 80);
    doc.text(`* ${getTranslation('price_note', language)}`, margin, currentY);
    
    // Box per il messaggio di ringraziamento
    currentY += 20;
    doc.setFillColor(240, 248, 255); 
    doc.setDrawColor(0, 123, 255);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, currentY, tableWidth, 15, 3, 3, 'FD');
    
    // Messaggio di ringraziamento
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(getTranslation('thank_you', language), margin + 6, currentY + 10);
    
    // Testo a piè di pagina
    currentY += 25;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    
    // Split del testo a piè di pagina per gestire il wrapping
    const footerText = getTranslation('footer_text', language);
    const splitFooter = doc.splitTextToSize(footerText, tableWidth);
    doc.text(splitFooter, margin, currentY);
    
    // Nota sull'IVA
    currentY += splitFooter.length * 6 + 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text(`* ${getTranslation('vat_excluded', language)}`, margin, currentY);
    
    // Aggiungiamo il footer all'ultima pagina
    addFooter(pageCount, pageCount);
    
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