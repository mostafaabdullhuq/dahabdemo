import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationPopUpService } from '../../../shared/services/confirmation-pop-up.service';
import { PermissionService } from '../../../core/services/permission.service';
import { AccService } from '../@services/acc.service';
import { MenuItem } from 'primeng/api';
import { DropdownsService } from '../../../core/services/dropdowns.service';

@Component({
  selector: 'app-view-acc-ledger',
  imports: [SharedModule],
  templateUrl: './view-acc-ledger.component.html',
  styleUrl: './view-acc-ledger.component.scss'
})
export class ViewAccLedgerComponent {
  ledgers: any[] = [];
  cols: any[] = [];
  filterForm!: FormGroup;
  totalRecords: number = 0;
  pageSize: number = 10;
  first: number = 0;
  accId:any;
  accounts:any;
  branches:any;
  localAccData:any;
  constructor(
    private _accService: AccService,
    private _formBuilder: FormBuilder,
    public permissionService:PermissionService,
    private _activeRoute:ActivatedRoute,
    private _dropdownService:DropdownsService
  ) { }

  ngOnInit(): void {
    const accId = this._activeRoute.snapshot.paramMap.get('id');
    console.log(accId);
    if(accId)
      this.accId = accId;
      if (this.accId) {
        this.loadLedgers(this.accId);
      }
    this.cols = [
      { field: "created_at", header: "Created At" },
      { field: "description", header: "description" },
      { field: "debit", header: "debit" },
      { field: "credit", header: "credit" },
    ];
    this.filterForm = this._formBuilder.group({
      search: '',
      branch: '',
      account: '',
      date_range:''
    });
    this.getAccLedgerById(accId);
 this._dropdownService.getMainAccounts().subscribe(data => {
      this.accounts = data;
    });
    this._dropdownService.getBranches().subscribe(data => {
      this.branches = data?.results;
    });
  }

  // Get customers with filtering and pagination
  getAccLedgerById(id: any , search:string = ''): void {
    //const searchParams = new URLSearchParams(this.filterForm.value).toString() || '';
    // Correct pagination parameters and make API call
    this._accService.getAccLedgerById(this.accId,search).subscribe(res => {
      this.ledgers = res?.journal_entries?.lines;
      //this.totalRecords = res?.count;  // Ensure the total count is updated
    });
  }
  loadLedgers(event: any): void {
    const page = event.first / event.rows + 1;
    const pageSize = event.rows;

    this.first = event.first;
    this.pageSize = pageSize;

    this._accService.getAccLedgerById(this.filterForm?.value?.search || '', page)
      .subscribe((res) => {
        this.ledgers = res?.journal_entries?.lines;
        this.totalRecords = res.count;
      });
  }
  selectedProduct: any;
  
onSearch(): void {
  const formValues = this.filterForm.value;
  const queryParts: string[] = [];

  Object.keys(formValues).forEach(key => {
    const value = formValues[key];

    if (key === 'date_range' && Array.isArray(value) && value.length === 2) {
      const [startDate, endDate] = value;
      const formattedStart = this.formatDate(startDate);
      const formattedEnd = this.formatDate(endDate);
      const formattedRange = `${formattedStart} - ${formattedEnd}`;
      queryParts.push(`date_range=${encodeURIComponent(formattedRange).replace(/%20/g, '+')}`);
    } else if (value !== null && value !== '' && value !== undefined) {
      const encodedKey = encodeURIComponent(key);
      const encodedValue = encodeURIComponent(value).replace(/%20/g, '+');
      queryParts.push(`${encodedKey}=${encodedValue}`);
    }
  });

  const queryParams = queryParts.join('&');
  this.getAccLedgerById(this.accId, queryParams);
}

// Format Date to DD-MM-YYYY
private formatDate(date: Date): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}
}
