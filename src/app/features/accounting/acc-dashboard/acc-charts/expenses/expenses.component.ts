import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { SharedModule } from '../../../../../shared/shared.module';
import { isPlatformBrowser } from '@angular/common';
import { AccChartsService } from '../acc-charts.service';
import { PermissionService } from '../../../../../core/services/permission.service';

@Component({
  selector: 'app-expenses',
  imports: [SharedModule],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss'
})
export class ExpensesComponent {
  optionsBar: any;
  dataExpenses: any;
  expensesChartData: any;

  platformId = inject(PLATFORM_ID);
  constructor(private cd: ChangeDetectorRef, private _accDashboardServ: AccChartsService, public permissionService: PermissionService) { }
  ngOnInit(): void {
    this._accDashboardServ.getExpensesChart().subscribe(res => {
      this.expensesChartData = res;
      this.initChart();
    });
  }

  initChart() {
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');
      const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
      const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

      const backgroundColors = [
        'rgba(249, 115, 22, 0.2)',
        'rgba(6, 182, 212, 0.2)',
        'rgba(107, 114, 128, 0.2)',
        'rgba(139, 92, 246, 0.2)',
      ];
      const borderColors = [
        'rgb(249, 115, 22)',
        'rgb(6, 182, 212)',
        'rgb(107, 114, 128)',
        'rgb(139, 92, 246)',
      ];

      const datasets = this.expensesChartData.labels.map((label: string, i: number) => ({
        label: label,
        data: [this.expensesChartData.data[i]],
        backgroundColor: backgroundColors[i % backgroundColors.length],
        borderColor: borderColors[i % borderColors.length],
        borderWidth: 1,
      }));

      this.dataExpenses = {
        labels: [''], // Single group, each dataset becomes a separate horizontal bar
        datasets: datasets
      };

      this.optionsBar = {
        indexAxis: 'x', // 🔁 This rotates the bars horizontally
        plugins: {
          legend: {
            labels: {
              color: textColor,
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
            },
          },
          y: {
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
            },
          },
        },
      };

      this.cd.markForCheck();
    }
  }



}
