import { Component, ComponentRef, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { PosRegisterPopupComponent } from './pos-register-popup/pos-register-popup.component';
import { PosService } from './@services/pos.service';
import { PosStatusService } from './@services/pos-status.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-pos',
  standalone: false,
  templateUrl: './pos.component.html',
  styleUrl: './pos.component.scss'
})
export class PosComponent implements OnInit, OnDestroy {
  @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef;

  componentRef!: ComponentRef<PosRegisterPopupComponent>;
  constructor(private _posService: PosService, private _posStatusService: PosStatusService) { }
  loadOpenRegister() {
    this.container.clear();
    this.componentRef = this.container.createComponent(PosRegisterPopupComponent);
    this.componentRef.instance.visible = true;
  }
  isShiftActive = false;
  private destroy$ = new Subject<void>();
  shiftId: any = '';
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
  }

  onRegisterClick(): void {
    if (this.isShiftActive) {
      this._posService.closeShift(this.shiftId).subscribe(() => {
        this._posStatusService.setShiftStatus(false);
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
