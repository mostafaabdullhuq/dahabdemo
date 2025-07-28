import { Component } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { PaymentsComponent } from './payments/payments.component';
import { DocumentsComponent } from './documents/documents.component';
import { TransactionsComponent } from './inventory/inventory.component';
import { ActivatedRoute } from '@angular/router';
import { ContactService } from '../../@services/contact.service';
import { ParchasesComponent } from "./parchases/parchases.component";
import { SuppliersLedgerComponent } from "./suppliers-ledger/suppliers-ledger.component";
import { SupplierSummaryRes } from '../suppliers.models';

@Component({
  selector: 'app-supplier-view',
  imports: [SharedModule, PaymentsComponent, DocumentsComponent, TransactionsComponent, ParchasesComponent, SuppliersLedgerComponent],
  templateUrl: './supplier-view.component.html',
  styleUrl: './supplier-view.component.scss'
})
export class SupplierViewComponent {
  customerData: any = [];
  transData: any = [];
  supplierId: any = '';
  cols: any = [];
  supplierSummary?: SupplierSummaryRes;

  constructor(private _activeRoute: ActivatedRoute, private _contactService: ContactService) { }

  ngOnInit(): void {
    const customerId = this._activeRoute.snapshot.paramMap.get('id');

    if (customerId) {
      this.supplierId = customerId;
      this.getSupplierById(customerId);
    }

    this._contactService.getSupplierSummaryById(this.supplierId).subscribe(res => {
      this.supplierSummary = res;
    })

    this.cols = [
      { field: "name", header: "Name" },
      { field: "email", header: "Email" },
      { field: "phone", header: "Phone" },
      { field: "address", header: "Address" },
      { field: "cpr", header: "CPR" },
      { field: "group_name", header: "Group" },
      { field: "created_at", header: "Created At" },
      { field: "created_by_name", header: "Created By" },
    ];
  }

  getSupplierById(id: any) {
    this._contactService.getSupplierById(id).subscribe(res => {
      this.customerData = res;
    })
  }
}
