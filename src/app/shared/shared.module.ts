import { FileUploadModule } from 'primeng/fileupload';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';

// PrimeNG Modules
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { ContextMenuModule } from 'primeng/contextmenu';
import { TabsModule } from 'primeng/tabs';
import { TooltipModule } from 'primeng/tooltip';
import { DatePickerModule } from 'primeng/datepicker';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MenubarModule } from 'primeng/menubar';
import { AvatarModule } from 'primeng/avatar';
import { DialogModule } from 'primeng/dialog';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TreeModule } from 'primeng/tree';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ChartModule } from 'primeng/chart';

// Components
import { InputTextComponent } from './components/input-text/input-text.component';
import { FilterCollapseComponent } from './components/filter-collapse/filter-collapse.component';
import { DataTableComponent } from './components/data-table/data-table.component';
import { CheckBoxComponent } from './components/check-box/check-box.component';
import { MultiSelectComponent } from './components/multi-select/multi-select.component';
import { DropdownsComponent } from './components/dropdowns/dropdowns.component';
import { ConfirmationService } from 'primeng/api';
import { ConfirmationPopUpService } from './services/confirmation-pop-up.service';
import { UploadInputComponent } from './components/upload-input/upload-input.component';
import { InputTableComponent } from './components/input-table/input-table.component';
import { InputDateComponent } from './components/input-date/input-date.component';

const components = [
  InputTextComponent,
  FilterCollapseComponent,
  DataTableComponent,
  CheckBoxComponent,
  MultiSelectComponent,
  DropdownsComponent,
  UploadInputComponent,
  InputTableComponent,
  InputDateComponent
];

const primeNgModules = [
  CheckboxModule,
  InputTextModule,
  ButtonModule,
  TableModule,
  ToastModule,
  MultiSelectModule,
  SelectModule,
  ContextMenuModule,
  FileUploadModule,
  TabsModule,
  TooltipModule,
  DatePickerModule,
  ConfirmDialogModule,
  MenubarModule,
  AvatarModule,
  DialogModule,
TreeModule,
  SplitButtonModule,
  ToggleSwitchModule,
  ChartModule
]

@NgModule({
  declarations: [...components],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterOutlet,
    LoadingBarHttpClientModule,
    ...primeNgModules
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterOutlet,
    LoadingBarHttpClientModule,
    ...primeNgModules,
    ...components
  ],
  providers:[
    ConfirmationService,
    ConfirmationPopUpService
  ]
})
export class SharedModule { }
