import { Component, Input, OnInit } from '@angular/core';
import { ContactService } from '../../../@services/contact.service';
import { SharedModule } from '../../../../../shared/shared.module';
import { MenuItem } from 'primeng/api';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-payments',
  imports: [SharedModule],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.scss'
})
export class PaymentsComponent implements OnInit {
  transData: any = [];
  @Input() customerId: any = '';
  cols: any[] = [];
  totalRecords: number = 0;
  pageSize: number = 10;
  pageSizeOptions: number[] = [
    10, 25, 50, 100
  ]
  first: number = 0;
  filterForm!: FormGroup;

  selectedProduct: any;

  customersMenuItems: MenuItem[] = [
    {
      label: 'Edit',
      icon: 'pi pi-fw pi-pen-to-square',
      command: () => console.log('gdfg')

    },
    {
      label: 'View',
      icon: 'pi pi-fw pi-eye',
      command: () => console.log('gdfg')
    },
    {
      label: 'Delete',
      icon: 'pi pi-fw pi-trash',
      command: () => console.log('gdfg')
    }
  ];


  constructor(private _contactService: ContactService, private _formBuilder: FormBuilder) { }

  ngOnInit(): void {
    if (this.customerId) {
      this.getPayments(this.customerId)
    }

    this.cols = [
      { field: "reference_number", header: "ID" },
      { field: "payment_date", header: "Date" },
      { field: "payment_method_name", header: "Payment Method" },
      { field: "amount", header: "Amount" },
      { field: "transaction_type", header: "Transaction Type" },
      {
        field: "payment_status", header: "Payment Status", body: (row: any) => {
          return `
        <strong>Remaining:</strong>
        <span>${row.remaining_balance}</span>
        <br>
        <strong>Paid:</strong>
        <span>${row.total_paid_amount}</span>
        <br>
        <strong>Due:</strong>
        <span>${row.total_due_amount}</span>
        `
        }
      },
    ];

    this.filterForm = this._formBuilder.group({
      search: '',
      created_at__gte: '',
      created_at__lte: '',
    });

    this.getPayments(this.customerId);
  }

  getPayments(id: any, search: string = '', page: number = 1, pageSize: number = 10) {
    this._contactService.getCustomerPayments(id, search, page, pageSize)?.subscribe((res: any) => {
      this.transData = res.results || [];
      this.totalRecords = res.count;
    })
  }

  loadCustomersTrans(event: any): void {
    const page = Math.floor(event.first / event.rows) + 1;
    const pageSize = event.rows;

    this.first = event.first;
    this.pageSize = pageSize;
    this._contactService.getCustomerPayments(this.customerId, this.getQueryParams(), page, pageSize)?.subscribe((res: any) => {
      this.transData = res.results || [];;
      this.totalRecords = res.count;
    })
  }

  onSearch(): void {
    this.getPayments(this.customerId, this.getQueryParams(), 1, this.pageSize);
  }


  getQueryParams() {
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

    return queryParts.join('&');
  }

}
