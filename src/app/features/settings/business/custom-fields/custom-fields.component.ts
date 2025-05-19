import { Component } from '@angular/core';
import { SettingsService } from '../../@services/settings.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SharedModule } from '../../../../shared/shared.module';
import { DropdownsService } from '../../../../core/services/dropdowns.service';

@Component({
  selector: 'app-custom-fields',
  imports: [SharedModule],
  templateUrl: './custom-fields.component.html',
  styleUrl: './custom-fields.component.scss'
})
export class CustomFieldsComponent {
    addEditBusinessForm!: FormGroup;
    isEditMode = false;
    busnissId: string | number = '';
    categories:any[] =[];
    nextPageUrl: string | null = null;
    isLoading = false;
    selectedBranches =[];
    timeZones:any[]=[];    
    currencies:any[]=[];
    timeFormat = [{ id: 1, name: "12 Hour" },{ id: 2, name: "24 Hour" }];
    dateFormat = [
    {
      id: 1,
      name: "dd-mm-yyyy",
    },
    {
      id: 2,
      name: "mm-dd-yyyy",
    },
    {
      id: 3,
      name: "dd/mm/yyyy",
    },
    {
      id: 4,
      name: "mm/dd/yyyy",
    },
  ];
   months = [
    { id: 1, name: "January" },
    { id: 2, name: "February" },
    { id: 3, name: "March" },
    { id: 4, name: "April" },
    { id: 5, name: "May" },
    { id: 6, name: "June" },
    { id: 7, name: "July" },
    { id: 8, name: "August" },
    { id: 9, name: "September" },
    { id: 10, name: "October" },
    { id: 11, name: "November" },
    { id: 12, name: "December" },
  ];  
    constructor(
      private _settingsService: SettingsService,
      private _dropdownsService: DropdownsService,
      private _formBuilder: FormBuilder,
    ) {}
  
    ngOnInit(): void {
      this.initForm();
        this.loadBrandsData();

      this._dropdownsService.getTimeZones().subscribe(res=>{
this.timeZones = res
      })
      this._dropdownsService.getCurrencies().subscribe(res=>{
this.currencies = res?.results
      })
        this.customFieldsForm = this.addEditBusinessForm.get('custom_fields') as FormGroup;

    }
  customFieldsForm!: FormGroup;

    private initForm(): void {
      this.addEditBusinessForm = this._formBuilder.group({
      custom_fields: this._formBuilder.group({
        customer: this._formBuilder.group({
          custom_field_1: [''],
          custom_field_2: [''],
          custom_field_3: ['']
        }),
        supplier: this._formBuilder.group({
          custom_field_1: [''],
          custom_field_2: [''],
          custom_field_3: ['']
        }),
        product: this._formBuilder.group({
          custom_field_1: ['ahmed'],
          custom_field_2: ['lulu'],
          custom_field_3: ['']
        }),
        purchase: this._formBuilder.group({
          custom_field_1: [''],
          custom_field_2: [''],
          custom_field_3: ['']
        }),
        branch: this._formBuilder.group({
          custom_field_1: [''],
          custom_field_2: [''],
          custom_field_3: ['']
        })
      })
    });
    }
  
private loadBrandsData(): void {
  this._settingsService.getCustomFields().subscribe((data: any) => {
    if (data?.custom_fields?.customer || data?.custom_fields?.supplier || data?.custom_fields?.product || data?.custom_fields?.purchase || data?.custom_fields?.branch) {
      
      this.addEditBusinessForm.get('custom_fields')?.patchValue({
        customer: {
          custom_field_1: data?.custom_fields.customer?.custom_field_1 || '',
          custom_field_2: data?.custom_fields.customer?.custom_field_2 || '',
          custom_field_3: data?.custom_fields.customer?.custom_field_3 || '',
        },
        supplier: {
          custom_field_1: data?.custom_fields.supplier?.custom_field_1 || '',
          custom_field_2: data?.custom_fields.supplier?.custom_field_2 || '',
          custom_field_3: data?.custom_fields.supplier?.custom_field_3 || '',
        },
        product: {
          custom_field_1: data?.custom_fields.product?.custom_field_1 || '',
          custom_field_2: data?.custom_fields.product?.custom_field_2 || '',
          custom_field_3: data?.custom_fields.product?.custom_field_3 || '',
        },
        purchase: {
          custom_field_1: data?.custom_fields.purchase?.custom_field_1 || '',
          custom_field_2: data?.custom_fields.purchase?.custom_field_2 || '',
          custom_field_3: data?.custom_fields.purchase?.custom_field_3 || '',
        },
        branch: {
          custom_field_1: data?.custom_fields.branch?.custom_field_1 || '',
          custom_field_2: data?.custom_fields.branch?.custom_field_2 || '',
          custom_field_3: data?.custom_fields.branch?.custom_field_3 || '',
        }
      });
    }
  });
}

  
onSubmit(): void {
  if (this.addEditBusinessForm.invalid) return;
  this._settingsService.updateCustomFields(this.addEditBusinessForm?.value).subscribe(res=>{})  
}
}
