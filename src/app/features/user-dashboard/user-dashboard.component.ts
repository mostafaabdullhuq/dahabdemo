import { ChangeDetectorRef, Component, effect, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { isPlatformBrowser } from '@angular/common';
import { ChartModule } from 'primeng/chart';
@Component({
  selector: 'app-user-dashboard',
  imports: [SharedModule],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss'
})
export class UserDashboardComponent implements OnInit {
  userName: any = JSON.parse(localStorage?.getItem('user') ?? '').username;

  // data:any[]= [
  //   {title:'Income', balance:"DB 1000"},
  //   {title:'Expenses', balance:"DB 1000"},
  //   {title:'purchase', balance:"DB 1000"},
  //   {title:'profile', balance:"DB 1000"},
  // ]
  inventory: any[] = [
    { title: 'Silver', balance: "DB 1000" },
    { title: 'Gold', balance: "DB 1000" },
    { title: 'Dimond', balance: "DB 1000" },
    { title: 'stones', balance: "DB 1000" },
  ]

  data: any;
  dataPars: any;

  options: any;
  optionsPar: any;

  platformId = inject(PLATFORM_ID);


  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.initChart();
    this.initChartPars()
  }

  initChart() {
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--text-color') || '#000'; // fallback to black if undefined

      this.data = {
        labels: ['Current Assets', 'Fixed Assets'],
        datasets: [
          {
            data: [540, 325],
            backgroundColor: ['#299D91', '#E8E8E8'], // black, white, black
            hoverBackgroundColor: ['#299D91', '#E8E8E8'] // dark gray, light gray, dark gray
          }
        ]
      };

      this.options = {
        plugins: {
          legend: {
            labels: {
              usePointStyle: true,
              color: textColor
            }
          }
        }
      };

      this.cd.markForCheck();
    }
  }

initChartPars() {
    if (isPlatformBrowser(this.platformId)) {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--p-text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
        const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

        this.dataPars = {
            labels: [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ],
            datasets: [
                {
                    type: 'bar',
                    label: 'Amount',
                    backgroundColor: '#299D91', // Set custom color
                    data: [120, 90, 70, 110, 85, 100, 95, 105, 88, 132, 99, 101]
                }
            ]
        };

        this.optionsPar = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false
                },
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    stacked: false,
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                },
                y: {
                    stacked: false,
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


}
