import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from '../../@services/inventory.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DropdownsService } from '../../../../core/services/dropdowns.service';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-add-edit-stock-point',
  imports: [SharedModule],
  templateUrl: './add-edit-stock-point.component.html',
  styleUrl: './add-edit-stock-point.component.scss'
})
export class AddEditStockPointComponent {
    addEditStockPointForm!: FormGroup;
    isEditMode = false;
    stockpointId: string | number = '';
    categories:any[] =[];
  
    nextPageUrl: string | null = null;
    isLoading = false;
    selectedBranches =[];
  
    constructor(
      private _inventoryService: InventoryService,
      private _formBuilder: FormBuilder,
      private _dropdownService: DropdownsService,
      private _activeRoute:ActivatedRoute,
          private _router:Router
    ) {}
  
    ngOnInit(): void {
      const stockpointId = this._activeRoute.snapshot.paramMap.get('id');
    if(stockpointId)
      this.stockpointId = stockpointId;
      this.initForm();
      if (this.stockpointId) {
        this.loadStockPointData(this.stockpointId);
        this.isEditMode = true
      }
    }
  
    private initForm(): void {
      this.addEditStockPointForm = this._formBuilder.group({
        name: ['', [Validators.required]],
      });
    }
  
    private loadStockPointData(stockpointId: number | string): void {
      this._inventoryService.getStockPointById(stockpointId).subscribe((sp:any) => {
        this.addEditStockPointForm.patchValue({
          name: sp?.name,
        });
      });
    }
  
    onSubmit(): void {
      if (this.addEditStockPointForm.invalid) return;
  
      const formData = this.addEditStockPointForm?.value;
      console.log(this.selectedBranches);
      
      if (this.isEditMode && this.stockpointId) {
        this._inventoryService.updateStockPoint(this.stockpointId, formData).subscribe({
        next: res => this._router.navigate([`inventory/stockpoints`]),
          error: err => console.error('Error updating user', err)
        });
      } else {
        this._inventoryService.addStockPoint(formData).subscribe({
        next: res => this._router.navigate([`inventory/stockpoints`]),
          error: err => console.error('Error creating user', err)
        });
      }
    }
}
