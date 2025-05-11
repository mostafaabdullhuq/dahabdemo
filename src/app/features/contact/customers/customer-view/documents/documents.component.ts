import { SharedModule } from './../../../../../shared/shared.module';
import { Component, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ContactService } from '../../../@services/contact.service';
import { MenuItem } from 'primeng/api';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AttachedDocsComponent } from './attached-docs/attached-docs.component';

@Component({
  selector: 'app-documents',
  imports: [SharedModule,AttachedDocsComponent],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.scss'
})
export class DocumentsComponent implements OnInit{
  transData: any = [];
  @Input() customerId: any = '';
  cols: any[] = [];
  totalRecords: number = 0;
  pageSize: number = 10;
  first: number = 0;
  filterForm!: FormGroup;
  attachedDocs:any = []
  constructor(private _contactService: ContactService, private _formBuilder: FormBuilder) { }
  ngOnInit(): void {
    if (this.customerId) {
      this.getDocs(this.customerId)
    }
    this.cols = [
      { field: "id", header: "ID" },
    { field: "created_at", header: "Date" },
    { field: "order_type", header: "Order Type" },
    ];
    this.filterForm = this._formBuilder.group({
      search: '',
      created_at__gte: '',
      created_at__lte: '',
    });
    this.getDocs(this.customerId);

  }
  getDocs(id: any, search: string = '', page: number = 1, pageSize: number = 10) {
    this._contactService.getCustomerDocuments(id, search, page, pageSize)?.subscribe((res: any) => {
      this.transData = res?.order_docs?.results || [];
      this.attachedDocs = res?.customer_attachments || [];
    })
  }

  loadCustomersTrans(event: any): void {
    const page = event.first / event.rows + 1;
    const pageSize = event.rows;

    this.first = event.first;
    this.pageSize = pageSize;
    this._contactService.getCustomerDocuments(this.customerId)?.subscribe((res: any) => {
      this.transData = res?.order_docs?.results || [];
      this.attachedDocs = res?.customer_attachments || [];
      this.totalRecords = res.count;
    })
  }
  selectedProduct: any;

  customersMenuItems: MenuItem[] = [
    {
      label: 'Edit',
      icon: 'pi pi-fw pi-pen-to-square',
      command: () => console.log('gdfg')

    },
    {
      label: 'View',
      icon: 'pi pi-fw pi-eye',
      command: () => console.log('gdfg')
    },
    {
      label: 'Delete',
      icon: 'pi pi-fw pi-trash',
      command: () => console.log('gdfg')
    }
  ];
  @ViewChild('attachmentContainer', { read: ViewContainerRef }) container!: ViewContainerRef;

  addAttachment() {
    const ref = this.container.createComponent(AttachedDocsComponent);
    ref.instance.visible = true;
    ref.instance.customerId = this.customerId;
    ref.instance.attachmentList = this.attachedDocs;
  }
  onSearch(): void {
    const formValues = this.filterForm.value;

    const queryParts: string[] = [];

    Object.keys(formValues).forEach(key => {
      let value = formValues[key];

      // Format date fields
      if ((key === 'created_at__gte' || key === 'created_at__lte') && value) {
        const date = new Date(value);
        const formattedDate = date.toISOString().split('T')[0]; // "YYYY-MM-DD"
        value = formattedDate;
      }

      if (value !== null && value !== '' && value !== undefined) {
        const encodedKey = encodeURIComponent(key);
        const encodedValue = encodeURIComponent(value).replace(/%20/g, '+');
        queryParts.push(`${encodedKey}=${encodedValue}`);
      }
    });

    const queryParams = queryParts.join('&');

    this.getDocs(this.customerId, queryParams, 1, 10);
  }

}
