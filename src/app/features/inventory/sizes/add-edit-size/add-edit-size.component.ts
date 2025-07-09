import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from '../../../../shared/shared.module';
import { InventoryService } from '../../@services/inventory.service';
import { DropdownsService } from '../../../../core/services/dropdowns.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-add-edit-size',
  imports: [SharedModule],
  templateUrl: './add-edit-size.component.html',
  styleUrl: './add-edit-size.component.scss'
})
export class AddEditSizeComponent {
  addEditSizeForm!: FormGroup;
  isEditMode = false;
  sizeId: string | number = '';
  units: any[] = [];

  nextPageUrl: string | null = null;
  isLoading = false;
  selectedBranches = [];

  constructor(
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder,
    private _dropdownService: DropdownsService,
    private _activeRoute: ActivatedRoute,
    private _router: Router
  ) { }

  ngOnInit(): void {
    const sizeId = this._activeRoute.snapshot.paramMap.get('id');
    if (sizeId)
      this.sizeId = sizeId;
    this.initForm();
    if (this.sizeId) {
      this.loadSizesData(this.sizeId);
      this.isEditMode = true
    }
    this._dropdownService.getUnits().subscribe(data => {
      this.units = data?.results;
    });
  }

  private initForm(): void {
    this.addEditSizeForm = this._formBuilder.group({
      name: ['', [Validators.required]],
    });
  }

  private loadSizesData(sizeId: number | string): void {
    this._inventoryService.getSizeById(sizeId).subscribe((size: any) => {
      this.addEditSizeForm.patchValue({
        name: size?.name,
      });
    });
  }

  onSubmit(): void {
    if (this.addEditSizeForm.invalid) return;

    const formData = this.addEditSizeForm?.value;

    if (this.isEditMode && this.sizeId) {
      this._inventoryService.updatePurity(this.sizeId, formData).subscribe({
        next: res => this._router.navigate([`inventory/sizes`]),
        error: err => console.error('Error updating user', err)
      });
    } else {
      this._inventoryService.addPurity(formData).subscribe({
        next: res => this._router.navigate([`inventory/sizes`]),
        error: err => console.error('Error creating user', err)
      });
    }
  }

}
