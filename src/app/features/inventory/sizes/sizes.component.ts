import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InventoryService } from '../@services/inventory.service';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationPopUpService } from '../../../shared/services/confirmation-pop-up.service';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-sizes',
  imports: [SharedModule, RouterLink],
  templateUrl: './sizes.component.html',
  styleUrl: './sizes.component.scss'
})
export class SizesComponent {
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
      { field: 'name', header: 'Size Name' },
    ];
    this.filterForm = this._formBuilder.group({
      search: '',
    });
    this.getSizes();
  }

  // Get users with filtering and pagination
  getSizes(page: number = 1, pageSize: number = 10): void {
    //const searchParams = new URLSearchParams(this.filterForm.value).toString() || '';

    // Correct pagination parameters and make API call
    this._inventoryService.getSizes(this.filterForm?.value?.search || '', page, pageSize).subscribe(res => {
      this.users = res?.results;
      this.totalRecords = res?.count;  // Ensure the total count is updated
    });
  }
loadSizes(event: any): void {
  const page = event.first / event.rows + 1;
  const pageSize = event.rows;

  this.first = event.first;
  this.pageSize = pageSize;

  this._inventoryService.getSizes(this.filterForm?.value?.search || '',page,pageSize)
    .subscribe((res) => {
      this.users = res.results;
      this.totalRecords = res.count;
    });
}
selectedProduct: any;

puritiesMenuItems: MenuItem[] = [
  {
    label: 'Edit',
    icon: 'pi pi-fw pi-pen-to-square',
    command: () => this.editSize(this.selectedProduct)
  },
  {
    label: 'Delete',
    icon: 'pi pi-fw pi-trash',
    command: () => this.deleteSize(this.selectedProduct)
  }
  
];

editSize(user: any) {
  this._router.navigate([`inventory/size/edit/${user?.id}`]);
}
deleteSize(user:any){
  this._inventoryService.deleteSize(user?.id).subscribe()
}
showConfirmDelete(user: any) {
  this._confirmPopUp.confirm({
    message: 'Do you want to delete this item?',
    header: 'Confirm Delete',
    onAccept: () => {
      this.deleteSize(user);
    },
    target: user?.id
  });
}

}
