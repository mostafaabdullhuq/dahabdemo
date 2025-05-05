import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InventoryService } from '../@services/inventory.service';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationPopUpService } from '../../../shared/services/confirmation-pop-up.service';
import { MenuItem } from 'primeng/api';
import { SharedModule } from '../../../shared/shared.module';
import { DropdownsService } from '../../../core/services/dropdowns.service';

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
  
    stockPoints:any[]=[];
    units:any[]=[];
    designers:any[]=[];
    sizes:any[]=[];
    purities:any[]=[];
    categories:any[]=[];
    brands:any[]=[];
    branches:any[]=[];
    stones:any[]=[];

    constructor(
      private _inventoryService: InventoryService,
      private _formBuilder: FormBuilder,
      private _router:Router,
      private _confirmPopUp:ConfirmationPopUpService,
      private _dropdownService:DropdownsService
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
        description: [''],
        designer: [''],
        brand: [''],
        category: [''],
        name: [''],
        branch: [''],
        purity: [''],
        size: [''],
      });
      this.getProducts();
      this._dropdownService.getBrands().subscribe(data => {
        this.brands = data?.results;
      });
      this._dropdownService.getCategories().subscribe(data => {
        this.categories = data?.results;
      });
      this._dropdownService.getPurities().subscribe(data => {
        this.purities = data?.results;
      });
      this._dropdownService.getBranches().subscribe(data => {
        this.branches = data?.results;
      });
      this._dropdownService.getSizes().subscribe(data => {
        this.sizes = data?.results;
      });
      this._dropdownService.getDesigners().subscribe(data => {
        this.designers = data?.results;
      });
      this._dropdownService.getStockPoints().subscribe(data => {
        this.stockPoints = data?.results;
      });
    }
  
    getProducts(queryParams?:any, page: number = 1, pageSize: number = 10): void {
      //const searchParams = new URLSearchParams(this.filterForm.value).toString() || '';
  
      this._inventoryService.getProducts(queryParams, page, pageSize).subscribe(res => {
        this.products = res?.results;
        this.totalRecords = res?.count;  // Ensure the total count is updated
        console.log('Total records:', this.totalRecords);  // Debugging log
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
    
      this.getProducts(queryParams, 1, 10);
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
    this._router.navigate([`inventory/product/edit/${user?.id}`]);
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
