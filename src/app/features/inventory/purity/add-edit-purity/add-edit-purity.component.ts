import { Component } from '@angular/core';
import { InventoryService } from '../../@services/inventory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DropdownsService } from '../../../../core/services/dropdowns.service';
import { ActivatedRoute } from '@angular/router';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-add-edit-purity',
  imports: [SharedModule],
  templateUrl: './add-edit-purity.component.html',
  styleUrl: './add-edit-purity.component.scss'
})
export class AddEditPurityComponent {
  addEditPurityForm!: FormGroup;
  isEditMode = false;
  purityId: string | number = '';
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
    const purityId = this._activeRoute.snapshot.paramMap.get('id');
  if(purityId)
    this.purityId = purityId;
    this.initForm();
    if (this.purityId) {
      this.loadPurityData(this.purityId);
      this.isEditMode = true
    }
    this._dropdownService.getUnits().subscribe(data => {
      this.units = data?.results;
    });
  }

  private initForm(): void {
    this.addEditPurityForm = this._formBuilder.group({
      name: ['', [Validators.required]],
      purity_value: ['',[Validators.required]],
    });
  }

  private loadPurityData(purityId: number | string): void {
    this._inventoryService.getPurityById(purityId).subscribe((purity:any) => {
      this.addEditPurityForm.patchValue({
        name: purity?.name,
      purity_value: purity?.purity_value,
      });
    });
  }

  onSubmit(): void {
    if (this.addEditPurityForm.invalid) return;

    const formData = this.addEditPurityForm?.value;
    console.log(this.selectedBranches);
    
    if (this.isEditMode && this.purityId) {
      this._inventoryService.updateUnit(this.purityId, formData).subscribe({
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
