import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { InventoryService } from '../@services/inventory.service';
import { FormBuilder } from '@angular/forms';
import { ConfirmationPopUpService } from '../../../shared/services/confirmation-pop-up.service';
import { DropdownsService } from '../../../core/services/dropdowns.service';

@Component({
  selector: 'app-product-stock-history',
  imports: [SharedModule],
  templateUrl: './product-stock-history.component.html',
  styleUrl: './product-stock-history.component.scss'
})
export class ProductStockHistoryComponent implements OnInit {
  historyList: any = [];
  cols: any[] = [];
  visible: boolean = false;
  productId: any = 0;
  productHistoryCardData: any;
  totalRecords: number = 0;
  pageSize: number = 10;
  first: number = 0;

  constructor(
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder,
    private _confirmPopUp: ConfirmationPopUpService,
    private _dropdownService: DropdownsService
  ) { }
  ngOnInit(): void {
    this.getProductStockHistory();
    this.cols = [
      { field: "id", header: "ID" },
      { field: "reference_number", header: "reference number" },
      { field: "product", header: "product" },
      { field: "type", header: "type" },
      { field: "add_weight", header: "weight" },
      { field: "customer", header: "customer" },
      { field: "branch", header: "branch" },
      { field: "created_at", header: "created at" },
    ];
  }

  searchQuery: any = '';

  loadProductHistory(event: any): void {
    const page = event.first / event.rows + 1;
    const pageSize = event.rows;

    this.first = event.first;
    this.pageSize = pageSize;

    this._inventoryService.getProductStockHistory(this.productId, this.searchQuery, page, pageSize)
      .subscribe((res) => {
        const historyResult = res?.product_stock_history ?? {};
        this.historyList = historyResult?.results;
        this.totalRecords = historyResult?.count;  // Ensure the total count is updated
        this.productHistoryCardData = {
          current_stock: res.current_stock,
          total_purchase: res.total_purchase,
          total_purchase_old_gold: res.total_purchase_old_gold,
          transfer_in: res.transfer_in,
          transfer_out: res.transfer_out,
        };
      });
  }

  getProductStockHistory(queryParams?: any, page: number = 1, pageSize: number = 10): void {
    //const searchParams = new URLSearchParams(this.filterForm.value).toString() || '';
    this._inventoryService.getProductStockHistory(this.productId, queryParams, page, pageSize).subscribe(res => {
      const historyResult = res?.product_stock_history ?? {};
      this.historyList = historyResult?.results;
      this.totalRecords = historyResult?.count;  // Ensure the total count is updated
      this.productHistoryCardData = {
        current_stock: res.current_stock,
        total_purchase: res.total_purchase,
        total_purchase_old_gold: res.total_purchase_old_gold,
        transfer_in: res.transfer_in,
        transfer_out: res.transfer_out,

      };
    });
  }
  onClose() {
    this.visible = false;
  }
}
