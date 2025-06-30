import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedModule } from '../../../../../shared/shared.module';
import { ReportsService } from '../../../@services/reports.service';
import { SalesReportResponse } from '../sales-reports.models';
import { DataTableColumn, DataTableOptions, PaginatedResponse } from '../../../../../shared/models/common.models';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ToasterMsgService } from '../../../../../core/services/toaster-msg.service';


@Component({
  selector: 'app-sales-report',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  templateUrl: './sales-report.component.html',
  styleUrl: './sales-report.component.scss'
})
export class SalesReportComponent implements OnInit {
  filterForm!: FormGroup;
  selectedReportItem: any;
  searchResults: PaginatedResponse<SalesReportResponse> = {
    results: [],
    count: 0,
    next: null,
    previous: null
  };
  tableOptions: DataTableOptions = new DataTableOptions();
  columns: DataTableColumn[] = [
    { field: "created_at", header: "Date", body: this.getRowCreateDate },
    { field: "reference_number", header: "Invoice Number" },
    { field: "customer_name", header: "Customer Name" },
    { field: "phone", header: "Phone Number" },
    { field: "customer_cpr", header: "CPR Number" },
    { field: "subtotal", header: "Subtotal", body: this.getSubtotal.bind(this) },
    { field: "tax_amount", header: "Tax Amount", body: this.getTaxAmount.bind(this) },
    { field: "total_amount", header: "Total Amount", body: this.getRowTotalAmount.bind(this) },
  ];

  reportTotals: {
    total_amount: number,
    tax_amount: number,
    subtotal: number
  } = {
      total_amount: 0,
      tax_amount: 0,
      subtotal: 0
    }

  exportItems = [
    {
      label: 'Export to PDF',
      icon: 'pi pi-file-pdf',
      command: () => this.exportToPDF()
    },
    {
      label: 'Export to Excel',
      icon: 'pi pi-file-excel',
      command: () => this.exportToExcel()
    },
    {
      label: 'Export to CSV',
      icon: 'pi pi-file',
      command: () => this.exportToCSV()
    }
  ];

  private toaster = inject(ToasterMsgService);

  businessName!: string;
  businessLogoURL!: string;


  constructor(private _formBuilder: FormBuilder, private reportsService: ReportsService) {
  }

  // Custom validator for date range
  dateRangeValidator(formGroup: FormGroup) {
    const fromDate = formGroup.get('created_from')?.value;
    const toDate = formGroup.get('created_to')?.value;

    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      return { dateRangeInvalid: true };
    }
    return null;
  }

  ngOnInit(): void {
    // Get current month's first and last day
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Format dates for input fields (YYYY-MM-DD)
    const formatDate = (date: Date): string => {
      return date.toISOString().split('T')[0];
    };

    this.filterForm = this._formBuilder.group({
      created_from: [formatDate(firstDayOfMonth), Validators.required],
      created_to: [formatDate(lastDayOfMonth), Validators.required],
      order__customer__cpr__icontains: null,
      order__customer__name__icontains: null,
      order__customer__phone__icontains: null,
      search: null,
    }, { validators: this.dateRangeValidator });

    // Load data with default current month filter
    this.getData(this.getFilterObject());
    this.businessName = JSON.parse(localStorage.getItem('user') || '{}')?.business_name;
    this.businessLogoURL = JSON.parse(localStorage.getItem('user') || '{}')?.image;
  }

  getAmount(amount: string, currency: string) {
    return (+amount)?.toFixed(3) + ' ' + currency;
  }

  getSubtotal(row: SalesReportResponse) {
    return this.getAmount(row.subtotal, row.currency);
  }

  private getRowTotalAmount(row: SalesReportResponse) {
    return this.getAmount(row.total_amount, row.currency);
  }

  getTaxAmount(row: SalesReportResponse) {
    return this.getAmount(row.tax_amount, row.currency);
  }

  private getRowCreateDate(row: SalesReportResponse) {
    if (!row?.created_at || isNaN(Date.parse(row.created_at))) return '-';
    const date = new Date(row.created_at);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  getPaginatedRows(data: { first: number, rows: number }) {
    this.tableOptions.firstIndex = data.first;
    this.tableOptions.pageSize = data.rows;

    // Calculate the current page based on first index and rows per page
    this.tableOptions.currentPage = Math.floor(data.first / data.rows) + 1;
    let created_at_range = this.getFilterObject().created_at__range;

    this.getData({
      created_at_range
    });
  }

  private getData(filter: {} = {}) {
    this.reportsService.getSalesReport({
      ...filter,
      page: this.tableOptions.currentPage,
      page_size: this.tableOptions.pageSize,
    }).subscribe(response => {
      this.searchResults = response;
      this.tableOptions.totalRecords = response.count;
      this.updateReportTotals(response.results);
    });
  }

  onSearch() {
    // Mark all fields as touched to show validation errors
    this.filterForm.markAllAsTouched();

    if (this.filterForm.invalid) {
      // Show alert if required date fields are missing
      if (this.filterForm.get('created_from')?.invalid || this.filterForm.get('created_to')?.invalid) {
        this.toaster.showError("Please select both From Date and To Date to filter the report.")
      }
      // Show alert if date range is invalid
      else if (this.filterForm.errors?.['dateRangeInvalid']) {
        this.toaster.showError("From Date cannot be later than To Date.")
      }
      return;
    }

    this.getData(this.getFilterObject());
  }

  private getFilterObject() {
    const filterValues = this.filterForm.value;

    // replace created_from and created_to with created_at__range (Multiple values may be separated by commas.)
    let filter: any = {};

    if (filterValues.created_from && filterValues.created_to) {
      filter.created_at__range = `${new Date(filterValues.created_from).toISOString()},${new Date(filterValues.created_to).toISOString()}`;
    }

    // Remove created_from and created_to from filterValues
    delete filterValues.created_from;
    delete filterValues.created_to;

    // remove empty values from filterValues
    Object.keys(filterValues).forEach(key => {
      if (filterValues[key] === null || filterValues[key] === '' || filterValues[key] === undefined) {
        delete filterValues[key];
      }
    });

    return {
      ...filter,
      ...filterValues
    }
  }

  updateReportTotals(results: any = []): void {
    const data = results ?? [];

    this.reportTotals = {
      total_amount: data.reduce((acc: number, item: { total_amount: any; }) => acc + parseFloat(item.total_amount || 0), 0),
      tax_amount: data.reduce((acc: number, item: { tax_amount: any; }) => acc + parseFloat(item.tax_amount || 0), 0),
      subtotal: data.reduce((acc: number, item: { subtotal: any; }) => acc + parseFloat(item.subtotal || 0), 0),
    };
  }

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

  // Export and Print Methods
  exportToPDF(): void {
    if (!this.searchResults.results || this.searchResults.results.length === 0) {
      this.toaster.showError("No data available to export")
      return;
    }

    const doc = new jsPDF();

    // Create framed header with logo on right and text on left
    if (this.businessLogoURL) {
      this.convertImageToBase64(this.businessLogoURL)
        .then((base64Image: string) => {
          this.createPDFWithFramedHeader(doc, base64Image);
        })
        .catch((error: any) => {
          console.error("Error converting image to base64:", error);
          // Continue without logo if conversion fails
          this.createPDFWithFramedHeader(doc, null);
        });
    } else {
      this.createPDFWithFramedHeader(doc, null);
    }
  }

  private createPDFWithFramedHeader(doc: jsPDF, logoBase64: string | null): void {
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
    if (this.businessName) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(this.businessName, textX, textY);
      textY += 8;
    }

    // Add report title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Sales Report', textX, textY);
    textY += 6;

    // Add date range if available
    const fromDate = this.filterForm.get('created_from')?.value;
    const toDate = this.filterForm.get('created_to')?.value;
    if (fromDate && toDate) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Period: ${new Date(fromDate).toLocaleDateString()} - ${new Date(toDate).toLocaleDateString()}`, textX, textY);
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
    this.completePDFGeneration(doc, headerY + headerHeight + 10);
  }

  private completePDFGeneration(doc: jsPDF, startY: number): void {
    // Prepare table data
    const tableColumns = ['Date', 'Invoice Number', 'Customer Name', 'Phone', 'CPR', 'Subtotal', 'Tax Amount', 'Total Amount'];
    const tableRows = this.searchResults.results.map(item => [
      this.getRowCreateDate(item),
      item.reference_number || '-',
      item.customer_name || '-',
      item.phone || '-',
      item.customer_cpr || '-',
      this.getSubtotal(item),
      this.getTaxAmount(item),
      this.getRowTotalAmount(item)
    ]);

    // Add totals row
    tableRows.push([
      'TOTALS',
      '-',
      '-',
      '-',
      '-',
      this.reportTotals.subtotal.toFixed(3),
      this.reportTotals.tax_amount.toFixed(3),
      this.reportTotals.total_amount.toFixed(3)
    ]);

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
        if (data.row.index === tableRows.length - 1) {
          data.cell.styles.fillColor = [231, 76, 60];
          data.cell.styles.textColor = [255, 255, 255];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    // Save the PDF
    const businessPrefix = this.businessName ? this.businessName.replace(/\s+/g, '-').toLowerCase() : 'sales';
    doc.save(`${businessPrefix}-sales-report-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  exportToExcel(): void {
    if (!this.searchResults.results || this.searchResults.results.length === 0) {
      this.toaster.showError("No data available to export")
      return;
    }

    // Create workbook and empty worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = {};

    let currentRow = 1;

    // Add business name
    if (this.businessName) {
      XLSX.utils.sheet_add_aoa(ws, [[this.businessName]], { origin: `A${currentRow}` });
      currentRow += 2; // Skip a row
    }

    // Add report title
    XLSX.utils.sheet_add_aoa(ws, [['Sales Report']], { origin: `A${currentRow}` });
    currentRow++;

    // Add date range
    const fromDate = this.filterForm.get('created_from')?.value;
    const toDate = this.filterForm.get('created_to')?.value;
    if (fromDate && toDate) {
      XLSX.utils.sheet_add_aoa(ws, [[`Period: ${new Date(fromDate).toLocaleDateString()} - ${new Date(toDate).toLocaleDateString()}`]], { origin: `A${currentRow}` });
      currentRow++;
    }

    currentRow++; // Empty row before data

    // Prepare data for Excel
    const exportData: any[] = this.searchResults.results.map(item => ({
      'Date': this.getRowCreateDate(item),
      'Invoice Number': item.reference_number || '-',
      'Customer Name': item.customer_name || '-',
      'Phone Number': item.phone || '-',
      'CPR Number': item.customer_cpr || '-',
      'Subtotal': parseFloat(item.subtotal || '0').toFixed(3),
      'Tax Amount': parseFloat(item.tax_amount || '0').toFixed(3),
      'Total Amount': parseFloat(item.total_amount || '0').toFixed(3),
      'Currency': item.currency || '-'
    }));

    // Add totals row
    exportData.push({
      'Date': 'TOTALS',
      'Invoice Number': '-',
      'Customer Name': '-',
      'Phone Number': '-',
      'CPR Number': '-',
      'Subtotal': this.reportTotals.subtotal.toFixed(3),
      'Tax Amount': this.reportTotals.tax_amount.toFixed(3),
      'Total Amount': this.reportTotals.total_amount.toFixed(3),
      'Currency': '-'
    });

    // Add the data table starting from the current row
    XLSX.utils.sheet_add_json(ws, exportData, { origin: `A${currentRow}` });

    XLSX.utils.book_append_sheet(wb, ws, 'Sales Report');

    // Save Excel file
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const businessPrefix = this.businessName ? this.businessName.replace(/\s+/g, '-').toLowerCase() : 'sales';
    this.saveAsExcelFile(excelBuffer, `${businessPrefix}-sales-report-${new Date().toISOString().split('T')[0]}`);
  }

  exportToCSV(): void {
    if (!this.searchResults.results || this.searchResults.results.length === 0) {
      this.toaster.showError("No data available to export")
      return;
    }

    // Create header information
    let csvContent = '';

    // Add business name
    if (this.businessName) {
      csvContent += `${this.businessName}\n\n`;
    }

    // Add report title
    csvContent += 'Sales Report\n';

    // Add date range
    const fromDate = this.filterForm.get('created_from')?.value;
    const toDate = this.filterForm.get('created_to')?.value;
    if (fromDate && toDate) {
      csvContent += `Period: ${new Date(fromDate).toLocaleDateString()} - ${new Date(toDate).toLocaleDateString()}\n`;
    }

    csvContent += '\n'; // Empty line before data

    // Prepare CSV data
    const csvData: any[] = this.searchResults.results.map(item => ({
      'Date': this.getRowCreateDate(item),
      'Invoice Number': item.reference_number || '-',
      'Customer Name': item.customer_name || '-',
      'Phone Number': item.phone || '-',
      'CPR Number': item.customer_cpr || '-',
      'Subtotal': parseFloat(item.subtotal || '0').toFixed(3),
      'Tax Amount': parseFloat(item.tax_amount || '0').toFixed(3),
      'Total Amount': parseFloat(item.total_amount || '0').toFixed(3),
      'Currency': item.currency || '-'
    }));

    // Add totals row
    csvData.push({
      'Date': 'TOTALS',
      'Invoice Number': '-',
      'Customer Name': '-',
      'Phone Number': '-',
      'CPR Number': '-',
      'Subtotal': this.reportTotals.subtotal.toFixed(3),
      'Tax Amount': this.reportTotals.tax_amount.toFixed(3),
      'Total Amount': this.reportTotals.total_amount.toFixed(3),
      'Currency': '-'
    });

    // Create worksheet and convert to CSV
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(csvData);
    const dataCSV = XLSX.utils.sheet_to_csv(ws);

    // Combine header and data
    const finalCSV = csvContent + dataCSV;

    // Save CSV file
    const blob = new Blob([finalCSV], { type: 'text/csv;charset=utf-8;' });
    const businessPrefix = this.businessName ? this.businessName.replace(/\s+/g, '-').toLowerCase() : 'sales';
    saveAs(blob, `${businessPrefix}-sales-report-${new Date().toISOString().split('T')[0]}.csv`);
  }

  printReport(): void {
    if (!this.searchResults.results || this.searchResults.results.length === 0) {
      this.toaster.showError("No data available to print")
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      this.toaster.showError("Please allow popups to print the report")
      return;
    }

    // Get date range for header
    const fromDate = this.filterForm.get('created_from')?.value;
    const toDate = this.filterForm.get('created_to')?.value;
    const dateRangeText = fromDate && toDate ?
      `Period: ${new Date(fromDate).toLocaleDateString()} - ${new Date(toDate).toLocaleDateString()}` : '';

    // Generate HTML for print with framed header
    let printContent = `
      <html>
        <head>
          <title>${this.businessName ? this.businessName + ' - ' : ''}Sales Report</title>
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
    if (this.businessName) {
      printContent += `<div class="business-name">${this.businessName}</div>`;
    }

    // Add report title
    printContent += `<div class="report-title">Sales Report</div>`;

    // Add date range
    if (dateRangeText) {
      printContent += `<div class="date-range">${dateRangeText}</div>`;
    }

    printContent += `
            </div>
            <div class="header-right">`;

    // Add business logo if available
    if (this.businessLogoURL) {
      printContent += `<img src="${this.businessLogoURL}" alt="Business Logo" class="logo" />`;
    }

    printContent += `
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Invoice Number</th>
                <th>Customer Name</th>
                <th>Phone</th>
                <th>CPR</th>
                <th>Subtotal</th>
                <th>Tax Amount</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
    `;

    // Add data rows
    this.searchResults.results.forEach(item => {
      printContent += `
        <tr>
          <td>${this.getRowCreateDate(item)}</td>
          <td>${item.reference_number || '-'}</td>
          <td>${item.customer_name || '-'}</td>
          <td>${item.phone || '-'}</td>
          <td>${item.customer_cpr || '-'}</td>
          <td>${this.getSubtotal(item)}</td>
          <td>${this.getTaxAmount(item)}</td>
          <td>${this.getRowTotalAmount(item)}</td>
        </tr>
      `;
    });

    // Add totals row
    printContent += `
              <tr class="totals-row">
                <td><strong>TOTALS</strong></td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td><strong>${this.reportTotals.subtotal.toFixed(3)}</strong></td>
                <td><strong>${this.reportTotals.tax_amount.toFixed(3)}</strong></td>
                <td><strong>${this.reportTotals.total_amount.toFixed(3)}</strong></td>
              </tr>
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
    saveAs(data, fileName + '.xlsx');
  }
}
