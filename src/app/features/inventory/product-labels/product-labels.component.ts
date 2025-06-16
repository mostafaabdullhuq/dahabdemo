import { Component, ComponentRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { DropdownsService } from '../../../core/services/dropdowns.service';
import { LabelPrintComponent } from './label-print/label-print.component';
import { Dialog } from '@angular/cdk/dialog'; // or your dialog/modal system
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-labels',
  imports: [SharedModule],
  templateUrl: './product-labels.component.html',
  styleUrl: './product-labels.component.scss'
})
export class ProductLabelsComponent implements OnInit {
  labelForm!: FormGroup;
  products: any[] = [];
  queryProductId: string | null = null;

  showPrice = [
    { id: 'Inc. Tax', name: 'Inc. Tax' },
    { id: 'Exc. Tax', name: 'Exc. Tax' },
  ];
  
  barcodeType = [
    { id: 'Synthetic coated', name: 'Synthetic coated' },
    { id: 'Butterfly', name: 'Butterfly' },
  ];

  constructor(
    private _formBuilder: FormBuilder,
    private _dropdownService: DropdownsService,
    private _route: ActivatedRoute,
    private dialog: Dialog
  ) {}

  ngOnInit(): void {
    // 1. Get query param
    this.queryProductId = this._route.snapshot.queryParamMap.get('id');

    // 2. Initialize form
    this.labelForm = this._formBuilder.group({
      selected_product: [''],
      show_price: ['Inc. Tax'],
      barcode_type: [''],
      color: [false],
      category: [true],
      weight: [true],
      brand: [false],
      designer: [false],
      size: [true],
      purity: [true],
      printer_name: [],
      products: this._formBuilder.array([]),
    });

    // 3. Load products then set selected product
    this._dropdownService.getProducts(false).subscribe(res => {
      this.products = res?.results;

      if (this.queryProductId) {
        const match = this.products.find(p => p.id === +this.queryProductId!);
        if (match) {
          this.labelForm.patchValue({ selected_product: match.id });
        }
      }
    });
    
  }

  get productArray(): FormArray {
    return this.labelForm.get('products') as FormArray;
  }

  addProduct() {
    const selectedProductId = this.labelForm.get('selected_product')?.value;
    const selectedProduct = this.products.find(p => p.id === selectedProductId);
    if (!selectedProduct) return;

    const alreadyAdded = this.productArray.controls.some(
      (ctrl: any) => ctrl.value.product_id === selectedProductId
    );
    if (alreadyAdded) return;
console.log(selectedProduct);

    const productGroup = this._formBuilder.group({
      product_id: [selectedProduct.id],
      name: [selectedProduct.name],
      label_count: [1],
      tag_number: [selectedProduct.tag_number],
      color: [selectedProduct.color],
      weight: [selectedProduct.weight],
      designer: [selectedProduct.designer],
      purity: [selectedProduct.purity],
      unit: [selectedProduct.unit],
      category: [selectedProduct.category],
      price: [selectedProduct.price],
      brand: [selectedProduct.brand],
      size: [selectedProduct.size],
      description: [selectedProduct.description],
    });

    this.productArray.push(productGroup);
    this.labelForm.get('selected_product')?.reset();
  }

  removeProduct(index: number) {
    this.productArray.removeAt(index);
  }

  @ViewChild('labelContainer', { read: ViewContainerRef }) container!: ViewContainerRef;
  private componentRef!: ComponentRef<LabelPrintComponent>;

  onSubmit() {
    if (this.labelForm.valid) {
      this.container.clear();
      this.componentRef = this.container.createComponent(LabelPrintComponent);
      this.componentRef.instance.formData = this.labelForm.value;
      this.componentRef.instance.products = this.labelForm.value.products;
      this.componentRef.instance.printType = this.labelForm.get('barcode_type')?.value;
      this.componentRef.instance.showDialog();
    }
  }
}
