import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AccService } from '../@services/acc.service';
import { Router } from '@angular/router';
import { ConfirmationPopUpService } from '../../../shared/services/confirmation-pop-up.service';
import { MenuItem } from 'primeng/api';
import { DropdownsService } from '../../../core/services/dropdowns.service';
import { AssetsComponent } from './acc-charts/assets/assets.component';
import { LiabilitiesComponent } from './acc-charts/liabilities/liabilities.component';
import { RevenueComponent } from './acc-charts/revenue/revenue.component';
import { ExpensesComponent } from './acc-charts/expenses/expenses.component';

@Component({
  selector: 'app-acc-dashboard',
  imports: [SharedModule, AssetsComponent , LiabilitiesComponent, RevenueComponent, ExpensesComponent],
  templateUrl: './acc-dashboard.component.html',
  styleUrl: './acc-dashboard.component.scss'
})
export class AccDashboardComponent {
  colors: any[] = [];
    cols: any[] = [];
    branches: any[] = [];
    filterForm!: FormGroup;
    totalRecords: number = 0;
    pageSize: number = 10;
    first: number = 0;
  
    constructor(
      private _accService: AccService,
      private _formBuilder: FormBuilder,
      private _dropdownService:DropdownsService
    ) { }
  
    ngOnInit(): void {
      this.cols = [
        { field: 'name', header: 'Account Name' },
        { field: 'balance', header: 'Account Balance' },
      ];
      this.filterForm = this._formBuilder.group({
        search: '',
        branch: '',
        lines__journal_entry__date__range: '',
      });
      this.getAcc();
    
    this._dropdownService.getBranches().subscribe(data => {
      this.branches = data?.results;
    });
  }
  
    // Get designers with filtering and pagination
    getAcc( search:any='',page: number = 1, pageSize: number = 10): void {
      //const searchParams = new URLSearchParams(this.filterForm.value).toString() || '';
  
      // Correct pagination parameters and make API call
      this._accService.getAccDashboard(this.filterForm?.value?.search || '', page, pageSize).subscribe(res => {
        this.colors = res;
      //  this.totalRecords = res?.count;  // Ensure the total count is updated
      });
    }
    loadAcc(event: any): void {
    const page = event.first / event.rows + 1;
    const pageSize = event.rows;
  
    this.first = event.first;
    this.pageSize = pageSize;
  
    this._accService.getAccDashboard(this.filterForm?.value?.search || '',page,pageSize)
      .subscribe((res) => {
        this.colors = res;
      //  this.totalRecords = res.count;
      });
  }
  selectedProduct: any;

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
  
    this.getAcc(queryParams, 1, 10);
  }
  
}
