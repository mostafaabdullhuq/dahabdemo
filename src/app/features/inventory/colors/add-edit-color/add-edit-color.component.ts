import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from '../../@services/inventory.service';
import { ActivatedRoute } from '@angular/router';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-add-edit-color',
  imports: [SharedModule],
  templateUrl: './add-edit-color.component.html',
  styleUrl: './add-edit-color.component.scss'
})
export class AddEditColorComponent {
  addEditColorForm!: FormGroup;
  isEditMode = false;
  colorId: string | number = '';

  nextPageUrl: string | null = null;
  isLoading = false;
  selectedBranches =[];

  constructor(
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder,
    private _activeRoute:ActivatedRoute
  ) {}

  ngOnInit(): void {
    const colorId = this._activeRoute.snapshot.paramMap.get('id');
  if(colorId)
    this.colorId = colorId;
    this.initForm();
    if (this.colorId) {
      this.loadColorsData(this.colorId);
      this.isEditMode = true
    }
  }

  private initForm(): void {
    this.addEditColorForm = this._formBuilder.group({
      name: ['', [Validators.required]],
    });
  }

  private loadColorsData(colorId: number | string): void {
    this._inventoryService.getColorById(colorId).subscribe((stone:any) => {
      this.addEditColorForm.patchValue({
        name: stone?.name
      });
    });
  }

  onSubmit(): void {
    if (this.addEditColorForm.invalid) return;

    const formData = this.addEditColorForm?.value;
    
    if (this.isEditMode && this.colorId) {
      this._inventoryService.updateColor(this.colorId, formData).subscribe({
        next: res => console.log('User updated successfully', res),
        error: err => console.error('Error updating user', err)
      });
    } else {
      this._inventoryService.addColor(formData).subscribe({
        next: res => console.log('User created successfully', res),
        error: err => console.error('Error creating user', err)
      });
    }
  }
}
