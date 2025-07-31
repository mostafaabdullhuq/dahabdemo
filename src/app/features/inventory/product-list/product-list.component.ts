import { Component, ComponentRef, ElementRef, OnDestroy, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InventoryService } from '../@services/inventory.service';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationPopUpService } from '../../../shared/services/confirmation-pop-up.service';
import { MenuItem } from 'primeng/api';
import { SharedModule } from '../../../shared/shared.module';
import { DropdownsService } from '../../../core/services/dropdowns.service';
import { ProductStockHistoryComponent } from '../product-stock-history/product-stock-history.component';
import { ToasterMsgService } from '../../../core/services/toaster-msg.service';
import { debounceTime, distinctUntilChanged, filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-product-list',
  imports: [SharedModule, RouterLink],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnDestroy {
  products: any[] = [];
  cols: any[] = [];

  filterForm!: FormGroup;
  totalRecords: number = 0;
  pageSize: number = 10;
  first: number = 0;
  searchQuery = ''; // Holds the current query string
  selectedProduct: any;

  componentRef!: ComponentRef<any>;
  @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  rowsPerPageOptions: any[] = [10, 25, 50]; // initially
  searchSubscription!: Subscription

  stockPoints: any[] = [];
  units: any[] = [];
  designers: any[] = [];
  sizes: any[] = [];
  purities: any[] = [];
  categories: any[] = [];
  brands: any[] = [];
  branches: any[] = [];
  stones: any[] = [];

  constructor(
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _confirmPopUp: ConfirmationPopUpService,
    private _dropdownService: DropdownsService,
    private _toaster: ToasterMsgService
  ) { }

  ngOnInit(): void {
    this.cols = [
      {
        field: 'image',
        header: 'Image',
        body: (row: any) =>
          row.image ? `<img src="${row.image}" alt="Product Image" width="50" height="50" style="object-fit: cover; border-radius: 10px;" />` :
            'No Image For This Product'
      },
      { field: "name", header: "Name" },
      { field: "tag_number", header: "Tag No" },
      {
        field: "price", header: "Price", body: (row: any) =>
          `<strong>Price:</strong> ${row.price ?? '-'}<br>` +
          `<strong>Total Price:</strong> ${row.total_price ?? '-'}<br>` +
          `<strong>Branch Total Price:</strong> ${row.branch_total_price ?? '-'}<br>`
      },
      {
        field: "weight",
        header: "Weight",
        body: (row: any) =>
          `<strong>Weight:</strong> ${row.weight ?? '-'}<br>` +
          `<strong>Gross Weight:</strong> ${row.gross_weight ?? '-'}<br>` +
          `<strong>Total Weight:</strong> ${row.total_weight ?? '-'}<br>` +
          `<strong>Branch Total Weight:</strong> ${row.branch_total_weight ?? '-'}<br>`
      },
      {
        field: 'details',
        header: 'Details',
        body: (row: any) =>
          `<strong>Category:</strong> ${row.category ?? '-'}<br>` +
          `<strong>Brand:</strong> ${row.brand ?? '-'}<br>` +
          `<strong>Unit:</strong> ${row.unit ?? '-'}<br>` +
          `<strong>Purity:</strong> ${row.purity ?? '-'}<br>` +
          `<strong>Size:</strong> ${row.size ?? '-'}<br>` +
          `<strong>Designer:</strong> ${row.designer ?? '-'}`
      },
      { field: "created_at", header: "Created At" },
      { field: "total_quantity", header: "Stock" },
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
      {
        field: "stock_point", header: "Stock Point", body: (row: any) => {
          return row.stock_point?.join("<br>") ?? '-'
        }
      },
    ];

    this.initForm();
    this.handleFormSubscriptions();
    this.getProducts();
    this.getLookupItems();
  }

  private initForm() {
    this.filterForm = this._formBuilder.group({
      search: [null],
      description: [null],
      designer: [null],
      brand: [null],
      category: [null],
      name__icontains: [null],
      branch: [null],
      purity: [null],
      size: [null],
      price_from: [null],
      price_to: [null]
    }, { validators: this.pricesCorrect });
  }

  private handleFormSubscriptions() {
    this.searchSubscription = this.filterForm.get("search")?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter(value => value?.length >= 3)
      )
      .subscribe(search => {
        this.onSearch();
      }) || new Subscription();
  }

  private getLookupItems() {
    this._dropdownService.getBrands().subscribe(data => {
      this.brands = data?.results;
    });

    this._dropdownService.getMinimalCategories().subscribe(data => {
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

  pricesCorrect(group: FormGroup) {
    const startPrice = group.get("price_from")?.value;
    const toPrice = group.get("price_to")?.value;
    if (startPrice && toPrice && startPrice > toPrice) {
      return { invalidPriceInterval: true }
    }

    return null;
  }

  getProducts(queryParams?: any, page: number = 1, pageSize: number = 10): void {
    //const searchParams = new URLSearchParams(this.filterForm.value).toString() || '';

    this._inventoryService.getProducts(queryParams, page, pageSize).subscribe(res => {
      this.products = res?.results;
      this.totalRecords = res?.count;
      this.updateRowsPerPageOptions(res?.count)
      // Ensure the total count is updated
    });
  }

  onSearch(): void {
    const formValues = this.filterForm.value;
    const queryParts: string[] = [];

    Object.keys(formValues).forEach(key => {
      const value = formValues[key];
      if (value !== null && value !== '' && value !== undefined && key !== 'price_from' && key !== 'price_to') {
        const encodedKey = encodeURIComponent(key);
        const encodedValue = encodeURIComponent(value).replace(/%20/g, '+');
        queryParts.push(`${encodedKey}=${encodedValue}`);
      }
    });

    if (formValues.price_from || formValues.price_to) {
      let priceRange = `${formValues.price_from || 0}`;
      if (formValues.price_to) {
        priceRange += `,${formValues.price_to}`
      }
      const encodedKey = encodeURIComponent('price_range');
      const encodedValue = encodeURIComponent(priceRange).replace(/%20/g, '+');
      queryParts.push(`${encodedKey}=${encodedValue}`);
    }

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
        this.updateRowsPerPageOptions(res?.count)
      });
  }

  productMenuItems: MenuItem[] = [
    {
      label: 'Edit',
      icon: 'pi pi-fw pi-pen-to-square',
      command: () => this.editUser(this.selectedProduct)
    },
    {
      label: 'Print Labels',
      icon: 'pi pi-barcode',
      command: () => this.openPrintLabel(this.selectedProduct)
    },
    {
      label: 'Product Stock History',
      icon: 'pi pi-history',
      command: () => this.openStockHistory(this.selectedProduct)
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

  openPrintLabel(data: any) {
    this._router.navigate(['inventory/product/product-label'], { queryParams: { id: data?.id } });
  }

  deleteProduct(user: any) {
    this._inventoryService.deleteProduct(user?.id).subscribe(res => {
      this.getProducts()
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

  openStockHistory(product: any) {
    this.container.clear();
    this.componentRef = this.container.createComponent(ProductStockHistoryComponent);
    this.componentRef.instance.visible = true;
    this.componentRef.instance.productId = product?.id;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.submitFile(file);

    // Reset input so user can upload the same file again if needed
    input.value = '';
  }

  submitFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    this._inventoryService.importProducts(formData).subscribe({
      next: (res) => {
        this._toaster.showSuccess("Products imported successfully")
        this.loadProducts({ first: 0, rows: this.pageSize }); // reset to first page
        // You can show a success message or refresh data here
      },
      error: (err) => {
        console.error('Import failed:', err);
        // Show error message here
      },
    });
  }

  updateRowsPerPageOptions(total: number): void {
    this.rowsPerPageOptions = [10, 25, 50, total];
  }

  syncProductPrices() {
    this._inventoryService.syncProductPrices().subscribe(res => {
      this._toaster.showSuccess("Products prices synced succeessfully");
      this.getProducts();
    })
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe()
  }
}
