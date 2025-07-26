import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsService } from '../@services/settings.service';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationPopUpService } from '../../../shared/services/confirmation-pop-up.service';
import { SharedModule } from '../../../shared/shared.module';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-branches',
  imports: [SharedModule, RouterLink],
  templateUrl: './branches.component.html',
  styleUrl: './branches.component.scss'
})
export class BranchesComponent {
  branches: any[] = [];
  cols: any[] = [];
  filterForm!: FormGroup;
  totalRecords: number = 0;
  pageSize: number = 10;
  first: number = 0;
  page: number = 1;
  selectedProduct: any;
  branchMenuItems: MenuItem[] = [
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

  constructor(
    private _sttingService: SettingsService,
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _confirmPopUp: ConfirmationPopUpService
  ) { }

  ngOnInit(): void {
    this.cols = [
      { field: 'name', header: 'Branch Name' },
    ];
    this.filterForm = this._formBuilder.group({
      search: '',
    });
    this.getBranches();
  }

  // Get Branches with filtering and pagination
  getBranches(search: any = '', page: number = 1, pageSize: number = 10): void {
    // Correct pagination parameters and make API call
    this._sttingService.getBranches(search || '', page, pageSize).subscribe(res => {
      this.branches = res?.results;
      this.totalRecords = res?.count;  // Ensure the total count is updated
    });
  }

  loadBranches(event: any): void {
    this.page = event.first / event.rows + 1;
    this.pageSize = event.rows;
    this.first = event.first;

    this.getBranches(this.filterForm?.value?.search, this.page, this.pageSize);
  }

  editBrand(user: any) {
    this._router.navigate([`setting/branch/edit/${user?.id}`]);
  }

  deleteBranch(user: any) {
    this._sttingService.deleteBranch(user?.id).subscribe(res => {
      this.getBranches(this.filterForm?.value?.search, this.page, this.pageSize);
    })
  }

  showConfirmDelete(user: any) {
    this._confirmPopUp.confirm({
      message: 'Do you want to delete this item?',
      header: 'Confirm Delete',
      onAccept: () => {
        this.deleteBranch(user);
      },
      target: user?.id
    });
  }

  onSearch(): void {
    this.getBranches(this.filterForm?.value?.search, this.page, this.pageSize);
  }
}
