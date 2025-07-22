import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { PosService } from '../@services/pos.service';
import { FormBuilder } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-close-shift-report',
  imports: [SharedModule],
  templateUrl: './close-shift-report.component.html',
  styleUrl: './close-shift-report.component.scss'
})
export class CloseShiftReportComponent implements OnInit {
  visible: boolean = false;
  orgImg: any = JSON.parse(localStorage.getItem('user') || '')?.image;
  reportData: any = {};
  @Output() onSubmitPayments = new EventEmitter<any[]>();
  inventoryKeys: string[] = [];

  constructor(private _formBuilder: FormBuilder, private _posService: PosService) { }

  ngOnInit(): void {
    this.getReportData();
  }

  showDialog() {
    this.visible = true;
  }
  getReportData() {
    this._posService.getShiftReport().subscribe(res => {
      this.reportData = res;
      if (this.reportData) {
        const inventoryData = this.reportData?.inventory_reflection_count || {};
        this.inventoryKeys = Object.keys(inventoryData);
      }
    })
  }
  getTotalByType(type: string): number {
    const amounts = this.reportData?.financial_data?.Amounts || {};
    const paymentMethods = this.reportData?.financial_data?.['Payment Methods'] || [];

    let total = 0;
    for (const method of paymentMethods) {
      const val = amounts[method]?.[type];
      if (val !== undefined) total += val;
    }
    return total;
  }
  getTransactionKeys(): string[] {
    return this.reportData
      ? Object.keys(this.reportData.number_of_transcation)
      : [];
  }

  printInvoice() {
    const printContent = document.getElementById('reoprt-section');

    if (!printContent) {
      console.error('Print content not found');
      return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');

    if (!printWindow) {
      alert('Please allow popups to print the report');
      return;
    }

    // Get current page styles
    const styleSheets = Array.from(document.styleSheets);
    let styles = '<style>body { font-family: Arial, sans-serif; margin: 20px; }</style>';

    // Try to include external stylesheets
    styleSheets.forEach(sheet => {
      try {
        if (sheet.href) {
          styles += `<link rel="stylesheet" href="${sheet.href}">`;
        }
      } catch (e) {
        // Ignore cross-origin stylesheet errors
      }
    });

    // Include Bootstrap and other inline styles
    styles += `
      <style>
        .table { width: 100%; margin-bottom: 1rem; color: #212529; border-collapse: collapse; }
        .table th, .table td { padding: 0.5rem; vertical-align: middle; border: 1px solid #dee2e6; }
        .table-bordered { border: 1px solid #dee2e6; }
        .table-light { background-color: #f8f9fa; }
        .text-end { text-align: right; }
        .text-center { text-align: center; }
        .text-primary { color: #0d6efd; }
        .mb-4 { margin-bottom: 1.5rem; }
        .mt-5 { margin-top: 3rem; }
        .d-flex { display: flex; }
        .justify-content-between { justify-content: space-between; }
        .justify-content-end { justify-content: flex-end; }
        .align-items-center { align-items: center; }
        .fw-bold { font-weight: bold; }
        .border { border: 1px solid #dee2e6; }
        .rounded-3 { border-radius: 0.375rem; }
        .container-fluid { width: 100%; padding-right: 15px; padding-left: 15px; }
        .row { display: flex; flex-wrap: wrap; }
        .col-md-6 { flex: 0 0 auto; width: 50%; }
        .list-unstyled { list-style: none; padding-left: 0; }
        h6 { margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 600; }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    `;

    // Write content to new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Shift Report</title>
          ${styles}
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 100);
    };
  }

  hideDialog() {
    this.visible = false;
  }


  paymentMethods: string[] = [];
  amounts: any = {};


  // Helper to calculate totals per column
  getTotal(type: string): number {
    let total = 0;
    for (const method of this.paymentMethods) {
      const val = this.amounts[method]?.[type];
      if (val !== undefined) total += val;
    }
    return total;
  }
}
