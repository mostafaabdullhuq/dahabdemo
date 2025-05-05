import { Component } from '@angular/core';
import { InventoryService } from '../../@services/inventory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-add-edit-stone',
  imports: [SharedModule],
  templateUrl: './add-edit-stone.component.html',
  styleUrl: './add-edit-stone.component.scss'
})
export class AddEditStoneComponent {
    addEditStoneForm!: FormGroup;
    isEditMode = false;
    stoneId: string | number = '';
  
    nextPageUrl: string | null = null;
    isLoading = false;
    selectedBranches =[];
  
    constructor(
      private _inventoryService: InventoryService,
      private _formBuilder: FormBuilder,
      private _activeRoute:ActivatedRoute
    ) {}
  
    ngOnInit(): void {
      const stoneId = this._activeRoute.snapshot.paramMap.get('id');
    if(stoneId)
      this.stoneId = stoneId;
      this.initForm();
      if (this.stoneId) {
        this.loadStonesData(this.stoneId);
        this.isEditMode = true
      }
    }
  
    private initForm(): void {
      this.addEditStoneForm = this._formBuilder.group({
        name: ['', [Validators.required]],
      });
    }
  
    private loadStonesData(stoneId: number | string): void {
      this._inventoryService.getStoneById(stoneId).subscribe((stone:any) => {
        this.addEditStoneForm.patchValue({
          name: stone?.name
        });
      });
    }
  
    onSubmit(): void {
      if (this.addEditStoneForm.invalid) return;
  
      const formData = this.addEditStoneForm?.value;
      
      if (this.isEditMode && this.stoneId) {
        this._inventoryService.updateStone(this.stoneId, formData).subscribe({
          next: res => console.log('User updated successfully', res),
          error: err => console.error('Error updating user', err)
        });
      } else {
        this._inventoryService.addStone(formData).subscribe({
          next: res => console.log('User created successfully', res),
          error: err => console.error('Error creating user', err)
        });
      }
    }
}
