import { Component } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from '../../@services/inventory.service';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationPopUpService } from '../../../../shared/services/confirmation-pop-up.service';
import { MenuItem } from 'primeng/api';
import { DropdownsService } from '../../../../core/services/dropdowns.service';

@Component({
  selector: 'app-transfer-list',
  imports: [SharedModule, RouterLink],
  templateUrl: './transfer-list.component.html',
  styleUrl: './transfer-list.component.scss'
})
export class TransferListComponent {
  transfers: any[] = [];
  cols: any[] = [];
  filterForm!: FormGroup;
  totalRecords: number = 0;
  pageSize: number = 10;
  first: number = 0;
  branches: any[] = [];

  constructor(
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _confirmPopUp: ConfirmationPopUpService,
    private _dropDownService: DropdownsService
  ) { }

  ngOnInit(): void {
    this.cols = [
      { field: "id", header: "Reference Number" },
      { field: "current_branch_name", header: "Current Branch" },
      { field: "transfer_branch_name", header: "Transfer Branch" },
      { field: "stock_point_name", header: "Stock Point" },
      { field: "total_amount", header: "Total Amount" },
      { field: "created_at", header: "Created At" },
      {
        field: "status", header: "Status", body: (row: any) => {
          if (row?.status === 'pending') {
            return `<span class="badge rounded-pill text-bg-warning">Pending</span>`;
          } else if (row?.status === 'cancelled') {
            return `<span class="badge rounded-pill text-bg-danger">Cancelled</span>`;
          } else if (row?.status === 'approved') {
            return `<span class="badge rounded-pill text-bg-success">Completed</span>`;
          } else {
            return `<span>${row?.status || 'Unknown'}</span>`;
          }
        }
      },
      { field: "created_by", header: "Created By" },
    ];

    this.filterForm = this._formBuilder.group({
      search: '',
      branch: [null, [Validators.required]]
    });

    this._dropDownService.getBranches().subscribe(results => {
      this.branches = results?.results;
      if (this.branches.length) {
        this.filterForm.get("branch")?.setValue(this.branches[0].id);
        this.getCurrentBranchTransfers();
      }
    })
  }

  // Get users with filtering and pagination
  getCurrentBranchTransfers(page: number = 1, pageSize: number = 10): void {
    let branchId = this.filterForm.value?.branch;

    if (!branchId) return;

    this._inventoryService.getCurrentBranchTransactions(this.filterForm?.value?.search || '', branchId, page, pageSize).subscribe(res => {
      this.transfers = res?.results;
      this.totalRecords = res?.count;  // Ensure the total count is updated
    });
  }

  loadStockTransfer(event: any): void {
    const page = event.first / event.rows + 1;
    const pageSize = event.rows;

    this.first = event.first;
    this.pageSize = pageSize;

    this.getCurrentBranchTransfers(page, pageSize);
  }

  onSearch() {
    this.getCurrentBranchTransfers();
  }

  selectedProduct: any;

  transferMenuItems: MenuItem[] = [
    {
      label: 'Edit',
      icon: 'pi pi-fw pi-pen-to-square',
      command: () => this.editTransfer(this.selectedProduct)
    },
    {
      label: 'Delete',
      icon: 'pi pi-fw pi-trash',
      command: () => this.showConfirmDelete(this.selectedProduct)
    }

  ];

  editTransfer(user: any) {
    this._router.navigate([`stock-transfer/edit/${user?.id}`]);
  }

  deleteTransferBranch(user: any) {
    this._inventoryService.deleteTransferBranch(user?.id).subscribe(res => {
      if (res) {
        this.getCurrentBranchTransfers()
      }
    })
  }

  showConfirmDelete(user: any) {
    this._confirmPopUp.confirm({
      message: 'Do you want to delete this item?',
      header: 'Confirm Delete',
      onAccept: () => {
        this.deleteTransferBranch(user);
      },
      target: user?.id
    });
  }
}
