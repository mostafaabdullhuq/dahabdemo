import { Component } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { GoldMovementsReportComponent } from './gold-movements-report/gold-movements-report.component';

@Component({
  selector: 'app-gold-movements-reports',
  imports: [
    SharedModule,
    GoldMovementsReportComponent
  ],
  templateUrl: './gold-movements-reports.component.html',
  styleUrl: './gold-movements-reports.component.scss'
})
export class GoldMovementsReportsComponent {

}
