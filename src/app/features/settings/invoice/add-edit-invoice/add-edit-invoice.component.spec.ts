import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditInvoiceComponent } from './add-edit-invoice.component';

describe('AddEditInvoiceComponent', () => {
  let component: AddEditInvoiceComponent;
  let fixture: ComponentFixture<AddEditInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditInvoiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
