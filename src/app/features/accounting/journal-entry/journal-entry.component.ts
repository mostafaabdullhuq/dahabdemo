import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AccService } from '../@services/acc.service';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationPopUpService } from '../../../shared/services/confirmation-pop-up.service';
import { MenuItem } from 'primeng/api';
import { SharedModule } from '../../../shared/shared.module';
import { DropdownsService } from '../../../core/services/dropdowns.service';

@Component({
  selector: 'app-journal-entry',
  imports: [SharedModule , RouterLink],
  templateUrl: './journal-entry.component.html',
  styleUrl: './journal-entry.component.scss'
})
export class JournalEntryComponent implements OnInit {
  transactions: any[] = [];
  suppliers: any[] = [];
  branches: any[] = [];
  sources: any[] = [
  { id: 'manual', name: 'Manual' },
  { id: 'system', name: 'System' },
  { id: 'pos', name: 'POS' },
  { id: 'purchase', name: 'Purchase' },
  { id: 'expense', name: 'Expense' },
  { id: 'other', name: 'Other' }
];
  statuses = [
  { id: 'draft', name: 'Draft' },
  { id: 'posted', name: 'Posted' }
];
  cols: any[] = [];
  filterForm!: FormGroup;
  totalRecords: number = 0;
  pageSize: number = 10;
  first: number = 0;

  constructor(
    private _accService: AccService,
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _confirmPopUp: ConfirmationPopUpService,
    private _dropdown:DropdownsService
  ) { }

  ngOnInit(): void {
    this.cols = [
      { field: "id", header: "Refrence Number" },
    { field: "journal_date", header: "journal date" },
    { field: "added_by", header: "added by" },
    { field: "type", header: "Type" },
    { field: "user_name", header: "User" },
    { field: "supplier", header: "Supplier" },
    { field: "customer", header: "Customer" },
    { field: "description", header: "Description" }
  ];
    this.filterForm = this._formBuilder.group({
      search: '',
      transaction_type:'',
      branch:'',
      payments__payment_method__id:'',
      supplier:'',
      type:'',
      date__range:'',
      status:'',
      source:''
    });
    this.getJournalEntry();
    this._dropdown.getBranches().subscribe(res=>{
      this.branches = res?.results
    })
    this._dropdown.getSuppliers().subscribe(res=>{
      this.suppliers = res?.results
    })
  }

  // Get transactions with filtering and pagination
  getJournalEntry(search: any = '', page: number = 1, pageSize: number = 10): void {
    //const searchParams = new URLSearchParams(this.filterForm.value).toString() || '';
    const params = `
    search=${this.filterForm?.value?.search}&
    status=${this.filterForm?.value?.status}&
    branch=${this.filterForm?.value?.branch}&
    type=${this.filterForm?.value?.type}&
    source=${this.filterForm?.value?.source}&
    date__range=${this.filterForm?.value?.date__range}&
    `
    // Correct pagination parameters and make API call
    this._accService.getJournalEntry(this.filterForm?.value?.search || '', page, pageSize).subscribe(res => {
      this.transactions = res?.results;
      this.totalRecords = res?.count;  // Ensure the total count is updated
    });
  }
  loadPurchases(event: any): void {
    const page = event.first / event.rows + 1;
    const pageSize = event.rows;

    this.first = event.first;
    this.pageSize = pageSize;

    this._accService.getJournalEntry(this.filterForm?.value?.search || '', page, pageSize)
      .subscribe((res) => {
        this.transactions = res.results;
        this.totalRecords = res.count;
      });
  }
  selectedTransaction: any;

  transactionsMenuItems: MenuItem[] = [
    {
      label: 'Edit',
      icon: 'pi pi-fw pi-pen-to-square',
      command: () => this.editJournalEntry(this.selectedTransaction)
    },
    {
      label: 'Delete',
      icon: 'pi pi-fw pi-trash',
      command: () => this.showConfirmDelete(this.selectedTransaction)
    }

  ];

  editJournalEntry(user: any) {
    this._router.navigate([`acc/journal-entry/edit/${user?.id}`]);
  }
  deleteJournalEntry(user: any) {
    this._accService.deleteJournalEntry(user?.id).subscribe(res => {
      if (res) {
        this.getJournalEntry()
      }
    })
  }
  showConfirmDelete(user: any) {
    this._confirmPopUp.confirm({
      message: 'Do you want to delete this item?',
      header: 'Confirm Delete',
      onAccept: () => {
        this.deleteJournalEntry(user);
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

    this.getJournalEntry(queryParams, 1, 10);
  }
}
