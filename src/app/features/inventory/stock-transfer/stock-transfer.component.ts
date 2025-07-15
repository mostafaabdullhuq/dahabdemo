import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { TransferStockPointsComponent } from './transfer-stock-points/transfer-stock-points.component';
import { TransferBranchesComponent } from './transfer-branches/transfer-branches.component';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoryService } from '../@services/inventory.service';

@Component({
  selector: 'app-stock-transfer',
  imports: [SharedModule, TransferStockPointsComponent, TransferBranchesComponent],
  templateUrl: './stock-transfer.component.html',
  styleUrl: './stock-transfer.component.scss'
})
export class StockTransferComponent implements OnInit {

  transferObject: any = null;
  isEditMode: boolean = false;
  transferType: "branch" | "stock-point" | null = null;

  constructor(private _activatedRoute: ActivatedRoute, private _inventoryService: InventoryService, private _router: Router) { }

  ngOnInit(): void {
    this._activatedRoute.params.subscribe(params => {
      if (params && params['id']) {
        this._inventoryService.getStockTransferTransactionById(params['id']).subscribe((transaction: any) => {
          if (transaction && transaction.id) {
            this.isEditMode = true;
            this.transferObject = transaction;
            this.transferType = transaction.transfer_branch !== null ? "branch" : "stock-point"
          } else {
            this.isEditMode = false;
            this.transferObject = null;
            this.transferType = null;
          }
        });
      } else {
        this.isEditMode = false;
        this.transferObject = null;
        this.transferType = null;
      }
    })
  }

}
