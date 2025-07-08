import { Component } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { LiabilitiesReportComponent } from './liabilities-report/liabilities-report.component';

@Component({
    selector: 'app-liabilities-reports',
    imports: [
        SharedModule,
        LiabilitiesReportComponent
    ],
    templateUrl: './liabilities-reports.component.html',
    styleUrl: './liabilities-reports.component.scss'
})
export class LiabilitiesReportsComponent {

}
