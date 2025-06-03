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
        {
    field: 'image',
    header: 'Image',
    body: (row: any) =>
      row.image ? `<img src="${row.image}" alt="Product Image" width="50" height="50" style="object-fit: cover; border-radius: 10px;" />`:
    'No Image For This Product'
  },
        { field: "name", header: "Name" },
        {
          field: "is_active", header: "Active",
          body: (row: any) => {
            if (row?.is_active) {
              return `<span class="badge rounded-pill text-bg-success">Active</span>`;
            } else {
              return `<span class="badge rounded-pill text-bg-secondary">Inactive</span>`;
            }
          }
        },
    { field: "price", header: "Price" },
    { field: "weight", header: "Weight" },
    {
  field: 'details',
  header: 'Details',
  body: (row: any) =>
    `<strong>Category:</strong> ${row.category ?? '-'}<br>` +
    `<strong>Brand:</strong> ${row.brand ?? '-'}<br>` +
    `<strong>Unit:</strong> ${row.unit ?? '-'}<br>` +
    `<strong>Purity:</strong> ${row.purity ?? '-'}<br>` +
    `<strong>Size:</strong> ${row.size ?? '-'}`
},
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
 searchQuery = ''; // Holds the current query string

onSearch(): void {
  const formValues = this.filterForm.value;
  const queryParts: string[] = [];

  Object.keys(formValues).forEach(key => {
    const value = formValues[key];
    if (value !== null && value !== '' && value !== undefined) {
      const encodedKey = encodeURIComponent(key);
      const encodedValue = encodeURIComponent(value).replace(/%20/g, '+');
      queryParts.push(`${encodedKey}=${encodedValue}`);
    }
  });

  this.searchQuery = queryParts.join('&');
  this.loadProducts({ first: 0, rows: this.pageSize }); // reset to first page
}

loadProducts(event: any): void {
  const page = event.first / event.rows + 1;
  const pageSize = event.rows;

  this.first = event.first;
  this.pageSize = pageSize;

  this._inventoryService.getProducts(this.searchQuery, page, pageSize)
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
      command: () => this.showConfirmDelete(this.selectedProduct)
    }
    
  ];
  
  editUser(user: any) {
    this._router.navigate([`inventory/product/edit/${user?.id}`]);
  }
  deleteProduct(user:any){
    this._inventoryService.deleteProduct(user?.id).subscribe(res=>{
      if(res){
        this.getProducts()
      }
    })
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
