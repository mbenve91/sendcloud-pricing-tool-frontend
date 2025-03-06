import { jsPDF } from 'jspdf';
// Importa la libreria jspdf-autotable come side-effect
import 'jspdf-autotable';
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

// Funzione principale per generare il PDF
export const generateQuotePDF = (
  rates: Rate[],
  options: QuoteOptions
): jsPDF => {
  const { language, accountExecutive } = options;
  
  try {
    // Crea una nuova istanza di jsPDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Configurazione colori
    const primaryColor = [0, 123, 255]; // RGB per #007bff
    const secondaryColor = [33, 37, 41]; // RGB per #212529
    
    // Aggiungi logo SendCloud
    // Nota: in un'implementazione reale dovresti caricare un'immagine vera
    // Per ora utilizziamo un placeholder testuale
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
    
    // Preparato per (nel caso reale, qui andrebbe il nome del cliente)
    doc.setFont('helvetica', 'bold');
    doc.text(getTranslation('prepared_for', language), 120, 70);
    doc.setFont('helvetica', 'normal');
    doc.text('Your Customer', 120, 75);
    
    // Costruisco il corpo della tabella
    const tableBody = rates.map(rate => [
      rate.carrierName,
      rate.serviceName,
      ...(rates.some(r => r.countryName) ? [rate.countryName || ''] : []),
      rate.currentWeightRange ? 
        `${rate.currentWeightRange.min}-${rate.currentWeightRange.max} kg` : 
        (rate.weightMin !== undefined && rate.weightMax !== undefined ? 
          `${rate.weightMin}-${rate.weightMax} kg` : ""),
      rate.deliveryTimeMin && rate.deliveryTimeMax
        ? `${rate.deliveryTimeMin}-${rate.deliveryTimeMax} ${getTranslation('days', language)}`
        : "",
      formatCurrency(rate.finalPrice, language)
    ]);
    
    // Costruisco le intestazioni della tabella
    const tableHeader = [
      getTranslation('carrier', language),
      getTranslation('service', language),
      ...(rates.some(r => r.countryName) ? [getTranslation('destination', language)] : []),
      getTranslation('weight', language),
      getTranslation('delivery_time', language),
      getTranslation('price', language)
    ];
    
    // Utilizzo il metodo autoTable esteso a jsPDF tramite il plugin
    (doc as any).autoTable({
      startY: 85,
      head: [tableHeader],
      body: tableBody,
      styles: {
        halign: 'left',
        fontSize: 10,
        overflow: 'linebreak',
        cellPadding: 5
      },
      headStyles: {
        fillColor: primaryColor,
        fontStyle: 'bold',
        textColor: [255, 255, 255]
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      },
      columnStyles: {
        5: { // Colonna del prezzo (può variare se c'è la colonna paese)
          halign: 'right'
        }
      },
      margin: { top: 85 }
    });
    
    // Nota finale e ringraziamento
    // Accedo a lastAutoTable con un cast per evitare errori TypeScript
    const docAny = doc as any;
    const finalY = docAny.lastAutoTable?.finalY + 20 || 200;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(getTranslation('thank_you', language), 14, finalY);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    
    // Split del testo a piè di pagina per gestire l'andare a capo
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
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Funzione di utilità per scaricare il PDF
export const downloadQuotePDF = (rates: Rate[], options: QuoteOptions): void => {
  try {
    const doc = generateQuotePDF(rates, options);
    doc.save(`SendCloud_Quote_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
}; 