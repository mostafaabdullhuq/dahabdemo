import { Component } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { ProfitAndLossReportComponent } from './profit-and-loss-report/profit-and-loss-report.component';

@Component({
    selector: 'app-profit-and-loss-reports',
    imports: [
        SharedModule,
        ProfitAndLossReportComponent
    ],
    templateUrl: './profit-and-loss-reports.component.html',
    styleUrl: './profit-and-loss-reports.component.scss'
})
export class ProfitAndLossReportsComponent {

}
