import jsPDF from 'jspdf';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => any;
    lastAutoTable: {
      finalY: number;
    };
    splitTextToSize: (text: string, maxWidth: number) => string[];
  }
} 