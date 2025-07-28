import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ContactService } from '../../../@services/contact.service';
import { SharedModule } from '../../../../../shared/shared.module';

@Component({
  selector: 'app-suppliers-ledger',
  imports: [SharedModule],
  templateUrl: './suppliers-ledger.component.html',
  styleUrl: './suppliers-ledger.component.scss'
})
export class SuppliersLedgerComponent implements OnInit {
  @Input() supplierId: any = '';
  ledgerData: any = [];
  filterForm!: FormGroup;
  cols: any[] = [];
  totalRecords: number = 0;
  pageSize: number = 10;
  first: number = 0;

  constructor(private _contactService: ContactService, private _formBuilder: FormBuilder) { }
  ngOnInit(): void {
    this.getLedgerData()
    this.filterForm = this._formBuilder.group({
      search: '',
      order__orderproduct__order_type: '',
      created_at__gte: '',
      created_at__lte: '',
    });
    this.cols = [
      { field: "created_at", header: "Date" },
      { field: "id", header: "Ref No" },
      { field: "location", header: "Location" },
      { field: "payment_method", header: "Payment Method" },
      {
        field: "total_due_amount",
        header: "Total Due Amount",
        body: (row: any) => !isNaN(Number(row?.total_due_amount)) ? Number(row.total_due_amount).toFixed(3) : '-'

      },
      {
        field: "total_paid_amount",
        header: "Total Paid Amount",
        body: (row: any) => !isNaN(Number(row?.total_paid_amount)) ? Number(row.total_paid_amount).toFixed(3) : '-'

      },
      {
        field: 'products',
        header: 'Products',
        body: (row: any) => {
          if (!row.products?.length) return '-';
          return row.products.map((p: any) =>
            `<div><strong>${p.product_name}</strong> (${p.order_type}) - Amount: ${parseFloat(p.amount).toFixed(2)}</div>`
          ).join('');
        }
      },
      {
        field: 'transaction_status',
        header: 'Transaction Status',
        body: (row: any) => {
          const ts = row.transaction_status;
          if (!ts) return '-';
          return `
        <div><strong>Total Sale:</strong> ${ts.total_sale_amount?.toFixed(2) ?? '-'}</div>
        <div class="text-danger"><strong >Total Return:</strong> ${ts.total_return_amount?.toFixed(2) ?? '-'}</div>
        <div class="text-success"><strong >Total Paid:</strong> ${ts.total_paid_amount?.toFixed(2) ?? '-'}</div>
        <div ><strong >Remaining:</strong> ${ts.remaining_amount?.toFixed(2) ?? '-'}</div>
      `;
        }
      }
    ];

  }
  getLedgerData(params?: any) {
    if (this.supplierId) {
      this._contactService.getSupplierLedgers(this.supplierId, params)?.subscribe(res => {
        this.ledgerData = res?.results;
      })
    }
  }
  loadSupplierLedgers(event: any): void {
    const page = event.first / event.rows + 1;
    const pageSize = event.rows;

    this.first = event.first;
    this.pageSize = pageSize;
    this._contactService.getSupplierLedgers(this.supplierId)?.subscribe((res: any) => {
      this.ledgerData = res.results || [];;
      this.totalRecords = res.count;
    })
  }
  onSearch(): void {
    const formValues = this.filterForm.value;

    const queryParts: string[] = [];

    Object.keys(formValues).forEach(key => {
      let value = formValues[key];

      // Format date fields
      if ((key === 'created_at__gte' || key === 'created_at__lte') && value) {
        const date = new Date(value);
        const formattedDate = date.toISOString().split('T')[0]; // "YYYY-MM-DD"
        value = formattedDate;
      }

      if (value !== null && value !== '' && value !== undefined) {
        const encodedKey = encodeURIComponent(key);
        const encodedValue = encodeURIComponent(value).replace(/%20/g, '+');
        queryParts.push(`${encodedKey}=${encodedValue}`);
      }
    });

    const queryParams = queryParts.join('&');

    this.getLedgerData(queryParams);
  }
}
