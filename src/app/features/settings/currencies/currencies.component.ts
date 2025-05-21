import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SettingsService } from '../@services/settings.service';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationPopUpService } from '../../../shared/services/confirmation-pop-up.service';
import { MenuItem } from 'primeng/api';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-currencies',
  imports: [SharedModule, RouterLink],
  templateUrl: './currencies.component.html',
  styleUrl: './currencies.component.scss'
})
export class CurrenciesComponent implements OnInit{
    Branches: any[] = [];
    cols: any[] = [];
    filterForm!: FormGroup;
    totalRecords: number = 0;
    pageSize: number = 10;
    first: number = 0;
  
    constructor(
      private _sttingService: SettingsService,
      private _formBuilder: FormBuilder,
      private _router:Router,
      private _confirmPopUp:ConfirmationPopUpService
    ) { }
  
    ngOnInit(): void {
      this.cols = [
        { field: 'name', header: 'Name' },
        { field: 'code', header: 'code' },
        { field: 'decimal_point', header: 'decimal point' },
        { field: 'symbol', header: 'symbol' },
      ];
      this.filterForm = this._formBuilder.group({
        search: '',
      });
      this.getCurrencies();
    }
  
    // Get Branches with filtering and pagination
    getCurrencies( search:any='',page: number = 1, pageSize: number = 10): void {
      //const searchParams = new URLSearchParams(this.filterForm.value).toString() || '';
  
      // Correct pagination parameters and make API call
      this._sttingService.getCurrencies(this.filterForm?.value?.search || '', page, pageSize).subscribe(res => {
        this.Branches = res?.results;
        this.totalRecords = res?.count;  // Ensure the total count is updated
      });
    }
  loadBranches(event: any): void {
    const page = event.first / event.rows + 1;
    const pageSize = event.rows;
  
    this.first = event.first;
    this.pageSize = pageSize;
  
    this._sttingService.getCurrencies(this.filterForm?.value?.search || '',page,pageSize)
      .subscribe((res) => {
        this.Branches = res.results;
        this.totalRecords = res.count;
      });
  }
  selectedProduct: any;
  
  BranchesMenuItems: MenuItem[] = [
    {
      label: 'Edit',
      icon: 'pi pi-fw pi-pen-to-square',
      command: () => this.editBrand(this.selectedProduct)
    },
    {
      label: 'Delete',
      icon: 'pi pi-fw pi-trash',
      command: () => this.showConfirmDelete(this.selectedProduct)
    }
    
  ];
  
  editBrand(user: any) {
    this._router.navigate([`setting/currency/edit/${user?.id}`]);
  }
  deleteCurrency(user:any){
    this._sttingService.deleteCurrency(user?.id).subscribe(res=>{
      if(res){
        this.getCurrencies()
      }
    })
  }
  showConfirmDelete(user: any) {
    this._confirmPopUp.confirm({
      message: 'Do you want to delete this item?',
      header: 'Confirm Delete',
      onAccept: () => {
        this.deleteCurrency(user);
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
  
    this.getCurrencies(queryParams, 1, 10);
  }
  }
