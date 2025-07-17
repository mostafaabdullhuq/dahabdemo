import { ChangeDetectorRef, Component, effect, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { formatDate, isPlatformBrowser } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { UserDashboardService } from './user-dashboard.service';
import { PermissionService } from '../../core/services/permission.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DropdownsService } from '../../core/services/dropdowns.service';
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
  finacialData: any;
  inventoryData: any;
  transData: any;
  parChartFinancialData: any;
  optionsInventory: any;
  optionsFinancial: any;
  optionsPar: any;
  platformId = inject(PLATFORM_ID);

  financialFilterForm!: FormGroup
  branches: any;


  constructor(private _dropdownService: DropdownsService, private _formBuilder: FormBuilder, private cd: ChangeDetectorRef, private _userDashboardServ: UserDashboardService, public permissionService: PermissionService) { }

  ngOnInit() {
    this.financialFilterForm = this._formBuilder.group({
      branch: '',
      start_date: '',
      end_date: ''
    })
    if (this.permissionService.hasPermission(113)) {

      this._userDashboardServ.getFinancialDashboardData().subscribe(res => {
        this.finacialData = res;
        this.parChartFinancialData = res;
        this.initChartFinance();
        this.initChartPars();
      });
      this._userDashboardServ.getInventoryDashboardData().subscribe(res => {
        this.inventoryData = res;
        this.initChartInventory();
      });
      this._userDashboardServ.getTransactionsDashboardData().subscribe(res => {
        this.transData = res;
      });

      this._dropdownService.getBranches().subscribe(res => {
        this.branches = res?.results;
      })
    }
    // Subscribe to form changes
    this.financialFilterForm.valueChanges.subscribe(() => {
      this.fetchFinancialData();
    });


  }
  fetchFinancialData() {
    if (!this.permissionService.hasPermission(113)) return;

    const formValues = this.financialFilterForm.value;
    const params = [];

    if (formValues.branch) {
      params.push(`branch=${formValues.branch}`);
    }

    if (formValues.start_date) {
      const formattedStartDate = formatDate(formValues.start_date, 'yyyy-MM-dd', 'en-US');
      params.push(`start_date=${formattedStartDate}`);
    }

    if (formValues.end_date) {
      const formattedEndDate = formatDate(formValues.end_date, 'yyyy-MM-dd', 'en-US');
      params.push(`end_date=${formattedEndDate}`);
    }

    const query = params.join('&');

    this._userDashboardServ.getFinancialDashboardData(query).subscribe(res => {
      this.finacialData = res;
      this.parChartFinancialData = res;
      this.initChartFinance();
      this.initChartPars();
    });
  }
  generateColors(count: number): string[] {
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
      const hue = (i * 360) / count;
      colors.push(`hsl(${hue}, 65%, 55%)`);
    }
    return colors;
  }
  initChartFinance() {
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--text-color') || '#000';

      this.dataFinancial = {
        labels: this.finacialData?.pie_chart_data?.labels,
        datasets: [
          {
            data: this.finacialData?.pie_chart_data?.data,
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

      this.optionsFinancial = {
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
            backgroundColor: ['#299D91',
              '#F0F4F3',
              '#D9E6E4',
              '#B8D8D3',
              '#E8E8E9',
              '#C1C9C8',
              '#A0B1B0'], // black, white, black
            hoverBackgroundColor: ['#299D91', '#E8E8E8'] // dark gray, light gray, dark gray
          }
        ]
      };

      this.optionsInventory = {
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

      const barChartData = this.parChartFinancialData?.bar_chart_data;

      const barColors = [
        '--p-gray-500',
        '--p-bluegray-500',
        '--p-cyan-500',
        '--p-green-500',
        '--p-indigo-500'
      ];

      const barDatasets = (barChartData?.bar?.data || []).map((item: any, index: number) => ({
        type: 'bar',
        label: item.label,
        data: item.data,
        backgroundColor: documentStyle.getPropertyValue(barColors[index % barColors.length]),
        borderColor: 'white',
        borderWidth: 2
      }));

      const lineDatasets = (barChartData?.line?.data || []).map((item: any) => ({
        type: 'line',
        label: item.label,
        data: item.data,
        borderColor: documentStyle.getPropertyValue('--p-orange-500'),
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: documentStyle.getPropertyValue('--p-orange-500')
      }));
      let newLabels: string[] = barChartData?.labels

      this.dataPars = {
        labels: newLabels || [],
        datasets: [...lineDatasets, ...barDatasets]
      };

      this.optionsPar = {
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
          legend: {
            labels: {
              color: textColor
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        responsive: true,
        scales: {
          x: {
            stacked: false,
            ticks: {
              color: textColorSecondary
            },
            grid: {
              color: surfaceBorder
            }
          },
          y: {
            stacked: false,
            ticks: {
              color: textColorSecondary
            },
            grid: {
              color: surfaceBorder
            }
          }
        }
      };

      this.cd.markForCheck();
    }
  }


}
