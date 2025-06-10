import { Component, ComponentRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { DropdownsService } from '../../../core/services/dropdowns.service';
import { LabelPrintComponent } from './label-print/label-print.component';
import { Dialog } from '@angular/cdk/dialog'; // or your dialog/modal system

@Component({
  selector: 'app-product-labels',
  imports: [SharedModule],
  templateUrl: './product-labels.component.html',
  styleUrl: './product-labels.component.scss'
})
export class ProductLabelsComponent implements OnInit{
  labelForm!: FormGroup;
  products: any[] = [];
  showPrice:any[] = [
    {id:'Inc. Tax',name:'Inc. Tax'},
    {id:'Exc. Tax',name:'Exc. Tax'},
  ]
    barcodeType:any[] = [
    {id:'Synthetic coated',name:'Synthetic coated'},
    {id:'Butterfly',name:'Butterfly'},
  ]
  constructor(
    private _formBuilder: FormBuilder,
    private _dropdownService: DropdownsService,
    private dialog: Dialog
  ) {}

  ngOnInit(): void {
    this.labelForm = this._formBuilder.group({
      selected_product: [''],
      show_price: ['Inc. Tax'],
      barcode_type: [''],
      // Individual checkbox flags
      color: [false],
      category: [false],
      weight: [false],
      brand: [false],
      designer: [false],
      size: [false],
      purity: [false],
      products: this._formBuilder.array([])
    });

    this._dropdownService.getProducts(false).subscribe(res => {
      this.products = res?.results;
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
      (      ctrl: { value: { product_id: any; }; }) => ctrl.value.product_id === selectedProductId
    );
    if (alreadyAdded) return;

    const productGroup = this._formBuilder.group({
      product_id: [selectedProduct.id],
      name: [selectedProduct.name],
      label_count: [1],
      tag_number: [selectedProduct.tag_number]
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
