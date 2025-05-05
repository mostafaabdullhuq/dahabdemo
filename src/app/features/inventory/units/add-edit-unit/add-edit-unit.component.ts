import { Component } from '@angular/core';
import { InventoryService } from '../../@services/inventory.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DropdownsService } from '../../../../core/services/dropdowns.service';
import { ActivatedRoute } from '@angular/router';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-add-edit-unit',
  imports: [SharedModule],
  templateUrl: './add-edit-unit.component.html',
  styleUrl: './add-edit-unit.component.scss'
})
export class AddEditUnitComponent {
    addEditUnitForm!: FormGroup;
    isEditMode = false;
    unitId: string | number = '';
    units:any[] =[];
  
    nextPageUrl: string | null = null;
    isLoading = false;
    selectedBranches =[];
  
    constructor(
      private _inventoryService: InventoryService,
      private _formBuilder: FormBuilder,
      private _dropdownService: DropdownsService,
      private _activeRoute:ActivatedRoute
    ) {}
  
    ngOnInit(): void {
      const unitId = this._activeRoute.snapshot.paramMap.get('id');
    console.log(unitId);
    if(unitId)
      this.unitId = unitId;
      this.initForm();
      if (this.unitId) {
        this.loadUnitData(this.unitId);
        this.isEditMode = true
      }
      this._dropdownService.getUnits().subscribe(data => {
        this.units = data?.results;
      });
    }
  
    private initForm(): void {
      this.addEditUnitForm = this._formBuilder.group({
        name: ['', [Validators.required]],
        parent_unit_id: [''],
        conversion_factor: [''],
      });
    }
  
    private loadUnitData(unitId: number | string): void {
      this._inventoryService.getUnitById(unitId).subscribe((unit:any) => {
        this.addEditUnitForm.patchValue({
          name: unit?.name,
        parent_unit_id: unit?.unit_conversions?.parent_unit,
        conversion_factor: unit?.unit_conversions?.conversion_factor,
        });
      });
    }
  
    onSubmit(): void {
      if (this.addEditUnitForm.invalid) return;
  
      const formData = this.addEditUnitForm?.value;
      console.log(this.selectedBranches);
      
      if (this.isEditMode && this.unitId) {
        this._inventoryService.updateUnit(this.unitId, formData).subscribe({
          next: res => console.log('User updated successfully', res),
          error: err => console.error('Error updating user', err)
        });
      } else {
        this._inventoryService.addUnit(formData).subscribe({
          next: res => console.log('User created successfully', res),
          error: err => console.error('Error creating user', err)
        });
      }
    }
}
