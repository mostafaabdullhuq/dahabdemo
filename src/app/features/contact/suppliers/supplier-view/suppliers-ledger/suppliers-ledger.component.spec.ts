import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuppliersLedgerComponent } from './suppliers-ledger.component';

describe('SuppliersLedgerComponent', () => {
  let component: SuppliersLedgerComponent;
  let fixture: ComponentFixture<SuppliersLedgerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuppliersLedgerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuppliersLedgerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
