import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from '../@services/inventory.service';
import { Router } from '@angular/router';
import { ConfirmationPopUpService } from '../../../shared/services/confirmation-pop-up.service';
import { SharedModule } from '../../../shared/shared.module';
import { DropdownsService } from '../../../core/services/dropdowns.service';
import { StockTakingService } from './stock-taking.service';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { StockTakingWebsocketService } from './stock-taking-websocket.service';
import { UpdateQuantityDialogComponent } from './update-quantity-dialog/update-quantity-dialog.component';

@Component({
  selector: 'app-count-down',
  imports: [SharedModule, UpdateQuantityDialogComponent],
  templateUrl: './count-down.component.html',
  styleUrl: './count-down.component.scss'
})
export class CountDownComponent implements OnInit, OnDestroy {
  @ViewChild('tagInput') tagInput!: ElementRef;
  multipleProducts: any[] = [];

  products: any[] = [];
  branches: any[] = [];
  stockPoints: any[] = [];
  categories: any[] = [];
  filterForm!: FormGroup;
  scanningProductForm!: FormGroup;
  currentStockTakingId: string | null = null;
  currentItemId: string | null = null;
  totalItems = 0;
  itemsWithDifference = 0;
  totalDifference = 0;
  isConnected = false;
  statusMessage: { type: string, text: string } | null = null;
  selectedQuantity: number | null = null;

  private requestTimer: any = null;
  private requestInProgress = false;
  private lastHandledMessageId: string | null = null;
  private websocketSubscription!: Subscription;
  private connectionSubscription!: Subscription;
  private scanSubscription!: Subscription;
  private branchChangeSubscription!: Subscription;

  constructor(
    private dropdownService: DropdownsService,
    private formBuilder: FormBuilder,
    private stockTakingService: StockTakingService,
    private stockTakingWebsocketService: StockTakingWebsocketService,
    private _confirmPopUp: ConfirmationPopUpService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.initForms();
    this.handleFormSubscriptions();
    this.loadDropdowns();
    this.setupWebSocket();
  }

  selectProduct(productId: string): void {
    const selected = this.multipleProducts.find(p => p.id === productId);
    if (selected) {
      this.scanningProductForm.get('product')?.patchValue(selected?.tag_number)
      this.statusMessage = { type: 'success', text: 'Product selected from multiple matches' };
    }
  }

  ngOnDestroy(): void {
    this.websocketSubscription?.unsubscribe();
    this.connectionSubscription?.unsubscribe();
    this.scanSubscription?.unsubscribe();
    this.branchChangeSubscription?.unsubscribe();
  }

  private initForms(): void {
    this.filterForm = this.formBuilder.group({
      branch: ['', Validators.required],
      category: '',
      stockpoint: ''
    });

    this.scanningProductForm = this.formBuilder.group({
      product: ''
    });
  }

  handleFormSubscriptions() {
    this.branchChangeSubscription = this.filterForm.get('branch')?.valueChanges.subscribe(branchId => {
      if (branchId) {
        this.checkActiveStockTaking();
        this.loadCategories(branchId);
        this.loadStockPoints(branchId);
        this.tagInput.nativeElement.disabled = false;
        this.requestActiveItems();
        setTimeout(() => this.tagInput.nativeElement.focus(), 0);
      } else {
        this.categories = [];
        this.stockPoints = [];
        this.tagInput.nativeElement.disabled = true;
      }
    }) || new Subscription();

    this.scanSubscription = this.scanningProductForm.get('product')?.valueChanges.pipe(
      debounceTime(600),
      distinctUntilChanged()
    ).subscribe(tagNumber => {
      if (tagNumber && tagNumber.length >= 2) {
        this.statusMessage = { type: 'info', text: 'Searching...' };
        this.scanProduct(tagNumber);
      } else if (!tagNumber || tagNumber.length === 0) {
        this.statusMessage = null;
      }
    }) || new Subscription();
  }

  private loadDropdowns(): void {
    this.dropdownService.getBranches().subscribe(res => {
      this.branches = res?.results || [];
    });

    this.dropdownService.getStockPoints().subscribe(res => {
      this.stockPoints = res?.results || [];
    });

    this.dropdownService.getCategories().subscribe(res => {
      this.categories = res?.results || [];
    });
  }

  private setupWebSocket(): void {
    this.connectionSubscription = this.stockTakingWebsocketService.connectionStatus$.subscribe(
      isConnected => {
        this.isConnected = isConnected;
        if (isConnected) {
          this.statusMessage = { type: 'success', text: 'Connected to scanner' };
          this.requestActiveItems();
        } else {
          this.statusMessage = { type: 'danger', text: 'Disconnected from scanner' };
        }
      }
    );

    this.websocketSubscription = this.stockTakingWebsocketService.messages$.subscribe(
      message => this.handleWebSocketMessage(message)
    );
  }

  private handleWebSocketMessage(message: any): void {
    // Avoid duplicates by message id
    if (message.id && message.id === this.lastHandledMessageId) {
      return;
    }
    this.lastHandledMessageId = message.id || null;

    if (message.status === 'success') {
      if (message.action === 'scan') {
        this.statusMessage = { type: 'success', text: 'Item scanned successfully' };
        this.handleScanSuccess(message.data);
      } else if (message.action === 'get_active_items') {
        this.handleActiveItems(message.data);
      } else if (message.action === 'update_quantity') {
        this.statusMessage = { type: 'success', text: 'Quantity updated successfully' };
        this.handleQuantityUpdate(message.data);
      }
    } else if (message.status === 'multiple_products') {
      this.showMultipleProducts(message.products);
    } else {
      this.statusMessage = { type: 'danger', text: message.message || 'WebSocket error occurred' };
    }
  }

  private handleScanSuccess(data: any): void {
    const item = data.item;
    const existingIndex = this.products.findIndex(p => p.id === item.id);

    if (existingIndex >= 0) {
      this.products[existingIndex] = item;
    } else {
      this.products.unshift(item);
    }

    this.updateStatistics();
    this.scanningProductForm.get('product')?.reset();
  }

  private handleActiveItems(items: any[]): void {
    this.products = items.map(entry => entry.item); // Extract only the item objects
    this.updateStatistics();
  }

  private handleQuantityUpdate(item: any): void {
    const index = this.products.findIndex(p => p.id === item.id);
    if (index >= 0) {
      this.products[index] = item;
      this.updateStatistics();
    }
  }

  private showMultipleProducts(products: any[]): void {
    if (products.length === 0) return;

    this.multipleProducts = products;

    // Optional: disable scan temporarily if needed
    this.scanningProductForm.get('product')?.disable();

    // Optional: re-enable scan after a delay (to prevent race conditions)
    setTimeout(() => {
      this.scanningProductForm.get('product')?.enable();
    }, 1000);

    // Optional: force update
    this.cdRef.detectChanges(); // Inject ChangeDetectorRef if needed
  }

  private updateStatistics(): void {
    this.totalItems = this.products.length;
    this.itemsWithDifference = this.products.filter(p => p.difference !== 0).length;
    this.totalDifference = this.products.reduce((sum, p) => sum + p.difference, 0);
  }

  private requestActiveItems(): void {
    if (this.requestInProgress) return;

    this.requestInProgress = true;

    clearTimeout(this.requestTimer);

    this.requestTimer = setTimeout(() => {
      if (this.currentBranch && this.isInitialized) {
        const message: any = {
          action: 'get_active_items',
          branch_id: this.currentBranch
        };

        if (this.currentCategory) message.category = this.currentCategory;
        if (this.currentStockpoint) message.stock_point = this.currentStockpoint;

        this.stockTakingWebsocketService.sendMessage(message);
      }

      this.requestInProgress = false;
    }, 800); // Delay sending by 700ms
  }

  private scanProduct(tagNumber: string): void {
    if (this.currentBranch) {
      const message: any = {
        action: 'scan',
        tag_number: tagNumber,
        branch_id: this.currentBranch
      };

      if (this.currentCategory) message.category = this.currentCategory;
      if (this.currentStockpoint) message.stock_point = this.currentStockpoint;

      this.stockTakingWebsocketService.sendMessage(message);
    } else {
      this.statusMessage = { type: 'warning', text: 'Please select a branch first' };
    }
  }

  private checkActiveStockTaking(): void {
    if (this.currentBranch) {
      this.stockTakingService.getActiveStockTaking(this.currentBranch, this.currentCategory, this.currentStockpoint)
        .subscribe(res => {
          this.currentStockTakingId = res?.data?.id || null;
        });
    }
  }

  private loadCategories(branchId: string): void {
    this.dropdownService.getCategories().subscribe(res => {
      this.categories = res?.results || [];
    });
  }

  private loadStockPoints(branchId: string): void {
    this.dropdownService.getStockPoints().subscribe(res => {
      this.stockPoints = res?.results || [];
    });
  }

  initializeStockTaking(): void {
    const formValue = this.filterForm.value;

    if (!formValue.branch) {
      this.statusMessage = { type: 'warning', text: 'Please select a branch first' };
      return;
    }

    this.stockTakingService.initializeStockTaking(formValue).subscribe(res => {
      if (res?.status === 'in_progress') {
        this.currentStockTakingId = res.id;
        this.statusMessage = { type: 'success', text: 'Stock taking session initialized' };
        this.requestActiveItems();

      } else {
        this.statusMessage = { type: 'danger', text: res?.message || 'Failed to initialize stock taking' };
      }
    }, error => {
      this.statusMessage = { type: 'danger', text: 'Failed to initialize stock taking' };
    });
  }

  completeStockTaking(): void {
    if (!this.currentStockTakingId) {
      this.statusMessage = { type: 'warning', text: 'No active stock taking session' };
      return;
    }

    this.stockTakingService.completeStockTaking(this.currentStockTakingId!).subscribe(res => {
      if (res?.status === 'success') {
        this.currentStockTakingId = null;
        this.statusMessage = { type: 'success', text: 'Stock taking completed successfully' };
        this.requestActiveItems();
      } else {
        this.statusMessage = { type: 'danger', text: res?.message || 'Failed to complete stock taking' };
      }
    });
  }

  showConfirmDelete(color: any) {
    this._confirmPopUp.confirm({
      message: 'Do you want to delete this item?',
      header: 'Confirm Delete',
      onAccept: () => {
        this.completeStockTaking()
      },
      target: color?.id
    });
  }

  getStockTakingReport(): void {
    if (!this.currentStockTakingId) {
      this.statusMessage = { type: 'warning', text: 'No stock taking session selected' };
      return;
    }

    this.stockTakingService.getStockTakingReport(this.currentStockTakingId).subscribe(res => {
      if (res?.status === 'completed') {
        this.products = res.items || [];
        this.updateStatistics();
        this.statusMessage = { type: 'success', text: 'Report loaded successfully' };
      } else {
        this.statusMessage = { type: 'danger', text: res?.message || 'Failed to load report' };
      }
    }, error => {
      this.statusMessage = { type: 'danger', text: 'Failed to load report' };
    });
  }

  visible: boolean = false;
  openQuantityModal(item: any): void {
    this.currentItemId = item?.id;
    this.selectedQuantity = item?.actual_quantity;
    this.visible = true;
  }

  handleQuantitySave(quantity: number): void {
    if (!this.currentItemId) {
      this.statusMessage = { type: 'danger', text: 'No item selected for update' };
      return;
    }

    this.stockTakingWebsocketService.sendMessage({
      action: 'update_quantity',
      item_id: this.currentItemId,
      quantity: quantity
    });

    this.checkActiveStockTaking();
  }

  get isInitialized() {
    return !!this.currentStockTakingId
  }

  get currentBranch() {
    return this.filterForm.get('branch')?.value || null;
  }

  get currentCategory() {
    return this.filterForm.get('category')?.value;
  }

  get currentStockpoint() {
    return this.filterForm.get('stockpoint')?.value;
  }

  updateQuantity(): void {
    if (!this.currentItemId || this.selectedQuantity === null) {
      this.statusMessage = { type: 'danger', text: 'No item selected for update' };
      return;
    }

    this.stockTakingWebsocketService.sendMessage({
      action: 'update_quantity',
      item_id: this.currentItemId,
      quantity: this.selectedQuantity
    });

    this.visible = false;
    this.checkActiveStockTaking();
  }

  showDialog() {
    this.visible = true;
  }

}
