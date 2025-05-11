import { Component } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { PaymentsComponent } from './payments/payments.component';
import { DocumentsComponent } from './documents/documents.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { ActivatedRoute } from '@angular/router';
import { ContactService } from '../../@services/contact.service';

@Component({
  selector: 'app-supplier-view',
  imports: [SharedModule , PaymentsComponent, DocumentsComponent , TransactionsComponent],
  templateUrl: './supplier-view.component.html',
  styleUrl: './supplier-view.component.scss'
})
export class SupplierViewComponent {
  customerData:any = [];
  transData:any = [];
  customerId:any ='';
  cols:any = []
  constructor( private _activeRoute:ActivatedRoute,private _contactService:ContactService){}
    ngOnInit(): void {
      const customerId = this._activeRoute.snapshot.paramMap.get('id');
      if(customerId){
        this.customerId = customerId;
        this.getSupplierById(customerId);
      }
      this.cols = [
        { field: "name", header: "Name" },
        { field: "email", header: "Email" },
        { field: "phone", header: "Phone" },
        { field: "address", header: "Address" },
        { field: "cpr", header: "CPR" },
        { field: "group_name", header: "Group" },
        { field: "created_at", header: "Created At" },
        { field: "created_by", header: "Created By" },
        { field: "business", header: "Business" },
      ];
    }
  
    getSupplierById(id:any){
      this._contactService.getSupplierById(id).subscribe(res=>{
        this.customerData = res;
      })
    }
  
}
