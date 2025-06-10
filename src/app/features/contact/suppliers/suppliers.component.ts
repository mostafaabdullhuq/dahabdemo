import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ContactService } from '../@services/contact.service';
import { ConfirmationPopUpService } from '../../../shared/services/confirmation-pop-up.service';
import { MenuItem } from 'primeng/api';
import { PermissionService } from '../../../core/services/permission.service';

@Component({
  selector: 'app-suppliers',
  imports: [SharedModule ,RouterLink],
  templateUrl: './suppliers.component.html',
  styleUrl: './suppliers.component.scss'
})
export class SuppliersComponent implements OnInit{
    suppliers: any[] = [];
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
    { field: "land_line", header: "Land Line" },
    { field: "tax_number", header: "Tax Number" },
    { field: "cpr", header: "CPR" },
    { field: "address", header: "Address" },
    { field: "opening_balance", header: "Opening Balance" },
    { field: "opening_balance_date", header: "Opening Balance Date" },
      ];
      this.filterForm = this._formBuilder.group({
        search: '',
      });
      this.getSuppliers();
      if (this.permissionService.hasPermission(73)) {
        this.suppliersMenuItems.push({
          label: 'Edit',
          icon: 'pi pi-fw pi-pen-to-square',
          command: () => this.editSupplier(this.selectedProduct)
        })
      }
      if (this.permissionService.hasPermission(71)) {
        this.suppliersMenuItems.push({
        label: 'View',
        icon: 'pi pi-fw pi-eye',
        command: () => this.viewTransactions(this.selectedProduct)
      })
      }
      if (this.permissionService.hasPermission(74)) {
        this.suppliersMenuItems.push({
        label: 'Delete',
        icon: 'pi pi-fw pi-trash',
        command: () => this.showConfirmDelete(this.selectedProduct)
      })
      }
    }
  
    // Get suppliers with filtering and pagination
    getSuppliers(search: any = '', page: number = 1, pageSize: number = 10): void {
      //const searchParams = new URLSearchParams(this.filterForm.value).toString() || '';
  
      // Correct pagination parameters and make API call
      this._contactService.getSuppliers(this.filterForm?.value?.search || '', page, pageSize).subscribe(res => {
        this.suppliers = res?.results;
        this.totalRecords = res?.count;  // Ensure the total count is updated
      });
    }
    loadsuppliers(event: any): void {
      const page = event.first / event.rows + 1;
      const pageSize = event.rows;
  
      this.first = event.first;
      this.pageSize = pageSize;
  
      this._contactService.getSuppliers(this.filterForm?.value?.search || '', page, pageSize)
        .subscribe((res) => {
          this.suppliers = res.results;
          this.totalRecords = res.count;
        });
    }
    selectedProduct: any;
  
    suppliersMenuItems: MenuItem[] = [];
  
    editSupplier(user: any) {
      this._router.navigate([`contact/supplier/edit/${user?.id}`]);
    }
    deleteSupplier(user: any) {
      this._contactService.deleteSupplier(user?.id).subscribe(res=>{
        if(res){
          this.getSuppliers()
        }
      })
    }
    showConfirmDelete(user: any) {
      this._confirmPopUp.confirm({
        message: 'Do you want to delete this item?',
        header: 'Confirm Delete',
        onAccept: () => {
          this.deleteSupplier(user);
        },
        target: user?.id
      });
    }
    viewTransactions(data: any) {
      this._router.navigate([`contact/supplier-view/${data?.id}`])
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
  
      this.getSuppliers(queryParams, 1, 10);
    }
  }
