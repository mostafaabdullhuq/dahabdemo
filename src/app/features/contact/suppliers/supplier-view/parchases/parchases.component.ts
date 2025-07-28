import { Component, Input } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ContactService } from '../../../@services/contact.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SharedModule } from '../../../../../shared/shared.module';

@Component({
  selector: 'app-parchases',
  imports: [SharedModule],
  templateUrl: './parchases.component.html',
  styleUrl: './parchases.component.scss'
})
export class ParchasesComponent {
  transData: any = [];
  @Input() supplierId: any = '';
  cols: any[] = [];
  totalRecords: number = 0;
  pageSize: number = 10;
  first: number = 0;
  filterForm!: FormGroup;
  transactionTypes = [
    {
      id: "", name: 'All'
    },
    {
      id: "sale", name: 'Sales'
    },
    {
      id: "purchase", name: 'Purchase Old Gold'
    },
    {
      id: "return", name: 'Return'
    },
    {
      id: "repair", name: 'Repair'
    },
    {
      id: "gold_receipt", name: 'Gold Receipt'
    }
  ]
  constructor(private _contactService: ContactService, private _formBuilder: FormBuilder) { }
  ngOnInit(): void {
    if (this.supplierId) {
      this.getTransactions(this.supplierId)
    }
    this.cols = [
      {
        field: "order_date",
        header: "order date"
      },
      {
        field: "reference_number",
        header: "Reference Number"
      },
      {
        field: "total_amount",
        header: "Total Amount",
      },
      {
        field: "total_weight",
        header: "Total Weight"
      },
      {
        field: "total_payed_amount",
        header: "total payed amount"
      },
      {
        field: "total_payed_weight",
        header: "total payed weight",
      },
      {
        field: "tax_amount",
        header: "tax amount",
      },
      {
        field: "payment_status",
        header: "payment status",
      },
      {
        field: "total_items",
        header: "total items",
      }
    ];
    this.filterForm = this._formBuilder.group({
      search: '',
      order__orderproduct__order_type: '',
      created_at__gte: '',
      created_at__lte: '',
    });
    this.getTransactions(this.supplierId);

  }
  getTransactions(id: any, search: string = '', page: number = 1, pageSize: number = 10) {
    this._contactService.getSupplierParchases(id, search, page, pageSize)?.subscribe((res: any) => {
      this.transData = res.results || [];;
      this.totalRecords = res.count;
    })
  }

  loadCustomersTrans(event: any): void {
    const page = Math.floor(event.first / event.rows) + 1;
    const pageSize = event.rows;

    this.first = event.first;
    this.pageSize = pageSize;
    this._contactService.getSupplierParchases(this.supplierId, this.getQueryParams(), page, pageSize)?.subscribe((res: any) => {
      this.transData = res.results || [];;
      this.totalRecords = res.count;
    })
  }
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

  onSearch(): void {
    this.getTransactions(this.supplierId, this.getQueryParams(), 1, this.pageSize);
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
