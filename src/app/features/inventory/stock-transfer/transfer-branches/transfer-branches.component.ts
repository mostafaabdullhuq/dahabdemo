import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from '../../@services/inventory.service';
import { ActivatedRoute } from '@angular/router';
import { SharedModule } from '../../../../shared/shared.module';
import { DropdownsService } from '../../../../core/services/dropdowns.service';

@Component({
  selector: 'app-transfer-branches',
  imports: [SharedModule],
  templateUrl: './transfer-branches.component.html',
  styleUrl: './transfer-branches.component.scss'
})
export class TransferBranchesComponent {
  addEditStoneForm!: FormGroup;
  isEditMode = false;
  stoneId: string | number = '';
  branches =[];
  products =[];
  nextPageUrl: string | null = null;
  isLoading = false;
  selectedBranches =[];

  constructor(
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder,
    private _activeRoute:ActivatedRoute,
    private _dropdownService:DropdownsService,
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

    this._dropdownService.getBranches().subscribe(data => {
      this.branches = data?.results;
    });
    this._dropdownService.getProducts().subscribe(data => {
      this.products = data?.results;
    });
  }

  private initForm(): void {
    this.addEditStoneForm = this._formBuilder.group({
      from_branch: ['', [Validators.required]],
      to_branch: ['', [Validators.required]],
      product_id: ['', [Validators.required]],
    });
  }

  private loadStonesData(stoneId: number | string): void {
    this._inventoryService.getStoneById(stoneId).subscribe((stone:any) => {
      this.addEditStoneForm.patchValue({
        from_branch: stone?.name
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
