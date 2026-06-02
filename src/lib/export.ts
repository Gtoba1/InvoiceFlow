import { ExportFormat } from '@/types';

interface ExportOptions {
  elementId: string;
  filename: string;
  format: ExportFormat;
  scale?: number;
}

export async function exportInvoice({ elementId, filename, format, scale = 2 }: ExportOptions): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) throw new Error('Invoice element not found');

  // Dynamic imports for client-side only
  const html2canvas = (await import('html2canvas')).default;

  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    imageTimeout: 15000,
    onclone: (doc) => {
      const el = doc.getElementById(elementId);
      if (el) {
        el.style.transform = 'none';
        el.style.boxShadow = 'none';
      }
    },
  });

  if (format === 'pdf') {
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const imgData = canvas.toDataURL('image/png', 1.0);

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${filename}.pdf`);
  } else if (format === 'png') {
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else if (format === 'jpeg') {
    const link = document.createElement('a');
    link.download = `${filename}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
