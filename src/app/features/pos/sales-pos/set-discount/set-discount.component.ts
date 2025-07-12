import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PosService } from '../../@services/pos.service';
import { PosSalesService } from '../../@services/pos-sales.service';
import { PosDiamondService } from '../../@services/pos-diamond.service';
import { PosSilverService } from '../../@services/pos-silver.service';

@Component({
  selector: 'app-set-discount',
  imports: [SharedModule],
  templateUrl: './set-discount.component.html',
  styleUrl: './set-discount.component.scss'
})
export class SetDiscountComponent implements OnInit {
  visible: boolean = false;
  discForm!: FormGroup;
  branches: any = [];
  selectedRow: any = 0;
  parentTab: "sales" | "diamond" | "silver" = "sales";

  constructor(
    private _posService: PosService,
    private _posSaleService: PosSalesService,
    private _formBuilder: FormBuilder,
    private _posDiamondService: PosDiamondService,
    private _posSilverService: PosSilverService
  ) { }

  ngOnInit(): void {
    this.discForm = this._formBuilder.group({
      discount: [(this.selectedRow.discount) || "", Validators.required],
      amount: [this.selectedRow.amount, Validators.required]
    });
  }
  showDialog() {
    this.visible = true;
  }

  submitForm(form: FormGroup) {

    console.log("product to be submitted: ", this.selectedRow);


    console.log("amount before discount: ", this.discForm.get("amount")?.value);

    this.discForm.get("amount")?.setValue(this.calculateAmountAfterDiscount());

    console.log("amount after discount: ", this.discForm.get("amount")?.value);

    this._posService.setDiscountProductSale(this.selectedRow.id, form.value).subscribe(res => {
      this.visible = false;
      if (res) {
        if (this.parentTab === "sales") {
          this._posSaleService.getSalesOrdersFromServer();
        }

        if (this.parentTab === "diamond") {
          this._posDiamondService.fetchDiamondOrders();
        }

        if (this.parentTab === "silver") {
          this._posSilverService.fetchSilverOrders();
        }
      }
    })
  }

  calculateAmountAfterDiscount() {
    const discountValue = +(this.discForm.get("discount")?.value || 0);
    const oldAmount = +(this.discForm.get("amount")?.value || 0);
    let discountSourceValue = 0;

    switch (this.parentTab) {
      case "sales":
        discountSourceValue = +this.selectedRow.retail_making_charge;
        break;
      case "diamond":
        discountSourceValue = +this.selectedRow.price;
        break;
      case "silver":
        discountSourceValue = +this.selectedRow.price;
        break;
      default:
        discountSourceValue = 0;
        0;
    }

    console.log("discount source value: ", discountSourceValue);


    return (oldAmount - (discountSourceValue * (discountValue / 100))).toFixed(3);
  }
}
