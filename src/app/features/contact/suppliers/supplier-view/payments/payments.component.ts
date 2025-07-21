import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ContactService } from '../../../@services/contact.service';
import { SharedModule } from '../../../../../shared/shared.module';
import { MenuItem } from 'primeng/api';
import { ToasterMsgService } from '../../../../../core/services/toaster-msg.service';

@Component({
  selector: 'app-payments',
  imports: [SharedModule],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.scss'
})
export class PaymentsComponent {
  transData: any = [];
  @Input() customerId: any = '';
  cols: any[] = [];
  totalRecords: number = 0;
  pageSize: number = 10;
  first: number = 0;
  filterForm!: FormGroup;
  constructor(
    private _contactService: ContactService,
    private _formBuilder: FormBuilder,
    private _toaster: ToasterMsgService
  ) { }

  ngOnInit(): void {
    if (this.customerId) {
      this.getPayments(this.customerId)
    }
    this.cols = [
      { field: "payment_date", header: "Payment Date" },
      { field: "total_amount", header: "Total Amount" },
      { field: "salesman_name", header: "Salesman Name" },
      { field: "branch_name", header: "Branch Name" },
      { field: "payment_method_name", header: "Payment Method" },
      { field: "total_weight", header: "Total Weight" },
      { field: "reference_number", header: "Reference Number" },
    ];
    this.filterForm = this._formBuilder.group({
      search: '',
      created_at__gte: '',
      created_at__lte: '',
    });
    this.getPayments(this.customerId);

  }
  getPayments(id: any, search: string = '', page: number = 1, pageSize: number = 10) {
    this._contactService.getsupplierPayments(id, search, page, pageSize)?.subscribe((res: any) => {
      this.transData = res.results || [];
      this.totalRecords = res.count;
    })
  }

  loadCustomersTrans(event: any): void {
    const page = Math.floor(event.first / event.rows) + 1;
    const pageSize = event.rows;

    this.first = event.first;
    this.pageSize = pageSize;
    this._contactService.getsupplierPayments(this.customerId, this.getQueryParams(), page, pageSize)?.subscribe((res: any) => {
      this.transData = res.results || [];;
      this.totalRecords = res.count;
    })
  }
  selectedPayment: any;

  customersMenuItems: MenuItem[] = [
    {
      label: 'Edit',
      icon: 'pi pi-fw pi-pen-to-square',
      command: () => this.editPayment()

    },
    {
      label: 'View',
      icon: 'pi pi-fw pi-eye',
      command: () => this.viewPayment()
    },
    {
      label: 'Delete',
      icon: 'pi pi-fw pi-trash',
      command: () => this.deletePayment()
    }
  ];


  private editPayment() {
    console.log("selected: ", this.selectedPayment);
  }

  private viewPayment() {
    console.log("selected: ", this.selectedPayment);
  }

  private deletePayment() {
    if (!this.selectedPayment?.id) return

    this._contactService.deletePurchasePayment(this.selectedPayment.id).subscribe(res => {
      this._toaster.showSuccess("Payment deleted successfully");
      this.onSearch();
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
