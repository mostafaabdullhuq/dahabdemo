import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PosService } from './pos.service';

@Injectable({
  providedIn: 'root'
})
export class PosStatusService {
  private shiftActiveSubject = new BehaviorSubject<boolean>(false);
  shiftActive$: Observable<boolean> = this.shiftActiveSubject.asObservable();
  private shiftDataSubject = new BehaviorSubject<any>(null);
shiftData$ = this.shiftDataSubject.asObservable();

get shiftData() {
  return this.shiftDataSubject.value;
}  constructor(private posService: PosService) {
    this.checkShiftStatus(); // Initial load on service creation
  }

  checkShiftStatus(): void {
    this.posService.shiftStatus().subscribe({
      next: (res: any) => {
        this.shiftActiveSubject.next(res.is_active);
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
}
