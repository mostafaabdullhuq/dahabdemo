import { Component, Output } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { FormBuilder } from '@angular/forms';
import { AccService } from '../../@services/acc.service';

@Component({
  selector: 'app-view-trans-payment',
  imports: [SharedModule],
  templateUrl: './view-trans-payment.component.html',
  styleUrl: './view-trans-payment.component.scss'
})
export class ViewTransPaymentComponent {
  visible: boolean = false;
  orgImg: any = JSON.parse(localStorage.getItem('user') || '')?.image;
  invoiceData: any = {};
  transId: any = ''
  constructor(private _formBuilder: FormBuilder, private _accService: AccService) { }

  ngOnInit(): void {
    this.getTransactionById()
  }

  showDialog() {
    this.visible = true;
  }

  getTransactionById() {
    this._accService.getTransactionById(this.transId).subscribe(res => {
      this.invoiceData = res
    })
  }
  getTotalPrice(products: any[]): number {
    if (!products || products.length === 0) return 0;
    return products.reduce((sum, item) => sum + (item.price || 0), 0);
  }
  printInvoice() {
    const printContents = document.getElementById('invoice-section')?.innerHTML;
    const originalContents = document.body.innerHTML;

    if (printContents) {
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      // window.location.reload(); // reload to restore Angular bindings
    }
  }
}
