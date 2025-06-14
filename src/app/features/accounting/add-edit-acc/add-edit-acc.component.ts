import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DropdownsService } from '../../../core/services/dropdowns.service';
import { ContactService } from '../../contact/@services/contact.service';
import { AccService } from '../@services/acc.service';

@Component({
  selector: 'app-add-edit-acc',
  imports: [SharedModule],
  templateUrl: './add-edit-acc.component.html',
  styleUrl: './add-edit-acc.component.scss'
})
export class AddEditAccComponent implements OnInit {
  visible: boolean = false;
  @Output() onSubmitAcc = new EventEmitter<any>();

  showDialog() {
    this.visible = true;
  }

  addEditAccForm!: FormGroup;
  isEditMode = false;
  accId: string | number = '';
accounts = [
  { id: 'asset', name: 'Asset' },
  { id: 'liability', name: 'Liability' },
  { id: 'capital', name: 'Capital' },
  { id: 'value_added_tax', name: 'Value Added Tax' },
  { id: 'reserves', name: 'Reserves' },
  { id: 'equity', name: 'Equity' },
  { id: 'accumulated_profit', name: 'Accumulated Profit' },
  { id: 'partners_current_account', name: 'Partners Current Account' },
  { id: 'cost_of_gold_sold', name: 'Cost of Gold Sold' },
  { id: 'other_income', name: 'Other Income' },
  { id: 'revenue', name: 'Revenue' },
  { id: 'expense', name: 'Expense' }
];  subAcc: any[] = [];
  subSubAcc: any[] = [];
  nextPageUrl: string | null = null;
  isLoading = false;
  selectedBranches = [];
  customFields: any = [];

  constructor(
    private _accService: AccService,
    private _formBuilder: FormBuilder,
    private _dropdownService: DropdownsService,
  ) { }

  ngOnInit(): void {
    console.log(this.accId);
    if (this.accId)
      this.accId = this.accId;
    this.initForm();
    if (this.accId) {
      this.loadAccData(this.accId);
      this.isEditMode = true
    }

    // this._dropdownService.getMainAccounts().subscribe(data => {
    //   this.accounts = data;
    // });
    this._dropdownService.getAccounts().subscribe(res => {
      if (this.isEditMode) {
        this.loadAccData(this.accId);
      }
    });

    this.addEditAccForm.get('account_type')?.valueChanges.subscribe(res => {
      this._accService.getAccSearchByParams(res).subscribe((res: any) => {
        this.subAcc = res || [];
      })
    });
    this.addEditAccForm.get('parent_type')?.valueChanges.subscribe(res => {
      this._accService.getAccById(res).subscribe((res: any) => {
        this.subSubAcc = res?.subaccounts || [];
      })
    });
  }

  private initForm(): void {
    this.addEditAccForm = this._formBuilder.group({
      name: ['', Validators.required],
      opening_balance: ['', Validators.required], // Renamed from 'cpr'
      account_type: [''], // Instead of 'group'
      date: [''],
      description: [''],
      sub_acc: [''],
      parent_type: [null],
    });
  }



  private loadAccData(accId: number | string): void {
    this._accService.getAccById(accId).subscribe((acc: any) => {
      const selectedSubAccountIds = acc?.subaccounts?.map((sub: any) => sub.id) || [];

      this.addEditAccForm.patchValue({
        name: acc?.name,
        opening_balance: acc?.opening_balance,
        account_type: acc?.account_type,
        date: new Date(acc?.created_at),
        description: acc?.description,
        sub_acc: acc?.parent,
        // parent_types: selectedSubAccountIds
      });
    });
  }

  onSubmit(): void {
    if (this.addEditAccForm.invalid) {
      this.addEditAccForm.markAllAsTouched();
      return;
    }
const formatDate = (dateStr: string | Date): string => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};
    const formValue = this.addEditAccForm.value;
    // Determine the correct parent account ID to send
    const parentAccountId = formValue.sub_acc || formValue.parent_type || formValue.account_type || '';

    const payload = {
      name: formValue.name,
      account_type: formValue.account_type, // send the name, not the ID
      opening_balance: formValue.opening_balance,
      date: formatDate(formValue.date),
      description: formValue.description,
    };

    const request$ = this.isEditMode && this.accId
      ? this._accService.updateAcc(this.accId, payload)
      : this._accService.addAcc(payload, parentAccountId);

    request$.subscribe({
      next: res =>this.visible = false ,
      error: err => console.error('Error', err)
    });
  }
}
