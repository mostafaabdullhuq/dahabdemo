import { Component } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { TrialBalanceReportComponent } from './trial-balance-report/trial-balance-report.component';

@Component({
    selector: 'app-trial-balance-reports',
    imports: [
        SharedModule,
        TrialBalanceReportComponent
    ],
    templateUrl: './trial-balance-reports.component.html',
    styleUrl: './trial-balance-reports.component.scss'
})
export class TrialBalanceReportsComponent {

}
