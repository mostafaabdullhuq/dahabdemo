import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ToasterMsgService } from '../../../core/services/toaster-msg.service';
import { environment } from '../../../../environments/environment.development';

// Define supported Arabic ranges
const ARABIC_RANGES = [
  [0x0600, 0x06FF], // Arabic
  [0x0750, 0x077F], // Arabic Supplement
  [0x08A0, 0x08FF], // Arabic Extended-A
  [0xFB50, 0xFDFF], // Arabic Presentation Forms-A
  [0xFE70, 0xFEFF], // Arabic Presentation Forms-B
];

export interface ReportColumn {
  field: string;
  header: string;
  body?: (row: any) => string;
}

export interface ReportConfig {
  title: string;
  data: any[];
  columns: ReportColumn[];
  totals?: { [key: string]: number };
  filterForm?: FormGroup;
  businessName?: string;
  businessLogoURL?: string;
  filename?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportExportService {

  constructor(private toaster: ToasterMsgService) { }

  // Check if text contains Arabic characters
  private containsArabic(text: string): boolean {
    if (!text || typeof text !== 'string') return false;

    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);

      for (const [start, end] of ARABIC_RANGES) {
        if (charCode >= start && charCode <= end) {
          return true;
        }
      }
    }

    return false;
  }

  // Configure PDF for Arabic text with proper font support
  private async configurePDFForArabic(doc: jsPDF, config: ReportConfig): Promise<void> {
    try {
      // Set dynamic properties based on report data
      const reportTitle = config.title || 'Report';
      const businessName = config.businessName || 'System';
      const dateRange = this.getDateRange(config.filterForm);

      doc.setProperties({
        title: `${businessName} - ${reportTitle}${dateRange ? ' - ' + dateRange : ''}`,
        author: businessName,
        creator: `${businessName} PDF Generator`,
        subject: `${reportTitle} generated on ${new Date().toLocaleDateString()}`,
        keywords: `${reportTitle}, ${businessName}, Report, ${new Date().getFullYear()}`
      });

      await this.loadNotoArabicFont(doc);
    } catch (error) {
      console.warn('Could not load Noto Sans Arabic font, falling back to built-in fonts:', error);
      this.addArabicFontToDoc(doc);
    }
  }

  // Load Noto Sans Arabic font for proper Arabic text support
  private async loadNotoArabicFont(doc: jsPDF): Promise<void> {
    const fontBasePaths = [
      'fonts/Noto_Sans_Arabic/static/',
      '/fonts/Noto_Sans_Arabic/static/',
      './fonts/Noto_Sans_Arabic/static/'
    ];

    const fontVariations = [
      { file: 'NotoSansArabic-Regular.ttf', style: 'normal' },
      { file: 'NotoSansArabic-Bold.ttf', style: 'bold' },
      { file: 'Noto_Sans_Arabic-Regular.ttf', style: 'normal' },
      { file: 'Noto_Sans_Arabic-Bold.ttf', style: 'bold' }
    ];

    let fontsLoaded = 0;

    for (const basePath of fontBasePaths) {
      for (const variant of fontVariations) {
        try {
          const fontPath = `${basePath}${variant.file}`;
          const response = await fetch(fontPath);

          if (response.ok) {
            const fontData = await response.arrayBuffer();
            const base64Font = this.arrayBufferToBase64(fontData);

            doc.addFileToVFS(variant.file, base64Font);
            doc.addFont(variant.file, 'NotoArabic', variant.style);
            fontsLoaded++;

            if (fontsLoaded === 1) {
              doc.setFont('NotoArabic', variant.style);
            }
          }
        } catch (error) {
          // Continue trying other font variations
        }
      }

      if (fontsLoaded > 0) {
        return;
      }
    }

    if (fontsLoaded === 0) {
      throw new Error('Could not load Noto Sans Arabic font from any path');
    }
  }

  // Add Arabic font support to jsPDF document (fallback method)
  private addArabicFontToDoc(doc: jsPDF): void {
    const fonts = ['times', 'courier', 'helvetica'];

    for (const font of fonts) {
      try {
        doc.setFont(font, 'normal');
        return;
      } catch (error) {
        continue;
      }
    }
  }

  // Get the best available font for Arabic text
  private getArabicFont(doc: jsPDF, style: string = 'normal'): string {
    const fontOptions = [
      { name: 'NotoArabic', style: style },
      { name: 'times', style: style },
      { name: 'courier', style: style },
      { name: 'helvetica', style: style }
    ];

    for (const font of fontOptions) {
      try {
        doc.setFont(font.name, font.style);
        return font.name;
      } catch (error) {
        // If bold style failed for NotoArabic, try normal style as fallback
        if (font.name === 'NotoArabic' && font.style === 'bold') {
          try {
            doc.setFont('NotoArabic', 'normal');
            return 'NotoArabic';
          } catch (normalError) {
            continue;
          }
        }
        continue;
      }
    }

    return 'helvetica';
  }

  // Convert ArrayBuffer to base64 string
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Helper method to check if image URL is accessible
  private checkImageAccessibility(imageUrl: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();

      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);

      setTimeout(() => resolve(false), 3000);
      img.src = imageUrl;
    });
  }

  // Get date range from form
  private getDateRange(filterForm?: FormGroup): string {
    if (!filterForm) return '';

    const fromDate = filterForm.get('created_from')?.value;
    const toDate = filterForm.get('created_to')?.value;

    if (fromDate && toDate) {
      return `Period: ${new Date(fromDate).toLocaleDateString()} - ${new Date(toDate).toLocaleDateString()}`;
    }

    return '';
  }

  // Generate filename with business prefix
  private generateFilename(config: ReportConfig, extension: string): string {
    const businessPrefix = config.businessName ?
      config.businessName.replace(/\s+/g, '-').toLowerCase() :
      'report';
    const reportName = config.filename || config.title.toLowerCase().replace(/\s+/g, '-');
    const date = new Date().toISOString().split('T')[0];

    return `${businessPrefix}-${reportName}-${date}.${extension}`;
  }

  // Get cell value using column configuration
  private getCellValue(row: any, column: ReportColumn): string {
    let value: string;
    if (column.body) {
      value = column.body(row);
    } else {
      const cellValue = row[column.field];
      value = (cellValue !== null && cellValue !== undefined && cellValue !== '') ? cellValue : '-';
    }

    return typeof value === 'string' ? value : String(value);
  }

  // Export to PDF
  async exportToPDF(config: ReportConfig): Promise<void> {
    if (!config.data || config.data.length === 0) {
      this.toaster.showError("No data available to export");
      return;
    }

    const doc = new jsPDF();
    await this.configurePDFForArabic(doc, config);

    // Check if we should skip logo due to CORS issues in development
    const isS3Logo = config.businessLogoURL?.includes('amazonaws.com') || config.businessLogoURL?.includes('s3.');

    if (!environment.production && isS3Logo) {
      this.toaster.showWarn("PDF generated without logo due to development environment limitations");
      this.createPDFWithFramedHeader(doc, config, null);
      return;
    }

    // Create framed header with logo
    if (config.businessLogoURL) {
      try {
        const isAccessible = await this.checkImageAccessibility(config.businessLogoURL);
        this.createPDFWithFramedHeader(doc, config, isAccessible ? config.businessLogoURL : null);
      } catch (error) {
        this.createPDFWithFramedHeader(doc, config, null);
      }
    } else {
      this.createPDFWithFramedHeader(doc, config, null);
    }
  }

  private createPDFWithFramedHeader(doc: jsPDF, config: ReportConfig, logoUrl: string | null): void {
    const pageWidth = doc.internal.pageSize.width;
    const headerHeight = 35;
    const headerY = 15;
    const padding = 5;

    // Draw header frame
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(14, headerY, pageWidth - 28, headerHeight);

    // Position text on the left side of header
    let textX = 14 + padding;
    let textY = headerY + padding + 5;

    // Add business name
    if (config.businessName) {
      doc.setFontSize(16);
      const businessNameFont = this.getArabicFont(doc, 'bold');
      doc.setFont(businessNameFont, 'bold');
      doc.text(config.businessName, textX, textY);
      textY += 8;
    }

    // Add report title
    doc.setFontSize(14);
    const titleFont = this.getArabicFont(doc, 'bold');
    doc.setFont(titleFont, 'bold');
    doc.text(config.title, textX, textY);
    textY += 6;

    // Add date range if available
    const dateRange = this.getDateRange(config.filterForm);
    if (dateRange) {
      doc.setFontSize(10);
      const dateFont = this.getArabicFont(doc, 'normal');
      doc.setFont(dateFont, 'normal');
      doc.text(dateRange, textX, textY);
    }

    // Add logo on the right side of header if available
    if (logoUrl) {
      try {
        const logoSize = 25;
        const logoX = pageWidth - 28 - logoSize + 5;
        const logoY = headerY + padding;
        doc.addImage(logoUrl, 'JPEG', logoX, logoY, logoSize, logoSize);
      } catch (error) {
        console.warn("Could not add business logo to PDF:", error);
      }
    }

    this.completePDFGeneration(doc, config, headerY + headerHeight + 10);
  }

  private completePDFGeneration(doc: jsPDF, config: ReportConfig, startY: number): void {
    const normalFont = this.getArabicFont(doc, 'normal');
    const boldFont = this.getArabicFont(doc, 'bold');

    // Prepare table data
    const tableColumns = config.columns.map(col => col.header);
    const tableRows = config.data.map(item =>
      config.columns.map(col => this.getCellValue(item, col))
    );

    // Add totals row if provided
    if (config.totals) {
      const totalsRow = config.columns.map(col => {
        if (col.field === config.columns[0].field) {
          return 'TOTALS';
        }
        if (config.totals && config.totals[col.field] !== undefined) {
          return config.totals[col.field].toFixed(3);
        }
        return '-';
      });
      tableRows.push(totalsRow);
    }

    const self = this;

    // Generate table with RTL support for Arabic cells
    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: startY,
      styles: {
        fontSize: 9,
        cellPadding: 3,
        lineColor: [44, 62, 80],
        lineWidth: 0.1,
        font: normalFont,
        fontStyle: 'normal'
      },
      headStyles: {
        fillColor: [52, 152, 219],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
        font: boldFont
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      didParseCell: function (data: any) {
        // Style the totals row
        if (config.totals && data.row.index === tableRows.length - 1) {
          data.cell.styles.fillColor = [231, 76, 60];
          data.cell.styles.textColor = [255, 255, 255];
          data.cell.styles.fontStyle = 'bold';
        }

        try {
          data.cell.styles.font = normalFont;
          data.cell.styles.cellPadding = 3;

          const cellText = data.cell.text ? data.cell.text.join(' ') : '';
          const hasArabicContent = self.containsArabic(cellText);

          if (hasArabicContent) {
            data.cell.styles.halign = 'right';
          } else {
            data.cell.styles.halign = 'left';
          }
        } catch (e) {
          data.cell.styles.font = 'helvetica';
          data.cell.styles.halign = 'left';
        }
      }
    });

    doc.save(this.generateFilename(config, 'pdf'));
  }

  // Export to Excel
  exportToExcel(config: ReportConfig): void {
    if (!config.data || config.data.length === 0) {
      this.toaster.showError("No data available to export");
      return;
    }

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = {};
    let currentRow = 1;

    // Add business name
    if (config.businessName) {
      XLSX.utils.sheet_add_aoa(ws, [[config.businessName]], { origin: `A${currentRow}` });
      currentRow += 2;
    }

    // Add report title
    XLSX.utils.sheet_add_aoa(ws, [[config.title]], { origin: `A${currentRow}` });
    currentRow++;

    // Add date range
    const dateRange = this.getDateRange(config.filterForm);
    if (dateRange) {
      XLSX.utils.sheet_add_aoa(ws, [[dateRange]], { origin: `A${currentRow}` });
      currentRow++;
    }

    currentRow++;

    // Prepare data for Excel
    const exportData: any[] = config.data.map(item => {
      const rowData: any = {};
      config.columns.forEach(col => {
        rowData[col.header] = this.getCellValue(item, col);
      });
      return rowData;
    });

    // Add totals row if provided
    if (config.totals) {
      const totalsRow: any = {};
      config.columns.forEach(col => {
        if (col.field === config.columns[0].field) {
          totalsRow[col.header] = 'TOTALS';
        } else if (config.totals && config.totals[col.field] !== undefined) {
          totalsRow[col.header] = config.totals[col.field].toFixed(3);
        } else {
          totalsRow[col.header] = '-';
        }
      });
      exportData.push(totalsRow);
    }

    XLSX.utils.sheet_add_json(ws, exportData, { origin: `A${currentRow}` });
    XLSX.utils.book_append_sheet(wb, ws, config.title);

    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, this.generateFilename(config, 'xlsx'));
  }

  // Export to CSV
  exportToCSV(config: ReportConfig): void {
    if (!config.data || config.data.length === 0) {
      this.toaster.showError("No data available to export");
      return;
    }

    let csvContent = '';

    // Add business name
    if (config.businessName) {
      csvContent += `${config.businessName}\n\n`;
    }

    // Add report title
    csvContent += `${config.title}\n`;

    // Add date range
    const dateRange = this.getDateRange(config.filterForm);
    if (dateRange) {
      csvContent += `${dateRange}\n`;
    }

    csvContent += '\n';

    // Prepare CSV data
    const csvData: any[] = config.data.map(item => {
      const rowData: any = {};
      config.columns.forEach(col => {
        rowData[col.header] = this.getCellValue(item, col);
      });
      return rowData;
    });

    // Add totals row if provided
    if (config.totals) {
      const totalsRow: any = {};
      config.columns.forEach(col => {
        if (col.field === config.columns[0].field) {
          totalsRow[col.header] = 'TOTALS';
        } else if (config.totals && config.totals[col.field] !== undefined) {
          totalsRow[col.header] = config.totals[col.field].toFixed(3);
        } else {
          totalsRow[col.header] = '-';
        }
      });
      csvData.push(totalsRow);
    }

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(csvData);
    const dataCSV = XLSX.utils.sheet_to_csv(ws);
    const finalCSV = csvContent + dataCSV;

    const blob = new Blob([finalCSV], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, this.generateFilename(config, 'csv'));
  }

  // Print Report
  printReport(config: ReportConfig): void {
    if (!config.data || config.data.length === 0) {
      this.toaster.showError("No data available to print");
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      this.toaster.showError("Please allow popups to print the report");
      return;
    }

    const dateRange = this.getDateRange(config.filterForm);

    let printContent = `
      <html>
        <head>
          <title>${config.businessName ? config.businessName + ' - ' : ''}${config.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header-frame {
              border: 1px solid #000;
              padding: 15px;
              margin-bottom: 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              min-height: 60px;
            }
            .header-left { flex: 1; }
            .header-right { flex-shrink: 0; margin-left: 20px; }
            .business-name { font-size: 18px; font-weight: bold; color: #2c3e50; margin-bottom: 5px; }
            .report-title { font-size: 16px; font-weight: bold; color: #2c3e50; margin-bottom: 3px; }
            .date-range { font-size: 12px; color: #7f8c8d; }
            .logo { max-width: 80px; max-height: 60px; object-fit: contain; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
            th { background-color: #3498db; color: white; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .totals-row { background-color: #e74c3c !important; color: white !important; font-weight: bold; }
            .totals-row td { font-weight: bold; }
            @media print { body { margin: 0; } .header-frame { page-break-inside: avoid; } }
          </style>
        </head>
        <body>
          <div class="header-frame">
            <div class="header-left">`;

    if (config.businessName) {
      printContent += `<div class="business-name">${config.businessName}</div>`;
    }

    printContent += `<div class="report-title">${config.title}</div>`;

    if (dateRange) {
      printContent += `<div class="date-range">${dateRange}</div>`;
    }

    printContent += `</div><div class="header-right">`;

    if (config.businessLogoURL) {
      printContent += `<img src="${config.businessLogoURL}" alt="Business Logo" class="logo" />`;
    }

    printContent += `</div></div><table><thead><tr>`;

    config.columns.forEach(col => {
      printContent += `<th>${col.header}</th>`;
    });

    printContent += `</tr></thead><tbody>`;

    config.data.forEach(item => {
      printContent += `<tr>`;
      config.columns.forEach(col => {
        printContent += `<td>${this.getCellValue(item, col)}</td>`;
      });
      printContent += `</tr>`;
    });

    if (config.totals) {
      printContent += `<tr class="totals-row">`;
      config.columns.forEach(col => {
        if (col.field === config.columns[0].field) {
          printContent += `<td><strong>TOTALS</strong></td>`;
        } else if (config.totals && config.totals[col.field] !== undefined) {
          printContent += `<td><strong>${config.totals[col.field].toFixed(3)}</strong></td>`;
        } else {
          printContent += `<td>-</td>`;
        }
      });
      printContent += `</tr>`;
    }

    printContent += `</tbody></table></body></html>`;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, fileName);
  }
}
