import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ToasterMsgService } from '../../../core/services/toaster-msg.service';

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

  // Helper method to convert image URL to base64
  private convertImageToBase64(imageUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      // Set crossOrigin to handle CORS
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const base64String = canvas.toDataURL('image/jpeg', 0.8);
          resolve(base64String);
        } catch (canvasError) {
          console.error('Canvas conversion failed:', canvasError);
          reject(new Error(`Canvas conversion failed: ${canvasError}`));
        }
      };

      img.onerror = (imgError) => {
        console.error('Image loading failed:', imgError);
        reject(new Error(`Image loading failed: ${imgError}`));
      };

      // Add timestamp to prevent caching issues
      const imageUrlWithTimestamp = imageUrl.includes('?')
        ? `${imageUrl}&t=${Date.now()}`
        : `${imageUrl}?t=${Date.now()}`;

      img.src = imageUrlWithTimestamp;
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
    if (column.body) {
      return column.body(row);
    }
    return row[column.field] || '-';
  }

  // Export to PDF
  exportToPDF(config: ReportConfig): void {
    if (!config.data || config.data.length === 0) {
      this.toaster.showError("No data available to export");
      return;
    }

    const doc = new jsPDF();

    // Create framed header with logo on right and text on left
    if (config.businessLogoURL) {
      this.convertImageToBase64(config.businessLogoURL)
        .then((base64Image: string) => {
          this.createPDFWithFramedHeader(doc, config, base64Image);
        })
        .catch((error: any) => {
          console.error("Error converting image to base64:", error);
          // Continue without logo if conversion fails
          this.createPDFWithFramedHeader(doc, config, null);
        });
    } else {
      this.createPDFWithFramedHeader(doc, config, null);
    }
  }

  private createPDFWithFramedHeader(doc: jsPDF, config: ReportConfig, logoBase64: string | null): void {
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
      doc.setFont('helvetica', 'bold');
      doc.text(config.businessName, textX, textY);
      textY += 8;
    }

    // Add report title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(config.title, textX, textY);
    textY += 6;

    // Add date range if available
    const dateRange = this.getDateRange(config.filterForm);
    if (dateRange) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(dateRange, textX, textY);
    }

    // Add logo on the right side of header if available
    if (logoBase64) {
      try {
        const logoSize = 25;
        const logoX = pageWidth - 28 - logoSize + 5; // Right side within frame
        const logoY = headerY + padding;
        doc.addImage(logoBase64, 'JPEG', logoX, logoY, logoSize, logoSize);
      } catch (error) {
        console.error("Error adding logo to PDF:", error);
      }
    }

    // Continue with table generation
    this.completePDFGeneration(doc, config, headerY + headerHeight + 10);
  }

  private completePDFGeneration(doc: jsPDF, config: ReportConfig, startY: number): void {
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

    // Generate table with improved styling
    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: startY,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: [44, 62, 80],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [52, 152, 219],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      // Style the totals row
      didParseCell: function (data: any) {
        if (config.totals && data.row.index === tableRows.length - 1) {
          data.cell.styles.fillColor = [231, 76, 60];
          data.cell.styles.textColor = [255, 255, 255];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    // Save the PDF
    doc.save(this.generateFilename(config, 'pdf'));
  }

  // Export to Excel
  exportToExcel(config: ReportConfig): void {
    if (!config.data || config.data.length === 0) {
      this.toaster.showError("No data available to export");
      return;
    }

    // Create workbook and empty worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = {};

    let currentRow = 1;

    // Add business name
    if (config.businessName) {
      XLSX.utils.sheet_add_aoa(ws, [[config.businessName]], { origin: `A${currentRow}` });
      currentRow += 2; // Skip a row
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

    currentRow++; // Empty row before data

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

    // Add the data table starting from the current row
    XLSX.utils.sheet_add_json(ws, exportData, { origin: `A${currentRow}` });

    XLSX.utils.book_append_sheet(wb, ws, config.title);

    // Save Excel file
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, this.generateFilename(config, 'xlsx'));
  }

  // Export to CSV
  exportToCSV(config: ReportConfig): void {
    if (!config.data || config.data.length === 0) {
      this.toaster.showError("No data available to export");
      return;
    }

    // Create header information
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

    csvContent += '\n'; // Empty line before data

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

    // Create worksheet and convert to CSV
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(csvData);
    const dataCSV = XLSX.utils.sheet_to_csv(ws);

    // Combine header and data
    const finalCSV = csvContent + dataCSV;

    // Save CSV file
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

    // Get date range for header
    const dateRange = this.getDateRange(config.filterForm);

    // Generate HTML for print with framed header
    let printContent = `
      <html>
        <head>
          <title>${config.businessName ? config.businessName + ' - ' : ''}${config.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }

            /* Framed Header Styles */
            .header-frame {
              border: 1px solid #000;
              padding: 15px;
              margin-bottom: 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              min-height: 60px;
            }

            .header-left {
              flex: 1;
            }

            .header-right {
              flex-shrink: 0;
              margin-left: 20px;
            }

            .business-name {
              font-size: 18px;
              font-weight: bold;
              color: #2c3e50;
              margin-bottom: 5px;
            }

            .report-title {
              font-size: 16px;
              font-weight: bold;
              color: #2c3e50;
              margin-bottom: 3px;
            }

            .date-range {
              font-size: 12px;
              color: #7f8c8d;
            }

            .logo {
              max-width: 80px;
              max-height: 60px;
              object-fit: contain;
            }

            /* Table Styles */
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }

            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
              font-size: 11px;
            }

            th {
              background-color: #3498db;
              color: white;
              font-weight: bold;
            }

            tr:nth-child(even) {
              background-color: #f9f9f9;
            }

            .totals-row {
              background-color: #e74c3c !important;
              color: white !important;
              font-weight: bold;
            }

            .totals-row td {
              font-weight: bold;
            }

            @media print {
              body { margin: 0; }
              .header-frame { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header-frame">
            <div class="header-left">`;

    // Add business name
    if (config.businessName) {
      printContent += `<div class="business-name">${config.businessName}</div>`;
    }

    // Add report title
    printContent += `<div class="report-title">${config.title}</div>`;

    // Add date range
    if (dateRange) {
      printContent += `<div class="date-range">${dateRange}</div>`;
    }

    printContent += `
            </div>
            <div class="header-right">`;

    // Add business logo if available
    if (config.businessLogoURL) {
      printContent += `<img src="${config.businessLogoURL}" alt="Business Logo" class="logo" />`;
    }

    printContent += `
            </div>
          </div>

          <table>
            <thead>
              <tr>`;

    // Add table headers
    config.columns.forEach(col => {
      printContent += `<th>${col.header}</th>`;
    });

    printContent += `
              </tr>
            </thead>
            <tbody>`;

    // Add data rows
    config.data.forEach(item => {
      printContent += `<tr>`;
      config.columns.forEach(col => {
        printContent += `<td>${this.getCellValue(item, col)}</td>`;
      });
      printContent += `</tr>`;
    });

    // Add totals row if provided
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

    printContent += `
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();

    // Wait for content to load then print
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
