import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InventoryService } from '../@services/inventory.service';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationPopUpService } from '../../../shared/services/confirmation-pop-up.service';
import { MenuItem } from 'primeng/api';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-product-list',
  imports: [SharedModule,RouterLink],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent {
    products: any[] = [];
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
        { field: "name", header: "Name" },
    { field: "price", header: "Price" },
    { field: "category", header: "Category" },
    { field: "brand", header: "Brand" },
    { field: "unit", header: "Unit" },
    { field: "purity", header: "Purity" },
    { field: "size", header: "Size" },
    { field: "designer", header: "Designer" },
    { field: "created_at", header: "Created At" },
    { field: "total_quantity", header: "Stock" },
    { field: "tag_number", header: "Tag No" },
    { field: "stock_point", header: "Stock Point" },
      ];
      this.filterForm = this._formBuilder.group({
        search: '',
        stones: ['',],
        stone_kr: [''],
        stock_point: [''],
        is_active: [''],
        discount: [''],
        max_discount: [''],
        price: [''],
        tag_number: [''],
        making_charge: [''],
        color: [''],
        weight: [''],
        designer_id: [''],
        size_id: [''],
        purity_id: [''],
        unit_id: [''],
        brand_id: [''],
        category_id: [''],
        description: [''],
        name: [''],
      });
      this.getProducts();
    }
  
    getProducts(page: number = 1, pageSize: number = 10): void {
      //const searchParams = new URLSearchParams(this.filterForm.value).toString() || '';
  
      this._inventoryService.getProducts('', page, pageSize).subscribe(res => {
        this.products = res?.results;
        this.totalRecords = res?.count;  // Ensure the total count is updated
        console.log('Total records:', this.totalRecords);  // Debugging log
      });
    }
    loadProducts(event: any): void {
    const page = event.first / event.rows + 1;
    const pageSize = event.rows;
  
    this.first = event.first;
    this.pageSize = pageSize;
  
    this._inventoryService.getProducts('',page,pageSize)
      .subscribe((res) => {
        this.products = res.results;
        this.totalRecords = res.count;
      });
  }
  selectedProduct: any;
  
  productMenuItems: MenuItem[] = [
    {
      label: 'Edit',
      icon: 'pi pi-fw pi-pen-to-square',
      command: () => this.editUser(this.selectedProduct)
    },
    {
      label: 'Delete',
      icon: 'pi pi-fw pi-trash',
      command: () => this.deleteProduct(this.selectedProduct)
    }
    
  ];
  
  editUser(user: any) {
    this._router.navigate([`user-management/users/edit/${user?.id}`]);
  }
  deleteProduct(user:any){
    this._inventoryService.deleteProduct(user?.id).subscribe()
  }
  showConfirmDelete(user: any) {
    this._confirmPopUp.confirm({
      message: 'Do you want to delete this item?',
      header: 'Confirm Delete',
      onAccept: () => {
        this.deleteProduct(user);
      },
      target: user?.id
    });
  }
  }
