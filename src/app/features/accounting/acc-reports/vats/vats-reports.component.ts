import { Component } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { VatDataReportComponent } from './vat-data-report/vat-data-report.component';
import { VatReturnReportComponent } from './vat-return-report/vat-return-report.component';

@Component({
  selector: 'app-vat-reports',
  imports: [
    SharedModule,
    VatDataReportComponent,
    VatReturnReportComponent
  ],
  templateUrl: './vats-reports.component.html',
  styleUrl: './vats-reports.component.scss'
})
export class VatsReportsComponent {

}
