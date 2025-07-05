import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { BusinessSettingComponent } from './business-setting/business-setting.component';
import { CustomFieldsComponent } from './custom-fields/custom-fields.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-business',
  imports: [SharedModule, BusinessSettingComponent, CustomFieldsComponent, RouterModule],
  templateUrl: './business.component.html',
  styleUrl: './business.component.scss'
})
export class BusinessComponent {

}
