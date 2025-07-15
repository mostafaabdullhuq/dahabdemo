import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InventoryService } from '../@services/inventory.service';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationPopUpService } from '../../../shared/services/confirmation-pop-up.service';
import { MenuItem } from 'primeng/api';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-stock-point',
  imports: [SharedModule, RouterLink],
  templateUrl: './stock-point.component.html',
  styleUrl: './stock-point.component.scss'
})
export class StockPointComponent {
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
      { field: 'name', header: 'Stock Point Name' },
    ];
    this.filterForm = this._formBuilder.group({
      search: '',
    });
    this.getStockPoints();
  }

  // Get users with filtering and pagination
  getStockPoints(search: any = '', page: number = 1, pageSize: number = 10): void {
    //const searchParams = new URLSearchParams(this.filterForm.value).toString() || '';

    // Correct pagination parameters and make API call
    this._inventoryService.getStockPoints(this.filterForm?.value?.search || '', page, pageSize).subscribe(res => {
      this.users = res?.results;
      this.totalRecords = res?.count;  // Ensure the total count is updated
    });
  }
  loadStockPoints(event: any): void {
    const page = event.first / event.rows + 1;
    const pageSize = event.rows;

    this.first = event.first;
    this.pageSize = pageSize;

    this._inventoryService.getStockPoints(this.filterForm?.value?.search || '', page, pageSize)
      .subscribe((res) => {
        this.users = res.results;
        this.totalRecords = res.count;
      });
  }
  selectedProduct: any;

  stockpointsMenuItems: MenuItem[] = [
    {
      label: 'Edit',
      icon: 'pi pi-fw pi-pen-to-square',
      command: () => this.editStockPoint(this.selectedProduct)
    },
    {
      label: 'Delete',
      icon: 'pi pi-fw pi-trash',
      command: () => this.showConfirmDelete(this.selectedProduct)
    }

  ];

  editStockPoint(user: any) {
    this._router.navigate([`inventory/stockpoint/edit/${user?.id}`]);
  }
  deleteStockPoint(user: any) {
    this._inventoryService.deleteStockPoint(user?.id).subscribe(res => {
      this.getStockPoints()
    })
  }
  showConfirmDelete(user: any) {
    this._confirmPopUp.confirm({
      message: 'Do you want to delete this item?',
      header: 'Confirm Delete',
      onAccept: () => {
        this.deleteStockPoint(user);
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

    this.getStockPoints(queryParams, 1, 10);
  }
}
