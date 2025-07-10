import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PosStatusService } from '../../@services/pos-status.service';
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
  selectedRowId: any = 0;
  constructor(
    private _posService: PosService,
    private _posSaleService: PosSalesService,
    private _formBuilder: FormBuilder,
    private _posDiamondService: PosDiamondService,
    private _posSilverService: PosSilverService
  ) { }

  ngOnInit(): void {
    this.discForm = this._formBuilder.group({
      discount: ['', Validators.required],
    });
  }
  showDialog() {
    this.visible = true;
  }

  submitForm(form: FormGroup) {
    this._posService.setDiscountProductSale(this.selectedRowId, form.value).subscribe(res => {
      this.visible = false;
      if (res) {
        this._posSaleService.getSalesOrdersFromServer();
        this._posDiamondService.fetchDiamondOrders();
        this._posSilverService.fetchSilverOrders();
      }
    })
  }
}
