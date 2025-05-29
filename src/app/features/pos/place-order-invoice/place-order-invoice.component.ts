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
  orgImg:any = JSON.parse(localStorage.getItem('user')|| '')?.image;
  invoiceData:any = {};
  @Output() onSubmitPayments = new EventEmitter<any[]>();

  constructor( private _formBuilder: FormBuilder, private _posService: PosService) { }

  ngOnInit(): void {
   this.getInvoiceData()
  }
 
  showDialog() {
    this.visible = true;
  }
  invoice = {
    invoiceNumber: 'INV-2025-001',
    date: '2025-05-29',
    customer: {
      name: 'Rowan Ragab',
      address: '123 Main Street, Cairo, Egypt',
      phone: '+20 100 000 0000'
    },
    items: [
      {
        imageUrl: 'https://via.placeholder.com/50',
        description: 'Gold Ring 24K',
        tagNumber: 'GR-001',
        grossWeight: 15.3,
        quantity: 1,
        subtotal: 1200.00
      },
      {
        imageUrl: 'https://via.placeholder.com/50',
        description: 'Silver Necklace',
        tagNumber: 'SN-045',
        grossWeight: 32.5,
        subtotal: 850.00,
        quantity: 1,

      },
      {
        imageUrl: 'https://via.placeholder.com/50',
        description: 'Diamond Bracelet',
        tagNumber: 'DB-783',
        grossWeight: 22.0,
        quantity: 1,
        subtotal: 2600.00
      }
    ]
  };

  get total() {
    return this.invoice.items.reduce((sum, item) => sum + item.quantity * item.subtotal, 0);
  }

getInvoiceData(){
  this._posService.getOrderInvoice().subscribe(res=>{
this.invoiceData = res
  })
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
