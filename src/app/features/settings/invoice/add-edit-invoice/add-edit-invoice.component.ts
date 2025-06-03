import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SharedModule } from '../../../../shared/shared.module';
import { SettingsService } from '../../@services/settings.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-edit-invoice',
  imports: [SharedModule],
  templateUrl: './add-edit-invoice.component.html',
  styleUrl: './add-edit-invoice.component.scss'
})
export class AddEditInvoiceComponent implements OnInit {
  invoiceForm!:FormGroup;
  constructor(private _router:Router, private _formBuilder:FormBuilder , private _settingService:SettingsService){}
  ngOnInit(): void {
    this.invoiceForm = this._formBuilder.group({
      layout_name: [''],
      description: [''],
      header_text: [''],
      footer_text: [''],
      logo: [null],
      show_logo: [false],

      // Customer Information
      customer_name: [''],
      customer_email: [''],
      customer_number: [''],
      customer_cpr_number: [''],
      show_customer: [false],
      show_mobile_number: [false],

      // Product
      product_label: [''],
      quantity_label: [''],
      unit_label: [''],
      show_product_tag_number: [false],

      // Shop
      shop_name: [''],
      shop_cr_number: [''],
      shop_vat_number: [''],
      landmark: [''],
      show_branch: [false],
      shop_address: [false],

      // Pricing
      subtotal_label: [''],
      discount_label: [''],
      tax_label: [''],
      total_label: [''],

      // Invoice & Payment
      invoice_date: [''],
      invoice_number: [''],
      payment_method: [''],
      payment_date: ['']
    });
  }
  onSubmit(){
    // if (this.invoiceForm.invalid) return;
  
      const formData = this.invoiceForm?.value;      
        this._settingService.addInvoiceLayout(formData).subscribe({
          next: res => {console.log('User created successfully', res)
    this._router.navigate([`setting/invoice`]);
          },
          error: err => {
    this._router.navigate([`setting/invoice`]);
          }
        });
      }
}
