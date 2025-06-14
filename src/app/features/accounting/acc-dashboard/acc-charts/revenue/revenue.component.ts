import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { SharedModule } from '../../../../../shared/shared.module';
import { isPlatformBrowser } from '@angular/common';
import { AccChartsService } from '../acc-charts.service';
import { PermissionService } from '../../../../../core/services/permission.service';

@Component({
  selector: 'app-revenue',
  imports: [SharedModule],
  templateUrl: './revenue.component.html',
  styleUrl: './revenue.component.scss'
})
export class RevenueComponent {
  optionsLine: any;
dataRevenue:any;
revenueChartData:any;

  platformId = inject(PLATFORM_ID);
  constructor(private cd: ChangeDetectorRef,private _accDashboardServ:AccChartsService, public permissionService:PermissionService) { }
  ngOnInit(): void {
    this._accDashboardServ.getRevenueChart().subscribe(res=>{
      this.revenueChartData = res;
      this.initChart();
    });
  }
  data: any;

    options: any;

initChart() {
  if (isPlatformBrowser(this.platformId) && this.revenueChartData) {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    const baseColors = [
      'rgba(249, 115, 22, 1)',
      'rgba(6, 182, 212, 1)',
      'rgba(107, 114, 128, 1)',
      'rgba(139, 92, 246, 1)',
      'rgba(16, 185, 129, 1)',
      'rgba(236, 72, 153, 1)',
      'rgba(251, 191, 36, 1)',
    ];

    const pointColors = this.revenueChartData.labels.map((_: any, i: number) => baseColors[i % baseColors.length]);

    this.data = {
      labels: this.revenueChartData.labels,
      datasets: [
        {
          label: 'Revenue',
          data: this.revenueChartData.data,
          fill: false,
          borderColor: 'rgba(0,0,0,0.1)', // optional light line
          tension: 0.4,
          pointBackgroundColor: pointColors,
          pointBorderColor: pointColors,
          pointRadius: 6,
          pointHoverRadius: 8
        }
      ]
    };

    this.options = {
      indexAxis: 'x', // horizontal: use 'y'
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };

    this.cd.markForCheck();
  }
}
// initChart() {
//   if (isPlatformBrowser(this.platformId) && this.revenueChartData) {
//     const documentStyle = getComputedStyle(document.documentElement);
//     const textColor = documentStyle.getPropertyValue('--p-text-color');
//     const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
//     const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

//     const baseColors = [
//       'rgba(249, 115, 22, 1)',
//       'rgba(6, 182, 212, 1)',
//       'rgba(107, 114, 128, 1)',
//       'rgba(139, 92, 246, 1)',
//       'rgba(16, 185, 129, 1)',
//       'rgba(236, 72, 153, 1)',
//       'rgba(251, 191, 36, 1)',
//     ];

//     // Create one dataset per label, each dataset has one data point only
//    const datasets = this.revenueChartData.labels.map((label: any, i: number) => ({
//   label,
//   data: this.revenueChartData.labels.map((_: any, j: number) => (i === j ? this.revenueChartData.data[j] : null)),
//   borderColor: baseColors[i % baseColors.length],
//   backgroundColor: baseColors[i % baseColors.length],
//   fill: false,
//   tension: 0.4,
//   spanGaps: true, // to handle nulls without breaking lines
//   pointRadius: 6,
//   pointHoverRadius: 8,
// }));

// this.data = {
//   labels: this.revenueChartData.labels,
//   datasets,
// };

//     this.options = {
//       indexAxis: 'x',
//       maintainAspectRatio: false,
//       aspectRatio: 0.6,
//       plugins: {
//         legend: {
//           labels: {
//             color: textColor,
//           }
//         }
//       },
//       scales: {
//         x: {
//           beginAtZero: true,
//           ticks: {
//             color: textColorSecondary,
//           },
//           grid: {
//             color: surfaceBorder,
//             drawBorder: false,
//           }
//         },
//         y: {
//           ticks: {
//             color: textColorSecondary,
//           },
//           grid: {
//             color: surfaceBorder,
//             drawBorder: false,
//           }
//         }
//       }
//     };

//     this.cd.markForCheck();
//   }
// }

}
