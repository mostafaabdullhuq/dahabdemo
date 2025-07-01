import { Component } from '@angular/core';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { TotalExpensesComponent } from './total-expenses/total-expenses.component';
import { MonthlyExpensesComponent } from './monthly-expenses/monthly-expenses.component';

@Component({
  selector: 'app-expenses-reports',
  imports: [
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    TotalExpensesComponent,
    MonthlyExpensesComponent
  ],
  templateUrl: './expenses-reports.component.html',
  styleUrl: './expenses-reports.component.scss'
})
export class ExpensesReportsComponent {

}
