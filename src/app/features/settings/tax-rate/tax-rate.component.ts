import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../@services/settings.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationPopUpService } from '../../../shared/services/confirmation-pop-up.service';
import { MenuItem } from 'primeng/api';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-tax-rate',
  imports: [SharedModule , RouterLink],
  templateUrl: './tax-rate.component.html',
  styleUrl: './tax-rate.component.scss'
})
export class TaxRateComponent implements OnInit{
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
        { field: 'country', header: 'Name' },
        { field: 'country_tax_rate', header: 'tax' },
      ];
      this.filterForm = this._formBuilder.group({
        search: '',
      });
      this.getTaxRatees();
    }
  
    // Get brands with filtering and pagination
    getTaxRatees( search:any='',page: number = 1, pageSize: number = 10): void {
      //const searchParams = new URLSearchParams(this.filterForm.value).toString() || '';
  
      // Correct pagination parameters and make API call
      this._settingService.getTaxRatees(this.filterForm?.value?.search || '', page, pageSize).subscribe(res => {
        this.brands = res?.results;
        this.totalRecords = res?.count;  // Ensure the total count is updated
      });
    }
  loadBrands(event: any): void {
    const page = event.first / event.rows + 1;
    const pageSize = event.rows;
  
    this.first = event.first;
    this.pageSize = pageSize;
  
    this._settingService.getTaxRatees(this.filterForm?.value?.search || '',page,pageSize)
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
    this._router.navigate([`setting/tax-rate/edit/${user?.id}`]);
  }
  deleteTaxRate(user:any){
    this._settingService.deleteTaxRate(user?.id).subscribe(res=>{
      if(res){
        this.getTaxRatees()
      }
    })
  }
  showConfirmDelete(user: any) {
    this._confirmPopUp.confirm({
      message: 'Do you want to delete this item?',
      header: 'Confirm Delete',
      onAccept: () => {
        this.deleteTaxRate(user);
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
  
    this.getTaxRatees(queryParams, 1, 10);
  }
  }
