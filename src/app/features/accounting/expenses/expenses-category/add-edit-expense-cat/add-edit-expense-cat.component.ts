import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from '../../../../../shared/shared.module';
import { AccService } from '../../../@services/acc.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-add-edit-expense-cat',
  imports: [SharedModule],
  templateUrl: './add-edit-expense-cat.component.html',
  styleUrl: './add-edit-expense-cat.component.scss'
})
export class AddEditExpenseCatComponent {
  addEditCategoryForm!: FormGroup;
  isEditMode = false;
  brandId: string | number = '';
  categories: any[] = [];

  nextPageUrl: string | null = null;
  isLoading = false;
  selectedBranches = [];

  constructor(
    private _accService: AccService,
    private _formBuilder: FormBuilder,
    private _activeRoute: ActivatedRoute,
    private _router: Router
  ) { }

  ngOnInit(): void {
    const brandId = this._activeRoute.snapshot.paramMap.get('id');
    if (brandId)
      this.brandId = brandId;
    this.initForm();
    if (this.brandId) {
      this.loadCatData(this.brandId);
      this.isEditMode = true
    }

    this._accService.getExpenseCategories('', 1, 10000000000).subscribe(res => {
      this.categories = res?.results
    })
  }

  private initForm(): void {
    this.addEditCategoryForm = this._formBuilder.group({
      name: ['', [Validators.required]],
      parent: [''],
    });
  }

  private loadCatData(brandId: number | string): void {
    this._accService.getExpenseCategoryById(brandId).subscribe((unit: any) => {
      this.addEditCategoryForm.patchValue({
        name: unit?.name,
        parent: unit?.parent?.name
      });
    });
  }

  onSubmit(): void {
    if (this.addEditCategoryForm.invalid) return;

    const formData = this.addEditCategoryForm?.value;

    if (this.isEditMode && this.brandId) {
      this._accService.updateExpenseCategory(this.brandId, formData).subscribe({
        next: res => console.log('User updated successfully', res),
        error: err => console.error('Error updating user', err)
      });
    } else {
      this._accService.addExpenseCategory(formData).subscribe({
        next: res => {
          this._router.navigate(["/acc/expenses-cat"])
        },
        error: err => console.error('Error creating user', err)
      });
    }
  }
}
