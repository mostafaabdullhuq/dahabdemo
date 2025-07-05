import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AccService } from '../../@services/acc.service';
import { DropdownsService } from '../../../../core/services/dropdowns.service';
import { forkJoin } from 'rxjs';
import { ToasterMsgService } from '../../../../core/services/toaster-msg.service';


@Component({
  selector: 'app-add-edit-journal-entry',
  imports: [SharedModule],
  templateUrl: './add-edit-journal-entry.component.html',
  styleUrl: './add-edit-journal-entry.component.scss'
})
export class AddEditJournalEntryComponent implements OnInit {
  addEditJournalForm!: FormGroup;
  isEditMode = false;
  productId: string | number = '';

  accounts: any[] = [];
  users: any[] = [];
  customers: any[] = [];
  suppliers: any[] = [];
  branches: any[] = []

  nextPageUrl: string | null = null;
  isLoading = false;
  selectedBranches = [];
  selectedPurityValue: number = 1;

  constructor(
    private _accService: AccService,
    private _formBuilder: FormBuilder,
    private _dropdownService: DropdownsService,
    private _activeRoute: ActivatedRoute,
    private _toasterService: ToasterMsgService,
    private _router: Router
  ) { }
  decimalInputs = 3;
  ngOnInit(): void {
    const productId = this._activeRoute.snapshot.paramMap.get('id');
    if (productId)
      this.productId = productId;
    this.initForm();

    if (this.productId) {
      this.loadExpenseData(this.productId);
      this.isEditMode = true
    }

    this._dropdownService.getUsers().subscribe(res => {
      this.users = res?.results
    });

    this._dropdownService.getSuppliers().subscribe(res => {
      this.suppliers = res?.results
    });

    this._dropdownService.getCustomers().subscribe(res => {
      this.customers = res?.results
    });

    this._dropdownService.getAccounts().subscribe(res => {
      this.accounts = res
    });

    this._dropdownService.getBranches().subscribe(res => {
      this.branches = res?.results
    })
  }
  private initForm(): void {
    this.addEditJournalForm = this._formBuilder.group({
      reference_number: [''],
      description: [''],
      branch: [''],
      date: [''],
      /// lines array
      lines: this._formBuilder.array([]),
      validators: [this.debitCreditMatchValidator()]
    });
  }

  debitCreditMatchValidator(): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      const lines = (form.get('lines') as FormArray)?.controls;
      if (!lines) return null;

      let totalDebit = 0;
      let totalCredit = 0;

      lines.forEach(group => {
        totalDebit += +group.get('debit')?.value || 0;
        totalCredit += +group.get('credit')?.value || 0;
      });

      return totalDebit !== totalCredit ? { debitCreditMismatch: true } : null;
    };
  }
  get lines(): FormArray {
    return this.addEditJournalForm.get('lines') as FormArray;
  }
  removeLine(index: number): void {
    this.lines.removeAt(index);
  }
  addLine(): void {
    const lineGroup = this._formBuilder.group({
      description: [''],
      credit: [''],
      debit: [''],
      tax_rate: [0],
      is_quantity: [false],
      account: [null],
      user: [null],
      customer: [null],
      supplier: [null],
      branch: [null]
    });

    this.handleMutualExclusion(lineGroup); // 👈 handle disable logic

    this.lines.push(lineGroup);
  }

  private handleMutualExclusion(lineGroup: FormGroup): void {
    lineGroup.get('debit')?.valueChanges.subscribe(value => {
      const creditCtrl = lineGroup.get('credit');
      if (value) {
        creditCtrl?.disable({ emitEvent: false });
      } else {
        creditCtrl?.enable({ emitEvent: false });
      }
    });

    lineGroup.get('credit')?.valueChanges.subscribe(value => {
      const debitCtrl = lineGroup.get('debit');
      if (value) {
        debitCtrl?.disable({ emitEvent: false });
      } else {
        debitCtrl?.enable({ emitEvent: false });
      }
    });
  }

  private loadExpenseData(expenseId: number | string): void {
    this._accService.getJournalEntryById(expenseId).subscribe((expense: any) => {
      this.addEditJournalForm.patchValue({
        reference_number: expense.reference_number,
        date: new Date(expense.date),
        description: expense.description,
        branch: expense.branch,
        credit: expense.credit,
        debit: expense.debit,
        tax_rate: expense.tax_rate,
        is_quantity: expense.is_quantity,
        account: expense.account,
        user: expense.user,
        customer: expense.customer,
        supplier: expense.supplier,
      });

      const linesArray = this._formBuilder.array<FormGroup<any>>([]);

      (expense.lines || []).forEach((line: any) => {
        linesArray.push(this._formBuilder.group({
          description: [line.description],
          credit: [line.credit],
          debit: [line.debit],
          tax_rate: [line.tax_rate],
          is_quantity: [line.is_quantity],
          account: [line.account],
          user: [line.user],
          customer: [line.customer],
          supplier: [line.supplier],
        }));
      });

      this.addEditJournalForm.setControl('lines', linesArray);
    });
  }

  get totalDebit(): number {
    return this.lines.controls.reduce((total, group) => {
      const value = +group.get('debit')?.value || 0;
      return total + value;
    }, 0);
  }

  get totalCredit(): number {
    return this.lines.controls.reduce((total, group) => {
      const value = +group.get('credit')?.value || 0;
      return total + value;
    }, 0);
  }

  onSubmit(): void {

    if (this.addEditJournalForm.invalid) return;

    const formValue = this.addEditJournalForm.value;

    const payload = {
      reference_number: formValue.reference_number,
      description: formValue.description,
      date: this.formatDate(formValue.date),
      branch: formValue.branch || '', // assuming branch is added somewhere in your form
      lines: formValue.lines.map((line: any) => ({
        description: line.description,
        credit: line.credit,
        debit: line.debit,
        tax_rate: line.tax_rate || 0,
        is_quantity: line.is_quantity || false,
        account: line.account,
        user: line.user,
        customer: line.customer,
        supplier: line.supplier,
      }))
    };
    if (this.isEditMode && this.productId)
      this._accService.updateJournalEntry(this.productId, payload).subscribe({
        next: res => {
          this._toasterService.showSuccess("Journal Entry Updated Successfully");
          this._router.navigate(['/acc/accounting'])
        },
        error: res => this._toasterService.showError(res?.message ?? 'Unexpected Error Happened', "Failed To Update Journal Entry")
      });
    else
      this._accService.addJournalEntry(payload).subscribe({
        next: res => {
          this._toasterService.showSuccess("Journal Entry Added Successfully");
          this._router.navigate(['/acc/accounting'])
        },
        error: res => this._toasterService.showError(res?.message ?? 'Unexpected Error Happened', "Failed To Add Journal Entry")
      })
  }

  private formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  }
}
