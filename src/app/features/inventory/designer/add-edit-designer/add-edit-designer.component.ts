import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from '../../@services/inventory.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-add-edit-designer',
  imports: [SharedModule],
  templateUrl: './add-edit-designer.component.html',
  styleUrl: './add-edit-designer.component.scss'
})
export class AddEditDesignerComponent {
  addEditDesignerForm!: FormGroup;
  isEditMode = false;
  designerId: string | number = '';
  categories: any[] = [];

  nextPageUrl: string | null = null;
  isLoading = false;
  selectedBranches = [];

  constructor(
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder,
    private _activeRoute: ActivatedRoute,
    private _router: Router
  ) { }

  ngOnInit(): void {
    const designerId = this._activeRoute.snapshot.paramMap.get('id');
    if (designerId)
      this.designerId = designerId;
    this.initForm();
    if (this.designerId) {
      this.loadDesignersData(this.designerId);
      this.isEditMode = true
    }
  }

  private initForm(): void {
    this.addEditDesignerForm = this._formBuilder.group({
      name: ['', [Validators.required]],
    });
  }

  private loadDesignersData(designerId: number | string): void {
    this._inventoryService.getDesignerById(designerId).subscribe((unit: any) => {
      this.addEditDesignerForm.patchValue({
        name: unit?.name,
      });
    });
  }

  onSubmit(): void {
    if (this.addEditDesignerForm.invalid) return;

    const formData = this.addEditDesignerForm?.value;

    if (this.isEditMode && this.designerId) {
      this._inventoryService.updateDesigner(this.designerId, formData).subscribe({
        next: res => this._router.navigate([`inventory/designers`]),
        error: err => console.error('Error updating user', err)
      });
    } else {
      this._inventoryService.addDesigner(formData).subscribe({
        next: res => this._router.navigate([`inventory/designers`]),
        error: err => console.error('Error creating user', err)
      });
    }
  }
}
