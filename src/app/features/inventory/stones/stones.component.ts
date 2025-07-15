import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InventoryService } from '../@services/inventory.service';
import { ConfirmationPopUpService } from '../../../shared/services/confirmation-pop-up.service';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-stones',
  imports: [SharedModule, RouterLink],
  templateUrl: './stones.component.html',
  styleUrl: './stones.component.scss'
})
export class StonesComponent {
  stones: any[] = [];
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
      { field: 'name', header: 'Designer Name' },
    ];
    this.filterForm = this._formBuilder.group({
      search: '',
    });
    this.getStones();
  }

  // Get designers with filtering and pagination
  getStones(search: any = '', page: number = 1, pageSize: number = 10): void {
    //const searchParams = new URLSearchParams(this.filterForm.value).toString() || '';

    // Correct pagination parameters and make API call
    this._inventoryService.getStones(this.filterForm?.value?.search || '', page, pageSize).subscribe(res => {
      this.stones = res?.results;
      this.totalRecords = res?.count;  // Ensure the total count is updated
    });
  }
  loadStones(event: any): void {
    const page = event.first / event.rows + 1;
    const pageSize = event.rows;

    this.first = event.first;
    this.pageSize = pageSize;

    this._inventoryService.getStones(this.filterForm?.value?.search || '', page, pageSize)
      .subscribe((res) => {
        this.stones = res.results;
        this.totalRecords = res.count;
      });
  }
  selectedProduct: any;

  stoneMenuItems: MenuItem[] = [
    {
      label: 'Edit',
      icon: 'pi pi-fw pi-pen-to-square',
      command: () => this.editStone(this.selectedProduct)
    },
    {
      label: 'Delete',
      icon: 'pi pi-fw pi-trash',
      command: () => this.showConfirmDelete(this.selectedProduct)
    }

  ];

  editStone(user: any) {
    this._router.navigate([`inventory/stone/edit/${user?.id}`]);
  }
  deleteStone(user: any) {
    this._inventoryService.deleteStone(user?.id).subscribe(res => {
      this.getStones()
    })
  }
  showConfirmDelete(user: any) {
    this._confirmPopUp.confirm({
      message: 'Do you want to delete this item?',
      header: 'Confirm Delete',
      onAccept: () => {
        this.deleteStone(user);
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

    this.getStones(queryParams, 1, 10);
  }
}
