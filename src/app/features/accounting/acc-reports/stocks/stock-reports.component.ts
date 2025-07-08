import { Component } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { StockDetailsReportComponent } from './stock-details/stock-details-report.component';
import { StockAgingReportComponent } from "./stock-aging-report/stock-aging-report.component";

@Component({
  selector: 'app-stock-reports',
  imports: [
    SharedModule,
    StockDetailsReportComponent,
    StockAgingReportComponent
  ],
  templateUrl: './stock-reports.component.html',
  styleUrl: './stock-reports.component.scss'
})
export class StockReportsComponent {

}
