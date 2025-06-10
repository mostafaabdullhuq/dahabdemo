import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ContactService } from '../@services/contact.service';
import { ConfirmationPopUpService } from '../../../shared/services/confirmation-pop-up.service';
import { MenuItem } from 'primeng/api';
import { TransactionsComponent } from './customer-view/transactions/transactions.component';
import { CustomerViewComponent } from './customer-view/customer-view.component';
import { PermissionService } from '../../../core/services/permission.service';

@Component({
  selector: 'app-customers',
  imports: [SharedModule, RouterLink],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss'
})
export class CustomersComponent {
  customers: any[] = [];
  cols: any[] = [];
  filterForm!: FormGroup;
  totalRecords: number = 0;
  pageSize: number = 10;
  first: number = 0;

  constructor(
    private _contactService: ContactService,
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _confirmPopUp: ConfirmationPopUpService,
    public permissionService:PermissionService
  ) { }

  ngOnInit(): void {
    this.cols = [
      { field: "name", header: "Name" },
      { field: "email", header: "Email" },
      { field: "phone", header: "Phone" },
      { field: "address", header: "Address" },
      { field: "cpr", header: "CPR" },
      { field: "group_name", header: "Group" },
      { field: "created_at", header: "Created At" },
      { field: "created_by", header: "Created By" },
      { field: "business", header: "Business" },
    ];
    this.filterForm = this._formBuilder.group({
      search: '',
    });
    this.getCustomers();


    if (this.permissionService.hasPermission(69)) {
      this.customersMenuItems.push({
      label: 'Edit',
      icon: 'pi pi-fw pi-pen-to-square',
      command: () => this.editCustomer(this.selectedProduct)
    })
    }

    if (this.permissionService.hasPermission(68)) {
    this.customersMenuItems.push({
      label: 'View',
      icon: 'pi pi-fw pi-eye',
      command: () => this.viewTransactions(this.selectedProduct)
    })
    }
    if (this.permissionService.hasPermission(70)) {
    this.customersMenuItems.push({
      label: 'Delete',
      icon: 'pi pi-fw pi-trash',
      command: () => this.showConfirmDelete(this.selectedProduct)
    })
    }
  }

  // Get customers with filtering and pagination
  getCustomers(search: any = '', page: number = 1, pageSize: number = 10): void {
    //const searchParams = new URLSearchParams(this.filterForm.value).toString() || '';

    // Correct pagination parameters and make API call
    this._contactService.getCustomers(this.filterForm?.value?.search || '', page, pageSize).subscribe(res => {
      this.customers = res?.results;
      this.totalRecords = res?.count;  // Ensure the total count is updated
    });
  }
  loadCustomers(event: any): void {
    const page = event.first / event.rows + 1;
    const pageSize = event.rows;

    this.first = event.first;
    this.pageSize = pageSize;

    this._contactService.getCustomers(this.filterForm?.value?.search || '', page, pageSize)
      .subscribe((res) => {
        this.customers = res.results;
        this.totalRecords = res.count;
      });
  }
  selectedProduct: any;
customersMenuItems:MenuItem[]=[]
  
  viewTransactions(data: any) {
    this._router.navigate([`contact/customer-view/${data?.id}`])
  }
  editCustomer(user: any) {
    this._router.navigate([`contact/customer/edit/${user?.id}`]);
  }
  deleteCustomer(user: any) {
    this._contactService.deleteCustomer(user?.id).subscribe(res=>{
      if(res){
        this.loadCustomers(1)
      }
    })
  }
  showConfirmDelete(user: any) {
    this._confirmPopUp.confirm({
      message: 'Do you want to delete this item?',
      header: 'Confirm Delete',
      onAccept: () => {
        this.deleteCustomer(user);
      },
      target: user?.id
    });
  }
  onSearch(): void {
    const formValues = this.filterForm.value;

    const queryParts: string[] = [];

    Object.keys(formValues).forEach(key => {
      const value = formValues[key];
      if (value !== null && value !== '' && value !== undefined) {
        const encodedKey = encodeURIComponent(key);
        const encodedValue = encodeURIComponent(value).replace(/%20/g, '+'); // Replace space with +
        queryParts.push(`${encodedKey}=${encodedValue}`);
      }
    });

    const queryParams = queryParts.join('&');

    this.getCustomers(queryParams, 1, 10);
  }
}
