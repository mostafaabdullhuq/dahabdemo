import { Component, ComponentRef, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { PosRegisterPopupComponent } from './pos-register-popup/pos-register-popup.component';
import { PosService } from './@services/pos.service';
import { PosStatusService } from './@services/pos-status.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { CloseShiftReportComponent } from './close-shift-report/close-shift-report.component';
import { Currency, Customer } from './interfaces/pos.interfaces';
import { PosSharedService } from './@services/pos-shared.service';

@Component({
  selector: 'app-pos',
  standalone: false,
  templateUrl: './pos.component.html',
  styleUrl: './pos.component.scss'
})
export class PosComponent implements OnInit, OnDestroy {
  @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef;

  private destroy$ = new Subject<void>();
  selectedCurrency$!: Observable<Currency | null>;
  selectedCustomer$!: Observable<Customer | null>;
  componentRef!: ComponentRef<any>;
  isShiftActive = false;
  shiftId?: number | null;

  constructor(private _posService: PosService, private _posStatusService: PosStatusService, private _posSharedService: PosSharedService) { }


  loadOpenRegister() {
    this.container.clear();
    this.componentRef = this.container.createComponent(PosRegisterPopupComponent);
    this.componentRef.instance.visible = true;
  }

  ngOnInit(): void {
    this.shiftId = this._posStatusService?.shiftData?.shift_id
    this._posStatusService.shiftActive$
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.isShiftActive = status;
      });

    this._posStatusService.shiftData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.shiftId = data?.shift_id;
      });

    this.selectedCurrency$ = this._posSharedService.selectedCurrency$
    this.selectedCustomer$ = this._posSharedService.selectedCustomer$;
  }

  openShiftReport() {
    this.container.clear();
    this.componentRef = this.container.createComponent(CloseShiftReportComponent);
    this.componentRef.instance.visible = true;
  }

  onRegisterClick(): void {
    if (this.isShiftActive) {
      this._posService.closeShift(this.shiftId).subscribe(() => {
        this._posStatusService.setShiftStatus(false);
        this.openShiftReport();
        // because if selected other branch customer and currency can not be matched
        sessionStorage.removeItem("customer");
        sessionStorage.removeItem("currency");
      });
    } else {
      this.loadOpenRegister();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
