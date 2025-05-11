import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactService } from '../../../../@services/contact.service';
import { ConfirmationPopUpService } from '../../../../../../shared/services/confirmation-pop-up.service';
import { SharedModule } from '../../../../../../shared/shared.module';

@Component({
  selector: 'app-attached-docs',
  imports: [SharedModule],
  templateUrl: './attached-docs.component.html',
  styleUrl: './attached-docs.component.scss'
})
export class AttachedDocsComponent {
  visible: boolean = false;
  customerId:any = ''
  showDialog() {
      this.visible = true;
  }
  form!: FormGroup;
  attachmentList :any = [];
  constructor(private _formbuilder: FormBuilder , private _contactService:ContactService,  private _confirmPopUp: ConfirmationPopUpService
  ) {}

  ngOnInit() {
    this.form = this._formbuilder.group({
      attachment: ['', Validators.required],
      description: ['', Validators.required],
      customer_id: [this.customerId, Validators.required]
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.value;
      const formData = new FormData();
  
      // Ensure 'attachment' is a File object
      const attachment = formValue.attachment;
  
      formData.append('attachment', attachment);
      formData.append('description', formValue.description);
      formData.append('customer_id', formValue.customer_id);
  
      // Example: send to backend
      this._contactService.addAttachSupplier(this.customerId , formData).subscribe(res=>{
        if(res){
          this.form.reset()
        }
      })
  }
}
viewAttachment(url: string) {
  window.open(url, '_blank');
}
deleteAttach(id:any){
  this._contactService.deleteAttachSupplier(this.customerId , id).subscribe(res=>{
    
  })
}
showConfirmDelete(id: any) {
  this._confirmPopUp.confirm({
    message: 'Do you want to delete this item?',
    header: 'Confirm Delete',
    onAccept: () => {
      this.deleteAttach(id);
    },
    target: id
  });
}
}
