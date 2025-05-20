import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SettingsService } from '../@services/settings.service';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationPopUpService } from '../../../shared/services/confirmation-pop-up.service';
import { MenuItem } from 'primeng/api';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-payment-options',
  imports: [SharedModule, RouterLink],
  templateUrl: './payment-options.component.html',
  styleUrl: './payment-options.component.scss'
})
export class PaymentOptionsComponent implements OnInit{
    brands: any[] = [];
    cols: any[] = [];
    filterForm!: FormGroup;
    totalRecords: number = 0;
    pageSize: number = 10;
    first: number = 0;
  
    constructor(
      private _settingService: SettingsService,
      private _formBuilder: FormBuilder,
      private _router:Router,
      private _confirmPopUp:ConfirmationPopUpService
    ) { }
  
    ngOnInit(): void {
      this.cols = [
        { field: 'name', header: 'Name' },
        { field: 'country', header: 'Country' },
        { field: 'tax_rate', header: 'tax' },
      ];
      this.filterForm = this._formBuilder.group({
        search: '',
      });
      this.getPaymentOptions();
    }
  
    // Get brands with filtering and pagination
    getPaymentOptions( search:any='',page: number = 1, pageSize: number = 10): void {
      //const searchParams = new URLSearchParams(this.filterForm.value).toString() || '';
  
      // Correct pagination parameters and make API call
      this._settingService.getPaymentOptions(this.filterForm?.value?.search || '', page, pageSize).subscribe(res => {
        this.brands = res?.results;
        this.totalRecords = res?.count;  // Ensure the total count is updated
      });
    }
  loadBrands(event: any): void {
    const page = event.first / event.rows + 1;
    const pageSize = event.rows;
  
    this.first = event.first;
    this.pageSize = pageSize;
  
    this._settingService.getPaymentOptions(this.filterForm?.value?.search || '',page,pageSize)
      .subscribe((res) => {
        this.brands = res.results;
        this.totalRecords = res.count;
      });
  }
  selectedProduct: any;
  
  BrandsMenuItems: MenuItem[] = [
    {
      label: 'Edit',
      icon: 'pi pi-fw pi-pen-to-square',
      command: () => this.editTaxRate(this.selectedProduct)
    },
    {
      label: 'Delete',
      icon: 'pi pi-fw pi-trash',
      command: () => this.showConfirmDelete(this.selectedProduct)
    }
    
  ];
  
  editTaxRate(user: any) {
    this._router.navigate([`setting/payment-option/edit/${user?.id}`]);
  }
  deletePaymentOption(user:any){
    this._settingService.deletePaymentOption(user?.id).subscribe(res=>{
      if(res){
        this.getPaymentOptions()
      }
    })
  }
  showConfirmDelete(user: any) {
    this._confirmPopUp.confirm({
      message: 'Do you want to delete this item?',
      header: 'Confirm Delete',
      onAccept: () => {
        this.deletePaymentOption(user);
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
  
    this.getPaymentOptions(queryParams, 1, 10);
  }

}
