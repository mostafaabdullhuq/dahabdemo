import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { BehaviorSubject } from 'rxjs';
import { SettingsService } from '../../../settings/@services/settings.service';
import { AccService } from '../../@services/acc.service';
import { ToasterMsgService } from '../../../../core/services/toaster-msg.service';
import { ConfirmationPopUpService } from '../../../../shared/services/confirmation-pop-up.service';

@Component({
  selector: 'app-view-purchase-payments',
  imports: [SharedModule],
  templateUrl: './view-purchase-payments.component.html',
  styleUrl: './view-purchase-payments.component.scss'
})
export class ViewPurchasePaymentsComponent implements OnInit {
  paymentData: any = [];
  paymentBranch: any;

  // New properties for payment display and details
  selectedPaymentItems: any[] = [];
  showPaymentDetails = false;
  selectedPaymentId: number | null = null;
  selectedPaymentData: any = null;
  paymentsTableData: any[] = [];
  private editPaymentSubject = new BehaviorSubject<number | null>(null);

  paymentToBeEditedId$ = this.editPaymentSubject.asObservable();

  visibility = new BehaviorSubject<boolean>(false);

  visibility$ = this.visibility.asObservable();

  constructor(
    private _settingService: SettingsService,
    private _accService: AccService,
    private _toaster: ToasterMsgService,
    private _confirmPopUp: ConfirmationPopUpService
  ) { }

  showDialog() {
    this.visibility.next(true);
  }

  ngOnInit(): void {
    if (this.paymentData && Object.keys(this.paymentData).length > 0) {
      if (this.paymentData.branch) {
        this._settingService.getBranchById(this.paymentData.branch).subscribe(res => {
          this.paymentBranch = res;
        })
      }
    }

    // Populate payments table data
    if (this.paymentData?.payments) {
      this.paymentsTableData = this.paymentData.payments.map((payment: any) => ({
        ...payment,
        itemsCount: payment.items?.length || 0,
        formattedDate: new Date(payment.payment_date).toLocaleDateString(),
        formattedAmount: this.formatCurrency(payment.total_amount),
        formattedWeight: this.formatCurrency(payment.total_weight),
        formattedGoldPrice: this.formatCurrency(payment.gold_price)
      }));
    }
  }

  viewPaymentDetails(payment: any) {
    this.selectedPaymentItems = payment.items || [];
    this.selectedPaymentId = payment.id;
    this.selectedPaymentData = payment;
    this.showPaymentDetails = true;
  }

  editPayment(payment: any) {
    this.editPaymentSubject.next(payment?.id ?? null);
    this.visibility.next(false);
  }

  deletePayment(payment: any) {
    this._accService.deletePurchasePayment(payment.id).subscribe(res => {
      this._toaster.showSuccess("Payment Deleted Successfully")
      this.paymentsTableData = this.paymentsTableData.filter(paymentItem => paymentItem.id !== payment.id)
    })
  }

  closePaymentDetails() {
    this.showPaymentDetails = false;
    this.selectedPaymentItems = [];
    this.selectedPaymentId = null;
    this.selectedPaymentData = null;
  }

  formatCurrency(amount: string | number | null | undefined): string {
    if (amount === null || amount === undefined || amount === '') {
      return '0.000';
    }
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) {
      return '0.000';
    }
    return numAmount.toFixed(3);
  }
}
