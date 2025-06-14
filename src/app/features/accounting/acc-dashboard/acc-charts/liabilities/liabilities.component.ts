import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { SharedModule } from '../../../../../shared/shared.module';
import { isPlatformBrowser } from '@angular/common';
import { AccChartsService } from '../acc-charts.service';
import { PermissionService } from '../../../../../core/services/permission.service';

@Component({
  selector: 'app-liabilities',
  imports: [SharedModule],
  templateUrl: './liabilities.component.html',
  styleUrl: './liabilities.component.scss'
})
export class LiabilitiesComponent {
  optionsBar: any;
dataLiabilities:any;
liabilitiesChartData:any;

  platformId = inject(PLATFORM_ID);
  constructor(private cd: ChangeDetectorRef,private _accDashboardServ:AccChartsService, public permissionService:PermissionService) { }
  ngOnInit(): void {
    this._accDashboardServ.getLiabilitiesChart().subscribe(res=>{
      this.liabilitiesChartData = res;
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

    this.dataLiabilities = {
      labels: this.liabilitiesChartData.labels,
      datasets: [
        {
          label: 'Liabilities',
          data: this.liabilitiesChartData.data,
          backgroundColor: this.liabilitiesChartData.data.map((_: any, i: number) => backgroundColors[i % backgroundColors.length]),
          borderColor: this.liabilitiesChartData.data.map((_: any, i: number) => borderColors[i % borderColors.length]),
          borderWidth: 1,
        }
      ]
    };

    this.optionsBar = {
      indexAxis: 'x', // horizontal bars
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
