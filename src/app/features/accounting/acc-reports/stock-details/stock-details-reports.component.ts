import { Component } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { StockReportComponent } from './stock/stock-report.component';

@Component({
  selector: 'app-stock-details',
  imports: [
    SharedModule,
    StockReportComponent
  ],
  templateUrl: './stock-details-reports.component.html',
  styleUrl: './stock-details-reports.component.scss'
})
export class StockDetailsReportsComponent {

}
