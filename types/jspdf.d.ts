import { jsPDF } from 'jspdf';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: {
      startY?: number;
      head?: any[][];
      body?: any[][];
      foot?: any[][];
      styles?: any;
      headStyles?: any;
      bodyStyles?: any;
      footStyles?: any;
      alternateRowStyles?: any;
      columnStyles?: any;
      margin?: any;
      theme?: string;
      tableWidth?: string;
      showHead?: string;
      showFoot?: string;
      tableLineWidth?: number;
      tableLineColor?: number[];
      [key: string]: any;
    }) => void;
    lastAutoTable?: {
      finalY: number;
    };
    splitTextToSize: (text: string, maxWidth: number) => string[];
  }
} 