import {Component} from '@angular/core';
import {Tab, TabList, TabPanel, TabPanels, Tabs} from 'primeng/tabs';
import {SalesReportComponent} from './sales-report/sales-report.component';
import {MonthlySalesReportComponent} from './monthly-sales-report/monthly-sales-report.component';
import {
  SalesProfitAnalysisReportComponent
} from './sales-profit-analysis-report/sales-profit-analysis-report.component';

@Component({
  selector: 'app-sales',
  imports: [
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    SalesReportComponent,
    MonthlySalesReportComponent,
    SalesProfitAnalysisReportComponent
  ],
  templateUrl: './sales-reports.component.html',
  styleUrl: './sales-reports.component.scss'
})
export class SalesReportsComponent {
}
