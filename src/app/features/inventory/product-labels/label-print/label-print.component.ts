import { Component, Inject, Input } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { InventoryService } from '../../@services/inventory.service';

@Component({
  selector: 'app-label-print',
  imports: [SharedModule],
  templateUrl: './label-print.component.html',
  styleUrl: './label-print.component.scss'
})
export class LabelPrintComponent {
  @Input() formData: any;
  @Input() products: any[] = [];
  printType: string = 'Butterfly'

  constructor(private _inventoryService: InventoryService) { }
  ngOnInit(): void {
   
  }
 preparePayload() {
  const layout = this.printType.toLowerCase(); // 'butterfly' or 'synthetic coated'

  const dimensions = layout === 'butterfly'
    ? { label_width: 2.2, label_height: 0.5 }
    : { label_width: 3.27, label_height: 1.46 };

  const selectedFields: string[] = [];

  selectedFields.push('name');
  if (this.formData.purity) selectedFields.push('purity');
  if (this.formData.weight) selectedFields.push('weight');
   selectedFields.push('tag_number');
  selectedFields.push('barcode'); // Always include barcode

  return {
    printer_name: this.formData.printer_name,
    layout,
    ...dimensions,
    fields: selectedFields
  };
}
  visible: boolean = false;
  showDialog() {
    this.visible = true;
  }

  // print(): void {
  //   const labelElements = document.querySelectorAll('.labelElement');
  //   if (!labelElements.length) return;

  //   let printContents = '';
  //   labelElements.forEach(el => {
  //     printContents += el.outerHTML;
  //   });

  //   const syntheticCoated = this.printType === 'Synthetic coated';

  //   const popupWin = window.open('', '_blank', 'width=800,height=600');
  //   if (popupWin) {
  //     popupWin.document.open();
  //     popupWin.document.write(`
  //     <html>
  //       <head>
  //         <link
  //           href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
  //           rel="stylesheet"
  //         />
  //         <style>
  //           @media print {
  //             body {
  //               margin: 0;
  //               padding: 0;
  //               font-family: Arial, sans-serif;
  //               font-size: 5pt;
  //             }

  //             #print-area {
  //               display: flex !important;
  //               flex-wrap: wrap !important;
  //               gap: 0.2in;
  //               padding: 0.2in;
  //               justify-content: flex-start;
  //             }

  //             .label {
  //               ${syntheticCoated
  //         ? `
  //                 width: 83mm;
  //                 height: 37mm;
  //                 flex-direction: column !important;
  //                 `
  //         : `
  //                 width: 2.2in;
  //                 height: 0.5in;
  //                 flex-direction: row !important;
  //                 `}
  //               padding: 1mm;
  //               box-sizing: border-box;
  //               border: 1mm dashed black;
  //               display: flex !important;
  //               justify-content: space-between !important;
  //               align-items: center !important;
  //               white-space: nowrap;
  //               page-break-inside: avoid;
  //             }

  //             .content-data {
  //               width: 100%;
  //               ${syntheticCoated ? 'height: auto;' : 'width: 0.7333in;'}
  //               display: flex;
  //               flex-direction: column;
  //             }

  //             .details {
  //               display: flex;
  //               flex-direction: row;
  //             }

  //             .barcode {
  //               ${syntheticCoated ? 'width: 100%; height: 40%;' : 'width: 0.7333in; height: 100%;'}
  //               display: flex !important;
  //               justify-content: ${syntheticCoated ? 'flex-start' : 'flex-end'} !important;
  //               align-items: center !important;
  //             }

  //             .barcode img {
  //               height: 100%;
  //               width: auto;
  //               object-fit: contain;
  //             }

  //             .d-print-none {
  //               display: none !important;
  //             }
  //           }
  //         </style>
  //       </head>
  //       <body onload="window.print(); window.close()">
  //         <div id="print-area">
  //           ${printContents}
  //         </div>
  //       </body>
  //     </html>
  //   `);
  //     popupWin.document.close();
  //   }
  // }
print(): void {
  this.printLabelsAndThenPrint();
}

printLabelsAndThenPrint(): void {
  if (this.products.length === 1) {
    const productId = this.products[0].product_id;
    const payload = this.preparePayload();

    this._inventoryService.addOnlyOneProductLabel(productId, payload).subscribe({
      next: (res) => {
        // proceed with printing after label is saved
        this.triggerPrintPopup();
      },
      error: (err) => {
        console.error(err);
        this.triggerPrintPopup(); // still print even on error
      }
    });
  } else {
    this.triggerPrintPopup(); // for multiple products
  }
}

triggerPrintPopup(): void {
  const labelElements = document.querySelectorAll('.labelElement');
  if (!labelElements.length) return;

  let printContents = '';
  labelElements.forEach(el => {
    printContents += el.outerHTML;
  });

  const syntheticCoated = this.printType === 'Synthetic coated';

 // const popupWin = window.open('', '_blank', 'width=800,height=600');
//  if (popupWin) {
    // popupWin.document.open();
    // popupWin.document.write(`
    //   <html>
    //     <head>
    //       <link
    //         href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
    //         rel="stylesheet"
    //       />
    //       <style>
    //         @media print {
    //           body {
    //             margin: 0;
    //             padding: 0;
    //             font-family: Arial, sans-serif;
    //             font-size: 5pt;
    //           }

    //           #print-area {
    //             display: flex !important;
    //             flex-wrap: wrap !important;
    //             gap: 0.2in;
    //             padding: 0.2in;
    //             justify-content: flex-start;
    //           }

    //           .label {
    //             ${syntheticCoated
    //       ? `
    //               width: 83mm;
    //               height: 37mm;
    //               flex-direction: column !important;
    //               `
    //       : `
    //               width: 2.2in;
    //               height: 0.5in;
    //               flex-direction: row !important;
    //               `}
    //             padding: 1mm;
    //             box-sizing: border-box;
    //             border: 1mm dashed black;
    //             display: flex !important;
    //             justify-content: space-between !important;
    //             align-items: center !important;
    //             white-space: nowrap;
    //             page-break-inside: avoid;
    //           }

    //           .content-data {
    //             width: 100%;
    //             ${syntheticCoated ? 'height: auto;' : 'width: 0.7333in;'}
    //             display: flex;
    //             flex-direction: column;
    //           }

    //           .details {
    //             display: flex;
    //             flex-direction: row;
    //           }

    //           .barcode {
    //             ${syntheticCoated ? 'width: 100%; height: 40%;' : 'width: 0.7333in; height: 100%;'}
    //             display: flex !important;
    //             justify-content: ${syntheticCoated ? 'flex-start' : 'flex-end'} !important;
    //             align-items: center !important;
    //           }

    //           .barcode img {
    //             height: 100%;
    //             width: auto;
    //             object-fit: contain;
    //           }

    //           .d-print-none {
    //             display: none !important;
    //           }
    //         }
    //       </style>
    //     </head>
    //     <body onload="window.print(); window.close()">
    //       <div id="print-area">
    //         ${printContents}
    //       </div>
    //     </body>
    //   </html>
    // `);
    // popupWin.document.close();
  //}
}
printLabels(){
   if (this.products.length === 1) {
      const productId = this.products[0].product_id;
      const payload = this.preparePayload();

      this._inventoryService.addOnlyOneProductLabel(productId, payload).subscribe({
        next: (res) => {
        },
        error: (err) => {
          console.error(err);
        }
      });
    }
}


}
