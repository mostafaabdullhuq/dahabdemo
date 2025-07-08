import { Component } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { AssetsReportComponent } from './assets-report/assets-report.component';

@Component({
    selector: 'app-assets-reports',
    imports: [
        SharedModule,
        AssetsReportComponent
    ],
    templateUrl: './assets-reports.component.html',
    styleUrl: './assets-reports.component.scss'
})
export class AssetsReportsComponent {

}
