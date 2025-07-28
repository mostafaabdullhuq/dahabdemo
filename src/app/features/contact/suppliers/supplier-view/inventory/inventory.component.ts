import { Component, Input } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ContactService } from '../../../@services/contact.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SharedModule } from '../../../../../shared/shared.module';

@Component({
  selector: 'app-inventory',
  imports: [SharedModule],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss'
})
export class TransactionsComponent {
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
        field: "tag_number",
        header: "Tag Number"
      },
      {
        field: "metal_rate",
        header: "Metal Rate"
      },
      {
        field: "metal_value",
        header: "Metal Value",
      },
      {
        field: "metal_weight",
        header: "Metal Weight"
      },
      {
        field: "purity",
        header: "Purity"
      },
      {
        field: "purity_rate",
        header: "Purity Rate",
      },
      {
        field: "category",
        header: "Category",
      },
      {
        field: "making_charge",
        header: "Making Charge",
      },
      {
        field: "retail_making_charge",
        header: "Retail Making Charge",
      },
      {
        field: "stone_name",
        header: "Stone Name",
      },
      {
        field: "weight",
        header: "Weight",
      },
      {
        field: "stone_value",
        header: "Stone Value",
      },
      {
        field: "stone_two_name",
        header: "Stone Two Name",
      },
      {
        field: "stone_two_weight",
        header: "Stone Two Weight",
      },
      {
        field: "stone_two_value",
        header: "Stone Two Value",
      },
      {
        field: "stone_one_retail",
        header: "Stone One Retail",
      },
      {
        field: "stone_two_retail",
        header: "Stone Two Retail",
      },
      {
        field: "gross_weight",
        header: "Gross Weight",
      },
      {
        field: "tax",
        header: "Tax",
      },
      {
        field: "size",
        header: "Size",
      },
      {
        field: "design_name",
        header: "Design Name",
      },
      {
        field: "country",
        header: "Country",
      },
      {
        field: "image",
        header: "Image",
      },
      {
        field: "description",
        header: "Description",
      },
      {
        field: "color",
        header: "Color",
      },
      {
        field: "line_total_amount",
        header: "Line Total Amount",
      },
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
    this._contactService.getSupplierInventory(id, search, page, pageSize)?.subscribe((res: any) => {
      this.transData = res.results || [];
      this.totalRecords = res.count;
    })
  }

  loadCustomersTrans(event: any): void {
    const page = Math.floor(event.first / event.rows) + 1;
    const pageSize = event.rows;

    this.first = event.first;
    this.pageSize = pageSize;
    this._contactService.getSupplierInventory(this.supplierId, this.getQueryParams(), page, pageSize)?.subscribe((res: any) => {
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
