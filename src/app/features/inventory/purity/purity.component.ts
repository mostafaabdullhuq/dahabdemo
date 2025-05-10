import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InventoryService } from '../@services/inventory.service';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationPopUpService } from '../../../shared/services/confirmation-pop-up.service';
import { MenuItem } from 'primeng/api';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-purity',
  imports: [SharedModule , RouterLink],
  templateUrl: './purity.component.html',
  styleUrl: './purity.component.scss'
})
export class PurityComponent {
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
        { field: 'name', header: 'Purity Name' },
        {
          field: 'purity_value',
          header: 'Purity Value',
        },
      ];
      this.filterForm = this._formBuilder.group({
        search: '',
      });
      this.getPurity();
    }
  
    // Get users with filtering and pagination
    getPurity(page: number = 1, pageSize: number = 10): void {
      //const searchParams = new URLSearchParams(this.filterForm.value).toString() || '';
  
      // Correct pagination parameters and make API call
      this._inventoryService.getPurity(this.filterForm?.value?.search || '', page, pageSize).subscribe(res => {
        this.users = res?.results;
        this.totalRecords = res?.count;  // Ensure the total count is updated
      });
    }
  loadPurity(event: any): void {
    const page = event.first / event.rows + 1;
    const pageSize = event.rows;
  
    this.first = event.first;
    this.pageSize = pageSize;
  
    this._inventoryService.getPurity(this.filterForm?.value?.search || '',page,pageSize)
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
      command: () => this.editPurity(this.selectedProduct)
    },
    {
      label: 'Delete',
      icon: 'pi pi-fw pi-trash',
      command: () => this.showConfirmDelete(this.selectedProduct)
    }
    
  ];
  
  editPurity(user: any) {
    this._router.navigate([`inventory/purity/edit/${user?.id}`]);
  }
  deletePurity(user:any){
    this._inventoryService.deletePurity(user?.id).subscribe(res=>{
      if(res){
        this.getPurity()
      }
    })
  }
  showConfirmDelete(user: any) {
    this._confirmPopUp.confirm({
      message: 'Do you want to delete this item?',
      header: 'Confirm Delete',
      onAccept: () => {
        this.deletePurity(user);
      },
      target: user?.id
    });
  }
  }
