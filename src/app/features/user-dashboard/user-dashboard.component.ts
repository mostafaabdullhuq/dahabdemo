import { ChangeDetectorRef, Component, effect, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { isPlatformBrowser } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { UserDashboardService } from './user-dashboard.service';
import { PermissionService } from '../../core/services/permission.service';
@Component({
  selector: 'app-user-dashboard',
  imports: [SharedModule],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss'
})
export class UserDashboardComponent implements OnInit {
  userName: any = JSON.parse(localStorage?.getItem('user') ?? '').username;
  inventory: any[] = [
    { title: 'Silver', balance: "DB 1000" },
    { title: 'Gold', balance: "DB 1000" },
    { title: 'Dimond', balance: "DB 1000" },
    { title: 'stones', balance: "DB 1000" },
  ]

  dataInventry: any;
  dataFinancial: any;
  dataPars: any;
finacialData:any;
inventoryData:any;
transData:any;
  options: any;
  optionsPar: any;

  platformId = inject(PLATFORM_ID);


  constructor(private cd: ChangeDetectorRef,private _userDashboardServ:UserDashboardService, public permissionService:PermissionService) { }

  ngOnInit() {
    if(this.permissionService.hasPermission(113)){
      this.initChartPars();
    this._userDashboardServ.getFinancialDashboardData().subscribe(res=>{
      this.finacialData = res;
      this.initChartFinance();
    });
    this._userDashboardServ.getInventoryDashboardData().subscribe(res=>{
      this.inventoryData = res;
      this.initChartInventory();
    });
    this._userDashboardServ.getTransactionsDashboardData().subscribe(res=>{
      this.transData = res;
    });
    }
  }

  initChartFinance() {
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--text-color') || '#000'; // fallback to black if undefined

      this.dataFinancial = {
        labels: this.finacialData?.chart_data?.labels,
        datasets: [
          {
            data: this.finacialData?.chart_data?.data,
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

initChartInventory() {
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--text-color') || '#000'; // fallback to black if undefined

      this.dataInventry = {
        labels: this.inventoryData?.chart_data?.labels,
        datasets: [
          {
            data: this.inventoryData?.chart_data?.data,
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
