import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DropdownsService } from '../../../core/services/dropdowns.service';
import { PosService } from '../@services/pos.service';
import { PosStatusService } from '../@services/pos-status.service';
import { PosSharedService } from '../@services/pos-shared.service';

@Component({
  selector: 'app-pos-register-popup',
  standalone: false,
  templateUrl: './pos-register-popup.component.html',
  styleUrl: './pos-register-popup.component.scss'
})
export class PosRegisterPopupComponent implements OnInit {
  visible: boolean = false;
  registerPosForm!: FormGroup;
  branches: any = [];

  constructor(
    private _posStatusService: PosStatusService,
    private _posSharedService: PosSharedService,
    private _formBuilder: FormBuilder,
    private _dropdownsService: DropdownsService,
    private _posService: PosService,
  ) { }

  ngOnInit(): void {
    this.registerPosForm = this._formBuilder.group({
      opening_balance: ['', Validators.required],
      branch_id: ['', Validators.required],
    });
    this._dropdownsService.getBranches().subscribe(res => {
      this.branches = res.results
    });
  }
  showDialog() {
    this.visible = true;
  }

  submitForm(form: FormGroup) {
    if (form.invalid) {
      return;
    }

    this._posService.addShift(form.value).subscribe(res => {
      if (res && res?.branch_id) {
        this._posStatusService.setShiftStatus(true);
        this._posStatusService.updateShiftStatus();
        this._posSharedService.triggerRefreshCurrency();
        this.visible = false;
      }
    })
  }
}
