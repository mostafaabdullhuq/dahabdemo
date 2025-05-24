import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { RouterLink } from '@angular/router';
import { SettingsService } from '../@services/settings.service';
import { ConfirmationPopUpService } from '../../../shared/services/confirmation-pop-up.service';

@Component({
  selector: 'app-invoice',
  imports: [SharedModule ,RouterLink],
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.scss'
})
export class InvoiceComponent implements OnInit{
  layouts:any = [];
  isActive:boolean = false;
  constructor(private _settingService:SettingsService , private _confirmPopUp:ConfirmationPopUpService){}
  ngOnInit(): void {
    this._settingService.getInvoiceLayouts().subscribe(res =>{
      this.layouts = res
    })
  }

onToggleChange(item: any, checked: boolean) {
  item.is_active = checked;

  const formData = new FormData();
  formData.append('id', item.id.toString());
  formData.append('is_active', checked ? '1' : '0');

  this._settingService.updateInvoiceLayout(item?.id,formData).subscribe({
    next: (response) => {
      console.log('Status updated successfully', response);
    },
    error: (err) => {
      console.error('Failed to update status', err);
      // Revert toggle on error:
      item.is_active = !checked;
    }
  });
}
  showConfirmDelete(id: any) {
    this._confirmPopUp.confirm({
      message: 'Do you want to delete this item?',
      header: 'Confirm Delete',
      onAccept: () => {
        this.deleteInvoice(id);
      },
      target: id
    });
  }
deleteInvoice(id:any){
  this._settingService.deleteInvoiceLayout(id).subscribe()
}
}
