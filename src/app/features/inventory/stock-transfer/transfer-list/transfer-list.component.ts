import { Component } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InventoryService } from '../../@services/inventory.service';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationPopUpService } from '../../../../shared/services/confirmation-pop-up.service';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-transfer-list',
  imports: [SharedModule, RouterLink],
  templateUrl: './transfer-list.component.html',
  styleUrl: './transfer-list.component.scss'
})
export class TransferListComponent {
  users: any[] = [];
  cols: any[] = [];
  filterForm!: FormGroup;
  totalRecords: number = 0;
  pageSize: number = 10;
  first: number = 0;

  constructor(
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _confirmPopUp: ConfirmationPopUpService
  ) { }

  ngOnInit(): void {
    this.cols = [
      { field: "id", header: "Reference Number" },
      { field: "current_branch_name", header: "Current Branch" },
      { field: "transfer_branch", header: "Transfer Branch" },
      { field: "stock_point_name", header: "Stock Point" },
      { field: "total_amount", header: "Total Amount" },
      { field: "created_at", header: "Created At" },
      { field: "created_by", header: "Created By" },
    ];
    this.filterForm = this._formBuilder.group({
      search: '',
    });
    this.getTransferBranch();
  }

  // Get users with filtering and pagination
  getTransferBranch(page: number = 1, pageSize: number = 10): void {
    //const searchParams = new URLSearchParams(this.filterForm.value).toString() || '';

    // Correct pagination parameters and make API call
    this._inventoryService.getTransferBranch(this.filterForm?.value?.search || '', page, pageSize).subscribe(res => {
      this.users = res?.results;
      this.totalRecords = res?.count;  // Ensure the total count is updated
    });
  }

  loadStockTransfer(event: any): void {
    const page = event.first / event.rows + 1;
    const pageSize = event.rows;

    this.first = event.first;
    this.pageSize = pageSize;

    this._inventoryService.getTransferBranch(this.filterForm?.value?.search || '', page, pageSize)
      .subscribe((res) => {
        this.users = res.results;
        this.totalRecords = res.count;
      });
  }

  onSearch() {

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
        this.getTransferBranch()
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
