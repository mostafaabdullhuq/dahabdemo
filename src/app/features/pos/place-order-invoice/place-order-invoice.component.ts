import { Component, EventEmitter, Output } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { PosService } from '../@services/pos.service';

@Component({
  selector: 'app-place-order-invoice',
  imports: [SharedModule],
  templateUrl: './place-order-invoice.component.html',
  styleUrl: './place-order-invoice.component.scss'
})
export class PlaceOrderInvoiceComponent {
  visible: boolean = false;
  orgImg: any = JSON.parse(localStorage.getItem('user') || '')?.image;
  invoiceData: any = {};
  @Output() onSubmitPayments = new EventEmitter<any[]>();

  constructor(private _formBuilder: FormBuilder, private _posService: PosService) { }

  ngOnInit(): void {
    this.getInvoiceData()
  }

  showDialog() {
    this.visible = true;
  }




  getInvoiceData() {
    this._posService.getOrderInvoice().subscribe(res => {
      this.invoiceData = res
      console.log("invoice data: ", res);

    })
  }

  getTotalPrice(products: any[]): number {
    if (!products || products.length === 0) return 0;
    return products.reduce((sum, item) => sum + (+item.price || 0), 0);
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
