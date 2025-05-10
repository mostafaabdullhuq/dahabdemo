import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InventoryService } from '../@services/inventory.service';
import { SharedModule } from '../../../shared/shared.module';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationPopUpService } from '../../../shared/services/confirmation-pop-up.service';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-designer',
  imports: [SharedModule, RouterLink],
  templateUrl: './designer.component.html',
  styleUrl: './designer.component.scss'
})
export class DesignerComponent {
    designers: any[] = [];
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
        { field: 'name', header: 'Designer Name' },
      ];
      this.filterForm = this._formBuilder.group({
        search: '',
      });
      this.getDesigners();
    }
  
    // Get designers with filtering and pagination
    getDesigners( search:any='',page: number = 1, pageSize: number = 10): void {
      //const searchParams = new URLSearchParams(this.filterForm.value).toString() || '';
  
      // Correct pagination parameters and make API call
      this._inventoryService.getDesigners(this.filterForm?.value?.search || '', page, pageSize).subscribe(res => {
        this.designers = res?.results;
        this.totalRecords = res?.count;  // Ensure the total count is updated
      });
    }
  loadDesigners(event: any): void {
    const page = event.first / event.rows + 1;
    const pageSize = event.rows;
  
    this.first = event.first;
    this.pageSize = pageSize;
  
    this._inventoryService.getDesigners(this.filterForm?.value?.search || '',page,pageSize)
      .subscribe((res) => {
        this.designers = res.results;
        this.totalRecords = res.count;
      });
  }
  selectedProduct: any;
  
  designerMenuItems: MenuItem[] = [
    {
      label: 'Edit',
      icon: 'pi pi-fw pi-pen-to-square',
      command: () => this.editDesigner(this.selectedProduct)
    },
    {
      label: 'Delete',
      icon: 'pi pi-fw pi-trash',
      command: () => this.showConfirmDelete(this.selectedProduct)
    }
    
  ];
  
  editDesigner(user: any) {
    this._router.navigate([`inventory/designer/edit/${user?.id}`]);
  }
  deleteDesigner(user:any){
    this._inventoryService.deleteDesigner(user?.id).subscribe(res=>{
      if(res){
        this.getDesigners()
      }
    })
  }
  showConfirmDelete(user: any) {
    this._confirmPopUp.confirm({
      message: 'Do you want to delete this item?',
      header: 'Confirm Delete',
      onAccept: () => {
        this.deleteDesigner(user);
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
  
    this.getDesigners(queryParams, 1, 10);
  }
  }
