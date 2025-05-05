import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InventoryService } from '../@services/inventory.service';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationPopUpService } from '../../../shared/services/confirmation-pop-up.service';
import { SharedModule } from '../../../shared/shared.module';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-units',
  imports: [SharedModule , RouterLink],
  templateUrl: './units.component.html',
  styleUrl: './units.component.scss'
})
export class UnitsComponent {
  users: any[] = [];
  cols: any[] = [];
  filterForm!: FormGroup;
  totalRecords: number = 0;
  pageSize: number = 10;
  first: number = 0;

  constructor(
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder,
    private _router:Router,
    private _confirmPopUp:ConfirmationPopUpService
  ) { }

  ngOnInit(): void {
    this.cols = [
      { field: 'name', header: 'Unit Name' },
      {
        field: 'unit_conversions',
        header: 'Parent Unit',
        body: (row: any) =>
          `${row.unit_conversions?.parent_unit ?? 'No Conversions'} (Factor: ${row.unit_conversions?.conversion_factor ?? '-'})`
      },
    ];
    this.filterForm = this._formBuilder.group({
      search: '',
    });
    this.getUnits();
  }

  // Get users with filtering and pagination
  getUnits(page: number = 1, pageSize: number = 10): void {
    //const searchParams = new URLSearchParams(this.filterForm.value).toString() || '';

    // Correct pagination parameters and make API call
    this._inventoryService.getUnits(this.filterForm?.value?.search || '', page, pageSize).subscribe(res => {
      this.users = res?.results;
      this.totalRecords = res?.count;  // Ensure the total count is updated
    });
  }
loadUsers(event: any): void {
  const page = event.first / event.rows + 1;
  const pageSize = event.rows;

  this.first = event.first;
  this.pageSize = pageSize;

  this._inventoryService.getUnits(this.filterForm?.value?.search || '',page,pageSize)
    .subscribe((res) => {
      this.users = res.results;
      this.totalRecords = res.count;
    });
}
selectedProduct: any;

unitsMenuItems: MenuItem[] = [
  {
    label: 'Edit',
    icon: 'pi pi-fw pi-pen-to-square',
    command: () => this.editUser(this.selectedProduct)
  },
  {
    label: 'Delete',
    icon: 'pi pi-fw pi-trash',
    command: () => this.deleteUnit(this.selectedProduct)
  }
  
];

editUser(user: any) {
  this._router.navigate([`inventory/unit/edit/${user?.id}`]);
}
deleteUnit(user:any){
  this._inventoryService.deleteUnit(user?.id).subscribe()
}
showConfirmDelete(user: any) {
  this._confirmPopUp.confirm({
    message: 'Do you want to delete this item?',
    header: 'Confirm Delete',
    onAccept: () => {
      this.deleteUnit(user);
    },
    target: user?.id
  });
}
}
