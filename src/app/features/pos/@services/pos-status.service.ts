import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PosService } from './pos.service';
import { ShiftData } from '../interfaces/pos.interfaces';

@Injectable({
  providedIn: 'root'
})
export class PosStatusService implements OnInit {
  private shiftActiveSubject = new BehaviorSubject<boolean>(false);
  shiftActive$: Observable<boolean> = this.shiftActiveSubject.asObservable();
  private shiftDataSubject = new BehaviorSubject<ShiftData | null>(null);
  shiftData$ = this.shiftDataSubject.asObservable();

  constructor(private posService: PosService) { }

  ngOnInit(): void {
    this.updateShiftStatus(); // Initial load on service creation
  }

  updateShiftStatus(): void {
    this.posService.shiftStatus().subscribe({
      next: (res: any) => {
        this.shiftActiveSubject.next(res?.is_active ?? false);
        this.shiftDataSubject.next(res);
      },
      error: () => {
        this.shiftActiveSubject.next(false)
        this.shiftDataSubject.next(null);
      }
    });
  }

  setShiftStatus(status: boolean): void {
    this.shiftActiveSubject.next(status);
  }

  get shiftData() {
    return this.shiftDataSubject.value;
  }

  setShiftData(shiftData: ShiftData | null) {
    this.shiftDataSubject.next(shiftData);
  }
}
