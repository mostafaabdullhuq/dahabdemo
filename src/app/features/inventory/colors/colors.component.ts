import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InventoryService } from '../@services/inventory.service';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationPopUpService } from '../../../shared/services/confirmation-pop-up.service';
import { MenuItem } from 'primeng/api';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-colors',
  imports: [SharedModule, RouterLink],
  templateUrl: './colors.component.html',
  styleUrl: './colors.component.scss'
})
export class ColorsComponent {
  colors: any[] = [];
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
      { field: 'name', header: 'Color Name' },
    ];
    this.filterForm = this._formBuilder.group({
      search: '',
    });
    this.getColors();
  }

  // Get designers with filtering and pagination
  getColors(search: any = '', page: number = 1, pageSize: number = 10): void {
    //const searchParams = new URLSearchParams(this.filterForm.value).toString() || '';

    // Correct pagination parameters and make API call
    this._inventoryService.getColors(this.filterForm?.value?.search || '', page, pageSize).subscribe(res => {
      this.colors = res?.results;
      this.totalRecords = res?.count;  // Ensure the total count is updated
    });
  }
  loadColors(event: any): void {
    const page = event.first / event.rows + 1;
    const pageSize = event.rows;

    this.first = event.first;
    this.pageSize = pageSize;

    this._inventoryService.getColors(this.filterForm?.value?.search || '', page, pageSize)
      .subscribe((res) => {
        this.colors = res.results;
        this.totalRecords = res.count;
      });
  }
  selectedProduct: any;

  colorsMenuItems: MenuItem[] = [
    {
      label: 'Edit',
      icon: 'pi pi-fw pi-pen-to-square',
      command: () => this.editColor(this.selectedProduct)
    },
    {
      label: 'Delete',
      icon: 'pi pi-fw pi-trash',
      command: () => this.showConfirmDelete(this.selectedProduct)
    }

  ];

  editColor(color: any) {
    this._router.navigate([`inventory/color/edit/${color?.id}`]);
  }
  deleteColor(color: any) {
    this._inventoryService.deleteColor(color?.id).subscribe(res => {
      this.getColors()

    })
  }
  showConfirmDelete(color: any) {
    this._confirmPopUp.confirm({
      message: 'Do you want to delete this item?',
      header: 'Confirm Delete',
      onAccept: () => {
        this.deleteColor(color);
      },
      target: color?.id
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

    this.getColors(queryParams, 1, 10);
  }
}
