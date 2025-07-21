import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { BehaviorSubject } from 'rxjs';
import { SettingsService } from '../../../settings/@services/settings.service';

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

  visibility = new BehaviorSubject<boolean>(false);

  visibility$ = this.visibility.asObservable();

  constructor(
    private _settingService: SettingsService
  ) { }

  showDialog() {
    this.visibility.next(true);
  }

  ngOnInit(): void {
    console.log("data: ", this.paymentData);

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



  // Methods for payment table actions
  viewPaymentDetails(payment: any) {
    this.selectedPaymentItems = payment.items || [];
    this.selectedPaymentId = payment.id;
    this.selectedPaymentData = payment;
    this.showPaymentDetails = true;
  }

  editPayment(payment: any) {
    // Placeholder for edit functionality - to be implemented later
    console.log('Edit payment:', payment);
  }

  deletePayment(payment: any) {
    // Placeholder for delete functionality - to be implemented later
    console.log('Delete payment:', payment);
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
