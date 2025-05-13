import { NgModule } from '@angular/core';
import { PosComponent } from './pos.component';
import { SharedModule } from '../../shared/shared.module';
import { SalesPosComponent } from './sales-pos/sales-pos.component';
import { RouterLink } from '@angular/router';
import { TotalsPosComponent } from './totals-pos/totals-pos.component';
import { PosRegisterPopupComponent } from './pos-register-popup/pos-register-popup.component';
import { PaymentMethodsPopupComponent } from './totals-pos/payment-methods-popup/payment-methods-popup.component';
import { RetunPosComponent } from './retun-pos/retun-pos.component';
import { PurchasePosComponent } from './purchase-pos/purchase-pos.component';
import { RepairPosComponent } from './repair-pos/repair-pos.component';
import { GoldReceiptPosComponent } from './gold-receipt-pos/gold-receipt-pos.component';



@NgModule({
  declarations: [
    PosComponent,
    SalesPosComponent,
    TotalsPosComponent,
    PosRegisterPopupComponent,
    PaymentMethodsPopupComponent,
    RetunPosComponent,
    PurchasePosComponent,
    RepairPosComponent,
    GoldReceiptPosComponent
  ],
  imports: [
    SharedModule,
    RouterLink
  ]
})
export class PosModule { }
