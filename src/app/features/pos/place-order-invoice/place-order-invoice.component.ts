import { Component, EventEmitter, Output } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { PosService } from '../@services/pos.service';

@Component({
  selector: 'app-place-order-invoice',
  imports: [SharedModule],
  templateUrl: './place-order-invoice.component.html',
  styleUrl: './place-order-invoice.component.scss'
})
export class PlaceOrderInvoiceComponent {
  visible: boolean = false;
  orgImg: any = JSON.parse(localStorage.getItem('user') || '')?.image;
  invoiceData: any = {};
  @Output() onSubmitPayments = new EventEmitter<any[]>();

  constructor(private _formBuilder: FormBuilder, private _posService: PosService) { }

  ngOnInit(): void {
    this.getInvoiceData()
  }

  showDialog() {
    this.visible = true;
  }

  getInvoiceData() {
    this._posService.getOrderInvoice().subscribe(res => {
      this.invoiceData = res
    })
  }

  getTotalPrice(products: any[]): number {
    if (!products || products.length === 0) return 0;
    return products.reduce((sum, item) => sum + (+item.price || 0), 0);
  }

  printInvoice() {
    const printContent = document.getElementById('invoice-section');

    if (!printContent) {
      console.error('Invoice content not found');
      return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');

    if (!printWindow) {
      alert('Please allow popups to print the invoice');
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

    // Include Bootstrap and other inline styles for invoice
    styles += `
      <style>
        .table { width: 100%; margin-bottom: 1rem; color: #212529; border-collapse: collapse; }
        .table th, .table td { padding: 0.5rem; vertical-align: middle; border: 1px solid #dee2e6; }
        .table-bordered { border: 1px solid #dee2e6; }
        .table-light { background-color: #f8f9fa; }
        .text-end { text-align: right; }
        .text-center { text-align: center; }
        .text-primary { color: #0d6efd; }
        .text-success { color: #198754; }
        .mb-4 { margin-bottom: 1.5rem; }
        .mt-5 { margin-top: 3rem; }
        .p-4 { padding: 1.5rem; }
        .shadow { box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15); }
        .rounded-4 { border-radius: 0.5rem; }
        .bg-white { background-color: #fff; }
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
        .invoice-container { max-width: 800px; margin: 0 auto; }
        h2, h3, h4, h5, h6 { margin-top: 0; margin-bottom: 0.5rem; font-weight: 600; }
        .text-muted { color: #6c757d; }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
          .invoice-container { box-shadow: none; }
        }
      </style>
    `;

    // Write content to new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order Invoice</title>
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

  get currencyExchangeRate() {
    return (this.invoiceData?.currency_exchange_rate) ?? 1
  }

  hideDialog() {
    this.visible = false;
  }
}
