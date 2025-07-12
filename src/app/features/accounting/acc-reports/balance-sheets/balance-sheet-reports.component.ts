import { Component } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { BalanceSheetReportComponent } from './balance-sheet-report/balance-sheet-report.component';

@Component({
  selector: 'app-balance-sheet-reports',
  imports: [
    SharedModule,
    BalanceSheetReportComponent
  ],
  templateUrl: './balance-sheet-reports.component.html',
  styleUrl: './balance-sheet-reports.component.scss'
})
export class BalanceSheetReportsComponent {

}
