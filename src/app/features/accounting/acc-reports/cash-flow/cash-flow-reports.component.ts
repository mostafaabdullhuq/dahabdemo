import { Component } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { CashFlowReportComponent } from './cash-flow-report/cash-flow-report.component';

@Component({
    selector: 'app-cash-flow-reports',
    imports: [
        SharedModule,
        CashFlowReportComponent
    ],
    templateUrl: './cash-flow-reports.component.html',
    styleUrl: './cash-flow-reports.component.scss'
})
export class CashFlowReportsComponent {

}
