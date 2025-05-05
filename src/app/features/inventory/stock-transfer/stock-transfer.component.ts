import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { TransferStockPointsComponent } from './transfer-stock-points/transfer-stock-points.component';
import { TransferBranchesComponent } from './transfer-branches/transfer-branches.component';

@Component({
  selector: 'app-stock-transfer',
  imports: [SharedModule , TransferStockPointsComponent , TransferBranchesComponent],
  templateUrl: './stock-transfer.component.html',
  styleUrl: './stock-transfer.component.scss'
})
export class StockTransferComponent {

}
