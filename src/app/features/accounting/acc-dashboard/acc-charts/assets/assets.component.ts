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
      labels: this.assetsChartData?.chart_data?.labels,
      datasets: [
        {
          data: this.assetsChartData?.chart_data?.data,
          backgroundColor: [
            '#299D91',
            '#F0F4F3',
            '#D9E6E4',
            '#B8D8D3',
            '#E8E8E9',
            '#C1C9C8',
            '#A0B1B0'
          ],
          hoverBackgroundColor: [
            '#237C77',
            '#D9E6E4',
            '#B8D8D3',
            '#99BCB8',
            '#D1D3D4',
            '#A0B1B0',
            '#7F8D8B'
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
