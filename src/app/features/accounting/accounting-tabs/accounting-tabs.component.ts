import { Component } from '@angular/core';
import { ChartOfAccComponent } from "../chart-of-acc/chart-of-acc.component";
import { SharedModule } from '../../../shared/shared.module';
import { AccDashboardComponent } from "../acc-dashboard/acc-dashboard.component";
import { JournalEntryComponent } from "../journal-entry/journal-entry.component";

@Component({
  selector: 'app-accounting-tabs',
  imports: [ChartOfAccComponent, SharedModule, AccDashboardComponent, JournalEntryComponent],
  templateUrl: './accounting-tabs.component.html',
  styleUrl: './accounting-tabs.component.scss'
})
export class AccountingTabsComponent {

}
