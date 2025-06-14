import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { SharedModule } from '../../../../../shared/shared.module';
import { isPlatformBrowser } from '@angular/common';
import { AccChartsService } from '../acc-charts.service';
import { PermissionService } from '../../../../../core/services/permission.service';

@Component({
  selector: 'app-assets',
  imports: [SharedModule],
  templateUrl: './assets.component.html',
  styleUrl: './assets.component.scss'
})
export class AssetsComponent implements OnInit{
  optionsPie: any;
dataAssets:any;
assetsChartData:any;

  platformId = inject(PLATFORM_ID);
  constructor(private cd: ChangeDetectorRef,private _accDashboardServ:AccChartsService, public permissionService:PermissionService) { }
  ngOnInit(): void {
    this._accDashboardServ.getAssetsChart().subscribe(res=>{
      this.assetsChartData = res;
      this.initChart();
    });
  }

  initChart() {
  if (isPlatformBrowser(this.platformId)) {

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color') || '#000';

    this.dataAssets = {
      labels: this.assetsChartData?.labels,
      datasets: [
        {
          data: this.assetsChartData?.data,
          backgroundColor: [
            '#299D91',
            '#F0F4F3',
          ],
          hoverBackgroundColor: [
            '#237C77',
            '#D9E6E4',
          ]
        }
      ]
    };

    this.optionsPie = {
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
}
